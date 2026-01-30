import type { CSSProperties } from "react"
import { ChefHat, Gem, ScrollText } from "lucide-react"

export default function WhyChooseSection() {
    return (
        <section
            className="relative overflow-hidden py-32"
            style={
                {
                    "--cream": "#F8EBDD",
                    "--ruby": "#651A1A",
                    "--rose": "#EEC8B7",
                    "--ink": "#3B0B0B",
                } as CSSProperties
            }
        >
            <div className="pointer-events-none absolute inset-0 bg-[color:var(--cream)]" aria-hidden="true" />

            {/* Elegant Background Pattern */}
            <div
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{
                    backgroundImage: `radial-gradient(#651A1A 0.5px, transparent 0.5px), radial-gradient(#651A1A 0.5px, #F8EBDD 0.5px)`,
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0, 12px 12px'
                }}
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#F8EBDD] via-transparent to-[#F8EBDD]" />

            <div className="container relative mx-auto px-4">
                <div className="mx-auto max-w-3xl text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#651A1A]/20 bg-white/70 px-6 py-2 text-xs font-bold uppercase tracking-[0.3em] text-[#651A1A] shadow-sm backdrop-blur-sm">
                        Unsere Werte
                    </span>
                    <h2 className="mt-8 text-5xl font-black text-[#651A1A] md:text-7xl font-serif leading-[0.9] tracking-tight">
                        Warum Emilia?
                    </h2>
                    <p className="mt-6 text-lg font-light text-[#3B0B0B]/80 md:text-xl max-w-xl mx-auto leading-relaxed">
                        Drei Versprechen, die jede Emilia-Torte zu einem besonderen Erlebnis machen.
                    </p>
                </div>

                <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
                    {/* HANDWERKLICHE HERSTELLUNG */}
                    <div className="group relative overflow-hidden rounded-[2rem] bg-white/40 p-10 text-center transition-all duration-500 hover:bg-white/80 hover:shadow-xl hover:-translate-y-1 border border-[#651A1A]/5">
                        <div className="mb-8 flex justify-center">
                            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#651A1A]/5 text-[#651A1A] transition-all duration-500 group-hover:bg-[#651A1A] group-hover:text-[#F8EBDD]">
                                <ChefHat className="h-10 w-10 transition-transform duration-500 group-hover:scale-110" strokeWidth={1} />
                            </div>
                        </div>

                        <h3 className="text-xl font-black uppercase tracking-widest text-[#651A1A] mb-4">
                            Handgemacht
                        </h3>
                        <p className="text-base leading-relaxed text-[#3B0B0B]/70 font-light">
                            Jede Torte entsteht komplett von Hand – vom ersten Teig bis zur letzten Glasur.
                        </p>
                    </div>

                    {/* KLEINSERIENPRODUKTION */}
                    <div className="group relative overflow-hidden rounded-[2rem] bg-white/40 p-10 text-center transition-all duration-500 hover:bg-white/80 hover:shadow-xl hover:-translate-y-1 border border-[#651A1A]/5 md:-mt-8">
                        <div className="mb-8 flex justify-center">
                            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#651A1A]/5 text-[#651A1A] transition-all duration-500 group-hover:bg-[#651A1A] group-hover:text-[#F8EBDD]">
                                <Gem className="h-10 w-10 transition-transform duration-500 group-hover:scale-110" strokeWidth={1} />
                            </div>
                        </div>

                        <h3 className="text-xl font-black uppercase tracking-widest text-[#651A1A] mb-4">
                            Kleine Mengen
                        </h3>
                        <p className="text-base leading-relaxed text-[#3B0B0B]/70 font-light">
                            Wir backen täglich in kleinen, limitierten Chargen für maximale Frische.
                        </p>
                    </div>

                    {/* TRADITIONELLE REZEPTE */}
                    <div className="group relative overflow-hidden rounded-[2rem] bg-white/40 p-10 text-center transition-all duration-500 hover:bg-white/80 hover:shadow-xl hover:-translate-y-1 border border-[#651A1A]/5">
                        <div className="mb-8 flex justify-center">
                            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#651A1A]/5 text-[#651A1A] transition-all duration-500 group-hover:bg-[#651A1A] group-hover:text-[#F8EBDD]">
                                <ScrollText className="h-10 w-10 transition-transform duration-500 group-hover:scale-110" strokeWidth={1} />
                            </div>
                        </div>

                        <h3 className="text-xl font-black uppercase tracking-widest text-[#651A1A] mb-4">
                            Traditionelle Rezepte
                        </h3>
                        <p className="text-base leading-relaxed text-[#3B0B0B]/70 font-light">
                            Spanische Originalrezepte, über Jahre verfeinert und auf Emilia abgestimmt.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
