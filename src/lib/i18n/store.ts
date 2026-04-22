import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { en, type Dictionary } from './en'
import { pt } from './pt'

export type Locale = 'en' | 'pt'

const DICTIONARIES: Record<Locale, Dictionary> = { en, pt }

type I18nStore = {
  locale: Locale
  setLocale: (locale: Locale) => void
}

function detectInitial(): Locale {
  if (typeof navigator === 'undefined') {
    return 'en'
  }

  const lang = (navigator.language || 'en').toLowerCase()

  if (lang.startsWith('pt')) {
    return 'pt'
  }

  return 'en'
}

export const useI18nStore = create<I18nStore>()(
  persist(
    (set) => ({
      locale: detectInitial(),
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'munchkin-tools-locale' },
  ),
)

export function useT(): Dictionary {
  const locale = useI18nStore((s) => s.locale)

  return DICTIONARIES[locale]
}
