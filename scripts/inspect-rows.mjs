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

let cursor
let income = 0, incomeRows = []
let expense = 0, expenseRows = []
let typeCount = {}

do {
  const resp = await notion.dataSources.query({ data_source_id: DS, page_size: 100, start_cursor: cursor })
  for (const page of resp.results) {
    if (page.archived || page.in_trash) continue
    const date = page.properties?.Date?.date?.start
    const source = page.properties?.Source?.select?.name
    const type = page.properties?.Type?.select?.name || '(null)'
    const chf = page.properties?.CHF?.number ?? 0
    typeCount[type] = (typeCount[type] || 0) + 1
    if (source === 'Stripe Revenue') {
      incomeRows.push({ date, type, chf })
      income += chf
    } else {
      expenseRows.push({ date, source, type, chf })
      expense += chf
    }
  }
  cursor = resp.has_more ? resp.next_cursor : undefined
} while (cursor)

console.log('Type counts in DB:', typeCount)
console.log()
console.log('Stripe Revenue rows:')
for (const r of incomeRows) console.log(`  ${r.date} | type=${r.type} | chf=${r.chf}`)
console.log(`Income sum: ${income.toFixed(2)}`)
console.log()
console.log(`Expense rows: ${expenseRows.length}, sum: ${expense.toFixed(2)}`)
console.log(`Total (all): ${(income + expense).toFixed(2)}`)
