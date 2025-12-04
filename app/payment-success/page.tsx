"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

export default function PaymentSuccess() {
  useEffect(() => {
    // Clear cart if needed
    // localStorage.removeItem('cart')
  }, [])

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white p-8 md:p-12 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] text-center border border-[#F5E6D3]/50 relative overflow-hidden">

        {/* Decorative Background Element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#651A1A] via-[#8B3A3A] to-[#651A1A]" />

        {/* Logo with Burgundy Background */}
        <div className="mb-12 flex justify-center animate-fade-in">
          <div className="relative w-64 h-32 bg-[#651A1A] rounded-xl flex items-center justify-center shadow-lg p-6">
            <div className="relative w-full h-full">
              <Image
                src="/logo1.png"
                alt="Emilia Cheesecake"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
        <div className="space-y-6 mb-12 animate-slide-up">
          <h1 className="text-3xl md:text-4xl font-medium tracking-[0.2em] text-black uppercase">
            Vielen Dank
          </h1>
          <div className="w-12 h-0.5 bg-[#651A1A] mx-auto opacity-50" />
          <p className="text-gray-500 font-light tracking-wide text-lg leading-relaxed max-w-md mx-auto">
            Wir haben Ihre Bestellung erhalten und bereiten alles mit größter Sorgfalt in unserer Backstube vor.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-6 animate-slide-up delay-200">
          <Link
            href="/"
            className="block w-full bg-black text-white py-4 text-sm font-medium tracking-[0.2em] uppercase hover:bg-[#651A1A] transition-colors duration-500 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
          >
            Zurück zur Startseite
          </Link>
          <p className="text-xs text-gray-400 font-light tracking-wider">
            Fragen? <a href="mailto:hola@emilia.com" className="text-black hover:text-[#651A1A] transition-colors border-b border-gray-200 hover:border-[#651A1A] pb-0.5">Kontaktieren Sie uns</a>
          </p>
        </div>
      </div>
    </div>
  )
}
