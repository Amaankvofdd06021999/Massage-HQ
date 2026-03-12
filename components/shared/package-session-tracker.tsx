"use client"

import { CheckCircle2, Circle } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"
import { formatMassageType } from "@/lib/utils/formatters"
import { cn } from "@/lib/utils"
import type { Promotion, PromoSessionUsage } from "@/lib/types"

interface PackageSessionTrackerProps {
  promotion: Promotion
  sessionUsages: PromoSessionUsage[]
}

const massageTypeIcons: Record<string, string> = {
  thai: "🙏",
  swedish: "💆",
  "deep-tissue": "💪",
  aromatherapy: "🌿",
  "hot-stone": "🪨",
  sports: "🏃",
  reflexology: "🦶",
  shiatsu: "☯",
}

export function PackageSessionTracker({
  promotion,
  sessionUsages,
}: PackageSessionTrackerProps) {
  const { t } = useLanguage()

  const totalSessions = promotion.sessions ?? 0
  const usedCount = sessionUsages.length
  const remainingCount = totalSessions - usedCount

  return (
    <div className="rounded-2xl border border-brand-border bg-card p-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-brand-text-primary">{promotion.title}</h3>
          <p className="mt-0.5 text-xs text-brand-text-tertiary">{t("packageProgress")}</p>
        </div>
        <span className="rounded-full bg-brand-green/15 px-2.5 py-0.5 text-xs font-semibold text-brand-green">
          {usedCount} {t("of")} {totalSessions} {t("used")}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-4 flex gap-1.5">
        {Array.from({ length: totalSessions }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 flex-1 rounded-full transition-colors",
              i < usedCount ? "bg-brand-green" : "bg-brand-border"
            )}
          />
        ))}
      </div>

      {/* Session grid */}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {Array.from({ length: totalSessions }, (_, i) => {
          const usage = sessionUsages.find((u) => u.sessionNumber === i + 1)
          const isUsed = !!usage

          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3 transition-all",
                isUsed
                  ? "border-brand-green/20 bg-brand-green/5"
                  : "border-dashed border-brand-border bg-transparent"
              )}
            >
              {isUsed ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-green/15">
                  <CheckCircle2 size={16} className="text-brand-green" />
                </div>
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-dashed border-brand-border">
                  <Circle size={16} className="text-brand-text-tertiary" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-brand-text-secondary">
                  {t("sessionOf")} {i + 1}
                </p>
                {isUsed ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm" role="img" aria-label={usage.serviceType}>
                      {massageTypeIcons[usage.serviceType] ?? "💆"}
                    </span>
                    <span className="truncate text-xs text-brand-text-primary">
                      {formatMassageType(usage.serviceType)}
                    </span>
                    <span className="ml-auto shrink-0 text-[10px] text-brand-text-tertiary">
                      {new Date(usage.usedAt).toLocaleDateString("en", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-brand-text-tertiary">{t("availableSession")}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Remaining info */}
      {remainingCount > 0 && (
        <p className="mt-3 text-center text-xs text-brand-text-tertiary">
          {remainingCount} {t("remaining")}
        </p>
      )}
    </div>
  )
}
