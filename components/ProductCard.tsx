"use client"

import { useState, useRef, useEffect, TouchEvent } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import PriceDisplay from "@/components/PriceDisplay"
import { ShoppingCart, X, Check, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useScrollLock } from "@/lib/useScrollLock"

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
        subLabel?: string
        bgColor: string
        textColor: string
    }
    /** En móvil muestra una fila compacta (foto pequeña + nombre + precio +
        botón de carrito) en vez de la tarjeta vertical: compra más rápida en
        listados de una columna. Desktop siempre usa la tarjeta. */
    compact?: boolean
    className?: string
}

export default function ProductCard({ href, image1, image2, name, description, priceSmall, priceLarge, slug, tag, compact = false, className = "" }: ProductCardProps) {
    // Which of the two photos the mobile card is showing (0 = whole cake, 1 = slice).
    const [mobileImage, setMobileImage] = useState(0)
    const [showSizePopup, setShowSizePopup] = useState(false)
    const [selectedSize, setSelectedSize] = useState<string | null>(null)
    const { addToCart } = useCart()
    const { t, locale } = useLanguage()

    // The sheet is portalled to <body>, so it needs to wait for the client.
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    // Stop the page behind the sheet from scrolling. Shared counter, because
    // picking a size opens the cart on top of this sheet.
    useScrollLock(showSizePopup)

    useEffect(() => {
        if (!showSizePopup) return
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowSizePopup(false) }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
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

    // The card is a <Link>, so the arrows have to swallow the tap or it navigates.
    const stepImage = (e: React.MouseEvent, direction: 1 | -1) => {
        e.preventDefault()
        e.stopPropagation()
        setMobileImage((prev) => (prev + direction + 2) % 2)
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
            // Same rule as the product page: the small size has its own photo of
            // the cake in its box. Passing image1 here regardless of size meant the
            // cart showed the whole cake for a 2-3, depending on where you added it.
            image: size === "2-3" ? `/${slug}3.jpeg` : image1,
            quantity: 1,
        })
        setTimeout(() => {
            setShowSizePopup(false)
            setSelectedSize(null)
        }, 400)
    }

    return (
        <>
            {/* Fila compacta (solo móvil, solo si compact): compra rápida */}
            {compact && (
                <Link href={href} className={`md:hidden flex items-center gap-3 bg-[#F5E6D3] rounded-2xl p-2.5 cursor-pointer ${className}`}>
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                        <Image
                            src={image1}
                            alt={name}
                            fill
                            sizes="80px"
                            className="object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <h3 className="font-black text-sm tracking-tight">{name}</h3>
                        {priceSmall && (
                            <div className="flex items-baseline gap-1 mt-0.5 text-[#651A1A]">
                                <span className="text-xs font-medium opacity-60">{locale === 'de' ? 'ab' : 'from'}</span>
                                <PriceDisplay amount={priceSmall} className="text-base" />
                            </div>
                        )}
                    </div>
                    {slug && (
                        <button
                            onClick={handleCartClick}
                            aria-label={t.productInfo.addToCart}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-white active:scale-95 transition-transform"
                        >
                            <ShoppingCart className="w-4 h-4" />
                        </button>
                    )}
                </Link>
            )}

            <Link href={href} className={`bg-[#F5E6D3] rounded-2xl overflow-hidden group cursor-pointer flex-col ${compact ? 'hidden md:flex' : 'flex'} ${className}`}>
                <div className="relative h-48 md:h-80">
                    {tag && (
                        <div className={`absolute top-2 left-2 md:top-3 z-10 ${tag.bgColor} ${tag.textColor} rounded-xl px-2 py-1 md:px-2.5 md:py-1.5 shadow-lg shadow-black/25 text-left border border-[#651A1A]/20`}>
                            <span className="flex items-center gap-1 text-[8px] md:text-[10px] font-black tracking-[0.12em] md:tracking-[0.18em] uppercase leading-none whitespace-nowrap">
                                <Sparkles className="h-2 w-2 md:h-3 md:w-3 shrink-0" strokeWidth={2.5} />
                                {tag.label}
                            </span>
                            {tag.subLabel && (
                                <span className="hidden md:block mt-1 text-[9px] font-medium italic opacity-80 leading-none">
                                    {tag.subLabel}
                                </span>
                            )}
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

                    {/* Mobile: two photos with a control row underneath them */}
                    <div className="md:hidden w-full h-full relative">
                        <Image
                            src={image1}
                            alt={name}
                            fill
                            sizes="50vw"
                            className={`object-cover absolute inset-0 transition-opacity duration-300 ${mobileImage === 0 ? 'opacity-100' : 'opacity-0'}`}
                        />
                        <Image
                            src={image2}
                            alt={name}
                            fill
                            sizes="50vw"
                            className={`object-cover absolute inset-0 transition-opacity duration-300 ${mobileImage === 1 ? 'opacity-100' : 'opacity-0'}`}
                        />

                        {!tag && (
                            <span className="absolute top-2 left-2 z-20 text-[9px] text-white/70 bg-black/30 px-1.5 py-0.5 rounded-full">
                                + info
                            </span>
                        )}

                        {/* Arrows and dots share one row at the foot of the photo, so the
                            middle of the image stays free to tap through to the product. */}
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20 flex items-center">
                            <button
                                type="button"
                                onClick={(e) => stepImage(e, -1)}
                                aria-label={t.productInfo.previousImage}
                                className="flex h-10 w-10 items-center justify-center active:opacity-60 transition-opacity"
                            >
                                {/* No plate behind the chevron - a drop shadow keeps it legible
                                    over both the dark backdrop and the pale cakes. */}
                                <ChevronLeft
                                    className="w-4 h-4 text-white/70 [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.55))_drop-shadow(0_0_5px_rgba(0,0,0,0.35))]"
                                    strokeWidth={2.5}
                                />
                            </button>

                            <div className="flex items-center gap-1.5">
                                {[0, 1].map((i) => (
                                    <span
                                        key={i}
                                        className={`block h-1.5 rounded-full transition-all duration-300 [filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.5))] ${mobileImage === i ? 'w-3.5 bg-white' : 'w-1.5 bg-white/55'}`}
                                    />
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={(e) => stepImage(e, 1)}
                                aria-label={t.productInfo.nextImage}
                                className="flex h-10 w-10 items-center justify-center active:opacity-60 transition-opacity"
                            >
                                <ChevronRight
                                    className="w-4 h-4 text-white/70 [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.55))_drop-shadow(0_0_5px_rgba(0,0,0,0.35))]"
                                    strokeWidth={2.5}
                                />
                            </button>
                        </div>
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
