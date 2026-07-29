"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ProductGalleryProps {
    images: string[]
    name: string
    compact?: boolean
}

const SWIPE_THRESHOLD = 50

export default function ProductGallery({ images, name, compact = false }: ProductGalleryProps) {
    const [currentImage, setCurrentImage] = useState(0)
    const touchStartX = useRef<number | null>(null)

    const nextImage = () => {
        setCurrentImage((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return
        const delta = e.changedTouches[0].clientX - touchStartX.current
        touchStartX.current = null
        if (Math.abs(delta) < SWIPE_THRESHOLD) return
        if (delta < 0) nextImage()
        else prevImage()
    }

    return (
        <div
            className="relative bg-[#F5E6D3] rounded-3xl overflow-hidden aspect-square group touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={() => { touchStartX.current = null }}
        >
            <button
                onClick={prevImage}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full transition-all ${compact
                    ? "bg-transparent"
                    : "left-2 bg-white/80 hover:bg-white h-12 w-12 shadow-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                    }`}
                aria-label="Previous image"
            >
                <ChevronLeft className={compact ? "w-5 h-5 text-white/80 drop-shadow" : "w-6 h-6 text-[#651A1A]"} />
            </button>

            <div className="relative w-full h-full">
                <Image
                    src={images[currentImage]}
                    alt={name}
                    fill
                    sizes={compact ? "50vw" : "(max-width: 1024px) 100vw, 600px"}
                    className="object-cover transition-transform duration-700 [@media(hover:hover)]:hover:scale-105"
                    priority
                />
            </div>

            <button
                onClick={nextImage}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full transition-all ${compact
                    ? "bg-transparent"
                    : "right-2 bg-white/80 hover:bg-white h-12 w-12 shadow-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                    }`}
                aria-label="Next image"
            >
                <ChevronRight className={compact ? "w-5 h-5 text-white/80 drop-shadow" : "w-6 h-6 text-[#651A1A]"} />
            </button>

            {/* Dots indicator - small dots, but each sits inside a 32/44px tap target */}
            <div className={`absolute left-1/2 -translate-x-1/2 flex z-10 ${compact ? "bottom-0" : "bottom-3"}`}>
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentImage(index)}
                        className={`flex items-center justify-center ${compact ? "h-8 w-6" : "h-11 w-8"}`}
                        aria-label={`Go to image ${index + 1}`}
                        aria-current={currentImage === index}
                    >
                        <span
                            className={`block rounded-full transition-all ${compact ? "h-1.5" : "h-2.5"} ${currentImage === index
                                ? `bg-[#651A1A] ${compact ? "w-3" : "w-6"}`
                                : `bg-[#651A1A]/30 ${compact ? "w-1.5" : "w-2.5"}`
                                }`}
                        />
                    </button>
                ))}
            </div>
        </div>
    )
}
