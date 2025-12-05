import ProductCard from "@/components/ProductCard"

export default function FeaturedProducts() {
    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                        VON UNSERER KONDITOREI ZU DEINER HAUSTÜR
                    </h2>
                    <p className="text-base leading-relaxed">
                        Authentische baskische Käsekuchen in fünf einzigartigen Variationen. Jede Torte wird frisch auf Bestellung gebacken – wähle deinen Favoriten oder entdecke sie alle.
                    </p>
                </div>

                <div className="overflow-x-auto pb-4 -mx-4 px-4">
                    <div className="flex gap-4 min-w-min">
                        <ProductCard
                            className="w-80 flex-shrink-0"
                            href="/product/pistacho"
                            image1="/pistacho1.png"
                            image2="/pistacho2.png"
                            name="VERDALIA"
                            description="Köstlicher Pistazienkäsekuchen, cremig und mit einem einzigartigen, unwiderstehlichen Geschmack..."
                            tag={{
                                label: "Bestseller",
                                bgColor: "bg-[#D4AF85]",
                                textColor: "text-[#3A2A1A]"
                            }}
                        />

                        <ProductCard
                            className="w-80 flex-shrink-0"
                            href="/product/original"
                            image1="/original1.png"
                            image2="/original2.png"
                            name="CLÁSICA"
                            description="Unser klassisches Originalrezept, cremig und zart. Der authentische traditionelle Geschmack..."
                        />

                        <ProductCard
                            className="w-80 flex-shrink-0"
                            href="/product/lotus"
                            image1="/lotus1.png"
                            image2="/lotus2.png"
                            name="EMILIA Nº3"
                            description="Käsekuchen mit Lotus Biscoff Keksen, unwiderstehlicher gewürzter Karamellgeschmack..."
                        />

                        <ProductCard
                            className="w-80 flex-shrink-0"
                            href="/product/chocolate"
                            image1="/chocolate1.png"
                            image2="/chocolate2.png"
                            name="OSCURA"
                            description="Intensiver Käsekuchen mit Schweizer Schokolade, für echte Kakaoliebhaber..."
                        />

                        <ProductCard
                            className="w-80 flex-shrink-0"
                            href="/product/cafe"
                            image1="/cafe1.png"
                            image2="/cafe2.png"
                            name="MANJAR"
                            description="Verführerischer Käsekuchen mit cremigem Dulce de Leche und zartem Karamell..."
                            tag={{
                                label: "New",
                                bgColor: "bg-[#8B7355]",
                                textColor: "text-[#F5EEE4]"
                            }}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
