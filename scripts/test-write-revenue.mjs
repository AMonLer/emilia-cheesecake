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

try {
  const result = await notion.pages.create({
    parent: { type: 'data_source_id', data_source_id: DS },
    properties: {
      Concept: { title: [{ text: { content: 'TEST Stripe Revenue · 2026-04-19' } }] },
      Date: { date: { start: '2026-04-19' } },
      Source: { select: { name: 'Stripe Revenue' } },
      Category: { select: { name: 'Revenue' } },
      CHF: { number: -81.6 },
      Type: { select: { name: 'Income' } },
      Notes: { rich_text: [{ text: { content: 'Test write' } }] },
    },
  })
  console.log('SUCCESS — page id:', result.id)
} catch (err) {
  console.error('ERROR:', err.message)
  console.error(err.body?.slice?.(0, 500) || JSON.stringify(err).slice(0, 500))
}
