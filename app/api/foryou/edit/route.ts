import { NextRequest, NextResponse } from 'next/server'
import { forYouCookieName, forYouCookieOptions, isForYouCode, verifyForYouSession } from '@/lib/foryou-auth'

// Target of the link in the order e-mails: turns the signed token into the
// editing cookie on whatever device the buyer opens it, then shows the editor.
// The token stays out of the page URL, so it is not shared by accident.
export async function GET(req: NextRequest) {
  const code = (req.nextUrl.searchParams.get('code') || '').trim()
  const token = req.nextUrl.searchParams.get('t') || ''

  if (!isForYouCode(code)) {
    return NextResponse.redirect(new URL('/foryou', req.url), 303)
  }

  const response = NextResponse.redirect(new URL(`/foryou/${code}/create`, req.url), 303)
  response.headers.set('Cache-Control', 'no-store')
  response.headers.set('Referrer-Policy', 'no-referrer')
  // An expired or tampered link just lands on the editor's "open the link" screen.
  if (verifyForYouSession(token, code)) {
    response.cookies.set(forYouCookieName(code), token, forYouCookieOptions)
  }
  return response
}
