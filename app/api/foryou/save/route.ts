import { NextRequest, NextResponse } from 'next/server'
import { getForYouMessage, saveForYouMessage } from '@/lib/foryou-store'
import { forYouCookieName, verifyForYouSession } from '@/lib/foryou-auth'
import { getUploadCredentials } from '@/lib/cloudinary'
import { getForYouOrder } from '@/lib/foryou-order'

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
    const session = verifyForYouSession(req.cookies.get(forYouCookieName(code))?.value, code)
    if (!session) return NextResponse.json({ error: 'Payment authorization required' }, { status: 403 })

    // A saved message can be changed until the delivery slot starts, so a buyer
    // can save the text now and add the video later. Once the cake may be at the
    // door it is locked, so what the recipient sees never changes; later changes
    // go through support. Without a known delivery time it stays locked.
    const existing = await getForYouMessage(code)
    if (existing && (existing.message || existing.videoUrl || existing.fileUrl)) {
      const order = await getForYouOrder(session.paymentIntentId)
      if (!order?.editableUntil || Date.now() >= order.editableUntil) {
        return NextResponse.json({ error: 'Message already saved' }, { status: 409 })
      }
    }

    if (!message && !videoUrl && !fileUrl) {
      return NextResponse.json({ error: 'Nothing to save' }, { status: 400 })
    }
    // Only accept media URLs that actually come from Cloudinary.
    for (const url of [videoUrl, fileUrl]) {
      if (url && !url.startsWith(`https://res.cloudinary.com/${getUploadCredentials().cloudName}/`)) {
        return NextResponse.json({ error: 'Invalid media URL' }, { status: 400 })
      }
    }

    const ok = await saveForYouMessage({ code, message, videoUrl, fileUrl, fileName, paymentIntentId: session.paymentIntentId })
    if (!ok) {
      return NextResponse.json({ error: 'Could not save message' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Error saving For You message:', error)
    return NextResponse.json({ error: 'Could not save message' }, { status: 500 })
  }
}
