import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import OrderConfirmationEmail from '@/emails/OrderConfirmation'
import AdminNotificationEmail from '@/emails/AdminNotification'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia' as any,
})

const resend = new Resend(process.env.RESEND_API_KEY)

// Función para enviar mensaje por Telegram
async function sendTelegramMessage(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    console.warn('Telegram no configurado')
    return
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    })

    if (!response.ok) {
      console.error('Error enviando mensaje de Telegram:', await response.text())
    } else {
      console.log('✅ Mensaje de Telegram enviado')
    }
  } catch (error) {
    console.error('Error al enviar mensaje de Telegram:', error)
  }
}

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

      // Formatear productos para Telegram
      let productsText = 'Ver en Stripe'
      try {
        if (metadata.items) {
          const items = JSON.parse(metadata.items)
          productsText = items.map((item: any) =>
            `• ${item.name} (${item.size || 'N/A'}) x${item.quantity} - CHF ${(item.price * item.quantity).toFixed(2)}`
          ).join('\n')
        }
      } catch (e) {
        console.error('Error parseando items:', e)
      }

      // Enviar notificación por Telegram
      const telegramMessage = `
🎉 <b>NUEVO PEDIDO RECIBIDO</b>

💰 <b>Total:</b> CHF ${amount.toFixed(2)}

👤 <b>Cliente:</b>
${metadata.customerName || 'N/A'}
${metadata.customerEmail || 'N/A'}

📍 <b>Dirección de Entrega:</b>
${metadata.address || ''}
${metadata.postalCode || ''} ${metadata.city || ''}
${metadata.kanton || ''}

📅 <b>Entrega:</b>
Fecha: ${metadata.deliveryDate || 'N/A'}
Hora: ${metadata.deliveryTime || 'N/A'}

📦 <b>Productos:</b>
${productsText}

🆔 <b>ID de Pago:</b> ${paymentIntent.id}
      `.trim()

      await sendTelegramMessage(telegramMessage)

      // Parsear items del pedido
      let items: any[] = []
      try {
        if (metadata.items) {
          items = JSON.parse(metadata.items)
        }
      } catch (e) {
        console.error('Error parseando items:', e)
      }

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
          phone: metadata.phone,
          orderId: paymentIntent.id,
          amount,
          paymentMethod: paymentIntent.payment_method_types.join(', '),
          items,
          address: metadata.address || '',
          city: metadata.city || '',
          postalCode: metadata.postalCode || '',
          kanton: metadata.kanton || '',
          deliveryDate: metadata.deliveryDate || '',
          deliveryTime: metadata.deliveryTime || '',
        })
      )

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'info@emilialab.com',
        to: process.env.EMAIL_TO || 'info@emilialab.com',
        subject: `🎉 Nuevo Pedido - ${metadata.customerName || 'Cliente'}`,
        html: adminEmailHtml,
      })

      console.log('✅ Emails enviados correctamente')
    } catch (error) {
      console.error('Error enviando emails:', error)
    }
  }

  return NextResponse.json({ received: true })
}
