"use client"

import { useMemo, useState } from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { useBookings } from "@/lib/data/bookings-store"
import { useLanguage } from "@/lib/i18n/language-context"
import { toDateStr } from "@/lib/utils/time"
import { cn } from "@/lib/utils"
import type { Booking } from "@/lib/types"

import { DayView } from "@/components/admin/calendar/day-view"
import { WeekView } from "@/components/admin/calendar/week-view"
import { MonthView } from "@/components/admin/calendar/month-view"

// ─── Helpers ────────────────────────────────────────────────────────────────
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

      {/* ── Views ─────────────────────────────────────────────────────────── */}
      {view === "day" && (
        <DayView dayBookings={dayBookings} currentDate={currentDate} t={t} />
      )}

      {view === "week" && (
        <WeekView
          weekDays={weekDays}
          weekBookingsMap={weekBookingsMap}
          todayStr={todayStr}
          goToDay={goToDay}
          t={t}
        />
      )}

      {view === "month" && (
        <MonthView
          monthDate={monthDate}
          monthBookings={monthBookings}
          monthBookingsByDay={monthBookingsByDay}
          daysInMonth={daysInMonth}
          firstDayOffset={firstDayOffset}
          monthRevenue={monthRevenue}
          todayStr={todayStr}
          goToDay={goToDay}
          t={t}
        />
      )}
    </div>
  )
}
