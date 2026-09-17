import { createHmac, timingSafeEqual } from 'node:crypto'

export const FORYOU_SESSION_SECONDS = 30 * 24 * 60 * 60
export const isForYouCode = (code: string) => /^EM-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/.test(code)
export const forYouCookieName = (code: string) => `emilia-foryou-${code}`

function signature(payload: string): string {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) throw new Error('For You authentication is not configured')
  return createHmac('sha256', secret).update(`emilia-foryou-edit:${payload}`).digest('base64url')
}

export function createForYouSession(code: string, paymentIntentId: string, now = Date.now()): string {
  if (!isForYouCode(code)) throw new Error('Invalid For You code')
  const payload = Buffer.from(JSON.stringify({ code, paymentIntentId, expires: now + FORYOU_SESSION_SECONDS * 1000 })).toString('base64url')
  return `${payload}.${signature(payload)}`
}

export function verifyForYouSession(token: string | undefined, code: string, now = Date.now()): { paymentIntentId: string } | null {
  if (!token || !isForYouCode(code)) return null
  try {
    const [payload, signed, extra] = token.split('.')
    if (!payload || !signed || extra) return null
    const expected = Buffer.from(signature(payload))
    const supplied = Buffer.from(signed)
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (data.code !== code || !Number.isFinite(data.expires) || data.expires <= now || typeof data.paymentIntentId !== 'string' || !data.paymentIntentId.startsWith('pi_')) return null
    return { paymentIntentId: data.paymentIntentId }
  } catch {
    return null
  }
}
