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
} from '@react-email/components'

interface ForYouReminderEmailProps {
  customerFirstName: string
  deliveryDate: string
  editUrl: string
}

// Sent the day before delivery when a gift still has no message: otherwise the
// recipient scans the code on the cake and finds nothing personal behind it.
export default function ForYouReminderEmail({
  customerFirstName = '',
  deliveryDate = '',
  editUrl = 'https://www.emilialab.com',
}: ForYouReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Ihr Kuchen wird morgen geliefert – fehlt noch Ihre Botschaft?</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>Emilia</Text>
            <Heading style={headerTitle}>Fehlt noch Ihre Botschaft?</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>
              {customerFirstName ? `Hallo ${customerFirstName},` : 'Hallo,'}
            </Text>
            <Text style={paragraph}>
              Ihr Geschenk wird {deliveryDate ? `am ${deliveryDate}` : 'morgen'} geliefert. Beim
              Kuchen liegt ein Code, mit dem die beschenkte Person Ihre persönliche Botschaft
              öffnet – bisher ist dort aber noch nichts hinterlegt.
            </Text>
            <Text style={paragraph}>
              Mit dem Link unten fügen Sie in einer Minute eine Nachricht, ein Video oder ein Foto
              hinzu. Sie können sie bis zum Beginn der Lieferung ändern.
            </Text>
            <Section style={buttonRow}>
              <Button href={editUrl} style={button}>
                Botschaft erstellen
              </Button>
            </Section>
            <Text style={small}>
              Möchten Sie keine Botschaft hinzufügen? Dann ist nichts zu tun: Die beschenkte Person
              sieht einen kurzen Gruss von uns.
            </Text>
            <Text style={small}>
              Fragen? <a href="mailto:info@emilialab.com" style={link}>info@emilialab.com</a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
}

const header = {
  backgroundColor: '#682f2e',
  padding: '32px 24px',
  textAlign: 'center' as const,
}

const logoText = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#dec181',
  margin: '0 0 8px',
}

const headerTitle = {
  color: '#dec181',
  fontSize: '22px',
  fontWeight: 'normal',
  margin: '0',
}

const content = {
  padding: '32px 24px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#4a4a4a',
  margin: '0 0 16px',
}

const buttonRow = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const button = {
  backgroundColor: '#682f2e',
  color: '#ffffff',
  borderRadius: '999px',
  padding: '14px 28px',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  display: 'inline-block',
}

const small = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#888888',
  margin: '0 0 8px',
}

const link = {
  color: '#682f2e',
}
