import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Hr,
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
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Vielen Dank für Ihre Bestellung bei Emilia Cheesecake</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>
              Vielen Dank für Ihre Bestellung!
            </Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={paragraph}>Liebe/r {customerName},</Text>
            <Text style={paragraph}>
              Wir haben Ihre Bestellung erhalten und bereiten alles mit größter
              Sorgfalt in unserer Backstube vor.
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
            </Section>

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
  padding: '30px',
  textAlign: 'center' as const,
}

const headerTitle = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
}

const content = {
  padding: '30px',
  backgroundColor: '#F5E6D3',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#333333',
}

const orderDetailsBox = {
  backgroundColor: '#ffffff',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
}

const sectionTitle = {
  color: '#651A1A',
  fontSize: '22px',
  fontWeight: 'bold',
  marginTop: '0',
  marginBottom: '15px',
}

const subsectionTitle = {
  color: '#651A1A',
  fontSize: '18px',
  fontWeight: 'bold',
  marginTop: '20px',
  marginBottom: '10px',
}

const detailText = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#333333',
  marginBottom: '10px',
}

const productRow = {
  marginBottom: '15px',
  paddingBottom: '15px',
  borderBottom: '1px solid #eeeeee',
}

const productName = {
  fontSize: '15px',
  color: '#333333',
  marginBottom: '5px',
  marginTop: '0',
}

const productSize = {
  color: '#666666',
  fontSize: '14px',
}

const productDetails = {
  fontSize: '14px',
  color: '#666666',
  marginTop: '0',
}

const divider = {
  borderColor: '#651A1A',
  borderWidth: '2px',
  margin: '20px 0',
}

const totalText = {
  fontSize: '18px',
  color: '#333333',
  marginTop: '10px',
  marginBottom: '20px',
}

const link = {
  color: '#651A1A',
  textDecoration: 'underline',
}

const footer = {
  textAlign: 'center' as const,
  padding: '20px',
}

const footerText = {
  color: '#666666',
  fontSize: '12px',
}
