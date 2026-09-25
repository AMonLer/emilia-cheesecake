import { getForYouMessage } from "@/lib/foryou-store"
import { isForYouCode } from "@/lib/foryou-auth"
import { videoDeliveryUrl, videoPosterUrl, imageDeliveryUrl, attachmentDeliveryUrl } from "@/lib/cloudinary-urls"
import RecipientView from "@/components/foryou/RecipientView"

export const dynamic = "force-dynamic"

function isImageUrl(url: string): boolean {
  return /\.(jpe?g|png|gif|webp|avif|heic)$/i.test(url)
}

export default async function ForYouCodePage({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase()
  if (!isForYouCode(code)) return <RecipientView state="notFound" />

  let data
  try {
    data = await getForYouMessage(code, true)
  } catch {
    // Storage briefly unavailable: a warm greeting beats "code not found".
    return <RecipientView state="greeting" />
  }

  // No row: nobody was given this code, so it was mistyped.
  if (!data) return <RecipientView state="notFound" />

  if (!data.message && !data.videoUrl && !data.fileUrl) return <RecipientView state="greeting" />

  const fileIsImage = Boolean(data.fileUrl && isImageUrl(data.fileUrl))
  return (
    <RecipientView
      state="message"
      content={{
        message: data.message,
        videoUrl: data.videoUrl ? videoDeliveryUrl(data.videoUrl) : undefined,
        videoPoster: data.videoUrl ? videoPosterUrl(data.videoUrl) : undefined,
        photoUrl: data.fileUrl && fileIsImage ? imageDeliveryUrl(data.fileUrl) : undefined,
        attachmentUrl: data.fileUrl && !fileIsImage ? attachmentDeliveryUrl(data.fileUrl, data.fileName) : undefined,
        attachmentName: data.fileName,
      }}
    />
  )
}
