"use client"

import { useState, useMemo } from "react"
import { SearchBar } from "@/components/shared/search-bar"
import { PillButton, PillButtonRow } from "@/components/shared/pill-button"
import { StatusBadge, bookingStatusVariant } from "@/components/shared/status-badge"
import { StaffAvatar } from "@/components/shared/staff-avatar"
import { BookingDetailSheet } from "@/components/admin/booking-detail-sheet"
import { SendReminderDialog } from "@/components/admin/send-reminder-dialog"
import { useBookings } from "@/lib/data/bookings-store"
import { formatPrice } from "@/lib/data/mock-data"
import { useLanguage } from "@/lib/i18n/language-context"
import type { Booking, BookingStatus } from "@/lib/types"
import { Bell, XCircle, Eye, MoreHorizontal, CheckCircle2, Ban } from "lucide-react"

export default function AdminBookingsPage() {
  const { t } = useLanguage()
  const { bookings, cancelBooking, approveBooking, rejectBooking } = useBookings()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [reminderBooking, setReminderBooking] = useState<Booking | null>(null)
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  const statusFilters: { value: BookingStatus | "all"; label: string }[] = [
    { value: "all", label: t("filterAll") },
    { value: "pending", label: t("filterPending") },
    { value: "confirmed", label: t("filterConfirmed") },
    { value: "in-progress", label: t("filterInProgress") },
    { value: "completed", label: t("filterCompleted") },
    { value: "cancelled", label: t("filterCancelled") },
    { value: "rejected", label: t("filterRejected") },
    { value: "no-show", label: t("filterNoShow") },
  ]

  const filtered = useMemo(() => {
    let result = bookings
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (b) =>
          b.customerName.toLowerCase().includes(q) ||
          b.staffName.toLowerCase().includes(q) ||
          b.serviceName.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter)
    }
    return result.sort((a, b) => {
      // in-progress first, then pending, then by date descending
      if (a.status === "in-progress" && b.status !== "in-progress") return -1
      if (b.status === "in-progress" && a.status !== "in-progress") return 1
      if (a.status === "pending" && b.status !== "pending") return -1
      if (b.status === "pending" && a.status !== "pending") return 1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [bookings, search, statusFilter])

  const totalRevenue = filtered.reduce((sum, b) => sum + (b.status !== "cancelled" ? b.price : 0), 0)

  function handleCancel(booking: Booking) {
    cancelBooking(booking.id, "Cancelled by admin")
    setActionMenuId(null)
  }

  function handleApprove(booking: Booking) {
    approveBooking(booking.id, "manager")
    setActionMenuId(null)
  }

  function handleReject(booking: Booking) {
    rejectBooking(booking.id, "Rejected by manager")
    setActionMenuId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-text-primary">{t("bookingsTitle")}</h1>
          <p className="mt-1 text-sm text-brand-text-secondary">
            {filtered.length} {t("navBookings")} - {formatPrice(totalRevenue)} {t("bookingsTotal")}
          </p>
        </div>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={t("searchByCustomer")}
        className="mt-4"
      />

      <PillButtonRow className="mt-3">
        {statusFilters.map((f) => (
          <PillButton key={f.value} active={statusFilter === f.value} onClick={() => setStatusFilter(f.value)}>
            {f.label}
          </PillButton>
        ))}
      </PillButtonRow>

      {/* Table */}
      <div className="mt-5 overflow-x-auto rounded-2xl border border-brand-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-card">
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-text-tertiary">{t("colCustomer")}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-text-tertiary">{t("colTherapist")}</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold text-brand-text-tertiary md:table-cell">{t("colService")}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-text-tertiary">{t("colDateTime")}</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold text-brand-text-tertiary sm:table-cell">{t("colPrice")}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-text-tertiary">{t("colStatus")}</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-brand-text-tertiary">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-b border-brand-border last:border-b-0 hover:bg-brand-bg-tertiary/30">
                <td className="px-4 py-3 font-medium text-brand-text-primary">{b.customerName}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <StaffAvatar src={b.staffAvatar} name={b.staffName} size="sm" />
                    <span className="text-brand-text-secondary">{b.staffName}</span>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-brand-text-secondary md:table-cell">{b.serviceName}</td>
                <td className="px-4 py-3 text-brand-text-secondary">
                  <span className="block">{b.date}</span>
                  <span className="text-xs text-brand-text-tertiary">{b.startTime}-{b.endTime}</span>
                </td>
                <td className="hidden px-4 py-3 font-medium text-brand-text-primary sm:table-cell">{formatPrice(b.price)}</td>
                <td className="px-4 py-3">
                  <StatusBadge variant={bookingStatusVariant(b.status)} dot>{b.status}</StatusBadge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="relative inline-block">
                    <button
                      type="button"
                      onClick={() => setActionMenuId(actionMenuId === b.id ? null : b.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border text-brand-text-tertiary hover:bg-brand-bg-tertiary transition-colors"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                    {actionMenuId === b.id && (
                      <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-brand-border bg-card py-1 shadow-lg">
                        <button
                          type="button"
                          onClick={() => { setSelectedBooking(b); setActionMenuId(null) }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-xs text-brand-text-secondary hover:bg-brand-bg-tertiary transition-colors"
                        >
                          <Eye size={13} />
                          {t("viewDetails")}
                        </button>
                        {b.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(b)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-brand-green hover:bg-brand-green/5 transition-colors"
                            >
                              <CheckCircle2 size={13} />
                              {t("approveBooking")}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(b)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-brand-coral hover:bg-brand-coral/5 transition-colors"
                            >
                              <Ban size={13} />
                              {t("rejectBooking")}
                            </button>
                          </>
                        )}
                        {b.status === "confirmed" && (
                          <>
                            <button
                              type="button"
                              onClick={() => { setReminderBooking(b); setActionMenuId(null) }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-brand-text-secondary hover:bg-brand-bg-tertiary transition-colors"
                            >
                              <Bell size={13} />
                              {t("sendReminder")}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancel(b)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-brand-coral hover:bg-brand-coral/5 transition-colors"
                            >
                              <XCircle size={13} />
                              {t("cancelBooking")}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-brand-text-tertiary">{t("noBookingsFound")}</div>
        )}
      </div>

      {/* Booking Detail Sheet */}
      {selectedBooking && (
        <BookingDetailSheet
          booking={selectedBooking}
          open={!!selectedBooking}
          onOpenChange={(open) => !open && setSelectedBooking(null)}
        />
      )}

      {/* Send Reminder Dialog */}
      {reminderBooking && (
        <SendReminderDialog
          booking={reminderBooking}
          open={!!reminderBooking}
          onOpenChange={(open) => !open && setReminderBooking(null)}
        />
      )}
    </div>
  )
}
