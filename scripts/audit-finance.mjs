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

const sources = {
  spend: '5f898cc4-ec8b-40dd-b85a-c8f879356aa8',
  orders: '34ab6319-835a-8007-9751-000b353641f3',
  b2b: 'df3c85ef-9d3e-4ae6-af65-c07bb8b57467',
  opex: '0db3d902-9684-478d-8e58-bb21bde1d922',
  monthly: '9ba701de-0bf7-46e5-8756-d157e88484ef',
  clarity: '9419d709-2008-47e3-a3f6-3d3125bb3aea',
}

async function pullAll(dataSourceId) {
  const rows = []
  let cursor
  do {
    const resp = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
      start_cursor: cursor,
    })
    for (const page of resp.results) {
      if (!page.archived && !page.in_trash) rows.push(page)
    }
    cursor = resp.has_more ? resp.next_cursor : undefined
  } while (cursor)
  return rows
}

function monthOf(date) {
  return date?.slice(0, 7) || 'unknown'
}

function num(prop) {
  return typeof prop?.number === 'number' ? prop.number : 0
}

const [spend, orders, b2b, opex, monthly, clarity] = await Promise.all([
  pullAll(sources.spend),
  pullAll(sources.orders),
  pullAll(sources.b2b),
  pullAll(sources.opex),
  pullAll(sources.monthly),
  pullAll(sources.clarity),
])

const spendByDate = new Map()
const spendBySource = new Map()
for (const p of spend) {
  const date = p.properties?.Date?.date?.start || 'unknown'
  const source = p.properties?.Source?.select?.name || 'unknown'
  const chf = num(p.properties?.CHF)
  if (!spendByDate.has(date)) spendByDate.set(date, { rows: 0, sum: 0, sources: new Set() })
  const d = spendByDate.get(date)
  d.rows++
  d.sum += chf
  d.sources.add(source)
  spendBySource.set(source, (spendBySource.get(source) || 0) + chf)
}

const ordersByMonth = new Map()
let ordersWithStripeId = 0
for (const p of orders) {
  const date = p.properties?.['Delivery Date']?.date?.start || p.created_time?.slice(0, 10)
  const total = num(p.properties?.Total)
  const month = monthOf(date)
  const row = ordersByMonth.get(month) || { count: 0, total: 0 }
  row.count++
  row.total += total
  ordersByMonth.set(month, row)
  if (p.properties?.['Stripe ID']?.rich_text?.[0]?.plain_text) ordersWithStripeId++
}

const b2bByMonth = new Map()
for (const p of b2b) {
  const date = p.properties?.Date?.date?.start
  const month = monthOf(date)
  const qty = num(p.properties?.Quantity)
  const unitPrice = num(p.properties?.['Unit Price'])
  const row = b2bByMonth.get(month) || { count: 0, qty: 0, total: 0 }
  row.count++
  row.qty += qty
  row.total += qty * unitPrice
  b2bByMonth.set(month, row)
}

function printMap(title, map, formatter) {
  console.log(`\n${title}`)
  for (const [key, value] of [...map.entries()].sort()) {
    console.log(`  ${key}: ${formatter(value)}`)
  }
}

console.log('Finance automation audit')
console.log(`Spend rows: ${spend.length}`)
console.log(`Emilia Orders rows: ${orders.length} (${ordersWithStripeId} with Stripe ID)`)
console.log(`B2B rows: ${b2b.length}`)
console.log(`OPEX rows: ${opex.length}`)
console.log(`Monthly Snapshot rows: ${monthly.length}`)
console.log(`Clarity rows: ${clarity.length}`)

printMap(
  'Daily Spend Log by date',
  spendByDate,
  (v) => `${v.rows} rows, net ${(v.sum).toFixed(2)} CHF, sources: ${[...v.sources].join(', ')}`,
)
printMap('Daily Spend Log by source', spendBySource, (v) => `${v.toFixed(2)} CHF`)
printMap('Emilia Orders by month', ordersByMonth, (v) => `${v.count} orders, ${v.total.toFixed(2)} CHF`)
printMap('B2B Sales by month', b2bByMonth, (v) => `${v.count} rows, ${v.qty} cakes, ${v.total.toFixed(2)} CHF`)
