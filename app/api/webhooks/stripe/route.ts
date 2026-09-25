import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import OrderConfirmationEmail from '@/emails/OrderConfirmation'
import AdminNotificationEmail from '@/emails/AdminNotification'
import { createOrderInNotion } from '@/lib/notion'
import { forYouRangeForItems, nextFreeForYouCode } from '@/lib/foryou-code'
import { listUsedForYouCodes, reserveForYouCode } from '@/lib/foryou-store'
import { forYouEditUrl } from '@/lib/foryou-auth'
import { giftFromMetadata } from '@/lib/foryou-checkout'
import { sendTelegramMessage } from '@/lib/telegram'
import crypto from 'crypto'

const META_PIXEL_ID = '26409977948633382'
const META_ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN || ''

async function sendMetaCAPI(eventName: string, eventId: string, amount: number, email?: string) {
  if (!META_ACCESS_TOKEN) {
    console.warn('Meta CAPI: no access token configured, skipping')
    return
  }

  const eventData: any = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: 'website',
    event_source_url: 'https://www.emilialab.com/payment-success',
    user_data: {},
    custom_data: {
      value: amount,
      currency: 'CHF',
    },
  }

  if (email) {
    eventData.user_data.em = [crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex')]
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [eventData],
        access_token: META_ACCESS_TOKEN,
      }),
    })
    const result = await res.json()
    if (res.ok) {
      console.log('✅ Meta CAPI Purchase enviado:', result)
    } else {
      console.error('Meta CAPI error:', result)
    }
  } catch (error) {
    console.error('Meta CAPI fetch error:', error)
  }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia' as any,
})

const resend = new Resend(process.env.RESEND_API_KEY)

// Telegram parses the order notice as HTML: a customer text with "&" or "<"
// (a company like "Müller & Co", a delivery note) made it reject the whole
// message, and the order notice never arrived.
const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  // Manejar el evento de pago exitoso
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent

    try {
      // Obtener los metadatos del pedido
      const metadata = paymentIntent.metadata
      const amount = paymentIntent.amount / 100 // Convertir de centavos a francos
      const tg = (key: string) => escapeHtml(metadata[key] || '')
      const deliveryNote = metadata.deliveryNote || ''
      const wantsNewsletter = metadata.newsletter === 'yes'

      // Parsear items una sola vez: Telegram, rango del sticker For You y Notion
      let items: any[] = []
      try {
        if (metadata.items) {
          items = JSON.parse(metadata.items)
        }
      } catch (e) {
        console.error('Error parseando items:', e)
      }

      // Formatear productos para Telegram
      const productsText = items.length
        ? items.map((item: any) =>
            `• ${item.name} (${item.size || 'N/A'}) x${item.quantity} - CHF ${(item.price * item.quantity).toFixed(2)}`
          ).join('\n')
        : 'Ver en Stripe'

      // Sticker For You: los códigos ya están impresos (2000–2300 para tarta
      // pequeña, 3001–3200 para grande; si el pedido mezcla tamaños, el sticker
      // va en la grande). Se asigna tras cobrar para no quemar stickers en pagos
      // abandonados, y se reserva en Notion para no entregar el mismo dos veces.
      const isGift = metadata.isGift === 'yes'
      // Message, video or photo the buyer already made in the checkout.
      const gift = isGift ? giftFromMetadata(metadata) : null
      const giftContent = gift ? { message: gift.message, videoUrl: gift.videoUrl, fileUrl: gift.photoUrl } : undefined
      let foryouCode = metadata.foryouCode || ''
      let foryouAlert = ''
      if (isGift && !foryouCode) {
        try {
          const range = forYouRangeForItems(items)
          const next = nextFreeForYouCode(await listUsedForYouCodes(), range)
          if (!next) {
            foryouAlert = `\n⚠️ <b>SIN STICKERS FOR YOU</b> en el rango ${range === 'large' ? '3001–3200 (grande)' : '2000–2300 (pequeña)'}: reimprimir y asignar uno a mano`
          } else if (await reserveForYouCode(next, paymentIntent.id, giftContent)) {
            await stripe.paymentIntents.update(paymentIntent.id, { metadata: { foryouCode: next } })
            foryouCode = next
          } else {
            foryouAlert = `\n⚠️ No se pudo reservar el sticker ${next} en Notion: asignarlo a mano`
          }
        } catch (e) {
          console.error('Error asignando código For You:', e)
          foryouAlert = '\n⚠️ Error asignando el sticker For You: asignarlo a mano'
        }
      }

      // Regalo: si el cliente lo marcó, hay que pegar el sticker con su código
      const giftParts = gift ? [gift.message && 'texto', gift.videoUrl && 'vídeo', gift.photoUrl && 'foto'].filter(Boolean).join(' · ') : ''
      const giftStatus = gift
        ? `\n✅ Mensaje ya creado en el checkout: ${giftParts}${foryouAlert ? ' (está en la metadata del pago en Stripe)' : ''}`
        : '\n✉️ Sin mensaje todavía: le llega el enlace por email'
      const giftBlock = isGift
        ? `\n🎁 <b>MENSAJE PERSONAL</b>${foryouCode ? `\n👉 Pegar sticker <code>${foryouCode}</code> → https://emilialab.com/foryou/${foryouCode}` : ''}${foryouAlert}${giftStatus}\n🧡 Für: ${metadata.recipientIsCompany === 'yes' ? '🏢 Firma: ' : ''}${tg('recipientName') || '—'}${metadata.recipientPhone ? ` · Tel: ${tg('recipientPhone')}` : ''}\n`
        : ''

      // Enviar notificación por Telegram
      const telegramMessage = `
🎉 <b>NUEVO PEDIDO RECIBIDO</b>
${giftBlock}
💰 <b>Total:</b> CHF ${amount.toFixed(2)}

👤 <b>Cliente:</b>
${tg('customerName') || 'N/A'}
${tg('customerEmail') || 'N/A'}
📱 ${tg('customerPhone') || 'N/A'}${wantsNewsletter ? '\n📰 Quiere recibir el newsletter' : ''}

📍 <b>Dirección de Entrega:</b>
${tg('address')}
${tg('postalCode')} ${tg('city')}${deliveryNote ? `\n📝 <b>Nota:</b> ${escapeHtml(deliveryNote)}` : ''}

📅 <b>Entrega:</b>
Fecha: ${metadata.deliveryDate || 'N/A'}
Hora: ${metadata.deliveryTime || 'N/A'}

📦 <b>Productos:</b>
${productsText}

🆔 <b>ID de Pago:</b> ${paymentIntent.id}
      `.trim()

      await sendTelegramMessage(telegramMessage)

      // Email al cliente con React Email
      const customerEmailHtml = await render(
        OrderConfirmationEmail({
          customerName: metadata.customerName || 'Kunde',
          orderId: paymentIntent.id,
          amount,
          items,
          address: metadata.address || '',
          city: metadata.city || '',
          postalCode: metadata.postalCode || '',
          deliveryDate: metadata.deliveryDate || '',
          deliveryTime: metadata.deliveryTime || '',
          foryouEditUrl: foryouCode ? forYouEditUrl(foryouCode, paymentIntent.id) : undefined,
          foryouReady: Boolean(foryouCode && gift),
          deliveryNote,
        })
      )

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'info@emilialab.com',
        to: metadata.customerEmail || '',
        subject: 'Vielen Dank für Ihre Bestellung - Emilia Cheesecake',
        html: customerEmailHtml,
      })

      // Email a ti (el dueño) con React Email
      const adminEmailHtml = await render(
        AdminNotificationEmail({
          customerName: metadata.customerName || 'N/A',
          customerEmail: metadata.customerEmail || 'N/A',
          phone: metadata.customerPhone || '',
          orderId: paymentIntent.id,
          amount,
          paymentMethod: paymentIntent.payment_method_types.join(', '),
          items,
          address: metadata.address || '',
          city: metadata.city || '',
          postalCode: metadata.postalCode || '',
          recipientName: metadata.recipientName || '',
          recipientIsCompany: metadata.recipientIsCompany === 'yes',
          recipientPhone: metadata.recipientPhone || '',
          deliveryDate: metadata.deliveryDate || '',
          deliveryTime: metadata.deliveryTime || '',
          deliveryNote,
          newsletter: wantsNewsletter,
        })
      )

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'info@emilialab.com',
        to: process.env.EMAIL_TO || 'info@emilialab.com',
        subject: `🎉 Neue Bestellung - ${metadata.customerName || 'Kunde'}`,
        html: adminEmailHtml,
      })

      console.log('✅ Emails enviados correctamente')

      // Meta CAPI: Purchase (server-side, deduplicates with browser pixel via eventId).
      // Not sent when the buyer declined tracking in the cookie banner.
      if (metadata.trackingConsent !== 'denied') {
        const eventId = `purchase-${paymentIntent.id}`
        await sendMetaCAPI('Purchase', eventId, amount, metadata.customerEmail)
      }

      // Crear pedido en Notion (calendario móvil)
      await createOrderInNotion({
        paymentIntentId: paymentIntent.id,
        foryouCode,
        customerName: metadata.customerName || '',
        customerEmail: metadata.customerEmail || '',
        customerPhone: metadata.customerPhone || '',
        address: metadata.address || '',
        postalCode: metadata.postalCode || '',
        city: metadata.city || '',
        recipientName: metadata.recipientName || '',
        recipientIsCompany: metadata.recipientIsCompany === 'yes',
        recipientPhone: metadata.recipientPhone || '',
        deliveryDate: metadata.deliveryDate || '',
        deliveryTime: metadata.deliveryTime || '',
        deliveryNote,
        amount,
        items,
      })
    } catch (error) {
      console.error('Error enviando emails:', error)
    }
  }

  return NextResponse.json({ received: true })
}
