import { NextRequest, NextResponse } from 'next/server'
import { signUpload, getUploadCredentials, cloudinaryConfigured } from '@/lib/cloudinary'
import { CHECKOUT_UPLOAD_FOLDER } from '@/lib/foryou-checkout'

// Signs uploads for a gift made in the checkout, before there is an order (or
// an editing session) to check. What keeps it from being free file hosting:
// requests from this site only, a small budget per address, and a folder of
// its own. Nothing uploaded here is shown anywhere until an order is paid.
const WINDOW_MS = 10 * 60_000
const MAX_PER_WINDOW = 12
const recent = new Map<string, number[]>()

function overBudget(key: string, now: number): boolean {
  if (recent.size > 5000) recent.clear()
  const hits = (recent.get(key) || []).filter((t) => now - t < WINDOW_MS)
  if (hits.length >= MAX_PER_WINDOW) {
    recent.set(key, hits)
    return true
  }
  hits.push(now)
  recent.set(key, hits)
  return false
}

export async function POST(req: NextRequest) {
  const site = req.headers.get('sec-fetch-site')
  const origin = req.headers.get('origin')
  let originHost = ''
  try { originHost = origin ? new URL(origin).host : '' } catch { originHost = 'invalid' }
  if ((site && site !== 'same-origin') || (originHost && originHost !== req.headers.get('host'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const address = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
  if (overBudget(address, Date.now())) {
    return NextResponse.json({ error: 'Too many uploads' }, { status: 429 })
  }
  if (!cloudinaryConfigured) {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 })
  }

  const timestamp = Math.round(Date.now() / 1000)
  const folder = CHECKOUT_UPLOAD_FOLDER
  const signature = signUpload({ folder, timestamp })
  const { cloudName, apiKey } = getUploadCredentials()

  return NextResponse.json(
    { timestamp, signature, folder, cloudName, apiKey },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
