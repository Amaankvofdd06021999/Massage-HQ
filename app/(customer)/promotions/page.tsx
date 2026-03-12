"use client"

import { useState, useMemo } from "react"
import { Sparkles, Check, Package, ChevronRight } from "lucide-react"
import { PromoCard } from "@/components/shared/promo-card"
import { PillButton, PillButtonRow } from "@/components/shared/pill-button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { promotions } from "@/lib/data/mock-data"
import { formatPrice, formatMassageType } from "@/lib/utils/formatters"
import { useLanguage } from "@/lib/i18n/language-context"
import { usePromotions } from "@/lib/data/promotions-store"
import { useAuth } from "@/lib/auth/auth-context"
import type { Promotion, PromoType } from "@/lib/types"

export default function PromotionsPage() {
  const { t } = useLanguage()
  const { purchasePromotion, getActivePromotionsForCustomer } = usePromotions()
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

  const activePromos = useMemo(
    () => user ? getActivePromotionsForCustomer(user.id) : [],
    [user, getActivePromotionsForCustomer]
  )

  const filtered = filter === "all" ? promotions : promotions.filter((p) => p.type === filter)

  return (
    <div className="px-5 pb-24 pt-12">
      <div className="flex items-center gap-2">
        <Sparkles size={20} className="text-brand-coral" />
        <h1 className="text-2xl font-bold text-brand-text-primary">{t("promotions")}</h1>
      </div>
      <p className="mt-1 text-sm text-brand-text-secondary">{t("exclusiveDeals")}</p>

      {/* Active Purchased Promotions */}
      {activePromos.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-brand-text-primary">
              <Package size={16} className="text-brand-green" />
              {t("myActivePromotions")}
            </h2>
            <a href="/promotions/my" className="flex items-center gap-1 text-xs font-medium text-brand-primary">
              {t("viewAll")} <ChevronRight size={14} />
            </a>
          </div>
          <div className="space-y-3">
            {activePromos.map((promo) => {
              const completed = promo.services.filter((s) => s.completed).length
              const total = promo.services.length
              const remaining = total - completed
              // Group remaining services by type
              const remainingByType: Record<string, number> = {}
              for (const s of promo.services) {
                if (!s.completed) {
                  remainingByType[s.serviceType] = (remainingByType[s.serviceType] || 0) + 1
                }
              }
              return (
                <div key={promo.id} className="rounded-2xl border border-brand-green/20 bg-brand-green/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-brand-text-primary">{promo.promotionTitle}</p>
                    <span className="rounded-full bg-brand-green/15 px-2 py-0.5 text-[10px] font-bold text-brand-green">
                      {remaining} {t("sessionsRemaining")}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 h-2 rounded-full bg-brand-border overflow-hidden">
                    <div className="h-full rounded-full bg-brand-green transition-all" style={{ width: `${(completed / total) * 100}%` }} />
                  </div>
                  <p className="mt-1.5 text-[11px] text-brand-text-tertiary">{completed} / {total} {t("sessionsUsed")}</p>
                  {/* Remaining massage types */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {Object.entries(remainingByType).map(([type, count]) => (
                      <span key={type} className="rounded-lg bg-brand-bg-secondary px-2 py-0.5 text-[10px] font-medium text-brand-text-secondary">
                        {count}x {formatMassageType(type)}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

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
