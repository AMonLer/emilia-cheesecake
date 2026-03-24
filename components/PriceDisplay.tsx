import { cn } from "@/lib/utils"

interface PriceDisplayProps {
    amount: number
    className?: string
    currency?: string
    showCurrency?: boolean
    currencyClassName?: string
}

export default function PriceDisplay({
    amount,
    className,
    currency = "CHF",
    showCurrency = true,
    currencyClassName
}: PriceDisplayProps) {
    const formatted = amount.toFixed(2)
    const [integerPart, decimalPart] = formatted.split('.')

    return (
        <span className={cn("inline-flex items-baseline font-medium", className)} style={{ fontFamily: 'var(--font-roboto), sans-serif' }}>
            <span>{integerPart}</span>
            <span className="text-[0.6em] -translate-y-[0.3em] ml-[1px]">.{decimalPart}</span>
            {showCurrency && (
                <span className={cn("ml-1 text-[0.4em] uppercase tracking-wide opacity-80 self-center font-sans translate-y-[0.1em]", currencyClassName)}>
                    {currency}
                </span>
            )}
        </span>
    )
}
