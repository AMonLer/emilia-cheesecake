import { Client } from '@notionhq/client'
import fs from 'fs'

let NOTION_TOKEN = process.env.NOTION_TOKEN
if (!NOTION_TOKEN && fs.existsSync('.env.local')) {
  const env = Object.fromEntries(
    fs.readFileSync('.env.local', 'utf8')
      .split('\n')
      .filter(l => l.includes('=') && !l.startsWith('#'))
      .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
  )
  NOTION_TOKEN = env.NOTION_TOKEN
}
if (!NOTION_TOKEN) { console.error('NOTION_TOKEN not set'); process.exit(1) }
const notion = new Client({ auth: NOTION_TOKEN })
const DS = '5f898cc4-ec8b-40dd-b85a-c8f879356aa8'
const DASHBOARD = '34db6319-835a-81c8-98f0-c2e9de0f65c7'

// ── Pull all rows ──────────────────────────────────────────────────────
const rows = []
let cursor
do {
  const resp = await notion.dataSources.query({ data_source_id: DS, page_size: 100, start_cursor: cursor })
  for (const p of resp.results) {
    if (p.archived || p.in_trash) continue
    const date = p.properties?.Date?.date?.start
    const source = p.properties?.Source?.select?.name
    const chf = p.properties?.CHF?.number
    if (!date || typeof chf !== 'number') continue
    rows.push({ date, source, chf })
  }
  cursor = resp.has_more ? resp.next_cursor : undefined
} while (cursor)
console.log(`Pulled ${rows.length} rows`)

// ── Date helpers ───────────────────────────────────────────────────────
const today = new Date()
const todayISO = today.toISOString().slice(0, 10)
const yesterday = new Date(today); yesterday.setUTCDate(yesterday.getUTCDate() - 1)
const yesterdayISO = yesterday.toISOString().slice(0, 10)
const thisMonth = todayISO.slice(0, 7)
const lastMonthDate = new Date(today); lastMonthDate.setUTCDate(1); lastMonthDate.setUTCMonth(lastMonthDate.getUTCMonth() - 1)
const lastMonth = lastMonthDate.toISOString().slice(0, 7)
const thisYear = todayISO.slice(0, 4)

// ── Aggregator ─────────────────────────────────────────────────────────
function totals(filter) {
  let ingreso = 0, gasto = 0
  for (const r of rows) {
    if (!filter(r)) continue
    if (r.source === 'Stripe Revenue') ingreso += -r.chf // stored negative
    else gasto += r.chf
  }
  return { ingreso: +ingreso.toFixed(2), gasto: +gasto.toFixed(2), beneficio: +(ingreso - gasto).toFixed(2) }
}

const ayer = totals(r => r.date === yesterdayISO)
const mesActual = totals(r => r.date.slice(0, 7) === thisMonth)
const mesAnterior = totals(r => r.date.slice(0, 7) === lastMonth)
const año = totals(r => r.date.slice(0, 4) === thisYear)

console.log(`\nAyer (${yesterdayISO}):       ${JSON.stringify(ayer)}`)
console.log(`Mes en curso (${thisMonth}): ${JSON.stringify(mesActual)}`)
console.log(`Mes anterior (${lastMonth}): ${JSON.stringify(mesAnterior)}`)
console.log(`Año (${thisYear}):           ${JSON.stringify(año)}`)

// ── Find Beneficio callout in Dashboard Financiero ─────────────────────
const blocks = await notion.blocks.children.list({ block_id: DASHBOARD, page_size: 50 })
let beneficioId
for (const b of blocks.results) {
  if (b.type !== 'callout') continue
  const text = (b.callout?.rich_text || []).map(r => r.plain_text || '').join('')
  if (text.includes('Beneficio')) { beneficioId = b.id; break }
}
if (!beneficioId) { console.error('Beneficio callout not found'); process.exit(1) }

// ── Build rich text ────────────────────────────────────────────────────
const fmt = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(2)} CHF`
const fmtPos = (n) => `${n.toFixed(2)} CHF`

function lineRichText(label, t, big = false) {
  return [
    { type: 'text', text: { content: `${label}\n` }, annotations: { bold: true } },
    { type: 'text', text: { content: `   Ingresos: ${fmtPos(t.ingreso)} · Gastos: ${fmtPos(t.gasto)} · Beneficio: ` } },
    { type: 'text', text: { content: fmt(t.beneficio) }, annotations: { bold: true, color: t.beneficio >= 0 ? 'green' : 'red' } },
    { type: 'text', text: { content: '\n' } },
  ]
}

const richText = [
  { type: 'text', text: { content: `💚 Resumen financiero (auto, actualizado ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC)\n\n` }, annotations: { bold: true } },
  ...lineRichText(`📅 Ayer (${yesterdayISO})`, ayer),
  { type: 'text', text: { content: '\n' } },
  ...lineRichText(`📆 Este mes (${thisMonth})`, mesActual),
  { type: 'text', text: { content: '\n' } },
  ...lineRichText(`📆 Mes anterior (${lastMonth})`, mesAnterior),
  { type: 'text', text: { content: '\n' } },
  ...lineRichText(`🗓️ Este año (${thisYear})`, año),
]

await notion.blocks.update({
  block_id: beneficioId,
  callout: { rich_text: richText, color: año.beneficio >= 0 ? 'green_background' : 'red_background' },
})
console.log('\n✅ Beneficio callout updated')
