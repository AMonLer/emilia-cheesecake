"use client"

import Image from "next/image"
import Link from "next/link"
import { Plus } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useCart, cartImageFor } from "@/contexts/CartContext"
import { products as catalogue } from "@/lib/products"
import PriceDisplay from "@/components/PriceDisplay"

interface RelatedProductsProps {
    products: any[]
}

// The suggestions only carry a display name; find the catalogue entry for it.
function slugForName(name: string): string | null {
    return Object.keys(catalogue).find((slug) => catalogue[slug].name === name) ?? null
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
    const { t } = useLanguage()
    const { addToCart } = useCart()

    // Recordings showed people tapping these names and the "add" button with no
    // response: the cards were plain markup. Now the card opens the cake and the
    // button adds the large size (the price shown) to the cart.
    const items = products
        .map((item: any) => ({ ...item, slug: slugForName(item.name) }))
        .filter((item: any) => item.slug)

    const handleAdd = (slug: string) => {
        const product = catalogue[slug]
        const price = product.prices["8-10"]
        addToCart({
            id: `${slug}-8-10-${Date.now()}`,
            name: product.name,
            price,
            size: "8-10",
            image: cartImageFor(slug, "8-10"),
            quantity: 1,
        })
        if (typeof window !== "undefined" && (window as any).fbq) {
            ;(window as any).fbq("track", "AddToCart", {
                content_name: product.name,
                content_ids: [slug],
                content_type: "product",
                value: price,
                currency: "CHF",
            })
        }
    }

    return (
        <div className="mt-24 border-t border-[#651A1A]/10 pt-16">
            <h3 className="font-black text-2xl md:text-3xl mb-8 md:mb-10 tracking-tight text-[#651A1A] text-center">
                {t.relatedProducts.title}
            </h3>
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 lg:grid lg:grid-cols-4 lg:gap-6 no-scrollbar">
                {items.map((item: any) => (
                    <div key={item.slug} className="min-w-[200px] md:min-w-0 snap-center group bg-white rounded-3xl p-4 hover:shadow-xl transition-all duration-500 border border-[#651A1A]/5">
                        <Link href={`/product/${item.slug}`} className="block text-center">
                            <div className="aspect-square relative mb-4 bg-[#F5E6D3] rounded-2xl overflow-hidden">
                                <Image
                                    src={catalogue[item.slug].images[0]}
                                    alt={item.name}
                                    fill
                                    sizes="(max-width: 1024px) 200px, 25vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>
                            <h4 className="font-black text-[#651A1A] tracking-tight mb-1 underline-offset-4 group-hover:underline">{item.name}</h4>
                            <div className="mb-4 text-[#651A1A]">
                                <PriceDisplay amount={catalogue[item.slug].prices["8-10"]} className="text-base" />
                            </div>
                        </Link>
                        <button
                            type="button"
                            onClick={() => handleAdd(item.slug)}
                            aria-label={t.relatedProducts.addAria(item.name)}
                            className="w-full border-2 border-[#651A1A] text-[#651A1A] py-3 rounded-xl font-black text-xs tracking-widest uppercase hover:bg-[#651A1A] hover:text-white active:bg-[#651A1A] active:text-white transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{t.relatedProducts.add}</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
