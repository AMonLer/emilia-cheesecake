"use client"

import { Star, CheckCircle2, Quote } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

const testimonials = [
    {
        name: "Constanza",
        text: "I ordered the classic cheesecake because I wanted to treat our team meeting to something sweet and special. The service was impeccable, and the cheesecake... simply delicious. For a moment, I felt like I was in the Basque Country. It's the perfect surprise to send to friends you love, something made with heart, beautifully presented and full of flavor.",
        rating: 5,
        verified: true,
    },
    {
        name: "Nicole",
        text: "Was very delicious. Would order again and can recommend.",
        rating: 5,
        verified: true,
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
        <section className="py-16 md:py-24 bg-[#FFFCF8] overflow-hidden">
            <div className="container mx-auto px-4 relative">
                {/* Header */}
                <div className="text-center mb-12 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-[#651A1A] mb-4">
                        WAS UNSERE KUNDEN SAGEN
                    </h2>
                    <div className="w-24 h-5 bg-[#dec181] mx-auto rounded-full opacity-30 transform -rotate-1"></div>
                </div>

                {/* Mobile Carousel */}
                <div className="md:hidden">
                    <div className="overflow-visible pb-8" ref={emblaRef}>
                        <div className="flex -ml-4">
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="flex-[0_0_85%] min-w-0 pl-4">
                                    <div
                                        className="bg-white rounded-3xl p-8 shadow-sm border border-[#F5E6D3] transition-all duration-300 relative h-full flex flex-col"
                                        style={{ opacity: selectedIndex === index ? 1 : 0.5, transform: selectedIndex === index ? 'scale(1)' : 'scale(0.95)' }}
                                    >
                                        <Quote className="absolute top-6 right-6 w-12 h-12 text-[#dec181] opacity-10" />
                                        <div className="mb-6 relative z-10">
                                            <StarRating rating={testimonial.rating} />
                                        </div>
                                        <p className="text-[#651A1A]/80 leading-relaxed text-lg mb-8 flex-grow relative z-10 font-medium">
                                            &ldquo;{testimonial.text}&rdquo;
                                        </p>
                                        
                                        <div className="flex items-center gap-4 mt-auto pt-6 border-t border-[#F5E6D3]/50 relative z-10">
                                            <div className="w-12 h-12 rounded-full bg-[#FCF8F2] flex items-center justify-center text-[#651A1A] font-bold text-lg border border-[#F5E6D3]">
                                                {testimonial.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#651A1A]">{testimonial.name}</h4>
                                                {testimonial.verified && (
                                                    <div className="flex items-center gap-1 text-xs text-green-600 font-medium mt-0.5">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        <span>Verifizierter Kauf</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dots */}
                    <div className="flex justify-center gap-2 mt-2">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all duration-300",
                                    selectedIndex === index ? "bg-[#651A1A] w-6" : "bg-[#651A1A]/20"
                                )}
                                onClick={() => emblaApi?.scrollTo(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Desktop Grid */}
                <div className="hidden md:grid grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-3xl p-8 shadow-sm border border-[#F5E6D3] hover:shadow-xl hover:-translate-y-2 hover:border-[#dec181]/50 transition-all duration-500 relative h-full flex flex-col group cursor-default"
                        >
                            <Quote className="absolute top-6 right-6 w-16 h-16 text-[#dec181] opacity-5 group-hover:opacity-15 transition-opacity duration-500 group-hover:scale-110 transform" />
                            <div className="mb-6 relative z-10">
                                <StarRating rating={testimonial.rating} />
                            </div>
                            <p className="text-[#651A1A]/80 leading-relaxed text-lg mb-8 flex-grow relative z-10 font-medium">
                                &ldquo;{testimonial.text}&rdquo;
                            </p>
                            
                            <div className="flex items-center gap-4 mt-auto pt-6 border-t border-[#F5E6D3]/50 relative z-10">
                                <div className="w-12 h-12 rounded-full bg-[#FCF8F2] flex items-center justify-center text-[#651A1A] font-bold text-lg border border-[#F5E6D3] group-hover:bg-[#651A1A] group-hover:text-white transition-colors duration-500">
                                    {testimonial.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#651A1A]">{testimonial.name}</h4>
                                    {testimonial.verified && (
                                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-1 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>Verifizierter Kauf</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
