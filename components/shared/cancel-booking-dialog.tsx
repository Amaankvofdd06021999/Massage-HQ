"use client"

import { useState } from "react"
import { Calendar, Clock, User, AlertTriangle, CheckCircle2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { useBookings } from "@/lib/data/bookings-store"
import { useLanguage } from "@/lib/i18n/language-context"
import { formatPrice, cancellationPolicy } from "@/lib/data/mock-data"
import { cn } from "@/lib/utils"
import type { Booking } from "@/lib/types"

interface CancelBookingDialogProps {
  booking: Booking | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CancelBookingDialog({
  booking,
  open,
  onOpenChange,
}: CancelBookingDialogProps) {
  const { t } = useLanguage()
  const { cancelBooking } = useBookings()
  const [reason, setReason] = useState("")
  const [result, setResult] = useState<{
    refund: number
    fee: number
  } | null>(null)

  if (!booking) return null

  const now = new Date()
  const bookingStart = new Date(`${booking.date}T${booking.startTime}:00`)
  const hoursUntil = (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60)
  const isLate = hoursUntil < cancellationPolicy.freeWindowHours
  const fee = isLate
    ? Math.round(booking.price * cancellationPolicy.lateCancelFeePercent / 100)
    : 0
  const refund = booking.price - fee

  function handleConfirm() {
    if (!booking) return
    const record = cancelBooking(booking.id, reason || undefined)
    if (record) {
      setResult({ refund: record.refundAmount, fee: record.fee })
    }
  }

  function handleClose(value: boolean) {
    if (!value) {
      setReason("")
      setResult(null)
    }
    onOpenChange(value)
  }

  // Success state
  if (result) {
    return (
      <AlertDialog open={open} onOpenChange={handleClose}>
        <AlertDialogContent className="border-brand-border bg-brand-bg-secondary">
          <AlertDialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-brand-green/15">
              <CheckCircle2 size={24} className="text-brand-green" />
            </div>
            <AlertDialogTitle className="text-center text-brand-text-primary">
              {t("bookingCancelled")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-brand-text-secondary">
              {t("cancelledSuccessfully")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="rounded-xl border border-brand-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-brand-text-secondary">{t("refundAmount")}</span>
              <span className="text-lg font-bold text-brand-green">{formatPrice(result.refund)}</span>
            </div>
            {result.fee > 0 && (
              <div className="mt-2 flex items-center justify-between border-t border-brand-border pt-2">
                <span className="text-sm text-brand-text-secondary">{t("cancellationFee")}</span>
                <span className="text-sm font-medium text-brand-coral">{formatPrice(result.fee)}</span>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => handleClose(false)}
              className="w-full border-brand-border bg-brand-primary text-primary-foreground hover:bg-brand-primary/90"
            >
              {t("confirm")}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="border-brand-border bg-brand-bg-secondary">
        <AlertDialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-brand-coral/15">
            <AlertTriangle size={24} className="text-brand-coral" />
          </div>
          <AlertDialogTitle className="text-center text-brand-text-primary">
            {t("cancelBooking")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-brand-text-secondary">
            {t("cancelBookingConfirm")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Booking details */}
        <div className="rounded-xl border border-brand-border bg-card p-4">
          <p className="font-semibold text-brand-text-primary">{booking.serviceName}</p>
          <div className="mt-2 flex flex-col gap-1.5 text-sm text-brand-text-secondary">
            <span className="flex items-center gap-2">
              <Calendar size={14} className="text-brand-text-tertiary" />
              {booking.date}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={14} className="text-brand-text-tertiary" />
              {booking.startTime} - {booking.endTime}
            </span>
            <span className="flex items-center gap-2">
              <User size={14} className="text-brand-text-tertiary" />
              {booking.staffName}
            </span>
          </div>
        </div>

        {/* Cancellation policy info */}
        <div
          className={cn(
            "rounded-xl border p-4",
            isLate
              ? "border-brand-coral/30 bg-brand-coral/5"
              : "border-brand-green/30 bg-brand-green/5"
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">
            {t("cancellationPolicy")}
          </p>
          <p className="mt-1 text-sm text-brand-text-secondary">
            {t("freeIfCancelBefore")} {cancellationPolicy.freeWindowHours} {t("hoursBeforeStart")}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-brand-text-secondary">
              {isLate ? t("lateCancellationFee") : t("freeCancellation")}
            </span>
            <span
              className={cn(
                "text-lg font-bold",
                isLate ? "text-brand-coral" : "text-brand-green"
              )}
            >
              {isLate ? formatPrice(fee) : formatPrice(0)}
            </span>
          </div>
          {isLate && (
            <div className="mt-2 flex items-center justify-between border-t border-brand-border pt-2">
              <span className="text-sm text-brand-text-secondary">{t("refundAmount")}</span>
              <span className="font-semibold text-brand-text-primary">{formatPrice(refund)}</span>
            </div>
          )}
        </div>

        {/* Reason */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-brand-text-secondary">
            {t("cancellationReason")} <span className="text-brand-text-tertiary">({t("optional")})</span>
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("cancellationReasonPlaceholder")}
            className="border-brand-border bg-card text-brand-text-primary placeholder:text-brand-text-tertiary"
            rows={3}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="border-brand-border bg-card text-brand-text-primary hover:bg-brand-bg-tertiary">
            {t("back")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-brand-coral text-white hover:bg-brand-coral/90"
          >
            {t("cancelBooking")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
