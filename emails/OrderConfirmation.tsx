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
  Font,
  Button,
} from '@react-email/components'

interface OrderConfirmationEmailProps {
  customerName: string
  orderId: string
  amount: number
  items: Array<{
    name: string
    quantity: number
    price: number
    size?: string
  }>
  address: string
  city: string
  postalCode: string
  deliveryDate: string
  deliveryTime: string
  // Gift orders: signed link to create or change the For You message.
  foryouEditUrl?: string
  deliveryNote?: string
}

export default function OrderConfirmationEmail({
  customerName = 'Kunde',
  orderId = 'pi_xxxxxxxxxxxxx',
  amount = 0,
  items = [],
  address = '',
  city = '',
  postalCode = '',
  deliveryDate = '',
  deliveryTime = '',
  foryouEditUrl,
  deliveryNote = '',
}: OrderConfirmationEmailProps) {
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
      <Preview>Vielen Dank für Ihre Bestellung bei Emilia Cheesecake</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>Emilia</Text>
            <Heading style={headerTitle}>
              Vielen Dank für Ihre Bestellung!
            </Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={paragraph}>Lieber {customerName.split(' ')[0]},</Text>
            <Text style={paragraph}>
              Ihre Bestellung ist bestätigt. Wir backen Ihren Kuchen frisch für
              Ihren Liefertermin.
            </Text>

            {/* Order Details Box */}
            <Section style={orderDetailsBox}>
              <Heading as="h2" style={sectionTitle}>
                Bestelldetails
              </Heading>
              <Text style={detailText}>
                <strong>Bestellnummer:</strong> {orderId}
              </Text>

              {/* Products */}
              <Heading as="h3" style={subsectionTitle}>
                Ihre Produkte:
              </Heading>
              {items.map((item, index) => (
                <Section key={index} style={productRow}>
                  <Text style={productName}>
                    <strong>{item.name}</strong>
                    {item.size && (
                      <span style={productSize}> ({item.size} Personen)</span>
                    )}
                  </Text>
                  <Text style={productDetails}>
                    x{item.quantity} - CHF {(item.price * item.quantity).toFixed(2)}
                  </Text>
                </Section>
              ))}

              <Hr style={divider} />

              {/* Total */}
              <Text style={totalText}>
                <strong>Gesamtbetrag: CHF {amount.toFixed(2)}</strong>
              </Text>

              {/* Delivery Info */}
              <Heading as="h3" style={subsectionTitle}>
                Lieferinformationen:
              </Heading>
              <Text style={detailText}>
                <strong>Adresse:</strong>
                <br />
                {address}
                <br />
                {postalCode} {city}
              </Text>
              <Text style={detailText}>
                <strong>Lieferdatum:</strong> {deliveryDate}
              </Text>
              <Text style={detailText}>
                <strong>Lieferzeit:</strong> {deliveryTime}
              </Text>
              {deliveryNote && (
                <Text style={detailText}>
                  <strong>Hinweis für die Lieferung:</strong> {deliveryNote}
                </Text>
              )}
            </Section>

            {foryouEditUrl && (
              <Section style={foryouBox}>
                <Heading as="h2" style={foryouTitle}>
                  Ihre persönliche Botschaft
                </Heading>
                <Text style={foryouText}>
                  Fügen Sie Ihrem Geschenk ein Video, ein Foto oder eine Nachricht
                  hinzu. Die beschenkte Person öffnet sie über den Code beim Kuchen.
                  Sie können die Botschaft bis zum Beginn der Lieferung jederzeit
                  ändern.
                </Text>
                <Button href={foryouEditUrl} style={foryouButton}>
                  Botschaft erstellen
                </Button>
              </Section>
            )}

            <Text style={paragraph}>
              Ihre Bestellung wird frisch für Sie zubereitet und pünktlich
              geliefert.
            </Text>
            <Text style={paragraph}>
              Bei Fragen erreichen Sie uns unter{' '}
              <a href="mailto:info@emilialab.com" style={link}>
                info@emilialab.com
              </a>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Emilia Cheesecake. Alle Rechte
              vorbehalten.
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
  padding: '40px 20px',
  textAlign: 'center' as const,
}

const logoText = {
  fontFamily: '"Playfair Display", serif',
  fontSize: '48px',
  color: '#dec181',
  margin: '0 0 20px 0',
}

const headerTitle = {
  color: '#dec181',
  fontSize: '24px',
  fontWeight: 'normal',
  margin: '0',
  fontFamily: '"Playfair Display", serif',
}

const content = {
  padding: '40px',
  backgroundColor: '#ffffff',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#4a4a4a',
  marginBottom: '20px',
}

const orderDetailsBox = {
  backgroundColor: '#f9f9f9',
  padding: '30px',
  borderRadius: '4px',
  margin: '30px 0',
  border: '1px solid #eaeaea',
}

const sectionTitle = {
  color: '#682f2e',
  fontSize: '20px',
  fontWeight: 'bold',
  marginTop: '0',
  marginBottom: '20px',
  fontFamily: '"Playfair Display", serif',
}

const subsectionTitle = {
  color: '#682f2e',
  fontSize: '16px',
  fontWeight: 'bold',
  marginTop: '25px',
  marginBottom: '10px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const detailText = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#4a4a4a',
  marginBottom: '10px',
}

const productRow = {
  marginBottom: '15px',
  paddingBottom: '15px',
  borderBottom: '1px solid #eaeaea',
}

const productName = {
  fontSize: '16px',
  color: '#333333',
  marginBottom: '5px',
  marginTop: '0',
  fontWeight: '500',
}

const productSize = {
  color: '#666666',
  fontSize: '14px',
  fontStyle: 'italic',
}

const productDetails = {
  fontSize: '14px',
  color: '#666666',
  marginTop: '0',
}

const divider = {
  borderColor: '#eaeaea',
  borderWidth: '1px',
  margin: '20px 0',
}

const totalText = {
  fontSize: '20px',
  color: '#682f2e',
  marginTop: '10px',
  marginBottom: '20px',
  fontFamily: '"Playfair Display", serif',
  fontWeight: 'bold',
}

const link = {
  color: '#682f2e',
  textDecoration: 'underline',
}

const footer = {
  textAlign: 'center' as const,
  padding: '30px 20px',
  backgroundColor: '#f5f5f5',
}

const footerText = {
  color: '#888888',
  fontSize: '12px',
}

const foryouBox = {
  backgroundColor: '#682f2e',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const foryouTitle = {
  color: '#dec181',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 12px',
}

const foryouText = {
  color: '#f5e6d3',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 20px',
}

const foryouButton = {
  backgroundColor: '#dec181',
  color: '#682f2e',
  borderRadius: '999px',
  padding: '14px 28px',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  display: 'inline-block',
}
