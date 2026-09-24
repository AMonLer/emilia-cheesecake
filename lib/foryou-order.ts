import Stripe from 'stripe'
import { isDeliverySlot, parseDeliveryDate, slotStart } from './delivery-dates'

// The order behind a For You code, read from its Stripe PaymentIntent metadata.
export type ForYouOrder = {
  deliveryDay: Date | null
  // A saved message can be changed until the delivery slot starts: before that
  // the recipient cannot have scanned the code, so it never changes under them.
  editableUntil: number | null
  customerEmail: string
  customerFirstName: string
}

export function forYouOrderFromMetadata(metadata: Record<string, string | undefined>): ForYouOrder {
  const deliveryDay = parseDeliveryDate(metadata.deliveryDate)
  const slot = metadata.deliveryTime
  return {
    deliveryDay,
    editableUntil: deliveryDay && isDeliverySlot(slot) ? slotStart(deliveryDay, slot).getTime() : null,
    customerEmail: metadata.customerEmail || '',
    customerFirstName: (metadata.customerName || '').trim().split(/\s+/)[0] || '',
  }
}

let stripe: Stripe | null = null

export async function getForYouOrder(paymentIntentId: string | undefined): Promise<ForYouOrder | null> {
  if (!paymentIntentId || !process.env.STRIPE_SECRET_KEY) return null
  try {
    stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' as any })
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return forYouOrderFromMetadata(intent.metadata)
  } catch (error) {
    console.error('Error reading For You order from Stripe:', error)
    return null
  }
}
