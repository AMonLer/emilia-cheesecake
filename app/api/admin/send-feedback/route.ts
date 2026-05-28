import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { getSession } from '@/lib/admin-auth'
import { render } from '@react-email/render'
import FeedbackEmail from '@/emails/FeedbackEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia' as any,
  })
}

export async function POST(req: NextRequest) {
  const session = getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { paymentIntentId, overrideName, gender } = await req.json()
  if (!paymentIntentId) {
    return NextResponse.json({ error: 'Missing paymentIntentId' }, { status: 400 })
  }

  const stripe = getStripe()
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId)

  if (pi.status !== 'succeeded') {
    return NextResponse.json({ error: 'Payment not succeeded' }, { status: 400 })
  }

  const email = pi.metadata?.customerEmail?.trim()
  const name = overrideName?.trim() || pi.metadata?.customerName?.trim() || 'Kunde'

  if (!email) {
    return NextResponse.json({ error: 'No email for this order' }, { status: 400 })
  }

  const html = await render(FeedbackEmail({
    customerName: name,
    gender: gender ?? undefined,
  }))

  const { error: resendError } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'info@emilialab.com',
    to: email,
    replyTo: 'info@emilialab.com',
    subject: 'Wie hat es Ihnen geschmeckt? 🍰',
    html,
  })

  if (resendError) {
    return NextResponse.json({ error: resendError.message }, { status: 500 })
  }

  const sentAt = new Date().toISOString()
  await stripe.paymentIntents.update(paymentIntentId, {
    metadata: { feedbackSentAt: sentAt },
  })

  return NextResponse.json({ success: true, sentAt })
}
