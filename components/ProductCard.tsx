"use client"

import { useState, useRef, TouchEvent } from "react"
import Link from "next/link"
import Image from "next/image"

interface ProductCardProps {
    href: string
    image1: string
    image2: string
    name: string
    description: string
    tag?: {
        label: string
        bgColor: string
        textColor: string
    }
    className?: string
}

export default function ProductCard({ href, image1, image2, name, description, tag, className = "" }: ProductCardProps) {
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
        <Link href={href} className={`bg-[#F5E6D3] rounded-2xl overflow-hidden group cursor-pointer ${className}`}>
            <div
                className="relative h-80"
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
            <div className="p-6 text-center">
                <h3 className="font-black text-lg mb-2 tracking-tight">{name}</h3>
                <p className="text-sm leading-relaxed text-gray-700">{description}</p>

                {/* Mobile Order Button */}
                <div className="md:hidden mt-6">
                    <span className="block w-full bg-black text-white py-3 text-xs font-bold tracking-[0.2em] uppercase rounded-lg shadow-sm">
                        Bestellen
                    </span>
                </div>
            </div>
        </Link>
    )
}
