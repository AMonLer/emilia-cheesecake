import OrderConfirmationEmail from '../../emails/OrderConfirmation'
import FeedbackEmail from '../../emails/FeedbackEmail'
import { render } from '@react-email/render'

export default async function PreviewEmailPage() {
  const [orderHtml, feedbackHtml] = await Promise.all([
    render(
      <OrderConfirmationEmail
        customerName="Adrian"
        orderId="12345"
        amount={45.0}
        items={[{ name: 'Classic Cheesecake', quantity: 1, price: 45.0, size: '6-8' }]}
        address="Musterstrasse 1"
        city="Zurich"
        postalCode="8000"
        deliveryDate="01.01.2025"
        deliveryTime="14:00 - 16:00"
      />,
      { pretty: true }
    ),
    render(<FeedbackEmail customerName="Adrian" />, { pretty: true }),
  ])

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 4 }}>Email Previews</h1>
      <p style={{ color: '#666', marginTop: 0, marginBottom: 40 }}>Visual preview of all email templates.</p>

      <h2 style={{ marginBottom: 12 }}>Feedback Email</h2>
      <div style={{ border: '1px solid #ccc', borderRadius: 8, overflow: 'hidden', marginBottom: 48 }}>
        <div style={{ background: '#eee', padding: '10px 20px', borderBottom: '1px solid #ccc', fontWeight: 'bold' }}>
          Preview
        </div>
        <iframe srcDoc={feedbackHtml} style={{ width: '100%', height: '700px', border: 'none', display: 'block' }} />
      </div>

      <h2 style={{ marginBottom: 12 }}>Order Confirmation Email</h2>
      <div style={{ border: '1px solid #ccc', borderRadius: 8, overflow: 'hidden', marginBottom: 40 }}>
        <div style={{ background: '#eee', padding: '10px 20px', borderBottom: '1px solid #ccc', fontWeight: 'bold' }}>
          Preview
        </div>
        <iframe srcDoc={orderHtml} style={{ width: '100%', height: '800px', border: 'none', display: 'block' }} />
      </div>
    </div>
  )
}
