import Link from "next/link"
import Image from "next/image"

export default function QualitySection() {
    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                    {/* Lado izquierdo - Texto */}
                    <div className="space-y-6 text-center lg:text-left order-2 lg:order-1">
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight text-[#651A1A]">
                            DER KÄSEKUCHEN,
                            <br className="hidden lg:block" />
                            DEN DU VERDIENST
                        </h2>
                        <p className="text-base md:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 text-[#651A1A]/80">
                            Der authentische baskische Käsekuchen, handgefertigt mit erstklassigen Zutaten. Täglich backen wir in kleinen Mengen für garantierte Frische und den Geschmack, der die Welt begeistert.
                        </p>
                        <div className="pt-4">
                            <Link href="/bestellen">
                                <button className="bg-[#651A1A] text-white px-10 py-4 rounded-full font-black text-sm tracking-widest uppercase hover:bg-[#4A1313] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
                                    JETZT BESTELLEN
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Lado derecho - Imagen */}
                    <div className="relative h-[400px] lg:h-[600px] w-full order-1 lg:order-2">
                        <Image
                            src="/menu1.jpg"
                            alt="Fall Party Desserts"
                            fill
                            className="object-cover rounded-3xl shadow-2xl"
                        />
                        {/* Decorative element */}
                        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#F5E6D3] rounded-full -z-10 hidden lg:block"></div>
                        <div className="absolute -top-6 -right-6 w-32 h-32 border-4 border-[#F5E6D3] rounded-full -z-10 hidden lg:block"></div>
                    </div>
                </div>
            </div>
        </section>
    )
}
