"use client"

import {
  createContext, useContext, useState, useEffect, type ReactNode,
} from "react"
import { translations, type Language, type TranslationKey } from "./translations"

const LANGUAGE_KEY = "koko-language"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_KEY)
      if (stored === "en" || stored === "th") setLanguageState(stored)
    } catch { /* ignore */ }
  }, [])

  function setLanguage(lang: Language) {
    setLanguageState(lang)
    try { localStorage.setItem(LANGUAGE_KEY, lang) } catch { /* ignore */ }
  }

  function t(key: TranslationKey): string {
    return translations[language][key] ?? translations.en[key] ?? key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}
