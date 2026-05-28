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

let total = 0, sources = {}, cursor
do {
  const resp = await notion.dataSources.query({
    data_source_id: DS,
    filter: {
      and: [
        { property: 'Date', date: { on_or_after: '2026-04-01' } },
        { property: 'Date', date: { on_or_before: '2026-04-30' } },
      ],
    },
    page_size: 100,
    start_cursor: cursor,
  })
  total += resp.results.length
  for (const p of resp.results) {
    if (p.archived || p.in_trash) continue
    const src = p.properties?.Source?.select?.name || '(null)'
    sources[src] = (sources[src] || 0) + 1
  }
  cursor = resp.has_more ? resp.next_cursor : undefined
} while (cursor)
console.log(`Total returned: ${total}`)
console.log('Sources:', sources)
