'use client'

import { useEffect, useState } from 'react'
import Link from "next/link"
import Image from "next/image"
import { Download, Pause, Play } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import Reveal from "@/components/ui/Reveal"

// Los mensajes de ejemplo rotan en el mockup: enseñan que la sorpresa vale
// para cualquier ocasión (un cumpleaños, un viaje, hasta una candidatura).
// El texto de cada uno viene de las traducciones (previewMessage, 2, 3...).
// `video` añade un overlay de reproductor sobre la imagen; `pdfUrl`/`pdfName`
// muestran el enlace de descarga del adjunto, como en la experiencia real.
const FORYOU_PREVIEWS: Array<{
    src: string
    alt: string
    video?: boolean
    pdfUrl?: string
    pdfName?: string
}> = [
    {
        src: '/brooke-balentine-95JG20bDS60-unsplash.jpg',
        alt: 'Mutter mit ihren zwei Töchtern',
        video: true,
    },
    {
        src: '/ChatGPT Image Aug 5, 2026, 10_39_17 PM.png',
        alt: 'Bordkarten Zürich–Malediven',
    },
    {
        src: '/ChatGPT Image Aug 5, 2026, 11_18_49 PM.png',
        alt: 'Lebenslauf von Lukas Schneider',
        pdfUrl: '/lebenslauf-lukas-schneider.pdf',
        pdfName: 'Lebenslauf.pdf',
    },
]

export default function ForYouSection() {
    const { t, locale } = useLanguage()
    const f = t.forYou

    const previews = FORYOU_PREVIEWS.map((img, i) => ({
        ...img,
        message: [f.previewMessage, f.previewMessage2, f.previewMessage3][i],
    }))
    const [active, setActive] = useState(0)
    const [playing, setPlaying] = useState(true)

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setPlaying(false); return }
        if (!playing) return
        const id = setInterval(
            () => setActive((a) => (a + 1) % FORYOU_PREVIEWS.length),
            4500,
        )
        return () => clearInterval(id)
    }, [playing])

    const steps = [
        { n: '01', title: f.step1Title, desc: f.step1Desc },
        { n: '02', title: f.step2Title, desc: f.step2Desc },
        { n: '03', title: f.step3Title, desc: f.step3Desc },
    ]

    return (
        <section id="foryou" className="py-16 md:py-24 bg-[#651A1A] overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Preview de lo que ve el destinatario: rota entre ejemplos */}
                    <Reveal className="order-1 lg:order-2">
                        <div className="relative mx-auto w-full max-w-[320px]">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#F5E6D3]/15 rounded-full blur-[80px] pointer-events-none" />
                            <div className="relative rounded-[2.5rem] border border-white/15 bg-[#4A1313] p-2.5 shadow-2xl shadow-black/40">
                                <div className="relative grid rounded-[2rem] overflow-hidden bg-[#651A1A]">
                                    {previews.map((p, i) => (
                                        <div
                                            key={p.src}
                                            aria-hidden={i !== active}
                                            className={`col-start-1 row-start-1 min-w-0 flex flex-col transition-opacity duration-300 motion-reduce:transition-none ${i === active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                        >
                                            <div className="relative">
                                                <Image
                                                    src={p.src}
                                                    alt={p.alt}
                                                    width={640}
                                                    height={960}
                                                    className="w-full h-72 object-cover object-top"
                                                />
                                                {p.video && (
                                                    <>
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm">
                                                                <Play className="h-5 w-5 translate-x-[1px] fill-[#651A1A] text-[#651A1A]" />
                                                            </div>
                                                        </div>
                                                        <span className="absolute bottom-3 right-3 rounded-md bg-black/55 px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-white">
                                                            0:11
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col items-center justify-center px-6 pt-8 pb-12 text-center">
                                                <p className="text-white/35 text-[0.55rem] tracking-[0.4em] uppercase font-bold mb-4">
                                                    {f.previewLabel}
                                                </p>
                                                <p className="font-serif italic text-xl text-white/90 font-light leading-relaxed">
                                                    {p.message}
                                                </p>
                                                {p.pdfUrl && (
                                                    <a
                                                        href={p.pdfUrl}
                                                        download={p.pdfName}
                                                        tabIndex={i === active ? 0 : -1}
                                                        className="mt-6 inline-flex items-center gap-2 border-b border-white/30 pb-1 text-[0.65rem] uppercase tracking-[0.25em] text-white/70 hover:text-white hover:border-white/60 transition-colors"
                                                    >
                                                        <Download className="h-4 w-4" strokeWidth={1.5} />
                                                        {p.pdfName}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {/* Puntos del carrusel */}
                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center">
                                        {previews.map((_, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                aria-label={`${locale === 'de' ? 'Beispiel' : 'Example'} ${i + 1}`}
                                                aria-pressed={i === active}
                                                onClick={() => { setActive(i); setPlaying(false) }}
                                                className="flex h-10 w-10 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                                            >
                                                <span className={`h-1.5 w-1.5 rounded-full ${i === active ? 'bg-white/80' : 'bg-white/25'}`} />
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setPlaying(!playing)}
                                            aria-label={playing ? (locale === 'de' ? 'Pause' : 'Pause examples') : (locale === 'de' ? 'Beispiele abspielen' : 'Play examples')}
                                            className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                                        >
                                            {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Reveal>

                    {/* Texto + pasos + CTA */}
                    <Reveal delay={150} className="text-center lg:text-left order-2 lg:order-1">
                        <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                            <p className="text-xs tracking-[0.3em] uppercase font-bold text-[#F5E6D3]/70">
                                {f.eyebrow}
                            </p>
                            <span className="rounded-full border border-[#F5E6D3]/30 bg-[#F5E6D3]/10 px-3 py-1 text-[0.6rem] tracking-[0.25em] uppercase font-bold text-[#F5E6D3]">
                                {f.free}
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.95] text-white mb-6">
                            {f.title1}{' '}
                            <span className="font-serif italic font-medium text-[#F5E6D3] tracking-normal">{f.titleSerif}</span>
                            <br />
                            {f.title2}
                        </h2>
                        <p className="text-base md:text-lg leading-relaxed text-white/70 max-w-lg mx-auto lg:mx-0">
                            {f.desc}
                        </p>

                        <ol className="mt-10 space-y-6 text-left max-w-md mx-auto lg:mx-0">
                            {steps.map((step) => (
                                <li key={step.n} className="flex gap-5">
                                    <span className="font-serif italic text-3xl leading-none text-[#F5E6D3]/50 shrink-0 w-10">
                                        {step.n}
                                    </span>
                                    <div>
                                        <p className="font-bold text-white">{step.title}</p>
                                        <p className="text-sm text-white/60 leading-relaxed mt-1">{step.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>

                        <div className="mt-10 flex flex-col items-center lg:items-start gap-3">
                            <Link
                                href="/bestellen?foryou=1"
                                className="inline-block bg-white text-[#651A1A] px-10 py-4 rounded-full font-black text-sm tracking-widest uppercase hover:bg-[#F5E6D3] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                {f.cta}
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    )
}
