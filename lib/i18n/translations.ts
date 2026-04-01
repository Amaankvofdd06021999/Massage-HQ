import en from "./locales/en"
import th from "./locales/th"
import ko from "./locales/ko"
import ja from "./locales/ja"
import de from "./locales/de"
import ru from "./locales/ru"

export type Language = "en" | "th" | "ko" | "ja" | "de" | "ru"

export const translations = {
  en,
  th,
  ko,
  ja,
  de,
  ru,
} satisfies Record<Language, Record<string, string>>

export type TranslationKey = keyof typeof translations.en
