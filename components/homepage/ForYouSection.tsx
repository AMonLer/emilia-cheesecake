'use client'

import { useEffect, useRef, useState } from 'react'
import Link from "next/link"
import Image from "next/image"
import { Pause, Play } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import Reveal from "@/components/ui/Reveal"

export default function ForYouSection() {
    const { t } = useLanguage()
    const f = t.forYou
    const [active, setActive] = useState(0)
    const [playing, setPlaying] = useState(false)
    const [inView, setInView] = useState(false)
    const [pageVisible, setPageVisible] = useState(true)
    const previewRef = useRef<HTMLDivElement>(null)
    const previews = [
        {
            label: f.birthdayLabel,
            message: f.previewMessage,
            src: '/pexels-elly-fairytale-3893712.jpg',
            alt: f.previewImageAlt,
            imagePosition: 'object-center scale-[1.2] origin-right',
        },
        {
            label: f.thankYouLabel,
            message: f.previewMessage2,
            src: '/Photo Girls.png',
            alt: f.thankYouImageAlt,
            imagePosition: 'object-center',
        },
    ]

    useEffect(() => {
        const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
        setPlaying(!motionPreference.matches)
        const onMotionChange = () => {
            if (motionPreference.matches) setPlaying(false)
        }
        motionPreference.addEventListener('change', onMotionChange)
        return () => motionPreference.removeEventListener('change', onMotionChange)
    }, [])

    useEffect(() => {
        const preview = previewRef.current
        if (!preview) return
        const observer = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { threshold: 0.3 },
        )
        observer.observe(preview)
        const onVisibilityChange = () => setPageVisible(!document.hidden)
        onVisibilityChange()
        document.addEventListener('visibilitychange', onVisibilityChange)
        return () => {
            observer.disconnect()
            document.removeEventListener('visibilitychange', onVisibilityChange)
        }
    }, [])

    useEffect(() => {
        if (!playing || !inView || !pageVisible) return
        const timer = window.setTimeout(() => {
            setActive((current) => (current + 1) % previews.length)
        }, 6000)
        return () => window.clearTimeout(timer)
    }, [active, playing, inView, pageVisible, previews.length])

    const steps = [
        { n: '01', title: f.step1Title, desc: f.step1Desc },
        { n: '02', title: f.step2Title, desc: f.step2Desc },
        { n: '03', title: f.step3Title, desc: f.step3Desc },
    ]

    return (
        <section id="foryou" aria-labelledby="foryou-heading" className="scroll-mt-24 py-16 md:py-24 bg-[#651A1A] overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Foto y mensaje cambian juntos; la reproducción se puede pausar. */}
                    <Reveal className="order-2">
                        <div ref={previewRef} className="relative mx-auto w-full max-w-[320px]">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#F5E6D3]/15 rounded-full blur-[80px] pointer-events-none" />
                            <div className="relative rounded-[2.5rem] border border-white/15 bg-[#4A1313] p-2.5 shadow-2xl shadow-black/40">
                                <div id="foryou-preview" aria-live={playing ? 'off' : 'polite'} aria-atomic="true" className="grid rounded-[2rem] overflow-hidden bg-[#651A1A]">
                                    {previews.map((preview, i) => (
                                        <div
                                            key={preview.src}
                                            aria-hidden={i !== active}
                                            className={`col-start-1 row-start-1 min-w-0 flex flex-col transition-opacity duration-300 motion-reduce:transition-none ${i === active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                        >
                                            <div className="h-72 shrink-0 overflow-hidden">
                                                <Image
                                                    src={preview.src}
                                                    alt={preview.alt}
                                                    width={640}
                                                    height={960}
                                                    sizes="360px"
                                                    loading="eager"
                                                    className={`w-full h-full object-cover ${preview.imagePosition}`}
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col px-6 py-8 text-center">
                                                <p className="text-[#F5E6D3]/75 text-[0.625rem] tracking-[0.25em] uppercase font-bold mb-4">
                                                    {f.previewLabel}
                                                </p>
                                                <p className="my-auto font-serif italic text-xl text-white/90 font-light leading-relaxed">
                                                    {preview.message}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div role="group" aria-label={f.examplesLabel} className="relative mt-6 flex justify-center gap-2">
                                {previews.map((preview, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        aria-pressed={i === active}
                                        aria-controls="foryou-preview"
                                        onClick={() => setActive(i)}
                                        className={`min-h-11 cursor-pointer rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5E6D3] ${i === active ? 'border-[#F5E6D3] bg-[#F5E6D3] text-[#651A1A]' : 'border-white/30 text-white/80 hover:border-white/60 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        {preview.label}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setPlaying((current) => !current)}
                                    aria-label={playing ? f.pauseExamples : f.playExamples}
                                    aria-controls="foryou-preview"
                                    className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/30 text-white/80 transition-colors duration-200 hover:border-white/60 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5E6D3]"
                                >
                                    {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
                                </button>
                            </div>
                        </div>
                    </Reveal>

                    <Reveal delay={150} className="text-center lg:text-left order-1">
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-3 mb-6">
                            <p className="text-xs tracking-[0.2em] uppercase font-bold text-[#F5E6D3]/80">
                                {f.eyebrow}
                            </p>
                            <span className="rounded-full border border-[#F5E6D3]/30 bg-[#F5E6D3]/10 px-3 py-1.5 text-[0.625rem] tracking-[0.1em] uppercase font-bold text-[#F5E6D3]">
                                {f.included}
                            </span>
                        </div>
                        <h2 id="foryou-heading" className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tight leading-[1.08] text-white mb-6">
                            <span className="block">{f.title1}</span>
                            <span className="block mt-2 font-serif italic font-medium text-[#F5E6D3] tracking-normal">{f.titleSerif}</span>
                        </h2>
                        <p className="text-base md:text-lg leading-relaxed text-white/75 max-w-lg mx-auto lg:mx-0">
                            {f.desc}
                        </p>

                        <ol className="mt-8 space-y-5 text-left max-w-md mx-auto lg:mx-0">
                            {steps.map((step) => (
                                <li key={step.n} className="flex gap-5">
                                    <span className="font-serif italic text-3xl leading-none text-[#F5E6D3]/65 shrink-0 w-10">
                                        {step.n}
                                    </span>
                                    <div>
                                        <p className="font-bold text-white">{step.title}</p>
                                        <p className="text-sm text-white/70 leading-relaxed mt-1">{step.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>

                        <div className="mt-8 flex flex-col items-center lg:items-start gap-3">
                            <Link
                                href="/bestellen?foryou=1"
                                aria-describedby="foryou-cta-note"
                                className="inline-block bg-white text-[#651A1A] px-8 py-4 rounded-full font-black text-sm tracking-widest uppercase hover:bg-[#F5E6D3] transition-colors duration-200 shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5E6D3]"
                            >
                                {f.cta}
                            </Link>
                            <p id="foryou-cta-note" className="max-w-sm text-sm leading-relaxed text-white/70">
                                {f.ctaNote}
                            </p>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    )
}
