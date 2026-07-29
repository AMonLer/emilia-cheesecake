'use client'

import { useEffect } from 'react'

/**
 * Shared, reference-counted body scroll lock.
 *
 * Several overlays can be open at once - picking a size in the product-card
 * sheet calls addToCart, which opens the cart sidebar while the sheet is still
 * on screen. If each overlay saved and restored document.body.style.overflow on
 * its own, the second one would capture the *locked* value as its "original"
 * and re-apply overflow:hidden when it closed, freezing the page for good.
 *
 * Counting instead means the body is only unlocked once the last overlay closes,
 * and the value restored is the one from before any of them opened.
 */
let lockCount = 0
let savedOverflow = ''

export function useScrollLock(active: boolean) {
    useEffect(() => {
        if (!active) return

        if (lockCount === 0) {
            savedOverflow = document.body.style.overflow
            document.body.style.overflow = 'hidden'
        }
        lockCount++

        return () => {
            lockCount--
            if (lockCount === 0) {
                document.body.style.overflow = savedOverflow
            }
        }
    }, [active])
}
