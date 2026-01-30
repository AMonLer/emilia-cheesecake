import Image from "next/image"
import { Instagram } from "lucide-react"

const galleryItems = [
    { src: "/IG1.jpg", alt: "Emilia Cheesecake" },
    { src: "/IG2.jpg", alt: "Emilia Cheesecake" },
    { src: "/IG3.jpg", alt: "Emilia Cheesecake" },
    { src: "/IG4.jpg", alt: "Emilia Cheesecake" },
    { src: "/IG5.jpg", alt: "Pistachio Cheesecake" },
    { src: "/IG6.jpg", alt: "Emilia Cheesecake" },
    { src: "/IG7.jpg", alt: "Emilia Cheesecake" },
    { src: "/IG8.jpg", alt: "Emilia Cheesecake" },
    { src: "/IG9.jpg", alt: "Emilia Cheesecake" },
]

export default function PhotoGallerySection() {
    return (
        <section className="py-24 relative overflow-hidden bg-[#F8EBDD]">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#EEC8B7] rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#651A1A] rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none" />

            <div className="container mx-auto px-4 mb-16 text-center relative">
                <span className="inline-block text-xs font-bold tracking-[0.35em] uppercase text-[#651A1A]/70 mb-4 px-4 py-2 border border-[#651A1A]/10 rounded-full bg-white/40 backdrop-blur-sm">
                    Galerie
                </span>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-[#651A1A] mb-2 font-serif">
                    Unsere Kreationen
                </h2>
                <p className="text-[#651A1A]/60 mt-4 max-w-lg mx-auto font-light leading-relaxed">
                    Ein Einblick in unsere Backstube und die Vielfalt unserer handgemachten Cheesecakes.
                </p>
            </div>

            {/* Scrolling Banner */}
            <div className="relative w-full overflow-hidden py-8">
                <style jsx>{`
                    @keyframes scroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .animate-scroll {
                        animation: scroll 40s linear infinite;
                    }
                    .animate-scroll:hover {
                        animation-play-state: paused;
                    }
                `}</style>

                <div className="flex w-max animate-scroll">
                    {[...galleryItems, ...galleryItems].map((item, index) => (
                        <div
                            key={index}
                            className="w-[280px] md:w-[350px] px-4 flex-shrink-0 group cursor-pointer"
                        >
                            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] mb-6 shadow-xl shadow-[#651A1A]/10 border-[6px] border-white transition-transform duration-500 group-hover:-translate-y-2">
                                <Image
                                    src={item.src}
                                    alt={item.alt}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-[#651A1A]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 contrast-125" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center mt-16 relative z-10">
                <a
                    href="https://www.instagram.com/emilia.cheesecake/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-col items-center gap-4 group"
                >
                    <div className="p-5 rounded-full bg-white shadow-lg shadow-[#651A1A]/10 group-hover:shadow-xl group-hover:shadow-[#651A1A]/20 group-hover:-translate-y-1 transition-all duration-300">
                        <Instagram className="w-8 h-8 text-[#651A1A]" strokeWidth={1.5} />
                    </div>
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#651A1A] group-hover:opacity-70 transition-opacity border-b border-transparent group-hover:border-[#651A1A]/30 pb-0.5">
                        Folge uns auf Instagram
                    </span>
                </a>
            </div>
        </section>
    )
}
