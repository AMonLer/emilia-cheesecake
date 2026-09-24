"use client"

import { Trash2 } from "lucide-react"

// With one left, "−" removes the line: it used to do nothing, and recordings
// show people tapping it again and again.
export default function QuantityStepper({
  quantity,
  onChange,
  onRemove,
  labels,
  size = "md",
}: {
  quantity: number
  onChange: (quantity: number) => void
  onRemove: () => void
  labels: { decrease: string; increase: string; remove: string }
  size?: "sm" | "md"
}) {
  const button = size === "sm" ? "h-8 w-8" : "h-9 w-9"
  return (
    <div className="inline-flex items-center border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => (quantity > 1 ? onChange(quantity - 1) : onRemove())}
        aria-label={quantity > 1 ? labels.decrease : labels.remove}
        className={`${button} flex items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 active:bg-gray-100`}
      >
        {quantity > 1 ? "−" : <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />}
      </button>
      <span className="w-8 text-center text-xs font-medium tabular-nums text-black">{quantity}</span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        aria-label={labels.increase}
        className={`${button} flex items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 active:bg-gray-100`}
      >
        +
      </button>
    </div>
  )
}
