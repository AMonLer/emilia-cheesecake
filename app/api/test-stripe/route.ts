import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET() {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2024-12-18.acacia' as any,
    })

    // Test creating a simple payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // 10 CHF test
      currency: 'chf',
      payment_method_types: ['card'],
    })

    return NextResponse.json({
      success: true,
      message: 'Stripe connection works!',
      intentId: paymentIntent.id,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      type: error.type,
      code: error.code,
    }, { status: 500 })
  }
}
