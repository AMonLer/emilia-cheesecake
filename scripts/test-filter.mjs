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

const since = '2026-04-01', until = '2026-04-30'

console.log('Testing filter: Date + Type=Income\n')
const incomeFilter = {
  and: [
    { property: 'Date', date: { on_or_after: since } },
    { property: 'Date', date: { on_or_before: until } },
    { property: 'Type', select: { equals: 'Income' } },
  ],
}

let total = 0, count = 0, cursor
do {
  const resp = await notion.dataSources.query({ data_source_id: DS, page_size: 100, start_cursor: cursor, filter: incomeFilter })
  for (const page of resp.results) {
    if (page.archived || page.in_trash) continue
    const date = page.properties?.Date?.date?.start
    const type = page.properties?.Type?.select?.name
    const chf = page.properties?.CHF?.number ?? 0
    console.log(`  ${date} | type=${type} | chf=${chf}`)
    total += chf
    count++
  }
  cursor = resp.has_more ? resp.next_cursor : undefined
} while (cursor)
console.log(`\nIncome filter: ${count} rows, sum=${total.toFixed(2)}\n`)

console.log('Testing filter: Date + Type!=Income (expense)\n')
const expenseFilter = {
  and: [
    { property: 'Date', date: { on_or_after: since } },
    { property: 'Date', date: { on_or_before: until } },
    { property: 'Type', select: { does_not_equal: 'Income' } },
  ],
}
total = 0; count = 0; cursor = undefined
do {
  const resp = await notion.dataSources.query({ data_source_id: DS, page_size: 100, start_cursor: cursor, filter: expenseFilter })
  for (const page of resp.results) {
    if (page.archived || page.in_trash) continue
    const chf = page.properties?.CHF?.number ?? 0
    total += chf
    count++
  }
  cursor = resp.has_more ? resp.next_cursor : undefined
} while (cursor)
console.log(`Expense filter: ${count} rows, sum=${total.toFixed(2)}`)
