import { Client } from '@notionhq/client'
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
const ds = await notion.dataSources.retrieve({ data_source_id: process.env.NOTION_DATABASE_ID })

console.log('Opciones de Cakes:\n')
for (const o of ds.properties.Cakes.multi_select.options) {
  console.log(`  "${o.name}" → ${o.color}`)
}
