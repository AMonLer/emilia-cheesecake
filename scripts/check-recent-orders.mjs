import fs from 'fs'
import { Client } from '@notionhq/client'

function loadEnv() {
  const env = { ...process.env }
  if (fs.existsSync('.env.local')) {
    for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
      if (!line.includes('=') || line.trim().startsWith('#')) continue
      const i = line.indexOf('=')
      const key = line.slice(0, i).trim()
      const value = line.slice(i + 1).trim().replace(/^["']|["']$/g, '')
      if (!env[key]) env[key] = value
    }
  }
  return env
}

const env = loadEnv()
const notion = new Client({ auth: env.NOTION_TOKEN })
const ORDERS_DB = '34ab6319-835a-8007-9751-000b353641f3'

const res = await notion.dataSources.query({
  data_source_id: ORDERS_DB,
  sorts: [{ timestamp: 'created_time', direction: 'descending' }],
  page_size: 15,
})
console.log('Ultimos pedidos en Notion (webhook post-pago):')
for (const page of res.results) {
  const created = page.created_time.slice(0, 16).replace('T', ' ')
  const props = page.properties
  const title = Object.values(props).find(p => p.type === 'title')
  const name = title?.title?.[0]?.plain_text || '(sin titulo)'
  const total = Object.entries(props).find(([k]) => /total|amount/i.test(k))
  let totalStr = ''
  if (total) {
    const p = total[1]
    totalStr = p.type === 'number' ? ` ${p.number} CHF` : ''
  }
  console.log(`${created}  ${name}${totalStr}`)
}
