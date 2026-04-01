"use client"

import { Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"

interface LoyaltyStampCardProps {
  stampCount: number
  stampsNeeded: number
  onRedeem?: () => void
}

export function LoyaltyStampCard({
  stampCount,
  stampsNeeded,
  onRedeem,
}: LoyaltyStampCardProps) {
  const { t } = useLanguage()
  const isFull = stampCount >= stampsNeeded
  const displayCount = Math.min(stampCount, stampsNeeded)

  // Arrange stamps in 2 rows of 5
  const rows = 2
  const cols = Math.ceil(stampsNeeded / rows)

  return (
    <div className="rounded-2xl border border-brand-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-brand-text-primary">{t("stampCard")}</h3>
          <p className="mt-0.5 text-xs text-brand-text-tertiary">{t("earnStampPerVisit")}</p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            isFull
              ? "bg-brand-yellow/20 text-brand-yellow"
              : "bg-brand-primary/15 text-brand-primary"
          )}
        >
          {displayCount} / {stampsNeeded}
        </span>
      </div>

      {/* Stamp grid */}
      <div className="mt-4 flex flex-col gap-2">
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className="flex gap-2">
            {Array.from({ length: cols }, (_, col) => {
              const index = row * cols + col
              if (index >= stampsNeeded) return null
              const isFilled = index < displayCount

              return (
                <div
                  key={index}
                  className={cn(
                    "flex flex-1 items-center justify-center rounded-xl py-3 transition-all",
                    isFilled
                      ? "bg-brand-primary/15 shadow-sm"
                      : "border border-dashed border-brand-border bg-transparent"
                  )}
                >
                  {isFilled ? (
                    <Star
                      size={20}
                      className="fill-brand-primary text-brand-primary"
                    />
                  ) : (
                    <Star
                      size={20}
                      className="text-brand-text-tertiary/40"
                    />
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Progress text */}
      <div className="mt-3 text-center">
        {isFull ? (
          <p className="text-sm font-semibold text-brand-yellow">
            {t("freeSession")}
          </p>
        ) : (
          <p className="text-xs text-brand-text-tertiary">
            {stampsNeeded - displayCount} {t("stampsNeeded")}
          </p>
        )}
      </div>

      {/* Redeem button */}
      {isFull && onRedeem && (
        <Button
          onClick={onRedeem}
          className={cn(
            "mt-4 w-full bg-brand-yellow text-primary-foreground font-semibold hover:bg-brand-yellow/90",
            "shadow-[0_0_20px_rgba(var(--brand-accent-yellow-rgb,234,179,8),0.3)]",
            "animate-pulse"
          )}
          size="lg"
        >
          <Sparkles size={18} />
          {t("redeemFreeSession")}
        </Button>
      )}
    </div>
  )
}
