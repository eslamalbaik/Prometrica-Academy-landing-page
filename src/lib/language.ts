export type AppLanguage = 'en' | 'ar'

export const DEFAULT_LANGUAGE: AppLanguage = 'ar'

export function normalizeLanguage(value: string | null | undefined): AppLanguage {
  return value === 'ar' ? 'ar' : 'en'
}

/** Parse `language=` from a Cookie header or `document.cookie` string. */
export function parseLanguageFromCookie(cookieHeader: string | null | undefined): AppLanguage {
  if (!cookieHeader)
    return DEFAULT_LANGUAGE

  const match = cookieHeader.match(/(?:^|;\s*)language=([^;]+)/)
  return normalizeLanguage(match?.[1]?.trim())
}

export function getLanguageAttributes(language: AppLanguage) {
  return {
    lang: language,
    dir: language === 'ar' ? 'rtl' : 'ltr',
  } as const
}
