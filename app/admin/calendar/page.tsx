"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { StaffAvatar } from "@/components/shared/staff-avatar"
import { staffMembers, bookings } from "@/lib/data/mock-data"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"

const hours = Array.from({ length: 13 }, (_, i) => i + 10) // 10:00 - 22:00

export default function AdminCalendarPage() {
  const { t } = useLanguage()
  const [dateOffset, setDateOffset] = useState(0)

  const currentDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + dateOffset)
    return d
  }, [dateOffset])

  const dateStr = currentDate.toISOString().split("T")[0]
  const dayBookings = bookings.filter((b) => b.date === dateStr)

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-text-primary">{t("schedule")}</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDateOffset(dateOffset - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border text-brand-text-secondary hover:bg-brand-bg-tertiary"
            aria-label="Previous day"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-[140px] text-center text-sm font-semibold text-brand-text-primary">
            {currentDate.toLocaleDateString("en", { weekday: "long", day: "numeric", month: "short" })}
          </span>
          <button
            type="button"
            onClick={() => setDateOffset(dateOffset + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border text-brand-text-secondary hover:bg-brand-bg-tertiary"
            aria-label="Next day"
          >
            <ChevronRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => setDateOffset(0)}
            className="ml-2 rounded-lg bg-brand-primary/15 px-3 py-1.5 text-xs font-medium text-brand-primary"
          >
            {t("today")}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-5 overflow-x-auto rounded-2xl border border-brand-border">
        <div className="min-w-[800px]">
          {/* Header - Staff columns */}
          <div className="flex border-b border-brand-border bg-card">
            <div className="w-16 shrink-0 border-r border-brand-border p-2" />
            {staffMembers.map((staff) => (
              <div
                key={staff.id}
                className="flex flex-1 items-center gap-2 border-r border-brand-border p-3 last:border-r-0"
              >
                <StaffAvatar src={staff.avatar} name={staff.name} size="sm" available={staff.isAvailableToday} />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-brand-text-primary">{staff.nickname}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Time rows */}
          {hours.map((hour) => (
            <div key={hour} className="flex border-b border-brand-border last:border-b-0">
              <div className="flex w-16 shrink-0 items-start justify-end border-r border-brand-border px-2 py-1">
                <span className="text-[10px] text-brand-text-tertiary">{hour}:00</span>
              </div>
              {staffMembers.map((staff) => {
                const booking = dayBookings.find(
                  (b) => b.staffId === staff.id && parseInt(b.startTime.split(":")[0]) === hour
                )
                return (
                  <div
                    key={staff.id}
                    className="relative flex-1 border-r border-brand-border p-1 last:border-r-0"
                    style={{ minHeight: "48px" }}
                  >
                    {booking && (
                      <div
                        className={cn(
                          "rounded-lg p-1.5 text-[10px]",
                          booking.status === "confirmed" && "bg-brand-green/15 text-brand-green",
                          booking.status === "in-progress" && "bg-brand-blue/15 text-brand-blue",
                          booking.status === "completed" && "bg-brand-text-tertiary/15 text-brand-text-secondary",
                          booking.status === "cancelled" && "bg-brand-coral/15 text-brand-coral"
                        )}
                        style={{ minHeight: `${(booking.duration / 60) * 48}px` }}
                      >
                        <p className="font-semibold">{booking.customerName}</p>
                        <p className="opacity-75">{booking.serviceName}</p>
                        <p>{booking.startTime}-{booking.endTime}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-brand-text-tertiary">
        {dayBookings.length} {t("bookingsFor")} {currentDate.toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long" })}
      </p>
    </div>
  )
}
