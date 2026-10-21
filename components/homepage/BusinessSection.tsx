'use client'

import Image from "next/image"
import { ArrowRight, Check } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import Reveal from "@/components/ui/Reveal"

// "Für Firmen" in the menu lands here. No prices: offices get a tasting first
// and an offer by email, the same as in the B2B outreach.
const EMAIL = "info@emilialab.com"

export default function BusinessSection() {
    const { t } = useLanguage()
    const b = t.business
    const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(b.mailSubject)}`

    return (
        <section id="firmen" aria-labelledby="business-heading" className="scroll-mt-24 bg-[#FBF5EF] px-4 py-14 md:py-20">
            <Reveal className="container mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[1.1fr_1fr]">
                <div className="text-[#651A1A]">
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-[#651A1A]/70">{b.eyebrow}</p>
                    <h2 id="business-heading" className="mt-3 text-3xl font-black leading-tight tracking-tight md:text-5xl">
                        {b.title}{" "}
                        <span className="block font-serif font-medium italic tracking-normal text-[#651A1A]/85">{b.titleSerif}</span>
                    </h2>
                    <p className="mt-5 max-w-lg text-base leading-relaxed text-[#651A1A]/80">{b.text}</p>
                    <ul className="mt-6 space-y-2.5">
                        {b.points.map((point) => (
                            <li key={point} className="flex items-center gap-3 text-sm font-medium">
                                <Check className="h-4 w-4 shrink-0 text-[#651A1A]" strokeWidth={2.5} aria-hidden="true" />
                                {point}
                            </li>
                        ))}
                    </ul>
                    <a
                        href={mailto}
                        className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#651A1A] px-8 py-4 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-[#4A1313]"
                    >
                        {b.cta}
                        <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                    </a>
                    <p className="mt-3 text-xs text-[#651A1A]/60">{b.ctaNote}</p>
                </div>
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
                    <Image
                        src="/emilia-boxes.jpeg"
                        alt="Emilia Cheesecake"
                        fill
                        sizes="(max-width: 768px) 100vw, 45vw"
                        className="object-cover"
                    />
                </div>
            </Reveal>
        </section>
    )
}
