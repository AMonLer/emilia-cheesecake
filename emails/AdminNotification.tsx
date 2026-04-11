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
} from '@react-email/components'

interface AdminNotificationEmailProps {
  customerName: string
  customerEmail: string
  phone?: string
  orderId: string
  amount: number
  paymentMethod: string
  items: Array<{
    name: string
    quantity: number
    price: number
    size?: string
  }>
  address: string
  city: string
  postalCode: string
  kanton: string
  deliveryDate: string
  deliveryTime: string
}

export default function AdminNotificationEmail({
  customerName = 'N/A',
  customerEmail = 'N/A',
  phone = 'N/A',
  orderId = 'pi_xxxxxxxxxxxxx',
  amount = 0,
  paymentMethod = 'card',
  items = [],
  address = '',
  city = '',
  postalCode = '',
  kanton = '',
  deliveryDate = '',
  deliveryTime = '',
}: AdminNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>🎉 Neue Bestellung - {customerName}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>🎉 Neue Bestellung erhalten</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            {/* Customer Info */}
            <Section style={infoBox}>
              <Heading as="h2" style={sectionTitle}>
                Kundeninformationen
              </Heading>
              <Text style={detailText}>
                <strong>Name:</strong> {customerName}
              </Text>
              <Text style={detailText}>
                <strong>E-Mail:</strong> {customerEmail}
              </Text>
              <Text style={detailText}>
                <strong>Telefon:</strong> {phone}
              </Text>
            </Section>

            {/* Delivery Address */}
            <Section style={infoBox}>
              <Heading as="h2" style={sectionTitle}>
                Lieferadresse
              </Heading>
              <Text style={addressText}>
                {address}
                <br />
                {postalCode} {city}
                <br />
                {kanton}
              </Text>
            </Section>

            {/* Delivery Details */}
            <Section style={infoBox}>
              <Heading as="h2" style={sectionTitle}>
                Lieferdetails
              </Heading>
              <Text style={detailText}>
                <strong>Datum:</strong> {deliveryDate}
              </Text>
              <Text style={detailText}>
                <strong>Uhrzeit:</strong> {deliveryTime}
              </Text>
            </Section>

            {/* Products */}
            <Section style={infoBox}>
              <Heading as="h2" style={sectionTitle}>
                Produkte
              </Heading>
              {items.map((item, index) => (
                <Section key={index} style={productRow}>
                  <Text style={productText}>
                    • <strong>{item.name}</strong>
                    {item.size && <span> ({item.size} Personen)</span>}
                    <br />
                    <span style={productDetails}>
                      Menge: {item.quantity} - CHF{' '}
                      {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </Text>
                </Section>
              ))}
              <Hr style={divider} />
              <Text style={totalText}>
                <strong>Gesamt: CHF {amount.toFixed(2)}</strong>
              </Text>
            </Section>

            {/* Payment Info */}
            <Section style={infoBox}>
              <Heading as="h2" style={sectionTitle}>
                Zahlung
              </Heading>
              <Text style={detailText}>
                <strong>Gesamt:</strong> CHF {amount.toFixed(2)}
              </Text>
              <Text style={detailText}>
                <strong>Methode:</strong> {paymentMethod}
              </Text>
              <Text style={detailText}>
                <strong>Zahlungs-ID:</strong> {orderId}
              </Text>
            </Section>

            {/* Action Note */}
            <Section style={actionBox}>
              <Text style={actionText}>
                ⚠️ <strong>Aktion erforderlich:</strong> Bestellung vorbereiten für{' '}
                {deliveryDate} zwischen {deliveryTime}
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Dies ist eine automatische E-Mail vom Bestellsystem.
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
  padding: '20px',
  textAlign: 'center' as const,
}

const headerTitle = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
}

const content = {
  padding: '20px',
}

const infoBox = {
  backgroundColor: '#f9f9f9',
  padding: '20px',
  margin: '15px 0',
  borderLeft: '4px solid #651A1A',
  borderRadius: '4px',
}

const sectionTitle = {
  color: '#651A1A',
  fontSize: '18px',
  fontWeight: 'bold',
  marginTop: '0',
  marginBottom: '15px',
}

const detailText = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#333333',
  marginBottom: '8px',
  marginTop: '0',
}

const addressText = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#333333',
  whiteSpace: 'pre-line' as const,
}

const productRow = {
  marginBottom: '12px',
}

const productText = {
  fontSize: '15px',
  color: '#333333',
  marginBottom: '8px',
  marginTop: '0',
}

const productDetails = {
  color: '#666666',
  fontSize: '14px',
}

const divider = {
  borderColor: '#651A1A',
  borderWidth: '2px',
  margin: '15px 0',
}

const totalText = {
  fontSize: '18px',
  color: '#651A1A',
  marginTop: '10px',
  marginBottom: '0',
}

const actionBox = {
  backgroundColor: '#fff3cd',
  border: '2px solid #ffc107',
  padding: '15px',
  borderRadius: '4px',
  margin: '20px 0',
}

const actionText = {
  fontSize: '15px',
  color: '#856404',
  marginBottom: '0',
  marginTop: '0',
}

const footer = {
  textAlign: 'center' as const,
  padding: '20px',
  borderTop: '1px solid #eeeeee',
}

const footerText = {
  color: '#666666',
  fontSize: '12px',
  marginTop: '0',
}
