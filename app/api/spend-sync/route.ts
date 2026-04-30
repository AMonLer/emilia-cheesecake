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
}

// ─── Types ───────────────────────────────────────────────────────────────
type SpendRow = {
  source: string
  concept: string
  chf: number
  category: string
  type: 'Variable' | 'Fixed (prorated)' | 'Variable %'
}

// ─── Helpers ─────────────────────────────────────────────────────────────
function yesterdayISO(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

function monthStart(dateISO: string): string {
  return dateISO.slice(0, 7) + '-01'
}

function yearStart(dateISO: string): string {
  return dateISO.slice(0, 4) + '-01-01'
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
  const start = Math.floor(new Date(`${date}T00:00:00Z`).getTime() / 1000)
  const end = start + 24 * 3600
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
async function existingRowsForDate(notion: NotionClient, date: string): Promise<number> {
  const resp: any = await (notion as any).dataSources.query({
    data_source_id: NOTION_SPEND_DS_ID,
    filter: {
      property: 'Date',
      date: { equals: date },
    },
    page_size: 100,
  })
  return resp?.results?.length ?? 0
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

async function sumChfBetween(notion: NotionClient, since: string, until: string): Promise<number> {
  let total = 0
  let cursor: string | undefined
  do {
    const resp: any = await (notion as any).dataSources.query({
      data_source_id: NOTION_SPEND_DS_ID,
      filter: {
        and: [
          { property: 'Date', date: { on_or_after: since } },
          { property: 'Date', date: { on_or_before: until } },
        ],
      },
      page_size: 100,
      start_cursor: cursor,
    })
    for (const page of resp.results) {
      const v = page.properties?.CHF?.number
      if (typeof v === 'number') total += v
    }
    cursor = resp.has_more ? resp.next_cursor : undefined
  } while (cursor)
  return chf(total)
}

async function findCalloutBlocks(notion: NotionClient): Promise<{ insightId?: string; totalsId?: string }> {
  const resp: any = await notion.blocks.children.list({ block_id: NOTION_DASHBOARD_PAGE_ID, page_size: 50 })
  let insightId: string | undefined
  let totalsId: string | undefined
  for (const block of resp.results) {
    if (block.type !== 'callout') continue
    const text = (block.callout?.rich_text || []).map((r: any) => r.plain_text || '').join('')
    if (!insightId && text.includes('Insight de hoy')) insightId = block.id
    else if (!totalsId && text.includes('Totales')) totalsId = block.id
    if (insightId && totalsId) break
  }
  return { insightId, totalsId }
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
  const auth = req.headers.get('authorization') || ''
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  if (auth !== `Bearer ${cronSecret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notionToken = process.env.NOTION_TOKEN
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const metaToken = process.env.META_ACCESS_TOKEN
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!notionToken || !stripeKey || !metaToken || !anthropicKey) {
    return NextResponse.json(
      { error: 'Missing one of NOTION_TOKEN, STRIPE_SECRET_KEY, META_ACCESS_TOKEN, ANTHROPIC_API_KEY' },
      { status: 500 },
    )
  }

  const date = req.nextUrl.searchParams.get('date') || yesterdayISO()
  const force = req.nextUrl.searchParams.get('force') === '1'

  const notion = new NotionClient({ auth: notionToken })
  const stripe = new Stripe(stripeKey)

  // Idempotence
  const existing = await existingRowsForDate(notion, date)
  if (existing > 0 && !force) {
    return NextResponse.json({ ok: true, date, skipped: true, existing })
  }

  // ── Phase 1: pull deterministic data ──
  const [metaSpend, stripeDay] = await Promise.all([
    fetchMetaSpend(date, metaToken),
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

  if (force && existing > 0) {
    // Limpiamos antes de re-escribir
    let cursor: string | undefined
    do {
      const resp: any = await (notion as any).dataSources.query({
        data_source_id: NOTION_SPEND_DS_ID,
        filter: { property: 'Date', date: { equals: date } },
        page_size: 100,
        start_cursor: cursor,
      })
      for (const page of resp.results) {
        await notion.pages.update({ page_id: page.id, archived: true } as any)
      }
      cursor = resp.has_more ? resp.next_cursor : undefined
    } while (cursor)
  }

  for (const row of rows) {
    await writeSpendRow(notion, date, row)
  }

  // ── Totales ──
  const dayTotal = chf(rows.reduce((s, r) => s + r.chf, 0))
  const monthTotal = await sumChfBetween(notion, monthStart(date), date)
  const yearTotal = await sumChfBetween(notion, yearStart(date), date)

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
    const result = await generateInsight(payload, anthropicKey)
    insight = result.insight
    anomalies = result.anomalies
  } catch (err: any) {
    insight = `Sync OK pero Haiku falló: ${err?.message?.slice(0, 200) || 'unknown'}`
  }

  // ── Update Dashboard callouts ──
  try {
    const { insightId, totalsId } = await findCalloutBlocks(notion)
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
          `Totales (${date}):`,
          `Hoy: ${dayTotal.toFixed(2)} CHF · Este mes: ${monthTotal.toFixed(2)} CHF · Este año: ${yearTotal.toFixed(2)} CHF`,
        ],
        'gray_background',
      )
    }
  } catch (err: any) {
    // Si falla el update de callouts, no es crítico — los datos están en la DB
  }

  return NextResponse.json({
    ok: true,
    date,
    rows: rows.length,
    dayTotal,
    monthTotal,
    yearTotal,
    metaSpend,
    stripeRevenue: stripeDay.revenue,
    stripeFees: stripeDay.fees,
    tiaraCommission,
    insight,
    anomalies,
  })
}
