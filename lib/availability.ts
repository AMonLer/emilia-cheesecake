// Boxes for the 2-3 size are back in stock (confirmed 14 October 2026).
// Set this to true only when the small size needs to be paused again.
// Product page, cards, cart, checkout and the payment API all read it from here.
const SMALL_SIZE = '2-3'
export const SMALL_SIZE_PAUSED: boolean = false

export function isSizeAvailable(size: string): boolean {
  return !(SMALL_SIZE_PAUSED && size === SMALL_SIZE)
}
