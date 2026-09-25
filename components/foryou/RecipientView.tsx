"use client"

import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

export type RecipientContent = {
  message: string
  videoUrl?: string
  videoPoster?: string
  photoUrl?: string
  attachmentUrl?: string
  attachmentName?: string
}

// What the person who received the cake sees after scanning the code.
// - "message": the buyer's note, video and/or photo;
// - "greeting": the code was sold but no message was added — a warm default
//   instead of an empty "on the way" page that never changes;
// - "notFound": a mistyped code.
export default function RecipientView({
  state,
  content,
  preview = false,
}: {
  state: "message" | "greeting" | "notFound"
  content?: RecipientContent
  // Shown inside the checkout (the buyer's own message, or an example): no link out of it.
  preview?: boolean
}) {
  const { t } = useLanguage()
  const f = t.forYouPages

  return (
    <div className="min-h-screen bg-[#651A1A] flex flex-col">
      {state === "message" && content ? (
        <>
          {/* El mensaje primero: se lee gratis, sin scroll ni decisión, y
              prepara emocionalmente el vídeo. flex-1 centra el texto cuando
              no hay media debajo. */}
          <div className={`flex-1 flex flex-col items-center justify-center px-8 text-center ${preview ? "pb-14 pt-24" : "py-14"}`}>
            <p className="text-white/35 text-[0.65rem] tracking-[0.4em] uppercase font-bold mb-8">
              {f.messageForYou}
            </p>
            {content.message && (
              // Private words: kept out of session recordings.
              <p data-clarity-mask="true" className="font-serif italic text-2xl md:text-3xl text-white/90 font-light leading-relaxed whitespace-pre-line max-w-md">
                {content.message}
              </p>
            )}
            {content.attachmentUrl && (
              <a
                href={content.attachmentUrl}
                className="mt-10 inline-flex items-center gap-2 text-white/70 text-xs tracking-[0.25em] uppercase border-b border-white/30 pb-1 hover:text-white hover:border-white/60 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {content.attachmentName || f.downloadFile}
              </a>
            )}
          </div>

          {/* Vídeo a media pantalla: invita al play sin esconder el mensaje */}
          {content.videoUrl && (
            <video
              controls
              playsInline
              preload="metadata"
              poster={content.videoPoster}
              src={content.videoUrl}
              className="w-full max-h-[50svh] object-contain bg-black"
            />
          )}

          {/* Foto también a sangre, cerrando la experiencia */}
          {content.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={content.photoUrl} alt={f.photoAlt} className="w-full" />
          )}
        </>
      ) : state === "greeting" ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-14 text-center">
          <p className="text-white/35 text-[0.65rem] tracking-[0.4em] uppercase font-bold mb-6">
            {f.defaultEyebrow}
          </p>
          <h1 className="font-serif italic font-light text-4xl md:text-5xl text-white/90 leading-tight mb-6">
            {f.defaultTitle}
          </h1>
          <p className="text-white/70 font-light leading-relaxed max-w-sm">
            {f.defaultText}
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-14 text-center">
          <h1 className="font-serif italic font-light text-4xl md:text-5xl text-white/90 leading-tight mb-6">
            {f.notFoundTitle}
          </h1>
          <p className="text-white/60 font-light leading-relaxed max-w-xs text-sm mb-8">
            {f.notFoundText}
          </p>
          <Link
            href="/foryou"
            className="rounded-full bg-white px-8 py-3.5 text-sm font-black uppercase tracking-[0.15em] text-[#651A1A] transition-colors hover:bg-[#F5E6D3]"
          >
            {f.enterCode}
          </Link>
        </div>
      )}

      {/* Whoever just tasted the cake is the warmest lead the shop has. */}
      {state !== "notFound" && !preview && (
        <div className="border-t border-white/10 px-8 py-10 text-center">
          <p className="mb-4 text-white/80 font-medium">{f.ctaTitle}</p>
          <Link
            href="/bestellen?utm_source=foryou&utm_medium=qr"
            className="inline-block rounded-full border border-white/40 px-7 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-[#651A1A]"
          >
            {f.ctaButton}
          </Link>
        </div>
      )}

      {/* La marca solo como firma, pequeña y abajo */}
      <div className="flex flex-col items-center gap-2 pb-8 pt-4">
        <Image
          src="/Emilia (6).png"
          alt="Emilia"
          width={72}
          height={21}
          className="object-contain opacity-35"
        />
        <p className="text-[0.6rem] text-white/25 tracking-[0.3em] uppercase">
          {f.handcrafted}
        </p>
      </div>
    </div>
  )
}
