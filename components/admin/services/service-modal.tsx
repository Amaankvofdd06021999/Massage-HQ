"use client"

import { useState } from "react"
import { Plus, X, Clock, BadgeDollarSign } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"
import { MASSAGE_TYPE_VALUES } from "@/lib/constants"
import type { ServiceOption, MassageType } from "@/lib/types"

// ─── Duration Row ─────────────────────────────────────────────────────────────

function DurationRow({
  d, idx, onChange, onRemove, canRemove,
}: {
  d: { minutes: number; price: number }
  idx: number
  onChange: (idx: number, field: "minutes" | "price", val: number) => void
  onRemove: (idx: number) => void
  canRemove: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative flex-1">
          <Clock size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-text-tertiary" />
          <input
            type="number" min={15} step={15}
            value={d.minutes}
            onChange={(e) => onChange(idx, "minutes", parseInt(e.target.value) || 0)}
            className="w-full rounded-lg border border-brand-border bg-brand-bg-tertiary pl-8 pr-2 py-2 text-sm text-brand-text-primary outline-none focus:border-brand-primary/50"
            placeholder="mins"
          />
        </div>
        <div className="relative flex-1">
          <BadgeDollarSign size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-text-tertiary" />
          <input
            type="number" min={0} step={50}
            value={d.price}
            onChange={(e) => onChange(idx, "price", parseInt(e.target.value) || 0)}
            className="w-full rounded-lg border border-brand-border bg-brand-bg-tertiary pl-8 pr-2 py-2 text-sm text-brand-text-primary outline-none focus:border-brand-primary/50"
            placeholder="price"
          />
        </div>
      </div>
      {canRemove && (
        <button type="button" onClick={() => onRemove(idx)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-brand-text-tertiary hover:bg-destructive/10 hover:text-destructive transition-colors">
          <X size={14} />
        </button>
      )}
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type ServiceDraft = {
  name: string; type: MassageType; description: string
  durations: { minutes: number; price: number }[]
  isPopular: boolean; isActive: boolean
}

// ─── Service Modal ────────────────────────────────────────────────────────────

export function ServiceModal({ initial, onSave, onClose }: {
  initial?: ServiceOption
  onSave: (d: ServiceDraft) => void
  onClose: () => void
}) {
  const { t } = useLanguage()
  const [draft, setDraft] = useState<ServiceDraft>({
    name: initial?.name ?? "",
    type: initial?.type ?? "thai",
    description: initial?.description ?? "",
    durations: initial?.durations ?? [{ minutes: 60, price: 800 }],
    isPopular: initial?.isPopular ?? false,
    isActive: initial?.isActive ?? true,
  })

  function setField<K extends keyof ServiceDraft>(k: K, v: ServiceDraft[K]) {
    setDraft((p) => ({ ...p, [k]: v }))
  }

  function handleDurationChange(idx: number, field: "minutes" | "price", val: number) {
    setDraft((p) => {
      const durations = [...p.durations]
      durations[idx] = { ...durations[idx], [field]: val }
      return { ...p, durations }
    })
  }

  const massageTypeLabels: Record<MassageType, string> = {
    thai: t("massageThai"), swedish: t("massageSwedish"), "deep-tissue": t("massageDeepTissue"),
    aromatherapy: t("massageAromatherapy"), "hot-stone": t("massageHotStone"),
    sports: t("massageSports"), reflexology: t("massageReflexology"), shiatsu: t("massageShiatsu"),
    foot: t("footMassage"),
  }

  const valid = draft.name.trim() && draft.description.trim() && draft.durations.length > 0
    && draft.durations.every((d) => d.minutes > 0 && d.price > 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-brand-border bg-brand-bg-secondary p-5 shadow-2xl max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-brand-text-primary">{initial ? t("editMassageType") : t("newMassageType")}</h2>
          <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-brand-text-tertiary hover:bg-brand-bg-tertiary"><X size={16} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-text-secondary">{t("serviceName")}</label>
            <input value={draft.name} onChange={(e) => setField("name", e.target.value)} placeholder="e.g. Traditional Thai Massage"
              className="w-full rounded-xl border border-brand-border bg-brand-bg-tertiary px-3 py-2.5 text-sm text-brand-text-primary outline-none focus:border-brand-primary/50 placeholder-brand-text-tertiary" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-text-secondary">{t("massageType")}</label>
            <select value={draft.type} onChange={(e) => setField("type", e.target.value as MassageType)}
              className="w-full rounded-xl border border-brand-border bg-brand-bg-tertiary px-3 py-2.5 text-sm text-brand-text-primary outline-none focus:border-brand-primary/50">
              {MASSAGE_TYPE_VALUES.map((v) => <option key={v} value={v}>{massageTypeLabels[v]}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-text-secondary">{t("description")}</label>
            <textarea value={draft.description} onChange={(e) => setField("description", e.target.value)} rows={2}
              placeholder="Brief description shown to customers…"
              className="w-full rounded-xl border border-brand-border bg-brand-bg-tertiary px-3 py-2.5 text-sm text-brand-text-primary outline-none focus:border-brand-primary/50 placeholder-brand-text-tertiary resize-none" />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-medium text-brand-text-secondary">{t("durations")} (฿)</label>
              <button type="button" onClick={() => setDraft((p) => ({ ...p, durations: [...p.durations, { minutes: 90, price: 1200 }] }))}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-brand-primary hover:bg-brand-primary/10 transition-colors">
                <Plus size={12} /> {t("add")}
              </button>
            </div>
            <div className="space-y-2">
              {draft.durations.map((d, i) => (
                <DurationRow key={i} d={d} idx={i} onChange={handleDurationChange}
                  onRemove={(idx) => setDraft((p) => ({ ...p, durations: p.durations.filter((_, ii) => ii !== idx) }))}
                  canRemove={draft.durations.length > 1} />
              ))}
            </div>
            <p className="mt-1.5 text-[10px] text-brand-text-tertiary">{t("minutes")} · Price in Thai Baht</p>
          </div>
          <div className="flex gap-3">
            <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-brand-border bg-brand-bg-tertiary px-3 py-2.5">
              <input type="checkbox" checked={draft.isPopular} onChange={(e) => setField("isPopular", e.target.checked)} className="accent-brand-primary" />
              <span className="text-sm text-brand-text-primary">{t("markAsPopular")}</span>
            </label>
            <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-brand-border bg-brand-bg-tertiary px-3 py-2.5">
              <input type="checkbox" checked={draft.isActive} onChange={(e) => setField("isActive", e.target.checked)} className="accent-brand-primary" />
              <span className="text-sm text-brand-text-primary">{t("active")}</span>
            </label>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-brand-border py-2.5 text-sm font-medium text-brand-text-secondary hover:bg-brand-bg-tertiary transition-colors">{t("cancel")}</button>
          <button type="button" onClick={() => valid && onSave(draft)} disabled={!valid}
            className="flex-1 rounded-xl bg-brand-primary py-2.5 text-sm font-semibold text-[#0A0A0F] disabled:opacity-40 hover:opacity-90 transition-opacity">
            {initial ? t("saveChanges") : t("addService")}
          </button>
        </div>
      </div>
    </div>
  )
}
