import { Client } from '@notionhq/client'
import fs from 'fs'

const env = { ...process.env }
if (fs.existsSync('.env.local')) {
  for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
    if (!line.includes('=') || line.trim().startsWith('#')) continue
    const i = line.indexOf('=')
    if (!env[line.slice(0, i).trim()]) env[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
}

const notion = new Client({ auth: env.NOTION_TOKEN })
const DS = '34ab6319-835a-8007-9751-000b353641f3'

let cursor
const rows = []
do {
  const resp = await notion.dataSources.query({ data_source_id: DS, page_size: 100, start_cursor: cursor })
  for (const p of resp.results) {
    if (p.archived || p.in_trash) continue
    const delivery = p.properties?.['Delivery Date']?.date?.start || ''
    const created = p.created_time?.slice(0, 10) || ''
    if (!delivery.startsWith('2026-05') && !created.startsWith('2026-05')) continue
    rows.push({
      created,
      delivery,
      order: p.properties?.Order?.title?.[0]?.plain_text || '',
      stripeId: p.properties?.['Stripe ID']?.rich_text?.[0]?.plain_text || '',
      total: p.properties?.Total?.number || 0,
    })
  }
  cursor = resp.has_more ? resp.next_cursor : undefined
} while (cursor)

rows.sort((a, b) => `${a.created}${a.delivery}`.localeCompare(`${b.created}${b.delivery}`))
for (const r of rows) {
  console.log(`${r.created} | delivery ${r.delivery} | ${r.total.toFixed(2)} CHF | ${r.stripeId || 'no-stripe'} | ${r.order}`)
}
console.log(`Total rows: ${rows.length}`)
