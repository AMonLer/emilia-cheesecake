"use client"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function ImpressumPage() {
    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-100">
            <Navbar />

            <main className="pt-32 pb-20">
                <div className="container mx-auto px-4 max-w-2xl">
                    <h1 className="text-xl font-bold mb-8 tracking-tight text-gray-900">Impressum</h1>

                    <div className="space-y-6 text-sm text-gray-500 leading-relaxed">
                        <section>
                            <h2 className="font-semibold text-gray-900 mb-1">Kontaktadresse</h2>
                            <p>
                                Emilia Ribeiro<br />
                                Vorstadtstrasse 14<br />
                                8953 Dietikon<br />
                                Schweiz
                            </p>
                        </section>

                        <section>
                            <h2 className="font-semibold text-gray-900 mb-1">E-Mail</h2>
                            <p>
                                <a href="mailto:info@emilialab.com" className="hover:text-gray-900 transition-colors">info@emilialab.com</a>
                            </p>
                        </section>

                        <section>
                            <h2 className="font-semibold text-gray-900 mb-1">Vertretungsberechtigte Person</h2>
                            <p>
                                Emilia Ribeiro
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
