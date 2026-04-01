import Image from "next/image"

export default function OrderHero() {
    return (
        <section className="relative bg-[#F5E6D3] py-12 md:py-32 px-4 overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-[#651A1A]/5 blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#651A1A]/5 blur-3xl"></div>
            </div>

            <div className="container mx-auto max-w-4xl text-center relative z-10">
                <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="text-sm md:text-base tracking-[0.3em] text-[#651A1A] font-bold uppercase border-b border-[#651A1A]/20 pb-2">
                        Unser Sortiment
                    </span>
                </div>
                <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-[#651A1A] mb-4 md:mb-8 leading-[0.9] tracking-tight animate-in fade-in zoom-in-95 duration-700 delay-100">
                    UNSERE
                    <br />
                    CHEESECAKES
                </h1>
                <p className="hidden md:block text-lg md:text-2xl text-[#651A1A]/80 leading-relaxed max-w-2xl mx-auto font-light animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    Jede Kreation ist ein Kunstwerk – handgefertigt mit Liebe und den feinsten Zutaten.
                </p>
            </div>

            {/* Easter Promotion Banner */}
            <div className="container mx-auto max-w-3xl relative z-10 mt-8 md:mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                <div className="bg-white/80 backdrop-blur-sm border-2 border-[#651A1A]/20 rounded-2xl p-5 md:p-8 text-center shadow-lg">
                    <p className="text-xs md:text-sm tracking-[0.3em] text-[#651A1A] font-bold uppercase mb-2">
                        Oster-Aktion
                    </p>
                    <h3 className="text-xl md:text-3xl font-black text-[#651A1A] mb-2 md:mb-3 leading-tight">
                        Gratis Mini-Cheesecake zu jeder grossen Torte!
                    </h3>
                    <p className="text-sm md:text-base text-[#651A1A]/70 font-light">
                        Bestelle eine grosse Torte (8–10 Personen) mit Lieferung zwischen dem 3. und 6. April und erhalte eine kleine Torte (2–3 Personen) deiner Wahl gratis dazu.
                    </p>
                </div>
            </div>
        </section>
    )
}
