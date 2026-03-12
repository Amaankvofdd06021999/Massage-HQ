"use client"

import { ChevronDown } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"
import type { Language } from "@/lib/i18n/translations"
import { cn } from "@/lib/utils"

const LANGUAGE_OPTIONS: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "th", label: "ภาษาไทย" },
  { code: "ko", label: "한국어" },
  { code: "ja", label: "日本語" },
  { code: "de", label: "Deutsch" },
]

interface LanguageDropdownProps {
  /** "full" shows native language names, "compact" shows EN/TH/KO/JA/DE codes */
  variant?: "full" | "compact"
  /** Size preset */
  size?: "sm" | "md" | "lg"
  /** Additional className for the wrapper */
  className?: string
}

export function LanguageDropdown({ variant = "full", size = "md", className }: LanguageDropdownProps) {
  const { language, setLanguage } = useLanguage()

  const sizeClasses = {
    sm: "pl-1.5 pr-5 py-0.5 text-[10px]",
    md: "pl-3 pr-8 py-1.5 text-sm",
    lg: "pl-4 pr-9 py-2 text-sm",
  }

  const chevronSizes = { sm: 10, md: 14, lg: 14 }
  const chevronOffset = { sm: "right-1.5", md: "right-2.5", lg: "right-3" }

  return (
    <div className={cn("relative", className)}>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className={cn(
          "appearance-none rounded-xl border border-brand-border bg-brand-bg-tertiary font-semibold text-brand-text-primary outline-none focus:border-brand-primary/50 cursor-pointer w-full",
          sizeClasses[size]
        )}
      >
        {LANGUAGE_OPTIONS.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {variant === "compact" ? lang.code.toUpperCase() : lang.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={chevronSizes[size]}
        className={cn("pointer-events-none absolute top-1/2 -translate-y-1/2 text-brand-text-tertiary", chevronOffset[size])}
      />
    </div>
  )
}
