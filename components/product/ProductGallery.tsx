"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ProductGalleryProps {
    images: string[]
    name: string
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
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
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                aria-label="Previous image"
            >
                <ChevronLeft className="w-6 h-6 text-[#651A1A]" />
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
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                aria-label="Next image"
            >
                <ChevronRight className="w-6 h-6 text-[#651A1A]" />
            </button>

            {/* Dots indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentImage(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${currentImage === index
                            ? "bg-[#651A1A] w-6"
                            : "bg-[#651A1A]/30 hover:bg-[#651A1A]/50"
                            }`}
                        aria-label={`Go to image ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}
