"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { ArrowRight, Camera, Check, Play, Video, X } from "lucide-react"
import RecipientView, { type RecipientContent } from "@/components/foryou/RecipientView"
import { useScrollLock } from "@/lib/useScrollLock"
import { trackEvent } from "@/lib/tracking"
import type { Translations } from "@/lib/translations"
import { GIFT_MESSAGE_MAX, hasGiftContent, type CheckoutGift } from "@/lib/foryou-checkout"
import { requestUploadSignature, shrinkPhoto, uploadToCloudinary } from "@/lib/foryou-upload"
import { imageDeliveryUrl, thumbnailUrl, videoPosterUrl } from "@/lib/cloudinary-urls"

const SAMPLE_PHOTO = "/pexels-elly-fairytale-3893712.jpg"
const MAX_VIDEO_BYTES = 100 * 1024 * 1024
const MAX_PHOTO_BYTES = 25 * 1024 * 1024

type Kind = "video" | "photo"
type Upload = { progress: number | null; error: string; file: File | null }
const IDLE: Upload = { progress: null, error: "", file: null }

// What the checkout needs to know to wait for a running upload before paying.
export type GiftUploadState = { progress: number | null; failed: boolean }

const sign = () => requestUploadSignature("/api/foryou/checkout-upload", {})

// The gift message, made right in the checkout: the moment someone buys a gift
// is when they think of the person. Files upload in the background while the
// buyer fills in the address; nothing here is required, and all of it can be
// added or changed after paying too.
export default function GiftMessage({
  gift,
  setGift,
  onUploadState,
  cancelToken,
  labels,
}: {
  gift: CheckoutGift
  setGift: React.Dispatch<React.SetStateAction<CheckoutGift>>
  onUploadState: (state: GiftUploadState) => void
  // Bumped by the checkout ("continue without this file") to stop running uploads.
  cancelToken: number
  labels: Translations["checkout"]
}) {
  const [uploads, setUploads] = useState<Record<Kind, Upload>>({ video: IDLE, photo: IDLE })
  const controllers = useRef<Partial<Record<Kind, AbortController>>>({})
  const inputs = { video: useRef<HTMLInputElement>(null), photo: useRef<HTMLInputElement>(null) }
  const [previewOpen, setPreviewOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const messageTrackedRef = useRef(false)
  useScrollLock(previewOpen)

  const patch = (kind: Kind, next: Partial<Upload>) =>
    setUploads((current) => ({ ...current, [kind]: { ...current[kind], ...next } }))

  const start = async (kind: Kind, file: File) => {
    controllers.current[kind]?.abort()
    const controller = new AbortController()
    controllers.current[kind] = controller
    patch(kind, { progress: 0, error: "", file })
    try {
      const { blob, name } = kind === "photo" ? await shrinkPhoto(file) : { blob: file as Blob, name: file.name || "video" }
      // Cloudinary still processes the file after the last byte: 100 % waits for its answer.
      const onProgress = (p: number) => { if (!controller.signal.aborted) patch(kind, { progress: Math.min(p, 99) }) }
      const { secureUrl } = await uploadToCloudinary(blob, name, sign, onProgress, controller.signal)
      setGift((current) => ({ ...current, [kind === "video" ? "videoUrl" : "photoUrl"]: secureUrl }))
      patch(kind, IDLE)
      trackEvent(kind === "video" ? "gift_video_added" : "gift_photo_added")
    } catch (err) {
      if (controllers.current[kind] !== controller) return
      const cancelled = (err as Error)?.name === "AbortError"
      patch(kind, cancelled ? IDLE : { progress: null, error: labels.giftUploadFailed, file })
    } finally {
      if (controllers.current[kind] === controller) delete controllers.current[kind]
    }
  }

  const pick = (kind: Kind) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Cleared so that choosing the same file again still counts as a choice.
    e.target.value = ""
    if (!file) return
    if (file.size > (kind === "video" ? MAX_VIDEO_BYTES : MAX_PHOTO_BYTES)) {
      patch(kind, { ...IDLE, error: kind === "video" ? labels.giftVideoTooLarge : labels.giftPhotoTooLarge })
      return
    }
    start(kind, file)
  }

  const remove = (kind: Kind) => {
    setGift((current) => ({ ...current, [kind === "video" ? "videoUrl" : "photoUrl"]: "" }))
    patch(kind, IDLE)
  }

  // Tell the checkout whether it has to wait before moving on to payment.
  useEffect(() => {
    const running = [uploads.video, uploads.photo].filter((u) => u.progress !== null)
    onUploadState({
      progress: running.length ? Math.round(running.reduce((sum, u) => sum + (u.progress ?? 0), 0) / running.length) : null,
      failed: Boolean(uploads.video.error || uploads.photo.error),
    })
  }, [uploads, onUploadState])

  const firstCancelToken = useRef(cancelToken)
  useEffect(() => {
    if (cancelToken === firstCancelToken.current) return
    Object.values(controllers.current).forEach((c) => c?.abort())
  }, [cancelToken])

  // Gift switched off (or the step left): stop uploads nobody will use.
  useEffect(() => {
    const running = controllers.current
    return () => {
      Object.values(running).forEach((c) => c?.abort())
      onUploadState({ progress: null, failed: false })
    }
  }, [onUploadState])

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (!previewOpen) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPreviewOpen(false) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [previewOpen])

  const openPreview = () => {
    trackEvent("gift_preview_open")
    setPreviewOpen(true)
  }

  // Their own message once they started one, an example until then.
  const own = hasGiftContent(gift)
  const message = gift.message.trim()
  const phoneText = own ? message : labels.giftSampleMessage
  const phoneImage = gift.photoUrl
    ? thumbnailUrl(gift.photoUrl, "photo", 200)
    : gift.videoUrl
      ? thumbnailUrl(gift.videoUrl, "video", 200)
      : own ? "" : SAMPLE_PHOTO
  // The original video in the preview: the phone that recorded it can play it,
  // and it is ready the moment the upload finishes.
  const previewContent: RecipientContent = own
    ? {
        message,
        videoUrl: gift.videoUrl || undefined,
        videoPoster: gift.videoUrl ? videoPosterUrl(gift.videoUrl) : undefined,
        photoUrl: gift.photoUrl ? imageDeliveryUrl(gift.photoUrl) : undefined,
      }
    : { message: labels.giftSampleMessage, photoUrl: SAMPLE_PHOTO }

  const tile = (kind: Kind) => {
    const url = kind === "video" ? gift.videoUrl : gift.photoUrl
    const upload = uploads[kind]
    const Icon = kind === "video" ? Video : Camera
    const title = kind === "video" ? labels.giftAddVideo : labels.giftAddPhoto
    const box = "relative h-[92px] w-full overflow-hidden rounded-xl"

    if (url) {
      return (
        <div className={`${box} bg-[#1a1a1a]`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnailUrl(url, kind)} alt="" className="h-full w-full object-cover" />
          {kind === "video" && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow">
                <Play className="ml-0.5 h-4 w-4 fill-[#651A1A] text-[#651A1A]" aria-hidden="true" />
              </span>
            </span>
          )}
          <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[0.7rem] font-bold text-[#651A1A]">
            <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
            {title}
          </span>
          <button
            type="button"
            onClick={() => remove(kind)}
            aria-label={kind === "video" ? labels.giftRemoveVideo : labels.giftRemovePhoto}
            className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      )
    }

    if (upload.progress !== null) {
      return (
        <div className={`${box} flex flex-col justify-center border-2 border-[#651A1A]/25 bg-white px-3`} role="status">
          <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#651A1A]">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span className="truncate">{labels.giftUploading}</span>
            </span>
            <span className="tabular-nums">{upload.progress}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#651A1A]/10">
            <div className="h-full rounded-full bg-[#651A1A] transition-[width] duration-300" style={{ width: `${Math.max(4, upload.progress)}%` }} />
          </div>
          <button
            type="button"
            onClick={() => controllers.current[kind]?.abort()}
            className="mt-1.5 self-start py-0.5 text-[0.7rem] text-gray-500 underline underline-offset-2 hover:text-black"
          >
            {labels.giftCancelUpload}
          </button>
        </div>
      )
    }

    return (
      <button
        type="button"
        onClick={() => inputs[kind].current?.click()}
        className={`${box} flex flex-col items-center justify-center gap-0.5 border-2 border-dashed bg-white text-[#651A1A] transition-colors hover:border-[#651A1A] active:bg-[#FBF6EF] ${upload.error ? "border-red-300" : "border-[#651A1A]/30"}`}
      >
        <Icon className="mb-0.5 h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        <span className="text-sm font-bold">+ {title}</span>
        <span className="text-[0.7rem] text-gray-500">{kind === "video" ? labels.giftVideoHint : labels.giftPhotoHint}</span>
      </button>
    )
  }

  const errors = (["video", "photo"] as Kind[]).filter((kind) => uploads[kind].error)

  return (
    <>
      <div className="mt-3 space-y-4 border-t border-[#651A1A]/15 pt-4">
        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <label htmlFor="giftMessage" className="text-sm font-semibold text-gray-800">{labels.giftMessageLabel}</label>
            <span className="text-xs text-gray-500">{labels.giftOptional}</span>
          </div>
          {/* Private words: kept out of session recordings. */}
          <textarea
            id="giftMessage"
            data-clarity-mask="true"
            value={gift.message}
            onChange={(e) => setGift((current) => ({ ...current, message: e.target.value }))}
            onBlur={() => {
              if (gift.message.trim() && !messageTrackedRef.current) {
                messageTrackedRef.current = true
                trackEvent("gift_message_written")
              }
            }}
            rows={3}
            maxLength={GIFT_MESSAGE_MAX}
            placeholder={labels.giftMessagePlaceholder}
            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-base placeholder:text-gray-400 focus:border-black focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {tile("video")}
          {tile("photo")}
        </div>
        <input ref={inputs.video} type="file" accept="video/*" onChange={pick("video")} className="hidden" tabIndex={-1} />
        <input ref={inputs.photo} type="file" accept="image/*" onChange={pick("photo")} className="hidden" tabIndex={-1} />

        {errors.length > 0 && (
          <div role="alert" className="space-y-1">
            {errors.map((kind) => (
              <p key={kind} className="text-xs text-red-700">
                <span className="font-bold">{kind === "video" ? labels.giftAddVideo : labels.giftAddPhoto}:</span> {uploads[kind].error}
                {uploads[kind].file && (
                  <button
                    type="button"
                    onClick={() => start(kind, uploads[kind].file!)}
                    className="ml-1.5 font-bold underline underline-offset-2"
                  >
                    {labels.giftRetry}
                  </button>
                )}
              </p>
            ))}
          </div>
        )}

        {/* What the recipient will see: their own words as they type, an example until then */}
        <div className="flex items-center gap-4 rounded-xl bg-white/70 p-3">
          <button
            type="button"
            onClick={openPreview}
            aria-label={labels.giftPreviewButton}
            className="w-[78px] shrink-0 overflow-hidden rounded-[14px] border-[3px] border-[#1a1a1a] bg-[#651A1A] text-left shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)] transition-transform active:scale-[0.97]"
          >
            <span className="block min-h-[44px] px-1.5 pb-1.5 pt-2.5 text-center">
              <span className="block text-[5px] font-bold uppercase tracking-[0.25em] text-white/50">For you</span>
              {phoneText && (
                <span data-clarity-mask="true" className={`mt-1 block font-serif text-[7.5px] italic leading-snug line-clamp-4 ${own ? "text-white/90" : "text-white/60"}`}>
                  {phoneText}
                </span>
              )}
            </span>
            {phoneImage && (
              <span className="relative block h-[56px]">
                {phoneImage === SAMPLE_PHOTO ? (
                  <Image src={SAMPLE_PHOTO} alt="" fill sizes="78px" className="object-cover opacity-80" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={phoneImage} alt="" className="h-full w-full object-cover" />
                )}
                {!gift.photoUrl && gift.videoUrl && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Play className="h-4 w-4 fill-white text-white drop-shadow" aria-hidden="true" />
                  </span>
                )}
              </span>
            )}
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs leading-snug text-[#651A1A]">{labels.giftHowItWorks}</p>
            <button
              type="button"
              onClick={openPreview}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#651A1A] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#4A1313] active:bg-[#4A1313]"
            >
              {labels.giftPreviewButton}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>
        </div>

        <p className="text-xs leading-snug text-gray-600">{labels.giftLaterNote}</p>
      </div>

      {previewOpen && mounted && createPortal(
        <div role="dialog" aria-modal="true" aria-label={labels.giftPreviewButton} className="fixed inset-0 z-[70] overflow-y-auto bg-[#651A1A]">
          <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-3">
            <span className="rounded-full bg-white/15 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white backdrop-blur">
              {own ? labels.giftPreviewOwnLabel : labels.giftPreviewLabel}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setPreviewOpen(false)}
              aria-label={labels.giftPreviewClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#651A1A] shadow-lg"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
          <RecipientView preview state="message" content={previewContent} />
        </div>,
        document.body
      )}
    </>
  )
}
