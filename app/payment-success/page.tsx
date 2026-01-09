"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get payment_intent from Stripe redirect URL for transaction_id
    const paymentIntent = searchParams.get('payment_intent')

    // Get order value from localStorage
    const orderValue = localStorage.getItem('emilia-order-value')
    const value = orderValue ? parseFloat(orderValue) : 60.0

    // Send Google Ads conversion event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-17552723888/N08ICPDj1cwbELCf5bFB',
        'value': value,
        'currency': 'CHF',
        'transaction_id': paymentIntent || ''
      })
    }

    // Clear cart and order value after successful payment
    localStorage.removeItem('emilia-cart')
    localStorage.removeItem('emilia-order-value')
  }, [searchParams])

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
            Fragen? <a href="mailto:info@emilialab.com" className="text-black hover:text-[#651A1A] transition-colors border-b border-gray-200 hover:border-[#651A1A] pb-0.5">Kontaktieren Sie uns</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="animate-pulse">Laden...</div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
