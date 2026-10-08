// We ran out of boxes for the 2-3 size and the day the new ones arrive is not
// known, so the site names no date: while this is true that size cannot be
// ordered. Set it to false once the boxes are here.
// Product page, cards, cart, checkout and the payment API all read it from here.
const SMALL_SIZE = '2-3'
export const SMALL_SIZE_PAUSED: boolean = true

export function isSizeAvailable(size: string): boolean {
  return !(SMALL_SIZE_PAUSED && size === SMALL_SIZE)
}
