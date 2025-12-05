import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json()

    // Validar campos requeridos
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Enviar email de contacto a info@emilialab.com
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'info@emilialab.com',
      to: process.env.EMAIL_TO || 'info@emilialab.com',
      replyTo: email,
      subject: subject ? `Kontaktformular: ${subject}` : 'Neue Kontaktanfrage',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #651A1A; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #F5E6D3; font-size: 28px; margin: 0; font-family: 'Playfair Display', serif;">Neue Kontaktanfrage</h1>
          </div>

          <div style="background-color: #FAF9F6; padding: 40px; border-radius: 0 0 8px 8px;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #651A1A; font-size: 20px; margin-top: 0;">Kontaktinformationen</h2>

              <div style="margin: 20px 0;">
                <p style="margin: 10px 0; color: #333;">
                  <strong style="color: #651A1A;">Name:</strong><br/>
                  ${name}
                </p>
                <p style="margin: 10px 0; color: #333;">
                  <strong style="color: #651A1A;">E-Mail:</strong><br/>
                  <a href="mailto:${email}" style="color: #651A1A;">${email}</a>
                </p>
                ${subject ? `
                  <p style="margin: 10px 0; color: #333;">
                    <strong style="color: #651A1A;">Betreff:</strong><br/>
                    ${subject}
                  </p>
                ` : ''}
              </div>

              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

              <div>
                <p style="margin: 10px 0; color: #651A1A; font-weight: bold;">Nachricht:</p>
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 4px; border-left: 4px solid #651A1A;">
                  <p style="margin: 0; color: #333; white-space: pre-wrap; line-height: 1.6;">${message}</p>
                </div>
              </div>
            </div>

            <div style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
              <p>Gesendet am ${new Date().toLocaleString('de-CH')}</p>
              <p>Von der Emilia Cheesecake Website</p>
            </div>
          </div>
        </div>
      `,
    })

    console.log(`✅ Contact form submitted by: ${name} (${email})`)

    return NextResponse.json({
      success: true,
      message: 'Kontaktformular erfolgreich gesendet'
    })

  } catch (error: any) {
    console.error('Error sending contact form:', error)
    return NextResponse.json(
      { error: 'Fehler beim Senden des Kontaktformulars' },
      { status: 500 }
    )
  }
}
