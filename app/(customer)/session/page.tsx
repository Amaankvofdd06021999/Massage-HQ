"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Clock, CheckCircle, Star, Sparkles, ChevronRight, AlertTriangle } from "lucide-react"
import { StaffAvatar } from "@/components/shared/staff-avatar"
import { RatingStars } from "@/components/shared/rating-stars"
import { LateArrivalDialog } from "@/components/shared/late-arrival-dialog"
import { TranslationChat } from "@/components/shared/translation-chat"
import { bookings, staffMembers, formatPrice } from "@/lib/data/mock-data"
import { useLanguage } from "@/lib/i18n/language-context"
import { useAuth } from "@/lib/auth/auth-context"
import { cn } from "@/lib/utils"

// Find the in-progress booking (simulated as b4)
const activeBooking = bookings.find((b) => b.status === "in-progress")
const activeStaff = activeBooking
  ? staffMembers.find((s) => s.id === activeBooking.staffId)
  : null

// ─── Review + Tip Modal ───────────────────────────────────────────────────────
function ReviewModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (rating: number, review: string, tip: number) => void
}) {
  const { t } = useLanguage()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [review, setReview] = useState("")
  const [tip, setTip] = useState<number | null>(null)
  const [customTip, setCustomTip] = useState("")
  const [showCustom, setShowCustom] = useState(false)

  const TIP_PRESETS = [50, 100, 200, 500]

  const handleSubmit = () => {
    const finalTip = showCustom
      ? Number(customTip) || 0
      : tip ?? 0
    onSubmit(rating, review, finalTip)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-t-3xl bg-background p-6 pb-10 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/10">
            <Star size={24} className="text-brand-primary" />
          </div>
          <h2 className="text-xl font-bold text-brand-text-primary">{t("reviewYourSession")}</h2>
          <p className="mt-1 text-sm text-brand-text-secondary">{t("howWasYourMassage")}</p>
        </div>

        {/* Star Rating */}
        <div className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">
            {t("rateYourTherapist")}
          </p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="transition-transform active:scale-90"
              >
                <Star
                  size={36}
                  className={cn(
                    "transition-colors",
                    (hovered || rating) >= star
                      ? "fill-brand-yellow text-brand-yellow"
                      : "text-brand-border"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Feedback */}
        <div className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">
            {t("leaveFeedback")}
          </p>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder={t("feedbackPlaceholder")}
            rows={3}
            className="w-full resize-none rounded-xl border border-brand-border bg-brand-bg-tertiary/30 px-4 py-3 text-sm text-brand-text-primary placeholder:text-brand-text-tertiary focus:border-brand-primary focus:outline-none"
          />
        </div>

        {/* Tip */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">
              {t("addTip")}
            </p>
            <span className="text-[10px] text-brand-text-tertiary">{t("tipOptional")}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setTip(0); setShowCustom(false) }}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                tip === 0 && !showCustom
                  ? "border-brand-primary bg-brand-primary text-primary-foreground"
                  : "border-brand-border text-brand-text-secondary hover:border-brand-primary"
              )}
            >
              {t("noTip")}
            </button>
            {TIP_PRESETS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => { setTip(amount); setShowCustom(false) }}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  tip === amount && !showCustom
                    ? "border-brand-primary bg-brand-primary text-primary-foreground"
                    : "border-brand-border text-brand-text-secondary hover:border-brand-primary"
                )}
              >
                {formatPrice(amount)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setShowCustom(true); setTip(null) }}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                showCustom
                  ? "border-brand-primary bg-brand-primary text-primary-foreground"
                  : "border-brand-border text-brand-text-secondary hover:border-brand-primary"
              )}
            >
              {t("customTip")}
            </button>
          </div>
          {showCustom && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm font-medium text-brand-text-secondary">฿</span>
              <input
                type="number"
                value={customTip}
                onChange={(e) => setCustomTip(e.target.value)}
                placeholder={t("enterCustomTip")}
                min={0}
                className="flex-1 rounded-xl border border-brand-border bg-brand-bg-tertiary/30 px-4 py-2 text-sm text-brand-text-primary placeholder:text-brand-text-tertiary focus:border-brand-primary focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-brand-border py-3 text-sm font-semibold text-brand-text-secondary transition-colors hover:bg-brand-bg-tertiary"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={rating === 0}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all active:scale-95 disabled:opacity-40"
          >
            {t("submitReview")}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Submitted Screen ─────────────────────────────────────────────────────────
function SubmittedScreen({
  rating,
  tip,
  onDone,
}: {
  rating: number
  tip: number
  onDone: () => void
}) {
  const { t } = useLanguage()
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-green/15">
        <CheckCircle size={40} className="text-brand-green" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-brand-text-primary">{t("reviewSubmitted")}</h1>
      <p className="mt-2 text-sm text-brand-text-secondary">{t("reviewSubmittedDesc")}</p>
      <RatingStars rating={rating} size={28} className="mt-4" />
      {tip > 0 && (
        <div className="mt-4 rounded-2xl border border-brand-border bg-card px-6 py-3">
          <p className="text-xs text-brand-text-tertiary">{t("tip")}</p>
          <p className="text-2xl font-bold text-brand-primary">{formatPrice(tip)}</p>
          <p className="text-xs text-brand-text-secondary">{t("thankYouForTip")}</p>
        </div>
      )}
      <button
        type="button"
        onClick={onDone}
        className="mt-8 w-full max-w-xs rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
      >
        {t("backToHome")}
      </button>
    </div>
  )
}

// ─── Timer Hook ───────────────────────────────────────────────────────────────
function useElapsedMinutes(startTime: string, durationMinutes: number) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    // Parse start time and compute elapsed from "now" (simulated)
    const [h, m] = startTime.split(":").map(Number)
    const start = new Date()
    start.setHours(h, m, 0, 0)
    const tick = () => {
      const now = new Date()
      const diff = Math.floor((now.getTime() - start.getTime()) / 60000)
      // For demo: clamp between 0 and duration, with offset so session looks active
      setElapsed(Math.min(Math.max(diff + 45, 0), durationMinutes))
    }
    tick()
    const id = setInterval(tick, 60000)
    return () => clearInterval(id)
  }, [startTime, durationMinutes])

  return elapsed
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SessionPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()
  const [showReview, setShowReview] = useState(false)
  const [lateOpen, setLateOpen] = useState(false)
  const [submitted, setSubmitted] = useState<{ rating: number; tip: number } | null>(null)

  const elapsed = useElapsedMinutes(
    activeBooking?.startTime ?? "10:00",
    activeBooking?.duration ?? 90
  )

  const handleSubmit = useCallback((rating: number, _review: string, tip: number) => {
    setShowReview(false)
    setSubmitted({ rating, tip })
  }, [])

  if (submitted) {
    return <SubmittedScreen rating={submitted.rating} tip={submitted.tip} onDone={() => router.replace("/")} />
  }

  if (!activeBooking || !activeStaff) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
        <Sparkles size={40} className="text-brand-text-tertiary" />
        <p className="mt-4 text-sm text-brand-text-secondary">{t("noUpcomingBookings")}</p>
        <button
          type="button"
          onClick={() => router.replace("/")}
          className="mt-6 rounded-xl border border-brand-border px-6 py-3 text-sm font-semibold text-brand-text-primary"
        >
          {t("backToHome")}
        </button>
      </div>
    )
  }

  const remaining = Math.max(activeBooking.duration - elapsed, 0)
  const progress = Math.min(elapsed / activeBooking.duration, 1)
  const isEndingSoon = remaining <= 15 && remaining > 0

  return (
    <>
      <div className="min-h-dvh bg-background px-5 pb-10 pt-12">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-green/10 px-4 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-green" />
            <span className="text-xs font-semibold text-brand-green">{t("sessionInProgress")}</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-brand-text-primary">{t("liveSession")}</h1>
          <p className="mt-1 text-sm text-brand-text-secondary">{t("enjoyYourSession")}</p>
        </div>

        {/* Therapist Card */}
        <div className="mb-5 rounded-3xl border border-brand-border bg-card p-5 text-center">
          <StaffAvatar src={activeStaff.avatar} name={activeStaff.name} size="xl" available />
          <p className="mt-3 text-xl font-bold text-brand-text-primary">{activeStaff.nickname}</p>
          <p className="text-sm text-brand-text-secondary">{activeBooking.serviceName}</p>
          <div className="mt-2 flex justify-center">
            <RatingStars rating={activeStaff.rating} size={14} />
          </div>
        </div>

        {/* Progress Ring + Timer */}
        <div className="mb-5 rounded-3xl border border-brand-border bg-card p-5">
          {/* Progress bar */}
          <div className="mb-4 overflow-hidden rounded-full bg-brand-border" style={{ height: 8 }}>
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                isEndingSoon ? "bg-brand-coral" : "bg-brand-primary"
              )}
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-brand-bg-tertiary/50 p-4 text-center">
              <Clock size={18} className="mx-auto mb-1 text-brand-text-tertiary" />
              <p className="text-xs text-brand-text-tertiary">{t("timeElapsed")}</p>
              <p className="mt-1 text-2xl font-bold text-brand-text-primary">{elapsed}<span className="text-sm font-normal text-brand-text-tertiary"> {t("min")}</span></p>
            </div>
            <div className={cn(
              "rounded-2xl p-4 text-center",
              isEndingSoon ? "bg-brand-coral/10" : "bg-brand-primary/5"
            )}>
              <Clock size={18} className={cn("mx-auto mb-1", isEndingSoon ? "text-brand-coral" : "text-brand-primary")} />
              <p className="text-xs text-brand-text-tertiary">{t("timeRemaining")}</p>
              <p className={cn("mt-1 text-2xl font-bold", isEndingSoon ? "text-brand-coral" : "text-brand-primary")}>
                {remaining}<span className="text-sm font-normal text-brand-text-tertiary"> {t("min")}</span>
              </p>
            </div>
          </div>
          {isEndingSoon && (
            <p className="mt-3 text-center text-xs font-semibold text-brand-coral">{t("sessionEndingSoon")}</p>
          )}
        </div>

        {/* Translation Chat */}
        <div className="mt-4 px-5">
          <TranslationChat
            bookingId={activeBooking.id}
            userRole="customer"
            userId={user?.id ?? ""}
            userName={user?.name ?? "Customer"}
          />
        </div>

        {/* Session Details */}
        <div className="mb-5 rounded-3xl border border-brand-border bg-card p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">{t("sessionDetails")}</p>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-text-secondary">{t("serviceLabel")}</span>
              <span className="font-medium text-brand-text-primary">{activeBooking.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-text-secondary">{t("durationLabel")}</span>
              <span className="font-medium text-brand-text-primary">{activeBooking.duration} {t("min")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-text-secondary">{t("timeLabel")}</span>
              <span className="font-medium text-brand-text-primary">{activeBooking.startTime} – {activeBooking.endTime}</span>
            </div>
            <div className="flex justify-between border-t border-brand-border pt-2.5">
              <span className="text-brand-text-secondary">{t("total")}</span>
              <span className="font-bold text-brand-primary">{formatPrice(activeBooking.price)}</span>
            </div>
          </div>
        </div>

        {/* Late Arrival Report */}
        <button
          type="button"
          onClick={() => setLateOpen(true)}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-yellow/30 bg-brand-yellow/5 px-6 py-3.5 text-sm font-medium text-brand-yellow transition-colors hover:bg-brand-yellow/10"
        >
          <AlertTriangle size={16} />
          {t("therapistLate")}
        </button>

        {/* CTA */}
        <button
          type="button"
          onClick={() => setShowReview(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
        >
          <CheckCircle size={18} />
          {t("markComplete")}
          <ChevronRight size={16} />
        </button>
      </div>

      {showReview && (
        <ReviewModal onClose={() => setShowReview(false)} onSubmit={handleSubmit} />
      )}

      {activeBooking && (
        <LateArrivalDialog
          booking={activeBooking}
          open={lateOpen}
          onOpenChange={setLateOpen}
        />
      )}
    </>
  )
}
