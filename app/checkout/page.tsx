"use client"

import { useState, useMemo, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ChevronRight, ChevronLeft, ChevronDown, X, Gift, ShoppingBag } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { VisaIcon, MastercardIcon, ApplePayIcon, TwintIcon } from "@/components/icons/PaymentIcons"
import Navbar from "@/components/Navbar"
import PriceDisplay from "@/components/PriceDisplay"
import { loadStripe } from "@stripe/stripe-js"
import { stripeAppearance } from "@/lib/stripe-appearance"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import DatePicker, { registerLocale } from "react-datepicker"
import { de } from "date-fns/locale"
import { enUS } from "date-fns/locale"
import "react-datepicker/dist/react-datepicker.css"
import { addDays, addHours, eachDayOfInterval, isSameDay, startOfDay } from "date-fns"

registerLocale("de", de)
registerLocale("en", enUS)

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')


// Ocultar la opción de regalo "For You" hasta que se lance la funcionalidad
const SHOW_GIFT_OPTION = false

function PaymentForm({ clientSecret, amount }: { clientSecret: string; amount: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const router = useRouter()
  const { t } = useLanguage()
  const c = t.checkout

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage("")

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      })

      if (error) {
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
  const { cartItems, totalPrice, removeItem, addToCart } = useCart()
  const { locale, t } = useLanguage()
  const c = t.checkout
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [kanton, setKanton] = useState("Zürich")
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null)
  const [deliveryTime, setDeliveryTime] = useState("")
  const [clientSecret, setClientSecret] = useState<string>("")
  const [showPayment, setShowPayment] = useState(false)
  const [showDeliveryStep, setShowDeliveryStep] = useState(false)
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
  // Loading del paso 2: crear el PaymentIntent tarda >1s; sin esto el botón
  // parecía muerto y un doble toque creaba dos pagos.
  const [isInitializingPayment, setIsInitializingPayment] = useState(false)
  // Mobile-only: the order summary column sits below the form, so surface a collapsible
  // recap above it instead of making people scroll past everything to see the total.
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false)
  const [paymentFailed, setPaymentFailed] = useState(false)
  const formRestoredRef = useRef(false)

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

  // "Ahora" vivo: una pestaña que lleva horas abierta seguiría midiendo las 36h desde
  // el momento de carga, así que lo refrescamos mientras se está eligiendo la entrega.
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    if (!showDeliveryStep || showPayment) return
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [showDeliveryStep, showPayment])

  // Calculate minimum delivery date (36 hours from now)
  const minDeliveryDate = useMemo(() => addHours(now, 36), [now])

  // Generate time slots
  const timeSlots = [
    "09:00 - 12:00",
    "12:00 - 15:00",
    "15:00 - 18:00",
    "18:00 - 21:00"
  ]

  // Cierre de Navidad: del 20 de diciembre al 6 de enero siguiente. Generamos tres
  // temporadas porque en enero el año en curso ya es el siguiente, y su propio 1-6 de
  // enero tiene que seguir bloqueado.
  const currentYear = now.getFullYear()
  const blockedDates = useMemo(
    () =>
      [currentYear - 1, currentYear, currentYear + 1].flatMap((year) =>
        eachDayOfInterval({
          start: new Date(year, 11, 20),
          end: new Date(year + 1, 0, 6),
        })
      ),
    [currentYear]
  )

  // Un tramo solo es válido si su inicio respeta las 36h de antelación
  const slotStartFor = (date: Date, slot: string) => {
    const start = new Date(date)
    start.setHours(parseInt(slot, 10), 0, 0, 0)
    return start
  }

  const isSlotAvailable = (slot: string, date: Date | null = deliveryDate) => {
    if (!date) return true
    return slotStartFor(date, slot) >= minDeliveryDate
  }

  // El calendario compara solo días naturales, así que por sí solo dejaría elegir el día
  // de "ahora + 36h" aunque a esas alturas ya no quede ningún tramo (pasaba en todos los
  // pedidos entre las 07:00 y las 12:00: se podía elegir el día y luego salían los cuatro
  // tramos tachados). Un día solo vale si le queda al menos un tramo y no está bloqueado.
  const hasAvailableSlot = (date: Date) => timeSlots.some((slot) => isSlotAvailable(slot, date))
  const isDateSelectable = (date: Date) =>
    hasAvailableSlot(date) && !blockedDates.some((b) => isSameDay(b, date))

  // Primer día realmente reservable: el calendario arranca aquí y se abre en su mes.
  const firstSelectableTime = (() => {
    let day = startOfDay(minDeliveryDate)
    for (let i = 0; i < 400 && !isDateSelectable(day); i++) {
      day = addDays(day, 1)
    }
    return day.getTime()
  })()
  const firstSelectableDate = useMemo(() => new Date(firstSelectableTime), [firstSelectableTime])

  // Restaurar el formulario guardado (p. ej. al volver de un pago TWINT cancelado)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('emilia-checkout-form')
      if (raw) {
        const d = JSON.parse(raw)
        if (d.email) setEmail(d.email)
        if (d.phone) setPhone(d.phone)
        if (d.firstName) setFirstName(d.firstName)
        if (d.lastName) setLastName(d.lastName)
        if (d.address) setAddress(d.address)
        if (d.city) setCity(d.city)
        if (d.postalCode) setPostalCode(d.postalCode)
        if (d.kanton) setKanton(d.kanton)
        if (typeof d.isGift === 'boolean') setIsGift(d.isGift)
        if (d.appliedDiscountCode) {
          setAppliedDiscountCode(d.appliedDiscountCode)
          setDiscountCodeInput(d.appliedDiscountCode)
        }
        if (d.deliveryDate) {
          const date = new Date(d.deliveryDate)
          if (!isNaN(date.getTime()) && isDateSelectable(date)) {
            setDeliveryDate(date)
            if (d.deliveryTime && isSlotAvailable(d.deliveryTime, date)) {
              setDeliveryTime(d.deliveryTime)
            }
          }
        }
      }
    } catch { }

    if (searchParams.get('payment') === 'failed') {
      setPaymentFailed(true)
      setShowDeliveryStep(true)
      router.replace('/checkout', { scroll: false })
    }

    formRestoredRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Guardar el formulario para que sobreviva a la redirección de TWINT
  useEffect(() => {
    if (!formRestoredRef.current) return
    try {
      sessionStorage.setItem('emilia-checkout-form', JSON.stringify({
        email, phone, firstName, lastName, address, city, postalCode, kanton,
        isGift, appliedDiscountCode,
        deliveryDate: deliveryDate ? deliveryDate.toISOString() : null,
        deliveryTime,
      }))
    } catch { }
  }, [email, phone, firstName, lastName, address, city, postalCode, kanton, isGift, appliedDiscountCode, deliveryDate, deliveryTime])

  // Si el reloj avanza mientras el checkout está abierto, lo ya elegido puede dejar de
  // cumplir las 36h. Lo soltamos y lo decimos, en vez de dejar pagar algo imposible.
  useEffect(() => {
    if (!deliveryDate) return
    if (!isDateSelectable(deliveryDate)) {
      setDeliveryDate(null)
      setDeliveryTime("")
      setDeliveryError(c.slotExpired)
    } else if (deliveryTime && !isSlotAvailable(deliveryTime, deliveryDate)) {
      setDeliveryTime("")
      setDeliveryError(c.slotExpired)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minDeliveryDate, deliveryDate, deliveryTime])

  // Calculate discount and shipping
  const shippingCost = totalPrice >= 100 ? 0 : 8.40
  const normalizedDiscountCode = appliedDiscountCode.trim().toLowerCase()
  const isAdminCode = normalizedDiscountCode === "emilia1"
  const hasCodeDiscount = normalizedDiscountCode === "holaswitzerland"
  const codeDiscountRate = totalPrice >= 100 ? 0.15 : 0.10
  const codeDiscount = hasCodeDiscount ? totalPrice * codeDiscountRate : 0
  const automaticDiscount = totalPrice >= 100 ? totalPrice * 0.10 : 0
  const discount = hasCodeDiscount ? codeDiscount : automaticDiscount
  const finalPrice = isAdminCode ? 1.00 : (totalPrice - discount + shippingCost)

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

  const handleContinueToDelivery = (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault()

    const missing = new Set<string>()
    if (!email) missing.add("email")
    if (!firstName) missing.add("firstName")
    if (!lastName) missing.add("lastName")
    if (!address) missing.add("address")
    if (!city) missing.add("city")
    if (!postalCode) missing.add("postalCode")
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
    if (!isPostalCodeValid(postalCode)) {
      setPostalCodeError(c.postalCodeError)
      setFormError("")
      return
    }

    setPostalCodeError("")
    setFormError("")
    setMissingFields(new Set())
    setShowDeliveryStep(true)
  }

  const handleContinueToPayment = async (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault()

    if (!deliveryDate || !deliveryTime) {
      setDeliveryError(c.deliveryError)
      return
    }
    // Revalidar contra la hora actual: entre elegir la entrega y pulsar pagar puede
    // haberse cruzado el límite de las 36h.
    if (!isDateSelectable(deliveryDate) || !isSlotAvailable(deliveryTime, deliveryDate)) {
      if (!isDateSelectable(deliveryDate)) setDeliveryDate(null)
      setDeliveryTime("")
      setDeliveryError(c.slotExpired)
      return
    }
    setDeliveryError("")
    setPaymentInitError("")
    setIsInitializingPayment(true)

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalPrice,
          orderData: {
            email,
            phone,
            firstName,
            lastName,
            address,
            city,
            postalCode,
            kanton,
            isGift,
            deliveryDate: deliveryDate?.toLocaleDateString('de-CH'),
            deliveryTime,
            discountCode: appliedDiscountCode,
            subtotal: totalPrice,
            shippingCost,
            items: cartItems.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              size: item.size
            })),
          },
        }),
      })

      const data = await response.json()

      if (data.clientSecret) {
        // Store order value for Google Ads conversion tracking
        localStorage.setItem('emilia-order-value', finalPrice.toString())
        setClientSecret(data.clientSecret)
        setShowPayment(true)
        setPaymentFailed(false)
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

  const currentStep = showPayment ? 3 : showDeliveryStep ? 2 : 1

  // Al cambiar de paso el móvil se quedaba a media página: se pulsa el botón de abajo
  // y el paso nuevo aparece por encima de donde está mirando el usuario.
  const stepTopRef = useRef<HTMLDivElement>(null)
  const previousStepRef = useRef(currentStep)
  useEffect(() => {
    if (previousStepRef.current === currentStep) return
    previousStepRef.current = currentStep
    stepTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [currentStep])

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
            const normalized = discountCodeInput.trim().toLowerCase()
            if (!normalized) {
              setAppliedDiscountCode("")
              setDiscountCodeError("")
              return
            }
            if (normalized === "holaswitzerland" || normalized === "emilia1") {
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

  const upsellBlock = (
    <div className="p-4 bg-pink-50 rounded-lg">
      <h3 className="font-bold text-sm mb-2">{c.upsellTitle}</h3>
      <div className="flex gap-3 items-center">
        <img
          src="/original3.jpeg"
          alt="Angebot"
          className="w-16 h-16 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">CLASSIC (2-3 Personen)</p>
          <p className="text-xs text-gray-600">(10% RABATT)</p>
          <p className="text-sm">
            <span className="font-bold whitespace-nowrap"><PriceDisplay amount={14.31} showCurrency={false} className="text-sm" /> CHF</span>{" "}
            <span className="text-gray-500 line-through whitespace-nowrap"><PriceDisplay amount={15.90} showCurrency={false} className="text-sm" /> CHF</span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddUpsellProduct}
          className="shrink-0 px-4 py-2 bg-black text-white rounded-lg font-bold text-sm transition-[background-color,transform] duration-150 hover:bg-gray-900 active:bg-gray-800 active:scale-[0.97]"
        >
          {c.upsellAdd}
        </button>
      </div>
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar minimal />

      <div className="container mx-auto px-4 py-8">
        <div ref={stepTopRef} className="scroll-mt-24" />

        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-sm mb-8">
          <Link href="/" className="text-pink-500 hover:underline">{c.breadcrumbCart}</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium">{c.breadcrumbInfo}</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400">{c.breadcrumbPayment}</span>
        </div>

        {/* En móvil no había breadcrumb: no se sabía cuánto quedaba para terminar.
            Los pasos ya completados se pueden tocar para volver atrás. */}
        <div className="md:hidden mb-6 flex items-start gap-2">
          {[c.breadcrumbInfo, c.deliveryTitle, c.breadcrumbPayment].map((label, i) => {
            const step = i + 1
            const reached = step <= currentStep
            const canGoBack = step < currentStep
            const goBack = () => {
              if (step === 1) {
                setShowPayment(false)
                setClientSecret("")
                setShowDeliveryStep(false)
              } else if (step === 2) {
                setShowPayment(false)
                setClientSecret("")
              }
            }
            return (
              <button
                key={label}
                type="button"
                onClick={canGoBack ? goBack : undefined}
                aria-current={step === currentStep ? 'step' : undefined}
                className={`flex-1 text-left ${canGoBack ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div
                  className={`h-1 rounded-full transition-colors duration-300 ${reached ? 'bg-[#651A1A]' : 'bg-gray-200'}`}
                />
                <p
                  className={`mt-2 text-[0.7rem] font-bold leading-tight tracking-wide transition-colors duration-300 ${step === currentStep ? 'text-[#651A1A]' : reached ? 'text-gray-500' : 'text-gray-300'} ${canGoBack ? 'underline underline-offset-2 decoration-gray-300' : ''}`}
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
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#F5E6D3] rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-600">{item.size} {c.persons} · {c.qty} {item.quantity}</p>
                  </div>
                  <PriceDisplay amount={item.price * item.quantity} className="text-sm font-bold" currencyClassName="text-[0.6em] opacity-80" />
                </div>
              ))}
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span>{c.subtotal}</span>
                <PriceDisplay amount={totalPrice} className="text-sm font-bold" currencyClassName="text-[0.6em] opacity-80" />
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-700 font-bold">
                  <span>{hasCodeDiscount ? `${totalPrice >= 100 ? '15%' : '10%'} Rabatt` : '10% Rabatt'}</span>
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
              {/* Gift option */}
              {SHOW_GIFT_OPTION && !showPayment && (
                <div className="mb-8">
                  <button
                    type="button"
                    onClick={() => setIsGift(!isGift)}
                    aria-pressed={isGift}
                    className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-300 ${isGift ? "border-[#651A1A] bg-[#F5E6D3] shadow-[0_8px_24px_-14px_rgba(101,26,26,0.4)]" : "border-gray-200 bg-white hover:border-[#651A1A]/40"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${isGift ? "border-[#651A1A] bg-[#651A1A] text-white" : "border-[#651A1A]/20 bg-[#FBF6EF] text-[#651A1A]"}`}>
                        <Gift className="h-5 w-5" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-black text-base tracking-tight transition-colors duration-300 ${isGift ? "text-[#651A1A]" : "text-[#1a1a1a]"}`}>
                          {locale === 'de' ? 'Mach es persönlich. Sende eine Nachricht mit dem Kuchen.' : 'Make it personal. Send a message with the cake.'}
                        </p>
                        <p className={`text-sm leading-snug transition-colors duration-300 ${isGift ? "text-[#651A1A]/70" : "text-gray-600"}`}>
                          {locale === 'de'
                            ? 'Video, Foto oder Nachricht. Wir fügen einen QR-Code hinzu, um deine Überraschung zu sehen.'
                            : 'Video, photo or message. We will add a QR to see your surprise.'}
                        </p>
                      </div>
                      <div className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 ${isGift ? "bg-[#651A1A]" : "bg-gray-300"}`}>
                        <div className={`absolute top-1 h-5 w-5 rounded-full shadow transition-all duration-300 ${isGift ? "left-6 bg-white" : "left-1 bg-white"}`} />
                      </div>
                    </div>
                    {isGift && (
                      <div className="mt-4 rounded-xl bg-white/60 px-4 py-3 text-sm text-[#651A1A] leading-relaxed">
                        {locale === 'de'
                          ? 'Nach der Bezahlung kannst du dein Video, Foto oder deine Nachricht hinzufügen. Wir fügen deinen persönlichen QR-Code hinzu. Zum Geburtstag, als Dankeschön, eine Reise-Überraschung oder einfach so. Einfach scannen und alles auf unserer Seite ansehen.'
                          : 'After payment you can add your video, photo or message. We add your personal QR code. For a birthday, a thank you, a trip surprise, or just because. They scan it to see everything on our page.'}
                      </div>
                    )}
                  </button>
                </div>
              )}

              {/* Paso 1 (contacto + dirección) dentro de un <form>: la tecla
                  "ir/enter" del teclado móvil envía el paso en vez de no hacer nada. */}
              {!showDeliveryStep && !showPayment && (
              <form onSubmit={handleContinueToDelivery}>
              {/* Contact Section */}
              <div className="mb-8">
                <div className="mb-4">
                  <h2 className="text-xl font-black">{c.contact}</h2>
                </div>
                <input
                  type="email"
                  placeholder={c.emailPlaceholder}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (missingFields.has('email')) { const m = new Set(missingFields); m.delete('email'); setMissingFields(m) } }}
                  data-error={missingFields.has('email')}
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="off"
                  autoCorrect="off"
                  className={`w-full border rounded-lg px-4 py-3 text-base focus:outline-none ${missingFields.has('email') ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-black'}`}
                  required
                />
                <input
                  type="tel"
                  placeholder={c.phonePlaceholder}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  inputMode="tel"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-black mt-4"
                />
                <label className="flex items-center gap-2.5 mt-3 py-1.5 cursor-pointer">
                  <input type="checkbox" className="h-5 w-5 shrink-0 cursor-pointer accent-[#651A1A]" />
                  <span className="text-sm">{c.newsletter}</span>
                </label>
              </div>

              {/* Shipping Address */}
                <div>
                  <div className="mb-8">
                    <h2 className="text-xl font-black mb-4">{c.deliveryAddress}</h2>

                    <div className="space-y-4">
                      {/* Solo se entrega en Suiza: un select de una opción parece roto */}
                      <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-base text-gray-600">
                        {c.country}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder={c.firstNamePlaceholder}
                          value={firstName}
                          onChange={(e) => { setFirstName(e.target.value); if (missingFields.has('firstName')) { const m = new Set(missingFields); m.delete('firstName'); setMissingFields(m) } }}
                          data-error={missingFields.has('firstName')}
                          autoComplete="given-name"
                          autoCapitalize="words"
                          className={`w-full border rounded-lg px-4 py-3 text-base focus:outline-none ${missingFields.has('firstName') ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-black'}`}
                          required
                        />
                        <input
                          type="text"
                          placeholder={c.lastNamePlaceholder}
                          value={lastName}
                          onChange={(e) => { setLastName(e.target.value); if (missingFields.has('lastName')) { const m = new Set(missingFields); m.delete('lastName'); setMissingFields(m) } }}
                          data-error={missingFields.has('lastName')}
                          autoComplete="family-name"
                          autoCapitalize="words"
                          className={`w-full border rounded-lg px-4 py-3 text-base focus:outline-none ${missingFields.has('lastName') ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-black'}`}
                          required
                        />
                      </div>

                      <input
                        type="text"
                        placeholder={c.addressPlaceholder}
                        value={address}
                        onChange={(e) => { setAddress(e.target.value); if (missingFields.has('address')) { const m = new Set(missingFields); m.delete('address'); setMissingFields(m) } }}
                        data-error={missingFields.has('address')}
                        autoComplete="street-address"
                        autoCapitalize="words"
                        className={`w-full border rounded-lg px-4 py-3 text-base focus:outline-none ${missingFields.has('address') ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-black'}`}
                        required
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder={c.cityPlaceholder}
                          value={city}
                          onChange={(e) => { setCity(e.target.value); if (missingFields.has('city')) { const m = new Set(missingFields); m.delete('city'); setMissingFields(m) } }}
                          data-error={missingFields.has('city')}
                          autoComplete="address-level2"
                          autoCapitalize="words"
                          className={`w-full border rounded-lg px-4 py-3 text-base focus:outline-none ${missingFields.has('city') ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-black'}`}
                          required
                        />
                        <input
                          type="text"
                          placeholder={c.postalCodePlaceholder}
                          value={postalCode}
                          onChange={(e) => {
                            setPostalCode(e.target.value)
                            setPostalCodeError("")
                            if (missingFields.has('postalCode')) { const m = new Set(missingFields); m.delete('postalCode'); setMissingFields(m) }
                          }}
                          data-error={missingFields.has('postalCode') || !!postalCodeError}
                          autoComplete="postal-code"
                          inputMode="numeric"
                          className={`w-full border rounded-lg px-4 py-3 text-base focus:outline-none ${postalCodeError || missingFields.has('postalCode') ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-black"
                            }`}
                          required
                        />
                      </div>

                      {postalCodeError && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                          {postalCodeError}
                        </div>
                      )}

                      {/* Mismo caso: hoy solo se entrega en Zürich */}
                      <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-base text-gray-600">
                        {kanton}
                      </div>
                    </div>
                  </div>

                  {formError && (
                    <div role="alert" aria-live="polite" className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>{formError}</span>
                    </div>
                  )}
                  {/* En móvil la oferta y los métodos de pago vivían solo en la columna
                      derecha, que ahora está oculta. Los traemos al punto de decisión. */}
                  {!upsellAdded && <div className="lg:hidden mt-6">{upsellBlock}</div>}
                  <div className="lg:hidden mt-4 flex justify-center">{paymentIcons}</div>

                  <div className="sticky bottom-0 -mx-4 mt-4 border-t border-gray-200 bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-10px_28px_-20px_rgba(0,0,0,0.45)] lg:static lg:mx-0 lg:mt-4 lg:border-0 lg:bg-transparent lg:px-0 lg:pt-0 lg:pb-0 lg:shadow-none">
                    <div className="mb-2 flex items-center justify-between lg:hidden">
                      <span className="text-sm text-gray-500">{c.total}</span>
                      <PriceDisplay
                        amount={finalPrice}
                        className={`text-base font-black ${discount > 0 ? 'text-green-600' : ''}`}
                        currencyClassName="text-[0.55em] opacity-80"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-black text-white py-4 rounded-lg font-black text-base tracking-tight transition-[background-color,transform] duration-150 hover:bg-gray-900 active:bg-gray-800 active:scale-[0.99]"
                    >
                      {c.continueToDelivery}
                    </button>
                  </div>
                </div>
              </form>
              )}

              {/* Delivery Date & Time Section. También como <form> para que
                  "enter" del teclado confirme el paso. */}
              {showDeliveryStep && !showPayment && (
                <form onSubmit={handleContinueToPayment}>
                  {paymentFailed && (
                    <div role="alert" aria-live="polite" className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-lg text-sm flex items-start gap-2 mb-6">
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>{c.paymentFailedNotice}</span>
                    </div>
                  )}

                  <h2 className="text-xl font-black mb-2">{c.deliveryTitle}</h2>
                  <p className="text-sm text-gray-600 mb-6 flex items-start gap-2">
                    <svg className="w-5 h-5 text-[#651A1A] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{c.deliveryNotice}</span>
                  </p>

                  <div className="space-y-4 mb-8">
                    {/* Date Picker */}
                    <div>
                      <label className="block text-sm font-bold mb-4">{c.chooseDateLabel}</label>
                      <style>{`
                        .custom-datepicker {
                          font-family: var(--font-playfair), serif;
                          border: none;
                          padding: 0;
                          width: 100%;
                          background-color: transparent;
                        }
                        .react-datepicker {
                          width: 100%;
                          border: none;
                          background-color: transparent;
                        }
                        .react-datepicker__month-container {
                          width: 100%;
                          margin: 0 auto;
                        }
                        .react-datepicker__header {
                          background-color: transparent;
                          border-bottom: none;
                          padding-top: 0;
                          margin-bottom: 1rem;
                          width: 100%;
                        }
                        .react-datepicker__day-names,
                        .react-datepicker__week {
                          display: flex;
                          justify-content: space-between;
                          padding: 0;
                        }
                        /* Percentage widths so the 7-column grid never overflows a 320px viewport */
                        .react-datepicker__day-name {
                          color: #651A1A;
                          font-family: var(--font-geist-sans), sans-serif;
                          font-weight: 600;
                          width: 14.28%;
                          max-width: 2.75rem;
                          text-transform: uppercase;
                          font-size: 0.7rem;
                          letter-spacing: 0.1em;
                          margin: 0;
                          text-align: center;
                        }
                        .react-datepicker__day {
                          width: 14.28%;
                          max-width: 2.75rem;
                          aspect-ratio: 1;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          line-height: 1;
                          border-radius: 50%;
                          margin: 0;
                          font-family: var(--font-playfair), serif;
                          font-size: 1rem;
                          color: #1a1a1a;
                          transition: background-color 0.2s, color 0.2s, transform 0.12s;
                          text-align: center;
                          /* Sin esto, tocar un día en Android deja un cuadrado gris */
                          -webkit-tap-highlight-color: transparent;
                        }
                        .react-datepicker__day:hover:not(.react-datepicker__day--disabled) {
                          background-color: #E6D5C0;
                          color: #651A1A;
                        }
                        .react-datepicker__day:active:not(.react-datepicker__day--disabled) {
                          background-color: #E6D5C0;
                          color: #651A1A;
                          transform: scale(0.9);
                        }
                        .react-datepicker__day--selected {
                          background-color: #651A1A !important;
                          color: white !important;
                        }
                        /* Sin fecha elegida no debe verse ningún día "seleccionado" */
                        .react-datepicker__day--keyboard-selected {
                          background-color: transparent;
                          color: #1a1a1a;
                        }
                        .react-datepicker__day--disabled {
                          color: #ccc;
                          opacity: 0.3;
                        }
                        .react-datepicker__day--today {
                          font-weight: bold;
                          color: #651A1A;
                          position: relative;
                        }
                        .react-datepicker__day--today::after {
                          content: '';
                          position: absolute;
                          bottom: 2px;
                          left: 50%;
                          transform: translateX(-50%);
                          width: 4px;
                          height: 4px;
                          background-color: #651A1A;
                          border-radius: 50%;
                        }
                        .react-datepicker__day--selected::after {
                          display: none;
                        }
                        .react-datepicker__month {
                          margin: 0;
                        }
                        /* Móvil: filas algo más bajas y cabecera más fina para que
                           los tramos horarios no queden una pantalla entera abajo */
                        @media (max-width: 1023px) {
                          .custom-datepicker .react-datepicker__header {
                            margin-bottom: 0.5rem;
                          }
                          .custom-datepicker .react-datepicker__day {
                            height: 2.6rem;
                            aspect-ratio: auto;
                            font-size: 0.9rem;
                          }
                        }
                      `}</style>

                      <div className="bg-[#FFFCF8] border border-[#E6D5C0] rounded-2xl p-3 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-center mb-6">
                        {/* Left Side: Calendar */}
                        <div className="flex-1 w-full max-w-[360px] lg:max-w-none">
                          <DatePicker
                            selected={deliveryDate}
                            onChange={(date) => {
                              setDeliveryDate(date)
                              setDeliveryError("")
                              if (date && deliveryTime && !isSlotAvailable(deliveryTime, date)) {
                                setDeliveryTime("")
                              }
                            }}
                            minDate={firstSelectableDate}
                            excludeDates={blockedDates}
                            filterDate={hasAvailableSlot}
                            openToDate={deliveryDate ?? firstSelectableDate}
                            locale={locale === 'en' ? 'en' : 'de'}
                            inline
                            calendarClassName="custom-datepicker"
                            renderCustomHeader={({
                              date,
                              decreaseMonth,
                              increaseMonth,
                              prevMonthButtonDisabled,
                              nextMonthButtonDisabled,
                            }) => (
                              <div className="flex items-center justify-between px-2 mb-2">
                                <button
                                  onClick={decreaseMonth}
                                  disabled={prevMonthButtonDisabled}
                                  type="button"
                                  aria-label={locale === 'en' ? 'Previous month' : 'Vorheriger Monat'}
                                  className="p-2.5 hover:bg-[#E6D5C0] active:bg-[#E6D5C0] rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:active:bg-transparent text-[#651A1A]"
                                >
                                  <ChevronLeft className="w-5 h-5" />
                                </button>

                                <h3 className="text-lg lg:text-xl font-black text-[#1a1a1a] font-serif capitalize">
                                  {date.toLocaleDateString(locale === 'en' ? 'en-GB' : 'de-CH', {
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </h3>

                                <button
                                  onClick={increaseMonth}
                                  disabled={nextMonthButtonDisabled}
                                  type="button"
                                  aria-label={locale === 'en' ? 'Next month' : 'Nächster Monat'}
                                  className="p-2.5 hover:bg-[#E6D5C0] active:bg-[#E6D5C0] rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:active:bg-transparent text-[#651A1A]"
                                >
                                  <ChevronRight className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                          />
                        </div>

                        {/* Divider (Desktop) */}
                        <div className="hidden lg:block w-px h-64 bg-[#E6D5C0] opacity-50"></div>

                        {/* Right Side: Date Info. Oculto en móvil: el bloque de 4 líneas
                            empujaba los tramos horarios fuera de pantalla. Debajo hay una
                            confirmación de una línea. */}
                        <div className="hidden lg:w-1/3 lg:flex flex-col items-center lg:items-start justify-center text-center lg:text-left">
                          {deliveryDate ? (
                            <>
                              <p className="text-xs uppercase tracking-widest text-[#651A1A] font-bold mb-2">{c.deliveryDateLabel}</p>
                              <p className="text-4xl lg:text-5xl font-black font-serif text-[#1a1a1a] mb-2">
                                {deliveryDate.getDate()}
                              </p>
                              <p className="text-xl lg:text-2xl font-serif text-[#1a1a1a] mb-1 capitalize">
                                {deliveryDate.toLocaleDateString(locale === 'en' ? 'en-GB' : 'de-CH', { month: 'long' })}
                              </p>
                              <p className="text-lg text-gray-600 font-medium capitalize">
                                {deliveryDate.toLocaleDateString(locale === 'en' ? 'en-GB' : 'de-CH', { weekday: 'long' })}
                              </p>
                              <p className="text-sm text-gray-400 mt-2">
                                {deliveryDate.getFullYear()}
                              </p>
                            </>
                          ) : (
                            <div className="text-gray-400 flex flex-col items-center lg:items-start">
                              <p className="mb-2">{c.selectDatePlaceholder}</p>
                              <div className="w-12 h-1 bg-gray-200 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Confirmación compacta de la fecha en móvil */}
                      {deliveryDate && (
                        <div className="lg:hidden -mt-3 mb-2 flex items-center gap-3 rounded-xl border border-[#E6D5C0] bg-[#FFFCF8] px-4 py-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#651A1A] text-sm font-black text-white">
                            {deliveryDate.getDate()}
                          </span>
                          <p className="text-sm font-bold capitalize text-[#1a1a1a]">
                            {deliveryDate.toLocaleDateString(locale === 'en' ? 'en-GB' : 'de-CH', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                            })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Time Slot Picker */}
                    <div>
                      <label className="block text-sm font-bold mb-3">{c.chooseTimeLabel}</label>
                      <div className="grid grid-cols-2 gap-3">
                        {timeSlots.map((slot) => {
                          const available = isSlotAvailable(slot)
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={!available}
                              onClick={() => {
                                setDeliveryTime(slot)
                                setDeliveryError("")
                              }}
                              className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${!available
                                ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                                : deliveryTime === slot
                                  ? "border-[#651A1A] bg-[#F5E6D3] shadow-md [@media(hover:hover)]:hover:scale-105"
                                  : "border-gray-300 bg-white hover:border-gray-400 [@media(hover:hover)]:hover:scale-105"
                                }`}
                            >
                              {/* El check iba en una insignia absoluta que en móvil caía
                                  encima del propio texto de la hora. Ahora sustituye al
                                  icono del reloj. */}
                              <div className="flex items-center justify-center gap-2">
                                {available && deliveryTime === slot ? (
                                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#651A1A]">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </span>
                                ) : (
                                  <svg className={`w-5 h-5 shrink-0 ${available ? "text-[#651A1A]" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                                <span className={`font-bold text-sm ${available ? "" : "text-gray-400 line-through"}`}>{slot}</span>
                              </div>
                              {!available && (
                                <p className="text-[0.65rem] text-gray-400 mt-1">{c.slotUnavailable}</p>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="sticky bottom-0 -mx-4 mt-4 border-t border-gray-200 bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-10px_28px_-20px_rgba(0,0,0,0.45)] lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:pt-0 lg:pb-0 lg:shadow-none">
                    {/* El error vive dentro de la barra sticky: fuera quedaba
                        tapado por la propia barra justo donde aparece. */}
                    {(deliveryError || paymentInitError) && (
                      <div role="alert" aria-live="polite" className="mb-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{deliveryError || paymentInitError}</span>
                      </div>
                    )}
                    <div className="mb-2 flex items-center justify-between lg:hidden">
                      <span className="text-sm text-gray-500">{c.total}</span>
                      <PriceDisplay
                        amount={finalPrice}
                        className={`text-base font-black ${discount > 0 ? 'text-green-600' : ''}`}
                        currencyClassName="text-[0.55em] opacity-80"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isInitializingPayment}
                      className="w-full bg-black text-white py-4 rounded-lg font-black text-base tracking-tight transition-[background-color,transform] duration-150 hover:bg-gray-900 active:bg-gray-800 active:scale-[0.99] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:active:scale-100"
                    >
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
              {showPayment && clientSecret && (
                <div>
                  <button
                    onClick={() => {
                      setShowPayment(false)
                      setClientSecret("")
                    }}
                    className="text-sm text-gray-600 hover:text-black mb-4 flex items-center gap-2"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    {c.backToDelivery}
                  </button>

                  <h2 className="text-xl font-black mb-4">{c.paymentTitle}</h2>
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: stripeAppearance,
                    }}
                  >
                    <PaymentForm clientSecret={clientSecret} amount={finalPrice} />
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
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 bg-[#F5E6D3] rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-600">{item.size} {c.persons}</p>
                      <p className="text-xs text-gray-900 font-bold mt-1">{c.qty} {item.quantity}</p>
                    </div>
                    <div className="font-bold">
                      <PriceDisplay amount={item.price * item.quantity} className="text-base" currencyClassName="text-[0.6em] opacity-80" />
                    </div>
                  </div>
              ))}

            </div>

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
                  <span className="text-green-700 font-bold">
                    {hasCodeDiscount
                      ? (totalPrice >= 100 ? "15% Rabatt (HolaSwitzerland)" : "10% Rabatt (HolaSwitzerland)")
                      : "10% Rabatt"}
                  </span>
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
