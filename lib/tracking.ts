// Cookie consent and Clarity events. Clarity only joins page views into one
// session when it gets a consent signal (enforced for CH since Oct 2025), so
// without this every page of a visit showed up as a separate recording.

export type TrackingConsent = 'granted' | 'denied'

// Also read by the inline Google/Meta snippets in app/layout.tsx.
export const CONSENT_STORAGE_KEY = 'emilia-consent'
export const OPEN_CONSENT_EVENT = 'emilia:open-consent'

type TrackingWindow = Window & {
  clarity?: ((...args: unknown[]) => void) & { q?: unknown[] }
  gtag?: (...args: unknown[]) => void
  fbq?: (...args: unknown[]) => void
}

// Clarity loads lazily; queue calls the same way its own snippet does so events
// sent before the script arrives are not lost.
function clarity(...args: unknown[]) {
  if (typeof window === 'undefined') return
  const w = window as TrackingWindow
  try {
    if (!w.clarity) {
      const queue = function () {
        // eslint-disable-next-line prefer-rest-params
        ;(queue.q = queue.q || []).push(arguments)
      } as NonNullable<TrackingWindow['clarity']>
      w.clarity = queue
    }
    w.clarity(...args)
  } catch { }
}

export function readConsent(): TrackingConsent | null {
  try {
    const value = localStorage.getItem(CONSENT_STORAGE_KEY)
    return value === 'granted' || value === 'denied' ? value : null
  } catch {
    return null
  }
}

export function applyConsent(consent: TrackingConsent) {
  if (typeof window === 'undefined') return
  const w = window as TrackingWindow
  clarity('consentv2', { ad_Storage: consent, analytics_Storage: consent })
  try {
    w.gtag?.('consent', 'update', {
      ad_storage: consent,
      analytics_storage: consent,
      ad_user_data: consent,
      ad_personalization: consent,
    })
  } catch { }
  try {
    w.fbq?.('consent', consent === 'granted' ? 'grant' : 'revoke')
  } catch { }
}

export function saveConsent(consent: TrackingConsent) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, consent)
  } catch { }
  applyConsent(consent)
}

export function trackEvent(name: string) {
  clarity('event', name)
}

// One event per checkout step, so the funnel can be read in Clarity every day
// without watching recordings one by one.
export type CheckoutStep = 'date' | 'details' | 'payment'

export function trackCheckoutStep(step: CheckoutStep) {
  clarity('event', `checkout_${step}`)
  clarity('set', 'checkout_step', step)
}
