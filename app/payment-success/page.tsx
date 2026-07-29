"use client"

import { useEffect, useRef, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { loadStripe } from "@stripe/stripe-js"
import { useLanguage } from "@/contexts/LanguageContext"

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    fbq: (...args: any[]) => void
  }
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

// TWINT y otros métodos con redirección siempre vuelven a esta página, se haya
// pagado o no. Hay que verificar el PaymentIntent antes de dar las gracias.
type PaymentStatus = 'checking' | 'succeeded' | 'processing'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t, locale } = useLanguage()
  const ps = t.paymentSuccess
  const [status, setStatus] = useState<PaymentStatus>('checking')
  const [foryouCode, setForyouCode] = useState<string | null>(null)
  const confirmedRef = useRef(false)

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent')
    const clientSecret = searchParams.get('payment_intent_client_secret')

    // Solo al confirmar el pago: conversiones, código For You y limpieza del carrito
    const confirmSuccess = () => {
      if (confirmedRef.current) return
      confirmedRef.current = true
      setStatus('succeeded')

      const orderValue = localStorage.getItem('emilia-order-value')
      const value = orderValue ? parseFloat(orderValue) : 60.0

      if (paymentIntent) {
        // Recuperar el código para el mensaje personal de este pedido
        fetch(`/api/foryou/code?payment_intent=${encodeURIComponent(paymentIntent)}`)
          .then((res) => res.json())
          .then((data) => { if (data?.code) setForyouCode(data.code) })
          .catch(() => {})
      }

      if (typeof window !== 'undefined' && window.fbq) {
        const eventId = `purchase-${paymentIntent || Date.now()}`
        window.fbq('track', 'Purchase', {
          value: value,
          currency: 'CHF',
          content_type: 'product',
        }, { eventID: eventId })
      }

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-17552723888/N08ICPDj1cwbELCf5bFB',
          'value': value,
          'currency': 'CHF',
          'transaction_id': paymentIntent || ''
        })
      }

      localStorage.removeItem('emilia-cart')
      localStorage.removeItem('emilia-cart-timestamp')
      localStorage.removeItem('emilia-order-value')
      sessionStorage.removeItem('emilia-checkout-form')
    }

    // Atajo SOLO para desarrollo: ?demo=1 muestra el bloque sin pago real
    if (searchParams.get('demo') === '1' && process.env.NODE_ENV !== 'production') {
      setStatus('succeeded')
      setForyouCode('EM-DEMO01')
      return
    }

    // Sin datos de pago (visita directa): mostrar la página sin disparar conversiones
    if (!clientSecret) {
      setStatus('succeeded')
      return
    }

    let cancelled = false
    let attempts = 0

    const verify = async () => {
      try {
        const stripe = await stripePromise
        if (!stripe || cancelled) return
        const { paymentIntent: pi } = await stripe.retrievePaymentIntent(clientSecret)
        if (cancelled) return

        if (!pi || pi.status === 'succeeded' || pi.status === 'requires_capture') {
          confirmSuccess()
        } else if (pi.status === 'processing') {
          // TWINT puede tardar unos segundos en confirmar: reintentar hasta ~1 min
          setStatus('processing')
          if (attempts++ < 20) setTimeout(verify, 3000)
        } else {
          // requires_payment_method / requires_action / canceled: pago no completado.
          // El carrito y los datos del formulario siguen guardados.
          router.replace('/checkout?payment=failed')
        }
      } catch {
        // Si no se puede verificar, no bloqueamos al cliente (sin conversiones)
        if (!cancelled) setStatus('succeeded')
      }
    }
    verify()

    return () => { cancelled = true }
  }, [searchParams, router])

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="animate-pulse">{ps.loading}</div>
      </div>
    )
  }

  const isPending = status === 'processing'

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white p-8 md:p-12 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] text-center border border-[#F5E6D3]/50 relative overflow-hidden">

        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#651A1A] via-[#8B3A3A] to-[#651A1A]" />

        <div className="mb-12 flex justify-center animate-fade-in">
          <div className="relative w-64 h-32 bg-[#651A1A] rounded-xl flex items-center justify-center shadow-lg p-6">
            <div className="relative w-full h-full">
              <Image
                src="/logo1.png"
                alt="Emilia Cheesecake"
                fill
                sizes="208px"
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
        <div className="space-y-6 mb-12 animate-slide-up">
          <h1 className="text-3xl md:text-4xl font-medium tracking-[0.2em] text-black uppercase">
            {isPending ? ps.pendingTitle : ps.title}
          </h1>
          <div className="w-12 h-0.5 bg-[#651A1A] mx-auto opacity-50" />
          <p className="text-gray-500 font-light tracking-wide text-lg leading-relaxed max-w-md mx-auto">
            {isPending ? ps.pendingMessage : ps.message}
          </p>
          {isPending && (
            <div className="flex justify-center">
              <div className="w-8 h-8 border-2 border-[#651A1A]/20 border-t-[#651A1A] rounded-full animate-spin" />
            </div>
          )}
        </div>

        {!isPending && foryouCode && (
          <div className="mb-10 animate-slide-up rounded-2xl bg-[#651A1A] p-8 text-left text-white">
            <p className="text-xs tracking-[0.3em] uppercase font-bold text-[#F5E6D3]/70 mb-3">
              {locale === 'de' ? 'Eine persönliche Überraschung' : 'A personal surprise'}
            </p>
            <h2 className="text-2xl font-black tracking-tight mb-3 leading-tight">
              {locale === 'de'
                ? 'Hinterlasse eine persönliche Nachricht'
                : 'Leave a personal message'}
            </h2>
            <p className="text-white/70 font-light text-sm leading-relaxed mb-6">
              {locale === 'de'
                ? 'Schreibe eine Nachricht, nimm ein Video auf oder füge ein Foto hinzu. Wir legen einen Code bei, mit dem die beschenkte Person alles auf unserer Seite sehen kann.'
                : 'Write a note, record a video or add a photo. We include a code so the person receiving your gift can see it all on our page.'}
            </p>
            <Link
              href={`/foryou/${foryouCode}/create`}
              className="block w-full bg-white text-[#651A1A] py-4 rounded-xl text-center text-sm font-black tracking-[0.15em] uppercase hover:bg-[#F5E6D3] transition-colors duration-300"
            >
              {locale === 'de' ? 'Nachricht erstellen' : 'Create your message'}
            </Link>
          </div>
        )}

        <div className="space-y-6 animate-slide-up delay-200">
          <Link
            href="/"
            className="block w-full bg-black text-white py-4 text-sm font-medium tracking-[0.2em] uppercase hover:bg-[#651A1A] transition-colors duration-500 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
          >
            {ps.backHome}
          </Link>
          <p className="text-xs text-gray-400 font-light tracking-wider">
            {ps.questions} <a href="mailto:info@emilialab.com" className="text-black hover:text-[#651A1A] transition-colors border-b border-gray-200 hover:border-[#651A1A] pb-0.5">{ps.contactUs}</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccess() {
  const { t } = useLanguage()
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="animate-pulse">{t.paymentSuccess.loading}</div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
