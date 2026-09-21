import { eachDayOfInterval, isSameDay } from 'date-fns'

export function getBlockedDeliveryDates(currentYear: number): Date[] {
  return [
    // One-off closures: fixed years so these dates remain available next year.
    ...eachDayOfInterval({
      start: new Date(2026, 7, 14),
      end: new Date(2026, 7, 24),
    }),
    ...eachDayOfInterval({
      start: new Date(2026, 8, 2),
      end: new Date(2026, 8, 3),
    }),
    ...eachDayOfInterval({
      start: new Date(2026, 8, 25),
      end: new Date(2026, 8, 27),
    }),
    // Christmas also covers January of the current year.
    ...[currentYear - 1, currentYear, currentYear + 1].flatMap((year) =>
      eachDayOfInterval({
        start: new Date(year, 11, 20),
        end: new Date(year + 1, 0, 6),
      })
    ),
  ]
}

export function isDeliveryDateBlocked(date: Date): boolean {
  return getBlockedDeliveryDates(date.getFullYear()).some((blocked) => isSameDay(blocked, date))
}

// The checkout sends calendar dates as de-CH strings, not UTC timestamps.
export function parseDeliveryDate(value: unknown): Date | null {
  if (typeof value !== 'string') return null
  const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value.trim())
  if (!match) return null
  const [day, month, year] = match.slice(1).map(Number)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null
}
