"use client"

import { useState, useRef, useEffect, TouchEvent } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import PriceDisplay from "@/components/PriceDisplay"
import { ShoppingCart, X, Check } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { useLanguage } from "@/contexts/LanguageContext"

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
    const { t } = useLanguage()

    const touchStart = useRef<{ x: number; y: number } | null>(null)
    // The sheet is portalled to <body>, so it needs to wait for the client.
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    // Close on Escape and stop the page behind the sheet from scrolling.
    useEffect(() => {
        if (!showSizePopup) return
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowSizePopup(false) }
        document.addEventListener('keydown', onKey)
        const previous = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = previous
        }
    }, [showSizePopup])

    // Swipe the sheet down to dismiss it.
    const sheetTouchStartY = useRef<number | null>(null)
    const handleSheetTouchStart = (e: TouchEvent) => {
        sheetTouchStartY.current = e.touches[0].clientY
    }
    const handleSheetTouchEnd = (e: TouchEvent) => {
        if (sheetTouchStartY.current === null) return
        const delta = e.changedTouches[0].clientY - sheetTouchStartY.current
        sheetTouchStartY.current = null
        if (delta > 80) setShowSizePopup(false)
    }

    const handleTouchStart = (e: TouchEvent) => {
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        setShowSecondImage(true)
    }

    // Once the finger starts travelling the user is scrolling, not peeking at the
    // second photo - drop back to the primary image instead of flickering.
    const handleTouchMove = (e: TouchEvent) => {
        if (!touchStart.current) return
        const dx = Math.abs(e.touches[0].clientX - touchStart.current.x)
        const dy = Math.abs(e.touches[0].clientY - touchStart.current.y)
        if (dx > 10 || dy > 10) {
            touchStart.current = null
            setShowSecondImage(false)
        }
    }

    const handleTouchEnd = () => {
        touchStart.current = null
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
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
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
                            sizes="320px"
                            className="object-cover absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-300"
                        />
                        <Image
                            src={image2}
                            alt={name}
                            fill
                            sizes="320px"
                            className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                    </div>

                    {/* Mobile long press effect */}
                    <div className="md:hidden w-full h-full relative">
                        <Image
                            src={image1}
                            alt={name}
                            fill
                            sizes="50vw"
                            className={`object-cover absolute inset-0 transition-opacity duration-200 ${showSecondImage ? 'opacity-0' : 'opacity-100'}`}
                        />
                        <Image
                            src={image2}
                            alt={name}
                            fill
                            sizes="50vw"
                            className={`object-cover absolute inset-0 transition-opacity duration-200 ${showSecondImage ? 'opacity-100' : 'opacity-0'}`}
                        />
                        <span className="absolute bottom-2 left-2 text-[9px] text-white/70 bg-black/30 px-1.5 py-0.5 rounded-full z-10">+ info</span>
                    </div>
                </div>
                <div className="p-3 md:p-6 text-center flex flex-col flex-1">
                    <h3 className="font-black text-sm md:text-lg tracking-tight">{name}</h3>
                    {priceSmall && (
                        <div className="flex items-baseline justify-center gap-1 mt-0.5 md:mt-1 mb-1 md:mb-2 text-[#651A1A]">
                            <span className="text-xs md:text-sm font-medium opacity-60">ab</span>
                            <PriceDisplay amount={priceSmall} className="text-base md:text-xl" />
                        </div>
                    )}
                    <p className="hidden md:block text-sm leading-relaxed text-gray-700 flex-1">{description}</p>

                    {/* Mobile cart button */}
                    {slug && (
                        <div className="md:hidden mt-1">
                            <button
                                onClick={handleCartClick}
                                className="w-full bg-black text-white py-2 rounded-lg shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                            >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold tracking-wider uppercase">{t.productInfo.addToCart}</span>
                            </button>
                        </div>
                    )}
                </div>
            </Link>

            {/* Size selector sheet - mobile only.
                Portalled to <body>: any ancestor with a transform (e.g. the Reveal
                wrapper on the homepage) would otherwise become the containing block
                for position:fixed and strand the sheet far below the viewport. */}
            {showSizePopup && mounted && createPortal(
                <div
                    className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end justify-center animate-in fade-in duration-200"
                    onClick={() => setShowSizePopup(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label={t.productInfo.chooseSize}
                >
                    <div
                        className="bg-white w-full rounded-t-3xl px-5 pt-2 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom duration-300"
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={handleSheetTouchStart}
                        onTouchEnd={handleSheetTouchEnd}
                    >
                        {/* Grab handle - signals the sheet can be swiped away */}
                        <div className="flex justify-center pb-3">
                            <span className="block h-1 w-10 rounded-full bg-gray-300" />
                        </div>

                        <div className="flex items-start justify-between mb-4">
                            <div className="min-w-0">
                                <h3 className="font-black text-base tracking-wide uppercase">{t.productInfo.chooseSize}</h3>
                                <p className="text-xs text-gray-500 mt-0.5 truncate">{name}</p>
                            </div>
                            <button
                                onClick={() => setShowSizePopup(false)}
                                aria-label="Close"
                                className="-mr-2 -mt-1 flex h-11 w-11 flex-shrink-0 items-center justify-center text-gray-400 active:text-black"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

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
                                            sizes="48px"
                                            className="object-contain"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                                        <div>
                                            <p className="font-black text-sm text-black">8–10 {t.cart.persons}</p>
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
                                onClick={() => handleAddToCart("2-3")}
                                className={`relative rounded-xl p-3 transition-all duration-200 border-2 text-left ${selectedSize === "2-3"
                                    ? "bg-[#F5E6D3] border-black"
                                    : "bg-white border-gray-100 active:border-black/30"
                                    }`}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="relative w-12 h-12 flex-shrink-0">
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
                                            <p className="font-black text-sm text-black">2–3 {t.cart.persons}</p>
                                            <p className="text-xs text-black/60">Ø 14 cm</p>
                                        </div>
                                        <div className="text-[#651A1A]">
                                            <PriceDisplay
                                                amount={priceSmall || 0}
                                                className="text-lg"
                                                currencyClassName="transform translate-y-[-1px]"
                                            />
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
                </div>,
                document.body
            )}
        </>
    )
}
