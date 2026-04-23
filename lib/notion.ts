import { Client } from '@notionhq/client'

const notion = process.env.NOTION_TOKEN
  ? new Client({ auth: process.env.NOTION_TOKEN })
  : null
// NOTION_DATABASE_ID holds the data_source_id (Notion API 2025+)
const dataSourceId = process.env.NOTION_DATABASE_ID

export type OrderForNotion = {
  paymentIntentId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  address: string
  postalCode: string
  city: string
  kanton: string
  deliveryDate: string // "dd.mm.yyyy" from toLocaleDateString('de-CH')
  deliveryTime: string // "HH:MM - HH:MM"
  amount: number
  items: Array<{ name: string; size?: string; quantity: number; price: number }>
}

function formatCakeTag(name: string, size?: string): string {
  if (size === '8-10') return `${name.toUpperCase()} GRANDE`
  if (size === '2-3') return `${name.toLowerCase()} pequeño`
  return size ? `${name} ${size}` : name
}

function parseDeliveryDateTime(deliveryDate: string, deliveryTime: string) {
  const [d, m, y] = deliveryDate.split('.')
  if (!d || !m || !y) return null
  const [startRaw, endRaw] = deliveryTime.split('-').map((s) => s.trim())
  const day = d.padStart(2, '0')
  const month = m.padStart(2, '0')
  const start = `${y}-${month}-${day}T${startRaw || '09:00'}:00`
  const end = endRaw ? `${y}-${month}-${day}T${endRaw}:00` : undefined
  return { start, end }
}

export async function createOrderInNotion(order: OrderForNotion) {
  if (!notion || !dataSourceId) {
    console.warn('Notion no configurado, saltando')
    return
  }

  const date = parseDeliveryDateTime(order.deliveryDate, order.deliveryTime)
  const productsText = order.items
    .map(
      (i) =>
        `• ${i.name}${i.size ? ` (${i.size})` : ''} x${i.quantity} — CHF ${(i.price * i.quantity).toFixed(2)}`,
    )
    .join('\n')
  const cakeTags = Array.from(
    new Set(order.items.filter((i) => i.name).map((i) => formatCakeTag(i.name, i.size))),
  )
  const fullAddress = [order.address, `${order.postalCode} ${order.city}`.trim(), order.kanton]
    .filter(Boolean)
    .join(', ')

  try {
    await notion.pages.create({
      parent: { type: 'data_source_id', data_source_id: dataSourceId } as any,
      properties: {
        Order: {
          title: [
            {
              text: {
                content: `${order.customerName || 'Customer'} — CHF ${order.amount.toFixed(2)}`,
              },
            },
          ],
        },
        'Delivery Date': date
          ? { date: { start: date.start, end: date.end, time_zone: 'Europe/Zurich' } }
          : { date: null },
        Customer: {
          rich_text: [{ text: { content: order.customerName || '' } }],
        },
        Email: { email: order.customerEmail || null },
        Phone: { phone_number: order.customerPhone || null },
        Address: {
          rich_text: [{ text: { content: fullAddress } }],
        },
        Products: {
          rich_text: [{ text: { content: productsText } }],
        },
        Total: { number: order.amount },
        'Stripe ID': {
          rich_text: [{ text: { content: order.paymentIntentId } }],
        },
        Cakes: {
          multi_select: cakeTags.map((name) => ({ name })),
        },
      },
    })
    console.log('✅ Pedido creado en Notion')
  } catch (err) {
    console.error('Error creando pedido en Notion:', err)
  }
}
