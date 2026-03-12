"use client"

import { formatPrice } from "@/lib/utils/formatters"
import { STATUS_STYLES } from "@/lib/constants"
import { toDateStr } from "@/lib/utils/time"
import { cn } from "@/lib/utils"
import type { Booking, BookingStatus } from "@/lib/types"
import type { TranslationKey } from "@/lib/i18n/translations"

const shortDayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

interface MonthViewProps {
  monthDate: Date
  monthBookings: Booking[]
  monthBookingsByDay: Record<number, Booking[]>
  daysInMonth: number
  firstDayOffset: number
  monthRevenue: number
  todayStr: string
  goToDay: (date: Date) => void
  t: (key: TranslationKey) => string
}

export function MonthView({
  monthDate,
  monthBookings,
  monthBookingsByDay,
  daysInMonth,
  firstDayOffset,
  monthRevenue,
  todayStr,
  goToDay,
  t,
}: MonthViewProps) {
  const monthYear = monthDate.getFullYear()
  const monthIndex = monthDate.getMonth()

  return (
    <>
      {/* Summary bar */}
      <div className="mt-4 flex items-center gap-4 rounded-xl bg-brand-bg-secondary px-4 py-2.5 text-sm">
        <span className="font-medium text-brand-text-primary">
          {monthBookings.length} {t("bookingsCount")}
        </span>
        <span className="text-brand-text-tertiary">|</span>
        <span className="font-medium text-brand-green">
          {formatPrice(monthRevenue)} {t("revenue").toLowerCase()}
        </span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-brand-border">
        <div className="min-w-[700px]">
          {/* Day of week header */}
          <div className="grid grid-cols-7 border-b border-brand-border bg-card">
            {shortDayNames.map((name) => (
              <div
                key={name}
                className="border-r border-brand-border p-2 text-center last:border-r-0"
              >
                <span className="text-[11px] font-semibold uppercase text-brand-text-tertiary">
                  {name}
                </span>
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells for days before the first of the month */}
            {Array.from({ length: firstDayOffset }, (_, i) => (
              <div
                key={`empty-${i}`}
                className="min-h-[110px] border-b border-r border-brand-border bg-brand-bg-secondary/30 last:border-r-0"
              />
            ))}

            {/* Actual days */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const dayNum = i + 1
              const dayDate = new Date(monthYear, monthIndex, dayNum)
              const ds = toDateStr(dayDate)
              const isToday = ds === todayStr
              const dayBks = monthBookingsByDay[dayNum] || []
              const statusCounts: Partial<Record<BookingStatus, number>> = {}
              for (const b of dayBks) {
                statusCounts[b.status] = (statusCounts[b.status] || 0) + 1
              }

              // Calculate column index for border styling
              const colIndex = (firstDayOffset + i) % 7

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => goToDay(dayDate)}
                  className={cn(
                    "min-h-[110px] border-b border-r border-brand-border p-2 text-left transition-colors hover:bg-brand-bg-tertiary",
                    colIndex === 6 && "border-r-0",
                    isToday && "bg-brand-primary/5"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                        isToday
                          ? "bg-brand-primary text-brand-primary-foreground"
                          : "text-brand-text-primary"
                      )}
                    >
                      {dayNum}
                    </span>
                    {dayBks.length > 0 && (
                      <span className="rounded-full bg-brand-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-brand-primary">
                        {dayBks.length}
                      </span>
                    )}
                  </div>
                  {dayBks.length > 0 && (
                    <div className="mt-1 flex flex-col gap-0.5">
                      {dayBks.slice(0, 3).map((bk) => (
                        <div
                          key={bk.id}
                          className={cn("rounded px-1 py-0.5 text-[9px] leading-tight truncate", STATUS_STYLES[bk.status])}
                        >
                          <span className="font-semibold">{bk.staffName.split(" ")[0]}</span>
                          {" · "}
                          <span>{bk.customerName.split(" ")[0]}</span>
                        </div>
                      ))}
                      {dayBks.length > 3 && (
                        <span className="text-[9px] text-brand-text-tertiary pl-1">+{dayBks.length - 3} more</span>
                      )}
                    </div>
                  )}
                </button>
              )
            })}

            {/* Trailing empty cells to complete the last row */}
            {(() => {
              const totalCells = firstDayOffset + daysInMonth
              const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)
              return Array.from({ length: remaining }, (_, i) => (
                <div
                  key={`trail-${i}`}
                  className={cn(
                    "min-h-[90px] border-b border-r border-brand-border bg-brand-bg-secondary/30",
                    (firstDayOffset + daysInMonth + i) % 7 === 6 && "border-r-0"
                  )}
                />
              ))
            })()}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-brand-text-tertiary">
        {t("totalBookingsThisMonth")}: {monthBookings.length}
      </p>
    </>
  )
}
