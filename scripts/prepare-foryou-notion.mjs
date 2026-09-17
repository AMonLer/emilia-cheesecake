// Add the fields needed for tracing a gift from its order to its message.
// Safe to rerun: existing properties and records are preserved.
import { Client } from '@notionhq/client'
import nextEnv from '@next/env'
nextEnv.loadEnvConfig(process.cwd())
const notion = new Client({ auth: process.env.NOTION_TOKEN })
for (const [label, id, required] of [
  ['Orders', process.env.NOTION_DATABASE_ID, { 'For You Code': 'rich_text', 'For You URL': 'url' }],
  ['For You', process.env.NOTION_FORYOU_DB_ID, { 'Stripe ID': 'rich_text' }],
]) {
  if (!id) throw new Error(`Missing configuration for ${label}`)
  const source = await notion.dataSources.retrieve({ data_source_id: id })
  const additions = {}
  for (const [name, type] of Object.entries(required)) {
    if (source.properties[name] && source.properties[name].type !== type) throw new Error(`Unexpected type for ${label}.${name}`)
    if (!source.properties[name]) additions[name] = { [type]: {} }
  }
  if (Object.keys(additions).length) await notion.dataSources.update({ data_source_id: id, properties: additions })
  console.log(`${label}: ${Object.keys(required).join(', ')} ready`)
}
