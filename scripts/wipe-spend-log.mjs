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

let archived = 0
let cursor

do {
  const resp = await notion.dataSources.query({
    data_source_id: DS,
    page_size: 100,
    start_cursor: cursor,
  })
  for (const page of resp.results) {
    if (page.archived || page.in_trash) continue
    try {
      await notion.pages.update({ page_id: page.id, in_trash: true })
      archived++
    } catch (e) {
      console.error('skip', page.id, e.message)
    }
    if (archived % 20 === 0) console.log(`archived ${archived}...`)
  }
  cursor = resp.has_more ? resp.next_cursor : undefined
} while (cursor)

console.log(`DONE. Total archived: ${archived}`)
