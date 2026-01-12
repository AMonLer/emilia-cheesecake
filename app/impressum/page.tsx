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

                    <div className="space-y-8 text-sm text-gray-500 leading-relaxed">
                        <section>
                            <h2 className="font-semibold text-gray-900 mb-2">Angaben gemäß § 5 TMG</h2>
                            <p>
                                Emilia Ribeiro Peixoto<br />
                                Vorstadtstrasse 14<br />
                                8953 Dietikon<br />
                                Schweiz
                            </p>
                        </section>

                        <section>
                            <h2 className="font-semibold text-gray-900 mb-2">Kontakt</h2>
                            <p>
                                E-Mail: <a href="mailto:info@emilialab.com" className="hover:text-gray-900 transition-colors">info@emilialab.com</a>
                            </p>
                        </section>

                        <section>
                            <h2 className="font-semibold text-gray-900 mb-2">Redaktionell verantwortlich</h2>
                            <p>
                                Emilia Ribeiro Peixoto<br />
                                Vorstadtstrasse 14<br />
                                8953 Dietikon<br />
                                Schweiz
                            </p>
                        </section>

                        <section>
                            <h2 className="font-semibold text-gray-900 mb-2">Verbraucherstreitbeilegung/Universalschlichtungsstelle</h2>
                            <p>
                                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
