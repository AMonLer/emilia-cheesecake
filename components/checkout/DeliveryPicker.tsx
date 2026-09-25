"use client"

import { useMemo, useState } from "react"
import { isSameDay } from "date-fns"
import { de, enUS } from "date-fns/locale"
import DatePicker, { registerLocale } from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import {
  DELIVERY_SLOTS,
  firstBookableSlot,
  getBlockedDeliveryDates,
  isDateBookable,
  isSlotBookable,
  nextBookableDates,
} from "@/lib/delivery-dates"

registerLocale("de", de)
registerLocale("en", enUS)

// Days offered as buttons. On a phone (93% of traffic) a month grid meant grey
// days to decode and months to page through; most buyers want one of these.
const QUICK_DAYS = 7

type Labels = {
  chooseDateLabel: string
  moreDates: string
  chooseTimeLabel: string
  slotUnavailable: string
}

export default function DeliveryPicker({
  now,
  locale,
  deliveryDate,
  deliveryTime,
  onChange,
  labels,
}: {
  now: Date
  locale: "de" | "en"
  deliveryDate: Date | null
  deliveryTime: string
  onChange: (date: Date, slot: string) => void
  labels: Labels
}) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const dateLocale = locale === "en" ? "en-GB" : "de-CH"
  const quickDays = useMemo(() => nextBookableDates(QUICK_DAYS, now), [now])
  const blockedDates = useMemo(() => getBlockedDeliveryDates(now.getFullYear()), [now])
  const pickedOtherDay = deliveryDate !== null && !quickDays.some((day) => isSameDay(day, deliveryDate))

  // Keep the chosen slot when the new day still has it; otherwise take its first one.
  const selectDay = (day: Date) => {
    const slot = deliveryTime && isSlotBookable(day, deliveryTime, now) ? deliveryTime : firstBookableSlot(day, now) ?? ""
    onChange(day, slot)
  }

  const dayButtonClass = (selected: boolean) =>
    `flex min-h-[4.25rem] flex-col items-center justify-center rounded-xl border-2 px-1 py-2 text-center transition-[background-color,border-color,transform] duration-150 active:scale-[0.97] ${selected
      ? "border-[#651A1A] bg-[#651A1A] text-white shadow-[0_8px_18px_-12px_rgba(101,26,26,0.8)]"
      : "border-[#E6D5C0] bg-white text-[#1a1a1a] hover:border-[#651A1A]/50"
    }`

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-bold">{labels.chooseDateLabel}</p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {quickDays.map((day) => {
            const selected = deliveryDate !== null && isSameDay(day, deliveryDate)
            return (
              <button
                key={day.getTime()}
                type="button"
                onClick={() => { selectDay(day); setCalendarOpen(false) }}
                aria-pressed={selected}
                aria-label={day.toLocaleDateString(dateLocale, { weekday: "long", day: "numeric", month: "long" })}
                className={dayButtonClass(selected)}
              >
                <span className={`text-[0.65rem] font-bold uppercase tracking-wider ${selected ? "text-white/80" : "text-[#651A1A]"}`}>
                  {day.toLocaleDateString(dateLocale, { weekday: "short" }).replace(".", "")}
                </span>
                <span className="font-serif text-xl font-black leading-tight">{day.getDate()}</span>
                <span className={`text-[0.65rem] ${selected ? "text-white/80" : "text-gray-500"}`}>
                  {day.toLocaleDateString(dateLocale, { month: "short" }).replace(".", "")}
                </span>
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => setCalendarOpen(!calendarOpen)}
            aria-expanded={calendarOpen}
            aria-pressed={pickedOtherDay}
            className={dayButtonClass(pickedOtherDay)}
          >
            {pickedOtherDay && deliveryDate ? (
              <>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-white/80">
                  {deliveryDate.toLocaleDateString(dateLocale, { weekday: "short" }).replace(".", "")}
                </span>
                <span className="font-serif text-xl font-black leading-tight">{deliveryDate.getDate()}</span>
                <span className="text-[0.65rem] text-white/80">
                  {deliveryDate.toLocaleDateString(dateLocale, { month: "short" }).replace(".", "")}
                </span>
              </>
            ) : (
              <>
                <CalendarDays className="h-5 w-5 text-[#651A1A]" strokeWidth={1.75} />
                <span className="mt-1 text-[0.65rem] font-bold leading-tight text-[#651A1A]">{labels.moreDates}</span>
              </>
            )}
          </button>
        </div>

        {calendarOpen && (
          <div className="mt-3 rounded-2xl border border-[#E6D5C0] bg-[#FFFCF8] p-3 sm:p-5">
            <style>{`
              .custom-datepicker { font-family: var(--font-playfair), serif; border: none; padding: 0; width: 100%; background-color: transparent; }
              .custom-datepicker.react-datepicker { width: 100%; border: none; background-color: transparent; }
              .custom-datepicker .react-datepicker__month-container { width: 100%; float: none; }
              .custom-datepicker .react-datepicker__header { background-color: transparent; border-bottom: none; padding-top: 0; margin-bottom: 0.5rem; width: 100%; }
              .custom-datepicker .react-datepicker__day-names,
              .custom-datepicker .react-datepicker__week { display: flex; justify-content: space-between; padding: 0; }
              /* Percentage widths so the 7-column grid never overflows a 320px viewport */
              .custom-datepicker .react-datepicker__day-name { color: #651A1A; font-family: var(--font-inter), sans-serif; font-weight: 600; width: 14.28%; max-width: 2.75rem; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.1em; margin: 0; text-align: center; }
              .custom-datepicker .react-datepicker__day { width: 14.28%; max-width: 2.75rem; height: 2.6rem; display: flex; align-items: center; justify-content: center; line-height: 1; border-radius: 9999px; margin: 0; font-size: 0.95rem; color: #1a1a1a; transition: background-color 0.2s, color 0.2s, transform 0.12s; -webkit-tap-highlight-color: transparent; }
              .custom-datepicker .react-datepicker__day:hover:not(.react-datepicker__day--disabled) { background-color: #E6D5C0; color: #651A1A; }
              .custom-datepicker .react-datepicker__day:active:not(.react-datepicker__day--disabled) { background-color: #E6D5C0; color: #651A1A; transform: scale(0.9); }
              .custom-datepicker .react-datepicker__day--selected { background-color: #651A1A !important; color: white !important; }
              /* Sin fecha elegida no debe verse ningún día "seleccionado" */
              .custom-datepicker .react-datepicker__day--keyboard-selected { background-color: transparent; color: #1a1a1a; }
              .custom-datepicker .react-datepicker__day--disabled { color: #ccc; opacity: 0.3; }
              .custom-datepicker .react-datepicker__day--outside-month { visibility: hidden; }
              .custom-datepicker .react-datepicker__month { margin: 0; }
            `}</style>
            <DatePicker
              selected={deliveryDate}
              onChange={(date) => {
                if (!date) return
                selectDay(date)
                setCalendarOpen(false)
              }}
              minDate={quickDays[0]}
              excludeDates={blockedDates}
              filterDate={(date) => isDateBookable(date, now)}
              openToDate={deliveryDate ?? quickDays[0]}
              locale={locale}
              inline
              calendarClassName="custom-datepicker"
              renderCustomHeader={({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
                <div className="mb-2 flex items-center justify-between px-1">
                  <button
                    onClick={decreaseMonth}
                    disabled={prevMonthButtonDisabled}
                    type="button"
                    aria-label={locale === "en" ? "Previous month" : "Vorheriger Monat"}
                    className="rounded-full p-2.5 text-[#651A1A] transition-colors hover:bg-[#E6D5C0] active:bg-[#E6D5C0] disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h3 className="font-serif text-lg font-black capitalize text-[#1a1a1a]">
                    {date.toLocaleDateString(dateLocale, { month: "long", year: "numeric" })}
                  </h3>
                  <button
                    onClick={increaseMonth}
                    disabled={nextMonthButtonDisabled}
                    type="button"
                    aria-label={locale === "en" ? "Next month" : "Nächster Monat"}
                    className="rounded-full p-2.5 text-[#651A1A] transition-colors hover:bg-[#E6D5C0] active:bg-[#E6D5C0] disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            />
          </div>
        )}
      </div>

      <div>
        <p className="mb-3 text-sm font-bold">{labels.chooseTimeLabel}</p>
        <div className="grid grid-cols-2 gap-3">
          {DELIVERY_SLOTS.map((slot) => {
            const available = deliveryDate !== null && isSlotBookable(deliveryDate, slot, now)
            const selected = available && deliveryTime === slot
            return (
              <button
                key={slot}
                type="button"
                disabled={!available}
                onClick={() => deliveryDate && onChange(deliveryDate, slot)}
                aria-pressed={selected}
                className={`rounded-xl border-2 p-4 transition-[background-color,border-color,transform] duration-150 ${!available
                  ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-50"
                  : selected
                    ? "border-[#651A1A] bg-[#F5E6D3] shadow-md active:scale-[0.98]"
                    : "border-gray-300 bg-white hover:border-gray-400 active:scale-[0.98]"
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {selected ? (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#651A1A]">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  ) : (
                    <svg className={`h-5 w-5 shrink-0 ${available ? "text-[#651A1A]" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className={`text-sm font-bold ${available ? "" : "text-gray-400 line-through"}`}>{slot}</span>
                </div>
                {!available && deliveryDate && (
                  <p className="mt-1 text-[0.65rem] text-gray-400">{labels.slotUnavailable}</p>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
