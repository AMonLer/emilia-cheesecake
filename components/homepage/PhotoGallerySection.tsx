import Image from "next/image"

const galleryItems = [
    { src: "/original1.png", title: "Original Cheesecake" },
    { src: "/pistacho1.png", title: "Pistachio Cheesecake" },
    { src: "/lotus1.png", title: "Lotus Cheesecake" },
    { src: "/chocolate1.png", title: "Chocolate Cheesecake" },
    { src: "/cafe1.png", title: "Kaffee Cheesecake" },
    { src: "/original2.png", title: "Original Cheesecake" },
    { src: "/pistacho2.png", title: "Pistachio Cheesecake" },
    { src: "/lotus2.png", title: "Lotus Cheesecake" },
    { src: "/chocolate2.png", title: "Chocolate Cheesecake" },
    { src: "/cafe2.png", title: "Kaffee Cheesecake" },
]

export default function PhotoGallerySection() {
    return (
        <section className="py-24 relative overflow-hidden bg-white">
            <div className="container mx-auto px-4 mb-12 text-center">
                <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-[#651A1A] mb-4">
                    Galerie
                </span>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-black mb-2">
                    Unsere Kreationen
                </h2>
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
                            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl mb-4">
                                <Image
                                    src={item.src}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <h3 className="text-center font-bold text-lg md:text-xl tracking-tight text-[#1a1a1a] opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                                {item.title}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center mt-12">
                <a
                    href="https://www.instagram.com/emilia.cheesecake/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-b-2 border-black pb-1 text-sm font-bold tracking-widest uppercase hover:text-[#651A1A] hover:border-[#651A1A] transition-colors"
                >
                    Folge uns auf Instagram
                </a>
            </div>
        </section>
    )
}
