import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Link,
} from '@react-email/components'

interface WelcomeEmailProps {
  email: string
}

export default function WelcomeEmail({
  email = 'kunde@example.com',
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Willkommen bei Emilia - Dein süßer Anfang</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>
              Willkommen bei Emilia
            </Heading>
            <Text style={headerSubtitle}>
              Ein süßer Anfang
            </Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={greeting}>
              Liebe/r Käsekuchen-Liebhaber/in,
            </Text>

            <Text style={paragraph}>
              Vielen Dank, dass du dich für unseren Newsletter angemeldet hast!
              Wir freuen uns, dich in der Emilia-Familie willkommen zu heißen.
            </Text>

            {/* Discount Box */}
            <Section style={discountBox}>
              <Heading as="h2" style={discountTitle}>
                🎉 Dein exklusiver Willkommensrabatt
              </Heading>
              <Text style={discountText}>
                <strong style={discountAmount}>15% Rabatt</strong>
              </Text>
              <Text style={discountCondition}>
                auf deine erste Bestellung ab 120 CHF
              </Text>
              <Hr style={divider} />
              <Text style={discountNote}>
                Der Rabatt wird automatisch an der Kasse angewendet,
                wenn dein Warenkorb 120 CHF oder mehr beträgt.
              </Text>
            </Section>

            <Text style={paragraph}>
              Als Newsletter-Abonnent erhältst du:
            </Text>

            <Section style={benefitsList}>
              <Text style={benefitItem}>
                ✓ Exklusive Rabatte und Sonderangebote
              </Text>
              <Text style={benefitItem}>
                ✓ Früher Zugang zu neuen Produkten
              </Text>
              <Text style={benefitItem}>
                ✓ Saisonale Rezepte und Tipps
              </Text>
              <Text style={benefitItem}>
                ✓ Einladungen zu besonderen Events
              </Text>
            </Section>

            <Text style={paragraph}>
              Entdecke jetzt unsere handgemachten baskischen Käsekuchen
              und finde deinen Favoriten!
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Link href="https://www.emilialab.com/bestellen" style={button}>
                Jetzt Bestellen
              </Link>
            </Section>

            <Text style={paragraph}>
              Wenn du Fragen hast, zögere nicht, uns zu kontaktieren.
              Wir sind für dich da!
            </Text>

            <Text style={signature}>
              Herzliche Grüße,
              <br />
              <strong>Das Emilia-Team</strong>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Du erhältst diese E-Mail, weil du dich auf emilialab.com
              für unseren Newsletter angemeldet hast.
            </Text>
            <Hr style={footerDivider} />
            <Text style={footerText}>
              © {new Date().getFullYear()} Emilia Cheesecake. Alle Rechte vorbehalten.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://www.emilialab.com" style={footerLink}>
                Website
              </Link>
              {' • '}
              <Link href="mailto:info@emilialab.com" style={footerLink}>
                Kontakt
              </Link>
              {' • '}
              <Link href="https://www.emilialab.com/uber-uns" style={footerLink}>
                Über uns
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0',
  marginBottom: '64px',
}

const header = {
  backgroundColor: '#651A1A',
  padding: '40px 30px',
  textAlign: 'center' as const,
}

const headerTitle = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
}

const headerSubtitle = {
  color: '#F5E6D3',
  fontSize: '18px',
  fontStyle: 'italic',
  margin: '0',
}

const content = {
  padding: '40px 30px',
  backgroundColor: '#FAF9F6',
}

const greeting = {
  fontSize: '18px',
  color: '#333333',
  marginBottom: '20px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#333333',
  marginBottom: '20px',
}

const discountBox = {
  backgroundColor: '#ffffff',
  border: '3px solid #651A1A',
  borderRadius: '12px',
  padding: '30px',
  margin: '30px 0',
  textAlign: 'center' as const,
}

const discountTitle = {
  color: '#651A1A',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 20px 0',
}

const discountText = {
  fontSize: '16px',
  color: '#333333',
  margin: '10px 0',
}

const discountAmount = {
  fontSize: '36px',
  color: '#651A1A',
  display: 'block',
  fontWeight: 'bold',
}

const discountCondition = {
  fontSize: '14px',
  color: '#666666',
  marginTop: '10px',
  marginBottom: '20px',
}

const discountNote = {
  fontSize: '13px',
  color: '#666666',
  lineHeight: '20px',
  marginTop: '15px',
}

const divider = {
  borderColor: '#651A1A',
  borderWidth: '1px',
  margin: '20px 0',
}

const benefitsList = {
  margin: '20px 0',
}

const benefitItem = {
  fontSize: '15px',
  color: '#333333',
  marginBottom: '10px',
  paddingLeft: '10px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '40px 0',
}

const button = {
  backgroundColor: '#651A1A',
  color: '#ffffff',
  padding: '16px 40px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: 'bold',
  display: 'inline-block',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
}

const signature = {
  fontSize: '16px',
  color: '#333333',
  marginTop: '40px',
  lineHeight: '26px',
}

const footer = {
  padding: '30px',
  textAlign: 'center' as const,
  backgroundColor: '#f6f9fc',
}

const footerText = {
  fontSize: '12px',
  color: '#666666',
  lineHeight: '20px',
  marginBottom: '10px',
}

const footerDivider = {
  borderColor: '#dddddd',
  margin: '20px 0',
}

const footerLinks = {
  fontSize: '12px',
  color: '#666666',
}

const footerLink = {
  color: '#651A1A',
  textDecoration: 'underline',
}
