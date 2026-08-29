// Crea la base de datos de Notion para los mensajes "For You" y muestra el
// data_source_id que hay que poner en NOTION_FORYOU_DB_ID (.env.local y Vercel).
// Uso: node scripts/create-foryou-db.mjs
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

if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
  console.error('❌ Faltan NOTION_TOKEN o NOTION_DATABASE_ID en .env.local')
  process.exit(1)
}

const notion = new Client({ auth: process.env.NOTION_TOKEN })

// 1. Localizar la página padre: la misma que contiene la base de pedidos,
//    para que la nueva base quede al lado en el workspace.
const ordersDs = await notion.dataSources.retrieve({
  data_source_id: process.env.NOTION_DATABASE_ID,
})
const dbParent = ordersDs.database_parent
// Las integraciones internas no pueden crear bases en la raíz del workspace;
// hace falta una página padre accesible. Buscamos una vía search.
let parent = null
if (dbParent?.type === 'page_id') {
  parent = { type: 'page_id', page_id: dbParent.page_id }
  console.log('📄 Padre: página de la base de pedidos')
} else {
  const found = await notion.search({
    filter: { property: 'object', value: 'page' },
    page_size: 10,
  })
  const page = found.results.find((r) => r.object === 'page')
  if (!page) {
    console.error('❌ La integración no ve ninguna página. Comparte una página con la integración en Notion y reintenta.')
    process.exit(1)
  }
  const title = page.properties?.title?.title?.[0]?.plain_text
    || Object.values(page.properties || {}).find((p) => p.type === 'title')?.title?.[0]?.plain_text
    || '(sin título)'
  parent = { type: 'page_id', page_id: page.id }
  console.log('📄 Padre: página', title, page.id)
}

// 2. Crear la base "For You" con el esquema que espera lib/notion.ts.
//    En la API 2025+ el esquema va en initial_data_source.
const db = await notion.databases.create({
  parent,
  title: [{ type: 'text', text: { content: 'Emilia — For You' } }],
  initial_data_source: {
    properties: {
      Code: { title: {} },
      Message: { rich_text: {} },
      'Video URL': { url: {} },
      'File URL': { url: {} },
      'File Name': { rich_text: {} },
      Status: { select: { options: [{ name: 'New' }, { name: 'Sent' }] } },
    },
  },
})

const dataSourceId = db.data_sources?.[0]?.id
console.log('✅ Base creada:', db.url)
console.log('')
console.log('Añade esto a .env.local y a Vercel (Production + Preview):')
console.log(`NOTION_FORYOU_DB_ID=${dataSourceId}`)
