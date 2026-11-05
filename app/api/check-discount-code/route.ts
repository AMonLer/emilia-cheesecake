import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { isKnownDiscountCode, isSingleUseCode } from '@/lib/pricing'
import { isSingleUseCodeSpent } from '@/lib/single-use-codes'

// The checkout asks here before applying a code, so a single-use code that was
// already used is refused straight away instead of at the payment step.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const code = body?.code
  if (!isKnownDiscountCode(code)) return NextResponse.json({ valid: false })
  if (!isSingleUseCode(code)) return NextResponse.json({ valid: true })
  try {
    // Created here so the other codes answer even where no Stripe key is set.
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2024-12-18.acacia' as any,
    })
    const spent = await isSingleUseCodeSpent(stripe, code)
    return NextResponse.json({ valid: !spent, spent })
  } catch (error) {
    console.error('Error checking single-use code:', error)
    return NextResponse.json({ valid: false, error: 'CHECK_FAILED' }, { status: 503 })
  }
}
