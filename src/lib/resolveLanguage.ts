import { createIsomorphicFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import {
  DEFAULT_LANGUAGE,
  normalizeLanguage,
  parseLanguageFromCookie,
  type AppLanguage,
} from './language'

/** Cookie-only resolution so SSR and the first client render stay in sync. */
export const resolveLanguage = createIsomorphicFn()
  .server(() => parseLanguageFromCookie(getRequestHeader('cookie')))
  .client(() => {
    if (typeof document === 'undefined')
      return DEFAULT_LANGUAGE
    return parseLanguageFromCookie(document.cookie)
  })

/** After hydration: migrate legacy localStorage preference into the language cookie. */
export function syncLanguageFromStorage(): AppLanguage | null {
  if (typeof window === 'undefined')
    return null

  try {
    const stored = localStorage.getItem('app_lang')
    if (!stored)
      return null

    const lang = normalizeLanguage(stored)
    const cookieLang = parseLanguageFromCookie(document.cookie)
    if (lang === cookieLang)
      return null

    document.cookie = `language=${lang}; path=/; max-age=31536000; SameSite=Lax`
    return lang
  }
  catch {
    return null
  }
}
