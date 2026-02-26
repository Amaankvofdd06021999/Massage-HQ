"use client"

import { useState } from "react"
import { Clock, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useBookings } from "@/lib/data/bookings-store"
import { useLanguage } from "@/lib/i18n/language-context"
import { formatPrice } from "@/lib/data/mock-data"
import { cn } from "@/lib/utils"
import type { Booking, CompensationType } from "@/lib/types"

interface LateArrivalDialogProps {
  booking: Booking | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LateArrivalDialog({
  booking,
  open,
  onOpenChange,
}: LateArrivalDialogProps) {
  const { t } = useLanguage()
  const { submitLateArrivalClaim } = useBookings()
  const [minutesLate, setMinutesLate] = useState(15)
  const [compensationType, setCompensationType] = useState<CompensationType>("discount")
  const [note, setNote] = useState("")
  const [submitted, setSubmitted] = useState(false)

  if (!booking) return null

  const compensationAmount = Math.round(
    (minutesLate * booking.price) / booking.duration
  )

  const compensationOptions: { value: CompensationType; label: string }[] = [
    { value: "discount", label: t("compensationDiscount") },
    { value: "credit", label: t("compensationCredit") },
    { value: "free-extension", label: t("compensationExtension") },
  ]

  function handleSubmit() {
    if (!booking) return
    submitLateArrivalClaim({
      bookingId: booking.id,
      customerId: booking.customerId,
      staffId: booking.staffId,
      minutesLate,
      compensationType,
      compensationAmount,
      customerNote: note || undefined,
    })
    setSubmitted(true)
  }

  function handleClose(value: boolean) {
    if (!value) {
      setMinutesLate(15)
      setCompensationType("discount")
      setNote("")
      setSubmitted(false)
    }
    onOpenChange(value)
  }

  // Success state
  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="border-brand-border bg-brand-bg-secondary">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-brand-green/15">
              <CheckCircle2 size={24} className="text-brand-green" />
            </div>
            <DialogTitle className="text-center text-brand-text-primary">
              {t("claimSubmitted")}
            </DialogTitle>
            <DialogDescription className="text-center text-brand-text-secondary">
              {t("claimPending")}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-brand-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-brand-text-secondary">{t("minutesLate")}</span>
              <span className="font-semibold text-brand-text-primary">{minutesLate} {t("min")}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-brand-border pt-2">
              <span className="text-sm text-brand-text-secondary">{t("compensationType")}</span>
              <span className="font-semibold text-brand-text-primary">
                {compensationOptions.find((o) => o.value === compensationType)?.label}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-brand-border pt-2">
              <span className="text-sm text-brand-text-secondary">{t("compensationAmount")}</span>
              <span className="text-lg font-bold text-brand-green">{formatPrice(compensationAmount)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => handleClose(false)}
              className="w-full bg-brand-primary text-primary-foreground hover:bg-brand-primary/90"
            >
              {t("confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="border-brand-border bg-brand-bg-secondary">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-brand-yellow/15">
            <Clock size={24} className="text-brand-yellow" />
          </div>
          <DialogTitle className="text-center text-brand-text-primary">
            {t("reportLateArrival")}
          </DialogTitle>
          <DialogDescription className="text-center text-brand-text-secondary">
            {t("therapistLate")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Minutes late */}
          <div>
            <Label className="mb-1.5 text-sm font-medium text-brand-text-secondary">
              {t("minutesLate")}
            </Label>
            <Input
              type="number"
              min={5}
              max={60}
              value={minutesLate}
              onChange={(e) => setMinutesLate(Math.min(60, Math.max(5, Number(e.target.value))))}
              className="border-brand-border bg-card text-brand-text-primary"
            />
            <p className="mt-1 text-xs text-brand-text-tertiary">5 - 60 {t("minutes")}</p>
          </div>

          {/* Compensation type */}
          <div>
            <Label className="mb-1.5 text-sm font-medium text-brand-text-secondary">
              {t("compensationType")}
            </Label>
            <Select
              value={compensationType}
              onValueChange={(val) => setCompensationType(val as CompensationType)}
            >
              <SelectTrigger className="w-full border-brand-border bg-card text-brand-text-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-brand-border bg-brand-bg-secondary">
                {compensationOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Compensation amount */}
          <div
            className={cn(
              "rounded-xl border border-brand-green/30 bg-brand-green/5 p-4"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-brand-text-secondary">{t("compensationAmount")}</span>
              <span className="text-xl font-bold text-brand-green">
                {formatPrice(compensationAmount)}
              </span>
            </div>
            <p className="mt-1 text-xs text-brand-text-tertiary">
              {minutesLate} {t("min")} x {formatPrice(Math.round(booking.price / booking.duration))}/{t("min")}
            </p>
          </div>

          {/* Note */}
          <div>
            <Label className="mb-1.5 text-sm font-medium text-brand-text-secondary">
              {t("yourNote")} <span className="text-brand-text-tertiary">({t("optional")})</span>
            </Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("yourNote")}
              className="border-brand-border bg-card text-brand-text-primary placeholder:text-brand-text-tertiary"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            className="border-brand-border bg-card text-brand-text-primary hover:bg-brand-bg-tertiary"
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-brand-primary text-primary-foreground hover:bg-brand-primary/90"
          >
            {t("submitClaim")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
