"use client"

import { useState, useRef } from "react"
import { X, ImageIcon, Upload, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/i18n/language-context"
import { ROOM_TYPE_VALUES } from "@/lib/constants"
import type { MassageRoom, RoomType } from "@/lib/types"

// ─── Types ────────────────────────────────────────────────────────────────────

export type RoomDraft = {
  name: string; type: RoomType; capacity: number
  floor: string; description: string; image: string; isActive: boolean
}

// ─── Room Modal ───────────────────────────────────────────────────────────────

export function RoomModal({ initial, onSave, onClose }: {
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
    image: initial?.image ?? "",
    isActive: initial?.isActive ?? true,
  })

  function setField<K extends keyof RoomDraft>(k: K, v: RoomDraft[K]) {
    setDraft((p) => ({ ...p, [k]: v }))
  }

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (res.ok) {
        setField("image", data.url)
      }
    } catch {
      // silently fail
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
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

          <div>
            <label className="mb-1 block text-xs font-medium text-brand-text-secondary">{t("roomImage")} ({t("optional")})</label>
            <div className="flex items-center gap-2">
              <ImageIcon size={14} className="shrink-0 text-brand-text-tertiary" />
              <input value={draft.image} onChange={(e) => setField("image", e.target.value)}
                placeholder="https://example.com/room-photo.jpg"
                className="w-full rounded-xl border border-brand-border bg-brand-bg-tertiary px-3 py-2.5 text-sm text-brand-text-primary outline-none focus:border-brand-primary/50 placeholder-brand-text-tertiary" />
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-border bg-brand-bg-tertiary py-3 text-sm text-brand-text-secondary hover:border-brand-primary/50 hover:text-brand-primary transition-colors disabled:opacity-50">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {uploading ? t("uploading") : t("uploadFromDevice")}
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileUpload} />
            {draft.image && (
              <div className="relative mt-2 h-32 w-full overflow-hidden rounded-xl border border-brand-border">
                <img src={draft.image} alt="Room preview" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                <button type="button" onClick={() => setField("image", "")}
                  className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
                  <X size={12} />
                </button>
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
            {initial ? t("saveChanges") : t("addRoom")}
          </button>
        </div>
      </div>
    </div>
  )
}
