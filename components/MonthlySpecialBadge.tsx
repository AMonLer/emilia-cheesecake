import { Sparkles } from "lucide-react"

// "Torte des Monats" looks the same wherever it appears: burgundy with a gold
// star and hairline, the shop's own colours. It used to be three different
// small cream stickers (8px on the phone grid) that were easy to miss.

const GOLD = "text-[#E8C98E]"

export function MonthlySpecialBadge({
  label,
  subLabel,
  size = "md",
  className = "",
}: {
  label: string
  subLabel?: string
  // sm: narrow spots (phone product header, list rows) where md would wrap.
  size?: "sm" | "md"
  className?: string
}) {
  const small = size === "sm"
  return (
    <span className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 ${className}`}>
      <span className={`inline-flex items-center rounded-full border border-[#D4AF85]/70 bg-[#651A1A] text-[#F5E6D3] shadow-[0_6px_16px_-8px_rgba(101,26,26,0.8)] ${small ? "gap-1 px-2.5 py-1" : "gap-1.5 px-3 py-1.5"}`}>
        <Sparkles className={`shrink-0 ${GOLD} ${small ? "h-2.5 w-2.5" : "h-3 w-3"}`} strokeWidth={2.25} aria-hidden="true" />
        <span className={`whitespace-nowrap font-black uppercase leading-none ${small ? "text-[9px] tracking-[0.12em]" : "text-[10px] tracking-[0.18em]"}`}>{label}</span>
      </span>
      {subLabel && (
        <span className="font-serif text-xs italic leading-none text-[#651A1A]/75">{subLabel}</span>
      )}
    </span>
  )
}

// Full-width gold band across the top of a product photo: the photos sit on a
// dark burgundy backdrop, so gold is what stands out (burgundy disappeared).
export function MonthlySpecialSash({ label, subLabel }: { label: string; subLabel?: string }) {
  return (
    <div className="absolute inset-x-0 top-0 z-10 border-b border-[#651A1A]/25 bg-gradient-to-r from-[#D4AF85] via-[#F3E1BC] to-[#D4AF85] px-2 py-1.5 text-center text-[#651A1A] shadow-[0_8px_18px_-10px_rgba(0,0,0,0.55)] md:py-2">
      <p className="flex items-center justify-center gap-1.5 md:gap-2">
        <Sparkles className="h-2.5 w-2.5 shrink-0 md:h-3 md:w-3" strokeWidth={2.25} aria-hidden="true" />
        <span className="whitespace-nowrap text-[9px] font-black uppercase leading-none tracking-[0.2em] md:text-[11px]">{label}</span>
        <Sparkles className="h-2.5 w-2.5 shrink-0 md:h-3 md:w-3" strokeWidth={2.25} aria-hidden="true" />
      </p>
      {subLabel && (
        <p className="mt-1 hidden font-serif text-[11px] italic leading-none text-[#651A1A]/80 md:block">{subLabel}</p>
      )}
    </div>
  )
}
