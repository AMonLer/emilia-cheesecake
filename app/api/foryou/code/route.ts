import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createForYouSession, forYouCookieName, forYouCookieOptions, isForYouCode, verifyForYouSession } from '@/lib/foryou-auth'
import { getForYouMessage } from '@/lib/foryou-store'
import { getForYouOrder } from '@/lib/foryou-order'
import { giftFromMetadata } from '@/lib/foryou-checkout'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia' as any,
})

// Checks an existing editing session without exposing its signed cookie.
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code') || ''
  const session = verifyForYouSession(req.cookies.get(forYouCookieName(code))?.value, code)
  const [message, order] = session
    ? await Promise.all([getForYouMessage(code), getForYouOrder(session.paymentIntentId)])
    : [null, null]
  // Until when a saved message may still be changed (start of the delivery slot).
  const editableUntil = order?.editableUntil ?? null
  return NextResponse.json({ authorized: Boolean(session), message, editableUntil }, { headers: { 'Cache-Control': 'no-store' } })
}

// The payment ID alone is not proof of ownership. Verify Stripe's client secret
// and successful payment before granting this browser permission to edit.
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
    // Made in the checkout: the confirmation says it is saved instead of asking for it.
    const hasMessage = Boolean(giftFromMetadata(intent.metadata))
    const response = NextResponse.json({ code, hasMessage }, { headers: { 'Cache-Control': 'no-store' } })
    response.cookies.set(forYouCookieName(code), createForYouSession(code, intent.id), forYouCookieOptions)
    return response
  } catch (error: any) {
    console.error('Error retrieving For You code:', error)
    return NextResponse.json({ error: 'Could not verify payment' }, { status: 500 })
  }
}
