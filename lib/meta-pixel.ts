export const META_PIXEL_ID = '26409977948633382'

/**
 * Generate a unique event ID for deduplication between Pixel (browser) and CAPI (server).
 */
export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
}
