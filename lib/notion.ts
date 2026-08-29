import { Client } from '@notionhq/client'

const notion = process.env.NOTION_TOKEN
  ? new Client({ auth: process.env.NOTION_TOKEN })
  : null
// NOTION_DATABASE_ID holds the data_source_id (Notion API 2025+)
const dataSourceId = process.env.NOTION_DATABASE_ID
// Separate database for "For You" personal messages (its own data_source_id)
const foryouDataSourceId = process.env.NOTION_FORYOU_DB_ID

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

// --- "For You" personal messages -----------------------------------------

export type ForYouMessage = {
  code: string
  message: string
  videoUrl?: string
  fileUrl?: string
  fileName?: string
}

async function findForYouPageId(code: string): Promise<string | null> {
  if (!notion || !foryouDataSourceId) return null
  const res = await (notion as any).dataSources.query({
    data_source_id: foryouDataSourceId,
    filter: { property: 'Code', title: { equals: code } },
    page_size: 1,
  })
  return res.results[0]?.id ?? null
}

/**
 * Creates or updates the personal message for a code. Re-submitting from the
 * same code overwrites the previous record instead of creating duplicates.
 */
export async function saveForYouMessage(rec: ForYouMessage): Promise<boolean> {
  if (!notion || !foryouDataSourceId) {
    console.warn('Notion For You no configurado, saltando')
    return false
  }

  const properties: Record<string, any> = {
    Code: { title: [{ text: { content: rec.code } }] },
    Message: { rich_text: [{ text: { content: rec.message || '' } }] },
    'Video URL': { url: rec.videoUrl || null },
    'File URL': { url: rec.fileUrl || null },
    'File Name': { rich_text: [{ text: { content: rec.fileName || '' } }] },
    Status: { select: { name: 'New' } },
  }

  try {
    const existingId = await findForYouPageId(rec.code)
    if (existingId) {
      await notion.pages.update({ page_id: existingId, properties })
    } else {
      await notion.pages.create({
        parent: { type: 'data_source_id', data_source_id: foryouDataSourceId } as any,
        properties,
      })
    }
    console.log('✅ Mensaje For You guardado en Notion')
    return true
  } catch (err) {
    console.error('Error guardando mensaje For You en Notion:', err)
    return false
  }
}

export async function getForYouMessage(code: string): Promise<ForYouMessage | null> {
  if (!notion || !foryouDataSourceId) return null
  try {
    const res = await (notion as any).dataSources.query({
      data_source_id: foryouDataSourceId,
      filter: { property: 'Code', title: { equals: code } },
      page_size: 1,
    })
    const page = res.results[0]
    if (!page) return null
    const props = page.properties
    return {
      code,
      message: props.Message?.rich_text?.[0]?.plain_text || '',
      videoUrl: props['Video URL']?.url || '',
      fileUrl: props['File URL']?.url || '',
      fileName: props['File Name']?.rich_text?.[0]?.plain_text || '',
    }
  } catch (err) {
    console.error('Error leyendo mensaje For You de Notion:', err)
    return null
  }
}
