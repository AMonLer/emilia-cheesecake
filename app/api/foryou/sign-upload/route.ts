import { NextResponse } from 'next/server'
import {
  signUpload,
  getUploadCredentials,
  cloudinaryConfigured,
  FORYOU_FOLDER,
} from '@/lib/cloudinary'

// Hands the browser a short-lived signature so it can upload a file directly to
// Cloudinary (bypassing the 4.5MB serverless body limit) without ever seeing the API secret.
export async function POST() {
  if (!cloudinaryConfigured) {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 })
  }

  const timestamp = Math.round(Date.now() / 1000)
  const folder = FORYOU_FOLDER
  const signature = signUpload({ folder, timestamp })
  const { cloudName, apiKey } = getUploadCredentials()

  return NextResponse.json({ timestamp, signature, folder, cloudName, apiKey })
}
