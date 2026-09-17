import { NextRequest, NextResponse } from 'next/server'
import { forYouCookieName, verifyForYouSession } from '@/lib/foryou-auth'
import {
  signUpload,
  getUploadCredentials,
  cloudinaryConfigured,
  FORYOU_FOLDER,
} from '@/lib/cloudinary'

// Hands the browser a short-lived signature so it can upload a file directly to
// Cloudinary (bypassing the 4.5MB serverless body limit) without ever seeing the API secret.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const code = String(body?.code || '').trim().toUpperCase()
  if (!verifyForYouSession(req.cookies.get(forYouCookieName(code))?.value, code)) {
    return NextResponse.json({ error: 'Payment authorization required' }, { status: 403 })
  }
  if (!cloudinaryConfigured) {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 })
  }

  const timestamp = Math.round(Date.now() / 1000)
  const folder = FORYOU_FOLDER
  const signature = signUpload({ folder, timestamp })
  const { cloudName, apiKey } = getUploadCredentials()

  return NextResponse.json({ timestamp, signature, folder, cloudName, apiKey })
}
