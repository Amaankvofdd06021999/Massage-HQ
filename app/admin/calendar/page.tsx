"use client"

import { useMemo, useState } from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { StaffAvatar } from "@/components/shared/staff-avatar"
import { staffMembers, formatPrice } from "@/lib/data/mock-data"
import { useBookings } from "@/lib/data/bookings-store"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"
import type { Booking, BookingStatus } from "@/lib/types"

const hours = Array.from({ length: 13 }, (_, i) => i + 10) // 10:00 - 22:00

// ─── Status styling map ──────────────────────────────────────────────────────
const statusStyles: Record<string, string> = {
  confirmed: "bg-brand-green/15 text-brand-green",
  pending: "bg-brand-yellow/15 text-brand-yellow",
  completed: "bg-brand-text-tertiary/15 text-brand-text-secondary",
  cancelled: "bg-brand-coral/15 text-brand-coral",
  "in-progress": "bg-brand-blue/15 text-brand-blue",
  "no-show": "bg-brand-coral/15 text-brand-coral",
  rejected: "bg-brand-coral/15 text-brand-coral",
}

const statusDotColors: Record<string, string> = {
  confirmed: "bg-brand-green",
  pending: "bg-brand-yellow",
  completed: "bg-brand-text-tertiary",
  cancelled: "bg-brand-coral",
  "in-progress": "bg-brand-blue",
  "no-show": "bg-brand-coral",
  rejected: "bg-brand-coral",
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function getMonday(d: Date): Date {
  const result = new Date(d)
  const day = result.getDay()
  const diff = day === 0 ? -6 : 1 - day
  result.setDate(result.getDate() + diff)
  result.setHours(0, 0, 0, 0)
  return result
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  // 0 = Sunday, we want Monday = 0
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function AdminCalendarPage() {
  const { t } = useLanguage()
  const { bookings } = useBookings()
  const [view, setView] = useState<"day" | "week" | "month">("day")
  const [dateOffset, setDateOffset] = useState(0)
  const [monthOffset, setMonthOffset] = useState(0)
  const [weekOffset, setWeekOffset] = useState(0)

  // ── Current date for daily view ─────────────────────────────────────────
  const currentDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + dateOffset)
    return d
  }, [dateOffset])

  const dateStr = toDateStr(currentDate)
  const dayBookings = useMemo(
    () => bookings.filter((b) => b.date === dateStr),
    [bookings, dateStr]
  )

  // ── Week calculation ────────────────────────────────────────────────────
  const weekStart = useMemo(() => {
    const today = new Date()
    const monday = getMonday(today)
    monday.setDate(monday.getDate() + weekOffset * 7)
    return monday
  }, [weekOffset])

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      return d
    })
  }, [weekStart])

  const weekBookingsMap = useMemo(() => {
    const map: Record<string, Booking[]> = {}
    for (const d of weekDays) {
      const ds = toDateStr(d)
      map[ds] = bookings.filter((b) => b.date === ds).sort((a, b) => a.startTime.localeCompare(b.startTime))
    }
    return map
  }, [bookings, weekDays])

  // ── Month calculation ──────────────────────────────────────────────────
  const monthDate = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + monthOffset)
    d.setDate(1)
    return d
  }, [monthOffset])

  const monthYear = monthDate.getFullYear()
  const monthIndex = monthDate.getMonth()
  const daysInMonth = getDaysInMonth(monthYear, monthIndex)
  const firstDayOffset = getFirstDayOfMonth(monthYear, monthIndex)

  const monthBookings = useMemo(
    () => {
      const prefix = `${monthYear}-${String(monthIndex + 1).padStart(2, "0")}`
      return bookings.filter((b) => b.date.startsWith(prefix))
    },
    [bookings, monthYear, monthIndex]
  )

  const monthBookingsByDay = useMemo(() => {
    const map: Record<number, Booking[]> = {}
    for (const b of monthBookings) {
      const day = parseInt(b.date.split("-")[2], 10)
      if (!map[day]) map[day] = []
      map[day].push(b)
    }
    return map
  }, [monthBookings])

  const monthRevenue = useMemo(
    () => monthBookings.reduce((sum, b) => sum + (b.status !== "cancelled" && b.status !== "rejected" ? b.price : 0), 0),
    [monthBookings]
  )

  // ── Week day labels ────────────────────────────────────────────────────
  const shortDayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  // ── Switch to day view for a specific date ─────────────────────────────
  function goToDay(date: Date) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(date)
    target.setHours(0, 0, 0, 0)
    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    setDateOffset(diffDays)
    setView("day")
  }

  // ── Navigation label helpers ───────────────────────────────────────────
  const navLabel = useMemo(() => {
    if (view === "day") {
      return currentDate.toLocaleDateString("en", { weekday: "long", day: "numeric", month: "short" })
    }
    if (view === "week") {
      const end = new Date(weekStart)
      end.setDate(end.getDate() + 6)
      return `${t("weekOf")} ${weekStart.toLocaleDateString("en", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}`
    }
    return monthDate.toLocaleDateString("en", { month: "long", year: "numeric" })
  }, [view, currentDate, weekStart, monthDate, t])

  function navigateBack() {
    if (view === "day") setDateOffset((o) => o - 1)
    else if (view === "week") setWeekOffset((o) => o - 1)
    else setMonthOffset((o) => o - 1)
  }

  function navigateForward() {
    if (view === "day") setDateOffset((o) => o + 1)
    else if (view === "week") setWeekOffset((o) => o + 1)
    else setMonthOffset((o) => o + 1)
  }

  function goToToday() {
    setDateOffset(0)
    setWeekOffset(0)
    setMonthOffset(0)
  }

  const todayStr = toDateStr(new Date())

  return (
    <div>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-brand-primary" />
          <h1 className="text-2xl font-bold text-brand-text-primary">{t("schedule")}</h1>
        </div>

        {/* View Switcher */}
        <div className="flex gap-1 rounded-xl bg-brand-bg-secondary p-1">
          {(["day", "week", "month"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-sm font-medium transition-all",
                view === v
                  ? "bg-brand-primary text-brand-primary-foreground"
                  : "text-brand-text-secondary hover:text-brand-text-primary"
              )}
            >
              {t(v === "day" ? "dailyView" : v === "week" ? "weeklyView" : "monthlyView")}
            </button>
          ))}
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={navigateBack}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border text-brand-text-secondary hover:bg-brand-bg-tertiary"
          aria-label="Previous"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="min-w-[200px] text-center text-sm font-semibold text-brand-text-primary">
          {navLabel}
        </span>
        <button
          type="button"
          onClick={navigateForward}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border text-brand-text-secondary hover:bg-brand-bg-tertiary"
          aria-label="Next"
        >
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          onClick={goToToday}
          className="ml-2 rounded-lg bg-brand-primary/15 px-3 py-1.5 text-xs font-medium text-brand-primary"
        >
          {t("today")}
        </button>
      </div>

      {/* ── Daily View ────────────────────────────────────────────────────── */}
      {view === "day" && (
        <>
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
                              statusStyles[booking.status]
                            )}
                            style={{ minHeight: `${(booking.duration / 60) * 48}px` }}
                          >
                            <p className="font-semibold">{booking.customerName}</p>
                            <p className="opacity-75">{booking.serviceName}</p>
                            <p>
                              {booking.startTime}–{booking.endTime}
                            </p>
                            <p className="mt-0.5 font-medium">{formatPrice(booking.price)}</p>
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
            {dayBookings.length} {t("bookingsFor")}{" "}
            {currentDate.toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </>
      )}

      {/* ── Weekly View ───────────────────────────────────────────────────── */}
      {view === "week" && (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-brand-border">
          <div className="min-w-[800px]">
            {/* Week header row */}
            <div className="grid grid-cols-7 border-b border-brand-border bg-card">
              {weekDays.map((d, i) => {
                const ds = toDateStr(d)
                const isToday = ds === todayStr
                return (
                  <button
                    type="button"
                    key={ds}
                    onClick={() => goToDay(d)}
                    className={cn(
                      "border-r border-brand-border p-3 text-center last:border-r-0 hover:bg-brand-primary/10 transition-colors cursor-pointer",
                      isToday && "bg-brand-primary/5"
                    )}
                  >
                    <p className="text-[10px] font-medium uppercase text-brand-text-tertiary">
                      {shortDayNames[i]}
                    </p>
                    <p
                      className={cn(
                        "mt-0.5 text-lg font-bold",
                        isToday ? "text-brand-primary" : "text-brand-text-primary"
                      )}
                    >
                      {d.getDate()}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Week body */}
            <div className="grid grid-cols-7">
              {weekDays.map((d, i) => {
                const ds = toDateStr(d)
                const dayBks = weekBookingsMap[ds] || []
                const isToday = ds === todayStr
                return (
                  <div
                    key={ds}
                    onClick={() => goToDay(d)}
                    className={cn(
                      "min-h-[200px] border-r border-brand-border p-2 last:border-r-0 cursor-pointer hover:bg-brand-primary/5 transition-colors",
                      isToday && "bg-brand-primary/10"
                    )}
                  >
                    {dayBks.length === 0 && (
                      <p className="py-6 text-center text-[10px] text-brand-text-tertiary">
                        {t("noBookingsFound")}
                      </p>
                    )}
                    <div className="flex flex-col gap-1.5">
                      {dayBks.map((bk) => (
                        <div
                          key={bk.id}
                          className={cn(
                            "rounded-lg p-2 text-[10px] leading-tight",
                            statusStyles[bk.status]
                          )}
                        >
                          <p className="font-bold">
                            {bk.startTime}–{bk.endTime}
                          </p>
                          <p className="mt-0.5 font-semibold truncate">{bk.customerName}</p>
                          <p className="truncate opacity-80">{bk.staffName}</p>
                          <p className="truncate opacity-70">{bk.serviceName}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Monthly View ──────────────────────────────────────────────────── */}
      {view === "month" && (
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
                  const dots = Object.keys(statusCounts).slice(0, 4) as BookingStatus[]

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
                              className={cn("rounded px-1 py-0.5 text-[9px] leading-tight truncate", statusStyles[bk.status])}
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
      )}
    </div>
  )
}
