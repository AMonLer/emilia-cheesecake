import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia' as any,
})

export async function POST(req: NextRequest) {
  try {
    const { amount, orderData } = await req.json()

    // Crear Payment Intent con metadata del pedido
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency: 'chf',
      payment_method_types: ['card', 'twint'],
      metadata: {
        customerEmail: orderData?.email || '',
        customerName: `${orderData?.firstName || ''} ${orderData?.lastName || ''}`,
        address: orderData?.address || '',
        city: orderData?.city || '',
        postalCode: orderData?.postalCode || '',
        kanton: orderData?.kanton || '',
        deliveryDate: orderData?.deliveryDate || '',
        deliveryTime: orderData?.deliveryTime || '',
        items: JSON.stringify(orderData?.items || []),
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error: any) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
