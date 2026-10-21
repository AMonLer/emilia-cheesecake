'use client'

import { CakeSlice, Gift, Truck } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

// Right under the hero, the three things people ask before ordering: is it
// fresh, do you deliver to me, can I send it as a gift. In the simulated
// visitor panel the delivery was the main reason not to buy, and half of the
// web orders are gifts. On the phone only the titles show, so the first cakes
// still peek in under the hero.
export default function BenefitsStrip() {
    const { t } = useLanguage()
    const b = t.benefits
    const items = [
        { icon: CakeSlice, title: b.freshTitle, text: b.freshText },
        { icon: Truck, title: b.deliveryTitle, text: b.deliveryText },
        { icon: Gift, title: b.giftTitle, text: b.giftText },
    ]

    return (
        <section aria-label={b.deliveryTitle} className="border-y border-[#651A1A]/10 bg-[#FBF5EF]">
            <ul className="container mx-auto grid grid-cols-3 divide-x divide-[#651A1A]/10 px-2 md:px-4">
                {items.map(({ icon: Icon, title, text }) => (
                    <li key={title} className="flex flex-col items-center gap-1.5 px-2 py-3.5 text-center md:flex-row md:items-start md:gap-4 md:px-8 md:py-6 md:text-left">
                        <Icon className="h-5 w-5 shrink-0 text-[#651A1A] md:mt-0.5 md:h-6 md:w-6" strokeWidth={1.5} aria-hidden="true" />
                        <div>
                            <p className="font-serif text-[13px] leading-tight text-[#651A1A] md:text-lg">{title}</p>
                            <p className="mt-1 hidden text-sm leading-snug text-[#651A1A]/70 md:block">{text}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    )
}
