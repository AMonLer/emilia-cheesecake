"use client"

import { useState, useRef, TouchEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import PriceDisplay from "@/components/PriceDisplay"

interface ProductCardProps {
    href: string
    image1: string
    image2: string
    name: string
    description: string
    priceSmall?: number
    priceLarge?: number
    tag?: {
        label: string
        bgColor: string
        textColor: string
    }
    className?: string
}

export default function ProductCard({ href, image1, image2, name, description, priceSmall, priceLarge, tag, className = "" }: ProductCardProps) {
    const [showSecondImage, setShowSecondImage] = useState(false)
    const imageContainerRef = useRef<HTMLDivElement>(null)

    const handleTouchStart = (e: TouchEvent) => {
        // Show second image when touch starts
        setShowSecondImage(true)
    }

    const handleTouchEnd = () => {
        // Hide second image when touch ends
        setShowSecondImage(false)
    }

    return (
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
                        className={`object-cover absolute inset-0 transition-opacity duration-200 ${showSecondImage ? 'opacity-0' : 'opacity-100'
                            }`}
                    />
                    <Image
                        src={image2}
                        alt={name}
                        fill
                        className={`object-cover absolute inset-0 transition-opacity duration-200 ${showSecondImage ? 'opacity-100' : 'opacity-0'
                            }`}
                    />
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

                {/* Mobile */}
                <div className="md:hidden mt-2 space-y-1.5">
                    <span className="block text-[10px] text-gray-400 tracking-wide">+ info</span>
                    <span className="block w-full bg-black text-white py-2 text-[10px] font-bold tracking-[0.2em] uppercase rounded-lg shadow-sm">
                        Bestellen
                    </span>
                </div>
            </div>
        </Link>
    )
}
