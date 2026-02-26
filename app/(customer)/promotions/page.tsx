"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { PromoCard } from "@/components/shared/promo-card"
import { PillButton, PillButtonRow } from "@/components/shared/pill-button"
import { promotions } from "@/lib/data/mock-data"
import { useLanguage } from "@/lib/i18n/language-context"
import type { PromoType } from "@/lib/types"

export default function PromotionsPage() {
  const { t } = useLanguage()
  const [filter, setFilter] = useState<PromoType | "all">("all")

  const filters: { value: PromoType | "all"; label: string }[] = [
    { value: "all", label: t("allDealsFilter") },
    { value: "package", label: t("packagesFilter") },
    { value: "happy-hour", label: t("happyHourFilter") },
    { value: "trial", label: t("trialFilter") },
    { value: "loyalty", label: t("loyaltyFilter") },
    { value: "first-timer", label: t("newCustomerFilter") },
  ]

  const filtered = filter === "all" ? promotions : promotions.filter((p) => p.type === filter)

  return (
    <div className="px-5 pb-8 pt-12">
      <div className="flex items-center gap-2">
        <Sparkles size={20} className="text-brand-coral" />
        <h1 className="text-2xl font-bold text-brand-text-primary">{t("promotions")}</h1>
      </div>
      <p className="mt-1 text-sm text-brand-text-secondary">{t("exclusiveDeals")}</p>

      <PillButtonRow className="mt-5">
        {filters.map((f) => (
          <PillButton key={f.value} active={filter === f.value} onClick={() => setFilter(f.value)}>
            {f.label}
          </PillButton>
        ))}
      </PillButtonRow>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {filtered.map((promo) => (
          <PromoCard key={promo.id} promo={promo} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm text-brand-text-tertiary">{t("noPromotionsInCategory")}</p>
        </div>
      )}
    </div>
  )
}
