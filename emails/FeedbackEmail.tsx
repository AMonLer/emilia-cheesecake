import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'
import { germanGreeting, detectGender } from '@/lib/utils'

interface FeedbackEmailProps {
  customerName: string
  gender?: 'male' | 'female'
}

const TALLY_URL = 'https://tally.so/r/KY1yag'

// Versión de texto plano: Gmail la usa para clasificar (y de paso mejora el
// spam score). Debe decir lo mismo que el HTML de abajo.
export function feedbackEmailText(customerName: string, gender?: 'male' | 'female'): string {
  const resolvedGender = gender ?? detectGender(customerName)
  const greeting = germanGreeting(customerName, resolvedGender)
  return `${greeting},

ich hoffe, Ihr Cheesecake ist gut angekommen — und hat Ihnen gut geschmeckt.

Ihr Feedback ist der beste Weg, Emilia noch besser zu machen. Wenn Sie mir eine Minute schenken, freue ich mich sehr über Ihre ehrliche Meinung:
${TALLY_URL}

Sie können auch einfach auf diese E-Mail antworten.

Herzliche Grüsse
Emilia

Emilia Cheesecake · Zürich`
}

// Carta personal 1:1 a propósito: sin banner de color ni botón (eso clasifica
// en "Promociones"), pero con membrete y serif para que se sienta Emilia.
export default function FeedbackEmail({ customerName = 'Kunde', gender }: FeedbackEmailProps) {
  const resolvedGender = gender ?? detectGender(customerName)
  const greeting = germanGreeting(customerName, resolvedGender)

  return (
    <Html>
      <Head />
      <Preview>Ihre Meinung zu Ihrem Emilia Cheesecake</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={letterhead}>Emilia</Text>
          <Hr style={rule} />
          <Text style={p}>{greeting},</Text>
          <Text style={p}>
            ich hoffe, Ihr Cheesecake ist gut angekommen — und hat Ihnen gut geschmeckt.
          </Text>
          <Text style={p}>
            Ihr Feedback ist der beste Weg, Emilia noch besser zu machen. Wenn Sie mir eine
            Minute schenken, freue ich mich sehr über Ihre ehrliche Meinung:{' '}
            <Link href={TALLY_URL} style={link}>
              tally.so/r/KY1yag
            </Link>
          </Text>
          <Text style={p}>
            Sie können auch einfach auf diese E-Mail antworten.
          </Text>
          <Text style={pLast}>
            Herzliche Grüsse
            <br />
            <span style={signatureName}>Emilia</span>
          </Text>
          <Hr style={rule} />
          <Text style={signoff}>Emilia Cheesecake · Zürich</Text>
        </Container>
      </Body>
    </Html>
  )
}

const serif = 'Georgia, "Times New Roman", serif'

const main = {
  backgroundColor: '#FAF9F6',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  padding: '32px 12px',
}

const container = {
  backgroundColor: '#ffffff',
  maxWidth: '560px',
  margin: '0 auto',
  padding: '40px 44px 32px',
  border: '1px solid #F0E6D8',
  borderRadius: '10px',
}

const letterhead = {
  fontFamily: serif,
  fontStyle: 'italic' as const,
  fontSize: '26px',
  color: '#651A1A',
  textAlign: 'center' as const,
  letterSpacing: '0.5px',
  margin: '0 0 20px',
}

const rule = {
  borderColor: '#E6D5C0',
  margin: '0 0 28px',
}

const p = {
  fontSize: '16px',
  lineHeight: '1.65',
  color: '#333333',
  margin: '0 0 16px',
}

const pLast = {
  ...p,
  margin: '24px 0 0',
}

const link = {
  color: '#651A1A',
  textDecoration: 'underline',
}

const signatureName = {
  fontFamily: serif,
  fontStyle: 'italic' as const,
  fontSize: '21px',
  color: '#651A1A',
}

const signoff = {
  fontSize: '12px',
  lineHeight: '1.5',
  color: '#999999',
  textAlign: 'center' as const,
  margin: '24px 0 0',
}
