'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Locale, Translations } from '@/lib/translations'

type LanguageContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType | null>(null)

const STORAGE_KEY = 'emilia-locale'

/**
 * Pick a language from the browser's own preference list. The shop is in
 * Zurich, so a German browser gets German; everyone else gets English, which
 * travels further than German for tourists and expats.
 */
function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'de'
  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const lang of preferred) {
    if (!lang) continue
    const base = lang.toLowerCase().split('-')[0]
    if (base === 'de') return 'de'
    if (base === 'en') return 'en'
  }
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always render German on the server. Detection needs `navigator`, so it runs
  // after mount - starting from the same value on both sides keeps hydration quiet.
  const [locale, setLocaleState] = useState<Locale>('de')

  useEffect(() => {
    let stored: string | null = null
    try {
      stored = window.localStorage.getItem(STORAGE_KEY)
    } catch {
      // Safari private mode throws on localStorage; fall through to detection.
    }

    // An explicit choice always beats the browser's setting.
    if (stored === 'de' || stored === 'en') {
      setLocaleState(stored)
      return
    }
    setLocaleState(detectLocale())
  }, [])

  // Keep <html lang> honest for screen readers and search engines.
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = (next: Locale) => {
    setLocaleState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Preference just won't survive the session. Not worth failing over.
    }
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
