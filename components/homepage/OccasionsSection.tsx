import Image from "next/image"

export default function OccasionsSection() {
    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                {/* Título y descripción centrados */}
                <div className="text-center mb-12 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                        GESCHENKE FÜR JEDEN ANLASS!
                    </h2>
                    <p className="text-base leading-relaxed">
                        Ob du den Geburtstag eines Freundes oder Familienmitglieds feierst, eine Zusammenkunft veranstaltest oder einfach ein Geschenk verschicken möchtest – wir haben die besten Desserts für jeden Anlass.
                    </p>
                </div>

                {/* Grid de 3 imágenes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* BIRTHDAYS */}
                    <div className="text-center">
                        <div className="aspect-[4/3] overflow-hidden rounded-2xl mb-4 relative">
                            <Image
                                src="/birthday1.jpg"
                                alt="Birthdays"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <h3 className="font-black text-xl tracking-tight">BIRTHDAYS</h3>
                    </div>

                    {/* THANK YOU */}
                    <div className="text-center">
                        <div className="aspect-[4/3] overflow-hidden rounded-2xl mb-4 relative">
                            <Image
                                src="/Thankyou.png"
                                alt="Thank You"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <h3 className="font-black text-xl tracking-tight">THANK YOU</h3>
                    </div>

                    {/* CONGRATS */}
                    <div className="text-center">
                        <div className="aspect-[4/3] overflow-hidden rounded-2xl mb-4 relative">
                            <Image
                                src="/Congrats.jpeg"
                                alt="Congrats"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <h3 className="font-black text-xl tracking-tight">CONGRATS</h3>
                    </div>
                </div>
            </div>
        </section>
    )
}
