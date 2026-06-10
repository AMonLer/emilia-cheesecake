"use client"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function AgbPage() {
    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-100">
            <Navbar />

            <main className="pt-32 pb-20">
                <div className="container mx-auto px-4 max-w-2xl">
                    <h1 className="text-xl font-bold mb-2 tracking-tight text-gray-900">Allgemeine Geschäftsbedingungen (AGB)</h1>
                    <p className="text-xs text-gray-400 mb-8">Stand: Juni 2026</p>

                    <div className="space-y-6 text-sm text-gray-500 leading-relaxed">
                        <section>
                            <h2 className="font-semibold text-gray-900 mb-1">1. Geltungsbereich</h2>
                            <p>
                                Diese AGB gelten für alle Bestellungen über die Website emilialab.com bei Emilia Ribeiro,
                                Vorstadtstrasse 14, 8953 Dietikon, Schweiz (nachfolgend «Emilia»).
                            </p>
                        </section>

                        <section>
                            <h2 className="font-semibold text-gray-900 mb-1">2. Angebot und Vertragsabschluss</h2>
                            <p>
                                Alle Käsekuchen werden frisch auf Bestellung gebacken. Bestellungen benötigen eine
                                Vorlaufzeit von mindestens 36 Stunden. Mit dem Abschluss des Bestellvorgangs und der
                                erfolgreichen Zahlung kommt der Vertrag zustande. Sie erhalten eine Bestellbestätigung
                                per E-Mail.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-semibold text-gray-900 mb-1">3. Preise und Zahlung</h2>
                            <p>
                                Alle Preise verstehen sich in Schweizer Franken (CHF). Die Versandkosten betragen
                                8.40 CHF; ab einem Bestellwert von 100 CHF ist die Lieferung kostenlos und es wird ein
                                Rabatt von 10% gewährt. Die Zahlung erfolgt über den Zahlungsdienstleister Stripe
                                (Kreditkarte, TWINT, Apple Pay) und ist bei der Bestellung fällig.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-semibold text-gray-900 mb-1">4. Lieferung</h2>
                            <p>
                                Die Lieferung erfolgt gekühlt im Umkreis von 10 km um das Zentrum von Zürich an die von
                                Ihnen angegebene Adresse, am gewählten Datum innerhalb des gewählten Zeitfensters. Bitte
                                stellen Sie sicher, dass die Lieferung zum vereinbarten Zeitpunkt entgegengenommen werden
                                kann. Kann die Lieferung trotz korrekter Zustellung nicht übergeben werden, gilt sie als
                                erfüllt.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-semibold text-gray-900 mb-1">5. Stornierung und Rückgabe</h2>
                            <p>
                                Da es sich um frisch hergestellte, verderbliche Lebensmittel handelt, ist eine Rückgabe
                                ausgeschlossen. Eine Stornierung ist bis 36 Stunden vor dem vereinbarten Liefertermin
                                möglich; kontaktieren Sie uns dazu unter{" "}
                                <a href="mailto:info@emilialab.com" className="hover:text-gray-900 transition-colors">info@emilialab.com</a>.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-semibold text-gray-900 mb-1">6. Beanstandungen</h2>
                            <p>
                                Wir geben uns grösste Mühe, dass jede Bestellung perfekt bei Ihnen ankommt. Sollte etwas
                                nicht in Ordnung sein, melden Sie sich bitte innerhalb von 24 Stunden nach Erhalt mit
                                Foto unter{" "}
                                <a href="mailto:info@emilialab.com" className="hover:text-gray-900 transition-colors">info@emilialab.com</a>.
                                Wir finden eine faire Lösung.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-semibold text-gray-900 mb-1">7. Allergene</h2>
                            <p>
                                Unsere Produkte enthalten u.a. Milch, Eier und je nach Sorte Gluten und Nüsse. Die
                                Angaben zu Zutaten und Allergenen finden Sie auf der jeweiligen Produktseite. Trotz
                                grösster Sorgfalt können Spuren weiterer Allergene nicht ausgeschlossen werden.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-semibold text-gray-900 mb-1">8. Haftung</h2>
                            <p>
                                Soweit gesetzlich zulässig, ist die Haftung für leichte Fahrlässigkeit ausgeschlossen.
                                Zwingende gesetzliche Haftungsbestimmungen bleiben vorbehalten.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-semibold text-gray-900 mb-1">9. Anwendbares Recht und Gerichtsstand</h2>
                            <p>
                                Es gilt schweizerisches Recht. Gerichtsstand ist Zürich, soweit gesetzlich nichts anderes
                                vorgeschrieben ist.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
