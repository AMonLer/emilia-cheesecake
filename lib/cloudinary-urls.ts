// Delivery URL helpers, free of server code so the checkout can use them too.
// Cloudinary's secure_url points at the original file. Inserting transformation
// flags after "/upload/" lets it transcode + optimize on the fly (f_auto picks a
// format the viewer's browser supports — this is what fixes iPhone HEVC on Android).

export function videoDeliveryUrl(secureUrl: string): string {
  return secureUrl.replace('/upload/', '/upload/f_auto,q_auto/')
}

export function videoPosterUrl(secureUrl: string): string {
  return secureUrl
    .replace('/upload/', '/upload/so_0,f_jpg,q_auto/')
    .replace(/\.[^/.]+$/, '.jpg')
}

export function imageDeliveryUrl(secureUrl: string): string {
  return secureUrl.replace('/upload/', '/upload/f_auto,q_auto/')
}

// Small cropped still for a thumbnail: the photo itself, or a video's first frame.
export function thumbnailUrl(secureUrl: string, kind: 'photo' | 'video', size = 320): string {
  const crop = `c_fill,w_${size},h_${size},q_auto`
  return kind === 'video'
    ? secureUrl.replace('/upload/', `/upload/so_0,${crop},f_jpg/`).replace(/\.[^/.]+$/, '.jpg')
    : secureUrl.replace('/upload/', `/upload/${crop},f_auto/`)
}

// Fuerza la descarga (Content-Disposition: attachment) con un nombre legible.
// El atributo download de <a> no funciona cross-origin, así que lo hace el servidor.
export function attachmentDeliveryUrl(secureUrl: string, fileName?: string): string {
  const base = (fileName || 'attachment')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-z0-9-_]+/gi, '_')
    .slice(0, 80)
  return secureUrl.replace('/upload/', `/upload/fl_attachment:${base}/`)
}
