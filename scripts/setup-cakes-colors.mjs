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
  { name: 'PISTACHIO GRANDE', color: 'green' },
  { name: 'pistachio pequeño', color: 'green' },
  { name: 'LOTUS GRANDE', color: 'orange' },
  { name: 'lotus pequeño', color: 'orange' },
  { name: 'SCHOGGI GRANDE', color: 'brown' },
  { name: 'schoggi pequeño', color: 'brown' },
  { name: 'CLASSIC GRANDE', color: 'yellow' },
  { name: 'classic pequeño', color: 'yellow' },
  { name: 'DULCE DE LECHE GRANDE', color: 'red' },
  { name: 'dulce de leche pequeño', color: 'red' },
]

console.log('🎨 Configurando opciones y colores de Cakes...\n')

const ds = await notion.dataSources.retrieve({ data_source_id: dataSourceId })
const currentOptions = ds.properties.Cakes.multi_select.options

// Start with all existing options, keyed by case-insensitive name
const merged = currentOptions.map((o) => ({ id: o.id, name: o.name, color: o.color }))

for (const d of desired) {
  // Case-insensitive match with any existing option
  const existing = merged.find((o) => o.name.toLowerCase() === d.name.toLowerCase())
  if (existing) {
    existing.name = d.name // rename to desired case
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
