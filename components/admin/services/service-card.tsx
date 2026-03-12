"use client"

import { useState } from "react"
import { Pencil, Trash2, ToggleLeft, ToggleRight, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/i18n/language-context"
import type { ServiceOption, MassageType } from "@/lib/types"

// ─── Constants ────────────────────────────────────────────────────────────────

export const TYPE_COLORS: Record<MassageType, string> = {
  thai:          "bg-amber-500/15 text-amber-400",
  swedish:       "bg-blue-500/15 text-blue-400",
  "deep-tissue": "bg-red-500/15 text-red-400",
  aromatherapy:  "bg-purple-500/15 text-purple-400",
  "hot-stone":   "bg-orange-500/15 text-orange-400",
  sports:        "bg-green-500/15 text-green-400",
  reflexology:   "bg-pink-500/15 text-pink-400",
  shiatsu:       "bg-cyan-500/15 text-cyan-400",
  foot:          "bg-teal-500/15 text-teal-400",
}

function formatPrice(n: number) {
  return `฿${n.toLocaleString()}`
}

// ─── Service Card ─────────────────────────────────────────────────────────────

export function ServiceCard({ service, onEdit, onDelete, onToggle }: {
  service: ServiceOption; onEdit: () => void; onDelete: () => void; onToggle: () => void
}) {
  const { t } = useLanguage()
  const [expanded, setExpanded] = useState(false)
  return (
    <div className={cn("rounded-2xl border bg-card transition-opacity", service.isActive ? "border-brand-border" : "border-brand-border opacity-60")}>
      <div className="flex items-start gap-3 p-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-brand-text-primary">{service.name}</h3>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", TYPE_COLORS[service.type])}>
              {service.type.replace("-", " ")}
            </span>
            {service.isPopular && <span className="rounded-full bg-brand-primary/15 px-2 py-0.5 text-[10px] font-semibold text-brand-primary">{t("popular")}</span>}
            {!service.isActive && <span className="rounded-full bg-brand-text-tertiary/20 px-2 py-0.5 text-[10px] font-medium text-brand-text-tertiary">{t("inactive")}</span>}
          </div>
          <p className="text-xs text-brand-text-secondary line-clamp-2">{service.description}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {service.durations.map((d) => (
              <span key={d.minutes} className="rounded-lg bg-brand-bg-tertiary px-2 py-1 text-[10px] text-brand-text-secondary">
                {d.minutes}{t("min")} · {formatPrice(d.price)}
              </span>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={onToggle} title={service.isActive ? t("inactive") : t("active")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-text-tertiary hover:bg-brand-bg-tertiary transition-colors">
            {service.isActive ? <ToggleRight size={18} className="text-brand-primary" /> : <ToggleLeft size={18} />}
          </button>
          <button type="button" onClick={onEdit} className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-text-tertiary hover:bg-brand-bg-tertiary transition-colors"><Pencil size={14} /></button>
          <button type="button" onClick={onDelete} className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-text-tertiary hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 size={14} /></button>
          <button type="button" onClick={() => setExpanded((v) => !v)} className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-text-tertiary hover:bg-brand-bg-tertiary transition-colors">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-brand-border px-4 pb-4 pt-3">
          <p className="text-xs text-brand-text-secondary">{service.description}</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {service.durations.map((d) => (
              <div key={d.minutes} className="rounded-xl bg-brand-bg-tertiary p-2.5 text-center">
                <p className="text-sm font-bold text-brand-text-primary">{formatPrice(d.price)}</p>
                <p className="text-[10px] text-brand-text-tertiary">{d.minutes} {t("minutes")}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
