import { NextRequest, NextResponse } from 'next/server'
import { isForYouCode } from '@/lib/foryou-code'

// Target of the "create your message" link in older order e-mails. Gift
// messages are only made in the checkout now (afterwards only through the
// shop, by e-mail), so the link opens the gift page itself.
export async function GET(req: NextRequest) {
  const code = (req.nextUrl.searchParams.get('code') || '').trim()
  const response = NextResponse.redirect(new URL(isForYouCode(code) ? `/foryou/${code}` : '/foryou', req.url), 303)
  // The old links carried a signed token: keep it out of the next page's Referer.
  response.headers.set('Referrer-Policy', 'no-referrer')
  return response
}
