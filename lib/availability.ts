import { zurichToday } from '@/lib/delivery-dates'
import type { Locale } from '@/lib/translations'

// We ran out of boxes for the 2-3 size. Until the new ones arrive that size
// cannot be ordered; it comes back by itself on this day (Zurich time).
// Product page, cards, cart, checkout and the payment API all read it from here.
export const SMALL_SIZE = '2-3'
export const SMALL_SIZE_BACK_ON = new Date(2026, 9, 29)

export function isSizeAvailable(size: string, now: Date = new Date()): boolean {
  return size !== SMALL_SIZE || zurichToday(now).getTime() >= SMALL_SIZE_BACK_ON.getTime()
}

// "29. Oktober" / "29 October"
export function smallSizeBackOnLabel(locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'de' ? 'de-CH' : 'en-GB', { day: 'numeric', month: 'long' }).format(SMALL_SIZE_BACK_ON)
}
