import { Client } from '@notionhq/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Cargar .env.local manualmente (sin dependencia extra)
try {
  const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
  for (const line of envFile.split('\n')) {
    const match = line.match(/^([A-Z_]+)=(.*)$/)
    if (match) process.env[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
} catch {
  console.warn('No .env.local encontrado, usando variables del sistema')
}

const token = process.env.NOTION_TOKEN
const databaseId = process.env.NOTION_DATABASE_ID

if (!token || !databaseId) {
  console.error('❌ Falta NOTION_TOKEN o NOTION_DATABASE_ID en .env.local')
  process.exit(1)
}

const notion = new Client({ auth: token })

console.log('🧪 Creando pedido de prueba en Notion...\n')

try {
  const response = await notion.pages.create({
    parent: { type: 'data_source_id', data_source_id: databaseId },
    properties: {
      Order: {
        title: [{ text: { content: 'PRUEBA — Max Mustermann — CHF 59.90' } }],
      },
      'Delivery Date': {
        date: {
          start: '2026-04-25T14:00:00',
          end: '2026-04-25T17:00:00',
          time_zone: 'Europe/Zurich',
        },
      },
      Customer: {
        rich_text: [{ text: { content: 'Max Mustermann (PRUEBA)' } }],
      },
      Email: { email: 'test@example.com' },
      Phone: { phone_number: '+41 79 000 00 00' },
      Address: {
        rich_text: [{ text: { content: 'Bahnhofstrasse 1, 8001 Zürich, ZH' } }],
      },
      Products: {
        rich_text: [
          { text: { content: '• Classic Cheesecake (M) x1 — CHF 39.90\n• Brownie x2 — CHF 20.00' } },
        ],
      },
      Total: { number: 59.9 },
      'Stripe ID': {
        rich_text: [{ text: { content: 'pi_test_dummy_123' } }],
      },
    },
  })

  console.log('✅ ¡Funciona! Pedido creado en Notion.')
  console.log('   URL:', response.url)
  console.log('\nAbre la database en Notion y verás la fila "PRUEBA".')
  console.log('Si todo está bien, puedes borrarla manualmente.')
} catch (err) {
  console.error('❌ Error creando pedido en Notion:\n')
  console.error(err.message)
  if (err.body) console.error('\nDetalles:', err.body)
  console.error('\nCausas típicas:')
  console.error('  • object_not_found → no conectaste la integración a la database')
  console.error('    (••• → Connections → Emilia Orders)')
  console.error('  • validation_error con nombre de propiedad → esa columna no existe')
  console.error('    o tiene otro tipo. Revisa mayúsculas y espacios.')
  process.exit(1)
}
