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
      <Preview>🎉 Nuevo Pedido - {customerName}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>🎉 Nuevo Pedido Recibido</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            {/* Customer Info */}
            <Section style={infoBox}>
              <Heading as="h2" style={sectionTitle}>
                Información del Cliente
              </Heading>
              <Text style={detailText}>
                <strong>Nombre:</strong> {customerName}
              </Text>
              <Text style={detailText}>
                <strong>Email:</strong> {customerEmail}
              </Text>
              <Text style={detailText}>
                <strong>Teléfono:</strong> {phone}
              </Text>
            </Section>

            {/* Delivery Address */}
            <Section style={infoBox}>
              <Heading as="h2" style={sectionTitle}>
                Dirección de Entrega
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
                Detalles de Entrega
              </Heading>
              <Text style={detailText}>
                <strong>Fecha:</strong> {deliveryDate}
              </Text>
              <Text style={detailText}>
                <strong>Hora:</strong> {deliveryTime}
              </Text>
            </Section>

            {/* Products */}
            <Section style={infoBox}>
              <Heading as="h2" style={sectionTitle}>
                Productos
              </Heading>
              {items.map((item, index) => (
                <Section key={index} style={productRow}>
                  <Text style={productText}>
                    • <strong>{item.name}</strong>
                    {item.size && <span> ({item.size} Personen)</span>}
                    <br />
                    <span style={productDetails}>
                      Cantidad: {item.quantity} - CHF{' '}
                      {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </Text>
                </Section>
              ))}
              <Hr style={divider} />
              <Text style={totalText}>
                <strong>Total: CHF {amount.toFixed(2)}</strong>
              </Text>
            </Section>

            {/* Payment Info */}
            <Section style={infoBox}>
              <Heading as="h2" style={sectionTitle}>
                Pago
              </Heading>
              <Text style={detailText}>
                <strong>Total:</strong> CHF {amount.toFixed(2)}
              </Text>
              <Text style={detailText}>
                <strong>Método:</strong> {paymentMethod}
              </Text>
              <Text style={detailText}>
                <strong>ID de Pago:</strong> {orderId}
              </Text>
            </Section>

            {/* Action Note */}
            <Section style={actionBox}>
              <Text style={actionText}>
                ⚠️ <strong>Acción requerida:</strong> Preparar pedido para{' '}
                {deliveryDate} entre {deliveryTime}
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Este es un email automático generado por el sistema de pedidos.
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
