import { ChefHat, CakeSlice, BookOpenText } from "lucide-react"

export default function WhyChooseSection() {
    return (
        <section className="py-24 bg-[#F5E6D3]">
            <div className="container mx-auto px-4">
                <div className="text-center mb-20">
                    <span className="text-sm tracking-[0.2em] text-[#651A1A] font-bold uppercase mb-4 block">
                        Unsere Werte
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black text-[#651A1A] tracking-tight">
                        WARUM EMILIA WÄHLEN?
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                    {/* HANDWERKLICHE HERSTELLUNG */}
                    <div className="bg-white/50 p-10 rounded-3xl hover:bg-white transition-colors duration-500 group text-center">
                        <div className="w-24 h-24 mx-auto mb-8 flex items-center justify-center bg-[#651A1A]/5 rounded-full group-hover:bg-[#651A1A]/10 transition-all duration-500 p-5 group-hover:scale-110">
                            <ChefHat className="w-full h-full text-[#651A1A]" strokeWidth={1.5} />
                        </div>
                        <h3 className="font-black text-xl mb-4 tracking-tight text-[#651A1A]">
                            HANDWERKLICHE HERSTELLUNG
                        </h3>
                        <p className="text-base leading-relaxed text-[#651A1A]/80">
                            Jede Torte wird von Hand mit erstklassigen Zutaten und viel Liebe gefertigt, wie zu Hause.
                        </p>
                    </div>

                    {/* KLEINSERIENPRODUKTION */}
                    <div className="bg-white/50 p-10 rounded-3xl hover:bg-white transition-colors duration-500 group text-center md:-mt-8">
                        <div className="w-24 h-24 mx-auto mb-8 flex items-center justify-center bg-[#651A1A]/5 rounded-full group-hover:bg-[#651A1A]/10 transition-all duration-500 p-5 group-hover:scale-110">
                            <CakeSlice className="w-full h-full text-[#651A1A]" strokeWidth={1.5} />
                        </div>
                        <h3 className="font-black text-xl mb-4 tracking-tight text-[#651A1A]">
                            KLEINSERIENPRODUKTION
                        </h3>
                        <p className="text-base leading-relaxed text-[#651A1A]/80">
                            Als kleine Konditorei achten wir auf jedes Detail und backen in begrenzten Chargen, um Frische zu garantieren.
                        </p>
                    </div>

                    {/* TRADITIONELLE REZEPTE */}
                    <div className="bg-white/50 p-10 rounded-3xl hover:bg-white transition-colors duration-500 group text-center">
                        <div className="w-24 h-24 mx-auto mb-8 flex items-center justify-center bg-[#651A1A]/5 rounded-full group-hover:bg-[#651A1A]/10 transition-all duration-500 p-5 group-hover:scale-110">
                            <BookOpenText className="w-full h-full text-[#651A1A]" strokeWidth={1.5} />
                        </div>
                        <h3 className="font-black text-xl mb-4 tracking-tight text-[#651A1A]">
                            TRADITIONELLE REZEPTE
                        </h3>
                        <p className="text-base leading-relaxed text-[#651A1A]/80">
                            Wir folgen authentischen spanischen Rezepten, mit Leidenschaft weitergegeben und mit der Zeit perfektioniert.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
