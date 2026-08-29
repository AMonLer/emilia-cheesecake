import Image from "next/image"
import { getForYouMessage } from "@/lib/foryou-store"
import { videoDeliveryUrl, videoPosterUrl, imageDeliveryUrl, attachmentDeliveryUrl } from "@/lib/cloudinary"

export const dynamic = "force-dynamic"

function isImageUrl(url: string): boolean {
  return /\.(jpe?g|png|gif|webp|avif|heic)$/i.test(url)
}

export default async function ForYouCodePage({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase()
  const data = await getForYouMessage(code)
  const hasContent = data && (data.message || data.videoUrl || data.fileUrl)

  return (
    <div className="min-h-screen bg-[#651A1A] flex flex-col">
      {hasContent ? (
        <>
          {/* El vídeo es el protagonista: a sangre y arriba del todo */}
          {data!.videoUrl && (
            <video
              controls
              playsInline
              preload="metadata"
              poster={videoPosterUrl(data!.videoUrl)}
              src={videoDeliveryUrl(data!.videoUrl)}
              className="w-full max-h-[78svh] object-contain bg-black"
            />
          )}

          <div className="flex-1 flex flex-col items-center px-8 py-14 text-center">
            <p className="text-white/35 text-[0.65rem] tracking-[0.4em] uppercase font-bold mb-8">
              A message for you
            </p>

            {data!.message && (
              <p className="font-serif italic text-2xl md:text-3xl text-white/90 font-light leading-relaxed whitespace-pre-line max-w-md">
                {data!.message}
              </p>
            )}

            {data!.fileUrl && !isImageUrl(data!.fileUrl) && (
              <a
                href={attachmentDeliveryUrl(data!.fileUrl, data!.fileName)}
                className="mt-10 inline-flex items-center gap-2 text-white/70 text-xs tracking-[0.25em] uppercase border-b border-white/30 pb-1 hover:text-white hover:border-white/60 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {data!.fileName || "Download file"}
              </a>
            )}
          </div>

          {/* Foto también a sangre, cerrando la experiencia */}
          {data!.fileUrl && isImageUrl(data!.fileUrl) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageDeliveryUrl(data!.fileUrl)}
              alt="A photo for you"
              className="w-full"
            />
          )}
        </>
      ) : (
        /* Empty state — el mensaje aún no existe */
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <p className="text-white/35 text-[0.65rem] tracking-[0.4em] uppercase font-bold mb-6">
            Code · {code}
          </p>
          <h1 className="font-serif italic font-light text-4xl md:text-5xl text-white/90 leading-tight mb-6">
            Your message<br />is on the way
          </h1>
          <p className="text-white/50 font-light leading-relaxed max-w-xs text-sm">
            The person who sent you this is preparing something special for you. Check back soon.
          </p>
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
          Handcrafted in Zürich
        </p>
      </div>
    </div>
  )
}
