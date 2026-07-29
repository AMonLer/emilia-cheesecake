'use client'

import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/contexts/LanguageContext"

export default function HeroSection() {
  const { t } = useLanguage()
  const h = t.hero

  return (
    <section className="relative">
      {/* Mobile Layout - Image with button overlaid at bottom */}
      <div className="lg:hidden">
        {/* Image - Full width with button positioned at bottom */}
        {/* svh, not dvh: dvh grows when the mobile URL bar collapses mid-scroll,
            which visibly stretches the hero and reflows the page under the user. */}
        <div className="relative h-[85svh] min-h-[480px] w-full">
          <Image
            src="/Generated Image November 30, 2025 - 9_03PM.jpeg"
            alt="San Sebastian Cheesecake von Emilia"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>

          {/* Content positioned at bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-10 px-6 z-20 text-center">
            <h1 className="text-4xl font-black text-white leading-[0.95] mb-8 drop-shadow-lg">
              WHERE MEMORIES
              <br />
              ARE BAKED
            </h1>
            <Link href="/bestellen">
              <button className="bg-white text-[#651A1A] border-2 border-[#651A1A] font-black px-14 py-4 text-base tracking-wide rounded-full hover:bg-[#651A1A] hover:text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                {h.cta}
              </button>
            </Link>
            <p className="text-[11px] text-white/80 tracking-wide mt-4">
              {h.trust}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Text left, Image right.
          The panel is the same beige as the photo's background so the two halves
          read as one scene with no seam down the middle. */}
      {/* The whole slice only fits if the photo column is at least ~1.05x wider
          than it is tall, so narrow desktops get a wider column and a shorter hero. */}
      <div className="hidden lg:grid grid-cols-[1fr_1.3fr] xl:grid-cols-[1fr_1.15fr] min-h-[500px] xl:min-h-[620px] 2xl:min-h-[740px] bg-gradient-to-b from-[#F3DFCC] to-[#F8DFCA]">
        <div className="flex items-center justify-center px-8 lg:px-12 xl:px-16 py-12">
          <div className="max-w-lg">
            <span className="block text-xs font-bold tracking-[0.3em] uppercase text-[#651A1A]/70 mb-6">
              {h.eyebrow}
            </span>
            <h1 className="text-5xl xl:text-6xl 2xl:text-7xl font-black text-[#651A1A] leading-[0.95] mb-6 xl:mb-8">
              WHERE MEMORIES
              <br />
              ARE BAKED
            </h1>
            <Link href="/bestellen">
              <button className="bg-[#651A1A] text-white font-black px-14 py-4 text-base tracking-wide rounded-full hover:bg-[#4A1313] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                {h.cta}
              </button>
            </Link>
            <p className="text-xs text-[#651A1A]/60 tracking-wide mt-5">
              {h.trust}
            </p>
          </div>
        </div>

        {/* object-right: the slice runs to the very edge of the photo, so any
            crop has to come off the left, where there is only empty beige. */}
        <div className="relative h-[400px] lg:h-auto">
          <Image
            src="/hero-slice.jpeg"
            alt="Ein Stück San Sebastian Cheesecake von Emilia"
            fill
            // Deliberately over-declared: object-cover here is driven by height,
            // so the browser needs a wider candidate than the column to fill it
            // without upscaling.
            sizes="(max-width: 1024px) 100vw, 90vw"
            // The background is a wide, smooth gradient - the default q75 bands
            // across it badly. Lossless source in, high quality out.
            quality={92}
            className="object-cover object-right"
            priority
          />
        </div>
      </div>
    </section>
  )
}
