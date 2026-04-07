import Stripe from 'stripe'

const FALLBACK_SHIPPING_CHF = 6
const COMMISSION_RATE = 0.05

export interface SaleItem {
  name: string
  size?: string
  quantity: number
  price: number
}

export interface SaleRow {
  id: string
  date: Date
  customerName: string
  total: number
  shipping: number
  base: number
  commission: number
  // Admin-only details (parsed from PaymentIntent metadata)
  customerEmail: string
  customerPhone: string
  address: string
  postalCode: string
  city: string
  kanton: string
  deliveryDate: string
  deliveryTime: string
  items: SaleItem[]
}

export interface SalesSummary {
  rows: SaleRow[]
  totals: {
    total: number
    shipping: number
    base: number
    commission: number
    count: number
  }
}

function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia' as any,
  })
}

/**
 * Returns [start, endExclusive] in unix seconds for the given YYYY-MM string,
 * interpreted in Europe/Zurich local time.
 *
 * Note: this uses a fixed UTC offset based on the month boundary, which is
 * accurate enough for monthly billing buckets (a single DST transition mid-month
 * would shift the boundary by one hour, which doesn't matter for invoicing).
 */
export function monthRangeToUnixSeconds(monthStr: string): { gte: number; lt: number } {
  const [yearStr, monthNumStr] = monthStr.split('-')
  const year = Number(yearStr)
  const month = Number(monthNumStr) // 1-12
  if (!year || !month || month < 1 || month > 12) {
    throw new Error(`Invalid month: ${monthStr}`)
  }
  // Compute Zurich offset at first of month (rough but stable)
  const start = zonedDateToUtc(year, month, 1)
  const nextMonth = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 }
  const end = zonedDateToUtc(nextMonth.y, nextMonth.m, 1)
  return { gte: Math.floor(start / 1000), lt: Math.floor(end / 1000) }
}

/**
 * Convert a Europe/Zurich wall-clock date (year, month 1-12, day) at 00:00 to a UTC ms timestamp.
 */
function zonedDateToUtc(year: number, month: number, day: number): number {
  // Build a UTC date and adjust by Zurich offset.
  const utcGuess = Date.UTC(year, month - 1, day, 0, 0, 0)
  // Determine the offset that Zurich has at that UTC instant.
  const offsetMinutes = getZurichOffsetMinutes(new Date(utcGuess))
  return utcGuess - offsetMinutes * 60 * 1000
}

function getZurichOffsetMinutes(date: Date): number {
  // Use Intl to get Zurich local components, then compute the diff vs UTC.
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Zurich',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = fmt.formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second')
  )
  return Math.round((asUtc - date.getTime()) / (60 * 1000))
}

export function previousMonth(monthStr: string): string {
  const [yearStr, monthNumStr] = monthStr.split('-')
  const year = Number(yearStr)
  const month = Number(monthNumStr)
  if (!year || !month) throw new Error(`Invalid month: ${monthStr}`)
  const prevYear = month === 1 ? year - 1 : year
  const prevMonth = month === 1 ? 12 : month - 1
  return `${prevYear}-${String(prevMonth).padStart(2, '0')}`
}

export function monthLongLabel(monthStr: string, locale = 'en-US'): string {
  const [y, m] = monthStr.split('-').map(Number)
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
    new Date(y, m - 1, 1)
  )
}

export function defaultMonth(): string {
  // Current month in Europe/Zurich
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zurich',
    year: 'numeric',
    month: '2-digit',
  })
  const parts = fmt.formatToParts(new Date())
  const year = parts.find((p) => p.type === 'year')?.value
  const month = parts.find((p) => p.type === 'month')?.value
  return `${year}-${month}`
}

export async function fetchSalesForMonth(monthStr: string): Promise<SalesSummary> {
  const stripe = getStripe()
  const { gte, lt } = monthRangeToUnixSeconds(monthStr)

  const rows: SaleRow[] = []
  let startingAfter: string | undefined = undefined

  // Stripe filter is inclusive on both bounds, so use lt-1 for the upper.
  while (true) {
    const page: Stripe.ApiList<Stripe.PaymentIntent> = await stripe.paymentIntents.list({
      created: { gte, lte: lt - 1 },
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })

    for (const pi of page.data) {
      if (pi.status !== 'succeeded') continue
      const total = pi.amount / 100
      const shippingMeta = Number(pi.metadata?.shippingCost)
      const shipping = Number.isFinite(shippingMeta) && shippingMeta > 0 ? shippingMeta : FALLBACK_SHIPPING_CHF
      const base = Math.max(0, total - shipping)
      const commission = base * COMMISSION_RATE

      let items: SaleItem[] = []
      if (pi.metadata?.items) {
        try {
          const parsed = JSON.parse(pi.metadata.items)
          if (Array.isArray(parsed)) items = parsed
        } catch {
          // ignore malformed items
        }
      }

      rows.push({
        id: pi.id,
        date: new Date(pi.created * 1000),
        customerName: pi.metadata?.customerName?.trim() || '—',
        total,
        shipping,
        base,
        commission,
        customerEmail: pi.metadata?.customerEmail?.trim() || '',
        customerPhone: pi.metadata?.customerPhone?.trim() || '',
        address: pi.metadata?.address?.trim() || '',
        postalCode: pi.metadata?.postalCode?.trim() || '',
        city: pi.metadata?.city?.trim() || '',
        kanton: pi.metadata?.kanton?.trim() || '',
        deliveryDate: pi.metadata?.deliveryDate?.trim() || '',
        deliveryTime: pi.metadata?.deliveryTime?.trim() || '',
        items,
      })
    }

    if (!page.has_more) break
    startingAfter = page.data[page.data.length - 1]?.id
    if (!startingAfter) break
  }

  // Newest first
  rows.sort((a, b) => b.date.getTime() - a.date.getTime())

  const totals = rows.reduce(
    (acc, r) => {
      acc.total += r.total
      acc.shipping += r.shipping
      acc.base += r.base
      acc.commission += r.commission
      acc.count += 1
      return acc
    },
    { total: 0, shipping: 0, base: 0, commission: 0, count: 0 }
  )

  return { rows, totals }
}
