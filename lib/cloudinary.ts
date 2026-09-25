import crypto from 'crypto'

const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() || ''
const apiKey = process.env.CLOUDINARY_API_KEY?.trim() || ''
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim() || ''

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

// Delivery URL helpers live in ./cloudinary-urls (usable in the browser too).
