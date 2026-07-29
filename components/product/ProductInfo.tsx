"use client"

import { useState } from "react"
import { useCart } from "@/contexts/CartContext"
import { useLanguage } from "@/contexts/LanguageContext"
import Image from "next/image"
import { Check, CheckCircle, CreditCard } from "lucide-react"
import { VisaIcon, MastercardIcon, ApplePayIcon } from "@/components/icons/PaymentIcons"
import PriceDisplay from "@/components/PriceDisplay"

declare global {
  interface Window {
    fbq: (...args: any[]) => void
  }
}

interface ProductInfoProps {
    product: any
    slug: string
    compact?: boolean | "top" | "bottom"
}

export default function ProductInfo({ product, slug, compact = false }: ProductInfoProps) {
    const [selectedSize, setSelectedSize] = useState<string>("8-10")
    const { addToCart: addToCartContext } = useCart()
    const { t } = useLanguage()
    const pi = t.productInfo

    const addToCart = () => {
        if (!selectedSize) return

        const imageForSize = selectedSize === "2-3"
            ? `/${slug}3.png`
            : product.images[0]

        const newItem = {
            id: `${slug}-${selectedSize}-${Date.now()}`,
            name: product.name,
            price: product.prices[selectedSize],
            size: selectedSize,
            image: imageForSize,
            quantity: 1
        }

        addToCartContext(newItem)

        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'AddToCart', {
                content_name: product.name,
                content_ids: [slug],
                content_type: 'product',
                value: product.prices[selectedSize],
                currency: 'CHF',
            })
        }
    }

    if (compact === "top") {
        return (
            <div className="flex flex-col justify-center h-full">
                <h1 className="text-xl font-black tracking-tight leading-tight text-black mb-2">
                    {product.name}
                </h1>
                <p className="text-xs text-black/70 leading-relaxed">
                    {product.description}
                </p>
            </div>
        )
    }

    if (compact === "bottom") {
        return (
            <div>
                <h3 className="font-black text-xs text-black mb-3 tracking-wide uppercase">{pi.chooseSize}</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                        onClick={() => setSelectedSize("8-10")}
                        className={`relative rounded-xl p-3 transition-all duration-200 border-2 text-left ${selectedSize === "8-10"
                            ? "bg-[#F5E6D3] border-black"
                            : "bg-white border-gray-100"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <div className="relative w-10 h-10 flex-shrink-0">
                                <Image
                                    src={selectedSize === "8-10" ? "/completa1.png" : "/completa.png"}
                                    alt="Complete cheesecake"
                                    fill
                                    sizes="40px"
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-xs text-black">8–10 {pi.persons23.replace('2–3 ', '')}</p>
                                <p className="text-[10px] text-black/60">Ø 24 cm</p>
                                <div className="text-[#651A1A] mt-0.5">
                                    <PriceDisplay amount={product.prices["8-10"]} className="text-sm" />
                                </div>
                            </div>
                        </div>
                        {selectedSize === "8-10" && (
                            <div className="absolute top-2 right-2 bg-black rounded-full p-0.5">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                        )}
                    </button>

                    <button
                        onClick={() => setSelectedSize("2-3")}
                        className={`relative rounded-xl p-3 transition-all duration-200 border-2 text-left ${selectedSize === "2-3"
                            ? "bg-[#F5E6D3] border-black"
                            : "bg-white border-gray-100"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <div className="relative w-10 h-10 flex-shrink-0">
                                <Image
                                    src={selectedSize === "2-3" ? "/cajita1.png" : "/cajita.png"}
                                    alt="Small cheesecake box"
                                    fill
                                    sizes="40px"
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-xs text-black">{pi.persons23}</p>
                                <p className="text-[10px] text-black/60">Ø 14 cm</p>
                                <div className="text-[#651A1A] mt-0.5">
                                    <PriceDisplay amount={product.prices["2-3"]} className="text-sm" />
                                </div>
                            </div>
                        </div>
                        {selectedSize === "2-3" && (
                            <div className="absolute top-2 right-2 bg-black rounded-full p-0.5">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                        )}
                    </button>
                </div>

                <button
                    onClick={addToCart}
                    className="w-full bg-black text-white py-3.5 rounded-xl font-black text-sm tracking-wide hover:bg-gray-900 transition-colors shadow-lg shadow-black/20 mb-6"
                >
                    {pi.addToCart}
                </button>

                <div className="mb-6 space-y-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#651A1A]/10 p-1.5 rounded-full">
                            <CheckCircle className="w-4 h-4 text-[#651A1A]" />
                        </div>
                        <span className="text-xs font-bold text-[#651A1A]">{pi.guarantee}</span>
                    </div>
                    <div className="h-px bg-gray-200 w-full"></div>
                    <div className="flex items-center gap-2">
                        <div className="bg-[#651A1A]/10 p-1.5 rounded-full flex-shrink-0">
                            <CreditCard className="w-4 h-4 text-[#651A1A]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#651A1A] uppercase tracking-wide mb-1">{pi.securePayment}</span>
                            <div className="flex items-center gap-1.5">
                                <VisaIcon className="h-6 w-auto" />
                                <MastercardIcon className="h-6 w-auto" />
                                <ApplePayIcon className="h-6 w-auto" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 border-t border-black/10 pt-5">
                    <ul className="space-y-2">
                        <li className="text-xs font-medium flex items-start text-black/80">
                            <div className="mr-2 mt-0.5 bg-black/10 p-1 rounded-full">
                                <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />
                            </div>
                            <span>{pi.freshness}</span>
                        </li>
                        <li className="text-xs font-medium flex items-start text-black/80">
                            <div className="mr-2 mt-0.5 bg-black/10 p-1 rounded-full">
                                <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />
                            </div>
                            <span>{pi.handcrafted}</span>
                        </li>
                        <li className="text-xs font-medium flex items-start text-black/80">
                            <div className="mr-2 mt-0.5 bg-black/10 p-1 rounded-full">
                                <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />
                            </div>
                            <span>{pi.naturalIngredients}</span>
                        </li>
                    </ul>
                </div>

                {product.ingredients && (
                    <div className="mt-5 border-t border-black/10 pt-4">
                        <details className="group">
                            <summary className="flex items-center justify-between cursor-pointer list-none font-bold text-xs text-black uppercase tracking-wide">
                                {pi.ingredients}
                                <span className="transition group-open:rotate-180">
                                    <svg fill="none" height="20" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                                </span>
                            </summary>
                            <div className="mt-3 text-xs text-black/70 leading-relaxed">
                                <p dangerouslySetInnerHTML={{ __html: product.ingredients }} />
                                <p className="mt-2 text-[9px] uppercase tracking-wider text-black/50">{pi.allergenNote}</p>
                            </div>
                        </details>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full justify-center">
            <div className="mb-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-black">
                    {product.name}
                </h1>
            </div>

            <p className="text-base text-black/80 mb-8 leading-relaxed">
                {product.description}
            </p>

            <div className="mb-8">
                <h3 className="font-black text-sm text-black mb-4 tracking-wide uppercase">{pi.chooseSize}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        onClick={() => setSelectedSize("8-10")}
                        className={`relative rounded-xl p-3 transition-all duration-200 border-2 text-left ${selectedSize === "8-10"
                            ? "bg-[#F5E6D3] border-black"
                            : "bg-white border-gray-100 hover:border-black/30"
                            }`}
                    >
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                                <Image
                                    src={selectedSize === "8-10" ? "/completa1.png" : "/completa.png"}
                                    alt="Complete cheesecake"
                                    fill
                                    sizes="48px"
                                    className="object-contain"
                                />
                            </div>
                            <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                                <div>
                                    <p className="font-black text-xs sm:text-sm text-black truncate">{pi.persons810.replace('8–10', '8–10')}</p>
                                    <p className="text-xs text-black/60">Ø 24 cm</p>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <div className="flex items-baseline gap-1 text-[#651A1A]">
                                        <PriceDisplay
                                            amount={product.prices["8-10"]}
                                            className="text-lg sm:text-xl"
                                            currencyClassName="transform translate-y-[-1px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {selectedSize === "8-10" && (
                            <div className="absolute top-2 right-2 bg-black rounded-full p-0.5">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                        )}
                    </button>

                    <button
                        onClick={() => setSelectedSize("2-3")}
                        className={`relative rounded-xl p-3 transition-all duration-200 border-2 text-left ${selectedSize === "2-3"
                            ? "bg-[#F5E6D3] border-black"
                            : "bg-white border-gray-100 hover:border-black/30"
                            }`}
                    >
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                                <Image
                                    src={selectedSize === "2-3" ? "/cajita1.png" : "/cajita.png"}
                                    alt="Small cheesecake box"
                                    fill
                                    sizes="48px"
                                    className="object-contain"
                                />
                            </div>
                            <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                                <div>
                                    <p className="font-black text-xs sm:text-sm text-black truncate">{pi.persons23}</p>
                                    <p className="text-xs text-black/60">Ø 14 cm</p>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <div className="flex items-baseline gap-1 text-[#651A1A]">
                                        <PriceDisplay
                                            amount={product.prices["2-3"]}
                                            className="text-lg sm:text-xl"
                                            currencyClassName="transform translate-y-[-1px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {selectedSize === "2-3" && (
                            <div className="absolute top-2 right-2 bg-black rounded-full p-0.5">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                        )}
                    </button>
                </div>
            </div>

            <button
                onClick={addToCart}
                className="w-full bg-black text-white py-4 rounded-xl font-black text-base tracking-wide hover:bg-gray-900 transition-colors mb-8 shadow-lg shadow-black/20"
            >
                {pi.addToCartLong}
            </button>

            <div className="mb-8 space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="bg-[#651A1A]/10 p-2 rounded-full">
                        <CheckCircle className="w-5 h-5 text-[#651A1A]" />
                    </div>
                    <span className="text-sm font-bold text-[#651A1A]">{pi.guarantee}</span>
                </div>
                <div className="h-px bg-gray-200 w-full"></div>
                <div className="flex items-center gap-3">
                    <div className="bg-[#651A1A]/10 p-2 rounded-full flex-shrink-0">
                        <CreditCard className="w-5 h-5 text-[#651A1A]" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#651A1A] uppercase tracking-wide mb-2">{pi.securePayment}</span>
                        <div className="flex items-center gap-2">
                            <VisaIcon className="h-8 w-auto" />
                            <MastercardIcon className="h-8 w-auto" />
                            <ApplePayIcon className="h-8 w-auto" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-3 border-t border-black/10 pt-6">
                <ul className="space-y-3">
                    <li className="text-sm font-medium flex items-start text-black/80">
                        <div className="mr-3 mt-0.5 bg-black/10 p-1 rounded-full">
                            <Check className="w-3 h-3 text-black" strokeWidth={3} />
                        </div>
                        <span>{pi.freshness}</span>
                    </li>
                    <li className="text-sm font-medium flex items-start text-black/80">
                        <div className="mr-3 mt-0.5 bg-black/10 p-1 rounded-full">
                            <Check className="w-3 h-3 text-black" strokeWidth={3} />
                        </div>
                        <span>{pi.handcrafted}</span>
                    </li>
                    <li className="text-sm font-medium flex items-start text-black/80">
                        <div className="mr-3 mt-0.5 bg-black/10 p-1 rounded-full">
                            <Check className="w-3 h-3 text-black" strokeWidth={3} />
                        </div>
                        <span>{pi.naturalIngredients}</span>
                    </li>
                </ul>
            </div>

            {product.ingredients && (
                <div className="mt-6 border-t border-black/10 pt-4">
                    <details className="group">
                        <summary className="flex items-center justify-between cursor-pointer list-none font-bold text-sm text-black uppercase tracking-wide">
                            {pi.ingredients}
                            <span className="transition group-open:rotate-180">
                                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                            </span>
                        </summary>
                        <div className="mt-3 text-sm text-black/70 leading-relaxed">
                            <p dangerouslySetInnerHTML={{ __html: product.ingredients }} />
                            <p className="mt-2 text-[10px] uppercase tracking-wider text-black/50">{pi.allergenNote}</p>
                        </div>
                    </details>
                </div>
            )}
        </div>
    )
}
