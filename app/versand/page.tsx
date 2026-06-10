"use client"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Link from "next/link"
import { Truck, Clock, Snowflake, Gift } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const content = {
    de: {
        title: "VERSAND & LIEFERUNG",
        subtitle: "Frisch gebacken, gekühlt geliefert — direkt zu dir nach Hause.",
        sections: [
            {
                icon: Truck,
                title: "Liefergebiet",
                text: "Wir liefern im Umkreis von 10 km um das Zentrum von Zürich. Ob deine Adresse in unserem Liefergebiet liegt, siehst du direkt im Checkout bei der Eingabe deiner Postleitzahl.",
            },
            {
                icon: Clock,
                title: "Lieferzeit",
                text: "Alle Käsekuchen werden frisch auf Bestellung gebacken. Deshalb benötigen wir mindestens 36 Stunden Vorlaufzeit. Dein Wunschdatum und das Lieferzeitfenster wählst du bequem im Checkout.",
            },
            {
                icon: Snowflake,
                title: "Frische & Kühlung",
                text: "Deine Bestellung wird gekühlt geliefert, damit sie in perfektem Zustand bei dir ankommt. Am besten bewahrst du den Cheesecake im Kühlschrank auf und geniesst ihn innerhalb von 3–4 Tagen.",
            },
            {
                icon: Gift,
                title: "Versandkosten",
                text: "Die Lieferung kostet 8.40 CHF. Ab einem Bestellwert von 100 CHF liefern wir gratis — und du bekommst zusätzlich 10% Rabatt auf deine Bestellung.",
            },
        ],
        cta: "JETZT BESTELLEN",
    },
    en: {
        title: "SHIPPING & DELIVERY",
        subtitle: "Freshly baked, delivered chilled — straight to your door.",
        sections: [
            {
                icon: Truck,
                title: "Delivery area",
                text: "We deliver within 10 km of Zurich city centre. You can check whether your address is within our delivery area directly in the checkout when entering your postal code.",
            },
            {
                icon: Clock,
                title: "Delivery time",
                text: "All cheesecakes are freshly baked to order. That's why we need at least 36 hours' notice. You can choose your preferred date and delivery window conveniently in the checkout.",
            },
            {
                icon: Snowflake,
                title: "Freshness & cooling",
                text: "Your order is delivered chilled so it arrives in perfect condition. Keep your cheesecake in the fridge and enjoy it within 3–4 days.",
            },
            {
                icon: Gift,
                title: "Shipping costs",
                text: "Delivery costs CHF 8.40. For orders of CHF 100 or more, delivery is free — and you also get a 10% discount on your order.",
            },
        ],
        cta: "ORDER NOW",
    },
}

export default function VersandPage() {
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
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="grid gap-6 md:grid-cols-2">
                        {c.sections.map((s) => (
                            <div key={s.title} className="bg-[#FBF3E8] rounded-2xl p-8">
                                <s.icon className="w-7 h-7 text-[#651A1A] mb-4" strokeWidth={1.5} />
                                <h2 className="font-black text-lg text-[#651A1A] mb-2">{s.title}</h2>
                                <p className="text-sm leading-relaxed text-gray-700">{s.text}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link href="/bestellen">
                            <button className="bg-[#651A1A] text-white px-10 py-4 rounded-full font-black text-sm tracking-widest uppercase hover:bg-[#4A1313] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
                                {c.cta}
                            </button>
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
