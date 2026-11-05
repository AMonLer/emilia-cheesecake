import type Stripe from 'stripe'
import { isSingleUseCode, normalizeDiscountCode } from '@/lib/pricing'

// A PaymentIntent in one of these states has been (or is being) paid.
const PAID_STATUSES = new Set(['succeeded', 'processing', 'requires_capture'])

// Payments made with a single-use code carry it in this metadata field.
export const SINGLE_USE_CODE_METADATA_KEY = 'singleUseCode'

// True once an order was paid with this code. Stripe's search can lag about a
// minute behind a payment, which is fine for a code handed to one person.
export async function isSingleUseCodeSpent(stripe: Stripe, code: unknown): Promise<boolean> {
  const normalized = normalizeDiscountCode(code)
  if (!isSingleUseCode(normalized)) return false
  // The code comes from our own list (letters and digits), so it is safe to quote.
  const result = await stripe.paymentIntents.search({
    query: `metadata['${SINGLE_USE_CODE_METADATA_KEY}']:'${normalized}'`,
    limit: 20,
  })
  return result.data.some((intent) => PAID_STATUSES.has(intent.status))
}
