import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia' as any,
})

export async function POST(req: NextRequest) {
  try {
    const { amount, orderData } = await req.json()

    const rawDiscountCode = String(orderData?.discountCode || '').trim().toLowerCase()
    const subtotal = Number(orderData?.subtotal || 0)
    const shippingCost = Number(orderData?.shippingCost || 0)

    let finalAmount = Number(amount || 0)
    let discountPercent = 0

    if (subtotal > 0) {
      if (rawDiscountCode === 'holaswitzerland') {
        discountPercent = subtotal >= 100 ? 15 : 10
      } else if (subtotal >= 100) {
        discountPercent = 10
      }

      const discountValue = subtotal * (discountPercent / 100)
      finalAmount = subtotal - discountValue + shippingCost
    }

    // Crear Payment Intent con metadata del pedido
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100), // Stripe usa centavos
      currency: 'chf',
      payment_method_types: ['card', 'twint'], // card includes Apple Pay & Google Pay
      metadata: {
        customerEmail: orderData?.email || '',
        customerName: `${orderData?.firstName || ''} ${orderData?.lastName || ''}`,
        address: orderData?.address || '',
        city: orderData?.city || '',
        postalCode: orderData?.postalCode || '',
        kanton: orderData?.kanton || '',
        deliveryDate: orderData?.deliveryDate || '',
        deliveryTime: orderData?.deliveryTime || '',
        discountCode: orderData?.discountCode || '',
        discountPercent: discountPercent ? String(discountPercent) : '',
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
