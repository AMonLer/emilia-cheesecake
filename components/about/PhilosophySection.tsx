export default function PhilosophySection() {
    return (
        <section className="py-24 px-4 bg-[#F5E6D3]">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-20">
                    <span className="text-sm tracking-[0.2em] text-[#651A1A] font-bold uppercase mb-4 block">
                        Unsere Werte
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black text-[#651A1A] tracking-tight mb-8">
                        UNSERE PHILOSOPHIE
                    </h2>
                    <p className="text-xl text-[#651A1A]/70 max-w-2xl mx-auto font-light">
                        Drei Prinzipien, die jeden Käsekuchen definieren, den wir backen
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Principle 1 */}
                    <div className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 text-center group">
                        <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-[#651A1A]/5 rounded-full scale-0 group-hover:scale-150 transition-transform duration-500" />
                            <div className="w-full h-full rounded-full border-4 border-[#651A1A] flex items-center justify-center relative z-10 bg-white">
                                <span className="text-3xl font-black text-[#651A1A]">1</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-[#651A1A] tracking-tight uppercase mb-4">
                            Authentizität
                        </h3>
                        <p className="text-base leading-relaxed text-gray-600">
                            Wir bleiben den traditionellen baskischen Techniken treu, verwenden nur natürliche Zutaten und backen jeden Kuchen auf Bestellung – niemals Massenproduktion.
                        </p>
                    </div>

                    {/* Principle 2 */}
                    <div className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 text-center group md:-mt-8">
                        <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-[#651A1A]/5 rounded-full scale-0 group-hover:scale-150 transition-transform duration-500" />
                            <div className="w-full h-full rounded-full border-4 border-[#651A1A] flex items-center justify-center relative z-10 bg-white">
                                <span className="text-3xl font-black text-[#651A1A]">2</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-[#651A1A] tracking-tight uppercase mb-4">
                            Handwerk
                        </h3>
                        <p className="text-base leading-relaxed text-gray-600">
                            Jeder Arbeitsschritt erfolgt von Hand. Vom Abwiegen der Zutaten bis zum Verpacken – wir glauben, dass man Liebe und Sorgfalt schmecken kann.
                        </p>
                    </div>

                    {/* Principle 3 */}
                    <div className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 text-center group">
                        <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-[#651A1A]/5 rounded-full scale-0 group-hover:scale-150 transition-transform duration-500" />
                            <div className="w-full h-full rounded-full border-4 border-[#651A1A] flex items-center justify-center relative z-10 bg-white">
                                <span className="text-3xl font-black text-[#651A1A]">3</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-[#651A1A] tracking-tight uppercase mb-4">
                            Qualität
                        </h3>
                        <p className="text-base leading-relaxed text-gray-600">
                            Nur erstklassige Zutaten finden den Weg in unsere Küche. Wir wählen jeden Rohstoff sorgfältig aus und machen keine Kompromisse bei der Qualität.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
