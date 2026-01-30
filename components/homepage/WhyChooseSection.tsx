import type { CSSProperties } from "react"
import { ChefHat, PackageOpen, ScrollText } from "lucide-react"

export default function WhyChooseSection() {
    return (
        <section
            className="relative overflow-hidden py-24"
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
            <div
                className="pointer-events-none absolute inset-0 opacity-90"
                style={{
                    backgroundImage:
                        "radial-gradient(1100px circle at 5% -10%, rgba(255, 255, 255, 0.9) 0%, transparent 60%), radial-gradient(900px circle at 95% 0%, rgba(101, 26, 26, 0.18) 0%, transparent 58%), linear-gradient(180deg, #fff6ef 0%, var(--cream) 45%, #f2d8c4 100%)",
                }}
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                    backgroundImage:
                        "linear-gradient(120deg, rgba(101, 26, 26, 0.08) 0%, transparent 50%), linear-gradient(0deg, rgba(101, 26, 26, 0.08) 1px, transparent 1px)",
                    backgroundSize: "100% 100%, 36px 36px",
                }}
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute -top-20 right-[-10%] h-72 w-72 rounded-full bg-[#EEC8B7]/70 blur-3xl"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute bottom-[-15%] left-[-8%] h-72 w-72 rounded-full bg-[#F1D7C6]/80 blur-3xl"
                aria-hidden="true"
            />

            <div className="container relative mx-auto px-4">
                <div className="mx-auto max-w-3xl text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#651A1A]/15 bg-white/70 px-5 py-2 text-xs font-bold uppercase tracking-[0.35em] text-[color:var(--ruby)] shadow-sm">
                        Unsere Werte
                    </span>
                    <h2 className="mt-6 text-4xl font-black text-[color:var(--ruby)] md:text-6xl lg:text-7xl font-serif leading-[0.92] tracking-tight">
                        Warum Emilia wählen?
                    </h2>
                    <p className="mt-4 text-lg font-light text-[color:var(--ink)]/70 md:text-xl">
                        Drei Versprechen, die jede Emilia-Torte begleiten.
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
                    {/* HANDWERKLICHE HERSTELLUNG */}
                    <div className="group relative overflow-hidden rounded-[2.5rem] border border-[#651A1A]/10 bg-white/60 p-10 text-center shadow-[0_20px_50px_-30px_rgba(101,26,26,0.3)] backdrop-blur transition-all duration-500 hover:bg-white/80 hover:shadow-[0_30px_60px_-20px_rgba(101,26,26,0.4)] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#651A1A]/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                        <div className="mb-6 flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#651A1A]/5 blur-2xl rounded-full transform group-hover:scale-150 transition-transform duration-700" />
                                <ChefHat className="relative h-16 w-16 text-[#651A1A] transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110" strokeWidth={0.8} />
                            </div>
                        </div>

                        <h3 className="text-2xl font-black uppercase tracking-tight text-[color:var(--ruby)] mb-4">
                            Handgemacht
                        </h3>
                        <p className="text-base leading-relaxed text-[color:var(--ink)]/70">
                            Jede Torte entsteht komplett von Hand – vom ersten Teig bis zur letzten Glasur.
                        </p>
                    </div>

                    {/* KLEINSERIENPRODUKTION */}
                    <div className="group relative overflow-hidden rounded-[2.5rem] border border-[#651A1A]/10 bg-white/60 p-10 text-center shadow-[0_20px_50px_-30px_rgba(101,26,26,0.3)] backdrop-blur transition-all duration-500 hover:bg-white/80 hover:shadow-[0_30px_60px_-20px_rgba(101,26,26,0.4)] md:-mt-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#651A1A]/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                        <div className="mb-6 flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#651A1A]/5 blur-2xl rounded-full transform group-hover:scale-150 transition-transform duration-700" />
                                <PackageOpen className="relative h-16 w-16 text-[#651A1A] transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110" strokeWidth={0.8} />
                            </div>
                        </div>

                        <h3 className="text-2xl font-black uppercase tracking-tight text-[color:var(--ruby)] mb-4">
                            Kleine Mengen
                        </h3>
                        <p className="text-base leading-relaxed text-[color:var(--ink)]/70">
                            Wir backen täglich in kleinen Chargen, damit jede Bestellung frisch ankommt.
                        </p>
                    </div>

                    {/* TRADITIONELLE REZEPTE */}
                    <div className="group relative overflow-hidden rounded-[2.5rem] border border-[#651A1A]/10 bg-white/60 p-10 text-center shadow-[0_20px_50px_-30px_rgba(101,26,26,0.3)] backdrop-blur transition-all duration-500 hover:bg-white/80 hover:shadow-[0_30px_60px_-20px_rgba(101,26,26,0.4)] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500">
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#651A1A]/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                        <div className="mb-6 flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#651A1A]/5 blur-2xl rounded-full transform group-hover:scale-150 transition-transform duration-700" />
                                <ScrollText className="relative h-16 w-16 text-[#651A1A] transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110" strokeWidth={0.8} />
                            </div>
                        </div>

                        <h3 className="text-2xl font-black uppercase tracking-tight text-[color:var(--ruby)] mb-4">
                            Traditionelle Rezepte
                        </h3>
                        <p className="text-base leading-relaxed text-[color:var(--ink)]/70">
                            Spanische Originalrezepte, über Jahre verfeinert und auf Emilia abgestimmt.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
