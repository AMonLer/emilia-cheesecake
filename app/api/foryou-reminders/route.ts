import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { addDays, isSameDay } from 'date-fns'
import ForYouReminderEmail from '@/emails/ForYouReminder'
import { listForYouMessages } from '@/lib/foryou-store'
import { getForYouOrder } from '@/lib/foryou-order'
import { forYouEditUrl } from '@/lib/foryou-auth'
import { zurichToday } from '@/lib/delivery-dates'
import { sendTelegramMessage } from '@/lib/telegram'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Daily cron (vercel.json). Gifts whose For You message is still empty:
// - delivery tomorrow: e-mail the buyer a fresh edit link;
// - delivery today: tell the shop on Telegram, the code will show the default greeting.
// One run per day means one reminder per order, no state to keep.
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  if (req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = zurichToday()
  const tomorrow = addDays(today, 1)
  const empty = (await listForYouMessages()).filter(
    (m) => m.paymentIntentId && !m.message && !m.videoUrl && !m.fileUrl
  )

  const resend = new Resend(process.env.RESEND_API_KEY)
  const reminded: string[] = []
  const failed: string[] = []
  const dueToday: string[] = []

  for (const entry of empty) {
    const order = await getForYouOrder(entry.paymentIntentId)
    if (!order?.deliveryDay) continue
    if (isSameDay(order.deliveryDay, today)) {
      dueToday.push(entry.code)
      continue
    }
    if (!isSameDay(order.deliveryDay, tomorrow)) continue
    if (!order.customerEmail) {
      failed.push(entry.code)
      continue
    }
    try {
      const html = await render(
        ForYouReminderEmail({
          customerFirstName: order.customerFirstName,
          deliveryDate: order.deliveryDay.toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long' }),
          editUrl: forYouEditUrl(entry.code, entry.paymentIntentId!),
        })
      )
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'info@emilialab.com',
        to: order.customerEmail,
        subject: 'Ihr Geschenk wird morgen geliefert – fehlt noch Ihre Botschaft?',
        html,
      })
      reminded.push(entry.code)
    } catch (error) {
      console.error('Error sending For You reminder:', error)
      failed.push(entry.code)
    }
  }

  const lines = [
    reminded.length ? `📧 Mañana, sin mensaje (recordatorio enviado): ${reminded.join(', ')}` : '',
    failed.length ? `⚠️ Mañana, sin mensaje y sin poder avisar al cliente: ${failed.join(', ')}` : '',
    dueToday.length ? `📦 Hoy, sin mensaje: ${dueToday.join(', ')} (el QR mostrará el saludo por defecto; el sticker se pega igual)` : '',
  ].filter(Boolean)
  if (lines.length) {
    await sendTelegramMessage(`🎁 <b>FOR YOU</b>\n${lines.join('\n')}`)
  }

  return NextResponse.json({ ok: true, reminded, failed, dueToday })
}
