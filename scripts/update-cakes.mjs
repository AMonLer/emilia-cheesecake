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

console.log('📥 Leyendo pedidos de Notion y Stripe...\n')

// Build map Stripe ID -> items from Stripe
const piItems = new Map()
let startingAfter
while (true) {
  const page = await stripe.paymentIntents.list({
    limit: 100,
    ...(startingAfter ? { starting_after: startingAfter } : {}),
  })
  for (const pi of page.data) {
    if (pi.status !== 'succeeded') continue
    let items = []
    try {
      if (pi.metadata?.items) items = JSON.parse(pi.metadata.items)
    } catch {}
    piItems.set(pi.id, items)
  }
  if (!page.has_more) break
  startingAfter = page.data[page.data.length - 1]?.id
  if (!startingAfter) break
}

// Iterate Notion rows, update Cakes property
let cursor
let updated = 0
let skipped = 0
while (true) {
  const res = await notion.dataSources.query({
    data_source_id: dataSourceId,
    start_cursor: cursor,
    page_size: 100,
  })
  for (const row of res.results) {
    const stripeId = row.properties?.['Stripe ID']?.rich_text?.[0]?.plain_text
    if (!stripeId || !piItems.has(stripeId)) {
      skipped++
      continue
    }
    const items = piItems.get(stripeId)
    const cakeTags = Array.from(
      new Set(
        items
          .filter((i) => i.name)
          .map((i) => (i.size ? `${i.name} ${i.size}` : i.name)),
      ),
    )
    await notion.pages.update({
      page_id: row.id,
      properties: {
        Cakes: { multi_select: cakeTags.map((name) => ({ name })) },
      },
    })
    updated++
    const title = row.properties?.Order?.title?.[0]?.plain_text || stripeId
    console.log(`   ✅ ${title} → [${cakeTags.join(', ')}]`)
  }
  if (!res.has_more) break
  cursor = res.next_cursor
}

console.log(`\n🏁 Actualizados ${updated} pedidos, ${skipped} saltados (sin Stripe ID en metadata live).`)
