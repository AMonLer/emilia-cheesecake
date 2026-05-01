// Daily brief: pulls Notion data → Haiku 4.5 → Telegram message + Notion callout update
import { Client } from '@notionhq/client'
import fs from 'fs'

// ── Env loader ─────────────────────────────────────────────────────────
function loadEnv() {
  const env = {
    NOTION_TOKEN: process.env.NOTION_TOKEN,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  }
  if (Object.values(env).some((v) => !v) && fs.existsSync('.env.local')) {
    const local = Object.fromEntries(
      fs.readFileSync('.env.local', 'utf8')
        .split('\n')
        .filter((l) => l.includes('=') && !l.startsWith('#'))
        .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
    )
    for (const k of Object.keys(env)) if (!env[k]) env[k] = local[k]
  }
  for (const [k, v] of Object.entries(env)) if (!v) { console.error(`Missing ${k}`); process.exit(1) }
  return env
}

const env = loadEnv()
const notion = new Client({ auth: env.NOTION_TOKEN })
const SPEND_DS = '5f898cc4-ec8b-40dd-b85a-c8f879356aa8'
const CLARITY_DS = '9419d709-2008-47e3-a3f6-3d3125bb3aea'
const DASHBOARD = '34db6319-835a-81c8-98f0-c2e9de0f65c7'

// ── Pull all rows from a data source ───────────────────────────────────
async function pullAll(dsId) {
  const rows = []
  let cursor
  do {
    const resp = await notion.dataSources.query({ data_source_id: dsId, page_size: 100, start_cursor: cursor })
    for (const p of resp.results) {
      if (p.archived || p.in_trash) continue
      rows.push(p)
    }
    cursor = resp.has_more ? resp.next_cursor : undefined
  } while (cursor)
  return rows
}

const spendPages = await pullAll(SPEND_DS)
const clarityPages = await pullAll(CLARITY_DS)

// ── Date helpers ───────────────────────────────────────────────────────
const today = new Date()
const todayISO = today.toISOString().slice(0, 10)
const yesterday = new Date(today); yesterday.setUTCDate(yesterday.getUTCDate() - 1)
const yesterdayISO = yesterday.toISOString().slice(0, 10)
const thisMonth = todayISO.slice(0, 7)
const lastMonthDate = new Date(today); lastMonthDate.setUTCDate(1); lastMonthDate.setUTCMonth(lastMonthDate.getUTCMonth() - 1)
const lastMonth = lastMonthDate.toISOString().slice(0, 7)

// ── Aggregate spend ────────────────────────────────────────────────────
function spendRow(p) {
  return {
    date: p.properties?.Date?.date?.start,
    source: p.properties?.Source?.select?.name,
    chf: p.properties?.CHF?.number ?? 0,
  }
}
const spend = spendPages.map(spendRow).filter((r) => r.date)

function totals(filter) {
  let ingreso = 0, gasto = 0, metaSpend = 0
  for (const r of spend) {
    if (!filter(r)) continue
    if (r.source === 'Stripe Revenue') ingreso += -r.chf
    else gasto += r.chf
    if (r.source === 'Meta Ads') metaSpend += r.chf
  }
  return {
    ingreso: +ingreso.toFixed(2),
    gasto: +gasto.toFixed(2),
    beneficio: +(ingreso - gasto).toFixed(2),
    metaSpend: +metaSpend.toFixed(2),
    roas: metaSpend > 0 ? +(ingreso / metaSpend).toFixed(2) : null,
  }
}

const ayer = totals((r) => r.date === yesterdayISO)
const mesActual = totals((r) => r.date.slice(0, 7) === thisMonth)
const mesAnterior = totals((r) => r.date.slice(0, 7) === lastMonth)

// ── Aggregate clarity (last 7 days) ────────────────────────────────────
function clarityRow(p) {
  const props = p.properties || {}
  return {
    date: props.Date?.title?.[0]?.plain_text,
    sessions: props.Sessions?.number,
    users: props.Users?.number,
    pageViews: props['Page Views']?.number,
    purchases: props.Purchases?.number,
    conversionPct: props['Conversion %']?.number,
    deadClicksPct: props['Dead Clicks %']?.number,
    rageClicksPct: props['Rage Clicks %']?.number,
    jsErrorsPct: props['JS Errors %']?.number,
    quickBacksPct: props['Quick Backs %']?.number,
    mobilePct: props['Mobile %']?.number,
    topSource: props['Top Source']?.rich_text?.[0]?.plain_text,
    topPage: props['Top Page']?.rich_text?.[0]?.plain_text,
  }
}
const clarity = clarityPages.map(clarityRow).filter((r) => r.date).sort((a, b) => b.date.localeCompare(a.date))
const clarityLast7 = clarity.slice(0, 7)
const clarityYesterday = clarity.find((r) => r.date === yesterdayISO) || null

// ── Build payload for Haiku ────────────────────────────────────────────
const payload = {
  fecha_brief: todayISO,
  ayer: yesterdayISO,
  totales: {
    ayer,
    mes_en_curso: mesActual,
    mes_anterior: mesAnterior,
  },
  clarity_ayer: clarityYesterday,
  clarity_ultimos_7_dias: clarityLast7,
  contexto_negocio: 'Emilia Cheesecakes — venta online de cheesecakes premium en Suiza (Zürich área). Canales: Stripe (B2C web), entrega Tiguan. Marketing: Meta Ads (15 CHF/día, sólo Zurich-área). Costes fijos prorrateados: Tiara 150 CHF/mes (asistente con 5% comisión), Tiguan 63, Claude Pro 17, web 8.',
}

// ── Call Haiku 4.5 ─────────────────────────────────────────────────────
const haikuBody = {
  model: 'claude-haiku-4-5',
  max_tokens: 1500,
  system: `Eres un analista financiero senior que escribe el brief diario para Adrián, dueño de Emilia Cheesecakes. Recibes:
- Totales financieros (ingresos, gastos, beneficio) ayer/mes/mes anterior
- Métricas web Clarity (sesiones, conversión, bounces, dead clicks, etc.) último día y últimos 7 días
- Contexto del negocio

Tu output JSON:
{
  "headline": "1 frase punzante (qué pasó ayer + número clave)",
  "cifras": "3-4 líneas con los números más importantes (beneficio mes, ROAS Meta, sesiones, conversión)",
  "problemas": [
    {"titulo": "qué falla", "detalle": "número concreto", "accion": "qué hacer hoy en 1 frase"}
  ],
  "tono": "directo, dato-céntrico, sin relleno"
}

Reglas:
- Máximo 3 problemas, ordenados por impacto financiero
- Cada problema debe tener un número concreto y una acción ejecutable hoy
- Si todo va bien, "problemas" puede tener 1-2 ítems con oportunidades, no inventes drama
- Español natural, sin jerga`,
  messages: [
    {
      role: 'user',
      content: `Datos:\n\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\``,
    },
  ],
  output_config: {
    format: {
      type: 'json_schema',
      schema: {
        type: 'object',
        properties: {
          headline: { type: 'string' },
          cifras: { type: 'string' },
          problemas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                titulo: { type: 'string' },
                detalle: { type: 'string' },
                accion: { type: 'string' },
              },
              required: ['titulo', 'detalle', 'accion'],
              additionalProperties: false,
            },
          },
        },
        required: ['headline', 'cifras', 'problemas'],
        additionalProperties: false,
      },
    },
  },
}

const haikuResp = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  },
  body: JSON.stringify(haikuBody),
})
if (!haikuResp.ok) {
  const t = await haikuResp.text()
  console.error('Haiku error', haikuResp.status, t.slice(0, 300))
  process.exit(1)
}
const haikuJson = await haikuResp.json()
const text = (haikuJson.content || []).find((b) => b.type === 'text')?.text
if (!text) { console.error('No text from Haiku'); process.exit(1) }
const brief = JSON.parse(text)
console.log('Haiku output:', JSON.stringify(brief, null, 2))

// ── Build Telegram message (HTML) ──────────────────────────────────────
const fmt = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(2)} CHF`
const fmtPos = (n) => `${n.toFixed(2)} CHF`
const lines = [
  `<b>🌅 Brief diario · ${todayISO}</b>`,
  ``,
  `<b>${escapeHtml(brief.headline)}</b>`,
  ``,
  `<b>📊 Cifras clave</b>`,
  escapeHtml(brief.cifras),
  ``,
  `<b>📋 Totales</b>`,
  `Ayer (${yesterdayISO}): ingr ${fmtPos(ayer.ingreso)} · gasto ${fmtPos(ayer.gasto)} · <b>${fmt(ayer.beneficio)}</b>`,
  `Mes en curso: ingr ${fmtPos(mesActual.ingreso)} · gasto ${fmtPos(mesActual.gasto)} · <b>${fmt(mesActual.beneficio)}</b>`,
  `Mes anterior: ingr ${fmtPos(mesAnterior.ingreso)} · gasto ${fmtPos(mesAnterior.gasto)} · <b>${fmt(mesAnterior.beneficio)}</b>`,
  ``,
  `<b>🚨 Top problemas</b>`,
]
brief.problemas.slice(0, 3).forEach((p, i) => {
  lines.push(`${i + 1}. <b>${escapeHtml(p.titulo)}</b>`)
  lines.push(`   ${escapeHtml(p.detalle)}`)
  lines.push(`   👉 ${escapeHtml(p.accion)}`)
})

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
const message = lines.join('\n')

// ── Send Telegram ──────────────────────────────────────────────────────
const tgResp = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    chat_id: env.TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  }),
})
if (!tgResp.ok) {
  const t = await tgResp.text()
  console.error('Telegram error', tgResp.status, t.slice(0, 300))
  process.exit(1)
}
console.log('✅ Telegram sent')
