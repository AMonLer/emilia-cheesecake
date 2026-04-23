import { Client } from '@notionhq/client'
import Stripe from 'stripe'
import { readFileSync } from 'fs'
import { resolve } from 'path'

try {
  const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
  for (const line of envFile.split('\n')) {
    const match = line.match(/^([A-Z_]+)=(.*)$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '')
    }
  }
} catch {}

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const dataSourceId = process.env.NOTION_DATABASE_ID
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
})

if (!process.env.NOTION_TOKEN || !dataSourceId || !process.env.STRIPE_SECRET_KEY) {
  console.error('❌ Falta alguna variable en .env.local (NOTION_TOKEN, NOTION_DATABASE_ID, STRIPE_SECRET_KEY)')
  process.exit(1)
}

function parseDeliveryDateTime(deliveryDate, deliveryTime) {
  if (!deliveryDate) return null
  const [d, m, y] = deliveryDate.split('.')
  if (!d || !m || !y) return null
  const [startRaw, endRaw] = (deliveryTime || '').split('-').map((s) => s.trim())
  const day = d.padStart(2, '0')
  const month = m.padStart(2, '0')
  const start = `${y}-${month}-${day}T${startRaw || '09:00'}:00`
  const end = endRaw ? `${y}-${month}-${day}T${endRaw}:00` : undefined
  return { start, end }
}

async function getExistingStripeIds() {
  const ids = new Set()
  let cursor
  while (true) {
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
      page_size: 100,
    })
    for (const row of res.results) {
      const stripeIdProp = row.properties?.['Stripe ID']?.rich_text?.[0]?.plain_text
      if (stripeIdProp) ids.add(stripeIdProp)
    }
    if (!res.has_more) break
    cursor = res.next_cursor
  }
  return ids
}

async function createInNotion(pi) {
  const metadata = pi.metadata || {}
  const amount = pi.amount / 100
  let items = []
  try {
    if (metadata.items) items = JSON.parse(metadata.items)
  } catch {}

  const date = parseDeliveryDateTime(metadata.deliveryDate, metadata.deliveryTime)
  const productsText = items
    .map(
      (i) =>
        `• ${i.name}${i.size ? ` (${i.size})` : ''} x${i.quantity} — CHF ${(i.price * i.quantity).toFixed(2)}`,
    )
    .join('\n')
  const fullAddress = [
    metadata.address,
    `${metadata.postalCode || ''} ${metadata.city || ''}`.trim(),
    metadata.kanton,
  ]
    .filter(Boolean)
    .join(', ')

  await notion.pages.create({
    parent: { type: 'data_source_id', data_source_id: dataSourceId },
    properties: {
      Order: {
        title: [
          {
            text: {
              content: `${metadata.customerName || 'Customer'} — CHF ${amount.toFixed(2)}`,
            },
          },
        ],
      },
      'Delivery Date': date
        ? { date: { start: date.start, end: date.end, time_zone: 'Europe/Zurich' } }
        : { date: null },
      Customer: { rich_text: [{ text: { content: metadata.customerName || '' } }] },
      Email: { email: metadata.customerEmail || null },
      Phone: { phone_number: metadata.customerPhone || null },
      Address: { rich_text: [{ text: { content: fullAddress } }] },
      Products: { rich_text: [{ text: { content: productsText } }] },
      Total: { number: amount },
      'Stripe ID': { rich_text: [{ text: { content: pi.id } }] },
    },
  })
}

console.log('📥 Leyendo Stripe IDs ya en Notion...')
const existing = await getExistingStripeIds()
console.log(`   Ya en Notion: ${existing.size}\n`)

console.log('📦 Listando pedidos de Stripe...')
let total = 0
let created = 0
let skipped = 0
let startingAfter

while (true) {
  const page = await stripe.paymentIntents.list({
    limit: 100,
    ...(startingAfter ? { starting_after: startingAfter } : {}),
  })

  for (const pi of page.data) {
    if (pi.status !== 'succeeded') continue
    total++
    if (existing.has(pi.id)) {
      skipped++
      continue
    }
    try {
      await createInNotion(pi)
      created++
      const when = new Date(pi.created * 1000).toISOString().slice(0, 10)
      console.log(`   ✅ [${when}] ${pi.metadata?.customerName || '(sin nombre)'} — CHF ${(pi.amount / 100).toFixed(2)}`)
    } catch (err) {
      console.error(`   ❌ ${pi.id}: ${err.message}`)
    }
  }

  if (!page.has_more) break
  startingAfter = page.data[page.data.length - 1]?.id
  if (!startingAfter) break
}

console.log(`\n🏁 Resumen: ${total} pedidos en Stripe, ${created} creados en Notion, ${skipped} ya existían.`)
