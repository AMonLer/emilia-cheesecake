import { Client } from '@notionhq/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

try {
  const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
  for (const line of envFile.split('\n')) {
    const match = line.match(/^([A-Z_]+)=(.*)$/)
    if (match) process.env[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
} catch {}

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const dataSourceId = process.env.NOTION_DATABASE_ID

console.log('🗑️  Borrando todas las filas de Notion...\n')

let cursor
let deleted = 0
while (true) {
  const res = await notion.dataSources.query({
    data_source_id: dataSourceId,
    start_cursor: cursor,
    page_size: 100,
  })
  for (const row of res.results) {
    await notion.pages.update({ page_id: row.id, archived: true })
    deleted++
    const title = row.properties?.Order?.title?.[0]?.plain_text || row.id
    console.log(`   🗑️  ${title}`)
  }
  if (!res.has_more) break
  cursor = res.next_cursor
}

console.log(`\n🏁 Borradas ${deleted} filas.`)
