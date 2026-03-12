"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/i18n/language-context"
import { MASSAGE_TYPE_VALUES } from "@/lib/constants"
import type { ServiceAddOn, MassageType } from "@/lib/types"

// ─── Types ────────────────────────────────────────────────────────────────────

export type AddOnDraft = {
  name: string; description: string; price: number; extraMinutes: number
  applicableServices: MassageType[] | "all"; isActive: boolean
}

// ─── Add-on Modal ─────────────────────────────────────────────────────────────

export function AddOnModal({ initial, onSave, onClose }: {
  initial?: ServiceAddOn
  onSave: (d: AddOnDraft) => void
  onClose: () => void
}) {
  const { t } = useLanguage()
  const [draft, setDraft] = useState<AddOnDraft>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: initial?.price ?? 150,
    extraMinutes: initial?.extraMinutes ?? 0,
    applicableServices: initial?.applicableServices ?? "all",
    isActive: initial?.isActive ?? true,
  })
  const [appliesToAll, setAppliesToAll] = useState(!initial || initial.applicableServices === "all")

  function setField<K extends keyof AddOnDraft>(k: K, v: AddOnDraft[K]) {
    setDraft((p) => ({ ...p, [k]: v }))
  }

  function toggleServiceType(type: MassageType) {
    setDraft((p) => {
      const current = Array.isArray(p.applicableServices) ? p.applicableServices : []
      const next = current.includes(type) ? current.filter((tv) => tv !== type) : [...current, type]
      return { ...p, applicableServices: next.length ? next : [type] }
    })
  }

  const massageTypeLabels: Record<MassageType, string> = {
    thai: t("massageThai"), swedish: t("massageSwedish"), "deep-tissue": t("massageDeepTissue"),
    aromatherapy: t("massageAromatherapy"), "hot-stone": t("massageHotStone"),
    sports: t("massageSports"), reflexology: t("massageReflexology"), shiatsu: t("massageShiatsu"),
    foot: t("footMassage"),
  }

  const selectedTypes = Array.isArray(draft.applicableServices) ? draft.applicableServices : []
  const valid = draft.name.trim() && draft.description.trim() && draft.price > 0
    && (appliesToAll || selectedTypes.length > 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-brand-border bg-brand-bg-secondary p-5 shadow-2xl max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-brand-text-primary">{initial ? t("editAddOn") : t("newAddOn")}</h2>
          <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-brand-text-tertiary hover:bg-brand-bg-tertiary"><X size={16} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-text-secondary">{t("serviceName")}</label>
            <input value={draft.name} onChange={(e) => setField("name", e.target.value)} placeholder="e.g. Premium Essential Oils"
              className="w-full rounded-xl border border-brand-border bg-brand-bg-tertiary px-3 py-2.5 text-sm text-brand-text-primary outline-none focus:border-brand-primary/50 placeholder-brand-text-tertiary" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-text-secondary">{t("description")}</label>
            <textarea value={draft.description} onChange={(e) => setField("description", e.target.value)} rows={2}
              placeholder="What does this add-on include?"
              className="w-full rounded-xl border border-brand-border bg-brand-bg-tertiary px-3 py-2.5 text-sm text-brand-text-primary outline-none focus:border-brand-primary/50 placeholder-brand-text-tertiary resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-text-secondary">{t("priceLabel")} (฿)</label>
              <input type="number" min={0} step={10} value={draft.price} onChange={(e) => setField("price", parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-brand-border bg-brand-bg-tertiary px-3 py-2.5 text-sm text-brand-text-primary outline-none focus:border-brand-primary/50" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-text-secondary">{t("extraMinutes")}</label>
              <input type="number" min={0} step={5} value={draft.extraMinutes} onChange={(e) => setField("extraMinutes", parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-brand-border bg-brand-bg-tertiary px-3 py-2.5 text-sm text-brand-text-primary outline-none focus:border-brand-primary/50" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-brand-text-secondary">{t("applicableServices")}</label>
            <label className="mb-2 flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={appliesToAll} onChange={(e) => {
                setAppliesToAll(e.target.checked)
                setField("applicableServices", e.target.checked ? "all" : [])
              }} className="accent-brand-primary" />
              <span className="text-sm text-brand-text-primary">{t("allServices")}</span>
            </label>
            {!appliesToAll && (
              <div className="flex flex-wrap gap-1.5">
                {MASSAGE_TYPE_VALUES.map((v) => {
                  const isActive = selectedTypes.includes(v)
                  return (
                    <button key={v} type="button" onClick={() => toggleServiceType(v)}
                      className={cn("rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                        isActive ? "border-brand-primary bg-brand-primary/15 text-brand-primary"
                          : "border-brand-border bg-brand-bg-tertiary text-brand-text-secondary hover:border-brand-primary/40")}>
                      {massageTypeLabels[v]}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-brand-border bg-brand-bg-tertiary px-3 py-2.5">
            <input type="checkbox" checked={draft.isActive} onChange={(e) => setField("isActive", e.target.checked)} className="accent-brand-primary" />
            <span className="text-sm text-brand-text-primary">{t("active")}</span>
          </label>
        </div>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-brand-border py-2.5 text-sm font-medium text-brand-text-secondary hover:bg-brand-bg-tertiary transition-colors">{t("cancel")}</button>
          <button type="button" onClick={() => valid && onSave(draft)} disabled={!valid}
            className="flex-1 rounded-xl bg-brand-primary py-2.5 text-sm font-semibold text-[#0A0A0F] disabled:opacity-40 hover:opacity-90 transition-opacity">
            {initial ? t("saveChanges") : t("addAddOn")}
          </button>
        </div>
      </div>
    </div>
  )
}
