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

const resp = await notion.dataSources.query({
  data_source_id: DS,
  filter: { property: 'Source', select: { equals: 'Stripe Revenue' } },
  page_size: 20,
})

console.log(`Stripe Revenue rows: ${resp.results.length}`)
for (const page of resp.results) {
  console.log(JSON.stringify({
    id: page.id,
    archived: page.archived,
    in_trash: page.in_trash,
    DateProp: page.properties?.Date,
    SourceProp: page.properties?.Source,
    TypeProp: page.properties?.Type,
    CHF: page.properties?.CHF,
  }, null, 2))
  console.log('---')
}
