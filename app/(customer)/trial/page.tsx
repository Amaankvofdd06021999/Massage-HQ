"use client"

import { useState } from "react"
import Link from "next/link"
import { Sparkles, Check, ChevronRight } from "lucide-react"
import { StaffAvatar } from "@/components/shared/staff-avatar"
import { RatingStars } from "@/components/shared/rating-stars"
import { StatusBadge } from "@/components/shared/status-badge"
import { activeTrialRotation } from "@/lib/data/mock-data"
import { formatMassageType } from "@/lib/utils/formatters"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"

export default function TrialPage() {
  const { t } = useLanguage()
  const trial = activeTrialRotation
  const [ratingSession, setRatingSession] = useState<string | null>(null)
  const [tempRating, setTempRating] = useState(0)

  const progress = (trial.completedSessions / trial.totalSessions) * 100

  return (
    <div className="px-5 pb-24 pt-12">
      <div className="flex items-center gap-2">
        <Sparkles size={20} className="text-brand-blue" />
        <h1 className="text-2xl font-bold text-brand-text-primary">{t("discoveryTrial")}</h1>
      </div>
      <p className="mt-1 text-sm text-brand-text-secondary">{t("trialSubtitle")}</p>

      {/* Progress Card */}
      <div className="mt-5 rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-text-primary">{t("yourProgress")}</p>
            <p className="text-xs text-brand-text-tertiary">
              {trial.completedSessions} {t("of")} {trial.totalSessions} {t("sessionsCompleted")}
            </p>
          </div>
          <StatusBadge variant="active" dot>{t("active")}</StatusBadge>
        </div>
        <div className="mt-3 flex gap-1.5">
          {Array.from({ length: trial.totalSessions }, (_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 flex-1 rounded-full transition-all duration-600",
                i < trial.completedSessions ? "bg-brand-blue" : "bg-brand-border"
              )}
            />
          ))}
        </div>
        <p className="mt-2 text-right text-xs font-medium text-brand-blue">{Math.round(progress)}%</p>
      </div>

      {/* Sessions */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-brand-text-primary">{t("yourTrialSessions")}</h2>
        <div className="mt-3 flex flex-col gap-3">
          {trial.sessions.map((session, idx) => (
            <div
              key={session.id}
              className={cn(
                "rounded-2xl border p-4 transition-all",
                session.isCompleted
                  ? "border-brand-green/20 bg-brand-green/5"
                  : idx === trial.completedSessions
                  ? "border-brand-blue/20 bg-brand-blue/5"
                  : "border-brand-border bg-card"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <StaffAvatar src={session.staffAvatar} name={session.staffName} size="md" />
                  {session.isCompleted && (
                    <div className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-green">
                      <Check size={12} className="text-background" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-brand-text-primary">{session.staffName}</p>
                    <span className="text-xs text-brand-text-tertiary">{t("sessionLabel")} {idx + 1}</span>
                  </div>
                  <p className="text-xs text-brand-text-secondary">
                    {formatMassageType(session.serviceType)} - {session.date}
                  </p>
                </div>
              </div>

              {/* Rating */}
              {session.isCompleted && session.rating && ratingSession !== session.id && (
                <div className="mt-3 flex items-center gap-2 border-t border-brand-border/50 pt-3">
                  <RatingStars rating={session.rating} size={14} />
                  {session.feedback && (
                    <p className="text-xs text-brand-text-tertiary">{session.feedback}</p>
                  )}
                </div>
              )}

              {/* Rate Button */}
              {session.isCompleted && !session.rating && ratingSession !== session.id && (
                <button
                  type="button"
                  onClick={() => setRatingSession(session.id)}
                  className="mt-3 w-full rounded-lg border border-brand-primary/30 bg-brand-primary/10 py-2 text-xs font-medium text-brand-primary"
                >
                  {t("rateThisSession")}
                </button>
              )}

              {/* Rating Input */}
              {ratingSession === session.id && (
                <div className="mt-3 border-t border-brand-border/50 pt-3">
                  <p className="mb-2 text-xs text-brand-text-secondary">{t("howWasYourSession")}</p>
                  <RatingStars rating={tempRating} interactive onRate={setTempRating} size={24} />
                  <button
                    type="button"
                    onClick={() => setRatingSession(null)}
                    className="mt-2 rounded-lg bg-brand-primary px-4 py-1.5 text-xs font-medium text-primary-foreground"
                  >
                    {t("submit")}
                  </button>
                </div>
              )}

              {/* Upcoming */}
              {!session.isCompleted && idx === trial.completedSessions && (
                <Link
                  href={`/book?staff=${session.staffId}`}
                  className="mt-3 flex items-center justify-center gap-1 rounded-lg bg-brand-blue/15 py-2 text-xs font-medium text-brand-blue"
                >
                  {t("bookThisSession")} <ChevronRight size={14} />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary Hint */}
      {trial.completedSessions === trial.totalSessions && (
        <div className="mt-6 rounded-2xl border border-brand-yellow/20 bg-brand-yellow/5 p-5 text-center">
          <p className="font-semibold text-brand-text-primary">{t("trialComplete")}</p>
          <p className="mt-1 text-sm text-brand-text-secondary">{t("trialCompleteDesc")}</p>
        </div>
      )}
    </div>
  )
}
