"use client"

import { useEffect, useState } from "react"
import { addDays, isSameDay } from "date-fns"
import { Truck } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { firstBookableDate, zurichToday } from "@/lib/delivery-dates"

// Buyers who needed the cake tomorrow only found out at the calendar, after
// typing their address. Showing the first free day up front answers it early.
export default function EarliestDelivery({ className = "" }: { className?: string }) {
  const { locale, t } = useLanguage()
  // Computed after mount: the server render cannot know the visitor's "now".
  const [date, setDate] = useState<Date | null>(null)

  useEffect(() => {
    const update = () => setDate(firstBookableDate(new Date()))
    update()
    const id = setInterval(update, 5 * 60_000)
    return () => clearInterval(id)
  }, [])

  if (!date) {
    return <p className={`${className} invisible`} aria-hidden="true">&nbsp;</p>
  }

  const day = date.toLocaleDateString(locale === "en" ? "en-GB" : "de-CH", {
    weekday: "long",
    day: "numeric",
    month: "short",
  })
  const isTomorrow = isSameDay(date, addDays(zurichToday(), 1))

  return (
    <p className={`flex items-center gap-2 ${className}`}>
      <Truck className="h-4 w-4 shrink-0 text-[#651A1A]" strokeWidth={1.75} aria-hidden="true" />
      <span>
        {t.delivery.earliest}:{" "}
        <strong className="font-bold text-[#651A1A]">
          {isTomorrow ? `${t.delivery.tomorrow}, ${day}` : day}
        </strong>
      </span>
    </p>
  )
}
