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
  Font,
} from '@react-email/components'

interface WelcomeEmailProps {
  email: string
}

export default function WelcomeEmail({
  email = 'kunde@example.com',
}: WelcomeEmailProps) {
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
      <Preview>Willkommen bei Emilia - Dein süsser Anfang</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>Emilia</Text>
            <Heading style={headerTitle}>
              Willkommen bei Emilia
            </Heading>
            <Text style={headerSubtitle}>
              Ein süsser Anfang
            </Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={greeting}>
              Liebe/r Käsekuchen-Liebhaber/in,
            </Text>

            <Text style={paragraph}>
              Vielen Dank, dass du dich für unseren Newsletter angemeldet hast!
              Wir freuen uns, dich in der Emilia-Familie willkommen zu heissen.
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
              Herzliche Grüsse,
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
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '0',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  maxWidth: '600px',
}

const header = {
  backgroundColor: '#682f2e',
  padding: '40px 30px',
  textAlign: 'center' as const,
}

const logoText = {
  fontFamily: '"Playfair Display", serif',
  fontSize: '48px',
  color: '#dec181',
  margin: '0 0 10px 0',
}

const headerTitle = {
  color: '#dec181',
  fontSize: '24px',
  fontWeight: 'normal',
  margin: '0 0 10px 0',
  fontFamily: '"Playfair Display", serif',
}

const headerSubtitle = {
  color: '#F5E6D3',
  fontSize: '16px',
  fontStyle: 'italic',
  margin: '0',
  opacity: 0.9,
}

const content = {
  padding: '40px 30px',
  backgroundColor: '#ffffff',
}

const greeting = {
  fontSize: '18px',
  color: '#333333',
  marginBottom: '20px',
  fontFamily: '"Playfair Display", serif',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#4a4a4a',
  marginBottom: '20px',
}

const discountBox = {
  backgroundColor: '#f9f9f9',
  border: '1px solid #dec181',
  borderRadius: '8px',
  padding: '30px',
  margin: '30px 0',
  textAlign: 'center' as const,
}

const discountTitle = {
  color: '#682f2e',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '0 0 15px 0',
  fontFamily: '"Playfair Display", serif',
}

const discountText = {
  fontSize: '16px',
  color: '#333333',
  margin: '10px 0',
}

const discountAmount = {
  fontSize: '32px',
  color: '#682f2e',
  display: 'block',
  fontWeight: 'bold',
  fontFamily: '"Playfair Display", serif',
  marginTop: '10px',
}

const discountCondition = {
  fontSize: '14px',
  color: '#666666',
  marginTop: '10px',
  marginBottom: '20px',
}

const discountNote = {
  fontSize: '13px',
  color: '#888888',
  lineHeight: '20px',
  marginTop: '15px',
}

const divider = {
  borderColor: '#dec181',
  borderWidth: '1px',
  margin: '20px 0',
  opacity: 0.5,
}

const benefitsList = {
  margin: '20px 0',
  backgroundColor: '#FAF9F6',
  padding: '20px',
  borderRadius: '8px',
}

const benefitItem = {
  fontSize: '15px',
  color: '#4a4a4a',
  marginBottom: '10px',
  paddingLeft: '10px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '40px 0',
}

const button = {
  backgroundColor: '#682f2e',
  color: '#ffffff',
  padding: '16px 40px',
  borderRadius: '4px',
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
  fontFamily: '"Playfair Display", serif',
}

const footer = {
  padding: '30px',
  textAlign: 'center' as const,
  backgroundColor: '#f5f5f5',
}

const footerText = {
  fontSize: '12px',
  color: '#888888',
  lineHeight: '20px',
  marginBottom: '10px',
}

const footerDivider = {
  borderColor: '#e0e0e0',
  margin: '20px 0',
}

const footerLinks = {
  fontSize: '12px',
  color: '#666666',
}

const footerLink = {
  color: '#682f2e',
  textDecoration: 'underline',
}
