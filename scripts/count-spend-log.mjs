import { Client } from '@notionhq/client'
import fs from 'fs'

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const notion = new Client({ auth: env.NOTION_TOKEN })
const DS = '5f898cc4-ec8b-40dd-b85a-c8f879356aa8'

const byDate = new Map()
let total = 0, archivedCount = 0, liveCount = 0
let cursor

do {
  const resp = await notion.dataSources.query({ data_source_id: DS, page_size: 100, start_cursor: cursor })
  for (const page of resp.results) {
    total++
    const isArchived = page.archived || page.in_trash
    if (isArchived) { archivedCount++; continue }
    liveCount++
    const date = page.properties?.Date?.date?.start || 'unknown'
    const source = page.properties?.Source?.select?.name || '?'
    const chf = page.properties?.CHF?.number ?? 0
    if (!byDate.has(date)) byDate.set(date, [])
    byDate.get(date).push({ source, chf })
  }
  cursor = resp.has_more ? resp.next_cursor : undefined
} while (cursor)

console.log(`TOTAL pages returned by query: ${total} (live: ${liveCount}, archived/in_trash: ${archivedCount})`)
console.log()
const sortedDates = [...byDate.keys()].sort()
for (const d of sortedDates) {
  const rows = byDate.get(d)
  const sum = rows.reduce((s, r) => s + r.chf, 0)
  console.log(`${d}: ${rows.length} rows, sum=${sum.toFixed(2)} CHF, sources=[${rows.map(r => r.source).join(', ')}]`)
}
