// Shipping and discount rules. The cart, the checkout and the payment API all
// compute the total from here, so what the buyer sees is what Stripe charges.
export const SHIPPING_FEE = 8.4
export const FREE_SHIPPING_FROM = 100
export const VOLUME_DISCOUNT_FROM = 100
export const VOLUME_DISCOUNT_RATE = 0.1

const PROMO_CODE = 'holaswitzerland'
const ADMIN_CODE = 'emilia1'

export function normalizeDiscountCode(code: unknown): string {
  return String(code ?? '').trim().toLowerCase()
}

export function isKnownDiscountCode(code: unknown): boolean {
  const normalized = normalizeDiscountCode(code)
  return normalized === PROMO_CODE || normalized === ADMIN_CODE
}

const roundToCents = (amount: number) => Math.round(amount * 100) / 100

export type OrderTotals = {
  shipping: number
  discountRate: number
  discount: number
  total: number
  promoCodeApplied: boolean
  isAdminOrder: boolean
}

export function computeOrderTotals(subtotal: number, discountCode: unknown = ''): OrderTotals {
  const code = normalizeDiscountCode(discountCode)
  const promoCodeApplied = code === PROMO_CODE
  const isAdminOrder = code === ADMIN_CODE
  const shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE
  const discountRate = promoCodeApplied
    ? (subtotal >= 100 ? 0.15 : 0.1)
    : subtotal >= VOLUME_DISCOUNT_FROM ? VOLUME_DISCOUNT_RATE : 0
  const discount = subtotal * discountRate
  // Test orders: the owner's code charges 1 CHF so a real payment runs end to end.
  const total = isAdminOrder ? 1 : roundToCents(subtotal - discount + shipping)
  return { shipping, discountRate, discount, total, promoCodeApplied, isAdminOrder }
}
