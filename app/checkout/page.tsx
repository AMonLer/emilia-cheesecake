"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronRight, X } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import Navbar from "@/components/Navbar"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

function PaymentForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const router = useRouter()

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
        setErrorMessage(error.message || "Ocurrió un error al procesar el pago")
        setIsProcessing(false)
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Ocurrió un error inesperado")
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
        {isProcessing ? "Wird verarbeitet..." : "Jetzt bezahlen"}
      </button>
    </form>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems, totalPrice, removeItem, addToCart } = useCart()
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [country, setCountry] = useState("Switzerland")
  const [kanton, setKanton] = useState("Zürich")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [deliveryTime, setDeliveryTime] = useState("")
  const [clientSecret, setClientSecret] = useState<string>("")
  const [showPayment, setShowPayment] = useState(false)
  const [showDeliveryStep, setShowDeliveryStep] = useState(false)

  // Calculate minimum delivery date (36 hours from now)
  const getMinDeliveryDate = () => {
    const minDate = new Date()
    minDate.setHours(minDate.getHours() + 36)
    return minDate.toISOString().split('T')[0]
  }

  // Generate time slots
  const timeSlots = [
    "09:00 - 12:00",
    "12:00 - 15:00",
    "15:00 - 18:00",
    "18:00 - 21:00"
  ]

  // Calculate discount
  const discount = totalPrice >= 120 ? totalPrice * 0.15 : 0
  const finalPrice = totalPrice - discount

  const handleAddUpsellProduct = () => {
    const upsellProduct = {
      id: `clasica-upsell-${Date.now()}`,
      name: "CLÁSICA",
      price: 20.00, // Discounted upsell price
      size: "2-3",
      image: "/original3.png",
      quantity: 1
    }
    addToCart(upsellProduct)
  }

  const handleContinueToDelivery = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !firstName || !lastName || !address || !city || !postalCode) {
      alert("Bitte füllen Sie alle erforderlichen Felder aus")
      return
    }

    setShowDeliveryStep(true)
  }

  const handleContinueToPayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!deliveryDate || !deliveryTime) {
      alert("Bitte wählen Sie Lieferdatum und -zeit")
      return
    }

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
            firstName,
            lastName,
            address,
            city,
            postalCode,
            kanton,
            deliveryDate,
            deliveryTime,
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
        setClientSecret(data.clientSecret)
        setShowPayment(true)
      } else {
        alert('Error al iniciar el pago. Por favor intenta de nuevo.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al iniciar el pago. Por favor intenta de nuevo.')
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-black mb-4">Ihr Warenkorb ist leer</h1>
          <Link href="/" className="text-black underline font-bold">
            Weiter einkaufen
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
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/" className="text-pink-500 hover:underline">Warenkorb</Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium">Informationen</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400">Zahlung</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Left Side - Form */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-black mb-8">Emilia</h1>

              {/* Contact Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black">Kontakt</h2>
                  <Link href="#" className="text-sm text-gray-600 hover:text-black">
                    Anmelden
                  </Link>
                </div>
                <input
                  type="email"
                  placeholder="E-Mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-black"
                  required
                />
                <label className="flex items-center gap-2 mt-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm">Senden Sie mir Neuigkeiten und Angebote per E-Mail</span>
                </label>
              </div>

              {/* Shipping Address */}
              {!showDeliveryStep && !showPayment && (
                <div>
                  <div className="mb-8">
                    <h2 className="text-xl font-black mb-4">Lieferadresse</h2>

                    <div className="space-y-4">
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-black"
                      >
                        <option value="Switzerland">Schweiz</option>
                      </select>

                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Vorname"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-black"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Nachname"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-black"
                          required
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="Adresse"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-black"
                        required
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Stadt"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-black"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Postleitzahl"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-black"
                          required
                        />
                      </div>

                      <select
                        value={kanton}
                        onChange={(e) => setKanton(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-black"
                      >
                        <option value="Zürich">Zürich</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleContinueToDelivery}
                    className="w-full bg-black text-white py-4 rounded-lg font-black text-base tracking-tight hover:bg-gray-900 transition-colors"
                  >
                    Weiter zur Lieferzeit
                  </button>
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
                    Zurück zur Adresse
                  </button>

                  <h2 className="text-xl font-black mb-2">Lieferung</h2>
                  <p className="text-sm text-gray-600 mb-6 flex items-start gap-2">
                    <svg className="w-5 h-5 text-[#651A1A] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Bestellungen benötigen mindestens 36 Stunden Vorlaufzeit. Alle Käsekuchen werden frisch für Sie gebacken.</span>
                  </p>

                  <div className="space-y-4 mb-8">
                    {/* Date Picker */}
                    <div>
                      <label className="block text-sm font-bold mb-2">Lieferdatum</label>
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        min={getMinDeliveryDate()}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-black"
                        required
                      />
                    </div>

                    {/* Time Slot Picker */}
                    <div>
                      <label className="block text-sm font-bold mb-3">Gewünschte Lieferzeit</label>
                      <div className="grid grid-cols-2 gap-3">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setDeliveryTime(slot)}
                            className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                              deliveryTime === slot
                                ? "border-[#651A1A] bg-[#F5E6D3] shadow-md"
                                : "border-gray-300 bg-white hover:border-gray-400"
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <svg className="w-5 h-5 text-[#651A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-bold text-sm">{slot}</span>
                            </div>
                            {deliveryTime === slot && (
                              <div className="absolute top-2 right-2 bg-[#651A1A] rounded-full w-5 h-5 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleContinueToPayment}
                    className="w-full bg-black text-white py-4 rounded-lg font-black text-base tracking-tight hover:bg-gray-900 transition-colors"
                  >
                    Weiter zur Zahlung
                  </button>
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
                    Zurück zur Lieferzeit
                  </button>

                  <h2 className="text-xl font-black mb-4">Zahlung</h2>
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
            <h2 className="text-xl font-black mb-6">Bestellübersicht</h2>

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
                    <p className="text-xs text-gray-600">{item.size} Personen</p>
                    <p className="text-xs text-gray-900 font-bold mt-1">Menge: {item.quantity}</p>
                  </div>
                  <div className="font-bold">{(item.price * item.quantity).toFixed(2)} CHF</div>
                </div>
              ))}
            </div>

            {/* Discount Code */}
            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Rabattcode oder Geschenkkarte"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black"
                />
                <button className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors">
                  Anwenden
                </button>
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-3 border-t pt-6">
              <div className="flex justify-between text-sm">
                <span>Zwischensumme</span>
                <span className={discount > 0 ? "text-gray-500 line-through" : "font-bold"}>{totalPrice.toFixed(2)} CHF</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-700 font-bold">15% Rabatt</span>
                  <span className="text-green-600 font-bold">-{discount.toFixed(2)} CHF</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Versand</span>
                <span className="text-gray-600">Wird im nächsten Schritt berechnet</span>
              </div>
              <div className="flex justify-between text-lg font-black border-t pt-3">
                <span>Gesamt</span>
                <span className={discount > 0 ? "text-green-600" : ""}>CHF {finalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Limited Offer */}
            <div className="mt-6 p-4 bg-pink-50 rounded-lg">
              <h3 className="font-bold text-sm mb-2">Zeitlich begrenztes Angebot! Füge mehr hinzu und spare</h3>
              <div className="flex gap-3 items-center">
                <img
                  src="/original3.png"
                  alt="Angebot"
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold">CLÁSICA (2-3 Personen)</p>
                  <p className="text-xs text-gray-600">(10% RABATT)</p>
                  <p className="text-sm">
                    <span className="font-bold">20.00 CHF</span>{" "}
                    <span className="text-gray-500 line-through">27.00 CHF</span>
                  </p>
                </div>
                <button
                  onClick={handleAddUpsellProduct}
                  className="px-4 py-2 bg-black text-white rounded-lg font-bold text-sm hover:bg-gray-900 transition-colors"
                >
                  Hinzufügen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
