import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { isForYouCode } from '@/lib/foryou-code'
import { giftFromMetadata } from '@/lib/foryou-checkout'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia' as any,
})

// The confirmation page asks which sticker code the gift got and whether its
// message was made in the checkout. The payment ID alone is not proof of
// ownership: Stripe's client secret and a successful payment are checked first.
export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, clientSecret } = await req.json()
    if (typeof paymentIntentId !== 'string' || !/^pi_[A-Za-z0-9]+$/.test(paymentIntentId) || typeof clientSecret !== 'string' || !clientSecret) {
      return NextResponse.json({ error: 'Missing payment credentials' }, { status: 400 })
    }
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId)
    if (intent.client_secret !== clientSecret) {
      return NextResponse.json({ error: 'Invalid payment credentials' }, { status: 403 })
    }
    if (intent.status !== 'succeeded') {
      return NextResponse.json({ code: null })
    }
    const code = intent.metadata?.foryouCode || ''
    if (!isForYouCode(code)) {
      // Regalo sin código todavía: el webhook está asignando el sticker.
      // La página de confirmación reintenta unos segundos hasta que aparezca.
      return NextResponse.json({ code: null, pending: intent.metadata?.isGift === 'yes' })
    }
    const hasMessage = Boolean(giftFromMetadata(intent.metadata))
    return NextResponse.json({ code, hasMessage }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error: any) {
    console.error('Error retrieving For You code:', error)
    return NextResponse.json({ error: 'Could not verify payment' }, { status: 500 })
  }
}
