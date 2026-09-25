"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { ArrowRight, X } from "lucide-react"
import RecipientView from "@/components/foryou/RecipientView"
import { useScrollLock } from "@/lib/useScrollLock"
import { trackEvent } from "@/lib/tracking"

const SAMPLE_PHOTO = "/pexels-elly-fairytale-3893712.jpg"

type Labels = {
  giftStep1: string
  giftStep2: string
  giftStep3: string
  giftPreviewButton: string
  giftPreviewLabel: string
  giftPreviewClose: string
  giftSampleMessage: string
}

// Shown once the gift option is on: what the recipient gets, before paying.
// A line of text ("video, photo or message, QR code") did not make anyone
// picture it; a tiny phone and a full example page do.
export default function GiftPreview({ labels }: { labels: Labels }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  useScrollLock(open)

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const openPreview = () => {
    trackEvent("gift_preview_open")
    setOpen(true)
  }

  return (
    <>
      <div className="mt-3 flex gap-4 border-t border-[#651A1A]/15 pt-4">
        {/* Mini phone: the message first, the photo below, like the real page */}
        <button
          type="button"
          onClick={openPreview}
          aria-label={labels.giftPreviewButton}
          className="w-[88px] shrink-0 overflow-hidden rounded-[16px] border-[3px] border-[#1a1a1a] bg-[#651A1A] text-left shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)] transition-transform active:scale-[0.97]"
        >
          <span className="block px-2 pb-2 pt-3 text-center">
            <span className="block text-[5px] font-bold uppercase tracking-[0.25em] text-white/50">For you</span>
            <span className="mt-1 block font-serif text-[8px] italic leading-snug text-white/90 line-clamp-4">
              {labels.giftSampleMessage}
            </span>
          </span>
          <span className="relative block h-[64px]">
            <Image src={SAMPLE_PHOTO} alt="" fill sizes="88px" className="object-cover" />
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <ol className="space-y-1.5 text-xs leading-snug text-[#651A1A]">
            {[labels.giftStep1, labels.giftStep2, labels.giftStep3].map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-serif text-sm italic leading-none text-[#651A1A]/60">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={openPreview}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#651A1A] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#4A1313] active:bg-[#4A1313]"
          >
            {labels.giftPreviewButton}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>
      </div>

      {open && mounted && createPortal(
        <div role="dialog" aria-modal="true" aria-label={labels.giftPreviewButton} className="fixed inset-0 z-[70] overflow-y-auto bg-[#651A1A]">
          <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-3">
            <span className="rounded-full bg-white/15 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white backdrop-blur">
              {labels.giftPreviewLabel}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label={labels.giftPreviewClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#651A1A] shadow-lg"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
          <RecipientView
            preview
            state="message"
            content={{ message: labels.giftSampleMessage, photoUrl: SAMPLE_PHOTO }}
          />
        </div>,
        document.body
      )}
    </>
  )
}
