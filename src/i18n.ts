import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enTranslation from './locales/en.json'
import arTranslation from './locales/ar.json'
import { DEFAULT_LANGUAGE, type AppLanguage } from './lib/language'

let initialized = false

export function initI18n(language: AppLanguage = DEFAULT_LANGUAGE) {
  if (!initialized) {
    i18n.use(initReactI18next).init({
      resources: {
        en: { translation: enTranslation },
        ar: { translation: arTranslation },
      },
      lng: language,
      fallbackLng: DEFAULT_LANGUAGE,
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    })
    initialized = true
    return i18n
  }

  if (i18n.language !== language)
    void i18n.changeLanguage(language)

  return i18n
}

// Default for modules imported before route beforeLoad runs (client-only fallback).
initI18n(DEFAULT_LANGUAGE)

export default i18n
