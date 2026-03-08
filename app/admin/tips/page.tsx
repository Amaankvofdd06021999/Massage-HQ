"use client"

import { useState } from "react"
import { DollarSign, Check, X, Clock, User } from "lucide-react"
import { useTips } from "@/lib/data/tips-store"
import { useBookings } from "@/lib/data/bookings-store"
import { useAuth } from "@/lib/auth/auth-context"
import { useLanguage } from "@/lib/i18n/language-context"
import { formatPrice, staffMembers } from "@/lib/data/mock-data"
import { cn } from "@/lib/utils"

export default function AdminTipClaimsPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const { tipClaims, resolveTipClaim, getPendingClaims } = useTips()
  const { bookings } = useBookings()
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")

  const pendingClaims = getPendingClaims()
  const filteredClaims = filter === "all" ? tipClaims : tipClaims.filter((c) => c.status === filter)

  // Calculate total tips per staff
  const staffTipSummary = staffMembers.map((staff) => {
    const staffBookings = bookings.filter((b) => b.staffId === staff.id && b.tip && b.tip > 0)
    const totalTips = staffBookings.reduce((sum, b) => sum + (b.tip ?? 0), 0)
    const staffClaims = tipClaims.filter((c) => c.staffId === staff.id)
    const approvedAmount = staffClaims.filter((c) => c.status === "approved").reduce((sum, c) => sum + c.amount, 0)
    const pendingAmount = staffClaims.filter((c) => c.status === "pending").reduce((sum, c) => sum + c.amount, 0)
    return {
      staff,
      totalTips,
      approvedAmount,
      pendingAmount,
      heldAmount: totalTips - approvedAmount - pendingAmount,
    }
  }).filter((s) => s.totalTips > 0)

  const handleApprove = (claimId: string) => {
    resolveTipClaim(claimId, "approved", user?.name ?? "Manager")
  }

  const handleReject = (claimId: string) => {
    resolveTipClaim(claimId, "rejected", user?.name ?? "Manager")
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign size={20} className="text-brand-green" />
          <h1 className="text-2xl font-bold text-brand-text-primary">{t("tipClaims")}</h1>
        </div>
        {pendingClaims.length > 0 && (
          <span className="rounded-full bg-brand-yellow/15 px-3 py-1 text-xs font-semibold text-brand-yellow">
            {pendingClaims.length} {t("tipClaimPending").toLowerCase()}
          </span>
        )}
      </div>

      {/* Staff tip summary */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {staffTipSummary.map(({ staff, totalTips, approvedAmount, pendingAmount, heldAmount }) => (
          <div key={staff.id} className="rounded-2xl border border-brand-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/15 text-brand-primary font-bold">
                {staff.nickname.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-brand-text-primary">{staff.nickname}</p>
                <p className="text-xs text-brand-text-tertiary">{staff.name}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-sm font-bold text-brand-text-primary">{formatPrice(totalTips)}</p>
                <p className="text-[10px] text-brand-text-tertiary">{t("total")}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-brand-yellow">{formatPrice(heldAmount)}</p>
                <p className="text-[10px] text-brand-text-tertiary">{t("tipHeld")}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-brand-green">{formatPrice(approvedAmount)}</p>
                <p className="text-[10px] text-brand-text-tertiary">{t("tipPaid")}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="mt-6 flex gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              filter === f
                ? "bg-brand-primary text-brand-primary-foreground"
                : "bg-brand-bg-secondary text-brand-text-secondary hover:text-brand-text-primary"
            )}
          >
            {f === "all" ? t("all") : t(f === "pending" ? "tipClaimPending" : f === "approved" ? "tipClaimApproved" : "tipClaimRejected")}
          </button>
        ))}
      </div>

      {/* Claims list */}
      <div className="mt-4 space-y-3">
        {filteredClaims.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-border bg-brand-bg-secondary p-8 text-center">
            <DollarSign size={32} className="mx-auto text-brand-text-tertiary" />
            <p className="mt-3 text-sm text-brand-text-secondary">{t("noTipClaims")}</p>
          </div>
        ) : (
          filteredClaims.map((claim) => (
            <div key={claim.id} className="rounded-2xl border border-brand-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green/15">
                    <User size={18} className="text-brand-green" />
                  </div>
                  <div>
                    <p className="font-semibold text-brand-text-primary">{claim.staffName}</p>
                    <p className="text-xs text-brand-text-tertiary">
                      {new Date(claim.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-brand-green">{formatPrice(claim.amount)}</p>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    claim.status === "pending" && "bg-brand-yellow/15 text-brand-yellow",
                    claim.status === "approved" && "bg-brand-green/15 text-brand-green",
                    claim.status === "rejected" && "bg-brand-coral/15 text-brand-coral"
                  )}>
                    {t(claim.status === "pending" ? "tipClaimPending" : claim.status === "approved" ? "tipClaimApproved" : "tipClaimRejected")}
                  </span>
                </div>
              </div>

              {claim.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleApprove(claim.id)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-brand-green/15 py-2 text-sm font-semibold text-brand-green"
                  >
                    <Check size={16} />
                    {t("approveClaim")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(claim.id)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-brand-coral/15 py-2 text-sm font-semibold text-brand-coral"
                  >
                    <X size={16} />
                    {t("rejectClaim")}
                  </button>
                </div>
              )}

              {claim.resolvedAt && (
                <p className="mt-2 text-xs text-brand-text-tertiary">
                  Resolved {new Date(claim.resolvedAt).toLocaleDateString()} by {claim.resolvedBy}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
