import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia' as any,
})

// Resolves the "For You" code for a completed payment. The code lives in the
// PaymentIntent metadata, so we verify the payment succeeded before returning it.
export async function GET(req: NextRequest) {
  const paymentIntentId = req.nextUrl.searchParams.get('payment_intent')
  if (!paymentIntentId) {
    return NextResponse.json({ error: 'Missing payment_intent' }, { status: 400 })
  }

  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId)
    if (intent.status !== 'succeeded') {
      return NextResponse.json({ code: null })
    }
    return NextResponse.json({ code: intent.metadata?.foryouCode || null })
  } catch (error: any) {
    console.error('Error retrieving For You code:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
