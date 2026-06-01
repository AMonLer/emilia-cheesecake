'use client'

import Image from "next/image"
import { useLanguage } from "@/contexts/LanguageContext"

export default function OrderHero() {
    const { t } = useLanguage()
    const o = t.orderHero
    const [titleLine1, titleLine2] = o.title.split('\n')

    return (
        <section className="relative bg-[#F5E6D3] py-8 md:py-16 px-4 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-[#651A1A]/5 blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#651A1A]/5 blur-3xl"></div>
            </div>

            <div className="container mx-auto max-w-4xl text-center relative z-10">
                <div className="mb-3 md:mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="text-[10px] md:text-xs tracking-[0.3em] text-[#651A1A] font-bold uppercase border-b border-[#651A1A]/20 pb-1">
                        {o.eyebrow}
                    </span>
                </div>
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#651A1A] mb-3 md:mb-5 leading-[0.9] tracking-tight animate-in fade-in zoom-in-95 duration-700 delay-100">
                    {titleLine1}
                    <br />
                    {titleLine2}
                </h1>
                <p className="hidden md:block text-base md:text-lg text-[#651A1A]/80 leading-relaxed max-w-xl mx-auto font-light animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    {o.subtitle}
                </p>
            </div>
        </section>
    )
}
