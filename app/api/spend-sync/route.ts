import { NextRequest, NextResponse } from 'next/server'
import { Client as NotionClient } from '@notionhq/client'
import Stripe from 'stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// ─── Config ──────────────────────────────────────────────────────────────
const NOTION_SPEND_DS_ID = '5f898cc4-ec8b-40dd-b85a-c8f879356aa8'
const NOTION_DASHBOARD_PAGE_ID = '34db6319-835a-81c8-98f0-c2e9de0f65c7'
const META_AD_ACCOUNT_ID = 'act_2973377789522087'
const META_API = 'https://graph.facebook.com/v24.0'

// Costes fijos prorrateados (CHF/día @ 30.4375 días/mes)
const FIXED_DAILY: Array<{ source: string; concept: string; chf: number; category: string }> = [
  { source: 'Tiara Base', concept: 'Tiara base prorrateado', chf: 150 / 30.4375, category: 'Operations' },
  { source: 'Tiguan', concept: 'Tiguan prorrateado', chf: 63 / 30.4375, category: 'Logistics' },
  { source: 'Claude Pro', concept: 'Claude Pro prorrateado (20 USD * 0.83)', chf: (20 * 0.83) / 30.4375, category: 'Tools' },
  { source: 'Web Hosting', concept: 'Web hosting prorrateado (10 USD * 0.83)', chf: (10 * 0.83) / 30.4375, category: 'Tools' },
]
const TIARA_COMMISSION_PCT = 0.05
const STRIPE_TO_CHF = 1 // assume Stripe is in CHF

const SOURCE_TO_CATEGORY: Record<string, string> = {
  'Meta Ads': 'Marketing',
  'Stripe Fees': 'Payments',
  'Tiara Commission': 'Operations',
  'Stripe Revenue': 'Revenue',
}

// ─── Types ───────────────────────────────────────────────────────────────
type SpendRow = {
  source: string
  concept: string
  chf: number
  category: string
  type: 'Variable' | 'Fixed (prorated)' | 'Variable %' | 'Income'
}

// ─── Helpers ─────────────────────────────────────────────────────────────
function yesterdayISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return zurichISODate(d)
}

function monthStart(dateISO: string): string {
  return dateISO.slice(0, 7) + '-01'
}

function yearStart(dateISO: string): string {
  return dateISO.slice(0, 4) + '-01-01'
}

function zurichISODate(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zurich',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value
  return `${get('year')}-${get('month')}-${get('day')}`
}

function previousMonthRange(dateISO: string): { start: string; end: string; label: string } {
  const [yearStr, monthStr] = dateISO.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const previous = new Date(Date.UTC(year, month - 2, 1))
  const start = previous.toISOString().slice(0, 10)
  const endDate = new Date(Date.UTC(year, month - 1, 0))
  const end = endDate.toISOString().slice(0, 10)
  return { start, end, label: start.slice(0, 7) }
}

function addDaysISO(dateISO: string, days: number): string {
  const [year, month, day] = dateISO.split('-').map(Number)
  const d = new Date(Date.UTC(year, month - 1, day + days))
  return d.toISOString().slice(0, 10)
}

function zurichWallClockToUnix(dateISO: string, hour: number, minute = 0, second = 0): number {
  const [year, month, day] = dateISO.split('-').map(Number)
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second)
  const offsetMinutes = getZurichOffsetMinutes(new Date(utcGuess))
  return Math.floor((utcGuess - offsetMinutes * 60 * 1000) / 1000)
}

function getZurichOffsetMinutes(date: Date): number {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Zurich',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = fmt.formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  )
  return Math.round((asUtc - date.getTime()) / (60 * 1000))
}

function chf(n: number): number {
  return Math.round(n * 100) / 100
}

// ─── Phase 1 helpers: data fetchers ──────────────────────────────────────
async function fetchMetaSpend(date: string, accessToken: string): Promise<number> {
  const url = `${META_API}/${META_AD_ACCOUNT_ID}/insights?fields=spend&time_range=${encodeURIComponent(JSON.stringify({ since: date, until: date }))}&access_token=${accessToken}`
  const resp = await fetch(url)
  if (!resp.ok) {
    const body = await resp.text()
    throw new Error(`Meta Ads API ${resp.status}: ${body.slice(0, 300)}`)
  }
  const json = await resp.json()
  const row = json?.data?.[0]
  return row?.spend ? parseFloat(row.spend) : 0
}

async function fetchStripeDay(date: string, stripe: Stripe): Promise<{ revenue: number; fees: number }> {
  const start = zurichWallClockToUnix(date, 0)
  const end = zurichWallClockToUnix(addDaysISO(date, 1), 0)
  let revenue = 0
  let fees = 0
  let startingAfter: string | undefined
  let hasMore = true
  while (hasMore) {
    const list: Stripe.ApiList<Stripe.BalanceTransaction> = await stripe.balanceTransactions.list({
      created: { gte: start, lt: end },
      limit: 100,
      starting_after: startingAfter,
    })
    for (const tx of list.data) {
      if (tx.type === 'charge' || tx.type === 'payment') {
        revenue += tx.amount / 100
        fees += tx.fee / 100
      } else if (tx.type === 'refund' || tx.type === 'payment_refund') {
        revenue -= Math.abs(tx.amount) / 100
      } else if (tx.type === 'stripe_fee' || tx.type === 'application_fee') {
        fees += Math.abs(tx.amount) / 100
      }
    }
    hasMore = list.has_more
    startingAfter = list.data[list.data.length - 1]?.id
    if (!startingAfter) break
  }
  return { revenue: chf(revenue * STRIPE_TO_CHF), fees: chf(fees * STRIPE_TO_CHF) }
}

// ─── Notion helpers ──────────────────────────────────────────────────────
function isLive(page: any): boolean {
  return !page?.archived && !page?.in_trash
}

async function existingRowsForDate(notion: NotionClient, date: string): Promise<number> {
  // Bypass Notion date filter (unreliable on Vercel runtime). Pull all rows
  // and match in JS. DB is small enough.
  let count = 0
  let cursor: string | undefined
  do {
    const resp: any = await (notion as any).dataSources.query({
      data_source_id: NOTION_SPEND_DS_ID,
      page_size: 100,
      start_cursor: cursor,
    })
    for (const page of resp.results || []) {
      if (!isLive(page)) continue
      if (page.properties?.Date?.date?.start === date) count++
    }
    cursor = resp.has_more ? resp.next_cursor : undefined
  } while (cursor)
  return count
}

async function writeSpendRow(notion: NotionClient, date: string, row: SpendRow) {
  await notion.pages.create({
    parent: { type: 'data_source_id', data_source_id: NOTION_SPEND_DS_ID } as any,
    properties: {
      Concept: { title: [{ text: { content: `${row.concept} · ${date}` } }] },
      Date: { date: { start: date } },
      Source: { select: { name: row.source } },
      Category: { select: { name: row.category } },
      CHF: { number: chf(row.chf) },
      Type: { select: { name: row.type } },
      Notes: { rich_text: [{ text: { content: `Auto-synced ${new Date().toISOString()}` } }] },
    } as any,
  })
}

async function queryDataSourceViaFetch(notionToken: string, cursor?: string): Promise<any> {
  const body: any = { page_size: 100 }
  if (cursor) body.start_cursor = cursor
  const resp = await fetch(`https://api.notion.com/v1/data_sources/${NOTION_SPEND_DS_ID}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${notionToken}`,
      'Notion-Version': '2025-09-03',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`Notion query ${resp.status}: ${text.slice(0, 300)}`)
  }
  return resp.json()
}

async function getTotalsBetween(
  notionToken: string,
  since: string,
  until: string,
): Promise<{ expense: number; income: number; rowsSeen: number; rowsLive: number; sourceCounts: Record<string, number> }> {
  let expense = 0
  let income = 0
  let rowsSeen = 0
  let rowsLive = 0
  const sourceCounts: Record<string, number> = {}
  let cursor: string | undefined
  do {
    const resp: any = await queryDataSourceViaFetch(notionToken, cursor)
    for (const page of resp.results || []) {
      rowsSeen++
      if (!isLive(page)) continue
      const dateStart = page.properties?.Date?.date?.start
      if (!dateStart || dateStart < since || dateStart > until) continue
      rowsLive++
      const v = page.properties?.CHF?.number
      if (typeof v !== 'number') continue
      const source = page.properties?.Source?.select?.name || '(null)'
      sourceCounts[source] = (sourceCounts[source] || 0) + 1
      if (source === 'Stripe Revenue') income += -v
      else expense += v
    }
    cursor = resp.has_more ? resp.next_cursor : undefined
  } while (cursor)
  return { expense: chf(expense), income: chf(income), rowsSeen, rowsLive, sourceCounts }
}

function profitFromTotals(t: { expense: number; income: number }) {
  return chf(t.income - t.expense)
}

async function findCalloutBlocks(notion: NotionClient): Promise<{
  insightId?: string
  totalsId?: string
  profitId?: string
}> {
  const resp: any = await notion.blocks.children.list({ block_id: NOTION_DASHBOARD_PAGE_ID, page_size: 50 })
  let insightId: string | undefined
  let totalsId: string | undefined
  let profitId: string | undefined
  for (const block of resp.results) {
    if (block.type !== 'callout') continue
    const text = (block.callout?.rich_text || []).map((r: any) => r.plain_text || '').join('')
    if (!profitId && text.includes('Beneficio')) profitId = block.id
    else if (!insightId && text.includes('Insight de hoy')) insightId = block.id
    else if (!totalsId && text.includes('Totales')) totalsId = block.id
    if (insightId && totalsId && profitId) break
  }
  return { insightId, totalsId, profitId }
}

async function updateCallout(notion: NotionClient, blockId: string, lines: string[], color: string) {
  const richText: any[] = []
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) richText.push({ type: 'text', text: { content: '\n' } })
    const isFirst = i === 0
    richText.push({
      type: 'text',
      text: { content: lines[i] },
      annotations: { bold: isFirst },
    })
  }
  await (notion as any).blocks.update({
    block_id: blockId,
    callout: { rich_text: richText, color },
  })
}

// ─── Phase 2: Haiku insight ──────────────────────────────────────────────
async function generateInsight(payload: any, apiKey: string): Promise<{ insight: string; anomalies: string[] }> {
  const body = {
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    system:
      'Eres un analista financiero conciso. Recibes el desglose de gastos del día anterior de Emilia Cheesecakes (negocio de cheesecakes en Suiza) más totales mes y año. Devuelves: (1) "insight": 2-3 frases en español natural sobre el día (qué destacó, comparativa con el promedio diario del mes, principal driver de gasto). (2) "anomalies": array de strings con cualquier alerta accionable (ej: spike de gasto, fuente nueva, ROAS de Meta caído). Si no hay anomalías, array vacío. Tono: directo, dato-céntrico, sin relleno.',
    messages: [
      {
        role: 'user',
        content: `Datos:\n${JSON.stringify(payload, null, 2)}`,
      },
    ],
    output_config: {
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            insight: { type: 'string' },
            anomalies: { type: 'array', items: { type: 'string' } },
          },
          required: ['insight', 'anomalies'],
          additionalProperties: false,
        },
      },
    },
  }

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`Anthropic API ${resp.status}: ${text.slice(0, 300)}`)
  }
  const json: any = await resp.json()
  const textBlock = (json.content || []).find((b: any) => b.type === 'text')
  if (!textBlock?.text) throw new Error('No text block in Anthropic response')
  const parsed = JSON.parse(textBlock.text)
  return {
    insight: String(parsed.insight || '').trim(),
    anomalies: Array.isArray(parsed.anomalies) ? parsed.anomalies.map(String) : [],
  }
}

// ─── Handler ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    return await handle(req)
  } catch (err: any) {
    return NextResponse.json(
      {
        error: 'Unhandled exception',
        message: err?.message?.slice(0, 500) || String(err).slice(0, 500),
        stack: err?.stack?.split('\n').slice(0, 6).join('\n'),
      },
      { status: 500 },
    )
  }
}

async function handle(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  if (auth !== `Bearer ${cronSecret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notionToken = process.env.NOTION_TOKEN
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const metaToken = process.env.META_ACCESS_TOKEN
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!notionToken || !stripeKey) {
    return NextResponse.json(
      { error: 'Missing NOTION_TOKEN or STRIPE_SECRET_KEY' },
      { status: 500 },
    )
  }

  const date = req.nextUrl.searchParams.get('date') || yesterdayISO()
  const force = req.nextUrl.searchParams.get('force') === '1'
  const wipe = req.nextUrl.searchParams.get('wipe') === '1'

  const notion = new NotionClient({ auth: notionToken })
  const stripe = new Stripe(stripeKey)

  // Wipe all rows in the DB (one-shot recovery for accumulated duplicates)
  if (wipe) {
    let archived = 0
    let cursor: string | undefined
    do {
      const resp: any = await (notion as any).dataSources.query({
        data_source_id: NOTION_SPEND_DS_ID,
        page_size: 100,
        start_cursor: cursor,
      })
      for (const page of resp.results) {
        try {
          await notion.pages.update({ page_id: page.id, in_trash: true } as any)
          archived++
        } catch {
          try {
            await notion.pages.update({ page_id: page.id, archived: true } as any)
            archived++
          } catch {}
        }
      }
      cursor = resp.has_more ? resp.next_cursor : undefined
    } while (cursor)
    return NextResponse.json({ ok: true, wiped: archived })
  }

  // Idempotence
  const existing = await existingRowsForDate(notion, date)
  if (existing > 0 && !force) {
    return NextResponse.json({ ok: true, date, skipped: true, existing })
  }

  // ── Phase 1: pull deterministic data ──
  const [metaSpend, stripeDay] = await Promise.all([
    metaToken ? fetchMetaSpend(date, metaToken) : Promise.resolve(0),
    fetchStripeDay(date, stripe),
  ])

  const tiaraCommission = chf(stripeDay.revenue * TIARA_COMMISSION_PCT)

  const rows: SpendRow[] = []

  if (metaSpend > 0) {
    rows.push({
      source: 'Meta Ads',
      concept: 'Meta Ads spend',
      chf: metaSpend,
      category: SOURCE_TO_CATEGORY['Meta Ads'],
      type: 'Variable',
    })
  }
  if (stripeDay.fees > 0) {
    rows.push({
      source: 'Stripe Fees',
      concept: `Stripe fees (revenue ${stripeDay.revenue.toFixed(2)})`,
      chf: stripeDay.fees,
      category: SOURCE_TO_CATEGORY['Stripe Fees'],
      type: 'Variable',
    })
  }
  if (tiaraCommission > 0) {
    rows.push({
      source: 'Tiara Commission',
      concept: `Tiara 5% sobre revenue ${stripeDay.revenue.toFixed(2)}`,
      chf: tiaraCommission,
      category: SOURCE_TO_CATEGORY['Tiara Commission'],
      type: 'Variable %',
    })
  }
  for (const f of FIXED_DAILY) {
    rows.push({
      source: f.source,
      concept: f.concept,
      chf: f.chf,
      category: f.category,
      type: 'Fixed (prorated)',
    })
  }
  if (stripeDay.revenue !== 0) {
    rows.push({
      source: 'Stripe Revenue',
      concept: `Stripe revenue (${stripeDay.revenue.toFixed(2)} CHF)`,
      chf: -stripeDay.revenue,
      category: SOURCE_TO_CATEGORY['Stripe Revenue'],
      type: 'Income',
    })
  }

  if (force) {
    // Archivar TODAS las filas existentes para esa fecha (incluso si parecían archivadas pero no lo estaban)
    let cursor: string | undefined
    do {
      const resp: any = await (notion as any).dataSources.query({
        data_source_id: NOTION_SPEND_DS_ID,
        filter: { property: 'Date', date: { equals: date } },
        page_size: 100,
        start_cursor: cursor,
      })
      for (const page of resp.results) {
        if (!isLive(page)) continue
        try {
          await notion.pages.update({ page_id: page.id, in_trash: true } as any)
        } catch {
          await notion.pages.update({ page_id: page.id, archived: true } as any)
        }
      }
      cursor = resp.has_more ? resp.next_cursor : undefined
    } while (cursor)
  }

  // Day totals (computed from in-memory rows — always accurate)
  const dayExpenses = chf(rows.filter((r) => r.type !== 'Income').reduce((s, r) => s + r.chf, 0))
  const dayRevenue = chf(stripeDay.revenue)
  const dayProfit = chf(dayRevenue - dayExpenses)
  const dayTotal = dayExpenses

  // Write rows
  for (const row of rows) {
    await writeSpendRow(notion, date, row)
  }

  const today = zurichISODate(new Date())
  const thisMonth = monthStart(today)
  const thisYear = yearStart(today)
  const previousMonth = previousMonthRange(today)

  let yesterdayTotals = { expense: dayExpenses, income: dayRevenue, rowsSeen: 0, rowsLive: rows.length, sourceCounts: {} }
  let monthTotals = { expense: 0, income: 0, rowsSeen: 0, rowsLive: 0, sourceCounts: {} }
  let previousMonthTotals = { expense: 0, income: 0, rowsSeen: 0, rowsLive: 0, sourceCounts: {} }
  let yearTotals = { expense: 0, income: 0, rowsSeen: 0, rowsLive: 0, sourceCounts: {} }

  try {
    ;[yesterdayTotals, monthTotals, previousMonthTotals, yearTotals] = await Promise.all([
      getTotalsBetween(notionToken, date, date),
      getTotalsBetween(notionToken, thisMonth, today),
      getTotalsBetween(notionToken, previousMonth.start, previousMonth.end),
      getTotalsBetween(notionToken, thisYear, today),
    ])
    if (yesterdayTotals.rowsLive === 0) {
      yesterdayTotals = { expense: dayExpenses, income: dayRevenue, rowsSeen: 0, rowsLive: rows.length, sourceCounts: {} }
    }
  } catch {
    yesterdayTotals = { expense: dayExpenses, income: dayRevenue, rowsSeen: 0, rowsLive: rows.length, sourceCounts: {} }
  }

  const monthExpenses = monthTotals.expense
  const monthRevenue = monthTotals.income
  const monthProfit = profitFromTotals(monthTotals)
  const previousMonthProfit = profitFromTotals(previousMonthTotals)
  const yearExpenses = yearTotals.expense
  const yearRevenue = yearTotals.income
  const yearProfit = profitFromTotals(yearTotals)
  const monthTotal = monthExpenses
  const yearTotal = yearExpenses
  const _diag = {
    rowsWritten: rows.length,
    yesterdayRows: yesterdayTotals.rowsLive,
    monthRows: monthTotals.rowsLive,
    previousMonthRows: previousMonthTotals.rowsLive,
    yearRows: yearTotals.rowsLive,
  }

  // ── Phase 2: Haiku insight ──
  let insight = ''
  let anomalies: string[] = []
  try {
    const payload = {
      date,
      day_total_chf: dayTotal,
      month_to_date_chf: monthTotal,
      year_to_date_chf: yearTotal,
      stripe_revenue_chf: stripeDay.revenue,
      meta_ads_roas: metaSpend > 0 ? +(stripeDay.revenue / metaSpend).toFixed(2) : null,
      breakdown: rows.map((r) => ({ source: r.source, chf: chf(r.chf), type: r.type })),
    }
    if (anthropicKey) {
      const result = await generateInsight(payload, anthropicKey)
      insight = result.insight
      anomalies = result.anomalies
    } else {
      insight = `Sync OK. Ingresos Stripe: ${stripeDay.revenue.toFixed(2)} CHF; gastos registrados: ${dayExpenses.toFixed(2)} CHF; beneficio estimado: ${dayProfit.toFixed(2)} CHF.`
    }
  } catch (err: any) {
    insight = `Sync OK pero Haiku falló: ${err?.message?.slice(0, 200) || 'unknown'}`
  }

  // ── Update Dashboard callouts ──
  try {
    const { insightId, totalsId, profitId } = await findCalloutBlocks(notion)
    if (insightId) {
      const lines = [`Insight de hoy (${date}):`, insight]
      if (anomalies.length) lines.push('⚠️ ' + anomalies.join(' · '))
      await updateCallout(notion, insightId, lines, 'blue_background')
    }
    if (totalsId) {
      await updateCallout(
        notion,
        totalsId,
        [
          `Totales auto (${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC)`,
          `Ayer (${date}): ingresos ${yesterdayTotals.income.toFixed(2)} CHF · gastos ${yesterdayTotals.expense.toFixed(2)} CHF · beneficio ${profitFromTotals(yesterdayTotals).toFixed(2)} CHF`,
          `Mes (${today.slice(0, 7)}): ingresos ${monthRevenue.toFixed(2)} CHF · gastos ${monthExpenses.toFixed(2)} CHF · beneficio ${monthProfit.toFixed(2)} CHF`,
          `Año (${today.slice(0, 4)}): ingresos ${yearRevenue.toFixed(2)} CHF · gastos ${yearExpenses.toFixed(2)} CHF · beneficio ${yearProfit.toFixed(2)} CHF`,
        ],
        'gray_background',
      )
    }
    if (profitId) {
      const fmt = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)} CHF`
      await updateCallout(
        notion,
        profitId,
        [
          `Resumen financiero (auto, actualizado ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC)`,
          `Ayer (${date}): ingresos ${yesterdayTotals.income.toFixed(2)} CHF · gastos ${yesterdayTotals.expense.toFixed(2)} CHF · beneficio ${fmt(profitFromTotals(yesterdayTotals))}`,
          `Este mes (${today.slice(0, 7)}): ingresos ${monthRevenue.toFixed(2)} CHF · gastos ${monthExpenses.toFixed(2)} CHF · beneficio ${fmt(monthProfit)}`,
          `Mes anterior (${previousMonth.label}): ingresos ${previousMonthTotals.income.toFixed(2)} CHF · gastos ${previousMonthTotals.expense.toFixed(2)} CHF · beneficio ${fmt(previousMonthProfit)}`,
          `Este año (${today.slice(0, 4)}): ingresos ${yearRevenue.toFixed(2)} CHF · gastos ${yearExpenses.toFixed(2)} CHF · beneficio ${fmt(yearProfit)}`,
        ],
        yearProfit >= 0 ? 'green_background' : 'red_background',
      )
    }
  } catch (err: any) {
    // Si falla el update de callouts, no es crítico — los datos están en la DB
  }

  return NextResponse.json({
    ok: true,
    date,
    rows: rows.length,
    dayExpenses,
    dayRevenue,
    dayProfit,
    monthExpenses,
    monthRevenue,
    monthProfit,
    yearExpenses,
    yearRevenue,
    yearProfit,
    metaSpend,
    stripeFees: stripeDay.fees,
    tiaraCommission,
    insight,
    anomalies,
    diag: _diag,
  })
}
