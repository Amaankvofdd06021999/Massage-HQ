"use client"

import { useState } from "react"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { StatusBadge, bookingStatusVariant } from "@/components/shared/status-badge"
import { StaffAvatar } from "@/components/shared/staff-avatar"
import { useBookings } from "@/lib/data/bookings-store"
import { customers } from "@/lib/data/mock-data"
import { formatPrice, formatMassageType } from "@/lib/utils/formatters"
import { cn } from "@/lib/utils"
import {
  Bell, XCircle, StickyNote, Clock, DollarSign, Calendar,
  User, Sparkles, Timer, AlertTriangle, CreditCard, Undo2, CheckCircle2, Ban,
} from "lucide-react"
import type { Booking } from "@/lib/types"

export function BookingDetailSheet({
  booking,
  open,
  onOpenChange,
  onSendReminder,
  onViewNotes,
}: {
  booking: Booking | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSendReminder?: (booking: Booking) => void
  onViewNotes?: (customerId: string, customerName: string) => void
}) {
  const { cancellations, lateArrivalClaims, cancelBooking, approveBooking, rejectBooking } = useBookings()
  const [cancelConfirm, setCancelConfirm] = useState(false)

  if (!booking) return null

  const cancellation = cancellations.find((c) => c.bookingId === booking.id)
  const claim = lateArrivalClaims.find((c) => c.bookingId === booking.id)
  const customer = customers.find((c) => c.id === booking.customerId)

  function handleCancel() {
    if (!booking) return
    if (!cancelConfirm) {
      setCancelConfirm(true)
      return
    }
    cancelBooking(booking.id, "Cancelled by manager")
    setCancelConfirm(false)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); setCancelConfirm(false) }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto border-brand-border bg-brand-bg-secondary"
      >
        <SheetHeader className="border-b border-brand-border pb-4">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-lg text-brand-text-primary">
              Booking Details
            </SheetTitle>
            <StatusBadge variant={bookingStatusVariant(booking.status)} dot>
              {booking.status}
            </StatusBadge>
          </div>
          <p className="text-xs text-brand-text-tertiary">ID: {booking.id}</p>
        </SheetHeader>

        <div className="space-y-5 p-4">
          {/* Customer */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase text-brand-text-tertiary">
              <User size={13} /> Customer
            </h3>
            <div className="rounded-xl border border-brand-border bg-card p-3">
              <p className="font-semibold text-brand-text-primary">{booking.customerName}</p>
              {customer && (
                <div className="mt-1 flex gap-3 text-xs text-brand-text-secondary">
                  <span>{customer.email}</span>
                  <span>{customer.phone}</span>
                </div>
              )}
            </div>
          </section>

          {/* Therapist */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase text-brand-text-tertiary">
              <Sparkles size={13} /> Therapist
            </h3>
            <div className="flex items-center gap-3 rounded-xl border border-brand-border bg-card p-3">
              <StaffAvatar src={booking.staffAvatar} name={booking.staffName} size="sm" />
              <span className="font-medium text-brand-text-primary">{booking.staffName}</span>
            </div>
          </section>

          {/* Service details */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase text-brand-text-tertiary">
              <Sparkles size={13} /> Service
            </h3>
            <div className="rounded-xl border border-brand-border bg-card p-3">
              <p className="font-semibold text-brand-text-primary">{booking.serviceName}</p>
              <p className="text-xs text-brand-text-secondary">
                {formatMassageType(booking.serviceType)}
              </p>
            </div>
          </section>

          {/* Date, Time, Duration, Price grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-brand-border bg-card p-3">
              <div className="flex items-center gap-1.5 text-xs text-brand-text-tertiary">
                <Calendar size={12} /> Date
              </div>
              <p className="mt-1 font-medium text-brand-text-primary">{booking.date}</p>
            </div>
            <div className="rounded-xl border border-brand-border bg-card p-3">
              <div className="flex items-center gap-1.5 text-xs text-brand-text-tertiary">
                <Clock size={12} /> Time
              </div>
              <p className="mt-1 font-medium text-brand-text-primary">
                {booking.startTime} - {booking.endTime}
              </p>
            </div>
            <div className="rounded-xl border border-brand-border bg-card p-3">
              <div className="flex items-center gap-1.5 text-xs text-brand-text-tertiary">
                <Timer size={12} /> Duration
              </div>
              <p className="mt-1 font-medium text-brand-text-primary">{booking.duration} min</p>
            </div>
            <div className="rounded-xl border border-brand-border bg-card p-3">
              <div className="flex items-center gap-1.5 text-xs text-brand-text-tertiary">
                <DollarSign size={12} /> Price
              </div>
              <p className="mt-1 font-semibold text-brand-primary">{formatPrice(booking.price)}</p>
            </div>
          </div>

          {/* Cancellation history */}
          {cancellation && (
            <section className="space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase text-brand-text-tertiary">
                <AlertTriangle size={13} /> Cancellation Details
              </h3>
              <div className="rounded-xl border border-brand-coral/30 bg-brand-coral/5 p-3 space-y-2">
                {cancellation.reason && (
                  <div>
                    <p className="text-xs text-brand-text-tertiary">Reason</p>
                    <p className="text-sm text-brand-text-primary">{cancellation.reason}</p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-brand-text-tertiary">Fee</p>
                    <p className="font-medium text-brand-coral">{formatPrice(cancellation.fee)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-text-tertiary">Refund</p>
                    <p className="font-medium text-brand-green">{formatPrice(cancellation.refundAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-text-tertiary">Staff Comp</p>
                    <p className="font-medium text-brand-text-primary">{formatPrice(cancellation.staffCompensation)}</p>
                  </div>
                </div>
                <p className="text-xs text-brand-text-tertiary">
                  {cancellation.isLateCancellation ? "Late cancellation" : "Free cancellation"} &middot;{" "}
                  {new Date(cancellation.cancelledAt).toLocaleString()}
                </p>
              </div>
            </section>
          )}

          {/* Late arrival claim */}
          {claim && (
            <section className="space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase text-brand-text-tertiary">
                <Clock size={13} /> Late Arrival Claim
              </h3>
              <div className="rounded-xl border border-brand-yellow/30 bg-brand-yellow/5 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-brand-text-primary">
                    {claim.minutesLate} min late
                  </span>
                  <StatusBadge
                    variant={
                      claim.status === "approved" ? "success"
                        : claim.status === "rejected" ? "promo"
                        : "warning"
                    }
                    dot
                  >
                    {claim.status}
                  </StatusBadge>
                </div>
                <p className="text-xs text-brand-text-secondary">
                  Compensation: {formatPrice(claim.compensationAmount)} ({claim.compensationType})
                </p>
                {claim.customerNote && (
                  <p className="text-xs text-brand-text-tertiary italic">
                    &ldquo;{claim.customerNote}&rdquo;
                  </p>
                )}
                {claim.managerNote && (
                  <p className="text-xs text-brand-text-tertiary">
                    Manager: {claim.managerNote}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Rejection details */}
          {booking.status === "rejected" && booking.rejectionReason && (
            <section className="space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase text-brand-text-tertiary">
                <Ban size={13} /> Rejection Details
              </h3>
              <div className="rounded-xl border border-brand-coral/30 bg-brand-coral/5 p-3">
                <p className="text-sm text-brand-text-primary">{booking.rejectionReason}</p>
                {booking.approvedAt && (
                  <p className="mt-1 text-xs text-brand-text-tertiary">
                    Rejected at {new Date(booking.approvedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Actions */}
          <section className="space-y-2 border-t border-brand-border pt-4">
            <h3 className="text-xs font-semibold uppercase text-brand-text-tertiary">Actions</h3>
            <div className="flex flex-col gap-2">
              {booking.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start gap-2 border-brand-green/30 text-brand-green hover:bg-brand-green/10"
                    onClick={() => { approveBooking(booking.id, "manager"); onOpenChange(false) }}
                  >
                    <CheckCircle2 size={14} />
                    Approve Booking
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start gap-2 border-brand-coral/30 text-brand-coral hover:bg-brand-coral/10"
                    onClick={() => { rejectBooking(booking.id, "Rejected by manager"); onOpenChange(false) }}
                  >
                    <Ban size={14} />
                    Reject Booking
                  </Button>
                </>
              )}

              {booking.status === "confirmed" && onSendReminder && (
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 border-brand-border text-brand-text-primary hover:bg-brand-bg-tertiary"
                  onClick={() => onSendReminder(booking)}
                >
                  <Bell size={14} />
                  Send Reminder
                </Button>
              )}

              {onViewNotes && (
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 border-brand-border text-brand-text-primary hover:bg-brand-bg-tertiary"
                  onClick={() => onViewNotes(booking.customerId, booking.customerName)}
                >
                  <StickyNote size={14} />
                  View Client Notes
                </Button>
              )}

              {(booking.status === "confirmed" || booking.status === "pending") && (
                <Button
                  variant={cancelConfirm ? "destructive" : "outline"}
                  size="sm"
                  className={cn(
                    "justify-start gap-2",
                    !cancelConfirm && "border-brand-border text-destructive hover:bg-destructive/10"
                  )}
                  onClick={handleCancel}
                >
                  {cancelConfirm ? <Undo2 size={14} /> : <XCircle size={14} />}
                  {cancelConfirm ? "Confirm Cancellation" : "Cancel Booking"}
                </Button>
              )}

              {cancelConfirm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-brand-text-secondary"
                  onClick={() => setCancelConfirm(false)}
                >
                  Never mind
                </Button>
              )}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}
