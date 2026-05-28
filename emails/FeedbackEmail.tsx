import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Font,
} from '@react-email/components'
import { germanGreeting, detectGender } from '@/lib/utils'

interface FeedbackEmailProps {
  customerName: string
  gender?: 'male' | 'female'
}

export default function FeedbackEmail({ customerName = 'Kunde', gender }: FeedbackEmailProps) {
  const resolvedGender = gender ?? detectGender(customerName)
  const greeting = germanGreeting(customerName, resolvedGender)

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Playfair Display"
          fallbackFontFamily="serif"
          webFont={{
            url: 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Wie hat Ihnen Ihr Emilia Cheesecake geschmeckt? 🍰</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>Emilia</Text>
          </Section>

          <Section style={content}>
            <Heading style={heading}>Wie hat es Ihnen geschmeckt?</Heading>
            <Text style={paragraph}>{greeting},</Text>
            <Text style={paragraph}>
              wir hoffen, dass Ihnen Ihr Emilia Cheesecake gut geschmeckt hat! ❤️
            </Text>
            <Text style={paragraph}>
              Ihre Meinung bedeutet uns sehr viel. Es würde uns riesig freuen, wenn Sie sich
              kurz die Zeit nehmen und uns Feedback hinterlassen — das hilft uns, noch mehr
              Menschen glücklich zu machen.
            </Text>

            <Section style={buttonSection}>
              <Button href="https://tally.so/r/KY1yag" style={button}>
                Feedback hinterlassen
              </Button>
            </Section>

            <Text style={paragraphSmall}>
              Es dauert nur 1 Minute — und wir sind für jede Rückmeldung sehr dankbar!
            </Text>

            <Hr style={divider} />

            <Text style={signature}>
              Herzliche Grüsse,
              <br />
              <strong style={{ fontFamily: '"Playfair Display", serif' }}>Emilia</strong>
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Emilia Cheesecake · info@emilialab.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#FAF9F6',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  maxWidth: '560px',
}

const header = {
  backgroundColor: '#651A1A',
  padding: '36px 20px',
  textAlign: 'center' as const,
}

const logoText = {
  fontFamily: '"Playfair Display", serif',
  fontSize: '48px',
  color: '#dec181',
  margin: '0',
}

const content = {
  padding: '40px 44px',
}

const heading = {
  fontFamily: '"Playfair Display", serif',
  color: '#651A1A',
  fontSize: '26px',
  fontWeight: 'normal' as const,
  marginTop: '0',
  marginBottom: '24px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#4a4a4a',
  marginBottom: '16px',
}

const paragraphSmall = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#888',
  marginTop: '12px',
  marginBottom: '0',
  textAlign: 'center' as const,
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '28px 0 8px',
}

const button = {
  backgroundColor: '#651A1A',
  color: '#ffffff',
  fontSize: '16px',
  fontFamily: '"Playfair Display", serif',
  fontWeight: '400',
  textDecoration: 'none',
  padding: '14px 36px',
  borderRadius: '8px',
  display: 'inline-block',
  letterSpacing: '0.3px',
}

const divider = {
  borderColor: '#E6D5C0',
  margin: '28px 0',
}

const signature = {
  fontSize: '16px',
  color: '#651A1A',
  lineHeight: '28px',
}

const footer = {
  backgroundColor: '#FAF9F6',
  padding: '20px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#888',
  fontSize: '12px',
  margin: '0',
}
