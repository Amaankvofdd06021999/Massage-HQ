"use client"

import { useMemo } from "react"
import { StaffMember, Booking } from "@/lib/types"
import { useLanguage } from "@/lib/i18n/language-context"

interface TimeBlock {
  startMinutes: number  // Minutes from midnight
  endMinutes: number
  type: "free" | "booked" | "selected" | "too-short"
  label?: string
}

interface TherapistTimelineProps {
  staff: StaffMember
  date: string                    // YYYY-MM-DD
  existingBookings: Booking[]     // All bookings for this staff on this date
  tentativeBookings?: { startTime: string; duration: number }[]  // Bookings being built in current call
  requiredDuration: number        // Minutes needed for the service
  selectedTime?: string           // Currently selected time on this row
  onSelectTime: (staffId: string, time: string) => void
  operatingStart?: number         // Hour (default 10)
  operatingEnd?: number           // Hour (default 21)
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`
}

export function TherapistTimeline({
  staff,
  date,
  existingBookings,
  tentativeBookings = [],
  requiredDuration,
  selectedTime,
  onSelectTime,
  operatingStart = 10,
  operatingEnd = 21,
}: TherapistTimelineProps) {
  const { t } = useLanguage()

  // Determine if this staff works on this date and get their actual working hours
  const dayOfWeek = new Date(date).toLocaleDateString("en-US", { weekday: "short" }).toLowerCase().slice(0, 3) as
    "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"
  const availability = staff.availability[dayOfWeek]
  const isDayOff = !availability

  // Use staff's actual working hours instead of shop operating hours
  const effectiveStart = availability ? parseInt(availability.start.split(":")[0]) : operatingStart
  const effectiveEnd = availability ? parseInt(availability.end.split(":")[0]) : operatingEnd
  const totalMinutes = (effectiveEnd - effectiveStart) * 60

  // Compute booked blocks from existing + tentative bookings
  const bookedRanges = useMemo(() => {
    const ranges: { start: number; end: number }[] = []

    existingBookings
      .filter(b => b.staffId === staff.id && b.date === date && b.status !== "cancelled" && b.status !== "rejected")
      .forEach(b => {
        ranges.push({ start: timeToMinutes(b.startTime), end: timeToMinutes(b.endTime) })
      })

    tentativeBookings.forEach(tb => {
      const start = timeToMinutes(tb.startTime)
      ranges.push({ start, end: start + tb.duration })
    })

    return ranges.sort((a, b) => a.start - b.start)
  }, [existingBookings, tentativeBookings, staff.id, date])

  // Build time blocks for the timeline
  const blocks = useMemo(() => {
    if (isDayOff) return []

    const opStart = effectiveStart * 60
    const opEnd = effectiveEnd * 60
    const result: TimeBlock[] = []
    let cursor = opStart

    for (const range of bookedRanges) {
      if (range.start > cursor) {
        // Free gap before this booking
        const gapDuration = range.start - cursor
        result.push({
          startMinutes: cursor,
          endMinutes: range.start,
          type: gapDuration >= requiredDuration ? "free" : "too-short",
        })
      }
      result.push({
        startMinutes: Math.max(range.start, cursor),
        endMinutes: range.end,
        type: "booked",
        label: t("phoneBookingBooked"),
      })
      cursor = Math.max(cursor, range.end)
    }

    // Trailing free gap
    if (cursor < opEnd) {
      const gapDuration = opEnd - cursor
      result.push({
        startMinutes: cursor,
        endMinutes: opEnd,
        type: gapDuration >= requiredDuration ? "free" : "too-short",
      })
    }

    return result
  }, [bookedRanges, isDayOff, effectiveStart, effectiveEnd, requiredDuration, t])

  // Count free slots (30-min increments that fit the required duration)
  const freeSlotCount = useMemo(() => {
    return blocks
      .filter(b => b.type === "free")
      .reduce((count, block) => {
        const slots = Math.floor((block.endMinutes - block.startMinutes) / 30)
        return count + slots
      }, 0)
  }, [blocks])

  const initials = staff.nickname?.[0] || staff.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
  const isSelected = !!selectedTime

  return (
    <div className={`flex items-center rounded-lg p-1.5 ${
      isDayOff ? "opacity-40" : ""
    } ${isSelected ? "border-2 border-brand-primary" : "border border-brand-border"} bg-brand-bg-primary`}>
      {/* Staff name column */}
      <div className="w-24 flex items-center gap-2 shrink-0">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs text-white font-medium ${
          isDayOff ? "bg-gray-500" : freeSlotCount > 0 ? "bg-green-600" : "bg-gray-500"
        }`}>
          {initials}
        </div>
        <div>
          <div className="text-xs font-medium text-brand-text-primary truncate">{staff.nickname || staff.name.split(" ")[0]}</div>
          <div className={`text-[10px] ${isDayOff ? "text-red-500" : freeSlotCount > 0 ? "text-green-500" : "text-red-500"}`}>
            {isDayOff ? t("phoneBookingDayOff") : `${freeSlotCount} ${t("phoneBookingFreeSlots")}`}
          </div>
        </div>
      </div>

      {/* Timeline bar */}
      <div className="flex-1 h-7 relative bg-brand-bg-secondary rounded overflow-hidden">
        {isDayOff ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-brand-text-secondary"
            style={{ background: "repeating-linear-gradient(45deg, transparent, transparent 4px, var(--brand-border) 4px, var(--brand-border) 8px)" }}>
            {t("phoneBookingDayOff")}
          </div>
        ) : (
          blocks.map((block, i) => {
            const left = ((block.startMinutes - effectiveStart * 60) / totalMinutes) * 100
            const width = ((block.endMinutes - block.startMinutes) / totalMinutes) * 100

            if (block.type === "booked") {
              return (
                <div
                  key={i}
                  className="absolute top-0 h-full bg-red-500/15 border border-red-500/30 rounded-sm flex items-center justify-center text-[9px] text-red-500"
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  {width > 8 ? t("phoneBookingBooked") : ""}
                </div>
              )
            }

            if (block.type === "too-short") {
              return (
                <div
                  key={i}
                  className="absolute top-0 h-full bg-yellow-500/10 border border-yellow-500/20 rounded-sm flex items-center justify-center text-[9px] text-yellow-500/60"
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  {width > 8 ? t("phoneBookingTooShort") : ""}
                </div>
              )
            }

            // Free block — render clickable 30-min slots
            const slotCount = Math.floor((block.endMinutes - block.startMinutes) / 30)
            const slotWidth = width / slotCount

            return Array.from({ length: slotCount }, (_, j) => {
              const slotStart = block.startMinutes + j * 30
              const slotTime = minutesToTime(slotStart)
              const isThisSelected = selectedTime === slotTime

              return (
                <button
                  key={`${i}-${j}`}
                  onClick={() => onSelectTime(staff.id, slotTime)}
                  className={`absolute top-0 h-full rounded-sm flex items-center justify-center text-[9px] transition-colors ${
                    isThisSelected
                      ? "bg-brand-primary/30 border-2 border-brand-primary text-brand-primary font-bold"
                      : "bg-green-500/10 border border-dashed border-green-500/30 text-green-500 hover:bg-green-500/20"
                  }`}
                  style={{ left: `${left + j * slotWidth}%`, width: `${slotWidth}%` }}
                >
                  {isThisSelected ? slotTime : (slotWidth > 6 ? "●" : "")}
                </button>
              )
            })
          })
        )}
      </div>
    </div>
  )
}
