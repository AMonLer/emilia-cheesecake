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

// Notion doesn't support renaming a multi_select option when the new name
// differs only in case (treated as duplicate). So drop any existing option
// that collides case-insensitively with a desired name, then add desireds fresh.
const desiredNamesLower = new Set(desired.map((d) => d.name.toLowerCase()))
const kept = currentOptions
  .filter((o) => !desiredNamesLower.has(o.name.toLowerCase()))
  .map((o) => ({ id: o.id, name: o.name, color: o.color }))

const final = [...kept, ...desired]

await notion.dataSources.update({
  data_source_id: dataSourceId,
  properties: {
    Cakes: {
      multi_select: { options: final },
    },
  },
})

console.log('✅ Configurado. Opciones actuales:\n')
for (const d of desired) {
  console.log(`   ${d.name} → ${d.color}`)
}
