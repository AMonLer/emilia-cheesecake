import Image from "next/image"

export default function AboutHero() {
    return (
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/Portada1.jpg" // Using an existing image for now, ideally would be a specific hero image
                    alt="Emilia Cheesecake Background"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 text-center text-white">
                <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="text-sm md:text-base tracking-[0.3em] font-bold uppercase border-b-2 border-white/30 pb-2">
                        Unsere Geschichte
                    </span>
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[0.9] tracking-tight animate-in fade-in zoom-in-95 duration-700 delay-100">
                    VON HAND GEMACHT,
                    <br />
                    MIT HERZ GEBACKEN
                </h1>
                <p className="text-lg md:text-2xl text-white/90 leading-relaxed max-w-2xl mx-auto font-light animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    Jeder Käsekuchen erzählt eine Geschichte – von Tradition, Leidenschaft und dem Streben nach Perfektion.
                </p>
            </div>
        </section>
    )
}
