"use client"

import { useState, useRef, TouchEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import PriceDisplay from "@/components/PriceDisplay"
import { ShoppingCart, X, Check } from "lucide-react"
import { useCart } from "@/contexts/CartContext"

interface ProductCardProps {
    href: string
    image1: string
    image2: string
    name: string
    description: string
    priceSmall?: number
    priceLarge?: number
    slug?: string
    tag?: {
        label: string
        bgColor: string
        textColor: string
    }
    className?: string
}

export default function ProductCard({ href, image1, image2, name, description, priceSmall, priceLarge, slug, tag, className = "" }: ProductCardProps) {
    const [showSecondImage, setShowSecondImage] = useState(false)
    const [showSizePopup, setShowSizePopup] = useState(false)
    const [selectedSize, setSelectedSize] = useState<string | null>(null)
    const imageContainerRef = useRef<HTMLDivElement>(null)
    const { addToCart } = useCart()

    const handleTouchStart = (e: TouchEvent) => {
        setShowSecondImage(true)
    }

    const handleTouchEnd = () => {
        setShowSecondImage(false)
    }

    const handleCartClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setSelectedSize(null)
        setShowSizePopup(true)
    }

    const handleAddToCart = (size: "2-3" | "8-10") => {
        if (!slug || !priceSmall || !priceLarge) return
        setSelectedSize(size)
        addToCart({
            id: `${slug}-${size}-${Date.now()}`,
            name,
            price: size === "2-3" ? priceSmall : priceLarge,
            size,
            image: image1,
            quantity: 1,
        })
        setTimeout(() => {
            setShowSizePopup(false)
            setSelectedSize(null)
        }, 400)
    }

    return (
        <>
            <Link href={href} className={`bg-[#F5E6D3] rounded-2xl overflow-hidden group cursor-pointer flex flex-col ${className}`}>
                <div
                    className="relative h-48 md:h-80"
                    ref={imageContainerRef}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {tag && (
                        <div className={`absolute top-0 left-4 h-24 w-8 ${tag.bgColor} rounded-b-lg flex items-center justify-center z-10`}>
                            <span className={`${tag.textColor} text-[10px] font-semibold tracking-wider uppercase [writing-mode:vertical-lr] rotate-180`}>
                                {tag.label}
                            </span>
                        </div>
                    )}

                    {/* Desktop hover effect */}
                    <div className="relative w-full h-full hidden md:block">
                        <Image
                            src={image1}
                            alt={name}
                            fill
                            className="object-cover absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-300"
                        />
                        <Image
                            src={image2}
                            alt={name}
                            fill
                            className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                    </div>

                    {/* Mobile long press effect */}
                    <div className="md:hidden w-full h-full relative">
                        <Image
                            src={image1}
                            alt={name}
                            fill
                            className={`object-cover absolute inset-0 transition-opacity duration-200 ${showSecondImage ? 'opacity-0' : 'opacity-100'}`}
                        />
                        <Image
                            src={image2}
                            alt={name}
                            fill
                            className={`object-cover absolute inset-0 transition-opacity duration-200 ${showSecondImage ? 'opacity-100' : 'opacity-0'}`}
                        />
                        <span className="absolute bottom-2 left-2 text-[9px] text-white/70 bg-black/30 px-1.5 py-0.5 rounded-full z-10">+ info</span>
                    </div>
                </div>
                <div className="p-3 md:p-6 text-center flex flex-col flex-1">
                    <h3 className="font-black text-sm md:text-lg tracking-tight">{name}</h3>
                    {priceLarge && (
                        <div className="flex items-baseline justify-center gap-1 mt-0.5 md:mt-1 mb-1 md:mb-2 text-[#651A1A]">
                            <span className="text-[10px] md:text-xs font-bold bg-[#651A1A]/10 text-[#651A1A] px-2 py-0.5 rounded-full mr-2">
                                Klein ausverkauft
                            </span>
                            <PriceDisplay amount={priceLarge} className="text-base md:text-xl" />
                        </div>
                    )}
                    <p className="hidden md:block text-sm leading-relaxed text-gray-700 flex-1">{description}</p>

                    {/* Mobile cart button */}
                    {slug && (
                        <div className="md:hidden mt-1">
                            <button
                                onClick={handleCartClick}
                                className="w-full bg-black text-white py-2 rounded-lg shadow-sm flex items-center justify-center active:scale-95 transition-transform"
                            >
                                <ShoppingCart className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            </Link>

            {/* Size selector popup - Mobile only */}
            {showSizePopup && (
                <div
                    className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center animate-in fade-in duration-200"
                    onClick={() => setShowSizePopup(false)}
                >
                    <div
                        className="bg-white w-full rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-black text-sm tracking-wide uppercase">Größe wählen</h3>
                            <button
                                onClick={() => setShowSizePopup(false)}
                                className="p-1 text-gray-400"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 mb-4">{name}</p>

                        <div className="grid grid-cols-1 gap-3">
                            {/* 8-10 Personen */}
                            <button
                                onClick={() => handleAddToCart("8-10")}
                                className={`relative rounded-xl p-3 transition-all duration-200 border-2 text-left ${selectedSize === "8-10"
                                    ? "bg-[#F5E6D3] border-black"
                                    : "bg-white border-gray-100 active:border-black/30"
                                    }`}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="relative w-12 h-12 flex-shrink-0">
                                        <Image
                                            src={selectedSize === "8-10" ? "/completa1.png" : "/completa.png"}
                                            alt="Complete cheesecake"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                                        <div>
                                            <p className="font-black text-sm text-black">8–10 Personen</p>
                                            <p className="text-xs text-black/60">Ø 24 cm</p>
                                        </div>
                                        <div className="text-[#651A1A]">
                                            <PriceDisplay
                                                amount={priceLarge || 0}
                                                className="text-lg"
                                                currencyClassName="transform translate-y-[-1px]"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {selectedSize === "8-10" && (
                                    <div className="absolute top-2 right-2 bg-black rounded-full p-0.5">
                                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                    </div>
                                )}
                            </button>

                            {/* 2-3 Personen */}
                            <button
                                onClick={(e) => { e.preventDefault(); }}
                                disabled={true}
                                className="relative rounded-xl p-3 transition-all duration-200 border-2 text-left bg-gray-50 border-gray-100 opacity-80 cursor-not-allowed mt-2"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="relative w-12 h-12 flex-shrink-0 grayscale opacity-80">
                                        <Image
                                            src="/cajita.png"
                                            alt="Small cheesecake box"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                                        <div>
                                            <p className="font-black text-sm text-gray-500">2–3 Personen</p>
                                            <p className="text-xs text-gray-400 line-through decoration-gray-300">Ø 14 cm</p>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <span className="bg-[#651A1A] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                                Ausverkauft
                                            </span>
                                            <div className="text-[10px] sm:text-xs font-semibold text-[#651A1A]">
                                                In 2 Wochen zurück
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
