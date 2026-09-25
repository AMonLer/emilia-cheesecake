// A gift message made in the checkout, before the order exists. Until the
// payment goes through, the PaymentIntent's metadata is the only record there
// is, so it travels there; the webhook then stores it under the sticker code.

export const GIFT_MESSAGE_MAX = 2000
// Checkout uploads get their own folder: files from abandoned checkouts can be
// told apart from the ones paid orders use.
export const CHECKOUT_UPLOAD_FOLDER = 'emilia/foryou/checkout'

export type CheckoutGift = { message: string; videoUrl: string; photoUrl: string }

export const EMPTY_GIFT: CheckoutGift = { message: '', videoUrl: '', photoUrl: '' }

export const hasGiftContent = (gift: CheckoutGift | null | undefined): gift is CheckoutGift =>
  Boolean(gift && (gift.message.trim() || gift.videoUrl || gift.photoUrl))

// Stripe caps each metadata value at 500 characters, so a long message is split
// over giftMessage1, giftMessage2… Pieces are cut by UTF-8 bytes, which keeps
// them under the cap whether Stripe counts characters or bytes, never inside a
// character, and never next to whitespace, in case a value gets trimmed.
const CHUNK_BYTES = 490
// 2000 UTF-16 units are at most 6000 UTF-8 bytes: 14 pieces always fit.
const MAX_CHUNKS = 14
const MAX_URL_LENGTH = 450

const utf8Length = (char: string) => {
  const codePoint = char.codePointAt(0)!
  return codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4
}
const isSpace = (char: string | undefined) => char !== undefined && /\s/.test(char)

function splitForMetadata(text: string): string[] {
  const chars = Array.from(text)
  const safeCut = (at: number) => at >= chars.length || (!isSpace(chars[at - 1]) && !isSpace(chars[at]))
  const chunks: string[] = []
  let start = 0
  while (start < chars.length && chunks.length < MAX_CHUNKS) {
    let end = start
    let bytes = 0
    while (end < chars.length && bytes + utf8Length(chars[end]) <= CHUNK_BYTES) bytes += utf8Length(chars[end++])
    let cut = end
    while (cut > start + 1 && !safeCut(cut)) cut--
    if (!safeCut(cut)) cut = end
    chunks.push(chars.slice(start, cut).join(''))
    start = cut
  }
  return chunks
}

// Only files in this shop's Cloudinary, in the For You folders.
export function isForYouMediaUrl(url: string, cloudName: string): boolean {
  return Boolean(cloudName)
    && url.length <= MAX_URL_LENGTH
    && url.startsWith(`https://res.cloudinary.com/${cloudName}/`)
    && url.includes('/upload/')
    && url.includes('/emilia/foryou/')
}

/** What the browser sent, trimmed to what may be stored; null if there is nothing. */
export function cleanCheckoutGift(input: unknown, cloudName: string): CheckoutGift | null {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const message = String(raw.message ?? '').trim().slice(0, GIFT_MESSAGE_MAX).replace(/[\uD800-\uDBFF]$/, '')
  const media = (value: unknown) => {
    const url = String(value ?? '').trim()
    return isForYouMediaUrl(url, cloudName) ? url : ''
  }
  const gift = { message, videoUrl: media(raw.videoUrl), photoUrl: media(raw.photoUrl) }
  return hasGiftContent(gift) ? gift : null
}

export function giftToMetadata(gift: CheckoutGift | null): Record<string, string> {
  if (!gift) return {}
  const metadata: Record<string, string> = {}
  splitForMetadata(gift.message).forEach((part, i) => { metadata[`giftMessage${i + 1}`] = part })
  if (gift.videoUrl) metadata.giftVideoUrl = gift.videoUrl
  if (gift.photoUrl) metadata.giftPhotoUrl = gift.photoUrl
  return metadata
}

export function giftFromMetadata(metadata: Record<string, string | undefined> | null | undefined): CheckoutGift | null {
  if (!metadata) return null
  let message = ''
  for (let i = 1; i <= MAX_CHUNKS; i++) message += metadata[`giftMessage${i}`] || ''
  const gift = { message, videoUrl: metadata.giftVideoUrl || '', photoUrl: metadata.giftPhotoUrl || '' }
  return hasGiftContent(gift) ? gift : null
}
