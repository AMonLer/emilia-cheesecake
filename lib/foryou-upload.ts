// Browser side of a For You upload: the file goes straight to Cloudinary
// (bypassing the 4.5 MB serverless body limit) with a signature from our API,
// which never hands out the API secret.

export type UploadSignature = { timestamp: number; signature: string; folder: string; cloudName: string; apiKey: string }

export async function uploadToCloudinary(
  file: Blob,
  fileName: string,
  sign: () => Promise<UploadSignature>,
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
): Promise<{ secureUrl: string }> {
  const { timestamp, signature, folder, cloudName, apiKey } = await sign()
  if (signal?.aborted) throw new DOMException('Upload cancelled', 'AbortError')

  const form = new FormData()
  form.append('file', file, fileName)
  form.append('api_key', apiKey)
  form.append('timestamp', String(timestamp))
  form.append('signature', signature)
  form.append('folder', folder)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve({ secureUrl: JSON.parse(xhr.responseText).secure_url })
        } catch {
          reject(new Error('Upload failed'))
        }
      } else {
        reject(new Error('Upload failed'))
      }
    }
    xhr.onerror = () => reject(new Error('Upload failed'))
    // Settled here, not only in onabort: a request not sent yet fires no events.
    signal?.addEventListener('abort', () => {
      xhr.abort()
      reject(new DOMException('Upload cancelled', 'AbortError'))
    }, { once: true })
    xhr.send(form)
  })
}

export async function requestUploadSignature(url: string, body: unknown): Promise<UploadSignature> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Could not start upload')
  return res.json()
}

// Phone photos are 3–12 MB; the recipient sees them on a phone screen. Scaled
// down to 2000 px they upload in a second or two instead of half a minute.
// Anything the browser cannot decode goes up as it is.
export async function shrinkPhoto(file: File): Promise<{ blob: Blob; name: string }> {
  const original = { blob: file as Blob, name: file.name || 'photo.jpg' }
  if (file.size < 1_500_000 || typeof document === 'undefined') return original
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    const scale = Math.min(1, 2000 / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return original
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, 'image/jpeg', 0.85))
    return blob && blob.size < file.size ? { blob, name: 'photo.jpg' } : original
  } catch {
    return original
  } finally {
    URL.revokeObjectURL(url)
  }
}
