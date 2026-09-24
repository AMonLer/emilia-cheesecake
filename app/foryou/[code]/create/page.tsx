"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

const MAX_VIDEO_BYTES = 100 * 1024 * 1024 // 100 MB
const MAX_FILE_BYTES = 25 * 1024 * 1024 // 25 MB

type UploadResult = {
  secureUrl: string
  resourceType: string
  format: string
}

async function uploadToCloudinary(
  file: File,
  onProgress: (pct: number) => void,
  code: string,
): Promise<UploadResult> {
  const signRes = await fetch("/api/foryou/sign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  })
  if (!signRes.ok) throw new Error("Could not start upload")
  const { timestamp, signature, folder, cloudName, apiKey } = await signRes.json()

  const form = new FormData()
  form.append("file", file)
  form.append("api_key", apiKey)
  form.append("timestamp", String(timestamp))
  form.append("signature", signature)
  form.append("folder", folder)

  return new Promise<UploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText)
        resolve({
          secureUrl: data.secure_url,
          resourceType: data.resource_type,
          format: data.format,
        })
      } else {
        reject(new Error("Upload failed"))
      }
    }
    xhr.onerror = () => reject(new Error("Upload failed"))
    xhr.send(form)
  })
}

type Draft = { message: string; videoUrl: string; fileUrl: string; fileName: string }

// Unsaved work survives a reload: in-app browsers (Instagram, TWINT) often
// reload the page when the buyer comes back from picking a video, and one
// buyer lost her whole message that way.
const draftKey = (code: string) => `emilia-foryou-draft-${code}`

function readDraft(code: string): Draft | null {
  try {
    const draft = JSON.parse(localStorage.getItem(draftKey(code)) || 'null')
    return draft && (draft.message || draft.videoUrl || draft.fileUrl) ? draft : null
  } catch {
    return null
  }
}

export default function CreateForYouMessage({ params }: { params: { code: string } }) {
  // El comprador nunca necesita ver el código: viaja en la URL y en su sesión.
  // El código impreso lo pega la tienda y lo usa quien recibe la tarta.
  const code = params.code.toUpperCase()
  const { locale, t } = useLanguage()
  const f = t.forYouPages
  const [message, setMessage] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [fileUrl, setFileUrl] = useState("")
  const [fileName, setFileName] = useState("")
  const [videoProgress, setVideoProgress] = useState<number | null>(null)
  const [fileProgress, setFileProgress] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [alreadySaved, setAlreadySaved] = useState(false)
  // A saved message stays editable until the delivery slot starts.
  const [editableUntil, setEditableUntil] = useState<number | null>(null)
  const [hasSavedContent, setHasSavedContent] = useState(false)
  const [draftRestored, setDraftRestored] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/foryou/code?code=${encodeURIComponent(code)}`, { cache: 'no-store' })
      .then((res) => { if (!res.ok) throw new Error('Session unavailable'); return res.json() })
      .then((data) => {
        if (cancelled) return
        setAuthorized(data.authorized === true)
        const existing = data.message
        const saved = Boolean(existing && (existing.message || existing.videoUrl || existing.fileUrl))
        const deadline = typeof data.editableUntil === 'number' ? data.editableUntil : null
        setHasSavedContent(saved)
        setEditableUntil(deadline)
        if (saved && !(deadline && Date.now() < deadline)) {
          setAlreadySaved(true)
          return
        }
        // Unsaved work first, then what was saved before.
        const draft = readDraft(code)
        const start = draft ?? (saved ? existing : null)
        if (start) {
          setMessage(start.message || "")
          setVideoUrl(start.videoUrl || "")
          setFileUrl(start.fileUrl || "")
          setFileName(start.fileName || "")
        }
        if (draft) setDraftRestored(true)
        setLoaded(true)
      })
      .catch(() => { if (!cancelled) setAuthorized(false) })
    return () => { cancelled = true }
  }, [code])

  useEffect(() => {
    if (!loaded || done) return
    try {
      if (message || videoUrl || fileUrl) {
        localStorage.setItem(draftKey(code), JSON.stringify({ message, videoUrl, fileUrl, fileName }))
      } else {
        localStorage.removeItem(draftKey(code))
      }
    } catch { }
  }, [loaded, done, code, message, videoUrl, fileUrl, fileName])

  const videoInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const deadlineLabel = editableUntil
    ? new Date(editableUntil).toLocaleString(locale === 'en' ? 'en-GB' : 'de-CH', {
        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zurich',
      })
    : ''

  const handleVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError("")
    if (file.size > MAX_VIDEO_BYTES) {
      setError(f.videoTooLarge)
      return
    }
    try {
      setVideoProgress(0)
      const res = await uploadToCloudinary(file, setVideoProgress, code)
      setVideoUrl(res.secureUrl)
    } catch {
      setError(f.videoFailed)
    } finally {
      setVideoProgress(null)
    }
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError("")
    if (file.size > MAX_FILE_BYTES) {
      setError(f.fileTooLarge)
      return
    }
    try {
      setFileProgress(0)
      const res = await uploadToCloudinary(file, setFileProgress, code)
      setFileUrl(res.secureUrl)
      setFileName(file.name)
    } catch {
      setError(f.fileFailed)
    } finally {
      setFileProgress(null)
    }
  }

  const handleSubmit = async () => {
    if (!message.trim() && !videoUrl && !fileUrl) {
      setError(f.nothingToSave)
      return
    }
    setError("")
    setSaving(true)
    try {
      const res = await fetch("/api/foryou/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, message, videoUrl, fileUrl, fileName }),
      })
      if (res.status === 409) {
        setAlreadySaved(true)
        return
      }
      if (!res.ok) throw new Error("save failed")
      try { localStorage.removeItem(draftKey(code)) } catch { }
      setDone(true)
    } catch {
      setError(f.saveFailed)
    } finally {
      setSaving(false)
    }
  }

  const uploading = videoProgress !== null || fileProgress !== null
  const supportLink = <a href="mailto:info@emilialab.com" className="underline underline-offset-2">info@emilialab.com</a>

  if (authorized !== true) {
    return (
      <main className="min-h-screen bg-[#FAF6F1] flex flex-col items-center justify-center px-6 text-center text-[#651A1A]">
        <h1 className="text-3xl font-bold mb-4">{authorized === null ? f.loading : f.notAuthorizedTitle}</h1>
        {authorized === false && <>
          <p className="max-w-md mb-6">{f.notAuthorizedText}</p>
          <Link href={`/foryou/${code}`} className="underline underline-offset-4">{f.viewMessage}</Link>
          <p className="mt-8 text-sm text-[#651A1A]/50">{f.trouble} {supportLink}</p>
        </>}
      </main>
    )
  }

  if (alreadySaved) {
    return (
      <main className="min-h-screen bg-[#FAF6F1] flex flex-col items-center justify-center px-6 text-center text-[#651A1A]">
        <h1 className="text-3xl font-bold mb-4">{f.lockedTitle}</h1>
        <p className="max-w-md font-light leading-relaxed">
          {f.lockedText} {supportLink} {f.lockedTextEnd}
        </p>
        <Link href={`/foryou/${code}`} className="mt-8 underline underline-offset-4">{f.preview}</Link>
      </main>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#651A1A] flex flex-col items-center justify-center px-4 py-12 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8B3A3A] rounded-full filter blur-[150px] opacity-50 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md flex flex-col items-center">
          <Image src="/Emilia (6).png" alt="Emilia" width={120} height={35} className="object-contain opacity-90 mb-10" />

          {/* Check de confirmación */}
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5E6D3] shadow-[0_12px_32px_-10px_rgba(0,0,0,0.55)]">
            <svg className="h-7 w-7 text-[#651A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <p className="text-[#F5E6D3]/60 text-xs tracking-[0.35em] uppercase font-bold mb-3">
            {f.savedEyebrow}
          </p>
          <h1 className="text-5xl font-black text-white tracking-tight leading-[0.95] mb-6">
            {f.savedTitle1} <span className="font-serif italic font-medium text-[#F5E6D3]">{f.savedTitle2}</span>
          </h1>
          <p className="text-white/60 font-light leading-relaxed max-w-xs text-sm">
            {f.savedText}
          </p>
          {deadlineLabel && (
            <p className="mt-4 text-white/60 font-light leading-relaxed max-w-xs text-sm">
              {f.savedEditHint(deadlineLabel)}
            </p>
          )}
          <Link
            href={`/foryou/${code}`}
            className="mt-8 rounded-full border border-white/40 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-[#651A1A]"
          >
            {f.preview}
          </Link>

          <p className="mt-10 text-xs text-white/30 tracking-wider">
            emilialab.com · {f.handcrafted}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF6F1] flex flex-col items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#F5E6D3] rounded-full filter blur-[120px] opacity-70 pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="flex flex-col items-center text-center mb-10">
          <Image
            src="/Emilia (6).png"
            alt="Emilia"
            width={130}
            height={38}
            className="object-contain mb-8"
            style={{ filter: "brightness(0) saturate(100%) invert(14%) sepia(60%) saturate(800%) hue-rotate(320deg) brightness(70%)" }}
          />
          <h1 className="text-4xl md:text-5xl font-black text-[#651A1A] tracking-tight leading-[0.95] mb-3">
            {f.editorTitle1}<br />
            <span className="font-serif italic font-medium text-5xl md:text-6xl">{f.editorTitle2}</span>
          </h1>
          <p className="text-[#651A1A]/60 font-light max-w-sm leading-relaxed">
            {f.editorDesc}
          </p>
          {hasSavedContent && deadlineLabel && (
            <p className="mt-4 rounded-full bg-[#651A1A]/5 px-4 py-2 text-sm text-[#651A1A]">
              {f.editableUntil(deadlineLabel)}
            </p>
          )}
          {draftRestored && (
            <p className="mt-3 text-sm text-[#651A1A]/70">{f.draftRestored}</p>
          )}
        </div>

        <div className="space-y-5">
          {/* Message */}
          <div>
            <label htmlFor="foryou-message" className="block text-xs font-bold tracking-[0.2em] uppercase text-[#651A1A]/60 mb-2">
              {f.messageLabel}
            </label>
            <textarea
              id="foryou-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder={f.messagePlaceholder}
              className="w-full rounded-2xl border-2 border-[#651A1A]/15 bg-white px-5 py-4 text-base text-[#651A1A] placeholder:text-[#651A1A]/30 focus:outline-none focus:border-[#651A1A] transition-colors resize-none"
            />
          </div>

          {/* Video */}
          <div className="rounded-2xl border-2 border-dashed border-[#651A1A]/20 bg-white/60 p-5">
            <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideo} className="hidden" />
            {videoUrl ? (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#651A1A]">🎬 {f.videoAdded}</span>
                <button onClick={() => { setVideoUrl(""); if (videoInputRef.current) videoInputRef.current.value = "" }} className="text-xs text-[#651A1A]/50 underline">{f.remove}</button>
              </div>
            ) : videoProgress !== null ? (
              <div>
                <p className="text-sm text-[#651A1A] mb-2">{f.uploadingVideo(videoProgress)}</p>
                <div className="h-2 w-full rounded-full bg-[#651A1A]/10 overflow-hidden">
                  <div className="h-full bg-[#651A1A] transition-all" style={{ width: `${videoProgress}%` }} />
                </div>
              </div>
            ) : (
              <button onClick={() => videoInputRef.current?.click()} disabled={uploading} className="w-full text-left text-sm font-medium text-[#651A1A]/70 hover:text-[#651A1A] disabled:opacity-40">
                🎬 {f.addVideo} <span className="text-[#651A1A]/40">· {f.videoLimit}</span>
              </button>
            )}
          </div>

          {/* Photo / file */}
          <div className="rounded-2xl border-2 border-dashed border-[#651A1A]/20 bg-white/60 p-5">
            <input ref={fileInputRef} type="file" accept="image/*,application/pdf" onChange={handleFile} className="hidden" />
            {fileUrl ? (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#651A1A] truncate">📎 {fileName || f.fileAdded}</span>
                <button onClick={() => { setFileUrl(""); setFileName(""); if (fileInputRef.current) fileInputRef.current.value = "" }} className="text-xs text-[#651A1A]/50 underline shrink-0 ml-3">{f.remove}</button>
              </div>
            ) : fileProgress !== null ? (
              <div>
                <p className="text-sm text-[#651A1A] mb-2">{f.uploadingFile(fileProgress)}</p>
                <div className="h-2 w-full rounded-full bg-[#651A1A]/10 overflow-hidden">
                  <div className="h-full bg-[#651A1A] transition-all" style={{ width: `${fileProgress}%` }} />
                </div>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full text-left text-sm font-medium text-[#651A1A]/70 hover:text-[#651A1A] disabled:opacity-40">
                📎 {f.addFile} <span className="text-[#651A1A]/40">· {f.fileLimit}</span>
              </button>
            )}
          </div>

          {error && <p role="alert" className="text-red-600 text-sm text-center">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={saving || uploading}
            className="w-full bg-[#651A1A] text-white py-4 rounded-2xl font-black text-sm tracking-[0.2em] uppercase hover:bg-[#4A1313] transition-colors duration-300 shadow-lg shadow-[#651A1A]/20 disabled:opacity-50"
          >
            {saving ? f.saving : uploading ? f.uploadingShort : hasSavedContent ? f.saveChanges : f.save}
          </button>
        </div>

        <p className="mt-12 text-center text-xs text-[#651A1A]/30 tracking-wider">
          {f.trouble} {supportLink}
          <br />
          emilialab.com · {f.handcrafted}
        </p>
      </div>
    </div>
  )
}
