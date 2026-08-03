import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getSession } from '@/lib/admin-auth'
import { render } from '@react-email/render'
import FeedbackEmail, { feedbackEmailText } from '@/emails/FeedbackEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

const fromAddress = process.env.EMAIL_FROM || 'info@emilialab.com'
const FROM = fromAddress.includes('<') ? fromAddress : `Emilia <${fromAddress}>`

export async function POST() {
  const session = getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const html = await render(FeedbackEmail({ customerName: 'Adrian' }))

  const { error: resendError } = await resend.emails.send({
    from: FROM,
    to: 'adrianmonjelerin@gmail.com',
    replyTo: 'info@emilialab.com',
    subject: '[TEST] Wie hat es Ihnen geschmeckt?',
    html,
    text: feedbackEmailText('Adrian'),
  })

  if (resendError) {
    return NextResponse.json({ error: resendError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
