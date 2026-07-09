"use client"

import { useState, useRef } from "react"
import Image from "next/image"

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
): Promise<UploadResult> {
  const signRes = await fetch("/api/foryou/sign-upload", { method: "POST" })
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

export default function CreateForYouMessage({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase()

  const [message, setMessage] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [fileUrl, setFileUrl] = useState("")
  const [fileName, setFileName] = useState("")
  const [videoProgress, setVideoProgress] = useState<number | null>(null)
  const [fileProgress, setFileProgress] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const videoInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError("")
    if (file.size > MAX_VIDEO_BYTES) {
      setError("The video is too large (max 100 MB). Try a shorter clip.")
      return
    }
    try {
      setVideoProgress(0)
      const res = await uploadToCloudinary(file, setVideoProgress)
      setVideoUrl(res.secureUrl)
    } catch {
      setError("The video could not be uploaded. Please try again.")
    } finally {
      setVideoProgress(null)
    }
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError("")
    if (file.size > MAX_FILE_BYTES) {
      setError("The file is too large (max 25 MB).")
      return
    }
    try {
      setFileProgress(0)
      const res = await uploadToCloudinary(file, setFileProgress)
      setFileUrl(res.secureUrl)
      setFileName(file.name)
    } catch {
      setError("The file could not be uploaded. Please try again.")
    } finally {
      setFileProgress(null)
    }
  }

  const handleSubmit = async () => {
    if (!message.trim() && !videoUrl && !fileUrl) {
      setError("Add a message, a video or a photo first.")
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
      if (!res.ok) throw new Error("save failed")
      setDone(true)
    } catch {
      setError("Could not save your message. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const uploading = videoProgress !== null || fileProgress !== null

  if (done) {
    return (
      <div className="min-h-screen bg-[#651A1A] flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
          <Image src="/Emilia (6).png" alt="Emilia" width={120} height={35} className="object-contain opacity-90 mb-10" />
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20 w-full">
            <h1 className="text-4xl font-black text-white tracking-tight mb-4">All set 🎁</h1>
            <p className="text-white/70 font-light leading-relaxed mb-6">
              Your message is saved. Share this code with the person receiving your gift —
              they&apos;ll enter it at emilialab.com/foryou to unlock it.
            </p>
            <p className="text-[#F5E6D3] text-2xl font-black tracking-[0.3em]">{code}</p>
          </div>
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
          <p className="text-xs tracking-[0.35em] text-[#651A1A]/60 font-bold uppercase mb-4">
            Code · {code}
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-[#651A1A] tracking-tight leading-[0.95] mb-3">
            Leave a message<br />
            <span className="font-serif italic font-medium text-5xl md:text-6xl">they&apos;ll never forget</span>
          </h1>
          <p className="text-[#651A1A]/60 font-light max-w-sm leading-relaxed">
            Write a note, record a video or add a photo. We&apos;ll keep it safe behind your code.
          </p>
        </div>

        <div className="space-y-5">
          {/* Message */}
          <div>
            <label className="block text-xs font-bold tracking-[0.2em] uppercase text-[#651A1A]/60 mb-2">
              Your message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Write something from the heart…"
              className="w-full rounded-2xl border-2 border-[#651A1A]/15 bg-white px-5 py-4 text-[#651A1A] placeholder:text-[#651A1A]/30 focus:outline-none focus:border-[#651A1A] transition-colors resize-none"
            />
          </div>

          {/* Video */}
          <div className="rounded-2xl border-2 border-dashed border-[#651A1A]/20 bg-white/60 p-5">
            <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideo} className="hidden" />
            {videoUrl ? (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#651A1A]">🎬 Video added</span>
                <button onClick={() => { setVideoUrl(""); if (videoInputRef.current) videoInputRef.current.value = "" }} className="text-xs text-[#651A1A]/50 underline">Remove</button>
              </div>
            ) : videoProgress !== null ? (
              <div>
                <p className="text-sm text-[#651A1A] mb-2">Uploading video… {videoProgress}%</p>
                <div className="h-2 w-full rounded-full bg-[#651A1A]/10 overflow-hidden">
                  <div className="h-full bg-[#651A1A] transition-all" style={{ width: `${videoProgress}%` }} />
                </div>
              </div>
            ) : (
              <button onClick={() => videoInputRef.current?.click()} disabled={uploading} className="w-full text-left text-sm font-medium text-[#651A1A]/70 hover:text-[#651A1A] disabled:opacity-40">
                🎬 Add a video <span className="text-[#651A1A]/40">· up to 100 MB</span>
              </button>
            )}
          </div>

          {/* Photo / file */}
          <div className="rounded-2xl border-2 border-dashed border-[#651A1A]/20 bg-white/60 p-5">
            <input ref={fileInputRef} type="file" accept="image/*,application/pdf" onChange={handleFile} className="hidden" />
            {fileUrl ? (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#651A1A] truncate">📎 {fileName || "File added"}</span>
                <button onClick={() => { setFileUrl(""); setFileName(""); if (fileInputRef.current) fileInputRef.current.value = "" }} className="text-xs text-[#651A1A]/50 underline shrink-0 ml-3">Remove</button>
              </div>
            ) : fileProgress !== null ? (
              <div>
                <p className="text-sm text-[#651A1A] mb-2">Uploading… {fileProgress}%</p>
                <div className="h-2 w-full rounded-full bg-[#651A1A]/10 overflow-hidden">
                  <div className="h-full bg-[#651A1A] transition-all" style={{ width: `${fileProgress}%` }} />
                </div>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full text-left text-sm font-medium text-[#651A1A]/70 hover:text-[#651A1A] disabled:opacity-40">
                📎 Add a photo or file <span className="text-[#651A1A]/40">· up to 25 MB</span>
              </button>
            )}
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={saving || uploading}
            className="w-full bg-[#651A1A] text-white py-4 rounded-2xl font-black text-sm tracking-[0.2em] uppercase hover:bg-[#4A1313] transition-colors duration-300 shadow-lg shadow-[#651A1A]/20 disabled:opacity-50"
          >
            {saving ? "Saving…" : uploading ? "Uploading…" : "Save my message"}
          </button>
        </div>

        <p className="mt-12 text-center text-xs text-[#651A1A]/30 tracking-wider">
          emilialab.com · Handcrafted in Zürich
        </p>
      </div>
    </div>
  )
}
