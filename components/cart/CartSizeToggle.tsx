"use client"

import type { CartSize } from "@/contexts/CartContext"

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
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div role="radiogroup" aria-label={personsLabel} className="inline-flex rounded-full bg-gray-100 p-0.5">
        {SIZES.map((option) => {
          const selected = option === size
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option)}
              className={`min-w-[2.75rem] rounded-full px-2.5 py-1 text-[0.7rem] font-bold tabular-nums transition-colors ${selected ? "bg-white text-[#651A1A] shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
            >
              {option.replace("-", "–")}
            </button>
          )
        })}
      </div>
      <span className="text-xs text-gray-500">{personsLabel}</span>
    </div>
  )
}
