import { Client } from '@notionhq/client'
import fs from 'fs'

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const notion = new Client({ auth: env.NOTION_TOKEN })
const DASHBOARD = '34db6319-835a-81c8-98f0-c2e9de0f65c7'

const blocks = await notion.blocks.children.list({ block_id: DASHBOARD, page_size: 50 })
for (const b of blocks.results) {
  if (b.type !== 'callout') continue
  const text = (b.callout?.rich_text || []).map(r => r.plain_text || '').join('')
  if (text.includes('Beneficio') || text.includes('Resumen')) {
    console.log('Last edited:', b.last_edited_time)
    console.log('---')
    console.log(text)
    break
  }
}
