'use client'

import ProductCard from "@/components/ProductCard"
import { useLanguage } from "@/contexts/LanguageContext"

export default function FeaturedProducts() {
    const { t } = useLanguage()
    const p = t.products

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-black mb-6 tracking-tighter leading-[0.95] text-[#651A1A]">
                        {p.heading} <br className="md:hidden" />
                        <span className="font-serif italic font-medium capitalize text-5xl md:text-6xl lg:text-8xl text-[#651A1A]/90 tracking-normal md:ml-1 mt-2 md:mt-0 inline-block py-1">Cheesecakes</span>
                    </h2>
                    <p className="text-lg md:text-xl leading-relaxed text-[#651A1A]/80 font-medium">
                        {p.subtitle}
                    </p>
                </div>

                {/* Mobile: 2-column vertical grid */}
                <div className="md:hidden grid grid-cols-2 gap-2">
                    <ProductCard
                        className="w-full"
                        href="/product/pistacho"
                        slug="pistacho"
                        image1="/pistacho1.png"
                        image2="/pistacho2.png"
                        name="PISTACHIO"
                        priceSmall={18.90}
                        priceLarge={49.90}
                        description=""
                    />
                    <ProductCard
                        className="w-full"
                        href="/product/original"
                        slug="original"
                        image1="/original1.png"
                        image2="/original2.png"
                        name="CLASSIC"
                        priceSmall={15.90}
                        priceLarge={42.90}
                        description=""
                    />
                    <ProductCard
                        className="w-full"
                        href="/product/lotus"
                        slug="lotus"
                        image1="/lotus1.png"
                        image2="/lotus2.png"
                        name="LOTUS"
                        priceSmall={16.90}
                        priceLarge={44.90}
                        description=""
                    />
                    <ProductCard
                        className="w-full"
                        href="/product/chocolate"
                        slug="chocolate"
                        image1="/chocolate1.png"
                        image2="/chocolate2.png"
                        name="SCHOGGI"
                        priceSmall={16.90}
                        priceLarge={44.90}
                        description=""
                    />
                    <ProductCard
                        className="w-full col-span-2 max-w-[50%] mx-auto"
                        href="/product/cafe"
                        slug="cafe"
                        image1="/cafe1.png"
                        image2="/cafe2.png"
                        name="DULCE DE LECHE"
                        priceSmall={17.40}
                        priceLarge={45.90}
                        description=""
                    />
                </div>

                {/* Desktop: Horizontal scroll */}
                <div className="hidden md:block overflow-x-auto pb-4 -mx-4 px-4 custom-scrollbar">
                    <div className="flex gap-4 min-w-min">
                        <ProductCard
                            className="w-80 flex-shrink-0"
                            href="/product/pistacho"
                            image1="/pistacho1.png"
                            image2="/pistacho2.png"
                            name="PISTACHIO"
                            priceSmall={18.90}
                            priceLarge={49.90}
                            description={p.pistachio}
                        />

                        <ProductCard
                            className="w-80 flex-shrink-0"
                            href="/product/original"
                            image1="/original1.png"
                            image2="/original2.png"
                            name="CLASSIC"
                            priceSmall={15.90}
                            priceLarge={42.90}
                            description={p.classic}
                        />

                        <ProductCard
                            className="w-80 flex-shrink-0"
                            href="/product/lotus"
                            image1="/lotus1.png"
                            image2="/lotus2.png"
                            name="LOTUS"
                            priceSmall={16.90}
                            priceLarge={44.90}
                            description={p.lotus}
                        />

                        <ProductCard
                            className="w-80 flex-shrink-0"
                            href="/product/chocolate"
                            image1="/chocolate1.png"
                            image2="/chocolate2.png"
                            name="SCHOGGI"
                            priceSmall={16.90}
                            priceLarge={44.90}
                            description={p.schoggi}
                        />

                        <ProductCard
                            className="w-80 flex-shrink-0"
                            href="/product/cafe"
                            image1="/cafe1.png"
                            image2="/cafe2.png"
                            name="DULCE DE LECHE"
                            priceSmall={17.40}
                            priceLarge={45.90}
                            description={p.dulceDeLeche}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
