"use client"

import { useState } from "react"
import {
  Plus, Pencil, Trash2, X, ToggleLeft, ToggleRight,
  Sparkles, Package, ChevronDown, ChevronUp, Clock, BadgeDollarSign,
  DoorOpen, Users, Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useServices } from "@/lib/data/services-store"
import { useLanguage } from "@/lib/i18n/language-context"
import type { ServiceOption, ServiceAddOn, MassageRoom, MassageType, RoomType } from "@/lib/types"

// ─── Constants ────────────────────────────────────────────────────────────────

const MASSAGE_TYPE_VALUES: MassageType[] = [
  "thai", "swedish", "deep-tissue", "aromatherapy",
  "hot-stone", "sports", "reflexology", "shiatsu",
]

const ROOM_TYPE_VALUES: { value: RoomType; icon: React.ReactNode }[] = [
  { value: "room",   icon: <DoorOpen size={14} /> },
  { value: "bed",    icon: <Layers size={14} /> },
  { value: "suite",  icon: <Sparkles size={14} /> },
  { value: "couple", icon: <Users size={14} /> },
]

const ROOM_TYPE_COLORS: Record<RoomType, string> = {
  room:   "bg-blue-500/15 text-blue-400",
  bed:    "bg-green-500/15 text-green-400",
  suite:  "bg-yellow-500/15 text-yellow-400",
  couple: "bg-pink-500/15 text-pink-400",
}

const TYPE_COLORS: Record<MassageType, string> = {
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

// ─── Service Modal ────────────────────────────────────────────────────────────

type ServiceDraft = {
  name: string; type: MassageType; description: string
  durations: { minutes: number; price: number }[]
  isPopular: boolean; isActive: boolean
}

function ServiceModal({ initial, onSave, onClose }: {
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

// ─── Add-on Modal ─────────────────────────────────────────────────────────────

type AddOnDraft = {
  name: string; description: string; price: number; extraMinutes: number
  applicableServices: MassageType[] | "all"; isActive: boolean
}

function AddOnModal({ initial, onSave, onClose }: {
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

// ─── Room Modal ───────────────────────────────────────────────────────────────

type RoomDraft = {
  name: string; type: RoomType; capacity: number
  floor: string; description: string; isActive: boolean
}

function RoomModal({ initial, onSave, onClose }: {
  initial?: MassageRoom
  onSave: (d: RoomDraft) => void
  onClose: () => void
}) {
  const { t } = useLanguage()
  const [draft, setDraft] = useState<RoomDraft>({
    name: initial?.name ?? "",
    type: initial?.type ?? "room",
    capacity: initial?.capacity ?? 1,
    floor: initial?.floor ?? "",
    description: initial?.description ?? "",
    isActive: initial?.isActive ?? true,
  })

  function setField<K extends keyof RoomDraft>(k: K, v: RoomDraft[K]) {
    setDraft((p) => ({ ...p, [k]: v }))
  }

  const roomTypeLabels: Record<RoomType, string> = {
    room: t("roomTypePrivate"),
    bed: t("roomTypeOpenBed"),
    suite: t("roomTypeVIP"),
    couple: t("roomTypeCouple"),
  }

  const valid = draft.name.trim() && draft.capacity >= 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-brand-border bg-brand-bg-secondary p-5 shadow-2xl max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-brand-text-primary">{initial ? t("editRoom") : t("newRoom")}</h2>
          <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-brand-text-tertiary hover:bg-brand-bg-tertiary"><X size={16} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-text-secondary">{t("roomName")}</label>
            <input value={draft.name} onChange={(e) => setField("name", e.target.value)}
              placeholder="e.g. Room 1, Bed 3, VIP Suite A"
              className="w-full rounded-xl border border-brand-border bg-brand-bg-tertiary px-3 py-2.5 text-sm text-brand-text-primary outline-none focus:border-brand-primary/50 placeholder-brand-text-tertiary" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-brand-text-secondary">{t("roomType")}</label>
            <div className="grid grid-cols-2 gap-2">
              {ROOM_TYPE_VALUES.map((rt) => (
                <button key={rt.value} type="button" onClick={() => {
                  setField("type", rt.value)
                  if (rt.value === "couple") setField("capacity", 2)
                  else if (draft.capacity > 1) setField("capacity", 1)
                }}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                    draft.type === rt.value
                      ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                      : "border-brand-border bg-brand-bg-tertiary text-brand-text-secondary hover:border-brand-primary/30"
                  )}>
                  {rt.icon} {roomTypeLabels[rt.value]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-text-secondary">{t("capacity")}</label>
              <input type="number" min={1} max={4} value={draft.capacity}
                onChange={(e) => setField("capacity", parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border border-brand-border bg-brand-bg-tertiary px-3 py-2.5 text-sm text-brand-text-primary outline-none focus:border-brand-primary/50" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-text-secondary">{t("floor")}</label>
              <input value={draft.floor} onChange={(e) => setField("floor", e.target.value)}
                placeholder="e.g. Ground Floor"
                className="w-full rounded-xl border border-brand-border bg-brand-bg-tertiary px-3 py-2.5 text-sm text-brand-text-primary outline-none focus:border-brand-primary/50 placeholder-brand-text-tertiary" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-brand-text-secondary">{t("description")} ({t("optional")})</label>
            <textarea value={draft.description} onChange={(e) => setField("description", e.target.value)} rows={2}
              placeholder="Any features or notes for this space…"
              className="w-full rounded-xl border border-brand-border bg-brand-bg-tertiary px-3 py-2.5 text-sm text-brand-text-primary outline-none focus:border-brand-primary/50 placeholder-brand-text-tertiary resize-none" />
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
            {initial ? t("saveChanges") : t("addRoom")}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Service Card ─────────────────────────────────────────────────────────────

function ServiceCard({ service, onEdit, onDelete, onToggle }: {
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

// ─── Add-on Card ──────────────────────────────────────────────────────────────

function AddOnCard({ addOn, onEdit, onDelete, onToggle }: {
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

// ─── Room Card ────────────────────────────────────────────────────────────────

function RoomCard({ room, onEdit, onDelete, onToggle }: {
  room: MassageRoom; onEdit: () => void; onDelete: () => void; onToggle: () => void
}) {
  const { t } = useLanguage()
  const rt = ROOM_TYPE_VALUES.find((r) => r.value === room.type)
  const roomTypeLabels: Record<RoomType, string> = {
    room: t("roomTypePrivate"),
    bed: t("roomTypeOpenBed"),
    suite: t("roomTypeVIP"),
    couple: t("roomTypeCouple"),
  }
  return (
    <div className={cn("flex items-start gap-3 rounded-2xl border bg-card p-4 transition-opacity", room.isActive ? "border-brand-border" : "border-brand-border opacity-60")}>
      <div className={cn("mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", ROOM_TYPE_COLORS[room.type])}>
        {rt?.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <h3 className="text-sm font-semibold text-brand-text-primary">{room.name}</h3>
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", ROOM_TYPE_COLORS[room.type])}>
            {roomTypeLabels[room.type]}
          </span>
          {room.capacity > 1 && (
            <span className="flex items-center gap-1 rounded-full bg-brand-bg-tertiary px-2 py-0.5 text-[10px] text-brand-text-secondary">
              <Users size={9} /> {room.capacity}
            </span>
          )}
          {!room.isActive && <span className="rounded-full bg-brand-text-tertiary/20 px-2 py-0.5 text-[10px] font-medium text-brand-text-tertiary">{t("inactive")}</span>}
        </div>
        {room.floor && <p className="text-[10px] text-brand-text-tertiary mb-0.5">{room.floor}</p>}
        {room.description && <p className="text-xs text-brand-text-secondary line-clamp-2">{room.description}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button type="button" onClick={onToggle} title={room.isActive ? t("inactive") : t("active")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-text-tertiary hover:bg-brand-bg-tertiary transition-colors">
          {room.isActive ? <ToggleRight size={18} className="text-brand-primary" /> : <ToggleLeft size={18} />}
        </button>
        <button type="button" onClick={onEdit} className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-text-tertiary hover:bg-brand-bg-tertiary transition-colors"><Pencil size={14} /></button>
        <button type="button" onClick={onDelete} className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-text-tertiary hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 size={14} /></button>
      </div>
    </div>
  )
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  const { t } = useLanguage()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl border border-brand-border bg-brand-bg-secondary p-5 shadow-2xl">
        <h3 className="text-base font-semibold text-brand-text-primary">{t("deleteConfirmTitle")} "{name}"?</h3>
        <p className="mt-1 text-sm text-brand-text-secondary">{t("deleteConfirmDesc")}</p>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-brand-border py-2.5 text-sm font-medium text-brand-text-secondary hover:bg-brand-bg-tertiary transition-colors">{t("cancel")}</button>
          <button type="button" onClick={onConfirm} className="flex-1 rounded-xl bg-destructive py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity">{t("delete")}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "services" | "addons" | "rooms"
type Modal =
  | { kind: "new-service" }
  | { kind: "edit-service"; service: ServiceOption }
  | { kind: "delete-service"; service: ServiceOption }
  | { kind: "new-addon" }
  | { kind: "edit-addon"; addOn: ServiceAddOn }
  | { kind: "delete-addon"; addOn: ServiceAddOn }
  | { kind: "new-room" }
  | { kind: "edit-room"; room: MassageRoom }
  | { kind: "delete-room"; room: MassageRoom }
  | null

export default function ServicesPage() {
  const { t } = useLanguage()
  const { services, addOns, rooms, createService, updateService, deleteService, createAddOn, updateAddOn, deleteAddOn, createRoom, updateRoom, deleteRoom } = useServices()
  const [tab, setTab] = useState<Tab>("services")
  const [modal, setModal] = useState<Modal>(null)

  function handleSaveService(draft: Parameters<typeof createService>[0]) {
    if (modal?.kind === "edit-service") updateService(modal.service.id, draft)
    else createService(draft)
    setModal(null)
  }
  function handleSaveAddOn(draft: Parameters<typeof createAddOn>[0]) {
    if (modal?.kind === "edit-addon") updateAddOn(modal.addOn.id, draft)
    else createAddOn(draft)
    setModal(null)
  }
  function handleSaveRoom(draft: Parameters<typeof createRoom>[0]) {
    if (modal?.kind === "edit-room") updateRoom(modal.room.id, draft)
    else createRoom(draft)
    setModal(null)
  }

  const newButtonLabel = tab === "services" ? t("addService") : tab === "addons" ? t("addAddOn") : t("addRoom")
  const newButtonModal: Modal = tab === "services" ? { kind: "new-service" } : tab === "addons" ? { kind: "new-addon" } : { kind: "new-room" }

  const activeRooms = rooms.filter((r) => r.isActive).length

  const roomTypeLabels: Record<RoomType, string> = {
    room: t("roomTypePrivate"),
    bed: t("roomTypeOpenBed"),
    suite: t("roomTypeVIP"),
    couple: t("roomTypeCouple"),
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-text-primary">{t("navServices")}</h1>
          <p className="mt-0.5 text-sm text-brand-text-secondary">{t("massageTypes")}, {t("addOnsTab")}, {t("roomsBedsTab")}</p>
        </div>
        <button type="button" onClick={() => setModal(newButtonModal)}
          className="flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-[#0A0A0F] hover:opacity-90 transition-opacity">
          <Plus size={16} /> {newButtonLabel}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-brand-border bg-brand-bg-secondary p-1">
        {([
          { id: "services" as Tab, label: t("massageTypes"), icon: <Sparkles size={14} />, count: `${services.filter((s) => s.isActive).length}/${services.length}` },
          { id: "addons"   as Tab, label: t("addOnsTab"),    icon: <Package size={14} />,  count: `${addOns.filter((a) => a.isActive).length}/${addOns.length}` },
          { id: "rooms"    as Tab, label: t("roomsBedsTab"), icon: <DoorOpen size={14} />, count: `${activeRooms}/${rooms.length}` },
        ]).map((tabItem) => (
          <button key={tabItem.id} type="button" onClick={() => setTab(tabItem.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors",
              tab === tabItem.id ? "bg-brand-primary text-[#0A0A0F]" : "text-brand-text-secondary hover:text-brand-text-primary"
            )}>
            {tabItem.icon} {tabItem.label}
            <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold", tab === tabItem.id ? "bg-[#0A0A0F]/20" : "bg-brand-bg-tertiary")}>
              {tabItem.count}
            </span>
          </button>
        ))}
      </div>

      {/* Services list */}
      {tab === "services" && (
        <div className="space-y-3">
          {services.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-border py-16 text-center">
              <Sparkles size={32} className="mb-3 text-brand-text-tertiary" />
              <p className="text-sm font-medium text-brand-text-secondary">{t("noServices")}</p>
            </div>
          ) : services.map((service) => (
            <ServiceCard key={service.id} service={service}
              onEdit={() => setModal({ kind: "edit-service", service })}
              onDelete={() => setModal({ kind: "delete-service", service })}
              onToggle={() => updateService(service.id, { isActive: !service.isActive })} />
          ))}
        </div>
      )}

      {/* Add-ons list */}
      {tab === "addons" && (
        <div className="space-y-3">
          {addOns.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-border py-16 text-center">
              <Package size={32} className="mb-3 text-brand-text-tertiary" />
              <p className="text-sm font-medium text-brand-text-secondary">{t("noAddOns")}</p>
            </div>
          ) : addOns.map((addOn) => (
            <AddOnCard key={addOn.id} addOn={addOn}
              onEdit={() => setModal({ kind: "edit-addon", addOn })}
              onDelete={() => setModal({ kind: "delete-addon", addOn })}
              onToggle={() => updateAddOn(addOn.id, { isActive: !addOn.isActive })} />
          ))}
        </div>
      )}

      {/* Rooms list */}
      {tab === "rooms" && (
        <div className="space-y-3">
          {rooms.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {(["room", "bed", "suite", "couple"] as RoomType[]).map((type) => {
                const count = rooms.filter((r) => r.type === type && r.isActive).length
                return (
                  <div key={type} className="rounded-xl border border-brand-border bg-card p-3 text-center">
                    <p className={cn("text-lg font-bold", ROOM_TYPE_COLORS[type].split(" ")[1])}>{count}</p>
                    <p className="text-[10px] text-brand-text-tertiary mt-0.5">{roomTypeLabels[type]}</p>
                  </div>
                )
              })}
            </div>
          )}

          {rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-border py-16 text-center">
              <DoorOpen size={32} className="mb-3 text-brand-text-tertiary" />
              <p className="text-sm font-medium text-brand-text-secondary">{t("noRooms")}</p>
            </div>
          ) : rooms.map((room) => (
            <RoomCard key={room.id} room={room}
              onEdit={() => setModal({ kind: "edit-room", room })}
              onDelete={() => setModal({ kind: "delete-room", room })}
              onToggle={() => updateRoom(room.id, { isActive: !room.isActive })} />
          ))}
        </div>
      )}

      {/* Modals */}
      {(modal?.kind === "new-service" || modal?.kind === "edit-service") && (
        <ServiceModal initial={modal.kind === "edit-service" ? modal.service : undefined} onSave={handleSaveService} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "delete-service" && (
        <DeleteConfirm name={modal.service.name} onConfirm={() => { deleteService(modal.service.id); setModal(null) }} onCancel={() => setModal(null)} />
      )}
      {(modal?.kind === "new-addon" || modal?.kind === "edit-addon") && (
        <AddOnModal initial={modal.kind === "edit-addon" ? modal.addOn : undefined} onSave={handleSaveAddOn} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "delete-addon" && (
        <DeleteConfirm name={modal.addOn.name} onConfirm={() => { deleteAddOn(modal.addOn.id); setModal(null) }} onCancel={() => setModal(null)} />
      )}
      {(modal?.kind === "new-room" || modal?.kind === "edit-room") && (
        <RoomModal initial={modal.kind === "edit-room" ? modal.room : undefined} onSave={handleSaveRoom} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "delete-room" && (
        <DeleteConfirm name={modal.room.name} onConfirm={() => { deleteRoom(modal.room.id); setModal(null) }} onCancel={() => setModal(null)} />
      )}
    </div>
  )
}
