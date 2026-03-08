"use client"

import { useState } from "react"
import { Sparkles, Check } from "lucide-react"
import { PromoCard } from "@/components/shared/promo-card"
import { PillButton, PillButtonRow } from "@/components/shared/pill-button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { promotions, formatPrice } from "@/lib/data/mock-data"
import { useLanguage } from "@/lib/i18n/language-context"
import { usePromotions } from "@/lib/data/promotions-store"
import { useAuth } from "@/lib/auth/auth-context"
import type { Promotion, PromoType } from "@/lib/types"

export default function PromotionsPage() {
  const { t } = useLanguage()
  const { purchasePromotion } = usePromotions()
  const { user } = useAuth()
  const [filter, setFilter] = useState<PromoType | "all">("all")
  const [purchaseDialog, setPurchaseDialog] = useState<Promotion | null>(null)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)

  const handlePurchase = (promo: Promotion) => {
    if (!user || !promo.sessions || !promo.applicableServices) return
    purchasePromotion({
      customerId: user.id,
      promotionId: promo.id,
      promotionTitle: promo.title,
      purchasedAt: new Date().toISOString(),
      paidAmount: promo.promoPrice ?? promo.originalPrice ?? 0,
      services: Array.from({ length: promo.sessions }, (_, i) => ({
        serviceType: promo.applicableServices![i % promo.applicableServices!.length],
        completed: false,
      })),
    })
    setPurchaseSuccess(true)
    setTimeout(() => {
      setPurchaseDialog(null)
      setPurchaseSuccess(false)
    }, 2000)
  }

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
          <PromoCard
            key={promo.id}
            promo={promo}
            onPurchase={() => setPurchaseDialog(promo)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm text-brand-text-tertiary">{t("noPromotionsInCategory")}</p>
        </div>
      )}

      <Dialog open={!!purchaseDialog} onOpenChange={(open) => { if (!open) { setPurchaseDialog(null); setPurchaseSuccess(false) } }}>
        <DialogContent className="bg-card border-brand-border max-w-sm">
          {purchaseSuccess ? (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-green/15">
                <Check size={28} className="text-brand-green" />
              </div>
              <p className="mt-4 text-lg font-bold text-brand-text-primary">{t("purchaseSuccess")}</p>
            </div>
          ) : purchaseDialog && (
            <>
              <DialogHeader>
                <DialogTitle className="text-brand-text-primary">{purchaseDialog.title}</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-brand-text-secondary">{purchaseDialog.description}</p>
              {purchaseDialog.sessions && (
                <p className="text-sm text-brand-text-secondary">{purchaseDialog.sessions} sessions included</p>
              )}
              <div className="mt-2 flex items-baseline gap-2">
                {purchaseDialog.originalPrice && (
                  <span className="text-sm text-brand-text-tertiary line-through">{formatPrice(purchaseDialog.originalPrice)}</span>
                )}
                <span className="text-xl font-bold text-brand-primary">
                  {formatPrice(purchaseDialog.promoPrice ?? purchaseDialog.originalPrice ?? 0)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handlePurchase(purchaseDialog)}
                className="mt-4 w-full rounded-xl bg-brand-primary py-3 text-sm font-semibold text-brand-primary-foreground"
              >
                {t("confirm")} {t("purchasePromotion")}
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
