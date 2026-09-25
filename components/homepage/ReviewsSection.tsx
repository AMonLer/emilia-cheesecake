'use client'

import { ArrowUpRight } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { customerReviews, GOOGLE_REVIEWS_URL } from "@/lib/reviews"

// Real customer words, right above the Instagram gallery. They replace the
// two influencer videos. No average score shown on purpose: 4.3 from 7
// reviews undersells the cakes; add it here once there are enough reviews.
export default function ReviewsSection() {
    const { t, locale } = useLanguage()
    const r = t.reviews

    return (
        <section aria-labelledby="reviews-heading" className="bg-[#FDFBF7] py-12 md:py-20">
            <div className="container mx-auto max-w-6xl px-4">
                <div className="mb-8 text-center md:mb-12">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#651A1A]/70">{r.eyebrow}</p>
                    <h2 id="reviews-heading" className="text-3xl font-black tracking-tight text-[#651A1A] md:text-5xl">
                        {r.heading}
                    </h2>
                </div>

                {/* Swipe through all of them on the phone; a row of three on larger
                    screens, where a hidden sideways scroll would go unnoticed. */}
                <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 no-scrollbar md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
                    {customerReviews.map((review, index) => (
                        <li
                            key={review.name}
                            className={`flex w-[82vw] max-w-[360px] shrink-0 snap-center flex-col rounded-2xl border border-[#E6D5C0] bg-white p-6 shadow-[0_12px_30px_-22px_rgba(101,26,26,0.5)] md:w-auto md:max-w-none ${index >= 3 ? 'md:hidden' : ''}`}
                        >
                            <span aria-hidden="true" className="font-serif text-5xl italic leading-none text-[#D4AF85]">“</span>
                            <blockquote lang={locale} className="mt-1 flex-1 text-[0.95rem] leading-relaxed text-[#1a1a1a]/85">
                                {review.text[locale]}
                            </blockquote>
                            <p className="mt-5 text-sm font-bold text-[#651A1A]">{review.name}</p>
                            {/* Shown in the page's language; a translation says so. */}
                            <p className="text-xs text-gray-500">
                                {r.source}{review.original !== locale ? ` · ${r.translated}` : ''}
                            </p>
                        </li>
                    ))}
                </ul>

                <div className="mt-4 text-center">
                    <a
                        href={GOOGLE_REVIEWS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-[#651A1A] underline underline-offset-4 hover:text-black"
                    >
                        {r.allOnGoogle}
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                </div>
            </div>
        </section>
    )
}
