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
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import DatePicker, { registerLocale } from "react-datepicker"
import { de } from "date-fns/locale"
import { enUS } from "date-fns/locale"
import "react-datepicker/dist/react-datepicker.css"
import { addHours, eachDayOfInterval, isSameDay, startOfDay } from "date-fns"

registerLocale("de", de)
registerLocale("en", enUS)

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

// Ocultar la opción de regalo "For You" hasta que se lance la funcionalidad
const SHOW_GIFT_OPTION = false

function PaymentForm({ clientSecret }: { clientSecret: string }) {
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

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-black text-white py-4 rounded-lg font-black text-base tracking-tight hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isProcessing ? c.processing : c.payNow}
      </button>
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
  const [country, setCountry] = useState("Switzerland")
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

  // Calculate minimum delivery date (36 hours from now)
  const minDeliveryDate = useMemo(() => addHours(new Date(), 36), [])

  // Generate blocked dates (Dec 20 - Jan 6)
  const blockedDates = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1

    // Dec 20 - Dec 31 of current year
    const dec20 = new Date(currentYear, 11, 20)
    const dec31 = new Date(currentYear, 11, 31)

    // Jan 1 - Jan 6 of next year
    const jan1 = new Date(nextYear, 0, 1)
    const jan6 = new Date(nextYear, 0, 6)

    const decemberDates = eachDayOfInterval({ start: dec20, end: dec31 })
    const januaryDates = eachDayOfInterval({ start: jan1, end: jan6 })

    // Block April 30, 2026
    const thisThursday = new Date(2026, 3, 30)

    // Block June 4-8, 2026
    const june4 = new Date(2026, 5, 4)
    const june8 = new Date(2026, 5, 8)
    const june4to8 = eachDayOfInterval({ start: june4, end: june8 })

    // Block June 12-24, 2026
    const june12 = new Date(2026, 5, 12)
    const june24 = new Date(2026, 5, 24)
    const june12to24 = eachDayOfInterval({ start: june12, end: june24 })

    return [...decemberDates, ...januaryDates, thisThursday, ...june4to8, ...june12to24]
  }, [])

  // Generate time slots
  const timeSlots = [
    "09:00 - 12:00",
    "12:00 - 15:00",
    "15:00 - 18:00",
    "18:00 - 21:00"
  ]

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
          const isValid = !isNaN(date.getTime())
            && date >= startOfDay(minDeliveryDate)
            && !blockedDates.some((b) => isSameDay(b, date))
          if (isValid) {
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
    setDeliveryError("")
    setPaymentInitError("")

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
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
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
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-sm mb-8">
          <Link href="/" className="text-pink-500 hover:underline">{c.breadcrumbCart}</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium">{c.breadcrumbInfo}</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400">{c.breadcrumbPayment}</span>
        </div>

        {/* Mobile order recap - the full summary column below is lg-only in practice */}
        <div className="lg:hidden -mx-4 mb-6 border-y border-gray-200 bg-[#FDFBF7]">
          <button
            type="button"
            onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
            aria-expanded={isMobileSummaryOpen}
            className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left"
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
                <label className="flex items-center gap-2 mt-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm">{c.newsletter}</span>
                </label>
              </div>

              {/* Shipping Address */}
              {!showDeliveryStep && !showPayment && (
                <div>
                  <div className="mb-8">
                    <h2 className="text-xl font-black mb-4">{c.deliveryAddress}</h2>

                    <div className="space-y-4">
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-black"
                      >
                        <option value="Switzerland">{c.country}</option>
                      </select>

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

                      <select
                        value={kanton}
                        onChange={(e) => setKanton(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-black"
                      >
                        <option value="Zürich">Zürich</option>
                      </select>
                    </div>
                  </div>

                  {formError && (
                    <div role="alert" aria-live="polite" className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>{formError}</span>
                    </div>
                  )}
                  <div className="sticky bottom-0 -mx-4 mt-4 border-t border-gray-200 bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:pt-0 lg:pb-0">
                    <button
                      type="button"
                      onClick={handleContinueToDelivery}
                      className="w-full bg-black text-white py-4 rounded-lg font-black text-base tracking-tight hover:bg-gray-900 transition-colors"
                    >
                      {c.continueToDelivery}
                    </button>
                  </div>
                </div>
              )}

              {/* Delivery Date & Time Section */}
              {showDeliveryStep && !showPayment && (
                <div>
                  <button
                    onClick={() => setShowDeliveryStep(false)}
                    className="text-sm text-gray-600 hover:text-black mb-4 flex items-center gap-2"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    {c.backToAddress}
                  </button>

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
                          max-width: 2.5rem;
                          text-transform: uppercase;
                          font-size: 0.7rem;
                          letter-spacing: 0.1em;
                          margin: 0;
                          text-align: center;
                        }
                        .react-datepicker__day {
                          width: 14.28%;
                          max-width: 2.5rem;
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
                          transition: all 0.2s;
                          text-align: center;
                        }
                        .react-datepicker__day:hover:not(.react-datepicker__day--disabled) {
                          background-color: #E6D5C0;
                          color: #651A1A;
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
                      `}</style>

                      <div className="bg-[#FFFCF8] border border-[#E6D5C0] rounded-2xl p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-center mb-6">
                        {/* Left Side: Calendar */}
                        <div className="flex-1 w-full max-w-[360px] lg:max-w-none">
                          <DatePicker
                            selected={deliveryDate}
                            onChange={(date) => {
                              setDeliveryDate(date)
                              if (date && deliveryTime && !isSlotAvailable(deliveryTime, date)) {
                                setDeliveryTime("")
                              }
                            }}
                            minDate={minDeliveryDate}
                            excludeDates={blockedDates}
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
                              <div className="flex items-center justify-between px-2 mb-4">
                                <button
                                  onClick={decreaseMonth}
                                  disabled={prevMonthButtonDisabled}
                                  type="button"
                                  className="p-2 hover:bg-[#E6D5C0] rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent text-[#651A1A]"
                                >
                                  <ChevronLeft className="w-5 h-5" />
                                </button>

                                <h3 className="text-xl font-black text-[#1a1a1a] font-serif capitalize">
                                  {date.toLocaleDateString(locale === 'en' ? 'en-GB' : 'de-CH', {
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </h3>

                                <button
                                  onClick={increaseMonth}
                                  disabled={nextMonthButtonDisabled}
                                  type="button"
                                  className="p-2 hover:bg-[#E6D5C0] rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent text-[#651A1A]"
                                >
                                  <ChevronRight className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                          />
                        </div>

                        {/* Divider (Desktop) */}
                        <div className="hidden lg:block w-px h-64 bg-[#E6D5C0] opacity-50"></div>

                        {/* Right Side: Date Info */}
                        <div className="w-full lg:w-1/3 flex flex-col items-center lg:items-start justify-center text-center lg:text-left">
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
                              onClick={() => setDeliveryTime(slot)}
                              className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${!available
                                ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                                : deliveryTime === slot
                                  ? "border-[#651A1A] bg-[#F5E6D3] shadow-md [@media(hover:hover)]:hover:scale-105"
                                  : "border-gray-300 bg-white hover:border-gray-400 [@media(hover:hover)]:hover:scale-105"
                                }`}
                            >
                              <div className="flex items-center justify-center gap-2">
                                <svg className={`w-5 h-5 ${available ? "text-[#651A1A]" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className={`font-bold text-sm ${available ? "" : "text-gray-400 line-through"}`}>{slot}</span>
                              </div>
                              {!available && (
                                <p className="text-[0.65rem] text-gray-400 mt-1">{c.slotUnavailable}</p>
                              )}
                              {available && deliveryTime === slot && (
                                <div className="absolute top-2 right-2 bg-[#651A1A] rounded-full w-5 h-5 flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {(deliveryError || paymentInitError) && (
                    <div role="alert" aria-live="polite" className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>{deliveryError || paymentInitError}</span>
                    </div>
                  )}
                  <div className="sticky bottom-0 -mx-4 mt-4 border-t border-gray-200 bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:pt-0 lg:pb-0">
                    <button
                      type="button"
                      onClick={handleContinueToPayment}
                      className="w-full bg-black text-white py-4 rounded-lg font-black text-base tracking-tight hover:bg-gray-900 transition-colors"
                    >
                      {c.continueToPayment}
                    </button>
                  </div>
                </div>
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
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary: '#000000',
                        },
                      },
                    }}
                  >
                    <PaymentForm clientSecret={clientSecret} />
                  </Elements>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:border-l lg:pl-12">
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
            <div className="mb-6">
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
                  className="shrink-0 whitespace-nowrap px-4 py-3 bg-gray-100 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  {c.applyCode}
                </button>
              </div>
              {discountCodeError && (
                <p className="text-sm text-red-600 mt-2">{discountCodeError}</p>
              )}
            </div>

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
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <VisaIcon className="h-7 w-auto" />
              <MastercardIcon className="h-7 w-auto" />
              <ApplePayIcon className="h-7 w-auto" />
              <TwintIcon className="h-7 w-auto" />
            </div>

            {/* Limited Offer */}
            {!upsellAdded && (
              <div className="mt-6 p-4 bg-pink-50 rounded-lg">
                <h3 className="font-bold text-sm mb-2">{c.upsellTitle}</h3>
                <div className="flex gap-3 items-center">
                  <img
                    src="/original3.jpeg"
                    alt="Angebot"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold">CLASSIC (2-3 Personen)</p>
                    <p className="text-xs text-gray-600">(10% RABATT)</p>
                    <p className="text-sm">
                      <span className="font-bold"><PriceDisplay amount={14.31} showCurrency={false} className="text-sm" /> CHF</span>{" "}
                      <span className="text-gray-500 line-through"><PriceDisplay amount={15.90} showCurrency={false} className="text-sm" /> CHF</span>
                    </p>
                  </div>
                  <button
                    onClick={handleAddUpsellProduct}
                    className="px-4 py-2 bg-black text-white rounded-lg font-bold text-sm hover:bg-gray-900 transition-colors"
                  >
                    {c.upsellAdd}
                  </button>
                </div>
              </div>
            )}
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
