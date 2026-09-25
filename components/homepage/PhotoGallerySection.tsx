'use client'

import Image from "next/image"
import { Instagram } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import Reveal from "@/components/ui/Reveal"

const INSTAGRAM_URL = "https://www.instagram.com/emilia.cheesecake/"

// Editorial grid of Instagram posts: one hero tile and a frame of smaller
// ones, still (the two auto-scrolling rows felt busy and dated). The last
// four only show from tablet up, to keep the phone version short.
const tiles = [
    { src: "/IG2.jpg", alt: "Emilia Cheesecake vor der bordeauxroten Emilia-Box", hero: true },
    { src: "/IG6.jpg", alt: "Ein Stück San Sebastian Cheesecake mit cremigem Kern" },
    { src: "/IG3.jpg", alt: "Angeschnittener San Sebastian Cheesecake von oben" },
    { src: "/IG8.jpg", alt: "Der cremige Kern eines Emilia Cheesecakes" },
    { src: "/IG4.jpg", alt: "Classic Cheesecake auf einem goldenen Teller" },
    { src: "/IG7.jpg", alt: "Drei kleine Cheesecakes: Schoggi, Classic und Pistachio", desktopOnly: true },
    { src: "/IG5.jpg", alt: "Pistachio Cheesecake mit gehackten Pistazien", desktopOnly: true },
    { src: "/IG1.jpg", alt: "Nahaufnahme eines Emilia Cheesecakes", desktopOnly: true },
    { src: "/IG9.jpg", alt: "Lotus Cheesecake von Emilia", desktopOnly: true },
]

export default function PhotoGallerySection() {
    const { t } = useLanguage()
    const g = t.gallery

    return (
        <section aria-labelledby="gallery-heading" className="bg-white py-16 md:py-24">
            <div className="container mx-auto max-w-6xl px-4">
                <Reveal className="mb-10 text-center md:mb-14">
                    <a
                        href={INSTAGRAM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mb-4 inline-block text-xs font-bold uppercase tracking-[0.25em] text-[#651A1A]/70 transition-colors hover:text-[#651A1A]"
                    >
                        @emilia.cheesecake
                    </a>
                    <h2 id="gallery-heading" className="text-4xl font-black leading-[0.95] tracking-tighter text-[#651A1A] md:text-5xl lg:text-7xl">
                        {g.heading}{" "}
                        <span className="font-serif font-medium italic tracking-normal text-[#651A1A]/90">{g.accent}</span>
                    </h2>
                    <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[#651A1A]/75">{g.intro}</p>
                </Reveal>

                <Reveal delay={100} className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                    {tiles.map((tile) => (
                        <a
                            key={tile.src}
                            href={INSTAGRAM_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${tile.alt} – ${g.viewOnInstagram}`}
                            className={`group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-[#F5E6D3] ${tile.hero ? 'col-span-2 row-span-2 md:aspect-auto' : ''} ${tile.desktopOnly ? 'hidden md:block' : ''}`}
                        >
                            <Image
                                src={tile.src}
                                alt={tile.alt}
                                fill
                                sizes={tile.hero ? "(max-width: 768px) 100vw, 560px" : "(max-width: 768px) 50vw, 280px"}
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                            />
                            <span className="absolute inset-0 flex items-end justify-start bg-gradient-to-t from-[#651A1A]/60 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                                <Instagram className="h-5 w-5 text-white" strokeWidth={1.75} aria-hidden="true" />
                            </span>
                        </a>
                    ))}
                </Reveal>

                <div className="mt-10 text-center">
                    <a
                        href={INSTAGRAM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-[#651A1A] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-[#651A1A] transition-colors hover:bg-[#651A1A] hover:text-white active:bg-[#651A1A] active:text-white"
                    >
                        <Instagram className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                        {g.followUs}
                    </a>
                </div>
            </div>
        </section>
    )
}
