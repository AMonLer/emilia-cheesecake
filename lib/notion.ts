import { Client } from '@notionhq/client'

const notion = process.env.NOTION_TOKEN?.trim()
  ? new Client({ auth: process.env.NOTION_TOKEN.trim() })
  : null
// NOTION_DATABASE_ID holds the data_source_id (Notion API 2025+)
const dataSourceId = process.env.NOTION_DATABASE_ID?.trim()
// Separate database for "For You" personal messages (its own data_source_id)
const foryouDataSourceId = process.env.NOTION_FORYOU_DB_ID?.trim()

export type OrderForNotion = {
  paymentIntentId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  address: string
  postalCode: string
  city: string
  recipientName?: string
  recipientIsCompany?: boolean
  recipientPhone?: string
  foryouCode?: string
  deliveryDate: string // "dd.mm.yyyy" from toLocaleDateString('de-CH')
  deliveryTime: string // "HH:MM - HH:MM"
  deliveryNote?: string
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
  const fullAddress = [
    order.address,
    `${order.postalCode} ${order.city}`.trim(),
    order.recipientName
      ? `Geschenk für ${order.recipientIsCompany ? 'Firma ' : ''}${order.recipientName}${order.recipientPhone ? ` · Tel. ${order.recipientPhone}` : ''}`
      : '',
    order.deliveryNote ? `Hinweis: ${order.deliveryNote}` : '',
  ]
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
        ...(order.foryouCode ? {
          'For You Code': { rich_text: [{ text: { content: order.foryouCode } }] },
          'For You URL': { url: `https://emilialab.com/foryou/${order.foryouCode}` },
        } : {}),
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
  paymentIntentId?: string
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
    ...(rec.paymentIntentId ? { 'Stripe ID': { rich_text: [{ text: { content: rec.paymentIntentId } }] } } : {}),
  }

  try {
    const existingId = await findForYouPageId(rec.code)
    if (existingId) {
      await notion.pages.update({ page_id: existingId, properties })
    } else {
      await notion.pages.create({
        parent: { type: 'data_source_id', data_source_id: foryouDataSourceId } as any,
        properties: { ...properties, Status: { select: { name: 'New' } } },
      })
    }
    console.log('✅ Mensaje For You guardado en Notion')
    return true
  } catch (err) {
    console.error('Error guardando mensaje For You en Notion:', err)
    return false
  }
}

// strict: throw on Notion errors instead of answering "no such code".
export async function getForYouMessage(code: string, strict = false): Promise<ForYouMessage | null> {
  if (!notion || !foryouDataSourceId) return null
  try {
    const res = await (notion as any).dataSources.query({
      data_source_id: foryouDataSourceId,
      filter: { property: 'Code', title: { equals: code } },
      page_size: 1,
    })
    const page = res.results[0]
    return page ? forYouMessageFromPage(page, code) : null
  } catch (err) {
    console.error('Error leyendo mensaje For You de Notion:', err)
    if (strict) throw err
    return null
  }
}

function forYouMessageFromPage(page: any, code?: string): ForYouMessage {
  const props = page.properties
  const text = (prop: any) => (prop?.rich_text || prop?.title || []).map((t: any) => t.plain_text).join('')
  return {
    code: code ?? text(props.Code).trim(),
    message: text(props.Message),
    videoUrl: props['Video URL']?.url || '',
    fileUrl: props['File URL']?.url || '',
    fileName: text(props['File Name']),
    paymentIntentId: text(props['Stripe ID']).trim(),
  }
}

/** Every code handed out, with its message (empty if the buyer has not written one yet). */
export async function listForYouMessages(): Promise<ForYouMessage[]> {
  const messages: ForYouMessage[] = []
  if (!notion || !foryouDataSourceId) return messages
  let cursor: string | undefined
  do {
    const res = await (notion as any).dataSources.query({
      data_source_id: foryouDataSourceId,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    })
    for (const page of res.results) messages.push(forYouMessageFromPage(page))
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined
  } while (cursor)
  return messages
}

/** Todos los códigos de sticker ya entregados (haya mensaje grabado o solo reserva). */
export async function listUsedForYouCodes(): Promise<Set<string>> {
  const used = new Set<string>()
  if (!notion || !foryouDataSourceId) return used
  try {
    let cursor: string | undefined
    do {
      const res = await (notion as any).dataSources.query({
        data_source_id: foryouDataSourceId,
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      })
      for (const page of res.results) {
        const title = page.properties?.Code?.title?.[0]?.plain_text
        if (title) used.add(String(title).trim())
      }
      cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined
    } while (cursor)
  } catch (err) {
    console.error('Error listando códigos For You usados:', err)
  }
  return used
}

/**
 * Reserva un código de sticker nada más cobrarse el pedido, para no entregarlo
 * dos veces. La fila queda con Status "Assigned"; si el cliente creó el mensaje
 * en el checkout ya lleva el contenido, y si no, saveForYouMessage la encuentra
 * por código y la actualiza cuando lo grabe.
 */
export async function reserveForYouCode(
  code: string,
  paymentIntentId: string,
  content?: Pick<ForYouMessage, 'message' | 'videoUrl' | 'fileUrl'>,
): Promise<boolean> {
  if (!notion || !foryouDataSourceId) {
    console.warn('Notion For You no configurado, saltando')
    return false
  }
  try {
    await notion.pages.create({
      parent: { type: 'data_source_id', data_source_id: foryouDataSourceId } as any,
      properties: {
        Code: { title: [{ text: { content: code } }] },
        Status: { select: { name: 'Assigned' } },
        ...(paymentIntentId ? { 'Stripe ID': { rich_text: [{ text: { content: paymentIntentId } }] } } : {}),
        // Made in the checkout, before paying: one write, so never a second row for the code.
        ...(content?.message ? { Message: { rich_text: [{ text: { content: content.message } }] } } : {}),
        ...(content?.videoUrl ? { 'Video URL': { url: content.videoUrl } } : {}),
        ...(content?.fileUrl ? { 'File URL': { url: content.fileUrl } } : {}),
      },
    })
    return true
  } catch (err) {
    console.error('Error reservando código For You en Notion:', err)
    return false
  }
}
