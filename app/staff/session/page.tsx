"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Activity, Clock, Timer, User, CheckCircle2 } from "lucide-react"
import { useBookings } from "@/lib/data/bookings-store"
import { usePromotions } from "@/lib/data/promotions-store"
import { useAuth } from "@/lib/auth/auth-context"
import { useLanguage } from "@/lib/i18n/language-context"
import { formatPrice } from "@/lib/data/mock-data"
import { cn } from "@/lib/utils"
import { TranslationChat } from "@/components/shared/translation-chat"

export default function StaffSessionPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { user } = useAuth()
  const { bookings, updateBooking } = useBookings()
  const { purchasedPromotions, markServiceUsed } = usePromotions()

  const activeBooking = useMemo(
    () => bookings.find((b) => b.staffId === user?.id && b.status === "in-progress"),
    [bookings, user?.id]
  )

  // Timer
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!activeBooking) return
    const startParts = activeBooking.startTime.split(":")
    const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1])
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const initialElapsed = Math.max(0, currentMinutes - startMinutes)
    setElapsed(initialElapsed)

    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 60000)
    return () => clearInterval(interval)
  }, [activeBooking])

  const remaining = activeBooking ? Math.max(0, activeBooking.duration - elapsed) : 0
  const progress = activeBooking ? Math.min(100, (elapsed / activeBooking.duration) * 100) : 0

  const handleComplete = () => {
    if (!activeBooking) return
    updateBooking(activeBooking.id, { status: "completed" })
    // Mark promotion service as used if this booking was covered by a promotion
    if (activeBooking.promotionId) {
      const promo = purchasedPromotions.find((p) => p.id === activeBooking.promotionId)
      if (promo) {
        const serviceIndex = promo.services.findIndex(
          (s) => s.serviceType === activeBooking.serviceType && !s.completed
        )
        if (serviceIndex !== -1) {
          markServiceUsed(promo.id, serviceIndex, activeBooking.id)
        }
      }
    }
    router.push("/staff")
  }

  if (!activeBooking) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-5">
        <Activity size={48} className="text-brand-text-tertiary" />
        <p className="mt-4 text-lg font-semibold text-brand-text-primary">No Active Session</p>
        <p className="mt-1 text-sm text-brand-text-secondary">You don&apos;t have any session in progress</p>
        <button
          type="button"
          onClick={() => router.push("/staff")}
          className="mt-6 rounded-xl bg-brand-primary px-6 py-2.5 text-sm font-semibold text-brand-primary-foreground"
        >
          {t("back")}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="border-b border-brand-border bg-card px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-brand-green" />
          <span className="text-sm font-semibold text-brand-green">{t("sessionInProgress")}</span>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Customer info */}
        <div className="rounded-2xl border border-brand-border bg-card p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/15">
              <User size={24} className="text-brand-primary" />
            </div>
            <div>
              <p className="font-bold text-brand-text-primary">{activeBooking.customerName}</p>
              <p className="text-sm text-brand-text-secondary">{activeBooking.serviceName}</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="rounded-2xl border border-brand-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Timer size={18} className="text-brand-primary" />
              <span className="text-sm font-semibold text-brand-text-primary">{t("timeElapsed")}</span>
            </div>
            <span className="text-2xl font-bold text-brand-text-primary">{elapsed} {t("min")}</span>
          </div>

          {/* Progress bar */}
          <div className="h-3 rounded-full bg-brand-border overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", remaining <= 15 ? "bg-brand-coral" : "bg-brand-green")}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-brand-text-secondary">{t("timeRemaining")}</span>
            <span className={cn("font-semibold", remaining <= 15 ? "text-brand-coral" : "text-brand-text-primary")}>
              {remaining} {t("min")}
            </span>
          </div>
        </div>

        {/* Session Details */}
        <div className="rounded-2xl border border-brand-border bg-card p-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-brand-text-secondary">Service</span>
            <span className="text-brand-text-primary font-medium">{activeBooking.serviceName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-brand-text-secondary">Duration</span>
            <span className="text-brand-text-primary font-medium">{activeBooking.duration} {t("min")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-brand-text-secondary">Time</span>
            <span className="text-brand-text-primary font-medium">{activeBooking.startTime} - {activeBooking.endTime}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-brand-text-secondary">{t("total")}</span>
            <span className="text-brand-primary font-bold">{formatPrice(activeBooking.price)}</span>
          </div>
        </div>

        {/* Translation Chat */}
        <TranslationChat
          bookingId={activeBooking.id}
          userRole="staff"
          userId={user?.id ?? ""}
          userName={user?.name ?? "Therapist"}
        />

        {/* Complete Button */}
        <button
          type="button"
          onClick={handleComplete}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-green py-4 text-base font-bold text-white"
        >
          <CheckCircle2 size={20} />
          {t("markComplete")}
        </button>
      </div>
    </div>
  )
}
