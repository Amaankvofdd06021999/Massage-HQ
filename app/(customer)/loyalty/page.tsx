"use client"

import { useState } from "react"
import {
  Trophy, Star, Coins, History, CheckCircle2, Sparkles,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { LoyaltyStampCard } from "@/components/shared/loyalty-stamp-card"
import { LoyaltyPointsDisplay } from "@/components/shared/loyalty-points-display"
import { PillButton, PillButtonRow } from "@/components/shared/pill-button"
import { useLoyalty } from "@/lib/data/loyalty-store"
import { useAuth } from "@/lib/auth/auth-context"
import { useLanguage } from "@/lib/i18n/language-context"
import { customers, formatPrice, formatMassageType } from "@/lib/data/mock-data"
import { cn } from "@/lib/utils"
import type { MassageType } from "@/lib/types"

type HistoryTab = "stamps" | "points" | "redemptions"

export default function LoyaltyPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const {
    config,
    stamps,
    redemptions,
    pointRedemptions,
    getStampCount,
    getStampsForCustomer,
    canRedeemStamps,
    redeemFreeSession,
    getPointsBalance,
    redeemPoints,
    getPointRedemptionsForCustomer,
  } = useLoyalty()

  const [historyTab, setHistoryTab] = useState<HistoryTab>("stamps")
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<MassageType>(config.freeSessionServices[0])
  const [redeemSuccess, setRedeemSuccess] = useState(false)

  const customerId = user?.id ?? "c1"
  const customerData = customers.find((c) => c.id === customerId) ?? customers[0]
  const totalSpent = customerData.totalSpent

  const stampCount = getStampCount(customerId)
  const stampsNeeded = config.stampsForFreeSession
  const customerStamps = getStampsForCustomer(customerId)
  const canRedeem = canRedeemStamps(customerId)

  const pointsBalance = getPointsBalance(customerId, totalSpent)
  const customerPointRedemptions = getPointRedemptionsForCustomer(customerId)

  // Filter stamps for this customer
  const customerRedemptions = redemptions.filter((r) => r.customerId === customerId)

  function handleStampRedeem() {
    setRedeemDialogOpen(true)
    setRedeemSuccess(false)
  }

  function handleConfirmRedeem() {
    const result = redeemFreeSession(customerId, selectedService)
    if (result) {
      setRedeemSuccess(true)
    }
  }

  function handlePointsRedeem(points: number) {
    const discount = points * config.pointRedemptionRate
    redeemPoints(customerId, points, discount)
  }

  function handleRedeemDialogClose(value: boolean) {
    if (!value) {
      setRedeemSuccess(false)
    }
    setRedeemDialogOpen(value)
  }

  // Build history data
  const stampHistory = customerStamps
    .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())

  const allRedemptions = [
    ...customerRedemptions.map((r) => ({
      id: r.id,
      type: "stamp" as const,
      date: r.redeemedAt,
      label: `Free ${formatMassageType(r.serviceType)} session`,
      detail: `${r.stampsUsed} stamps used`,
      value: t("freeSession"),
    })),
    ...customerPointRedemptions.map((r) => ({
      id: r.id,
      type: "points" as const,
      date: r.redeemedAt,
      label: `Points redemption`,
      detail: `${r.pointsUsed} points used`,
      value: formatPrice(r.discountAmount),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="px-5 pb-8 pt-12">
      {/* Page header */}
      <div className="flex items-center gap-2">
        <Trophy size={20} className="text-brand-yellow" />
        <h1 className="text-2xl font-bold text-brand-text-primary">{t("loyaltyProgram")}</h1>
      </div>
      <p className="mt-1 text-sm text-brand-text-secondary">
        {t("earnStampPerVisit")} &bull; {t("earnPointsDesc")}
      </p>

      {/* Section 1: Stamp Card */}
      <div className="mt-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">
          {t("loyaltyStamps")}
        </h2>
        <LoyaltyStampCard
          stampCount={stampCount}
          stampsNeeded={stampsNeeded}
          onRedeem={canRedeem ? handleStampRedeem : undefined}
        />
      </div>

      {/* Section 2: Points Balance */}
      <div className="mt-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">
          {t("loyaltyPointsLabel")}
        </h2>
        <LoyaltyPointsDisplay
          pointsBalance={pointsBalance}
          pointRedemptionRate={config.pointRedemptionRate}
          onRedeem={handlePointsRedeem}
        />
      </div>

      <Separator className="my-6 bg-brand-border" />

      {/* Section 3: History */}
      <div>
        <div className="flex items-center gap-2">
          <History size={16} className="text-brand-text-tertiary" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">
            History
          </h2>
        </div>

        <PillButtonRow className="mt-3">
          <PillButton
            active={historyTab === "stamps"}
            onClick={() => setHistoryTab("stamps")}
          >
            {t("stampHistory")}
          </PillButton>
          <PillButton
            active={historyTab === "points"}
            onClick={() => setHistoryTab("points")}
          >
            {t("pointsHistory")}
          </PillButton>
          <PillButton
            active={historyTab === "redemptions"}
            onClick={() => setHistoryTab("redemptions")}
          >
            {t("redemptionHistory")}
          </PillButton>
        </PillButtonRow>

        {/* Stamp History */}
        {historyTab === "stamps" && (
          <div className="mt-3 flex flex-col gap-2 page-transition">
            {stampHistory.length > 0 ? (
              stampHistory.map((stamp) => (
                <div
                  key={stamp.id}
                  className="flex items-center gap-3 rounded-xl border border-brand-border bg-card p-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10">
                    <Star size={14} className="fill-brand-primary text-brand-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-brand-text-primary">
                      {formatMassageType(stamp.serviceType)}
                    </p>
                    <p className="text-xs text-brand-text-tertiary">
                      Booking #{stamp.bookingId}
                    </p>
                  </div>
                  <span className="text-xs text-brand-text-tertiary">
                    {new Date(stamp.earnedAt).toLocaleDateString("en", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <Star size={28} className="mx-auto text-brand-text-tertiary/30" />
                <p className="mt-2 text-sm text-brand-text-tertiary">{t("noStampsYet")}</p>
              </div>
            )}
          </div>
        )}

        {/* Points History */}
        {historyTab === "points" && (
          <div className="mt-3 flex flex-col gap-2 page-transition">
            {stampHistory.length > 0 ? (
              stampHistory.map((stamp) => {
                // Each completed booking earns points based on spend.
                // We approximate points per stamp entry for display.
                return (
                  <div
                    key={stamp.id}
                    className="flex items-center gap-3 rounded-xl border border-brand-border bg-card p-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-yellow/10">
                      <Coins size={14} className="text-brand-yellow" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-brand-text-primary">
                        {formatMassageType(stamp.serviceType)} session
                      </p>
                      <p className="text-xs text-brand-text-tertiary">
                        Booking #{stamp.bookingId}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-brand-yellow">
                        +{t("pointsLabel2")}
                      </span>
                      <p className="text-[10px] text-brand-text-tertiary">
                        {new Date(stamp.earnedAt).toLocaleDateString("en", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-12 text-center">
                <Coins size={28} className="mx-auto text-brand-text-tertiary/30" />
                <p className="mt-2 text-sm text-brand-text-tertiary">
                  No points earned yet. Book a session to start earning!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Redemption History */}
        {historyTab === "redemptions" && (
          <div className="mt-3 flex flex-col gap-2 page-transition">
            {allRedemptions.length > 0 ? (
              allRedemptions.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 rounded-xl border border-brand-border bg-card p-3"
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      entry.type === "stamp" ? "bg-brand-green/10" : "bg-brand-blue/10"
                    )}
                  >
                    {entry.type === "stamp" ? (
                      <Sparkles size={14} className="text-brand-green" />
                    ) : (
                      <Coins size={14} className="text-brand-blue" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-brand-text-primary">{entry.label}</p>
                    <p className="text-xs text-brand-text-tertiary">{entry.detail}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        entry.type === "stamp" ? "text-brand-green" : "text-brand-blue"
                      )}
                    >
                      {entry.value}
                    </span>
                    <p className="text-[10px] text-brand-text-tertiary">
                      {new Date(entry.date).toLocaleDateString("en", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <History size={28} className="mx-auto text-brand-text-tertiary/30" />
                <p className="mt-2 text-sm text-brand-text-tertiary">
                  No redemptions yet
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Redeem stamp dialog */}
      <Dialog open={redeemDialogOpen} onOpenChange={handleRedeemDialogClose}>
        <DialogContent className="border-brand-border bg-brand-bg-secondary">
          {redeemSuccess ? (
            <>
              <DialogHeader>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-brand-green/15">
                  <CheckCircle2 size={24} className="text-brand-green" />
                </div>
                <DialogTitle className="text-center text-brand-text-primary">
                  {t("freeSession")}
                </DialogTitle>
                <DialogDescription className="text-center text-brand-text-secondary">
                  Your free {formatMassageType(selectedService)} session has been redeemed!
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  onClick={() => handleRedeemDialogClose(false)}
                  className="w-full bg-brand-primary text-primary-foreground hover:bg-brand-primary/90"
                >
                  {t("confirm")}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-brand-yellow/15">
                  <Sparkles size={24} className="text-brand-yellow" />
                </div>
                <DialogTitle className="text-center text-brand-text-primary">
                  {t("redeemFreeSession")}
                </DialogTitle>
                <DialogDescription className="text-center text-brand-text-secondary">
                  Choose a massage type for your free session (up to {config.freeSessionMaxDuration} {t("min")})
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-2">
                {config.freeSessionServices.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedService(type)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all",
                      selectedService === type
                        ? "border-brand-primary bg-brand-primary/10"
                        : "border-brand-border bg-card hover:border-brand-primary/50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        selectedService === type
                          ? "bg-brand-primary/20"
                          : "bg-brand-bg-tertiary"
                      )}
                    >
                      <Star
                        size={14}
                        className={
                          selectedService === type
                            ? "fill-brand-primary text-brand-primary"
                            : "text-brand-text-tertiary"
                        }
                      />
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        selectedService === type
                          ? "text-brand-primary"
                          : "text-brand-text-primary"
                      )}
                    >
                      {formatMassageType(type)}
                    </span>
                    {selectedService === type && (
                      <CheckCircle2 size={16} className="ml-auto text-brand-primary" />
                    )}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-brand-yellow/20 bg-brand-yellow/5 px-4 py-3 text-center">
                <p className="text-xs text-brand-text-tertiary">
                  {stampsNeeded} {t("stampsLabel")} will be redeemed
                </p>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => handleRedeemDialogClose(false)}
                  className="border-brand-border bg-card text-brand-text-primary hover:bg-brand-bg-tertiary"
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={handleConfirmRedeem}
                  className="bg-brand-yellow font-semibold text-black hover:bg-brand-yellow/90"
                >
                  {t("redeemFreeSession")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
