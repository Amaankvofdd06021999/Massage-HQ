"use client"

import { useState } from "react"
import { Plus, Edit2, Eye, EyeOff } from "lucide-react"
import { StatusBadge } from "@/components/shared/status-badge"
import { PromotionFormDialog } from "@/components/admin/promotion-form-dialog"
import { promotions } from "@/lib/data/mock-data"
import { formatPrice, formatMassageType } from "@/lib/utils/formatters"
import { useLanguage } from "@/lib/i18n/language-context"
import type { Promotion } from "@/lib/types"

export default function AdminPromotionsPage() {
  const { t } = useLanguage()
  const [formOpen, setFormOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null)

  function handleCreate() {
    setEditingPromo(null)
    setFormOpen(true)
  }

  function handleEdit(promo: Promotion) {
    setEditingPromo(promo)
    setFormOpen(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-text-primary">{t("navPromotions")}</h1>
          <p className="mt-1 text-sm text-brand-text-secondary">
            {promotions.length} {t("activePromotions")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
        >
          <Plus size={16} />
          {t("createPromotion")}
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {promotions.map((promo) => (
          <div key={promo.id} className="rounded-2xl border border-brand-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-brand-text-primary">{promo.title}</h3>
                  <StatusBadge variant={promo.isActive ? "success" : "neutral"} dot>
                    {promo.isActive ? t("active") : t("inactive")}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-sm text-brand-text-secondary">{promo.description}</p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleEdit(promo)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border text-brand-text-tertiary hover:bg-brand-bg-tertiary"
                  aria-label="Edit"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border text-brand-text-tertiary hover:bg-brand-bg-tertiary"
                  aria-label={promo.isActive ? "Deactivate" : "Activate"}
                >
                  {promo.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
            </div>

            {/* Applicable massage types */}
            {promo.applicableServices && promo.applicableServices.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {promo.applicableServices.map((service) => (
                  <span
                    key={service}
                    className="rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-brand-primary"
                  >
                    {formatMassageType(service)}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-brand-text-tertiary">{t("typeLabel")}</p>
                <p className="font-medium capitalize text-brand-text-primary">{promo.type.replace("-", " ")}</p>
              </div>
              {promo.discountPercent && (
                <div>
                  <p className="text-xs text-brand-text-tertiary">{t("discountLabel")}</p>
                  <p className="font-medium text-brand-primary">{promo.discountPercent}% {t("off")}</p>
                </div>
              )}
              {promo.code && (
                <div>
                  <p className="text-xs text-brand-text-tertiary">{t("codeLabel")}</p>
                  <p className="font-mono font-medium text-brand-text-primary">{promo.code}</p>
                </div>
              )}
              {promo.sessions && (
                <div>
                  <p className="text-xs text-brand-text-tertiary">{t("sessionsLabel")}</p>
                  <p className="font-medium text-brand-text-primary">{promo.sessionsUsed ?? 0}/{promo.sessions} {t("used")}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-brand-text-tertiary">{t("validUntil")}</p>
                <p className="font-medium text-brand-text-primary">{promo.validUntil}</p>
              </div>
              {promo.originalPrice && (
                <div>
                  <p className="text-xs text-brand-text-tertiary">{t("priceLabel")}</p>
                  <p className="font-medium text-brand-text-primary">
                    <span className="text-brand-text-tertiary line-through">{formatPrice(promo.originalPrice)}</span>
                    {" "}{formatPrice(promo.promoPrice ?? 0)}
                  </p>
                </div>
              )}
            </div>

            {promo.terms.length > 0 && (
              <div className="mt-3 border-t border-brand-border pt-3">
                <p className="text-[10px] font-semibold uppercase text-brand-text-tertiary">{t("termsLabel")}</p>
                <ul className="mt-1 space-y-0.5">
                  {promo.terms.map((term, i) => (
                    <li key={i} className="text-xs text-brand-text-tertiary">- {term}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create / Edit Form Dialog */}
      <PromotionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        promotion={editingPromo ?? undefined}
        onSave={() => setFormOpen(false)}
      />
    </div>
  )
}
