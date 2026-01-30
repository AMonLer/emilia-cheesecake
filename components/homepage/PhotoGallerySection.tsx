import Image from "next/image"
import { Instagram } from "lucide-react"

const galleryItems = [
    { src: "/IG1.jpg", title: "Emilia Cheesecake" },
    { src: "/IG2.jpg", title: "Emilia Cheesecake" },
    { src: "/IG3.jpg", title: "Emilia Cheesecake" },
    { src: "/IG4.jpg", title: "Emilia Cheesecake" },
    { src: "/IG5.jpg", title: "Pistachio Cheesecake" },
    { src: "/IG6.jpg", title: "Emilia Cheesecake" },
    { src: "/IG7.jpg", title: "Emilia Cheesecake" },
    { src: "/IG8.jpg", title: "Emilia Cheesecake" },
    { src: "/IG9.jpg", title: "Emilia Cheesecake" },
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
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center mt-16">
                <a
                    href="https://www.instagram.com/emilia.cheesecake/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-col items-center gap-4 group"
                >
                    <div className="p-4 rounded-full border-2 border-[#651A1A]/10 group-hover:border-[#651A1A] transition-colors duration-300">
                        <Instagram className="w-12 h-12 text-[#651A1A]" strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-bold tracking-widest uppercase text-black group-hover:text-[#651A1A] transition-colors">
                        Folge uns auf Instagram
                    </span>
                </a>
            </div>
        </section>
    )
}
