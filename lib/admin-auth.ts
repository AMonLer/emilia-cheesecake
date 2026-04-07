import { cookies } from 'next/headers'
import crypto from 'crypto'

export type Role = 'admin' | 'partner'

export const SESSION_COOKIE_NAME = 'emilia_admin_session'
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || secret.length < 16) {
    throw new Error('ADMIN_SESSION_SECRET is not configured (must be at least 16 chars)')
  }
  return secret
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex')
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export function createSessionToken(role: Role): { token: string; maxAgeSeconds: number } {
  const expiry = Date.now() + SESSION_DURATION_MS
  const payload = `${role}.${expiry}`
  const signature = sign(payload)
  return {
    token: `${payload}.${signature}`,
    maxAgeSeconds: Math.floor(SESSION_DURATION_MS / 1000),
  }
}

export function verifySessionToken(token: string | undefined): { role: Role } | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [role, expiryStr, signature] = parts
  if (role !== 'admin' && role !== 'partner') return null
  const expiry = Number(expiryStr)
  if (!Number.isFinite(expiry) || Date.now() > expiry) return null
  const expected = sign(`${role}.${expiryStr}`)
  if (!constantTimeEqual(signature, expected)) return null
  return { role: role as Role }
}

export function getSession(): { role: Role } | null {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value
  return verifySessionToken(token)
}

/**
 * Validates credentials against env vars and returns the matching role, or null.
 * Uses constant-time comparison to mitigate timing attacks on the password.
 */
export function checkCredentials(username: string, password: string): Role | null {
  const candidates: Array<{ role: Role; user?: string; pass?: string }> = [
    { role: 'admin', user: process.env.ADMIN_USER, pass: process.env.ADMIN_PASS },
    { role: 'partner', user: process.env.PARTNER_USER, pass: process.env.PARTNER_PASS },
  ]

  const normalizedUsername = username.trim().toLowerCase()
  for (const c of candidates) {
    if (!c.user || !c.pass) continue
    if (normalizedUsername === c.user.trim().toLowerCase() && constantTimeEqual(password, c.pass)) {
      return c.role
    }
  }
  return null
}
