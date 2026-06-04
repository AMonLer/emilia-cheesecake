"use client"

import Link from "next/link"
import Image from "next/image"

export default function ForYouCodePage({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase()

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

        {/* Coming soon state — replace with real content once storage is set up */}
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
