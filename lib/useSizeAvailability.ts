'use client'

import { useEffect, useState } from 'react'
import { isSizeAvailable, SMALL_SIZE } from '@/lib/availability'

/**
 * Which sizes can be ordered right now.
 *
 * Computed after mount, like EarliestDelivery: the pages are prerendered, so
 * the server's "now" is the build's, not the visitor's. Until then the paused
 * size counts as unavailable, so nobody can add it in the gap.
 */
export function useSizeAvailability(): (size: string) => boolean {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    const update = () => setNow(new Date())
    update()
    const id = setInterval(update, 5 * 60_000)
    return () => clearInterval(id)
  }, [])

  return (size: string) => (now ? isSizeAvailable(size, now) : size !== SMALL_SIZE)
}
