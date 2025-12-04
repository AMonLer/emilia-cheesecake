import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import WelcomeEmail from '@/emails/WelcomeEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    // Validar email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Renderizar el email de bienvenida
    const welcomeEmailHtml = await render(
      WelcomeEmail({
        email,
      })
    )

    // Enviar email de bienvenida al suscriptor
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'info@emilialab.com',
      to: email,
      subject: 'Willkommen bei Emilia - Dein süßer Anfang 🎉',
      html: welcomeEmailHtml,
    })

    // Enviar notificación al admin sobre la nueva suscripción
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'info@emilialab.com',
      to: process.env.EMAIL_TO || 'info@emilialab.com',
      subject: `Nueva suscripción al newsletter - ${email}`,
      html: `
        <h2>Nueva suscripción al newsletter</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('de-CH')}</p>
        <p><strong>Fuente:</strong> Pop-up de bienvenida</p>
      `,
    })

    console.log(`✅ Newsletter subscription: ${email}`)

    return NextResponse.json({
      success: true,
      message: 'Suscripción exitosa'
    })

  } catch (error: any) {
    console.error('Error en suscripción newsletter:', error)
    return NextResponse.json(
      { error: 'Error al procesar la suscripción' },
      { status: 500 }
    )
  }
}
