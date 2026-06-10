'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { useLanguage } from '@/contexts/LanguageContext'
import PriceDisplay from '@/components/PriceDisplay'

export default function Navbar() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { locale, setLocale, t } = useLanguage()
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    totalPrice,
    cartItemCount,
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
            {/* Left Side - Order & About */}
            <div className="flex-1 flex items-center gap-4 md:gap-8">
              <Link
                href="/bestellen"
                className="group relative text-white hover:text-white transition-colors duration-300 text-xs font-bold tracking-[0.2em] uppercase"
              >
                {t.nav.order}
                <span className="absolute -bottom-1 left-0 w-full h-px bg-[#D4AF85] transition-all duration-300" />
              </Link>
              <Link
                href="/uber-uns"
                className="group relative hidden sm:block text-[#F5E6D3] hover:text-white transition-colors duration-300 text-xs font-medium tracking-[0.2em] uppercase"
              >
                {t.nav.aboutUs}
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
            <div className="flex items-center gap-4 flex-1 justify-end">
              {/* Language Switcher */}
              <div className="flex items-center text-[#F5E6D3] text-xs font-bold tracking-widest">
                <button
                  onClick={() => setLocale('de')}
                  className={`px-1 transition-opacity duration-200 ${locale === 'de' ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
                >
                  DE
                </button>
                <span className="opacity-30 mx-0.5">|</span>
                <button
                  onClick={() => setLocale('en')}
                  className={`px-1 transition-opacity duration-200 ${locale === 'en' ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
                >
                  EN
                </button>
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
                  <h2 className="text-xl font-medium tracking-wide text-black uppercase">{t.cart.title}</h2>
                  <p className="text-xs text-gray-500 mt-1 font-light tracking-wider">{cartItemCount} {t.cart.items}</p>
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
                  <h3 className="text-lg font-medium text-black mb-2 tracking-wide">{t.cart.empty}</h3>
                  <p className="text-sm text-gray-500 mb-8 font-light">{t.cart.emptyDesc}</p>
                  <Link href="/">
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="bg-black text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-gray-900 transition-colors duration-300"
                    >
                      {t.cart.shop}
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
                                  {t.cart.offer}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 font-light">{item.size} {t.cart.persons}</p>
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
                          <PriceDisplay amount={item.price * item.quantity} className="text-lg font-black text-black tracking-wide" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checkout Section */}
            {cartItems.length > 0 && (
              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 space-y-5">
                <div className="space-y-3">
                    {totalPrice >= 100 ? (
                      <div className="flex items-center justify-between gap-3 text-[#651A1A] bg-[#F5E6D3]/30 border border-[#D4AF85]/30 p-3 rounded-lg">
                        <span className="text-xs font-bold tracking-widest uppercase">{t.cart.discountActivated}</span>
                        <span className="text-xs font-bold font-serif flex items-center">
                          -<PriceDisplay
                            amount={totalPrice * 0.10}
                            className="text-base font-black"
                            currencyClassName="text-[0.5em] opacity-100"
                          />
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between text-xs uppercase tracking-wider text-gray-600 font-medium">
                          <span>{t.cart.untilDiscount}</span>
                          <span>{t.cart.remaining((100 - totalPrice).toFixed(2))}</span>
                        </div>
                        <div className="h-1 bg-gray-200 w-full overflow-hidden rounded-full">
                          <div
                            className="h-full bg-[#651A1A] transition-all duration-500 rounded-full"
                            style={{ width: `${(totalPrice / 100) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-light text-gray-500">
                    <span>{t.cart.subtotal}</span>
                    <PriceDisplay amount={totalPrice} className="text-sm font-bold text-black" />
                  </div>
                  <div className="flex items-center justify-between text-sm font-light text-gray-500">
                    <span>{t.cart.shipping}</span>
                    {totalPrice >= 100 ? (
                      <span className="text-sm font-bold text-green-600">{t.cart.free}</span>
                    ) : (
                      <PriceDisplay amount={8.40} className="text-sm font-bold text-black" />
                    )}
                  </div>
                  {totalPrice >= 100 && (
                    <div className="flex items-center justify-between text-sm font-black text-[#651A1A]">
                      <span>{t.cart.discount}</span>
                      <span className="flex items-center">
                        -<PriceDisplay
                          amount={totalPrice * 0.10}
                          className="text-sm"
                          currencyClassName="text-[0.6em] opacity-100"
                        />
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-lg font-black text-black pt-2 border-t border-gray-100">
                    <span>{t.cart.total}</span>
                    <PriceDisplay amount={(totalPrice * (totalPrice >= 100 ? 0.90 : 1) + (totalPrice >= 100 ? 0 : 8.40))} className="text-2xl font-black" />
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-black text-white py-4 text-sm font-medium tracking-[0.2em] uppercase hover:bg-[#651A1A] transition-colors duration-300"
                >
                  {t.cart.checkout}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
