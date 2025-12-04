"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function PromoPopup() {
    const [showPromo, setShowPromo] = useState(false)
    const [email, setEmail] = useState("")

    useEffect(() => {
        // Verificar si el usuario ya vio el popup
        const hasSeenPromo = localStorage.getItem("hasSeenBlackFridayPromo")
        if (!hasSeenPromo) {
            setShowPromo(true)
        }
    }, [])

    const handleClosePromo = () => {
        setShowPromo(false)
        localStorage.setItem("hasSeenBlackFridayPromo", "true")
    }

    if (!showPromo) return null

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="bg-[#FAF9F6] rounded-[2rem] max-w-md w-full p-10 relative shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white/50">
                <button
                    onClick={handleClosePromo}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 z-10 cursor-pointer transition-colors duration-300"
                    aria-label="Schließen"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-8 mt-2 relative z-10">
                    <span className="text-xs font-medium tracking-[0.3em] text-gray-500 uppercase mb-4 block">
                        Willkommen bei Emilia
                    </span>

                    <h2 className="text-4xl md:text-5xl font-serif text-[#1a1a1a] mb-6 leading-tight">
                        Ein süßer <br />
                        <span className="italic text-[#651A1A]">Anfang</span>
                    </h2>

                    <div className="py-6 border-y border-[#651A1A]/10 my-6">
                        <p className="text-lg text-[#1a1a1a] font-light tracking-wide">
                            Erhalte <span className="font-medium text-[#651A1A]">15% Rabatt</span> auf deine erste Bestellung
                        </p>
                        <p className="text-xs text-gray-400 mt-2 font-light tracking-wider uppercase">
                            Ab 120 CHF Bestellwert
                        </p>
                    </div>

                    <p className="text-sm text-gray-500 font-light leading-relaxed max-w-xs mx-auto">
                        Melde dich für unseren Newsletter an und entdecke die Kunst des baskischen Käsekuchens.
                    </p>
                </div>

                <div className="space-y-4 relative z-10">
                    <div className="space-y-3">
                        <Input
                            type="email"
                            placeholder="Deine E-Mail-Adresse"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 h-12 rounded-lg focus:border-[#651A1A] focus:ring-[#651A1A]/10 transition-all font-light"
                        />
                        <Button
                            onClick={handleClosePromo}
                            className="w-full bg-[#1a1a1a] text-white hover:bg-[#651A1A] font-medium py-6 text-sm rounded-lg tracking-widest uppercase transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            Anmelden & Genießen
                        </Button>
                    </div>
                    <p className="text-[10px] text-center text-gray-400 font-light">
                        Abmeldung jederzeit möglich.
                    </p>
                </div>
            </div>
        </div>
    )
}
