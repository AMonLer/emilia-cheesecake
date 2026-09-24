'use client'

import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/contexts/LanguageContext"
import EarliestDelivery from "@/components/EarliestDelivery"
import { products } from "@/lib/products"

// Cheapest cake, so the hero can say "ab 15.90 CHF" without hard-coding it.
const FROM_PRICE = Math.min(
  ...Object.values(products).flatMap((product: any) => Object.values(product.prices) as number[])
).toFixed(2)

export default function HeroSection() {
  const { t } = useLanguage()
  const h = t.hero

  return (
    <section className="relative">
      {/* Mobile Layout - Image with button overlaid at bottom */}
      <div className="lg:hidden">
        {/* Image - Full width with button positioned at bottom */}
        {/* svh, not dvh: dvh grows when the mobile URL bar collapses mid-scroll,
            which visibly stretches the hero and reflows the page under the user.
            Not full height: at 85svh nobody scrolled on (no home page view below
            16% depth), so the first cakes now peek in underneath. */}
        <div className="relative h-[66svh] min-h-[440px] w-full">
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
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-7 px-6 z-20 text-center">
            <span className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white/85 drop-shadow">
              {h.eyebrow}
            </span>
            <h1 className="text-4xl font-black text-white leading-[0.95] mb-6 drop-shadow-lg">
              WHERE MEMORIES
              <br />
              ARE BAKED
            </h1>
            <Link href="/bestellen">
              <button className="bg-white text-[#651A1A] border-2 border-[#651A1A] font-black px-14 py-4 text-base tracking-wide rounded-full hover:bg-[#651A1A] hover:text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                {h.cta}
              </button>
            </Link>
            <EarliestDelivery tone="light" className="mt-4 justify-center text-xs text-white/90 drop-shadow" />
            <p className="text-[11px] text-white/80 tracking-wide mt-1.5">
              {h.fromPrice(FROM_PRICE)} · {h.trust}
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
          <div className="max-w-lg xl:max-w-2xl 2xl:max-w-3xl">
            <span className="block text-xs font-bold tracking-[0.3em] uppercase text-[#651A1A]/70 mb-6">
              {h.eyebrow}
            </span>
            {/* Fluid rather than stepped, and split at xl because the text column is
                proportionally much narrower below it - one vw factor cannot serve both
                without either overflowing at 1024 or wasting room at 1900. */}
            <h1 className="text-[clamp(2.75rem,5.4vw,4.5rem)] xl:text-[clamp(4rem,6.1vw,8rem)] font-black text-[#651A1A] leading-[1.05] mb-8 xl:mb-10">
              WHERE MEMORIES
              <br />
              ARE BAKED
            </h1>
            <Link href="/bestellen">
              <button className="bg-[#651A1A] text-white font-black px-14 py-4 text-base tracking-wide rounded-full hover:bg-[#4A1313] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                {h.cta}
              </button>
            </Link>
            <EarliestDelivery className="mt-5 text-sm text-[#651A1A]/80" />
            <p className="text-xs text-[#651A1A]/60 tracking-wide mt-2">
              {h.fromPrice(FROM_PRICE)} · {h.trust}
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
