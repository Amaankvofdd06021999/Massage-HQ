"use client"

import { DoorOpen } from "lucide-react"
import { PillButton, PillButtonRow } from "@/components/shared/pill-button"
import { useLanguage } from "@/lib/i18n/language-context"
import { ROOM_TYPE_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { StaffMember, MassageRoom, RoomType, TimeSlot } from "@/lib/types"

interface DateInfo {
  label: string
  date: string
  dayNum: number
  month: string
}

interface DateTimeStepProps {
  selectedStaff: StaffMember | null
  dates: DateInfo[]
  selectedDate: number
  selectedTime: string | null
  selectedRoom: MassageRoom | null
  timeSlots: TimeSlot[]
  activeRooms: MassageRoom[]
  onSelectDate: (index: number) => void
  onSelectTime: (time: string | null) => void
  onSelectRoom: (room: MassageRoom | null) => void
}

export function DateTimeStep({
  selectedStaff,
  dates,
  selectedDate,
  selectedTime,
  selectedRoom,
  timeSlots,
  activeRooms,
  onSelectDate,
  onSelectTime,
  onSelectRoom,
}: DateTimeStepProps) {
  const { t } = useLanguage()

  const roomTypeLabels: Record<RoomType, string> = {
    room: t("roomTypePrivate"),
    bed: t("roomTypeOpenBed"),
    suite: t("roomTypeVIP"),
    couple: t("roomTypeCouple"),
  }

  return (
    <div className="mt-6 px-5 page-transition">
      <h2 className="text-lg font-bold text-brand-text-primary">{t("selectDateAndTime")}</h2>
      <p className="mt-1 text-sm text-brand-text-secondary">
        {t("bookingWith")} {selectedStaff?.nickname}
      </p>
      <PillButtonRow className="mt-4">
        {dates.map((d, i) => (
          <PillButton key={d.date} active={selectedDate === i} onClick={() => { onSelectDate(i); onSelectTime(null) }}>
            <div className="flex flex-col items-center">
              <span className="text-[10px]">{d.label}</span>
              <span className="text-sm font-bold">{d.dayNum}</span>
              <span className="text-[10px]">{d.month}</span>
            </div>
          </PillButton>
        ))}
      </PillButtonRow>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {timeSlots.map((slot) => (
          <button
            key={slot.time}
            type="button"
            disabled={!slot.available}
            onClick={() => onSelectTime(slot.time)}
            className={cn(
              "rounded-lg border py-2.5 text-center text-xs font-medium transition-all",
              selectedTime === slot.time
                ? "border-brand-primary bg-brand-primary/15 text-brand-primary"
                : slot.available
                ? "border-brand-border bg-card text-brand-text-primary hover:border-brand-text-tertiary"
                : "cursor-not-allowed border-transparent bg-brand-bg-tertiary/50 text-brand-text-tertiary line-through"
            )}
          >
            {slot.time}
          </button>
        ))}
      </div>

      {/* Room / Bed selection */}
      {activeRooms.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <DoorOpen size={16} className="text-brand-text-tertiary" />
            <h3 className="text-sm font-semibold text-brand-text-primary">{t("chooseRoomOrBed")}</h3>
            <span className="rounded-full bg-brand-bg-tertiary px-2 py-0.5 text-[10px] text-brand-text-tertiary">{t("optional")}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {activeRooms.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => onSelectRoom(selectedRoom?.id === room.id ? null : room)}
                className={cn(
                  "overflow-hidden rounded-2xl border text-left transition-all card-press",
                  selectedRoom?.id === room.id
                    ? "border-brand-primary bg-brand-primary/5"
                    : "border-brand-border bg-card"
                )}
              >
                {room.image && (
                  <div className="relative h-24 w-full">
                    <img src={room.image} alt={room.name} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                  </div>
                )}
                <div className="p-3.5">
                  <div className={cn("mb-1.5 inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold", ROOM_TYPE_COLORS[room.type])}>
                    {roomTypeLabels[room.type]}
                  </div>
                  <p className="text-sm font-semibold text-brand-text-primary leading-tight">{room.name}</p>
                  {room.floor && <p className="mt-0.5 text-[10px] text-brand-text-tertiary">{room.floor}</p>}
                  {room.description && <p className="mt-1 text-xs text-brand-text-secondary line-clamp-2">{room.description}</p>}
                  {room.capacity > 1 && (
                    <p className="mt-1 text-[10px] text-brand-text-tertiary">{t("upToGuests")} {room.capacity} {t("guests")}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
