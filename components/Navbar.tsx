'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, Search, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'

export default function Navbar() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [language, setLanguage] = useState<'DE' | 'EN'>('DE')
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)

  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    totalPrice,
    cartItemCount
  } = useCart()

  const handleCheckout = () => {
    setIsCartOpen(false)
    router.push('/checkout')
  }

  return (
    <>
      <nav className="bg-[#651A1A] border-b border-[#8B3A3A] z-30 transition-all duration-300">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Left Side - About */}
            <div className="flex-1 flex items-center gap-8">
              <Link
                href="/uber-uns"
                className="group relative text-[#F5E6D3] hover:text-white transition-colors duration-300 text-xs font-medium tracking-[0.2em] uppercase"
              >
                {language === 'DE' ? 'Über Uns' : 'About Us'}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#D4AF85] transition-all duration-300 group-hover:w-full" />
              </Link>
            </div>

            {/* Logo - Centered */}
            <Link href="/" className="flex-shrink-0 transform hover:scale-105 transition-transform duration-500">
              <Image
                src="/logo.png"
                alt="Emilia"
                width={240}
                height={60}
                className="object-contain max-w-[160px] md:max-w-[220px] brightness-0 invert"
                priority
              />
            </Link>

            {/* Right Side Actions */}
            <div className="flex items-center gap-6 flex-1 justify-end">
              {/* Language Selector */}
              <div className="hidden md:block relative group">
                <button
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="text-[#F5E6D3] hover:text-white transition-colors duration-300 text-xs font-medium tracking-widest flex items-center gap-1"
                >
                  {language}
                  <span className="w-1 h-1 rounded-full bg-[#D4AF85] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
                {isLanguageDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsLanguageDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-4 bg-[#651A1A] border border-[#8B3A3A] rounded-xl shadow-xl z-20 min-w-[100px] overflow-hidden py-2">
                      <button
                        onClick={() => {
                          setLanguage('DE')
                          setIsLanguageDropdownOpen(false)
                        }}
                        className={`block w-full text-left px-6 py-2 text-xs tracking-widest hover:bg-white/5 transition-colors ${language === 'DE' ? 'text-white font-bold' : 'text-[#F5E6D3]/70'
                          }`}
                      >
                        DE
                      </button>
                      <button
                        onClick={() => {
                          setLanguage('EN')
                          setIsLanguageDropdownOpen(false)
                        }}
                        className={`block w-full text-left px-6 py-2 text-xs tracking-widest hover:bg-white/5 transition-colors ${language === 'EN' ? 'text-white font-bold' : 'text-[#F5E6D3]/70'
                          }`}
                      >
                        EN
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Shopping Bag */}
              <Button
                variant="ghost"
                size="icon"
                className="text-[#F5E6D3] hover:text-white hover:bg-white/10 relative rounded-full w-10 h-10 transition-all duration-300"
                aria-label="Shopping bag"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-[#D4AF85] text-[#651A1A] rounded-full text-[9px] font-black flex items-center justify-center shadow-sm transform scale-100 transition-transform duration-300">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Shopping Cart Sidebar */}
      {isCartOpen && (
        <>
          {/* Overlay with blur */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Cart Panel */}
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl overflow-y-auto animate-slide-in">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-medium tracking-wide text-black uppercase">Warenkorb</h2>
                  <p className="text-xs text-gray-500 mt-1 font-light tracking-wider">{cartItemCount} {cartItemCount === 1 ? 'ARTIKEL' : 'ARTIKEL'}</p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-black hover:opacity-50 transition-opacity duration-200"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="p-6">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                  <ShoppingBag className="w-12 h-12 text-gray-200 mb-4" strokeWidth={1} />
                  <h3 className="text-lg font-medium text-black mb-2 tracking-wide">Ihr Warenkorb ist leer</h3>
                  <p className="text-sm text-gray-500 mb-8 font-light">Entdecken Sie unsere handgemachten Käsekuchen.</p>
                  <Link href="/">
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="bg-black text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-gray-900 transition-colors duration-300"
                    >
                      Einkaufen
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-8">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-6">
                      {/* Image */}
                      <div className="w-24 h-24 bg-gray-50 overflow-hidden flex-shrink-0 relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-base text-black tracking-wide uppercase">{item.name}</h3>
                            <p className="text-xs text-gray-500 mt-1 font-light">{item.size} Personen</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-300 hover:text-black transition-colors duration-200"
                          >
                            <X className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>

                        <div className="flex items-end justify-between">
                          <div className="flex items-center border border-gray-200">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500"
                            >
                              −
                            </button>
                            <span className="text-xs font-medium w-8 text-center text-black">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-medium text-sm text-black tracking-wide">{(item.price * item.quantity).toFixed(2)} CHF</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checkout Section */}
            {cartItems.length > 0 && (
              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 space-y-6">
                {/* Discount Info - Minimalist */}
                <div className="space-y-3">
                  {totalPrice >= 120 ? (
                    <div className="flex items-center justify-between gap-3 text-[#651A1A] bg-[#F5E6D3]/30 border border-[#D4AF85]/30 p-4 rounded-lg">
                      <span className="text-xs font-bold tracking-widest uppercase">15% Rabatt aktiviert</span>
                      <span className="text-xs font-bold">-{(totalPrice * 0.15).toFixed(2)} CHF</span>
                    </div>
                  ) : (
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between text-xs uppercase tracking-wider text-gray-600 font-medium">
                        <span>Bis 15% Rabatt</span>
                        <span>Noch {(120 - totalPrice).toFixed(2)} CHF</span>
                      </div>
                      <div className="h-1 bg-gray-200 w-full overflow-hidden rounded-full">
                        <div
                          className="h-full bg-[#651A1A] transition-all duration-500 rounded-full"
                          style={{ width: `${(totalPrice / 120) * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 text-center font-light tracking-wide">
                        Erreichen Sie 120 CHF für 15% Rabatt
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-sm font-light text-gray-600">
                      <span>Zwischensumme</span>
                      <span>{totalPrice.toFixed(2)} CHF</span>
                    </div>
                    {totalPrice >= 120 && (
                      <div className="flex items-center justify-between text-base font-black text-[#651A1A] bg-[#F5E6D3] px-3 py-2 rounded-md -mx-3">
                        <span>RABATT (15%)</span>
                        <span>-{(totalPrice * 0.15).toFixed(2)} CHF</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-lg font-black text-black pt-2 border-t border-gray-100">
                      <span>Gesamt</span>
                      <span>{(totalPrice * (totalPrice >= 120 ? 0.85 : 1)).toFixed(2)} CHF</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-black text-white py-4 text-sm font-medium tracking-[0.2em] uppercase hover:bg-[#651A1A] transition-colors duration-300"
                >
                  Zur Kasse
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
