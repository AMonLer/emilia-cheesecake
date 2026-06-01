'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function Marquee() {
    const { t } = useLanguage()
    return (
        <div className="bg-black text-white py-4 overflow-hidden">
            <div className="flex whitespace-nowrap animate-marquee">
                {[...Array(10)].map((_, i) => (
                    <span key={i} className="inline-block px-8 font-black text-sm tracking-wide">
                        {t.marquee}
                    </span>
                ))}
            </div>
        </div>
    )
}
