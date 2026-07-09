import crypto from 'crypto'

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || ''
const apiKey = process.env.CLOUDINARY_API_KEY || ''
const apiSecret = process.env.CLOUDINARY_API_SECRET || ''

export const cloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret)

// All "For You" uploads land in one folder for easy review in the Cloudinary dashboard.
export const FORYOU_FOLDER = 'emilia/foryou'

/**
 * Signs the params for a direct browser->Cloudinary upload. The API secret never
 * leaves the server; the browser only gets the signature for the exact params we allow.
 */
export function signUpload(params: Record<string, string | number>): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
  return crypto.createHash('sha1').update(toSign + apiSecret).digest('hex')
}

export function getUploadCredentials() {
  return { cloudName, apiKey }
}

// --- Delivery URL helpers -------------------------------------------------
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
