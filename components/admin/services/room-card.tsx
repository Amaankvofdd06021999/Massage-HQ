"use client"

import { Pencil, Trash2, ToggleLeft, ToggleRight, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/i18n/language-context"
import { ROOM_TYPE_VALUES, ROOM_TYPE_COLORS } from "@/lib/constants"
import type { MassageRoom, RoomType } from "@/lib/types"

// ─── Room Card ────────────────────────────────────────────────────────────────

export function RoomCard({ room, onEdit, onDelete, onToggle }: {
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
    <div className={cn("overflow-hidden rounded-2xl border bg-card transition-opacity", room.isActive ? "border-brand-border" : "border-brand-border opacity-60")}>
      {room.image && (
        <div className="relative h-32 w-full">
          <img src={room.image} alt={room.name} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
        </div>
      )}
      <div className={cn("flex items-start gap-3 p-4", !room.image && "")}>
        {!room.image && (
          <div className={cn("mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", ROOM_TYPE_COLORS[room.type])}>
            {rt?.icon}
          </div>
        )}

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
    </div>
  )
}
