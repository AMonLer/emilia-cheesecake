// Shipping and discount rules. The cart, the checkout and the payment API all
// compute the total from here, so what the buyer sees is what Stripe charges.
export const SHIPPING_FEE = 8.4
export const FREE_SHIPPING_FROM = 100
export const VOLUME_DISCOUNT_FROM = 100
export const VOLUME_DISCOUNT_RATE = 0.1

const PROMO_CODE = 'holaswitzerland'
const ADMIN_CODE = 'emilia1'

// Codes that pay for one order only, each worth a fixed amount in CHF off the
// cakes (never off delivery). The payment API refuses a code once an order paid with it.
const SINGLE_USE_CODES: Record<string, number> = {
  emilia25k7: 25,
}

export function normalizeDiscountCode(code: unknown): string {
  return String(code ?? '').trim().toLowerCase()
}

export function isSingleUseCode(code: unknown): boolean {
  return Object.prototype.hasOwnProperty.call(SINGLE_USE_CODES, normalizeDiscountCode(code))
}

export function isKnownDiscountCode(code: unknown): boolean {
  const normalized = normalizeDiscountCode(code)
  return normalized === PROMO_CODE || normalized === ADMIN_CODE || isSingleUseCode(normalized)
}

const roundToCents = (amount: number) => Math.round(amount * 100) / 100

export type OrderTotals = {
  shipping: number
  discountRate: number
  discount: number
  total: number
  promoCodeApplied: boolean
  isAdminOrder: boolean
  singleUseCode: boolean
}

export function computeOrderTotals(subtotal: number, discountCode: unknown = ''): OrderTotals {
  const code = normalizeDiscountCode(discountCode)
  const singleUseCode = isSingleUseCode(code)
  const promoCodeApplied = code === PROMO_CODE || singleUseCode
  const isAdminOrder = code === ADMIN_CODE
  const shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE
  // A single-use code is a fixed amount (never more than the cakes cost) and
  // replaces the volume discount instead of adding to it.
  const discountRate = singleUseCode
    ? 0
    : code === PROMO_CODE
      ? (subtotal >= 100 ? 0.15 : 0.1)
      : subtotal >= VOLUME_DISCOUNT_FROM ? VOLUME_DISCOUNT_RATE : 0
  const discount = singleUseCode
    ? Math.min(SINGLE_USE_CODES[code], Math.max(subtotal, 0))
    : subtotal * discountRate
  // Test orders: the owner's code charges 1 CHF so a real payment runs end to end.
  const total = isAdminOrder ? 1 : roundToCents(subtotal - discount + shipping)
  return { shipping, discountRate, discount, total, promoCodeApplied, isAdminOrder, singleUseCode }
}
