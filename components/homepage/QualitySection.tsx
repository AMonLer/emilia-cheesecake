'use client'

import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/contexts/LanguageContext"

export default function QualitySection() {
    const { t } = useLanguage()
    const q = t.quality

    return (
        <section className="py-16 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                    {/* Lado izquierdo - Texto */}
                    <div className="space-y-6 text-center lg:text-left order-2 lg:order-1 relative z-10 w-full mb-6">
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-[0.95] text-[#651A1A]">
                            {q.title1} <span className="font-serif italic font-medium capitalize text-5xl md:text-6xl lg:text-8xl text-[#651A1A]/90 tracking-normal ml-1 py-1">Cheesecake</span>,
                            <br />
                            {q.title2}
                        </h2>
                        <p className="text-base md:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 text-[#651A1A]/80">
                            {q.desc}
                        </p>
                        <div className="pt-4">
                            <Link href="/bestellen">
                                <button className="bg-[#651A1A] text-white px-10 py-4 rounded-full font-black text-sm tracking-widest uppercase hover:bg-[#4A1313] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
                                    {q.cta}
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Lado derecho - Imagen */}
                    <div className="relative h-[400px] lg:h-[600px] w-full order-1 lg:order-2 group">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-[#F5E6D3] rounded-full filter blur-[80px] opacity-60 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none -z-10" />
                        <div className="relative w-full h-full transform transition-transform duration-700 group-hover:-translate-y-2">
                            <Image
                                src="/Generated Image January 31, 2026 - 12_00AM.jpeg"
                                alt="San Sebastian Cheesecake von Emilia"
                                fill
                                className="object-cover rounded-[2rem] shadow-2xl shadow-[#651A1A]/10 border border-white/50"
                            />
                        </div>
                        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#F5E6D3] rounded-full -z-10 hidden lg:block"></div>
                        <div className="absolute -top-6 -right-6 w-32 h-32 border-4 border-[#F5E6D3] rounded-full -z-10 hidden lg:block"></div>
                    </div>
                </div>
            </div>
        </section>
    )
}
