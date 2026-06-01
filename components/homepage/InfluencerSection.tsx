'use client'

import { Instagram } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export default function InfluencerSection() {
    const { t } = useLanguage()
    const inf = t.influencer

    const influencers = [
        {
            video: "/zurich_roamer.mp4",
            handle: "@zurich_roamer",
            url: "https://www.instagram.com/zurich_roamer",
            align: "mt-0 md:-mt-12",
        },
        {
            video: "/laviedechloee.mp4",
            handle: "@laviedechloee",
            url: "https://www.instagram.com/laviedechloee",
            align: "mt-0 md:mt-24",
        },
    ]

    return (
        <section className="py-20 md:py-32 px-4 bg-[#F5E6D3] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#EEC8B7] rounded-full mix-blend-multiply filter blur-[80px] md:blur-[120px] opacity-70 animate-pulse pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-[#E3D3C1] rounded-full mix-blend-multiply filter blur-[100px] md:blur-[150px] opacity-60 pointer-events-none" />

            <div className="container mx-auto max-w-6xl relative z-10">
                <div className="text-center mb-16 md:mb-32">
                    <span className="text-sm tracking-[0.3em] text-[#651A1A]/80 font-bold uppercase mb-4 md:mb-6 block">
                        {inf.eyebrow} <span className="font-serif italic capitalize text-base">{inf.eyebrowItalic}</span>
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-[#651A1A] tracking-tighter leading-[0.95]">
                        SEEN ON <br className="md:hidden" />
                        <span className="font-serif font-medium italic text-5xl md:text-6xl lg:text-8xl text-[#651A1A]/90 ml-2 md:ml-3 py-1">Instagram</span>
                    </h2>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-12 md:gap-24 relative">
                    {influencers.map((item) => (
                        <div key={item.handle} className={`group flex flex-col items-center relative transition-transform duration-700 hover:-translate-y-4 ${item.align}`}>
                            <div className="absolute inset-0 bg-[#651A1A]/10 rounded-3xl filter blur-2xl transform scale-105 group-hover:bg-[#651A1A]/20 transition-all duration-500 ease-out" />

                            <div className="relative w-[85vw] max-w-[320px] md:max-w-none md:w-[340px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl z-10 border border-white/40 bg-white/20">
                                <video
                                    src={item.video}
                                    className="w-full h-full object-cover"
                                    controls
                                    playsInline
                                    preload="metadata"
                                />
                            </div>

                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative md:absolute mt-6 md:mt-0 md:-bottom-8 z-20 flex items-center gap-3 px-6 py-3.5 md:py-4 bg-white/90 backdrop-blur-md border border-white max-w-[90%] shadow-xl shadow-[#651A1A]/10 rounded-full text-[#651A1A] hover:bg-white transition-all duration-300 transform group-hover:scale-105"
                            >
                                <div className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full p-px">
                                   <div className="bg-white rounded-full p-1 w-full h-full">
                                      <Instagram className="w-4 h-4" strokeWidth={2.5} />
                                   </div>
                                </div>
                                <span className="text-[14px] md:text-[15px] font-bold tracking-wide">
                                    {item.handle}
                                </span>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
