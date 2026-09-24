"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/contexts/LanguageContext"
import {
  OPEN_CONSENT_EVENT,
  applyConsent,
  readConsent,
  saveConsent,
  type TrackingConsent,
} from "@/lib/tracking"

// Checkout and confirmation keep the bottom of the screen for the pay button.
const HIDDEN_ON = ["/checkout", "/payment-success", "/admin"]

export default function CookieConsent() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const stored = readConsent()
    if (stored) applyConsent(stored)
    else setOpen(true)
    const reopen = () => setOpen(true)
    window.addEventListener(OPEN_CONSENT_EVENT, reopen)
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen)
  }, [])

  const choose = (consent: TrackingConsent) => {
    saveConsent(consent)
    setOpen(false)
  }

  if (!open || HIDDEN_ON.some((path) => pathname?.startsWith(path))) return null

  return (
    // Below the cart panel (z-50) so it never covers "Zur Kasse".
    <div
      role="region"
      aria-label="Cookies"
      className="fixed inset-x-0 bottom-0 z-[45] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-4 sm:pb-4"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-[#E6D5C0] bg-white p-4 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.45)] sm:flex-row sm:items-center sm:gap-5">
        <p className="text-xs leading-relaxed text-gray-600 sm:flex-1">
          {t.consent.text}{" "}
          <Link href="/datenschutz" className="font-medium text-[#651A1A] underline underline-offset-2">
            {t.consent.learnMore}
          </Link>
        </p>
        <div className="flex gap-2 sm:shrink-0">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="flex-1 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-50 active:bg-gray-100 sm:flex-none"
          >
            {t.consent.decline}
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="flex-1 rounded-lg bg-black px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gray-900 active:bg-gray-800 sm:flex-none"
          >
            {t.consent.accept}
          </button>
        </div>
      </div>
    </div>
  )
}
