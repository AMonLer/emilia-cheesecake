"use client"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function DatenschutzPage() {
    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-100">
            <Navbar />

            <main className="pt-32 pb-20">
                <div className="container mx-auto px-4 max-w-2xl">
                    <h1 className="text-xl font-bold mb-2 tracking-tight text-gray-900">Datenschutzerklärung</h1>
                    <p className="text-xs text-gray-400 mb-8">Stand: Juni 2026</p>

                    <div className="space-y-6 text-sm text-gray-500 leading-relaxed">
                        <section>
                            <h2 className="font-semibold text-gray-900 mb-1">1. Verantwortliche Stelle</h2>
                            <p>
                                Emilia Ribeiro<br />
                                Vorstadtstrasse 14<br />
                                8953 Dietikon, Schweiz<br />
                                E-Mail: <a href="mailto:info@emilialab.com" className="hover:text-gray-900 transition-colors">info@emilialab.com</a>
                            </p>
                        </section>

                        <section>
                            <h2 className="font-semibold text-gray-900 mb-1">2. Erhebung und Verwendung von Daten</h2>
                            <p>
                                Bei einer Bestellung erheben wir die Daten, die zur Abwicklung notwendig sind:
                                Name, Lieferadresse, E-Mail-Adresse und Telefonnummer sowie die Angaben zu Ihrer Bestellung.
                                Diese Daten verwenden wir ausschliesslich zur Ausführung und Zustellung Ihrer Bestellung,
                                zur Kommunikation rund um die Bestellung sowie — sofern Sie eingewilligt haben — für den
                                Versand von Neuigkeiten und Angeboten per E-Mail.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-semibold text-gray-900 mb-1">3. Zahlungsabwicklung</h2>
                            <p>
                                Die Bezahlung erfolgt über den Zahlungsdienstleister Stripe (Stripe Payments Europe, Ltd.).
                                Ihre Zahlungsdaten (z.B. Kartennummer, TWINT) werden direkt von Stripe verarbeitet und
                                gelangen nicht in unseren Besitz. Es gelten die Datenschutzbestimmungen von Stripe.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-semibold text-gray-900 mb-1">4. Webanalyse und Marketing</h2>
                            <p>
                                Auf dieser Website setzen wir folgende Dienste ein, um die Nutzung unserer Website zu
                                analysieren und unsere Werbung zu verbessern: Google Analytics und Google Ads (Google
                                Ireland Ltd.), Meta Pixel (Meta Platforms Ireland Ltd.) und Microsoft Clarity (Microsoft
                                Ireland Operations Ltd.). Diese Dienste verwenden Cookies und ähnliche Technologien und
                                können Informationen über Ihre Nutzung der Website in die USA übertragen. Sie können das
                                Speichern von Cookies in den Einstellungen Ihres Browsers jederzeit einschränken oder
                                deaktivieren.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-semibold text-gray-900 mb-1">5. Hosting</h2>
                            <p>
                                Diese Website wird bei Vercel Inc. gehostet. Beim Aufruf der Website werden technisch
                                notwendige Daten (z.B. IP-Adresse, Datum und Uhrzeit des Zugriffs) in Server-Logfiles
                                verarbeitet, um den sicheren Betrieb der Website zu gewährleisten.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-semibold text-gray-900 mb-1">6. Weitergabe von Daten</h2>
                            <p>
                                Wir geben Ihre Daten nur weiter, soweit dies zur Abwicklung Ihrer Bestellung erforderlich
                                ist (z.B. an den Lieferdienst) oder wir gesetzlich dazu verpflichtet sind. Ein Verkauf
                                Ihrer Daten an Dritte findet nicht statt.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-semibold text-gray-900 mb-1">7. Ihre Rechte</h2>
                            <p>
                                Sie haben jederzeit das Recht auf Auskunft über Ihre bei uns gespeicherten Daten sowie auf
                                deren Berichtigung oder Löschung, soweit keine gesetzlichen Aufbewahrungspflichten
                                entgegenstehen. Wenden Sie sich dazu an{" "}
                                <a href="mailto:info@emilialab.com" className="hover:text-gray-900 transition-colors">info@emilialab.com</a>.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
