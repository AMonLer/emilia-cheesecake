'use client'

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { MonthlySpecialBadge } from "@/components/MonthlySpecialBadge"
import Reveal from "@/components/ui/Reveal"
import { products } from "@/lib/products"
import { isSizeAvailable } from "@/lib/availability"

// The cake of the month gets a block of its own, the way Mr. CHEESECAKE gives
// its seasonal flavour its own photo and a "limited" label. The photo's
// burgundy backdrop runs into the panel so the two read as one picture.
const SLUG = "hippo"

export default function MonthlySpecialSection() {
    const { t } = useLanguage()
    const m = t.monthly
    const product = (products as Record<string, any>)[SLUG]
    const from = Math.min(
        ...Object.entries(product.prices as Record<string, number>)
            .filter(([size]) => isSizeAvailable(size))
            .map(([, price]) => price)
    ).toFixed(2)

    return (
        <section aria-labelledby="monthly-heading" className="bg-white px-4 pb-12 md:pb-20">
            <Reveal className="container mx-auto max-w-5xl">
                <div className="grid overflow-hidden rounded-3xl bg-[#5E2A2C] md:grid-cols-2">
                    {/* 4:3 on the phone: the slice is long and flat, a square left a
                        tall band of empty burgundy above and below it. */}
                    <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[440px]">
                        <Image
                            src="/hippo2.png"
                            alt={`${product.name} Cheesecake`}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover"
                        />
                    </div>
                    <div className="flex flex-col justify-center px-6 pb-8 pt-2 text-[#F5E6D3] md:p-12">
                        <MonthlySpecialBadge label={m.eyebrow} />
                        <h2 id="monthly-heading" className="mt-5 font-serif text-5xl italic leading-none md:text-7xl">
                            Noisette
                        </h2>
                        <p className="mt-2 font-serif text-lg italic text-[#E8C98E]">{m.label}</p>
                        <p className="mt-5 max-w-sm text-base leading-relaxed text-[#F5E6D3]/85">{m.text}</p>
                        <p className="mt-2 text-sm text-[#F5E6D3]/60">{m.note}</p>
                        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
                            <Link
                                href={`/product/${SLUG}`}
                                className="inline-flex items-center gap-2 rounded-full bg-[#F5E6D3] px-7 py-3.5 text-xs font-black uppercase tracking-wider text-[#651A1A] transition-colors hover:bg-white"
                            >
                                {m.cta}
                                <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                            </Link>
                            <span className="text-sm text-[#F5E6D3]/70">{t.hero.fromPrice(from)}</span>
                        </div>
                    </div>
                </div>
            </Reveal>
        </section>
    )
}
