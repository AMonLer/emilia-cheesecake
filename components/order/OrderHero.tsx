import Image from "next/image"

export default function OrderHero() {
    return (
        <section className="relative bg-[#F5E6D3] py-8 md:py-16 px-4 overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-[#651A1A]/5 blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#651A1A]/5 blur-3xl"></div>
            </div>

            <div className="container mx-auto max-w-4xl text-center relative z-10">
                <div className="mb-3 md:mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="text-[10px] md:text-xs tracking-[0.3em] text-[#651A1A] font-bold uppercase border-b border-[#651A1A]/20 pb-1">
                        Unser Sortiment
                    </span>
                </div>
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#651A1A] mb-3 md:mb-5 leading-[0.9] tracking-tight animate-in fade-in zoom-in-95 duration-700 delay-100">
                    UNSERE
                    <br />
                    CHEESECAKES
                </h1>
                <p className="hidden md:block text-base md:text-lg text-[#651A1A]/80 leading-relaxed max-w-xl mx-auto font-light animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    Jede Kreation ist ein Kunstwerk – handgefertigt mit Liebe und den feinsten Zutaten.
                </p>
            </div>

            {/* Easter Promotion Banner */}
            <div className="container mx-auto max-w-xl relative z-10 mt-4 md:mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                <div className="bg-white/80 backdrop-blur-sm border border-[#651A1A]/15 rounded-xl px-4 py-3 md:px-6 md:py-4 text-center shadow-md">
                    <p className="text-[9px] md:text-[10px] tracking-[0.25em] text-[#651A1A] font-bold uppercase mb-1">
                        Oster-Aktion
                    </p>
                    <h3 className="text-sm md:text-lg font-black text-[#651A1A] mb-1 leading-tight">
                        Gratis Mini-Cheesecake zu jeder grossen Torte!
                    </h3>
                    <p className="text-[11px] md:text-xs text-[#651A1A]/60 font-light leading-snug">
                        Lieferung zwischen dem 3. und 6. April.
                    </p>
                </div>
            </div>
        </section>
    )
}
