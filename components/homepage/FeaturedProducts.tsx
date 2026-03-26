import ProductCard from "@/components/ProductCard"

export default function FeaturedProducts() {
    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                        UNSERE KÄSEKUCHEN
                    </h2>
                    <p className="text-base leading-relaxed">
                        Fünf Sorten, alle frisch auf Bestellung gebacken.
                    </p>
                </div>

                {/* Mobile: 2-column vertical grid */}
                <div className="md:hidden grid grid-cols-2 gap-2">
                    <ProductCard
                        className="w-full"
                        href="/product/pistacho"
                        image1="/pistacho1.png"
                        image2="/pistacho2.png"
                        name="PISTACHIO"
                        priceSmall={21.90}
                        priceLarge={55.90}
                        description=""
                    />
                    <ProductCard
                        className="w-full"
                        href="/product/original"
                        image1="/original1.png"
                        image2="/original2.png"
                        name="CLASSIC"
                        priceSmall={17.90}
                        priceLarge={49.90}
                        description=""
                    />
                    <ProductCard
                        className="w-full"
                        href="/product/lotus"
                        image1="/lotus1.png"
                        image2="/lotus2.png"
                        name="LOTUS"
                        priceSmall={19.90}
                        priceLarge={53.90}
                        description=""
                    />
                    <ProductCard
                        className="w-full"
                        href="/product/chocolate"
                        image1="/chocolate1.png"
                        image2="/chocolate2.png"
                        name="SCHOGGI"
                        priceSmall={18.90}
                        priceLarge={51.90}
                        description=""
                    />
                    <ProductCard
                        className="w-full col-span-2 max-w-[50%] mx-auto"
                        href="/product/cafe"
                        image1="/cafe1.png"
                        image2="/cafe2.png"
                        name="DULCE DE LECHE"
                        priceSmall={20.90}
                        priceLarge={52.90}
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
                            priceSmall={21.90}
                            priceLarge={55.90}
                            description="Köstlicher Pistazienkäsekuchen, cremig und mit einem einzigartigen, unwiderstehlichen Geschmack..."
                        />

                        <ProductCard
                            className="w-80 flex-shrink-0"
                            href="/product/original"
                            image1="/original1.png"
                            image2="/original2.png"
                            name="CLASSIC"
                            priceSmall={17.90}
                            priceLarge={49.90}
                            description="Unser klassisches Originalrezept, cremig und zart. Der authentische traditionelle Geschmack..."
                        />

                        <ProductCard
                            className="w-80 flex-shrink-0"
                            href="/product/lotus"
                            image1="/lotus1.png"
                            image2="/lotus2.png"
                            name="LOTUS"
                            priceSmall={19.90}
                            priceLarge={53.90}
                            description="Käsekuchen mit Lotus Biscoff Keksen, unwiderstehlicher gewürzter Karamellgeschmack..."
                        />

                        <ProductCard
                            className="w-80 flex-shrink-0"
                            href="/product/chocolate"
                            image1="/chocolate1.png"
                            image2="/chocolate2.png"
                            name="SCHOGGI"
                            priceSmall={18.90}
                            priceLarge={51.90}
                            description="Intensiver Käsekuchen mit Schweizer Schokolade, für echte Kakaoliebhaber..."
                        />

                        <ProductCard
                            className="w-80 flex-shrink-0"
                            href="/product/cafe"
                            image1="/cafe1.png"
                            image2="/cafe2.png"
                            name="DULCE DE LECHE"
                            priceSmall={20.90}
                            priceLarge={52.90}
                            description="Verführerischer Käsekuchen mit cremigem Dulce de Leche und zartem Karamell..."
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
