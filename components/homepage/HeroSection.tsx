import Link from "next/link"
import Image from "next/image"

export default function HeroSection() {
  return (
    <section className="relative">
      {/* Mobile Layout - Image with button overlaid at bottom */}
      <div className="lg:hidden">
        {/* Image - Full width with button positioned at bottom */}
        <div className="relative h-[600px] w-full">
          <Image
            src="/Generated Image November 30, 2025 - 9_03PM.jpeg"
            alt="Cookies Box"
            fill
            className="object-cover"
            priority
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10"></div>

          {/* Content positioned at bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-12 px-6 z-20 text-center">
            <h1 className="text-4xl font-black text-white leading-[0.95] mb-8 drop-shadow-lg">
              BAKED
              <br />
              TO BE SAVORED
              <br />
              SLOWLY
            </h1>
            <Link href="/bestellen">
              <button className="bg-white text-[#651A1A] font-black px-12 py-4 text-base tracking-wide border-2 border-white hover:bg-[#651A1A] hover:text-white hover:border-[#651A1A] transition-colors">
                JETZT BESTELLEN
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Text left, Image right */}
      <div className="hidden lg:grid grid-cols-[1.2fr_1fr] min-h-[600px]">
        <div className="bg-[#F5E6D3] flex items-center justify-center px-8 lg:px-16 py-16">
          <div className="max-w-lg">
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-[#651A1A] leading-[0.95] mb-8">
              BAKED
              <br />
              TO BE SAVORED
              <br />
              SLOWLY
            </h1>
            <Link href="/bestellen">
              <button className="bg-white text-[#651A1A] font-black px-12 py-4 text-base tracking-wide border-2 border-[#651A1A] hover:bg-[#651A1A] hover:text-white transition-colors">
                JETZT BESTELLEN
              </button>
            </Link>
          </div>
        </div>

        <div className="relative h-[400px] lg:h-auto">
          <Image
            src="/Portada1.jpg"
            alt="Cookies Box"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  )
}
