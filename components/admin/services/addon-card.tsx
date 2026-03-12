"use client"

import { Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/i18n/language-context"
import { TYPE_COLORS } from "@/components/admin/services/service-card"
import type { ServiceAddOn } from "@/lib/types"

function formatPrice(n: number) {
  return `฿${n.toLocaleString()}`
}

// ─── Add-on Card ──────────────────────────────────────────────────────────────

export function AddOnCard({ addOn, onEdit, onDelete, onToggle }: {
  addOn: ServiceAddOn; onEdit: () => void; onDelete: () => void; onToggle: () => void
}) {
  const { t } = useLanguage()
  return (
    <div className={cn("flex items-start gap-3 rounded-2xl border bg-card p-4 transition-opacity", addOn.isActive ? "border-brand-border" : "border-brand-border opacity-60")}>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <h3 className="text-sm font-semibold text-brand-text-primary">{addOn.name}</h3>
          <span className="text-sm font-bold text-brand-primary">{formatPrice(addOn.price)}</span>
          {addOn.extraMinutes > 0 && <span className="rounded-full bg-brand-bg-tertiary px-2 py-0.5 text-[10px] text-brand-text-secondary">+{addOn.extraMinutes} {t("min")}</span>}
          {!addOn.isActive && <span className="rounded-full bg-brand-text-tertiary/20 px-2 py-0.5 text-[10px] font-medium text-brand-text-tertiary">{t("inactive")}</span>}
        </div>
        <p className="text-xs text-brand-text-secondary">{addOn.description}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {addOn.applicableServices === "all" ? (
            <span className="rounded-lg bg-brand-primary/10 px-2 py-0.5 text-[10px] font-medium text-brand-primary">{t("allServices")}</span>
          ) : (
            addOn.applicableServices.map((tv) => (
              <span key={tv} className={cn("rounded-lg px-2 py-0.5 text-[10px] font-medium", TYPE_COLORS[tv])}>{tv.replace("-", " ")}</span>
            ))
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button type="button" onClick={onToggle} title={addOn.isActive ? t("inactive") : t("active")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-text-tertiary hover:bg-brand-bg-tertiary transition-colors">
          {addOn.isActive ? <ToggleRight size={18} className="text-brand-primary" /> : <ToggleLeft size={18} />}
        </button>
        <button type="button" onClick={onEdit} className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-text-tertiary hover:bg-brand-bg-tertiary transition-colors"><Pencil size={14} /></button>
        <button type="button" onClick={onDelete} className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-text-tertiary hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 size={14} /></button>
      </div>
    </div>
  )
}
