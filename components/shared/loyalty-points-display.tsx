"use client"

import { useState } from "react"
import { Coins, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/lib/i18n/language-context"
import { formatPrice } from "@/lib/data/mock-data"
import { cn } from "@/lib/utils"

interface LoyaltyPointsDisplayProps {
  pointsBalance: number
  pointRedemptionRate: number
  onRedeem?: (points: number) => void
}

const PRESET_POINTS = [50, 100, 200]

export function LoyaltyPointsDisplay({
  pointsBalance,
  pointRedemptionRate,
  onRedeem,
}: LoyaltyPointsDisplayProps) {
  const { t } = useLanguage()
  const [selectedPoints, setSelectedPoints] = useState(0)
  const [customPoints, setCustomPoints] = useState("")
  const [isCustom, setIsCustom] = useState(false)

  const effectivePoints = isCustom ? Number(customPoints) || 0 : selectedPoints
  const discountValue = effectivePoints * pointRedemptionRate
  const canRedeem = effectivePoints > 0 && effectivePoints <= pointsBalance

  const equivalentValue = pointsBalance * pointRedemptionRate

  function handleRedeem() {
    if (canRedeem && onRedeem) {
      onRedeem(effectivePoints)
      setSelectedPoints(0)
      setCustomPoints("")
      setIsCustom(false)
    }
  }

  return (
    <div className="rounded-2xl border border-brand-border bg-card p-5">
      {/* Balance header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-yellow/15">
          <Coins size={20} className="text-brand-yellow" />
        </div>
        <div>
          <p className="text-xs text-brand-text-tertiary">{t("pointsBalance")}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-brand-text-primary">{pointsBalance}</span>
            <span className="text-xs text-brand-text-tertiary">{t("pointsLabel2")}</span>
          </div>
        </div>
      </div>

      {/* Equivalent value */}
      <div className="mt-3 rounded-xl bg-brand-yellow/5 border border-brand-yellow/20 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-brand-text-secondary">{t("pointsWorth")}</span>
          <span className="font-semibold text-brand-yellow">{formatPrice(equivalentValue)}</span>
        </div>
        <p className="mt-0.5 text-[10px] text-brand-text-tertiary">
          1 {t("pointsLabel2")} = {formatPrice(pointRedemptionRate)}
        </p>
      </div>

      {/* Point selection */}
      {onRedeem && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-brand-text-secondary">{t("redeemPoints")}</p>

          <div className="flex gap-2">
            {PRESET_POINTS.map((pts) => (
              <button
                key={pts}
                type="button"
                disabled={pts > pointsBalance}
                onClick={() => {
                  setSelectedPoints(pts)
                  setIsCustom(false)
                }}
                className={cn(
                  "flex-1 rounded-xl border px-2 py-2.5 text-center text-sm font-semibold transition-all",
                  !isCustom && selectedPoints === pts
                    ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                    : "border-brand-border bg-card text-brand-text-secondary hover:border-brand-primary/50",
                  pts > pointsBalance && "cursor-not-allowed opacity-40"
                )}
              >
                {pts}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsCustom(true)}
              className={cn(
                "flex-1 rounded-xl border px-2 py-2.5 text-center text-sm font-medium transition-all",
                isCustom
                  ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                  : "border-brand-border bg-card text-brand-text-secondary hover:border-brand-primary/50"
              )}
            >
              Custom
            </button>
          </div>

          {isCustom && (
            <Input
              type="number"
              min={1}
              max={pointsBalance}
              value={customPoints}
              onChange={(e) => setCustomPoints(e.target.value)}
              placeholder={`Max ${pointsBalance}`}
              className="mt-2 border-brand-border bg-card text-brand-text-primary placeholder:text-brand-text-tertiary"
            />
          )}

          {/* Discount preview */}
          {effectivePoints > 0 && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm">
              <span className="font-medium text-brand-text-secondary">{effectivePoints} pts</span>
              <ArrowRight size={14} className="text-brand-text-tertiary" />
              <span className="font-bold text-brand-green">{formatPrice(discountValue)} {t("off")}</span>
            </div>
          )}

          {/* Redeem button */}
          <Button
            onClick={handleRedeem}
            disabled={!canRedeem}
            className="mt-3 w-full bg-brand-primary text-primary-foreground hover:bg-brand-primary/90 disabled:opacity-50"
          >
            {t("redeemPoints")} {canRedeem && `(${formatPrice(discountValue)})`}
          </Button>
        </div>
      )}
    </div>
  )
}
