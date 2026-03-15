"use client"

import { Star } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

const testimonials = [
    {
        name: "Laura M.",
        text: "Der beste Cheesecake, den ich je gegessen habe! Cremig, nicht zu süss und einfach perfekt. Meine Gäste waren begeistert.",
        rating: 5,
    },
    {
        name: "Thomas K.",
        text: "Habe den Cheesecake zum Geburtstag meiner Frau bestellt. Die Lieferung war pünktlich und der Kuchen war unglaublich frisch. Absolut empfehlenswert!",
        rating: 5,
    },
    {
        name: "Sofia R.",
        text: "Endlich ein San Sebastian Cheesecake in Zürich! Schmeckt wie in einem Sternerestaurant. Wir bestellen jetzt regelmässig.",
        rating: 5,
    },
    {
        name: "Marco B.",
        text: "Die Qualität ist hervorragend. Man merkt, dass alles mit Liebe und besten Zutaten gemacht wird. Mein neuer Lieblingskuchen!",
        rating: 5,
    },
    {
        name: "Anna W.",
        text: "Ich bin Cheesecake-Fan und dieser ist mit Abstand der beste in der Schweiz. Die Textur ist einfach himmlisch.",
        rating: 5,
    },
]

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={cn(
                        "w-4 h-4",
                        i < rating ? "text-[#dec181] fill-[#dec181]" : "text-gray-300"
                    )}
                />
            ))}
        </div>
    )
}

export default function TestimonialsSection() {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" })
    const [selectedIndex, setSelectedIndex] = useState(0)

    const onSelect = useCallback(() => {
        if (!emblaApi) return
        setSelectedIndex(emblaApi.selectedScrollSnap())
    }, [emblaApi])

    useEffect(() => {
        if (!emblaApi) return
        onSelect()
        emblaApi.on("select", onSelect)
        emblaApi.on("reInit", onSelect)
    }, [emblaApi, onSelect])

    return (
        <section className="py-16 md:py-24 bg-[#FFFCF8]">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-[#651A1A] mb-4">
                        WAS UNSERE KUNDEN SAGEN
                    </h2>
                    <div className="w-24 h-5 bg-[#dec181] mx-auto rounded-full opacity-30 transform -rotate-1"></div>
                </div>

                {/* Mobile Carousel */}
                <div className="md:hidden">
                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex -ml-4">
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="flex-[0_0_85%] min-w-0 pl-4">
                                    <div
                                        className="bg-white rounded-2xl p-6 shadow-sm border border-[#F5E6D3] transition-opacity duration-300"
                                        style={{ opacity: selectedIndex === index ? 1 : 0.5 }}
                                    >
                                        <StarRating rating={testimonial.rating} />
                                        <p className="text-[#651A1A]/80 leading-relaxed mt-4 mb-6 text-base">
                                            &ldquo;{testimonial.text}&rdquo;
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#F5E6D3] rounded-full flex items-center justify-center">
                                                <span className="text-[#651A1A] font-black text-sm">
                                                    {testimonial.name.charAt(0)}
                                                </span>
                                            </div>
                                            <span className="font-bold text-[#651A1A] text-sm tracking-wide">
                                                {testimonial.name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dots */}
                    <div className="flex justify-center gap-2 mt-6">
                        {testimonials.map((_, index) => (
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
                <div className="hidden md:grid grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {testimonials.slice(0, 3).map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl p-8 shadow-sm border border-[#F5E6D3] hover:shadow-md transition-shadow duration-300"
                        >
                            <StarRating rating={testimonial.rating} />
                            <p className="text-[#651A1A]/80 leading-relaxed mt-4 mb-6 text-base">
                                &ldquo;{testimonial.text}&rdquo;
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#F5E6D3] rounded-full flex items-center justify-center">
                                    <span className="text-[#651A1A] font-black text-sm">
                                        {testimonial.name.charAt(0)}
                                    </span>
                                </div>
                                <span className="font-bold text-[#651A1A] text-sm tracking-wide">
                                    {testimonial.name}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom row desktop - 2 cards centered */}
                <div className="hidden md:grid grid-cols-2 gap-6 max-w-3xl mx-auto mt-6">
                    {testimonials.slice(3).map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl p-8 shadow-sm border border-[#F5E6D3] hover:shadow-md transition-shadow duration-300"
                        >
                            <StarRating rating={testimonial.rating} />
                            <p className="text-[#651A1A]/80 leading-relaxed mt-4 mb-6 text-base">
                                &ldquo;{testimonial.text}&rdquo;
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#F5E6D3] rounded-full flex items-center justify-center">
                                    <span className="text-[#651A1A] font-black text-sm">
                                        {testimonial.name.charAt(0)}
                                    </span>
                                </div>
                                <span className="font-bold text-[#651A1A] text-sm tracking-wide">
                                    {testimonial.name}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
