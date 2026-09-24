import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import {
  isDeliveryDateBlocked,
  isDeliverySlot,
  isSlotBookable,
  parseDeliveryDate,
} from '@/lib/delivery-dates'
import { computeOrderTotals } from '@/lib/pricing'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia' as any,
})

// The checkout checks the lead time right before calling us; this only absorbs
// the seconds in between, not a stale tab.
const LEAD_TIME_GRACE_MS = 10 * 60_000

// A PaymentIntent in one of these states has been (or is being) paid.
const PAID_STATUSES = new Set(['succeeded', 'processing', 'requires_capture'])

type PreviousPaymentIntent = { id?: unknown; clientSecret?: unknown; sameOrder?: unknown }

// Each visit to the payment step used to create a fresh PaymentIntent, and an
// older one could still be completed (a TWINT approval arriving late, or a pay
// tap on a restored page). Settle the previous one first: if this same order was
// paid, it already exists; otherwise cancel it so at most one can be charged.
async function settlePreviousPaymentIntent(previous: PreviousPaymentIntent | undefined) {
  if (typeof previous?.id !== 'string' || typeof previous?.clientSecret !== 'string') return null
  let intent: Stripe.PaymentIntent
  try {
    intent = await stripe.paymentIntents.retrieve(previous.id)
  } catch {
    return null
  }
  // Only the browser that created it knows the secret: never touch anyone else's.
  if (intent.client_secret !== previous.clientSecret) return null
  // Paid for a different basket or delivery: that was an earlier order, this is a new one.
  if (PAID_STATUSES.has(intent.status)) return previous.sameOrder === true ? intent : null
  if (intent.status === 'canceled') return null
  try {
    await stripe.paymentIntents.cancel(intent.id)
  } catch {
    // Cancel fails when the payment completed in the meantime.
    const latest = await stripe.paymentIntents.retrieve(intent.id).catch(() => null)
    if (latest && PAID_STATUSES.has(latest.status) && previous.sameOrder === true) return latest
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const { orderData, previousPaymentIntent } = await req.json()

    // Recheck on the server so an older checkout cannot book a closed day.
    const deliveryDate = parseDeliveryDate(orderData?.deliveryDate)
    if (!deliveryDate || isDeliveryDateBlocked(deliveryDate)) {
      return NextResponse.json(
        { error: 'Please choose an available delivery date.', code: 'DELIVERY_DATE_UNAVAILABLE' },
        { status: 400 }
      )
    }
    const deliveryTime = orderData?.deliveryTime
    if (!isDeliverySlot(deliveryTime) || !isSlotBookable(deliveryDate, deliveryTime, new Date(Date.now() - LEAD_TIME_GRACE_MS))) {
      return NextResponse.json(
        { error: 'Please choose a delivery slot that respects the lead time.', code: 'DELIVERY_SLOT_UNAVAILABLE' },
        { status: 400 }
      )
    }

    const paid = await settlePreviousPaymentIntent(previousPaymentIntent)
    if (paid) {
      return NextResponse.json({
        alreadyPaid: true,
        paymentIntentId: paid.id,
        clientSecret: paid.client_secret,
      })
    }

    const subtotal = Number(orderData?.subtotal || 0)
    const discountCode = String(orderData?.discountCode || '')
    const totals = computeOrderTotals(subtotal, discountCode)
    if (!(totals.total > 0)) {
      return NextResponse.json({ error: 'Invalid order amount.' }, { status: 400 })
    }
    const discountPercent = Math.round(totals.discountRate * 100)

    // El sticker For You ya no se genera aquí: los códigos están impresos y el
    // webhook asigna el siguiente libre tras cobrar (así no se queman stickers
    // en pagos abandonados). Aquí solo queda constancia de si es regalo.
    const isGift = Boolean(orderData?.isGift)

    // Crear Payment Intent con metadata del pedido
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totals.total * 100),
      currency: 'chf',
      automatic_payment_methods: { enabled: true },
      metadata: {
        foryouCode: '',
        isGift: isGift ? 'yes' : 'no',
        customerEmail: orderData?.email || '',
        customerPhone: orderData?.phone || '',
        customerName: `${orderData?.firstName || ''} ${orderData?.lastName || ''}`,
        address: orderData?.address || '',
        city: orderData?.city || '',
        postalCode: orderData?.postalCode || '',
        recipientName: orderData?.recipientName || '',
        recipientIsCompany: orderData?.recipientIsCompany || '',
        recipientPhone: orderData?.recipientPhone || '',
        deliveryDate: orderData?.deliveryDate || '',
        deliveryTime,
        discountCode,
        discountPercent: discountPercent ? String(discountPercent) : '',
        subtotal: subtotal ? subtotal.toFixed(2) : '',
        shippingCost: totals.shipping ? totals.shipping.toFixed(2) : '',
        // The webhook skips the Meta server event when the buyer declined tracking.
        trackingConsent: orderData?.trackingConsent === 'denied' ? 'denied' : orderData?.trackingConsent === 'granted' ? 'granted' : 'unset',
        items: JSON.stringify(orderData?.items || []),
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
    })
  } catch (error: any) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
