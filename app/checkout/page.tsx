"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ChevronRight, ChevronDown, X, Gift, Plus, ShoppingBag, Truck } from "lucide-react"
import { useCart, productSlugForItem } from "@/contexts/CartContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { VisaIcon, MastercardIcon, ApplePayIcon, TwintIcon } from "@/components/icons/PaymentIcons"
import Navbar from "@/components/Navbar"
import PriceDisplay from "@/components/PriceDisplay"
import DeliveryPicker from "@/components/checkout/DeliveryPicker"
import CartSizeToggle from "@/components/cart/CartSizeToggle"
import QuantityStepper from "@/components/cart/QuantityStepper"
import { loadStripe } from "@stripe/stripe-js"
import { stripeAppearance } from "@/lib/stripe-appearance"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import {
  firstBookableDate,
  firstBookableSlot,
  isDateBookable,
  isSlotBookable,
} from "@/lib/delivery-dates"
import { computeOrderTotals, isKnownDiscountCode, normalizeDiscountCode } from "@/lib/pricing"
import { readConsent, trackCheckoutStep, trackEvent, type CheckoutStep } from "@/lib/tracking"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')


// For You is available for gift orders.
const SHOW_GIFT_OPTION = true

const FORM_STORAGE_KEY = 'emilia-checkout-form'
// The PaymentIntent this tab is paying. /payment-success clears it once paid.
const PAYMENT_STORAGE_KEY = 'emilia-payment-intent'
const PAID_STATUSES = new Set(['succeeded', 'processing', 'requires_capture'])
// Also enforced by the payment API (Stripe metadata values are limited).
const DELIVERY_NOTE_MAX = 200

type StoredPaymentIntent = { id: string; clientSecret: string; order: string }

function readStoredPaymentIntent(): StoredPaymentIntent | null {
  try {
    const stored = JSON.parse(sessionStorage.getItem(PAYMENT_STORAGE_KEY) || 'null')
    return stored?.id && stored?.clientSecret ? stored : null
  } catch {
    return null
  }
}

function successUrl(id: string, clientSecret: string) {
  return `/payment-success?payment_intent=${encodeURIComponent(id)}&payment_intent_client_secret=${encodeURIComponent(clientSecret)}`
}

const STEP_NAMES: Record<1 | 2 | 3, CheckoutStep> = { 1: 'date', 2: 'details', 3: 'payment' }

function PaymentForm({ amount }: { amount: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const router = useRouter()
  const { t } = useLanguage()
  const c = t.checkout

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements || isProcessing) {
      return
    }

    setIsProcessing(true)
    setErrorMessage("")
    trackEvent('checkout_pay_click')

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      })

      if (error) {
        // A second tap on an intent that was already paid: show the order, not an error.
        const intent = (error as any).payment_intent
        if (intent?.id && intent?.client_secret && PAID_STATUSES.has(intent.status)) {
          router.replace(successUrl(intent.id, intent.client_secret))
          return
        }
        setErrorMessage(error.message || c.paymentError)
        setIsProcessing(false)
      }
    } catch (err: any) {
      setErrorMessage(err.message || c.unexpectedError)
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      {/* En móvil el botón vive pegado abajo: el PaymentElement es alto y el CTA
          quedaba fuera de pantalla justo en el momento de pagar. */}
      <div className="sticky bottom-0 -mx-4 border-t border-gray-200 bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-10px_28px_-20px_rgba(0,0,0,0.45)] lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:pt-0 lg:pb-0 lg:shadow-none">
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full bg-black text-white py-4 rounded-lg font-black text-base tracking-tight transition-[background-color,transform] duration-150 hover:bg-gray-900 active:bg-gray-800 active:scale-[0.99] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isProcessing ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {c.processing}
            </span>
          ) : (
            <span className="inline-flex items-center justify-center gap-2">
              {c.payNow}
              <span className="opacity-40">·</span>
              <PriceDisplay amount={amount} className="text-base font-black" currencyClassName="text-[0.5em] opacity-90" />
            </span>
          )}
        </button>
      </div>
    </form>
  )
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { cartItems, totalPrice, removeItem, addToCart, updateQuantity, updateSize } = useCart()
  const { locale, t } = useLanguage()
  const c = t.checkout
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [recipientFirstName, setRecipientFirstName] = useState("")
  const [recipientLastName, setRecipientLastName] = useState("")
  const [recipientIsCompany, setRecipientIsCompany] = useState(false)
  const [recipientCompany, setRecipientCompany] = useState("")
  const [recipientPhone, setRecipientPhone] = useState("")
  const [deliveryNote, setDeliveryNote] = useState("")
  const [newsletter, setNewsletter] = useState(false)
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null)
  const [deliveryTime, setDeliveryTime] = useState("")
  // Delivery comes first: buyers used to type their whole address and only then
  // find out the date they needed was taken. 1 = delivery, 2 = details, 3 = payment.
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [clientSecret, setClientSecret] = useState<string>("")
  // What Stripe will charge, as the API computed it; the pay button shows this.
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [isGift, setIsGift] = useState(false)
  const [upsellAdded, setUpsellAdded] = useState(false)
  const [postalCodeError, setPostalCodeError] = useState("")
  const [discountCodeInput, setDiscountCodeInput] = useState("")
  const [appliedDiscountCode, setAppliedDiscountCode] = useState("")
  const [discountCodeError, setDiscountCodeError] = useState("")
  const [formError, setFormError] = useState("")
  const [missingFields, setMissingFields] = useState<Set<string>>(new Set())
  const [deliveryError, setDeliveryError] = useState("")
  const [paymentInitError, setPaymentInitError] = useState("")
  // Amber notice at the top of the details step (payment not completed, order changed).
  const [notice, setNotice] = useState("")
  // Loading del paso 2: crear el PaymentIntent tarda >1s; sin esto el botón
  // parecía muerto y un doble toque creaba dos pagos.
  const [isInitializingPayment, setIsInitializingPayment] = useState(false)
  // Mobile-only: the order summary column sits below the form, so surface a collapsible
  // recap above it instead of making people scroll past everything to see the total.
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false)
  // State, not a ref: the save effect must wait for the render that carries the
  // restored values. With a ref it ran in the same commit and stored the empty form.
  const [formRestored, setFormRestored] = useState(false)
  const forYouIntentRef = useRef(false)

  // Allowed postal codes: Zürich agglomeration + Baden (AG)
  const allowedPostalCodes = new Set([
    "8000", "8001", "8002", "8003", "8004", "8005", "8006", "8008", "8010", "8012",
    "8021", "8022", "8024", "8027", "8031", "8032", "8034", "8036", "8037", "8038",
    "8040", "8041", "8042", "8044", "8045", "8046", "8047", "8048", "8049", "8050",
    "8051", "8052", "8053", "8055", "8057", "8058", "8060", "8063", "8064", "8070",
    "8071", "8074", "8075", "8080", "8081", "8085", "8086", "8087", "8088", "8090",
    "8091", "8092", "8093", "8096", "8098", "8099", "8102", "8103", "8104", "8105",
    "8106", "8117", "8118", "8121", "8122", "8123", "8125", "8126", "8127", "8134",
    "8135", "8142", "8143", "8152", "8153", "8302", "8303", "8304", "8305", "8306",
    "8600", "8602", "8603", "8700", "8702", "8703", "8802", "8901",
    "8902", "8903", "8904", "8905", "8906", "8907", "8951", "8952", "8953", "8954", "8955", "8956", "8957",
    "5400", "5401", "5404", "5405", "5406", "5408"
  ])

  const isPostalCodeValid = (code: string) => allowedPostalCodes.has(code.trim())

  // Meta Pixel: InitiateCheckout
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).fbq && cartItems.length > 0) {
      ;(window as any).fbq('track', 'InitiateCheckout', {
        content_ids: cartItems.map(item => item.name),
        num_items: cartItems.length,
        value: totalPrice,
        currency: 'CHF',
      })
    }
  }, [])

  // Errores JS del navegador (p. ej. "Java object is gone" del WebView de Instagram)
  // → /api/client-error → Telegram. Antes solo se veían como "sesiones atascadas"
  // en las grabaciones de Clarity, sin saber qué fallaba.
  useEffect(() => {
    const report = (message: string, source?: string, line?: number) => {
      // "Script error." es el error enmascarado que dan los scripts de terceros
      // (Stripe, Clarity, Google) en WebViews: no dice nada y solo genera ruido.
      if (!message || message === 'Script error.' || message === 'Script error') return
      try {
        const body = JSON.stringify({ message, source, line, url: location.pathname, ua: navigator.userAgent })
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/client-error', new Blob([body], { type: 'application/json' }))
        } else {
          fetch('/api/client-error', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true })
        }
      } catch { }
    }
    const onError = (e: ErrorEvent) => report(e.message, e.filename, e.lineno)
    const onRejection = (e: PromiseRejectionEvent) => report('unhandledrejection: ' + String((e.reason as any)?.message || e.reason).slice(0, 200))
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  // "Ahora" vivo: una pestaña que lleva horas abierta seguiría midiendo la antelación
  // desde el momento de carga, así que lo refrescamos hasta llegar al pago.
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    if (step === 3) return
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [step])

  // Restaurar el formulario guardado (p. ej. al volver de un pago TWINT cancelado)
  // y preseleccionar la primera fecha y franja libres.
  useEffect(() => {
    const current = new Date()
    const returningFromPayment = searchParams.get('payment') === 'failed'
    let restoredDate: Date | null = null
    let restoredSlot = ""
    try {
      const raw = sessionStorage.getItem(FORM_STORAGE_KEY)
      if (raw) {
        const d = JSON.parse(raw)
        if (d.email) setEmail(d.email)
        if (d.phone) setPhone(d.phone)
        if (d.firstName) setFirstName(d.firstName)
        if (d.lastName) setLastName(d.lastName)
        if (d.address) setAddress(d.address)
        if (d.city) setCity(d.city)
        if (d.postalCode) setPostalCode(d.postalCode)
        if (d.recipientFirstName) setRecipientFirstName(d.recipientFirstName)
        if (d.recipientLastName) setRecipientLastName(d.recipientLastName)
        if (typeof d.recipientIsCompany === 'boolean') setRecipientIsCompany(d.recipientIsCompany)
        if (d.recipientCompany) setRecipientCompany(d.recipientCompany)
        if (d.recipientPhone) setRecipientPhone(d.recipientPhone)
        if (d.deliveryNote) setDeliveryNote(d.deliveryNote)
        if (typeof d.newsletter === 'boolean') setNewsletter(d.newsletter)
        if (typeof d.isGift === 'boolean') setIsGift(d.isGift)
        if (d.appliedDiscountCode) {
          setAppliedDiscountCode(d.appliedDiscountCode)
          setDiscountCodeInput(d.appliedDiscountCode)
        }
        if (d.deliveryDate) {
          const date = new Date(d.deliveryDate)
          if (!isNaN(date.getTime()) && d.deliveryTime && isSlotBookable(date, d.deliveryTime, current) && isDateBookable(date, current)) {
            restoredDate = date
            restoredSlot = d.deliveryTime
          }
        }
      }
    } catch { }

    // Most buyers take the earliest day, so it comes preselected with its first
    // slot. The one exception: a buyer back from a failed payment whose slot has
    // expired meanwhile is not moved to another day silently; they pick again.
    const slotLost = returningFromPayment && !restoredDate
    if (!restoredDate && !slotLost) {
      restoredDate = firstBookableDate(current)
      restoredSlot = restoredDate ? firstBookableSlot(restoredDate, current) ?? "" : ""
    }
    setDeliveryDate(restoredDate)
    setDeliveryTime(restoredSlot)
    if (slotLost) setDeliveryError(c.slotExpired)

    // Intent de la sección For You ("Nachricht senden" → /bestellen?foryou=1):
    // el checkout abre ya con la opción de regalo activa. Es de un solo uso.
    // Va por ref: StrictMode ejecuta el efecto dos veces y en la segunda
    // pasada el flag ya no está, pero el restore podría pisar el valor.
    if (sessionStorage.getItem('emilia-foryou-intent')) {
      sessionStorage.removeItem('emilia-foryou-intent')
      forYouIntentRef.current = true
    }
    if (forYouIntentRef.current) setIsGift(true)

    if (returningFromPayment) {
      setNotice(c.paymentFailedNotice)
      // Straight back to the step before payment, unless the slot has to be picked again.
      setStep(slotLost ? 1 : 2)
      router.replace('/checkout', { scroll: false })
    }

    setFormRestored(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Guardar el formulario para que sobreviva a la redirección de TWINT
  useEffect(() => {
    if (!formRestored) return
    try {
      sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify({
        email, phone, firstName, lastName, address, city, postalCode,
        isGift, recipientFirstName, recipientLastName, recipientIsCompany, recipientCompany, recipientPhone, appliedDiscountCode,
        deliveryNote, newsletter,
        deliveryDate: deliveryDate ? deliveryDate.toISOString() : null,
        deliveryTime,
      }))
    } catch { }
  }, [formRestored, email, phone, firstName, lastName, address, city, postalCode, isGift, recipientFirstName, recipientLastName, recipientIsCompany, recipientCompany, recipientPhone, appliedDiscountCode, deliveryNote, newsletter, deliveryDate, deliveryTime])

  // Si el reloj avanza mientras el checkout está abierto, lo ya elegido puede dejar de
  // cumplir la antelación. Lo soltamos y lo decimos, en vez de dejar pagar algo imposible.
  useEffect(() => {
    if (step === 3 || !deliveryDate) return
    if (!isDateBookable(deliveryDate, now)) {
      setDeliveryDate(null)
      setDeliveryTime("")
      setDeliveryError(c.slotExpired)
    } else if (deliveryTime && !isSlotBookable(deliveryDate, deliveryTime, now)) {
      setDeliveryTime("")
      setDeliveryError(c.slotExpired)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, deliveryDate, deliveryTime, step])

  const { shipping: shippingCost, discount, discountRate, total: finalPrice, promoCodeApplied: hasCodeDiscount } =
    computeOrderTotals(totalPrice, appliedDiscountCode)
  const discountLabel = `${Math.round(discountRate * 100)}% Rabatt${hasCodeDiscount ? ' (HolaSwitzerland)' : ''}`

  // Everything the charged amount depends on. If it changes while the payment
  // form is open (a code applied, a cake added), that PaymentIntent is stale.
  const pricingKey = JSON.stringify([
    cartItems.map(item => [item.id, item.quantity, item.price]),
    normalizeDiscountCode(appliedDiscountCode),
  ])
  // Identifies this order, to tell "already paid" apart from a new order in the same tab.
  const orderKey = JSON.stringify([pricingKey, deliveryDate?.toDateString() ?? null, deliveryTime, postalCode.trim(), address.trim()])
  const pricingKeyAtPaymentRef = useRef("")
  const orderKeyRef = useRef(orderKey)
  orderKeyRef.current = orderKey

  useEffect(() => {
    if (step !== 3 || !pricingKeyAtPaymentRef.current || pricingKeyAtPaymentRef.current === pricingKey) return
    setClientSecret("")
    setStep(2)
    setNotice(c.orderChanged)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricingKey, step])

  // TWINT hands the buyer back through several apps; some returned to this page
  // (back button, restored tab) after paying and tapped "pay" again. If this
  // tab's payment went through, show the confirmation instead of the form.
  useEffect(() => {
    let cancelled = false
    const checkPaid = async () => {
      const stored = readStoredPaymentIntent()
      if (!stored) return
      try {
        const stripe = await stripePromise
        if (!stripe || cancelled) return
        const { paymentIntent } = await stripe.retrievePaymentIntent(stored.clientSecret)
        if (cancelled || !paymentIntent || !PAID_STATUSES.has(paymentIntent.status)) return
        if (stored.order === orderKeyRef.current) {
          router.replace(successUrl(stored.id, stored.clientSecret))
        } else {
          // Paid, but this is a different order: start fresh.
          sessionStorage.removeItem(PAYMENT_STORAGE_KEY)
        }
      } catch { }
    }
    checkPaid()
    const onPageShow = (e: PageTransitionEvent) => { if (e.persisted) checkPaid() }
    window.addEventListener('pageshow', onPageShow)
    return () => {
      cancelled = true
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [router])

  const handleAddUpsellProduct = () => {
    const upsellProduct = {
      id: `clasica-upsell-${Date.now()}`,
      name: "CLASSIC",
      price: 14.31, // Discounted upsell price (10% off 15.90)
      size: "2-3",
      image: "/original3.jpeg",
      quantity: 1
    }
    addToCart(upsellProduct)
    setUpsellAdded(true)
  }

  const handleDeliveryChange = (date: Date, slot: string) => {
    setDeliveryDate(date)
    setDeliveryTime(slot)
    setDeliveryError("")
  }

  // Revalidar contra la hora actual: entre elegir la entrega y continuar puede
  // haberse cruzado el límite de antelación.
  const deliveryStillBookable = () => {
    const current = new Date()
    setNow(current)
    if (!deliveryDate || !deliveryTime) {
      setDeliveryError(c.deliveryError)
      return false
    }
    if (!isDateBookable(deliveryDate, current) || !isSlotBookable(deliveryDate, deliveryTime, current)) {
      if (!isDateBookable(deliveryDate, current)) setDeliveryDate(null)
      setDeliveryTime("")
      setDeliveryError(c.slotExpired)
      return false
    }
    return true
  }

  const handleContinueToDetails = (e: React.FormEvent) => {
    e.preventDefault()
    if (!deliveryStillBookable()) return
    setDeliveryError("")
    setStep(2)
  }

  const handleContinueToPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isInitializingPayment) return

    // El navegador interno de Instagram (Android) a veces autocompleta los campos
    // sin disparar onChange: el input se ve lleno pero el estado está vacío y la
    // validación marcaba como vacíos campos que el cliente veía rellenos. Antes de
    // validar leemos el DOM como respaldo y sincronizamos el estado.
    const formEl = e.currentTarget as HTMLFormElement
    const dom = (name: string) =>
      (formEl?.querySelector(`input[name="${name}"]`) as HTMLInputElement | null)?.value.trim() || ''
    if (!email && dom('email')) setEmail(dom('email'))
    if (!phone && dom('phone')) setPhone(dom('phone'))
    if (!firstName && dom('firstName')) setFirstName(dom('firstName'))
    if (!lastName && dom('lastName')) setLastName(dom('lastName'))
    if (!address && dom('address')) setAddress(dom('address'))
    if (!city && dom('city')) setCity(dom('city'))
    if (!postalCode && dom('postalCode')) setPostalCode(dom('postalCode'))
    if (isGift && !recipientIsCompany && !recipientFirstName && dom('recipientFirstName')) setRecipientFirstName(dom('recipientFirstName'))
    if (isGift && !recipientIsCompany && !recipientLastName && dom('recipientLastName')) setRecipientLastName(dom('recipientLastName'))
    if (isGift && recipientIsCompany && !recipientCompany && dom('recipientCompany')) setRecipientCompany(dom('recipientCompany'))

    // The state updates above land after this handler, so the request uses these.
    const vEmail = email.trim() || dom('email')
    const vPhone = phone.trim() || dom('phone')
    const vFirstName = firstName.trim() || dom('firstName')
    const vLastName = lastName.trim() || dom('lastName')
    const vAddress = address.trim() || dom('address')
    const vCity = city.trim() || dom('city')
    const vPostalCode = postalCode.trim() || dom('postalCode')
    const vRecipientCompany = recipientCompany.trim() || dom('recipientCompany')
    const vRecipientFirstName = recipientFirstName.trim() || dom('recipientFirstName')
    const vRecipientLastName = recipientLastName.trim() || dom('recipientLastName')

    const missing = new Set<string>()
    if (!vEmail) missing.add("email")
    if (!vFirstName) missing.add("firstName")
    if (!vLastName) missing.add("lastName")
    if (!vAddress) missing.add("address")
    if (!vCity) missing.add("city")
    if (!vPostalCode) missing.add("postalCode")
    if (isGift && recipientIsCompany && !vRecipientCompany) missing.add("recipientCompany")
    if (isGift && !recipientIsCompany && !vRecipientFirstName) missing.add("recipientFirstName")
    if (isGift && !recipientIsCompany && !vRecipientLastName) missing.add("recipientLastName")
    setMissingFields(missing)

    if (missing.size > 0) {
      setFormError(c.formError)
      // Scroll first missing field into view
      requestAnimationFrame(() => {
        const first = document.querySelector('[data-error="true"]') as HTMLElement | null
        first?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        first?.focus?.()
      })
      return
    }

    // Validate postal code is within delivery area
    if (!isPostalCodeValid(vPostalCode)) {
      setPostalCodeError(c.postalCodeError)
      setFormError("")
      return
    }

    setPostalCodeError("")
    setFormError("")
    setMissingFields(new Set())

    // The slot may have expired while the buyer was typing: back to the delivery step.
    if (!deliveryStillBookable() || !deliveryDate) {
      setStep(1)
      return
    }

    setPaymentInitError("")
    setIsInitializingPayment(true)

    const stored = readStoredPaymentIntent()
    const submittedOrderKey = JSON.stringify([pricingKey, deliveryDate.toDateString(), deliveryTime, vPostalCode, vAddress])
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderData: {
            email: vEmail,
            phone: vPhone,
            firstName: vFirstName,
            lastName: vLastName,
            address: vAddress,
            city: vCity,
            postalCode: vPostalCode,
            isGift,
            recipientName: isGift
              ? recipientIsCompany
                ? vRecipientCompany
                : [vRecipientFirstName, vRecipientLastName].filter(Boolean).join(' ')
              : '',
            recipientIsCompany: isGift && recipientIsCompany ? 'yes' : '',
            recipientPhone: isGift ? recipientPhone.trim() : '',
            deliveryDate: deliveryDate.toLocaleDateString('de-CH'),
            deliveryTime,
            discountCode: appliedDiscountCode,
            subtotal: totalPrice,
            trackingConsent: readConsent() ?? 'unset',
            deliveryNote: deliveryNote.trim(),
            newsletter,
            items: cartItems.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              size: item.size
            })),
          },
          // The server cancels it (or recognises it as paid) before creating a new one.
          previousPaymentIntent: stored
            ? { id: stored.id, clientSecret: stored.clientSecret, sameOrder: stored.order === submittedOrderKey }
            : undefined,
        }),
      })

      const data = await response.json()

      if (data.alreadyPaid && data.paymentIntentId && data.clientSecret) {
        router.replace(successUrl(data.paymentIntentId, data.clientSecret))
        return
      }
      if (data.code === 'DELIVERY_DATE_UNAVAILABLE') {
        setDeliveryDate(null)
        setDeliveryTime("")
        setDeliveryError(c.dateUnavailable)
        setStep(1)
      } else if (data.code === 'DELIVERY_SLOT_UNAVAILABLE') {
        setDeliveryTime("")
        setDeliveryError(c.slotExpired)
        setStep(1)
      } else if (data.clientSecret) {
        const amount = typeof data.amount === 'number' ? data.amount : finalPrice
        try {
          sessionStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify({
            id: data.paymentIntentId,
            clientSecret: data.clientSecret,
            order: submittedOrderKey,
          }))
        } catch { }
        // Store order value for Google Ads conversion tracking
        localStorage.setItem('emilia-order-value', amount.toString())
        pricingKeyAtPaymentRef.current = pricingKey
        setPaymentAmount(amount)
        setClientSecret(data.clientSecret)
        setNotice("")
        setStep(3)
      } else {
        setPaymentInitError(c.paymentInitError)
      }
    } catch (error) {
      console.error('Error:', error)
      setPaymentInitError(c.paymentInitError)
    } finally {
      setIsInitializingPayment(false)
    }
  }

  const goToStep = (target: 1 | 2) => {
    setClientSecret("")
    setStep(target)
  }

  // One Clarity event per step reached, to read the funnel without recordings.
  // On a full page load the cart arrives a render later, hence the length dep.
  const trackedStepRef = useRef(0)
  useEffect(() => {
    if (cartItems.length === 0 || trackedStepRef.current === step) return
    trackedStepRef.current = step
    trackCheckoutStep(STEP_NAMES[step])
  }, [step, cartItems.length])

  // Al cambiar de paso el móvil se quedaba a media página: se pulsa el botón de abajo
  // y el paso nuevo aparece por encima de donde está mirando el usuario.
  const stepTopRef = useRef<HTMLDivElement>(null)
  const previousStepRef = useRef(step)
  useEffect(() => {
    if (previousStepRef.current === step) return
    previousStepRef.current = step
    stepTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [step])

  const dateLocale = locale === 'en' ? 'en-GB' : 'de-CH'
  const deliverySummary = deliveryDate
    ? `${deliveryDate.toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long' })}${deliveryTime ? ` · ${deliveryTime}` : ''}`
    : ''

  // Every field has a visible label. Placeholders alone vanished while typing
  // and were cut off in the half-width recipient fields ("Vorname des Emp…").
  const clearMissing = (field: string) => {
    if (!missingFields.has(field)) return
    const m = new Set(missingFields)
    m.delete(field)
    setMissingFields(m)
  }
  const inputClass = (field?: string, extraError = false) =>
    `w-full border rounded-lg px-4 py-3 text-base placeholder:text-gray-400 focus:outline-none ${(field && missingFields.has(field)) || extraError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-black'}`
  const fieldLabel = (htmlFor: string, text: string) => (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-gray-800">{text}</label>
  )

  // Nombre y apellidos del comprador. En un pedido normal van dentro de la dirección
  // de entrega (comprador = destinatario); en un regalo suben a "Deine Daten", porque
  // la dirección pasa a ser la de quien recibe.
  const nameFields = (
    <div className="grid grid-cols-2 gap-4">
      <div>
        {fieldLabel('firstName', c.labelFirstName)}
        <input
          id="firstName"
          type="text"
          name="firstName"
          value={firstName}
          onChange={(e) => { setFirstName(e.target.value); clearMissing('firstName') }}
          data-error={missingFields.has('firstName')}
          autoComplete="given-name"
          autoCapitalize="words"
          className={inputClass('firstName')}
          required
        />
      </div>
      <div>
        {fieldLabel('lastName', c.labelLastName)}
        <input
          id="lastName"
          type="text"
          name="lastName"
          value={lastName}
          onChange={(e) => { setLastName(e.target.value); clearMissing('lastName') }}
          data-error={missingFields.has('lastName')}
          autoComplete="family-name"
          autoCapitalize="words"
          className={inputClass('lastName')}
          required
        />
      </div>
    </div>
  )

  // Quien recibe el regalo: va junto a la dirección de entrega, que es la suya.
  // Puede ser una persona o una empresa (p. ej. una tarta para la oficina).
  const recipientFields = (
    <>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1">
        {([
          { company: false, label: c.recipientPerson },
          { company: true, label: c.recipientCompany },
        ] as const).map(({ company, label }) => (
          <button
            key={label}
            type="button"
            onClick={() => setRecipientIsCompany(company)}
            aria-pressed={recipientIsCompany === company}
            className={`rounded-md px-3 py-2 text-sm font-bold transition-colors ${recipientIsCompany === company ? 'bg-white text-[#651A1A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {recipientIsCompany ? (
        <div>
          {fieldLabel('recipientCompany', c.labelCompany)}
          <input
            id="recipientCompany"
            type="text"
            name="recipientCompany"
            value={recipientCompany}
            onChange={(e) => { setRecipientCompany(e.target.value); clearMissing('recipientCompany') }}
            data-error={missingFields.has('recipientCompany')}
            autoComplete="organization"
            autoCapitalize="words"
            className={inputClass('recipientCompany')}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            {fieldLabel('recipientFirstName', c.labelFirstName)}
            <input
              id="recipientFirstName"
              type="text"
              name="recipientFirstName"
              value={recipientFirstName}
              onChange={(e) => { setRecipientFirstName(e.target.value); clearMissing('recipientFirstName') }}
              data-error={missingFields.has('recipientFirstName')}
              autoComplete="off"
              autoCapitalize="words"
              className={inputClass('recipientFirstName')}
            />
          </div>
          <div>
            {fieldLabel('recipientLastName', c.labelLastName)}
            <input
              id="recipientLastName"
              type="text"
              name="recipientLastName"
              value={recipientLastName}
              onChange={(e) => { setRecipientLastName(e.target.value); clearMissing('recipientLastName') }}
              data-error={missingFields.has('recipientLastName')}
              autoComplete="off"
              autoCapitalize="words"
              className={inputClass('recipientLastName')}
            />
          </div>
        </div>
      )}

      <div>
        {fieldLabel('recipientPhone', c.labelRecipientPhone)}
        <input
          id="recipientPhone"
          type="tel"
          value={recipientPhone}
          onChange={(e) => setRecipientPhone(e.target.value)}
          autoComplete="off"
          inputMode="tel"
          placeholder={c.phonePlaceholder}
          className={inputClass()}
        />
        <p className="mt-1.5 text-xs text-gray-500 leading-snug">{c.recipientPhoneHint}</p>
      </div>
    </>
  )

  // El código de descuento y la oferta viven en la columna derecha, que en móvil se
  // apila debajo y duplicaba todo el resumen. Los reutilizamos en los dos sitios.
  const discountCodeBlock = (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={c.discountCodePlaceholder}
          value={discountCodeInput}
          onChange={(e) => {
            setDiscountCodeInput(e.target.value)
            setDiscountCodeError("")
          }}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="flex-1 min-w-0 border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-black"
        />
        <button
          type="button"
          onClick={() => {
            if (!normalizeDiscountCode(discountCodeInput)) {
              setAppliedDiscountCode("")
              setDiscountCodeError("")
              return
            }
            if (isKnownDiscountCode(discountCodeInput)) {
              setAppliedDiscountCode(discountCodeInput.trim())
              setDiscountCodeError("")
            } else {
              setAppliedDiscountCode("")
              setDiscountCodeError(c.invalidCode)
            }
          }}
          className="shrink-0 whitespace-nowrap px-4 py-3 bg-gray-100 text-gray-600 rounded-lg font-bold text-sm transition-colors hover:bg-gray-200 active:bg-gray-300"
        >
          {c.applyCode}
        </button>
      </div>
      {discountCodeError && (
        <p className="text-sm text-red-600 mt-2">{discountCodeError}</p>
      )}
    </div>
  )

  const paymentIcons = (
    <div className="flex items-center gap-2 flex-wrap">
      <VisaIcon className="h-7 w-auto" />
      <MastercardIcon className="h-7 w-auto" />
      <ApplePayIcon className="h-7 w-auto" />
      <TwintIcon className="h-7 w-auto" />
    </div>
  )

  // Quiet, on-brand offer: it sits right before the pay button, so it should
  // not shout (it used to be a pink "limited time!" box).
  const upsellBlock = (
    <div className="flex items-center gap-3 rounded-xl border border-[#E6D5C0] bg-[#FFFCF8] p-3">
      <img
        src="/original3.jpeg"
        alt="CLASSIC 2–3"
        className="h-12 w-12 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[#651A1A]">{c.upsellTitle}</p>
        <p className="text-xs text-gray-600">{c.upsellItem}</p>
        <p className="mt-0.5 text-sm">
          <span className="font-bold whitespace-nowrap"><PriceDisplay amount={14.31} showCurrency={false} className="text-sm" /> CHF</span>{" "}
          <span className="text-gray-400 line-through whitespace-nowrap"><PriceDisplay amount={15.90} showCurrency={false} className="text-xs" /></span>
        </p>
      </div>
      <button
        type="button"
        onClick={handleAddUpsellProduct}
        aria-label={`${c.upsellAdd}: ${c.upsellItem}`}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#651A1A] text-[#651A1A] transition-colors hover:bg-[#651A1A] hover:text-white active:bg-[#651A1A] active:text-white"
      >
        <Plus className="h-4 w-4" strokeWidth={2.25} />
      </button>
    </div>
  )

  // Size and quantity can be changed right here: buyers used to leave the
  // checkout (or start over) just to switch a cake from 8-10 to 2-3.
  const orderLines = (thumbClass: string) => (
    <div className="space-y-5">
      {cartItems.map((item) => {
        const slug = productSlugForItem(item)
        return (
          <div key={item.id} className="flex gap-3">
            <div className={`${thumbClass} bg-[#F5E6D3] rounded-lg overflow-hidden flex-shrink-0`}>
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-sm truncate">{item.name}</p>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={t.cart.remove}
                  className="-m-1.5 p-1.5 text-gray-300 transition-colors hover:text-black"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
              {slug ? (
                <CartSizeToggle
                  size={item.size}
                  onChange={(size) => updateSize(item.id, size)}
                  personsLabel={c.persons}
                  className="mt-1.5"
                />
              ) : (
                <p className="text-xs text-gray-600">{item.size} {c.persons}</p>
              )}
              <div className="mt-2 flex items-center justify-between gap-2">
                {slug ? (
                  <QuantityStepper
                    quantity={item.quantity}
                    onChange={(quantity) => updateQuantity(item.id, quantity)}
                    onRemove={() => removeItem(item.id)}
                    labels={t.cart}
                    size="sm"
                  />
                ) : (
                  <p className="text-xs text-gray-900 font-bold">{c.qty} {item.quantity}</p>
                )}
                <PriceDisplay amount={item.price * item.quantity} className="text-sm font-bold" currencyClassName="text-[0.6em] opacity-80" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar minimal />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-black mb-4">{c.emptyCart}</h1>
          <Link href="/" className="text-black underline font-bold">
            {c.continueShopping}
          </Link>
        </div>
      </div>
    )
  }

  const stepLabels = [c.deliveryTitle, c.breadcrumbDetails, c.breadcrumbPayment]

  const errorAlert = (message: string) => (
    <div role="alert" aria-live="polite" className="mb-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>{message}</span>
    </div>
  )

  const stickyBar = "sticky bottom-0 -mx-4 mt-4 border-t border-gray-200 bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-10px_28px_-20px_rgba(0,0,0,0.45)] lg:static lg:mx-0 lg:mt-6 lg:border-0 lg:bg-transparent lg:px-0 lg:pt-0 lg:pb-0 lg:shadow-none"
  const primaryButton = "w-full bg-black text-white py-4 rounded-lg font-black text-base tracking-tight transition-[background-color,transform] duration-150 hover:bg-gray-900 active:bg-gray-800 active:scale-[0.99] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:active:scale-100"

  return (
    <div className="min-h-screen bg-white">
      <Navbar minimal />

      <div className="container mx-auto px-4 py-8">
        <div ref={stepTopRef} className="scroll-mt-24" />

        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-sm mb-8">
          <Link href="/" className="text-pink-500 hover:underline">{c.breadcrumbCart}</Link>
          {stepLabels.map((label, i) => {
            const target = (i + 1) as 1 | 2 | 3
            const canGoBack = target < step
            return (
              <span key={label} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                {canGoBack ? (
                  <button type="button" onClick={() => goToStep(target as 1 | 2)} className="text-gray-600 hover:text-black hover:underline">
                    {label}
                  </button>
                ) : (
                  <span className={target === step ? "text-gray-900 font-medium" : "text-gray-400"}>{label}</span>
                )}
              </span>
            )
          })}
        </div>

        {/* En móvil no había breadcrumb: no se sabía cuánto quedaba para terminar.
            Los pasos ya completados se pueden tocar para volver atrás. */}
        <div className="md:hidden mb-6 flex items-start gap-2">
          {stepLabels.map((label, i) => {
            const target = (i + 1) as 1 | 2 | 3
            const reached = target <= step
            const canGoBack = target < step
            return (
              <button
                key={label}
                type="button"
                onClick={canGoBack ? () => goToStep(target as 1 | 2) : undefined}
                aria-current={target === step ? 'step' : undefined}
                className={`flex-1 text-left ${canGoBack ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div
                  className={`h-1 rounded-full transition-colors duration-300 ${reached ? 'bg-[#651A1A]' : 'bg-gray-200'}`}
                />
                <p
                  className={`mt-2 text-[0.7rem] font-bold leading-tight tracking-wide transition-colors duration-300 ${target === step ? 'text-[#651A1A]' : reached ? 'text-gray-500' : 'text-gray-300'} ${canGoBack ? 'underline underline-offset-2 decoration-gray-300' : ''}`}
                >
                  {label}
                </p>
              </button>
            )
          })}
        </div>

        {/* Mobile order recap - the full summary column below is lg-only in practice */}
        <div className="lg:hidden -mx-4 mb-6 border-y border-gray-200 bg-[#FDFBF7]">
          <button
            type="button"
            onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
            aria-expanded={isMobileSummaryOpen}
            className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left transition-colors active:bg-[#F7F1E8]"
          >
            <span className="flex items-center gap-2 text-sm font-bold text-[#651A1A]">
              <ShoppingBag className="w-4 h-4" strokeWidth={2} />
              {c.orderSummary}
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${isMobileSummaryOpen ? 'rotate-180' : ''}`}
              />
            </span>
            <PriceDisplay amount={finalPrice} className="text-lg font-black" currencyClassName="text-[0.55em] opacity-80" />
          </button>

          {isMobileSummaryOpen && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-200 pt-4">
              {orderLines("w-14 h-14")}
              <div className="flex justify-between text-sm pt-3 border-t border-gray-200">
                <span>{c.subtotal}</span>
                <PriceDisplay amount={totalPrice} className="text-sm font-bold" currencyClassName="text-[0.6em] opacity-80" />
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-700 font-bold">
                  <span>{discountLabel}</span>
                  <span className="flex items-center">
                    -<PriceDisplay amount={discount} className="text-sm font-bold" currencyClassName="text-[0.5em] opacity-80" />
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>{c.shipping}</span>
                {shippingCost === 0 ? (
                  <span className="text-green-600 font-bold">{c.free}</span>
                ) : (
                  <PriceDisplay amount={shippingCost} className="text-sm" />
                )}
              </div>
              <div className="flex justify-between text-base font-black border-t border-gray-200 pt-3">
                <span>{c.total}</span>
                <PriceDisplay
                  amount={finalPrice}
                  className={`text-lg font-black ${discount > 0 ? 'text-green-600' : ''}`}
                  currencyClassName="text-[0.5em] opacity-100"
                />
              </div>
              <div className="pt-1">{discountCodeBlock}</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Left Side - Form */}
          <div className="space-y-8">
            <div>
              {notice && step !== 3 && (
                <div role="alert" aria-live="polite" className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-lg text-sm flex items-start gap-2 mb-6">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{notice}</span>
                </div>
              )}

              {/* Paso 1: fecha y franja. También como <form> para que "enter"
                  del teclado confirme el paso. */}
              {step === 1 && (
                <form onSubmit={handleContinueToDetails}>
                  <h2 className="text-xl font-black mb-2">{c.deliveryQuestion}</h2>
                  <p className="text-sm text-gray-600 mb-6 flex items-start gap-2">
                    <svg className="w-5 h-5 text-[#651A1A] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{c.deliveryNotice}</span>
                  </p>

                  <DeliveryPicker
                    now={now}
                    locale={locale === 'en' ? 'en' : 'de'}
                    deliveryDate={deliveryDate}
                    deliveryTime={deliveryTime}
                    onChange={handleDeliveryChange}
                    labels={c}
                  />

                  <div className={stickyBar}>
                    {/* El error vive dentro de la barra sticky: fuera quedaba
                        tapado por la propia barra justo donde aparece. */}
                    {deliveryError && errorAlert(deliveryError)}
                    {deliverySummary && deliveryTime && (
                      <p className="mb-2 flex items-center gap-2 text-sm font-bold capitalize text-[#1a1a1a] lg:hidden">
                        <Truck className="h-4 w-4 shrink-0 text-[#651A1A]" strokeWidth={1.75} />
                        {deliverySummary}
                      </p>
                    )}
                    <button type="submit" className={primaryButton}>
                      {c.continueToDetails}
                    </button>
                  </div>
                </form>
              )}

              {/* Paso 2 (contacto + dirección) dentro de un <form>: la tecla
                  "ir/enter" del teclado móvil envía el paso en vez de no hacer nada. */}
              {step === 2 && (
                <form onSubmit={handleContinueToPayment} noValidate>
                  {/* La entrega ya elegida, a la vista y con vuelta atrás en un toque */}
                  <div className="mb-8 flex items-center gap-3 rounded-xl border border-[#E6D5C0] bg-[#FFFCF8] px-4 py-3">
                    <Truck className="h-5 w-5 shrink-0 text-[#651A1A]" strokeWidth={1.75} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.7rem] font-bold uppercase tracking-widest text-[#651A1A]">{c.deliveryTitle}</p>
                      <p className="text-sm font-bold capitalize text-[#1a1a1a]">{deliverySummary}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="shrink-0 rounded-md px-2 py-1 text-sm font-bold text-[#651A1A] underline underline-offset-2 hover:text-black"
                    >
                      {c.change}
                    </button>
                  </div>

                  {/* Gift option: one compact row. As a big card with a long paragraph
                      it pushed the form half a screen down for everyone who is not
                      buying a gift, which is most people. */}
                  {SHOW_GIFT_OPTION && (
                    <div className="mb-8">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isGift}
                        onClick={() => setIsGift(!isGift)}
                        className={`w-full text-left rounded-2xl border-2 px-4 py-3.5 transition-colors duration-200 ${isGift ? "border-[#651A1A] bg-[#F5E6D3]" : "border-gray-200 bg-white hover:border-[#651A1A]/40"}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${isGift ? "bg-[#651A1A] text-white" : "bg-[#FBF6EF] text-[#651A1A]"}`}>
                            <Gift className="h-5 w-5" strokeWidth={1.5} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[0.95rem] font-black tracking-tight text-[#1a1a1a]">{c.giftTitle}</span>
                            <span className="block text-xs leading-snug text-gray-600">{c.giftSubtitle}</span>
                          </span>
                          <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${isGift ? "bg-[#651A1A]" : "bg-gray-300"}`}>
                            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${isGift ? "left-6" : "left-1"}`} />
                          </span>
                        </div>
                        {isGift && (
                          <p className="mt-3 border-t border-[#651A1A]/15 pt-3 text-xs leading-relaxed text-[#651A1A]">
                            {c.giftActiveNote}
                          </p>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Contact Section */}
                  <div className="mb-8">
                    <div className="mb-4">
                      <h2 className="text-xl font-black">{isGift ? c.contactGift : c.contact}</h2>
                    </div>
                    <div className="space-y-4">
                      {/* En un regalo, el nombre de quien envía vive aquí, con su email y
                          teléfono — no en la dirección, que es del destinatario. */}
                      {isGift && nameFields}
                      <div>
                        {fieldLabel('email', c.labelEmail)}
                        <input
                          id="email"
                          type="email"
                          name="email"
                          placeholder={c.emailPlaceholder}
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); clearMissing('email') }}
                          data-error={missingFields.has('email')}
                          autoComplete="email"
                          inputMode="email"
                          autoCapitalize="off"
                          autoCorrect="off"
                          className={inputClass('email')}
                          required
                        />
                      </div>
                      <div>
                        {fieldLabel('phone', c.labelPhone)}
                        <input
                          id="phone"
                          type="tel"
                          name="phone"
                          placeholder={c.phonePlaceholder}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          autoComplete="tel"
                          inputMode="tel"
                          className={inputClass()}
                        />
                      </div>
                    </div>
                    {/* It used to be a checkbox that saved nothing: now the choice
                        travels with the order and shows up in the order notice. */}
                    <label className="flex items-center gap-2.5 mt-3 py-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newsletter}
                        onChange={(e) => setNewsletter(e.target.checked)}
                        className="h-5 w-5 shrink-0 cursor-pointer accent-[#651A1A]"
                      />
                      <span className="text-sm">{c.newsletter}</span>
                    </label>
                  </div>

                  {/* Shipping Address */}
                  <div className="mb-8">
                    <h2 className="text-xl font-black mb-4">{isGift ? c.deliveryAddressGift : c.deliveryAddress}</h2>

                    <div className="space-y-4">
                      {isGift && recipientFields}

                      {!isGift && nameFields}

                      <div>
                        {fieldLabel('address', c.labelAddress)}
                        <input
                          id="address"
                          type="text"
                          name="address"
                          placeholder={c.addressPlaceholder}
                          value={address}
                          onChange={(e) => { setAddress(e.target.value); clearMissing('address') }}
                          data-error={missingFields.has('address')}
                          autoComplete="street-address"
                          autoCapitalize="words"
                          className={inputClass('address')}
                          required
                        />
                      </div>

                      {/* PLZ before Ort, as on every Swiss address. */}
                      <div className="grid grid-cols-[7.5rem_1fr] gap-4">
                        <div>
                          {fieldLabel('postalCode', c.labelPostalCode)}
                          <input
                            id="postalCode"
                            type="text"
                            name="postalCode"
                            value={postalCode}
                            onChange={(e) => {
                              setPostalCode(e.target.value)
                              setPostalCodeError("")
                              clearMissing('postalCode')
                            }}
                            data-error={missingFields.has('postalCode') || !!postalCodeError}
                            autoComplete="postal-code"
                            inputMode="numeric"
                            maxLength={4}
                            className={inputClass('postalCode', !!postalCodeError)}
                            required
                          />
                        </div>
                        <div>
                          {fieldLabel('city', c.labelCity)}
                          <input
                            id="city"
                            type="text"
                            name="city"
                            value={city}
                            onChange={(e) => { setCity(e.target.value); clearMissing('city') }}
                            data-error={missingFields.has('city')}
                            autoComplete="address-level2"
                            autoCapitalize="words"
                            className={inputClass('city')}
                            required
                          />
                        </div>
                      </div>

                      {/* Solo se entrega en Suiza: el país es un dato, no un campo */}
                      <p className="px-1 text-sm text-gray-500">{c.country}</p>

                      {postalCodeError && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                          {postalCodeError}
                        </div>
                      )}

                      {/* Doorbell, floor, door code: in Zurich flats the courier needs
                          it, and a gift recipient is not waiting at the door. */}
                      <div>
                        {fieldLabel('deliveryNote', c.labelDeliveryNote)}
                        <input
                          id="deliveryNote"
                          type="text"
                          name="deliveryNote"
                          placeholder={c.deliveryNotePlaceholder}
                          value={deliveryNote}
                          onChange={(e) => setDeliveryNote(e.target.value)}
                          maxLength={DELIVERY_NOTE_MAX}
                          autoComplete="off"
                          className={inputClass()}
                        />
                      </div>
                    </div>
                  </div>

                  {/* En móvil la oferta y los métodos de pago vivían solo en la columna
                      derecha, que ahora está oculta. Los traemos al punto de decisión. */}
                  {!upsellAdded && <div className="lg:hidden mt-6">{upsellBlock}</div>}
                  <div className="lg:hidden mt-4 flex justify-center">{paymentIcons}</div>

                  <div className={stickyBar}>
                    {formError && errorAlert(formError)}
                    {!formError && paymentInitError && errorAlert(paymentInitError)}
                    <div className="mb-2 flex items-center justify-between lg:hidden">
                      <span className="text-sm text-gray-500">{c.total}</span>
                      <PriceDisplay
                        amount={finalPrice}
                        className={`text-base font-black ${discount > 0 ? 'text-green-600' : ''}`}
                        currencyClassName="text-[0.55em] opacity-80"
                      />
                    </div>
                    <button type="submit" disabled={isInitializingPayment} className={primaryButton}>
                      {isInitializingPayment ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          {c.processing}
                        </span>
                      ) : (
                        c.continueToPayment
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Payment Section */}
              {step === 3 && clientSecret && (
                <div>
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="text-sm text-gray-600 hover:text-black mb-4 flex items-center gap-2"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    {c.backToDetails}
                  </button>

                  <h2 className="text-xl font-black mb-2">{c.paymentTitle}</h2>
                  <p className="mb-5 flex items-center gap-2 text-sm capitalize text-gray-600">
                    <Truck className="h-4 w-4 shrink-0 text-[#651A1A]" strokeWidth={1.75} />
                    {deliverySummary}
                  </p>
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: stripeAppearance,
                    }}
                  >
                    <PaymentForm amount={paymentAmount} />
                  </Elements>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Order Summary. Oculta en móvil: se apilaba debajo del CTA y
              repetía entero el resumen plegable de arriba (artículos, código, totales,
              oferta), duplicando el largo de la página justo después de pagar. */}
          <div className="hidden lg:block lg:border-l lg:pl-12">
            <h2 className="text-xl font-black mb-6">{c.orderSummary}</h2>

            {/* Cart Items */}
            <div className="mb-6">{orderLines("w-20 h-20")}</div>

            {/* Discount Code */}
            <div className="mb-6">{discountCodeBlock}</div>

            {/* Totals */}
            <div className="space-y-3 border-t pt-6">
              <div className="flex justify-between text-sm">
                <span>{c.subtotal}</span>
                <span className={discount > 0 ? "text-gray-500 line-through" : "font-bold"}>
                  <PriceDisplay amount={totalPrice} className="text-base font-bold" currencyClassName="text-[0.6em] opacity-80" />
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-700 font-bold">{discountLabel}</span>
                  <span className="text-green-600 font-bold flex items-center">
                    -<PriceDisplay amount={discount} className="text-base font-bold" currencyClassName="text-[0.5em] opacity-80" />
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>{c.shipping}</span>
                {shippingCost === 0 ? (
                  <span className="text-green-600 font-bold">{c.free}</span>
                ) : (
                  <PriceDisplay amount={shippingCost} className="text-sm" />
                )}
              </div>
              <div className="flex justify-between text-lg font-black border-t pt-3">
                <span>{c.total}</span>
                <span className={discount > 0 ? "text-green-600" : ""}>
                  <PriceDisplay amount={finalPrice} className="text-xl font-black" currencyClassName="text-[0.5em] opacity-100" />
                </span>
              </div>
            </div>

            {/* Accepted payment methods */}
            <div className="mt-4">{paymentIcons}</div>

            {/* Limited Offer */}
            {!upsellAdded && <div className="mt-6">{upsellBlock}</div>}
          </div>
        </div>
      </div >
    </div >
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CheckoutContent />
    </Suspense>
  )
}
