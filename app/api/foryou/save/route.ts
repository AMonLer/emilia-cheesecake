import { NextRequest, NextResponse } from 'next/server'
import { saveForYouMessage } from '@/lib/foryou-store'

const MAX_MESSAGE_LENGTH = 2000

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const code = String(body?.code || '').trim().toUpperCase()
    const message = String(body?.message || '').trim().slice(0, MAX_MESSAGE_LENGTH)
    const videoUrl = String(body?.videoUrl || '').trim()
    const fileUrl = String(body?.fileUrl || '').trim()
    const fileName = String(body?.fileName || '').trim().slice(0, 200)

    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 })
    }
    if (!message && !videoUrl && !fileUrl) {
      return NextResponse.json({ error: 'Nothing to save' }, { status: 400 })
    }
    // Only accept media URLs that actually come from Cloudinary.
    for (const url of [videoUrl, fileUrl]) {
      if (url && !/^https:\/\/res\.cloudinary\.com\//.test(url)) {
        return NextResponse.json({ error: 'Invalid media URL' }, { status: 400 })
      }
    }

    const ok = await saveForYouMessage({ code, message, videoUrl, fileUrl, fileName })
    if (!ok) {
      return NextResponse.json({ error: 'Could not save message' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Error saving For You message:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
