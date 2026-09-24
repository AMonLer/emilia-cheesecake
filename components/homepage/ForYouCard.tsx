'use client'

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

// On mobile almost nobody scrolls past the first products (Clarity: no home
// page view below 16% depth), so For You is a single card right under them
// instead of a long section further down that nobody reached.
export default function ForYouCard() {
    const { t } = useLanguage()
    const f = t.forYou

    return (
        <section id="foryou" aria-labelledby="foryou-heading" className="scroll-mt-24 bg-white px-4 pb-12 md:pb-20">
            <div className="container mx-auto max-w-5xl">
                <Link
                    href="/bestellen?foryou=1"
                    className="group grid overflow-hidden rounded-3xl bg-[#651A1A] text-white shadow-[0_20px_40px_-24px_rgba(101,26,26,0.7)] md:grid-cols-[1fr_1.25fr]"
                >
                    <div className="relative h-44 sm:h-56 md:h-auto md:min-h-[320px]">
                        <Image
                            src="/pexels-elly-fairytale-3893712.jpg"
                            alt={f.previewImageAlt}
                            fill
                            sizes="(max-width: 768px) 100vw, 45vw"
                            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                        />
                    </div>
                    <div className="flex flex-col justify-center p-6 md:p-10">
                        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#F5E6D3]/80">
                                {f.eyebrow}
                            </p>
                            <span className="rounded-full border border-[#F5E6D3]/30 bg-[#F5E6D3]/10 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-[#F5E6D3]">
                                {f.included}
                            </span>
                        </div>
                        <h2 id="foryou-heading" className="text-2xl font-black leading-tight tracking-tight md:text-4xl">
                            {f.title1}{" "}
                            <span className="font-serif font-medium italic tracking-normal text-[#F5E6D3]">{f.titleSerif}</span>
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-white/75 md:text-base">
                            {f.desc}
                        </p>
                        <span className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-xs font-black uppercase tracking-wider text-[#651A1A] transition-colors group-hover:bg-[#F5E6D3] sm:w-fit">
                            {f.cta}
                            <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                        </span>
                        <p className="mt-3 text-xs leading-relaxed text-white/60">{f.ctaNote}</p>
                    </div>
                </Link>
            </div>
        </section>
    )
}
