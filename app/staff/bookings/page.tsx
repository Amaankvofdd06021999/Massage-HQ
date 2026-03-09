"use client"

import { useState, useMemo } from "react"
import { ClipboardList, CheckCircle2, Ban } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/auth-context"
import { useBookings } from "@/lib/data/bookings-store"
import { useLanguage } from "@/lib/i18n/language-context"
import { BookingCard } from "@/components/shared/booking-card"

function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

type TabKey = "today" | "pending" | "upcoming" | "past"

export default function StaffBookingsPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { getBookingsForStaff, updateBooking, approveBooking, rejectBooking } = useBookings()
  const [activeTab, setActiveTab] = useState<TabKey>("today")

  const allBookings = useMemo(() => (user ? getBookingsForStaff(user.id) : []), [user, getBookingsForStaff])
  const todayStr = toDateString(new Date())

  const todayBookings = useMemo(
    () =>
      allBookings
        .filter((b) => b.date === todayStr)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [allBookings, todayStr]
  )

  const pendingBookings = useMemo(
    () =>
      allBookings
        .filter((b) => b.status === "pending")
        .sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date)
          return a.startTime.localeCompare(b.startTime)
        }),
    [allBookings]
  )

  const upcomingBookings = useMemo(
    () =>
      allBookings
        .filter(
          (b) =>
            (b.status === "confirmed" || b.status === "in-progress") &&
            b.date > todayStr
        )
        .sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date)
          return a.startTime.localeCompare(b.startTime)
        }),
    [allBookings, todayStr]
  )

  const pastBookings = useMemo(
    () =>
      allBookings
        .filter(
          (b) => b.status === "completed" || b.status === "cancelled" || b.status === "no-show" || b.status === "rejected"
        )
        .sort((a, b) => b.date.localeCompare(a.date)),
    [allBookings]
  )

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "today", label: "Today", count: todayBookings.length },
    { key: "pending", label: "Pending", count: pendingBookings.length },
    { key: "upcoming", label: "Upcoming", count: upcomingBookings.length },
    { key: "past", label: "Past", count: pastBookings.length },
  ]

  const currentBookings =
    activeTab === "today"
      ? todayBookings
      : activeTab === "pending"
      ? pendingBookings
      : activeTab === "upcoming"
      ? upcomingBookings
      : pastBookings

  function handleMarkComplete(bookingId: string) {
    updateBooking(bookingId, { status: "completed" })
  }

  return (
    <div className="px-5 pb-24 pt-12">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/15">
          <ClipboardList size={20} className="text-brand-primary" />
        </div>
        <h1 className="text-xl font-bold text-brand-text-primary">My Bookings</h1>
      </div>

      {/* Tabs */}
      <div className="mt-5 flex gap-1 rounded-2xl border border-brand-border bg-card p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-brand-primary text-primary-foreground"
                : "text-brand-text-secondary hover:text-brand-text-primary"
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={cn(
                  "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                  activeTab === tab.key
                    ? "bg-white/20 text-primary-foreground"
                    : "bg-brand-bg-tertiary text-brand-text-tertiary"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="mt-4 space-y-3">
        {currentBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-border bg-card/50 py-12">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-bg-tertiary">
              <ClipboardList size={24} className="text-brand-text-tertiary" />
            </div>
            <p className="text-sm font-medium text-brand-text-secondary">
              {activeTab === "today" && "No bookings for today"}
              {activeTab === "pending" && "No pending requests"}
              {activeTab === "upcoming" && "No upcoming bookings"}
              {activeTab === "past" && "No past bookings"}
            </p>
            <p className="mt-1 text-xs text-brand-text-tertiary">
              {activeTab === "today" && "Your schedule is clear today"}
              {activeTab === "pending" && "All booking requests have been handled"}
              {activeTab === "upcoming" && "New bookings will appear here"}
              {activeTab === "past" && "Completed bookings will show here"}
            </p>
          </div>
        ) : (
          currentBookings.map((booking) => (
            <div key={booking.id}>
              <BookingCard booking={booking} />
              {booking.status === "in-progress" && (
                <button
                  type="button"
                  onClick={() => handleMarkComplete(booking.id)}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green/15 py-2.5 text-sm font-semibold text-brand-green transition-colors hover:bg-brand-green/25"
                >
                  <CheckCircle2 size={16} />
                  Mark Complete
                </button>
              )}
              {booking.status === "pending" && (
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => approveBooking(booking.id, user?.name)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-green/15 py-2.5 text-sm font-semibold text-brand-green transition-colors hover:bg-brand-green/25"
                  >
                    <CheckCircle2 size={16} />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => rejectBooking(booking.id, "Rejected by staff")}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-coral/15 py-2.5 text-sm font-semibold text-brand-coral transition-colors hover:bg-brand-coral/25"
                  >
                    <Ban size={16} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
