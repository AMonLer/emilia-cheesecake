// Stock físico: los stickers/sleeves ya están impresos con códigos correlativos.
// 2000–2300 van en tartas pequeñas ("2-3"), 3001–3200 en grandes ("8-10").
// Si un pedido mezcla tamaños, el sticker va en la grande.
export const FORYOU_RANGES = {
  small: { min: 2000, max: 2300 },
  large: { min: 3001, max: 3200 },
} as const

export type ForYouRange = keyof typeof FORYOU_RANGES

export function forYouRangeForItems(items: Array<{ size?: string }>): ForYouRange {
  return items.some((item) => item?.size === '8-10') ? 'large' : 'small'
}

// Los códigos válidos son los de los stickers impresos: 2000–2300 y 3001–3200.
export const isForYouCode = (code: string) => {
  if (!/^\d{4}$/.test(code)) return false
  const n = Number(code)
  return (n >= FORYOU_RANGES.small.min && n <= FORYOU_RANGES.small.max)
      || (n >= FORYOU_RANGES.large.min && n <= FORYOU_RANGES.large.max)
}

/** El siguiente código impreso que aún no se ha entregado; null si el rango se agotó. */
export function nextFreeForYouCode(used: Set<string>, range: ForYouRange): string | null {
  const { min, max } = FORYOU_RANGES[range]
  for (let n = min; n <= max; n++) {
    const code = String(n)
    if (!used.has(code)) return code
  }
  return null
}
