import Link from "next/link"
import Image from "next/image"
import { getForYouMessage } from "@/lib/notion"
import { videoDeliveryUrl, videoPosterUrl, imageDeliveryUrl } from "@/lib/cloudinary"

export const dynamic = "force-dynamic"

function isImageUrl(url: string): boolean {
  return /\.(jpe?g|png|gif|webp|avif|heic)$/i.test(url)
}

export default async function ForYouCodePage({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase()
  const data = await getForYouMessage(code)
  const hasContent = data && (data.message || data.videoUrl || data.fileUrl)

  return (
    <div className="min-h-screen bg-[#651A1A] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8B3A3A] rounded-full filter blur-[150px] opacity-50 pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center">

        {/* Logo */}
        <div className="mb-12">
          <Image
            src="/Emilia (6).png"
            alt="Emilia"
            width={120}
            height={35}
            className="object-contain opacity-90"
          />
        </div>

        {hasContent ? (
          <div className="w-full space-y-6">
            <p className="text-[#F5E6D3]/60 text-xs tracking-[0.3em] uppercase font-bold">
              A message for you
            </p>

            {data!.videoUrl && (
              <video
                controls
                playsInline
                poster={videoPosterUrl(data!.videoUrl)}
                src={videoDeliveryUrl(data!.videoUrl)}
                className="w-full rounded-3xl border border-white/20 shadow-2xl bg-black"
              />
            )}

            {data!.message && (
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <p className="text-white text-lg font-light leading-relaxed whitespace-pre-line">
                  {data!.message}
                </p>
              </div>
            )}

            {data!.fileUrl && (
              isImageUrl(data!.fileUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageDeliveryUrl(data!.fileUrl)}
                  alt="A photo for you"
                  className="w-full rounded-3xl border border-white/20 shadow-2xl"
                />
              ) : (
                <a
                  href={data!.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 text-white font-medium hover:bg-white/20 transition-colors"
                >
                  📎 {data!.fileName || "Open the attached file"}
                </a>
              )
            )}
          </div>
        ) : (
          /* Empty state — content not added yet */
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20 w-full">
            <p className="text-[#F5E6D3]/60 text-xs tracking-[0.3em] uppercase font-bold mb-3">
              Code · {code}
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[0.95] mb-6">
              Your message<br />
              <span className="font-serif italic font-medium text-5xl md:text-6xl text-[#F5E6D3]/80">is on the way</span>
            </h1>
            <p className="text-white/60 font-light leading-relaxed max-w-xs mx-auto">
              The person who sent you this is preparing something special for you. Check back soon.
            </p>
          </div>
        )}

        <Link
          href="https://www.emilialab.com"
          className="mt-12 text-xs text-white/30 tracking-wider hover:text-white/50 transition-colors"
        >
          emilialab.com · Handcrafted in Zürich
        </Link>
      </div>
    </div>
  )
}
