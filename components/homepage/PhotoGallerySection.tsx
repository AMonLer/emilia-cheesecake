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
        <section className="py-20 md:py-32 bg-white relative overflow-hidden">
            {/* Header */}
            <div className="container mx-auto px-4 mb-16 md:mb-24 text-center">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#651A1A] mb-6 uppercase">
                    Unsere Kreationen
                </h2>
                <p className="text-[#651A1A]/70 text-lg max-w-2xl mx-auto font-medium">
                    Ein Einblick in unsere Backstube und die Vielfalt unserer handgemachten Cheesecakes.
                </p>
            </div>

            {/* Masonry Grid */}
            <div className="container mx-auto px-4">
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {galleryItems.map((item, index) => (
                        <a
                            key={index}
                            href="https://www.instagram.com/emilia.cheesecake/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block relative group break-inside-avoid rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500"
                        >
                            <div className="relative w-full">
                                <Image
                                    src={item.src}
                                    alt={item.alt}
                                    width={0}
                                    height={0}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                    style={{ width: '100%', height: 'auto' }}
                                />
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-[#651A1A]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                    <div className="bg-white p-4 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <Instagram className="w-6 h-6 text-[#651A1A]" />
                                    </div>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-20">
                <a
                    href="https://www.instagram.com/emilia.cheesecake/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-[#651A1A] text-white rounded-xl font-black tracking-widest uppercase text-xs hover:bg-[#651A1A]/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 duration-300"
                >
                    <Instagram className="w-4 h-4" />
                    <span>Folge uns auf Instagram</span>
                </a>
            </div>
        </section>
    )
}
