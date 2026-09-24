import { addDays, eachDayOfInterval, isSameDay } from 'date-fns'
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'

// Every cake is baked to order: a slot can be booked only if it starts at least
// this many hours after the order. Checkout, product page, cart and payment API
// all read it from here.
export const LEAD_TIME_HOURS = 24

export const DELIVERY_TIME_ZONE = 'Europe/Zurich'

export const DELIVERY_SLOTS = ['09:00 - 12:00', '12:00 - 15:00', '15:00 - 18:00', '18:00 - 21:00'] as const
export type DeliverySlot = (typeof DELIVERY_SLOTS)[number]

export function isDeliverySlot(value: unknown): value is DeliverySlot {
  return typeof value === 'string' && (DELIVERY_SLOTS as readonly string[]).includes(value)
}

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

const pad = (n: number) => String(n).padStart(2, '0')

// Calendar days travel as local-midnight Dates (what the date picker hands out),
// but the slot is a Zurich wall-clock time. Reading it in the device's own zone
// let a buyer abroad book a slot that was less than a day away in Zurich.
export function slotStart(date: Date, slot: string): Date {
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  return fromZonedTime(`${day}T${pad(parseInt(slot, 10))}:00:00`, DELIVERY_TIME_ZONE)
}

export function isSlotBookable(date: Date, slot: string, now: Date = new Date()): boolean {
  return slotStart(date, slot).getTime() >= now.getTime() + LEAD_TIME_HOURS * 3_600_000
}

export function firstBookableSlot(date: Date, now: Date = new Date()): DeliverySlot | null {
  return DELIVERY_SLOTS.find((slot) => isSlotBookable(date, slot, now)) ?? null
}

// A day only counts if it is open and still has a slot left: the calendar alone
// compares whole days and would offer a day whose four slots are all too early.
export function isDateBookable(date: Date, now: Date = new Date()): boolean {
  return !isDeliveryDateBlocked(date) && firstBookableSlot(date, now) !== null
}

// Today in Zurich as a local-midnight Date, whatever zone the device is in.
export function zurichToday(now: Date = new Date()): Date {
  const [year, month, day] = formatInTimeZone(now, DELIVERY_TIME_ZONE, 'yyyy-MM-dd').split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function nextBookableDates(count: number, now: Date = new Date()): Date[] {
  const dates: Date[] = []
  let day = zurichToday(now)
  // A year of lookahead is enough to cross the Christmas closure.
  for (let i = 0; i < 400 && dates.length < count; i++, day = addDays(day, 1)) {
    if (isDateBookable(day, now)) dates.push(day)
  }
  return dates
}

export function firstBookableDate(now: Date = new Date()): Date | null {
  return nextBookableDates(1, now)[0] ?? null
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
