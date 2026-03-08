"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, Check, Circle, CreditCard } from "lucide-react"
import { usePromotions } from "@/lib/data/promotions-store"
import { useAuth } from "@/lib/auth/auth-context"
import { useLanguage } from "@/lib/i18n/language-context"
import { formatMassageType, formatPrice } from "@/lib/data/mock-data"
import { cn } from "@/lib/utils"
import { customers } from "@/lib/data/mock-data"

export default function MyPromotionsPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { user } = useAuth()
  const { getPromotionsForCustomer } = usePromotions()

  if (!user) return null

  const myPromos = getPromotionsForCustomer(user.id)
  const customer = customers.find((c) => c.id === user.id)
  const activePromos = myPromos.filter((p) => p.services.some((s) => !s.completed))
  const completedPromos = myPromos.filter((p) => p.services.every((s) => s.completed))

  return (
    <div className="min-h-screen bg-background safe-area-pb">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-brand-border bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-5 py-4">
          <button type="button" onClick={() => router.back()} className="text-brand-text-secondary">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-brand-text-primary">{t("myPromotions")}</h1>
        </div>
      </div>

      <div className="px-5 py-5">
        {/* Membership Number */}
        {customer && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-brand-primary/10 px-4 py-2.5">
            <CreditCard size={16} className="text-brand-primary" />
            <span className="text-xs text-brand-text-secondary">{t("membershipNumber")}:</span>
            <span className="text-sm font-bold text-brand-primary">{customer.membershipNumber}</span>
          </div>
        )}

        {myPromos.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-brand-text-secondary">{t("noActivePromotions")}</p>
          </div>
        ) : (
          <>
            {/* Active Promotions */}
            {activePromos.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-brand-text-secondary uppercase tracking-wider">{t("activePromotions")}</h2>
                <div className="mt-3 flex flex-col gap-4">
                  {activePromos.map((promo) => {
                    const completed = promo.services.filter((s) => s.completed).length
                    const total = promo.services.length
                    return (
                      <div key={promo.id} className="rounded-2xl border border-brand-border bg-card p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-brand-text-primary">{promo.promotionTitle}</h3>
                            <p className="mt-1 text-xs text-brand-text-tertiary">
                              {t("purchasePromotion")}d {new Date(promo.purchasedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="rounded-full bg-brand-green/15 px-2.5 py-1 text-xs font-semibold text-brand-green">
                            {t("promotionActive")}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs text-brand-text-secondary">
                            <span>{completed} {t("of")} {total} {t("sessionsCompleted")}</span>
                            <span>{total - completed} {t("sessionsRemaining")}</span>
                          </div>
                          <div className="mt-2 flex gap-1">
                            {promo.services.map((s, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "h-2 flex-1 rounded-full",
                                  s.completed ? "bg-brand-green" : "bg-brand-border"
                                )}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Service checklist */}
                        <div className="mt-4 space-y-2">
                          {promo.services.map((s, i) => (
                            <div key={i} className="flex items-center gap-3">
                              {s.completed ? (
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-green/15">
                                  <Check size={12} className="text-brand-green" />
                                </div>
                              ) : (
                                <Circle size={20} className="text-brand-border" />
                              )}
                              <span className={cn(
                                "text-sm",
                                s.completed ? "text-brand-text-tertiary line-through" : "text-brand-text-primary"
                              )}>
                                {formatMassageType(s.serviceType)}
                              </span>
                              {s.completedAt && (
                                <span className="ml-auto text-xs text-brand-text-tertiary">
                                  {new Date(s.completedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Paid amount */}
                        <div className="mt-4 flex items-center justify-between border-t border-brand-border pt-3">
                          <span className="text-xs text-brand-text-tertiary">{t("prepaid")}</span>
                          <span className="text-sm font-semibold text-brand-text-primary">{formatPrice(promo.paidAmount)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Completed Promotions */}
            {completedPromos.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-brand-text-secondary uppercase tracking-wider">{t("promotionCompleted")}</h2>
                <div className="mt-3 flex flex-col gap-3">
                  {completedPromos.map((promo) => (
                    <div key={promo.id} className="rounded-2xl border border-brand-border bg-card p-4 opacity-60">
                      <h3 className="font-semibold text-brand-text-primary">{promo.promotionTitle}</h3>
                      <p className="mt-1 text-xs text-brand-text-tertiary">
                        All {promo.services.length} sessions completed
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
