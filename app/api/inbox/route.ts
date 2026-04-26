import { NextRequest, NextResponse } from 'next/server'
import { ImapFlow } from 'imapflow'
import { simpleParser, AddressObject } from 'mailparser'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

type InboxEmail = {
  uid: number
  from_name: string
  from_email: string
  to: string
  subject: string
  date: string | null
  flags: string[]
  seen: boolean
  answered: boolean
  body: string
}

function pickAddress(addr: AddressObject | AddressObject[] | undefined): { name: string; email: string; raw: string } {
  if (!addr) return { name: '', email: '', raw: '' }
  const obj = Array.isArray(addr) ? addr[0] : addr
  if (!obj) return { name: '', email: '', raw: '' }
  const value = obj.value?.[0]
  return {
    name: value?.name || '',
    email: value?.address || '',
    raw: obj.text || '',
  }
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const expected = process.env.INBOX_API_TOKEN

  if (req.nextUrl.searchParams.get('debug') === '1') {
    const e = expected || ''
    return NextResponse.json({
      env_present: !!expected,
      env_length: e.length,
      env_first6: e.slice(0, 6),
      env_last6: e.slice(-6),
      auth_header_received: !!auth,
      auth_header_length: auth.length,
    })
  }

  if (!expected) {
    return NextResponse.json({ error: 'INBOX_API_TOKEN not configured' }, { status: 500 })
  }
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const host = process.env.EMAIL_IMAP_HOST
  const user = process.env.EMAIL_IMAP_USER
  const pass = process.env.EMAIL_IMAP_PASSWORD
  if (!host || !user || !pass) {
    return NextResponse.json({ error: 'IMAP env vars missing' }, { status: 500 })
  }

  const hoursParam = Number(req.nextUrl.searchParams.get('hours') || '12')
  const hours = Number.isFinite(hoursParam) && hoursParam > 0 ? Math.min(hoursParam, 168) : 12
  const since = new Date(Date.now() - hours * 3600_000)

  const client = new ImapFlow({
    host,
    port: 993,
    secure: true,
    auth: { user, pass },
    logger: false,
  })

  const emails: InboxEmail[] = []

  try {
    await client.connect()
    const lock = await client.getMailboxLock('INBOX')
    try {
      const messages = client.fetch(
        { since },
        { uid: true, source: true, flags: true, internalDate: true },
      )
      for await (const msg of messages) {
        try {
          const parsed = await simpleParser(msg.source as Buffer)
          const from = pickAddress(parsed.from)
          const to = pickAddress(parsed.to)
          const flagsArr = Array.from((msg.flags as Set<string>) || [])
          emails.push({
            uid: msg.uid,
            from_name: from.name,
            from_email: from.email,
            to: to.raw,
            subject: parsed.subject || '',
            date: parsed.date ? parsed.date.toISOString() : (msg.internalDate ? new Date(msg.internalDate).toISOString() : null),
            flags: flagsArr,
            seen: flagsArr.includes('\\Seen'),
            answered: flagsArr.includes('\\Answered'),
            body: (parsed.text || '').slice(0, 3000),
          })
        } catch (err) {
          console.error('Failed to parse message uid', msg.uid, err)
        }
      }
    } finally {
      lock.release()
    }
    await client.logout()
  } catch (err: any) {
    console.error('IMAP error:', err)
    try { await client.logout() } catch {}
    return NextResponse.json({ error: err?.message || 'IMAP error' }, { status: 502 })
  }

  return NextResponse.json({
    fetched_at: new Date().toISOString(),
    since_hours: hours,
    count: emails.length,
    emails,
  })
}
