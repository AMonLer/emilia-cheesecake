import Image from "next/image"

export default function OrderHero() {
    return (
        <section className="relative bg-[#F5E6D3] py-20 md:py-32 px-4 overflow-hidden">
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
                <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-[#651A1A] mb-8 leading-[0.9] tracking-tight animate-in fade-in zoom-in-95 duration-700 delay-100">
                    UNSERE
                    <br />
                    CHEESECAKES
                </h1>
                <p className="text-lg md:text-2xl text-[#651A1A]/80 leading-relaxed max-w-2xl mx-auto font-light animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    Jede Kreation ist ein Kunstwerk – handgefertigt mit Liebe und den feinsten Zutaten.
                </p>
            </div>
        </section>
    )
}
