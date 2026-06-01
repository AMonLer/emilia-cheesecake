'use client'

import Image from "next/image"
import { Instagram } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const galleryItemsRow1 = [
    { src: "/IG1.jpg", alt: "Emilia Cheesecake" },
    { src: "/IG2.jpg", alt: "Emilia Cheesecake" },
    { src: "/IG3.jpg", alt: "Emilia Cheesecake" },
    { src: "/IG4.jpg", alt: "Emilia Cheesecake" },
    { src: "/IG5.jpg", alt: "Pistachio Cheesecake" },
]

const galleryItemsRow2 = [
    { src: "/IG6.jpg", alt: "Emilia Cheesecake" },
    { src: "/IG7.jpg", alt: "Emilia Cheesecake" },
    { src: "/IG8.jpg", alt: "Emilia Cheesecake" },
    { src: "/IG9.jpg", alt: "Emilia Cheesecake" },
    { src: "/IG1.jpg", alt: "Pistachio Cheesecake" },
]

export default function PhotoGallerySection() {
    const { t } = useLanguage()
    const g = t.gallery

    return (
        <section className="py-24 relative overflow-hidden bg-[#F8EBDD]">
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/60 to-transparent pointer-events-none z-10" />
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-[#EEC8B7]/40 to-transparent rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 mb-16 text-center relative z-20">
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-[0.95] text-[#651A1A] mb-2 uppercase">
                    {g.heading} <span className="font-serif font-medium italic capitalize text-5xl md:text-6xl lg:text-8xl text-[#651A1A]/90 tracking-normal inline-block ml-1 py-1">Kreationen</span>
                </h2>
            </div>

            {/* Scrolling Banners */}
            <div className="relative w-full overflow-hidden py-4 z-20 flex flex-col gap-6 md:gap-10">
                <style jsx>{`
                    @keyframes scrollLeft {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    @keyframes scrollRight {
                        0% { transform: translateX(-50%); }
                        100% { transform: translateX(0); }
                    }
                    .animate-scroll-left {
                        animation: scrollLeft 45s linear infinite;
                    }
                    .animate-scroll-right {
                        animation: scrollRight 45s linear infinite;
                    }
                    .scroll-container:hover > div {
                        animation-play-state: paused;
                    }
                `}</style>

                {/* Row 1 - Left */}
                <div className="scroll-container w-full overflow-hidden">
                    <div className="flex w-max animate-scroll-left">
                        {[...galleryItemsRow1, ...galleryItemsRow1, ...galleryItemsRow1].map((item, index) => (
                            <div
                                key={index}
                                className="w-[260px] md:w-[320px] px-3 md:px-5 flex-shrink-0 group cursor-pointer"
                            >
                                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl md:rounded-[2rem] shadow-lg shadow-[#651A1A]/10 transition-all duration-500 group-hover:-translate-y-2 border border-white/50">
                                    <Image
                                        src={item.src}
                                        alt={item.alt}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#651A1A]/70 via-[#651A1A]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-8 backdrop-blur-[1px]">
                                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 flex flex-col items-center gap-2">
                                            <Instagram className="w-8 h-8 text-white drop-shadow-md" strokeWidth={1.5} />
                                            <span className="text-white text-xs font-semibold tracking-wider uppercase drop-shadow-md">{g.viewOnInstagram}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Row 2 - Right */}
                <div className="scroll-container w-full overflow-hidden">
                    <div className="flex w-max animate-scroll-right">
                        {[...galleryItemsRow2, ...galleryItemsRow2, ...galleryItemsRow2].map((item, index) => (
                            <div
                                key={index}
                                className="w-[260px] md:w-[320px] px-3 md:px-5 flex-shrink-0 group cursor-pointer"
                            >
                                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl md:rounded-[2rem] shadow-lg shadow-[#651A1A]/10 transition-all duration-500 group-hover:-translate-y-2 border border-white/50">
                                    <Image
                                        src={item.src}
                                        alt={item.alt}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#651A1A]/70 via-[#651A1A]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-8 backdrop-blur-[1px]">
                                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 flex flex-col items-center gap-2">
                                            <Instagram className="w-8 h-8 text-white drop-shadow-md" strokeWidth={1.5} />
                                            <span className="text-white text-xs font-semibold tracking-wider uppercase drop-shadow-md">{g.viewOnInstagram}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="text-center mt-16 relative z-30">
                <a
                    href="https://www.instagram.com/emilia.cheesecake/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-col items-center gap-4 group"
                >
                    <div className="p-6 rounded-full bg-white shadow-xl shadow-[#651A1A]/10 group-hover:shadow-2xl group-hover:shadow-[#651A1A]/20 group-hover:-translate-y-2 transition-all duration-500">
                        <div className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-lg p-px group-hover:scale-110 transition-transform duration-500">
                            <div className="bg-white rounded-lg p-2">
                                <Instagram className="w-8 h-8 text-[#651A1A]" strokeWidth={2} />
                            </div>
                        </div>
                    </div>
                    <span className="text-sm font-bold tracking-[0.2em] uppercase text-[#651A1A] group-hover:text-black transition-colors border-b-2 border-transparent group-hover:border-[#651A1A]/30 pb-1">
                        {g.followUs}
                    </span>
                </a>
            </div>

            <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-white/80 to-transparent pointer-events-none z-10" />
        </section>
    )
}
