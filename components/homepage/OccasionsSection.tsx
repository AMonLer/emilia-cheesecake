import Image from "next/image"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

const occasions = [
    {
        title: "BIRTHDAYS",
        image: "/birthday1.jpg",
        alt: "Birthdays"
    },
    {
        title: "THANK YOU",
        image: "/Thankyou.png",
        alt: "Thank You"
    },
    {
        title: "CONGRATS",
        image: "/Congrats.jpeg",
        alt: "Congrats"
    }
]

export default function OccasionsSection() {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "center" })
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [canScrollNext, setCanScrollNext] = useState(true)

    const onSelect = useCallback(() => {
        if (!emblaApi) return
        setSelectedIndex(emblaApi.selectedScrollSnap())
        setCanScrollNext(emblaApi.canScrollNext())
    }, [emblaApi])

    useEffect(() => {
        if (!emblaApi) return
        onSelect()
        emblaApi.on("select", onSelect)
        emblaApi.on("reInit", onSelect)
    }, [emblaApi, onSelect])

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                {/* Título y descripción centrados */}
                <div className="text-center mb-12 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                        GESCHENKE FÜR JEDEN ANLASS!
                    </h2>
                    <p className="text-base leading-relaxed">
                        Ob du den Geburtstag eines Freundes oder Familienmitglieds feierst, eine Zusammenkunft veranstaltest oder einfach ein Geschenk verschicken möchtest – wir haben die besten Desserts für jeden Anlass.
                    </p>
                </div>

                {/* Mobile Carousel */}
                <div className="md:hidden relative group">
                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex -ml-4">
                            {occasions.map((item, index) => (
                                <div key={index} className="flex-[0_0_85%] min-w-0 pl-4">
                                    <Link href="/bestellen" className="text-center transition-opacity duration-300 block" style={{ opacity: selectedIndex === index ? 1 : 0.5 }}>
                                        <div className="aspect-[4/3] overflow-hidden rounded-2xl mb-4 relative">
                                            <Image
                                                src={item.image}
                                                alt={item.alt}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <h3 className="font-black text-xl tracking-tight">{item.title}</h3>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Arrow Indicator */}
                    {canScrollNext && (
                        <button
                            onClick={() => emblaApi?.scrollNext()}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg text-[#651A1A] animate-pulse"
                            aria-label="Next slide"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    )}

                    {/* Dots */}
                    <div className="flex justify-center gap-2 mt-6">
                        {occasions.map((_, index) => (
                            <button
                                key={index}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all duration-300",
                                    selectedIndex === index ? "bg-[#651A1A] w-6" : "bg-[#651A1A]/20"
                                )}
                                onClick={() => emblaApi?.scrollTo(index)}
                            />
                        ))}
                    </div>
                </div>

                {/* Desktop Grid */}
                <div className="hidden md:grid grid-cols-3 gap-8">
                    {occasions.map((item, index) => (
                        <Link href="/bestellen" key={index} className="text-center group cursor-pointer">
                            <div className="aspect-[4/3] overflow-hidden rounded-2xl mb-4 relative">
                                <Image
                                    src={item.image}
                                    alt={item.alt}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <h3 className="font-black text-xl tracking-tight group-hover:text-[#651A1A] transition-colors">{item.title}</h3>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
