"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Calendar, Clock, XCircle, AlertTriangle } from "lucide-react"
import { StatusBadge, bookingStatusVariant } from "./status-badge"
import { StaffAvatar } from "./staff-avatar"
import { RatingStars } from "./rating-stars"
import { CancelBookingDialog } from "./cancel-booking-dialog"
import { LateArrivalDialog } from "./late-arrival-dialog"
import type { Booking } from "@/lib/types"
import { formatPrice } from "@/lib/utils/formatters"
import { useLanguage } from "@/lib/i18n/language-context"
import { useRouter } from "next/navigation"

export function BookingCard({
  booking,
  onClick,
  className,
  showActions = true,
}: {
  booking: Booking
  onClick?: () => void
  className?: string
  showActions?: boolean
}) {
  const { t } = useLanguage()
  const router = useRouter()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [lateOpen, setLateOpen] = useState(false)

  const handleClick = () => {
    if (booking.status === "in-progress") {
      router.push("/session")
    } else {
      onClick?.()
    }
  }

  return (
    <>
      <div
        className={cn(
          "rounded-2xl border bg-card p-4 transition-all w-full",
          booking.status === "in-progress"
            ? "border-brand-green/40 bg-brand-green/5"
            : "border-brand-border",
          className
        )}
      >
        <button
          type="button"
          onClick={handleClick}
          className="flex gap-4 text-left w-full card-press"
        >
          <StaffAvatar src={booking.staffAvatar} name={booking.staffName} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-brand-text-primary">{booking.serviceName}</p>
                <p className="text-sm text-brand-text-secondary">{t("with")} {booking.staffName}</p>
              </div>
              {booking.status === "in-progress" ? (
                <span className="flex items-center gap-1 rounded-full bg-brand-green/15 px-2.5 py-0.5 text-[10px] font-semibold text-brand-green">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-green" />
                  {t("liveSession")}
                </span>
              ) : (
                <StatusBadge variant={bookingStatusVariant(booking.status)} dot>
                  {booking.status}
                </StatusBadge>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-brand-text-tertiary">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {booking.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {booking.startTime} - {booking.endTime}
              </span>
              <span className="font-medium text-brand-text-secondary">{formatPrice(booking.price)}</span>
            </div>
            {booking.rating && (
              <div className="mt-2">
                <RatingStars rating={booking.rating} size={12} />
              </div>
            )}
          </div>
        </button>

        {/* Action buttons */}
        {showActions && (
          <div className="mt-3 flex gap-2 border-t border-brand-border pt-3">
            {(booking.status === "confirmed" || booking.status === "pending") && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setCancelOpen(true) }}
                className="flex items-center gap-1.5 rounded-lg border border-brand-coral/30 bg-brand-coral/5 px-3 py-1.5 text-xs font-medium text-brand-coral transition-colors hover:bg-brand-coral/10"
              >
                <XCircle size={13} />
                {t("cancelBooking")}
              </button>
            )}
            {booking.status === "in-progress" && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLateOpen(true) }}
                className="flex items-center gap-1.5 rounded-lg border border-brand-yellow/30 bg-brand-yellow/5 px-3 py-1.5 text-xs font-medium text-brand-yellow transition-colors hover:bg-brand-yellow/10"
              >
                <AlertTriangle size={13} />
                {t("therapistLate")}
              </button>
            )}
          </div>
        )}
      </div>

      <CancelBookingDialog
        booking={booking}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
      />
      <LateArrivalDialog
        booking={booking}
        open={lateOpen}
        onOpenChange={setLateOpen}
      />
    </>
  )
}
