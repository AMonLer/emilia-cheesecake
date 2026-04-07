import { NextRequest, NextResponse } from 'next/server'

// Temporary diagnostic endpoint. Protected by a query token that must match
// ADMIN_SESSION_SECRET (so only the operator who configured the env vars can hit it).
// Remove this file once the env vars are confirmed correct.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('t') || ''
  const secret = process.env.ADMIN_SESSION_SECRET || ''
  if (!secret || token !== secret) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const inspect = (name: string) => {
    const raw = process.env[name]
    if (raw === undefined) return { set: false }
    return {
      set: true,
      length: raw.length,
      trimmedLength: raw.trim().length,
      hasLeadingSpace: raw.startsWith(' '),
      hasTrailingSpace: raw.endsWith(' '),
      hasNewline: /[\r\n]/.test(raw),
      firstCharCode: raw.charCodeAt(0),
      lastCharCode: raw.charCodeAt(raw.length - 1),
    }
  }

  // List all env var names that start with ADMIN or PARTNER, to catch typos
  const allKeys = Object.keys(process.env)
    .filter((k) => /^(ADMIN|PARTNER)/i.test(k))
    .sort()

  return NextResponse.json({
    expected: {
      ADMIN_USER: inspect('ADMIN_USER'),
      ADMIN_PASS: inspect('ADMIN_PASS'),
      PARTNER_USER: inspect('PARTNER_USER'),
      PARTNER_PASS: inspect('PARTNER_PASS'),
      ADMIN_SESSION_SECRET: { set: !!secret, length: secret.length },
    },
    allMatchingKeys: allKeys,
  })
}
