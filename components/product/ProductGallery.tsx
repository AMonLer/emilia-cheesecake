"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ProductGalleryProps {
    images: string[]
    name: string
    compact?: boolean
}

export default function ProductGallery({ images, name, compact = false }: ProductGalleryProps) {
    const [currentImage, setCurrentImage] = useState(0)

    const nextImage = () => {
        setCurrentImage((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
    }

    return (
        <div className="relative bg-[#F5E6D3] rounded-3xl overflow-hidden aspect-square group">
            <button
                onClick={prevImage}
                className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full transition-all ${compact
                    ? "bg-transparent p-1"
                    : "bg-white/80 hover:bg-white p-3 shadow-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                    }`}
                aria-label="Previous image"
            >
                <ChevronLeft className={compact ? "w-4 h-4 text-white/70" : "w-6 h-6 text-[#651A1A]"} />
            </button>

            <div className="relative w-full h-full">
                <Image
                    src={images[currentImage]}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    priority
                />
            </div>

            <button
                onClick={nextImage}
                className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full transition-all ${compact
                    ? "bg-transparent p-1"
                    : "bg-white/80 hover:bg-white p-3 shadow-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                    }`}
                aria-label="Next image"
            >
                <ChevronRight className={compact ? "w-4 h-4 text-white/70" : "w-6 h-6 text-[#651A1A]"} />
            </button>

            {/* Dots indicator */}
            <div className={`absolute left-1/2 -translate-x-1/2 flex gap-2 z-10 ${compact ? "bottom-2" : "bottom-6"}`}>
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentImage(index)}
                        className={`rounded-full transition-all ${compact ? "w-1.5 h-1.5" : "w-2.5 h-2.5"} ${currentImage === index
                            ? `bg-[#651A1A] ${compact ? "w-3" : "w-6"}`
                            : "bg-[#651A1A]/30 hover:bg-[#651A1A]/50"
                            }`}
                        aria-label={`Go to image ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}
