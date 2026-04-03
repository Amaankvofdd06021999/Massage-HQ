"use client"

import { useLanguage } from "@/lib/i18n/language-context"

export default function PhoneBookingPage() {
  const { t } = useLanguage()
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-brand-text-primary">{t("phoneBookingTitle")}</h1>
      <p className="text-brand-text-secondary mt-2">Coming soon...</p>
    </div>
  )
}
