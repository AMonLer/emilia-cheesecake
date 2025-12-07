import { NextResponse } from 'next/server'

export async function GET() {
  const envStatus = {
    STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    EMAIL_FROM: !!process.env.EMAIL_FROM,
    EMAIL_TO: !!process.env.EMAIL_TO,
    TELEGRAM_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: !!process.env.TELEGRAM_CHAT_ID,
  }

  return NextResponse.json(envStatus)
}
