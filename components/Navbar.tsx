'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, Search, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart, EASTER_GIFT_OPTIONS } from '@/contexts/CartContext'
import PriceDisplay from '@/components/PriceDisplay'

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
    cartItemCount,
    easterGiftPendingCakeId,
    setEasterGiftPendingCakeId,
    addEasterGift,
  } = useCart()

  // Block body scroll when Easter gift modal is open
  useEffect(() => {
    if (easterGiftPendingCakeId) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [easterGiftPendingCakeId])

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
                src="/Emilia (6).png"
                alt="Emilia"
                width={180}
                height={50}
                className="object-contain max-w-[120px] md:max-w-[170px]"
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
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-base text-black tracking-wide uppercase">{item.name}</h3>
                              {item.price === 13.5 && (
                                <span className="bg-[#651A1A] text-[#F5E6D3] text-[9px] px-1.5 py-0.5 rounded-sm tracking-widest font-bold">
                                  ANGEBOT
                                </span>
                              )}
                              {item.id.includes('easter-gift') && (
                                <span className="bg-[#651A1A] text-[#F5E6D3] text-[9px] px-1.5 py-0.5 rounded-sm tracking-widest font-bold">
                                  GESCHENK
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 font-light">{item.size} Personen</p>
                          </div>
                          {!item.id.includes('easter-gift') && (
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-gray-300 hover:text-black transition-colors duration-200"
                            >
                              <X className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                          )}
                        </div>

                        <div className="flex items-end justify-between">
                          {item.id.includes('easter-gift') ? (
                            <span className="text-xs text-gray-400 font-light">2-3 Personen</span>
                          ) : (
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
                          )}
                          {item.id.includes('easter-gift') ? (
                            <span className="text-lg font-black text-green-600 tracking-wide">GRATIS</span>
                          ) : (
                            <PriceDisplay amount={item.price * item.quantity} className="text-lg font-black text-black tracking-wide" />
                          )}
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
                  {totalPrice >= 100 ? (
                    <div className="flex items-center justify-between gap-3 text-[#651A1A] bg-[#F5E6D3]/30 border border-[#D4AF85]/30 p-4 rounded-lg">
                      <span className="text-xs font-bold tracking-widest uppercase">10% Rabatt aktiviert</span>
                      <span className="text-xs font-bold font-serif flex items-center">
                        -<PriceDisplay
                          amount={totalPrice * 0.10}
                          className="text-base font-black"
                          currencyClassName="text-[0.5em] opacity-100"
                        />
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between text-xs uppercase tracking-wider text-gray-600 font-medium">
                        <span>Bis 10% Rabatt</span>
                        <span>Noch {(100 - totalPrice).toFixed(2)} CHF</span>
                      </div>
                      <div className="h-1 bg-gray-200 w-full overflow-hidden rounded-full">
                        <div
                          className="h-full bg-[#651A1A] transition-all duration-500 rounded-full"
                          style={{ width: `${(totalPrice / 100) * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 text-center font-light tracking-wide">
                        Erreichen Sie 100 CHF für 10% Rabatt
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-sm font-light text-gray-600">
                      <span>Zwischensumme</span>
                      <PriceDisplay amount={totalPrice} className="text-base font-bold text-black" />
                    </div>
                    <div className="flex items-center justify-between text-sm font-light text-gray-600">
                      <span>Versand</span>
                      <PriceDisplay amount={6.00} className="text-base font-bold text-black" />
                    </div>
                    {totalPrice >= 100 && (
                      <div className="flex items-center justify-between text-base font-black text-[#651A1A] bg-[#F5E6D3] px-3 py-2 rounded-md -mx-3">
                        <span>RABATT (10%)</span>
                        <span className="flex items-center">
                          -<PriceDisplay
                            amount={totalPrice * 0.10}
                            className="text-lg"
                            currencyClassName="text-[0.6em] opacity-100"
                          />
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-lg font-black text-black pt-2 border-t border-gray-100">
                      <span>Gesamt</span>
                      <PriceDisplay amount={(totalPrice * (totalPrice >= 100 ? 0.90 : 1) + 6)} className="text-2xl font-black" />
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
      {/* Easter Gift Modal */}
      {easterGiftPendingCakeId && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] transition-opacity duration-500 touch-none"
            onClick={() => {
              setEasterGiftPendingCakeId(null)
              setIsCartOpen(true)
            }}
          />
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-6 overscroll-contain">
            <div className="bg-[#F5E6D3] rounded-t-3xl sm:rounded-[2rem] shadow-2xl max-w-2xl w-full max-h-[90vh] sm:max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-500 border border-[#D4AF85]/30">
              {/* Premium Header */}
              <div className="relative flex-shrink-0 bg-gradient-to-br from-[#651A1A] to-[#4A1010] px-5 py-5 sm:p-8 md:p-10 text-center overflow-hidden">
                {/* Decorative BG elements */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#D4AF85]/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#D4AF85]/20 rounded-full blur-2xl"></div>

                <div className="relative z-10 flex flex-col items-center justify-center">
                  {/* Elegant Easter Bunny */}
                  <div className="mb-3 sm:mb-4 w-28 h-28 sm:w-36 sm:h-36 opacity-100 drop-shadow-[0_0_15px_rgba(212,175,133,0.3)] pointer-events-none">
                    <img src="/Easter.png" alt="Easter Graphic" className="w-full h-full object-contain" />
                  </div>

                  <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 bg-[#D4AF85]/10 text-[#D4AF85] rounded-full text-[10px] sm:text-xs font-bold tracking-[0.2em] mb-2 sm:mb-4 border border-[#D4AF85]/30 uppercase">
                    Exklusives Angebot
                  </span>
                  <h3 className="text-xl sm:text-3xl md:text-4xl font-serif font-bold text-[#F5E6D3] mb-1.5 sm:mb-3 drop-shadow-md">
                    Dein Oster-Geschenk!
                  </h3>
                  <p className="text-[#F5E6D3]/90 font-light tracking-wide max-w-sm mx-auto text-xs sm:text-sm md:text-base leading-relaxed">
                    Wähle eine <b className="font-bold">kleine Torte</b> zu deiner grossen Torte!
                  </p>
                </div>
              </div>

              {/* Gift Options */}
              <div className="p-5 sm:p-6 md:p-10 bg-white/50 backdrop-blur-sm relative overflow-y-auto">
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-3 sm:gap-4 md:gap-5 mb-4 sm:mb-8">
                  {EASTER_GIFT_OPTIONS.map((gift) => (
                    <button
                      key={gift.slug}
                      type="button"
                      onClick={() => addEasterGift(easterGiftPendingCakeId, gift)}
                      className="group relative sm:w-[135px] md:w-[160px] flex flex-col items-center bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm active:scale-95 sm:hover:shadow-2xl sm:hover:border-[#D4AF85]/50 transition-all duration-300 sm:duration-500 sm:hover:-translate-y-2"
                    >
                      {/* Gratis Tag */}
                      <div className="absolute -top-2 sm:-top-3 right-[-3px] sm:right-[-5px] bg-[#651A1A] text-[#F5E6D3] text-[8px] sm:text-[10px] md:text-xs font-bold tracking-widest px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full z-10 shadow-sm border border-[#D4AF85]/20">
                        GRATIS
                      </div>

                      <div className="w-full aspect-square relative mb-2 sm:mb-4 overflow-hidden rounded-lg sm:rounded-xl bg-[#F5E6D3]/20 border border-gray-50">
                        <img
                          src={gift.image}
                          alt={gift.name}
                          className="w-full h-full object-cover sm:group-hover:scale-[1.15] transition-transform duration-700"
                        />
                      </div>

                      <span className="text-[10px] sm:text-xs md:text-sm font-bold text-center text-[#651A1A] uppercase tracking-wide sm:tracking-[0.1em] leading-tight">
                        {gift.name}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex justify-center pb-1 sm:pb-2">
                  <button
                    onClick={() => {
                      setEasterGiftPendingCakeId(null)
                      setIsCartOpen(true)
                    }}
                    className="relative text-[10px] md:text-xs text-gray-400 hover:text-[#651A1A] font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase transition-all duration-300 group py-2"
                  >
                    Nein danke, weiter ohne Geschenk
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D4AF85] transition-all duration-500 group-hover:w-full"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
