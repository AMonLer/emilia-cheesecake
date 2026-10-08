"use client"

import type { CartSize } from "@/contexts/CartContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { smallSizeBackOnLabel } from "@/lib/availability"
import { useSizeAvailability } from "@/lib/useSizeAvailability"

const SIZES: CartSize[] = ["2-3", "8-10"]

// Two-way size switch for a cart line. Recordings showed buyers tapping the
// "8-10 persons" label, expecting to change it there instead of starting over.
export default function CartSizeToggle({
  size,
  onChange,
  personsLabel,
  className = "",
}: {
  size: string
  onChange: (size: CartSize) => void
  personsLabel: string
  className?: string
}) {
  const { locale, t } = useLanguage()
  const sizeAvailable = useSizeAvailability()

  return (
    <div className={className}>
      <div className="inline-flex items-center gap-2">
        <div role="radiogroup" aria-label={personsLabel} className="inline-flex rounded-full bg-gray-100 p-0.5">
          {SIZES.map((option) => {
            const selected = option === size
            // A size that is paused cannot be switched to, but a cart saved
            // before the pause may still hold it: show it, with the note below.
            const paused = !sizeAvailable(option)
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={paused && !selected}
                onClick={() => onChange(option)}
                className={`min-w-[2.75rem] rounded-full px-2.5 py-1 text-[0.7rem] font-bold tabular-nums transition-colors ${selected ? "bg-white text-[#651A1A] shadow-sm" : paused ? "cursor-not-allowed text-gray-300 line-through" : "text-gray-500 hover:text-gray-800"}`}
              >
                {option.replace("-", "–")}
              </button>
            )
          })}
        </div>
        <span className="text-xs text-gray-500">{personsLabel}</span>
      </div>
      {!sizeAvailable(size) && (
        <p role="alert" className="mt-1.5 text-xs font-semibold leading-snug text-red-700">
          {t.cart.sizeUnavailable(smallSizeBackOnLabel(locale))}
        </p>
      )}
    </div>
  )
}
