"use client"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { ChevronDown } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const content = {
    de: {
        title: "HÄUFIGE FRAGEN",
        subtitle: "Alles, was du über unsere Cheesecakes wissen möchtest.",
        contactNote: "Deine Frage ist nicht dabei?",
        contactLink: "Schreib uns an",
        items: [
            {
                q: "Wo liefert ihr?",
                a: "Wir liefern im Umkreis von 10 km um das Zentrum von Zürich. Im Checkout siehst du bei der Eingabe deiner Postleitzahl sofort, ob deine Adresse in unserem Liefergebiet liegt.",
            },
            {
                q: "Wie lange im Voraus muss ich bestellen?",
                a: "Mindestens 36 Stunden. Jeder Cheesecake wird frisch für dich gebacken — deshalb brauchen wir etwas Vorlaufzeit. Dein Wunschdatum wählst du im Checkout.",
            },
            {
                q: "Wie lange ist der Cheesecake haltbar?",
                a: "Im Kühlschrank aufbewahrt schmeckt er innerhalb von 3–4 Tagen am besten. Tipp: Nimm ihn ca. 30 Minuten vor dem Geniessen aus dem Kühlschrank — so entfaltet er seine cremige Textur am schönsten.",
            },
            {
                q: "Welche Zahlungsmethoden akzeptiert ihr?",
                a: "Du kannst bequem mit TWINT, Kreditkarte (Visa, Mastercard) oder Apple Pay bezahlen. Die Zahlung wird sicher über Stripe abgewickelt.",
            },
            {
                q: "Enthalten eure Cheesecakes Allergene?",
                a: "Unsere Käsekuchen enthalten Milch, Eier und je nach Sorte Gluten und Nüsse (z.B. Pistazien). Die genauen Zutaten und Allergene findest du auf jeder Produktseite. Bei Fragen kontaktiere uns gerne.",
            },
            {
                q: "Gibt es Rabatte für grössere Bestellungen?",
                a: "Ja! Ab einem Bestellwert von 100 CHF bekommst du automatisch 10% Rabatt und gratis Lieferung — perfekt für Geburtstage, Firmenanlässe oder Feiern. Für besonders grosse Bestellungen schreib uns direkt.",
            },
        ],
    },
    en: {
        title: "FREQUENTLY ASKED QUESTIONS",
        subtitle: "Everything you'd like to know about our cheesecakes.",
        contactNote: "Can't find your question?",
        contactLink: "Write to us at",
        items: [
            {
                q: "Where do you deliver?",
                a: "We deliver within 10 km of Zurich city centre. When you enter your postal code in the checkout, you'll see immediately whether your address is within our delivery area.",
            },
            {
                q: "How far in advance do I need to order?",
                a: "At least 36 hours. Every cheesecake is freshly baked for you — that's why we need a little lead time. You choose your preferred date in the checkout.",
            },
            {
                q: "How long does the cheesecake keep?",
                a: "Stored in the fridge, it tastes best within 3–4 days. Tip: take it out of the fridge about 30 minutes before serving — that's when its creamy texture is at its finest.",
            },
            {
                q: "Which payment methods do you accept?",
                a: "You can pay conveniently with TWINT, credit card (Visa, Mastercard) or Apple Pay. Payments are processed securely via Stripe.",
            },
            {
                q: "Do your cheesecakes contain allergens?",
                a: "Our cheesecakes contain milk, eggs and, depending on the variety, gluten and nuts (e.g. pistachios). You'll find the exact ingredients and allergens on each product page. If in doubt, feel free to contact us.",
            },
            {
                q: "Are there discounts for larger orders?",
                a: "Yes! For orders of CHF 100 or more you automatically get a 10% discount and free delivery — perfect for birthdays, company events or celebrations. For especially large orders, write to us directly.",
            },
        ],
    },
}

export default function FaqPage() {
    const { locale } = useLanguage()
    const c = content[locale]

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <header className="bg-gradient-to-b from-[#F5E6D3] to-[#FBF3E8] py-16 text-center px-4">
                <h1 className="text-4xl md:text-5xl font-black text-[#651A1A] tracking-tight mb-4">
                    {c.title}
                </h1>
                <p className="text-[#651A1A]/80 max-w-md mx-auto">{c.subtitle}</p>
            </header>

            <main className="py-16">
                <div className="container mx-auto px-4 max-w-2xl">
                    <div className="space-y-3">
                        {c.items.map((item) => (
                            <details
                                key={item.q}
                                className="group bg-[#FBF3E8] rounded-2xl overflow-hidden"
                            >
                                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-6 py-5 font-bold text-[#651A1A] [&::-webkit-details-marker]:hidden">
                                    {item.q}
                                    <ChevronDown className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-open:rotate-180" strokeWidth={2} />
                                </summary>
                                <p className="px-6 pb-6 text-sm leading-relaxed text-gray-700">
                                    {item.a}
                                </p>
                            </details>
                        ))}
                    </div>

                    <p className="text-center text-sm text-gray-500 mt-12">
                        {c.contactNote}{" "}
                        {c.contactLink}{" "}
                        <a href="mailto:info@emilialab.com" className="text-[#651A1A] font-bold hover:underline">
                            info@emilialab.com
                        </a>
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    )
}
