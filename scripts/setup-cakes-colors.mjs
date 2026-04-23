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
const dataSourceId = process.env.NOTION_DATABASE_ID

const desired = [
  { name: 'PISTACHIO Grande', color: 'green' },
  { name: 'PISTACHIO Pequeño', color: 'green' },
  { name: 'LOTUS Grande', color: 'orange' },
  { name: 'LOTUS Pequeño', color: 'orange' },
  { name: 'SCHOGGI Grande', color: 'brown' },
  { name: 'SCHOGGI Pequeño', color: 'brown' },
  { name: 'CLASSIC Grande', color: 'yellow' },
  { name: 'CLASSIC Pequeño', color: 'yellow' },
  { name: 'DULCE DE LECHE Grande', color: 'red' },
  { name: 'DULCE DE LECHE Pequeño', color: 'red' },
]

console.log('🎨 Configurando opciones y colores de Cakes...\n')

const ds = await notion.dataSources.retrieve({ data_source_id: dataSourceId })
const currentOptions = ds.properties.Cakes.multi_select.options

// Merge: existing options stay (with id), desired ones get the right color
const merged = [...currentOptions.map((o) => ({ id: o.id, name: o.name, color: o.color }))]

for (const d of desired) {
  const existing = merged.find((o) => o.name === d.name)
  if (existing) {
    existing.color = d.color
  } else {
    merged.push({ name: d.name, color: d.color })
  }
}

await notion.dataSources.update({
  data_source_id: dataSourceId,
  properties: {
    Cakes: {
      multi_select: { options: merged },
    },
  },
})

console.log('✅ Configurado. Opciones actuales:\n')
for (const d of desired) {
  console.log(`   ${d.name} → ${d.color}`)
}
