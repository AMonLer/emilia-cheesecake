import { Client } from '@notionhq/client'
import fs from 'fs'

function loadEnv() {
  const env = { ...process.env }
  if (fs.existsSync('.env.local')) {
    for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
      if (!line.includes('=') || line.trim().startsWith('#')) continue
      const i = line.indexOf('=')
      const key = line.slice(0, i).trim()
      const value = line.slice(i + 1).trim().replace(/^["']|["']$/g, '')
      if (!env[key]) env[key] = value
    }
  }
  if (!env.NOTION_TOKEN) {
    console.error('Missing NOTION_TOKEN')
    process.exit(1)
  }
  return env
}

const env = loadEnv()
const notion = new Client({ auth: env.NOTION_TOKEN })

const ORDERS_DS = '34ab6319-835a-8007-9751-000b353641f3'
const SPEND_DS = '5f898cc4-ec8b-40dd-b85a-c8f879356aa8'
const date = process.argv[2] || '2026-05-01'

const fixedDaily = [
  { source: 'Tiara Base', concept: 'Tiara base prorrateado', chf: 150 / 30.4375, category: 'Operations', type: 'Fixed (prorated)' },
  { source: 'Tiguan', concept: 'Tiguan prorrateado', chf: 63 / 30.4375, category: 'Logistics', type: 'Fixed (prorated)' },
  { source: 'Claude Pro', concept: 'Claude Pro prorrateado (20 USD * 0.83)', chf: (20 * 0.83) / 30.4375, category: 'Tools', type: 'Fixed (prorated)' },
  { source: 'Web Hosting', concept: 'Web hosting prorrateado (10 USD * 0.83)', chf: (10 * 0.83) / 30.4375, category: 'Tools', type: 'Fixed (prorated)' },
]

function chf(n) {
  return Math.round(n * 100) / 100
}

async function pullAll(ds) {
  const rows = []
  let cursor
  do {
    const resp = await notion.dataSources.query({ data_source_id: ds, page_size: 100, start_cursor: cursor })
    for (const p of resp.results) {
      if (!p.archived && !p.in_trash) rows.push(p)
    }
    cursor = resp.has_more ? resp.next_cursor : undefined
  } while (cursor)
  return rows
}

async function existingSpendRows(date) {
  const rows = await pullAll(SPEND_DS)
  return rows.filter((p) => p.properties?.Date?.date?.start === date)
}

async function writeRow(row) {
  await notion.pages.create({
    parent: { type: 'data_source_id', data_source_id: SPEND_DS },
    properties: {
      Concept: { title: [{ text: { content: `${row.concept} · ${date}` } }] },
      Date: { date: { start: date } },
      Source: { select: { name: row.source } },
      Category: { select: { name: row.category } },
      CHF: { number: chf(row.chf) },
      Type: { select: { name: row.type } },
      Notes: { rich_text: [{ text: { content: `Backfilled from Emilia Orders ${new Date().toISOString()}` } }] },
    },
  })
}

const existing = await existingSpendRows(date)
if (existing.length > 0) {
  console.log(`Skipped: ${date} already has ${existing.length} Daily Spend Log rows.`)
  process.exit(0)
}

const orders = await pullAll(ORDERS_DS)
const paidOrders = orders.filter((p) => {
  const created = p.created_time?.slice(0, 10)
  const stripeId = p.properties?.['Stripe ID']?.rich_text?.[0]?.plain_text
  const total = p.properties?.Total?.number || 0
  return created === date && stripeId && total > 0
})

const revenue = chf(paidOrders.reduce((sum, p) => sum + (p.properties?.Total?.number || 0), 0))
const orderCount = paidOrders.length
const stripeFeesEstimate = chf(revenue * 0.025 + orderCount * 0.25)
const tiaraCommission = chf(revenue * 0.05)

const rows = []
if (revenue > 0) {
  rows.push({
    source: 'Stripe Revenue',
    concept: `Stripe revenue (${revenue.toFixed(2)} CHF, ${orderCount} orders)`,
    chf: -revenue,
    category: 'Revenue',
    type: 'Income',
  })
  rows.push({
    source: 'Stripe Fees',
    concept: `Stripe fees estimate (${orderCount} orders)`,
    chf: stripeFeesEstimate,
    category: 'Payments',
    type: 'Variable',
  })
  rows.push({
    source: 'Tiara Commission',
    concept: `Tiara 5% sobre revenue ${revenue.toFixed(2)}`,
    chf: tiaraCommission,
    category: 'Operations',
    type: 'Variable %',
  })
}
rows.push(...fixedDaily)

for (const row of rows) await writeRow(row)

const expense = chf(rows.filter((r) => r.type !== 'Income').reduce((sum, r) => sum + r.chf, 0))
console.log(`Backfilled ${date}: ${rows.length} rows`)
console.log(`Revenue: ${revenue.toFixed(2)} CHF`)
console.log(`Expenses: ${expense.toFixed(2)} CHF`)
console.log(`Estimated profit: ${(revenue - expense).toFixed(2)} CHF`)
