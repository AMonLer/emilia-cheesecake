import { NextRequest, NextResponse } from 'next/server'
import { Client as NotionClient } from '@notionhq/client'
import Stripe from 'stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const CLARITY_DATA_SOURCE_ID = '9419d709-2008-47e3-a3f6-3d3125bb3aea'
const CLARITY_API = 'https://www.clarity.ms/export-data/api/v1/project-live-insights'

type ClarityMetric = { metricName: string; information: any[] }

function classifySource(url: string | null): string {
  if (!url) return 'Direct'
  const u = url.toLowerCase()
  if (u.includes('instagram')) return 'ig'
  if (u.includes('facebook') || u.includes('fb.')) return 'fb'
  if (u.includes('google')) return 'google'
  if (u.includes('emilialab.com')) return 'Direct'
  try {
    return new URL(url).hostname
  } catch {
    return 'Other'
  }
}

function pickFirst(metrics: ClarityMetric[], name: string): any {
  return metrics.find((m) => m.metricName === name)?.information?.[0]
}

function pickAll(metrics: ClarityMetric[], name: string): any[] {
  return metrics.find((m) => m.metricName === name)?.information ?? []
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clarityToken = process.env.CLARITY_API_TOKEN
  const notionToken = process.env.NOTION_TOKEN
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!clarityToken || !notionToken || !stripeKey) {
    return NextResponse.json({ error: 'Missing CLARITY_API_TOKEN, NOTION_TOKEN or STRIPE_SECRET_KEY' }, { status: 500 })
  }

  const clarityResp = await fetch(`${CLARITY_API}?numOfDays=1`, {
    headers: { Authorization: `Bearer ${clarityToken}` },
  })
  if (!clarityResp.ok) {
    const text = await clarityResp.text()
    return NextResponse.json({ error: `Clarity API ${clarityResp.status}`, body: text.slice(0, 500) }, { status: 502 })
  }
  const metrics: ClarityMetric[] = await clarityResp.json()

  const traffic = pickFirst(metrics, 'Traffic')
  const dead = pickFirst(metrics, 'DeadClickCount')
  const rage = pickFirst(metrics, 'RageClickCount')
  const quick = pickFirst(metrics, 'QuickbackClick')
  const errs = pickFirst(metrics, 'ScriptErrorCount')
  const devices = pickAll(metrics, 'Device')
  const pages = pickAll(metrics, 'PopularPages')
  const refs = pickAll(metrics, 'ReferrerUrl')

  const sessions = parseInt(traffic?.totalSessionCount ?? '0', 10)
  const users = parseInt(traffic?.distinctUserCount ?? '0', 10)
  const ppv = parseFloat(traffic?.pagesPerSessionPercentage ?? '0')
  const pageViews = Math.round(sessions * ppv)
  const mobileCount = parseInt(
    devices.find((d) => d.name === 'Mobile')?.sessionsCount ?? '0',
    10,
  )
  const mobilePct = sessions > 0 ? +((mobileCount / sessions) * 100).toFixed(2) : 0

  const sourceCounts: Record<string, number> = {}
  for (const r of refs) {
    const src = classifySource(r.name)
    sourceCounts[src] = (sourceCounts[src] || 0) + parseInt(r.sessionsCount || '0', 10)
  }
  const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
  const topPage = (pages[0]?.url ?? '').replace('https://www.', '')

  const yesterday = new Date()
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  yesterday.setUTCHours(0, 0, 0, 0)
  const today = new Date(yesterday)
  today.setUTCDate(today.getUTCDate() + 1)

  const stripe = new Stripe(stripeKey)
  let purchases = 0
  let hasMore = true
  let startingAfter: string | undefined
  while (hasMore) {
    const list: Stripe.ApiList<Stripe.PaymentIntent> = await stripe.paymentIntents.list({
      created: {
        gte: Math.floor(yesterday.getTime() / 1000),
        lt: Math.floor(today.getTime() / 1000),
      },
      limit: 100,
      starting_after: startingAfter,
    })
    for (const pi of list.data) {
      if (pi.status === 'succeeded') purchases++
    }
    hasMore = list.has_more
    startingAfter = list.data[list.data.length - 1]?.id
    if (!startingAfter) break
  }

  const conversionPct = sessions > 0 ? +((purchases / sessions) * 100).toFixed(2) : 0
  const dateStr = yesterday.toISOString().slice(0, 10)

  const notion = new NotionClient({ auth: notionToken })
  const created = await notion.pages.create({
    parent: { type: 'data_source_id', data_source_id: CLARITY_DATA_SOURCE_ID } as any,
    properties: {
      Date: { title: [{ text: { content: dateStr } }] },
      Sessions: { number: sessions },
      Users: { number: users },
      'Page Views': { number: pageViews },
      Purchases: { number: purchases },
      'Conversion %': { number: conversionPct },
      'Dead Clicks %': { number: dead?.sessionsWithMetricPercentage ?? 0 },
      'Rage Clicks %': { number: rage?.sessionsWithMetricPercentage ?? 0 },
      'JS Errors %': { number: errs?.sessionsWithMetricPercentage ?? 0 },
      'Quick Backs %': { number: quick?.sessionsWithMetricPercentage ?? 0 },
      'Mobile %': { number: mobilePct },
      'Top Source': { rich_text: [{ text: { content: topSource } }] },
      'Top Page': { rich_text: [{ text: { content: topPage } }] },
      Notes: {
        rich_text: [
          { text: { content: `Auto-synced ${new Date().toISOString()}` } },
        ],
      },
    } as any,
  })

  return NextResponse.json({
    ok: true,
    date: dateStr,
    sessions,
    users,
    pageViews,
    purchases,
    conversionPct,
    topSource,
    topPage,
    deadClicksPct: dead?.sessionsWithMetricPercentage ?? 0,
    notionPageId: (created as any).id,
  })
}
