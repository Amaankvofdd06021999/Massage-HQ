"use client"

import { useState, useMemo } from "react"
import {
  Calendar, ChevronLeft, ChevronRight, Clock, DollarSign,
  CalendarDays, Sparkles, ArrowUpRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/auth-context"
import { useBookings } from "@/lib/data/bookings-store"
import { useTips } from "@/lib/data/tips-store"
import { useLanguage } from "@/lib/i18n/language-context"
import { formatPrice, formatMassageType, staffMembers } from "@/lib/data/mock-data"
import { StatusBadge, bookingStatusVariant } from "@/components/shared/status-badge"

function formatDateDisplay(date: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)

  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Tomorrow"
  if (diffDays === -1) return "Yesterday"

  return date.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })
}

function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export default function StaffSchedulePage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { getBookingsForStaff, bookings } = useBookings()
  const { submitTipClaim, getClaimsForStaff } = useTips()
  const [selectedDate, setSelectedDate] = useState(new Date())

  const staffMember = staffMembers.find((s) => s.id === user?.id)
  const allBookings = useMemo(() => (user ? getBookingsForStaff(user.id) : []), [user, getBookingsForStaff])

  const dateStr = toDateString(selectedDate)
  const dayBookings = useMemo(
    () =>
      allBookings
        .filter((b) => b.date === dateStr)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [allBookings, dateStr]
  )

  const todayStr = toDateString(new Date())
  const todayBookings = useMemo(
    () => allBookings.filter((b) => b.date === todayStr && b.status !== "cancelled" && b.status !== "no-show"),
    [allBookings, todayStr]
  )

  const nextBooking = useMemo(() => {
    const now = new Date()
    const nowStr = toDateString(now)
    const nowTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
    return allBookings
      .filter(
        (b) =>
          (b.status === "confirmed" || b.status === "in-progress") &&
          (b.date > nowStr || (b.date === nowStr && b.startTime >= nowTime))
      )
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date)
        return a.startTime.localeCompare(b.startTime)
      })[0]
  }, [allBookings])

  const todayEarnings = useMemo(
    () =>
      todayBookings
        .filter((b) => b.status === "completed" || b.status === "in-progress" || b.status === "confirmed")
        .reduce((sum, b) => sum + b.price, 0),
    [todayBookings]
  )

  // Tips data
  const staffBookings = useMemo(() => user ? bookings.filter(b => b.staffId === user.id) : [], [bookings, user])
  const allTips = useMemo(() => staffBookings.filter(b => b.tip && b.tip > 0), [staffBookings])
  const totalTips = useMemo(() => allTips.reduce((sum, b) => sum + (b.tip ?? 0), 0), [allTips])
  const thisMonthTips = useMemo(
    () =>
      allTips
        .filter(b => new Date(b.createdAt).getMonth() === new Date().getMonth())
        .reduce((sum, b) => sum + (b.tip ?? 0), 0),
    [allTips]
  )
  const claims = useMemo(() => user ? getClaimsForStaff(user.id) : [], [user, getClaimsForStaff])
  const pendingClaimAmount = useMemo(
    () => claims.filter(c => c.status === "pending").reduce((sum, c) => sum + c.amount, 0),
    [claims]
  )
  const claimedAmount = useMemo(
    () => claims.filter(c => c.status === "approved").reduce((sum, c) => sum + c.amount, 0),
    [claims]
  )
  const heldAmount = totalTips - claimedAmount - pendingClaimAmount

  function navigateDay(offset: number) {
    setSelectedDate((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + offset)
      return d
    })
  }

  function goToToday() {
    setSelectedDate(new Date())
  }

  return (
    <div className="px-5 pb-8 pt-12">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/15">
          <Calendar size={20} className="text-brand-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-brand-text-primary">My Schedule</h1>
          {staffMember && (
            <p className="text-sm text-brand-text-secondary">
              Welcome back, {staffMember.nickname}
            </p>
          )}
        </div>
      </div>

      {/* Date Navigation */}
      <div className="mt-5 flex items-center justify-between rounded-2xl border border-brand-border bg-card p-3">
        <button
          type="button"
          onClick={() => navigateDay(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-brand-text-secondary transition-colors hover:bg-brand-bg-tertiary hover:text-brand-text-primary"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={goToToday}
          className="flex flex-col items-center"
        >
          <span className="text-sm font-semibold text-brand-text-primary">
            {formatDateDisplay(selectedDate)}
          </span>
          <span className="text-xs text-brand-text-tertiary">
            {selectedDate.toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}
          </span>
        </button>
        <button
          type="button"
          onClick={() => navigateDay(1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-brand-text-secondary transition-colors hover:bg-brand-bg-tertiary hover:text-brand-text-primary"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Stats Row */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-brand-border bg-card p-3 text-center">
          <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/15">
            <CalendarDays size={16} className="text-brand-primary" />
          </div>
          <p className="text-lg font-bold text-brand-primary">{todayBookings.length}</p>
          <p className="text-[10px] text-brand-text-tertiary">Today&apos;s Bookings</p>
        </div>
        <div className="rounded-xl border border-brand-border bg-card p-3 text-center">
          <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green/15">
            <Clock size={16} className="text-brand-green" />
          </div>
          <p className="text-lg font-bold text-brand-green">
            {nextBooking ? nextBooking.startTime : "--:--"}
          </p>
          <p className="text-[10px] text-brand-text-tertiary">Next Booking</p>
        </div>
        <div className="rounded-xl border border-brand-border bg-card p-3 text-center">
          <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-yellow/15">
            <DollarSign size={16} className="text-brand-yellow" />
          </div>
          <p className="text-lg font-bold text-brand-yellow">{formatPrice(todayEarnings)}</p>
          <p className="text-[10px] text-brand-text-tertiary">Today&apos;s Earnings</p>
        </div>
      </div>

      {/* Daily Timeline */}
      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-brand-text-secondary">
          {formatDateDisplay(selectedDate)}&apos;s Schedule
        </h2>

        {dayBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-border bg-card/50 py-12">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-bg-tertiary">
              <CalendarDays size={24} className="text-brand-text-tertiary" />
            </div>
            <p className="text-sm font-medium text-brand-text-secondary">No bookings for this day</p>
            <p className="mt-1 text-xs text-brand-text-tertiary">Enjoy your time off!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayBookings.map((booking) => (
              <div
                key={booking.id}
                className={cn(
                  "rounded-2xl border bg-card p-4 transition-all",
                  booking.status === "in-progress"
                    ? "border-brand-green/40 bg-brand-green/5 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                    : "border-brand-border"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center rounded-xl bg-brand-bg-tertiary px-3 py-2">
                      <span className="text-xs font-bold text-brand-primary">{booking.startTime}</span>
                      <span className="text-[9px] text-brand-text-tertiary">{booking.endTime}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-brand-text-primary">{booking.customerName}</p>
                      <p className="text-sm text-brand-text-secondary">{booking.serviceName}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-medium text-brand-primary">
                          <Sparkles size={10} className="mr-1" />
                          {formatMassageType(booking.serviceType)}
                        </span>
                        <span className="text-xs text-brand-text-tertiary">
                          {booking.duration} min
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {booking.status === "in-progress" ? (
                      <span className="flex items-center gap-1 rounded-full bg-brand-green/15 px-2.5 py-0.5 text-[10px] font-semibold text-brand-green">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-green" />
                        In Progress
                      </span>
                    ) : (
                      <StatusBadge variant={bookingStatusVariant(booking.status)} dot>
                        {booking.status}
                      </StatusBadge>
                    )}
                    <span className="text-sm font-semibold text-brand-text-primary">
                      {formatPrice(booking.price)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-brand-text-primary">
            <DollarSign size={20} className="text-brand-green" />
            {t("tips")}
          </h2>
          {heldAmount > 0 && (
            <button
              type="button"
              onClick={() => user && submitTipClaim(user.id, user.name, heldAmount)}
              className="flex items-center gap-1 rounded-xl bg-brand-green/15 px-3 py-1.5 text-xs font-semibold text-brand-green"
            >
              <ArrowUpRight size={14} />
              {t("requestPayout")}
            </button>
          )}
        </div>

        {/* Tip stats */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-brand-border bg-card p-3 text-center">
            <p className="text-lg font-bold text-brand-text-primary">{formatPrice(totalTips)}</p>
            <p className="text-[10px] text-brand-text-tertiary">{t("totalTipsCollected")}</p>
          </div>
          <div className="rounded-xl border border-brand-border bg-card p-3 text-center">
            <p className="text-lg font-bold text-brand-text-primary">{formatPrice(thisMonthTips)}</p>
            <p className="text-[10px] text-brand-text-tertiary">{t("tipsThisMonth")}</p>
          </div>
          <div className="rounded-xl border border-brand-border bg-card p-3 text-center">
            <p className="text-lg font-bold text-brand-yellow">{formatPrice(heldAmount)}</p>
            <p className="text-[10px] text-brand-text-tertiary">{t("tipsPendingClaim")}</p>
          </div>
          <div className="rounded-xl border border-brand-border bg-card p-3 text-center">
            <p className="text-lg font-bold text-brand-green">{formatPrice(claimedAmount)}</p>
            <p className="text-[10px] text-brand-text-tertiary">{t("tipsClaimed")}</p>
          </div>
        </div>

        {/* Tip Claims */}
        {claims.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-brand-text-secondary">{t("myTipClaims")}</h3>
            <div className="mt-2 space-y-2">
              {claims.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl border border-brand-border bg-card px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-brand-text-primary">{formatPrice(c.amount)}</p>
                    <p className="text-xs text-brand-text-tertiary">{new Date(c.requestedAt).toLocaleDateString()}</p>
                  </div>
                  <span className={cn(
                    "rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                    c.status === "approved" && "bg-brand-green/15 text-brand-green",
                    c.status === "rejected" && "bg-brand-coral/15 text-brand-coral",
                    c.status === "pending" && "bg-brand-yellow/15 text-brand-yellow"
                  )}>
                    {c.status === "approved" ? t("tipClaimApproved") : c.status === "rejected" ? t("tipClaimRejected") : t("tipClaimPending")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent tips */}
        {allTips.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-brand-text-secondary">{t("tipHistory")}</h3>
            <div className="mt-2 space-y-2">
              {allTips.slice(0, 10).map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-xl border border-brand-border bg-card px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-brand-text-primary">{b.customerName}</p>
                    <p className="text-xs text-brand-text-tertiary">{b.date} - {b.serviceName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brand-green">+{formatPrice(b.tip ?? 0)}</p>
                    <p className="text-[10px] text-brand-text-tertiary">
                      {b.tipStatus === "claimed" ? t("tipsClaimed") : b.tipStatus === "paid" ? t("tipPaid") : t("tipHeld")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
