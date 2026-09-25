"use client"

import { useEffect, useRef, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { loadStripe } from "@stripe/stripe-js"
import { useLanguage } from "@/contexts/LanguageContext"
import { trackEvent } from "@/lib/tracking"

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    fbq: (...args: any[]) => void
  }
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

// TWINT y otros métodos con redirección siempre vuelven a esta página, se haya
// pagado o no. Hay que verificar el PaymentIntent antes de dar las gracias.
type PaymentStatus = 'checking' | 'succeeded' | 'processing' | 'slow'

// TWINT often hands the buyer back (redirect_status=pending) before it has told
// Stripe the payment went through: the intent is still `requires_action` for a
// few seconds. This page used to read that as a failure and send paying
// customers back to the checkout, where one tapped "pay" again. Only a definite
// failure goes back now; anything in between waits here.
const FAILED_STATUSES = new Set(['requires_payment_method', 'canceled'])
const FAST_POLLS = 20        // every 2 s for the first 40 s
const FAST_POLL_MS = 2_000
const SLOW_POLL_MS = 5_000
const GIVE_UP_AFTER_MS = 10 * 60_000

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t, locale } = useLanguage()
  const ps = t.paymentSuccess
  const [status, setStatus] = useState<PaymentStatus>('checking')
  const [foryouCode, setForyouCode] = useState<string | null>(null)
  // The buyer already made the message in the checkout.
  const [foryouReady, setForyouReady] = useState(false)
  const confirmedRef = useRef(false)
  // Bumped by "check again" to restart the polling after it gave up.
  const [checkRound, setCheckRound] = useState(0)

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
        // El sticker lo asigna el webhook tras cobrar; si aún no está (pending),
        // reintentar cada 2s hasta que aparezca (~30s máximo).
        const fetchForYouCode = (attempt: number) => {
          fetch('/api/foryou/code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentIntentId: paymentIntent, clientSecret }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data?.code) {
                setForyouCode(data.code)
                setForyouReady(data.hasMessage === true)
              } else if (data?.pending && attempt < 15) {
                setTimeout(() => fetchForYouCode(attempt + 1), 2000)
              }
            })
            .catch(() => {})
        }
        fetchForYouCode(0)
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

      trackEvent('purchase')
      localStorage.removeItem('emilia-cart')
      localStorage.removeItem('emilia-cart-timestamp')
      localStorage.removeItem('emilia-order-value')
      sessionStorage.removeItem('emilia-checkout-form')
      sessionStorage.removeItem('emilia-payment-intent')
    }

    // Atajo SOLO para desarrollo: ?demo=1 muestra el bloque sin pago real
    // (?demo=ready: con la botschaft ya creada en el checkout)
    const demo = searchParams.get('demo')
    if ((demo === '1' || demo === 'ready') && process.env.NODE_ENV !== 'production') {
      setStatus('succeeded')
      setForyouCode('2000')
      setForyouReady(demo === 'ready')
      return
    }

    // Sin datos de pago (visita directa): mostrar la página sin disparar conversiones
    if (!clientSecret) {
      setStatus('succeeded')
      return
    }

    let cancelled = false
    let attempts = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    const startedAt = Date.now()
    let reportedPending = false
    let inFlight = false

    const verify = async () => {
      if (inFlight) return
      inFlight = true
      clearTimeout(timer)
      try {
        const stripe = await stripePromise
        if (!stripe || cancelled) return
        const { paymentIntent: pi } = await stripe.retrievePaymentIntent(clientSecret)
        if (cancelled) return

        if (!pi || pi.status === 'succeeded' || pi.status === 'requires_capture') {
          confirmSuccess()
        } else if (FAILED_STATUSES.has(pi.status)) {
          // Pago rechazado o cancelado. El carrito y los datos del formulario
          // siguen guardados.
          router.replace('/checkout?payment=failed')
        } else if (Date.now() - startedAt >= GIVE_UP_AFTER_MS) {
          // Still unconfirmed: say so plainly and keep the buyer away from paying twice.
          setStatus('slow')
        } else {
          // processing / requires_action: TWINT is still confirming.
          setStatus('processing')
          if (!reportedPending) {
            reportedPending = true
            trackEvent('payment_pending')
          }
          timer = setTimeout(verify, attempts++ < FAST_POLLS ? FAST_POLL_MS : SLOW_POLL_MS)
        }
      } catch {
        // Si no se puede verificar, no bloqueamos al cliente (sin conversiones)
        if (!cancelled) setStatus('succeeded')
      } finally {
        inFlight = false
      }
    }
    verify()

    // Phones pause timers in background tabs: check as soon as the page is back.
    const onVisible = () => {
      if (document.visibilityState === 'visible' && !confirmedRef.current) verify()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [searchParams, router, checkRound])

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="animate-pulse">{ps.loading}</div>
      </div>
    )
  }

  const isSlow = status === 'slow'
  const isPending = status === 'processing' || isSlow
  // The sticker code in the subject, so the shop finds the gift right away.
  const foryouMailto = `mailto:info@emilialab.com?subject=${encodeURIComponent(`For You ${foryouCode ?? ''}`)}`

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
            {isSlow ? ps.slowTitle : isPending ? ps.pendingTitle : ps.title}
          </h1>
          <div className="w-12 h-0.5 bg-[#651A1A] mx-auto opacity-50" />
          <p className="text-gray-500 font-light tracking-wide text-lg leading-relaxed max-w-md mx-auto">
            {isSlow ? ps.slowMessage : isPending ? ps.pendingMessage : ps.message}
          </p>
          {isPending && !isSlow && (
            <div className="flex justify-center">
              <div className="w-8 h-8 border-2 border-[#651A1A]/20 border-t-[#651A1A] rounded-full animate-spin" />
            </div>
          )}
          {isSlow && (
            <button
              type="button"
              onClick={() => { setStatus('processing'); setCheckRound((n) => n + 1) }}
              className="mx-auto block rounded-full border border-[#651A1A] px-6 py-2.5 text-sm font-bold text-[#651A1A] transition-colors hover:bg-[#651A1A] hover:text-white"
            >
              {ps.checkAgain}
            </button>
          )}
        </div>

        {/* Gift: the message is made in the checkout; afterwards only the shop
            can add or change it, when the buyer writes to us. */}
        {!isPending && foryouCode && (
          <div className="mb-10 animate-slide-up rounded-2xl bg-[#651A1A] p-8 text-left text-white">
            <p className="text-xs tracking-[0.3em] uppercase font-bold text-[#F5E6D3]/70 mb-3">
              {locale === 'de' ? 'Deine Überraschung' : 'Your surprise'}
            </p>
            <h2 className="text-2xl font-black tracking-tight mb-3 leading-tight">
              {foryouReady
                ? locale === 'de' ? 'Deine Botschaft ist gespeichert' : 'Your message is saved'
                : locale === 'de' ? 'Doch noch eine Botschaft?' : 'Add a message after all?'}
            </h2>
            <p className="text-white/70 font-light text-sm leading-relaxed mb-6">
              {foryouReady
                ? locale === 'de'
                  ? 'Beim Kuchen liegt ein Code: Wer ihn scannt, sieht alles, was du vorbereitet hast.'
                  : 'A code comes with the cake: whoever scans it sees everything you prepared.'
                : locale === 'de'
                  ? 'Beim Kuchen liegt ein Code mit einem Gruss von uns. Möchtest du doch noch eine Nachricht, ein Video oder ein Foto mitschicken? Schreib uns, wir fügen es für dich hinzu.'
                  : 'A code with a greeting from us comes with the cake. Want to send a message, video or photo after all? Write to us and we\'ll add it for you.'}
            </p>
            <a
              href={foryouReady ? `/foryou/${foryouCode}` : foryouMailto}
              className="block w-full rounded-xl bg-white py-4 text-center text-sm font-black uppercase tracking-[0.15em] text-[#651A1A] transition-colors duration-300 hover:bg-[#F5E6D3]"
            >
              {foryouReady
                ? locale === 'de' ? 'Ansehen' : 'View'
                : locale === 'de' ? 'E-Mail schreiben' : 'Write to us'}
            </a>
            {foryouReady && (
              <p className="mt-4 text-center text-xs leading-relaxed text-white/60">
                {locale === 'de' ? 'Etwas ändern? Schreib uns an ' : 'Want to change something? Write to us at '}
                <a href={foryouMailto} className="underline underline-offset-2">info@emilialab.com</a>
              </p>
            )}
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
