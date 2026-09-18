import { NextRequest, NextResponse } from 'next/server'

// Errores JS del navegador (p. ej. el WebView de Instagram en Android) → Telegram.
// Antes estos fallos solo aparecían como "sesiones atascadas" en Clarity.
// Mismo mensaje → como mucho un aviso cada 10 minutos por instancia.
const lastSent = new Map<string, number>()

export async function POST(req: NextRequest) {
  try {
    const { message, source, line, url, ua } = await req.json()
    const text = String(message || '').slice(0, 300)
    if (!text) return NextResponse.json({ ok: false }, { status: 400 })

    const key = text
    const now = Date.now()
    if (now - (lastSent.get(key) || 0) < 10 * 60 * 1000) {
      return NextResponse.json({ ok: true, deduped: true })
    }
    lastSent.set(key, now)
    if (lastSent.size > 200) lastSent.clear()

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID
    if (botToken && chatId) {
      const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
      const body = [
        '⚠️ <b>Error JS en la web</b>',
        `<code>${esc(text)}</code>`,
        source ? `📍 ${esc(String(source).slice(0, 120))}${line ? ':' + line : ''}` : '',
        `📄 ${esc(String(url || '').slice(0, 120))}`,
        `📱 ${esc(String(ua || '').slice(0, 160))}`,
      ].filter(Boolean).join('\n')

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: body, parse_mode: 'HTML' }),
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
