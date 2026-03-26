"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import ProductCard from "@/components/ProductCard"
import PriceDisplay from "@/components/PriceDisplay"
import { useCart } from "@/contexts/CartContext"
import { Plus } from "lucide-react"

const products = [
    {
        slug: "pistacho",
        name: "VERDALIA",
        subtitle: "Pistazie",
        image: "/pistacho1.png",
        priceSmall: 21.90,
        priceLarge: 55.90,
        image1: "/pistacho1.png",
        image2: "/pistacho2.png",
        description: "Köstlicher Pistazienkäsekuchen, cremig und mit einem einzigartigen, unwiderstehlichen Geschmack...",
    },
    {
        slug: "original",
        name: "CLÁSICA",
        subtitle: "Original",
        image: "/original1.png",
        priceSmall: 17.90,
        priceLarge: 49.90,
        image1: "/original1.png",
        image2: "/original2.png",
        description: "Unser klassisches Originalrezept, cremig und zart. Der authentische traditionelle Geschmack...",
    },
    {
        slug: "lotus",
        name: "EMILIA N.3",
        subtitle: "Lotus Biscoff",
        image: "/lotus1.png",
        priceSmall: 19.90,
        priceLarge: 53.90,
        image1: "/lotus1.png",
        image2: "/lotus2.png",
        description: "Käsekuchen mit Lotus Biscoff Keksen, unwiderstehlicher gewürzter Karamellgeschmack...",
    },
    {
        slug: "chocolate",
        name: "SCHOGGI",
        subtitle: "Schokolade",
        image: "/chocolate1.png",
        priceSmall: 18.90,
        priceLarge: 51.90,
        image1: "/chocolate1.png",
        image2: "/chocolate2.png",
        description: "Intensiver Käsekuchen mit Schweizer Schokolade, für echte Kakaoliebhaber...",
    },
    {
        slug: "cafe",
        name: "MANJAR",
        subtitle: "Dulce de Leche",
        image: "/cafe1.png",
        priceSmall: 20.90,
        priceLarge: 52.90,
        image1: "/cafe1.png",
        image2: "/cafe2.png",
        description: "Verführerischer Käsekuchen mit cremigem Dulce de Leche und zartem Karamell...",
    },
]

function MobileProductItem({ product }: { product: typeof products[0] }) {
    const [showSizes, setShowSizes] = useState(false)
    const { addToCart } = useCart()

    const handleAdd = (size: "2-3" | "8-10") => {
        addToCart({
            id: `${product.slug}-${size}-${Date.now()}`,
            name: product.name,
            price: size === "2-3" ? product.priceSmall : product.priceLarge,
            size,
            image: product.image,
            quantity: 1,
        })
        setShowSizes(false)
    }

    return (
        <div className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4 border-b border-gray-100 last:border-b-0">
            <Link href={`/product/${product.slug}`} className="flex-shrink-0">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#F5E6D3]">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                </div>
            </Link>
            <div className="flex-1 min-w-0">
                <Link href={`/product/${product.slug}`}>
                    <h3 className="font-black text-xs sm:text-sm tracking-tight truncate">{product.name}</h3>
                    <p className="text-[11px] sm:text-xs text-gray-500 truncate">{product.subtitle}</p>
                </Link>
                <div className="mt-0.5 sm:mt-1 text-[#651A1A]">
                    <PriceDisplay amount={product.priceSmall} className="text-xs sm:text-sm" />
                </div>
            </div>
            <div className="flex-shrink-0">
                {!showSizes ? (
                    <button
                        onClick={() => setShowSizes(true)}
                        className="w-9 h-9 sm:w-10 sm:h-10 bg-[#651A1A] text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
                    >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                ) : (
                    <div className="flex gap-1.5 sm:gap-2 animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => handleAdd("2-3")}
                            className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-[#F5E6D3] text-black text-[11px] sm:text-xs font-bold rounded-full active:scale-95 transition-transform"
                        >
                            Klein
                        </button>
                        <button
                            onClick={() => handleAdd("8-10")}
                            className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-[#651A1A] text-white text-[11px] sm:text-xs font-bold rounded-full active:scale-95 transition-transform"
                        >
                            Gross
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function FeaturedProducts() {
    return (
        <section id="featured-products" className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                        UNSERE KÄSEKUCHEN
                    </h2>
                    <p className="text-base leading-relaxed">
                        Fünf Sorten, alle frisch auf Bestellung gebacken.
                    </p>
                </div>

                {/* Mobile: Compact list */}
                <div className="md:hidden">
                    {products.map((product) => (
                        <MobileProductItem key={product.slug} product={product} />
                    ))}
                </div>

                {/* Desktop: Horizontal scroll cards */}
                <div className="hidden md:block overflow-x-auto pb-4 -mx-4 px-4 custom-scrollbar">
                    <div className="flex gap-4 min-w-min">
                        {products.map((product) => (
                            <ProductCard
                                key={product.slug}
                                className="w-80 flex-shrink-0"
                                href={`/product/${product.slug}`}
                                image1={product.image1}
                                image2={product.image2}
                                name={product.name}
                                priceSmall={product.priceSmall}
                                priceLarge={product.priceLarge}
                                description={product.description}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
