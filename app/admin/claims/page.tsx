"use client"

import { useState, useMemo } from "react"
import { Scale, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react"
import { PillButton, PillButtonRow } from "@/components/shared/pill-button"
import { StatusBadge } from "@/components/shared/status-badge"
import { StaffAvatar } from "@/components/shared/staff-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useBookings } from "@/lib/data/bookings-store"
import { useShopData } from "@/lib/data/shop-data"
import { formatPrice } from "@/lib/utils/formatters"
import { useLanguage } from "@/lib/i18n/language-context"
import type { ClaimStatus } from "@/lib/types"

const statusFilters: { value: ClaimStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

function claimStatusVariant(status: ClaimStatus) {
  switch (status) {
    case "pending": return "warning" as const
    case "approved": return "success" as const
    case "rejected": return "promo" as const
    default: return "neutral" as const
  }
}

export default function AdminClaimsPage() {
  const { t } = useLanguage()
  const { staffMembers, customers } = useShopData()
  const { lateArrivalClaims, resolveLateArrivalClaim, bookings } = useBookings()
  const [filter, setFilter] = useState<ClaimStatus | "all">("all")
  const [managerNotes, setManagerNotes] = useState<Record<string, string>>({})

  const filtered = useMemo(() => {
    if (filter === "all") return lateArrivalClaims
    return lateArrivalClaims.filter((c) => c.status === filter)
  }, [lateArrivalClaims, filter])

  const pendingCount = lateArrivalClaims.filter((c) => c.status === "pending").length
  const totalApproved = lateArrivalClaims
    .filter((c) => c.status === "approved")
    .reduce((sum, c) => sum + c.compensationAmount, 0)

  function handleResolve(id: string, status: "approved" | "rejected") {
    resolveLateArrivalClaim(id, status, managerNotes[id] || undefined)
    setManagerNotes((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function getCustomerName(customerId: string) {
    return customers.find((c) => c.id === customerId)?.name ?? customerId
  }

  function getStaffMember(staffId: string) {
    return staffMembers.find((s) => s.id === staffId)
  }

  function getBookingInfo(bookingId: string) {
    return bookings.find((b) => b.id === bookingId)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/15">
            <Scale size={20} className="text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-text-primary">Compensation Claims</h1>
            <p className="mt-0.5 text-sm text-brand-text-secondary">
              Manage late arrival compensation requests
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-brand-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-brand-text-tertiary">
            <AlertTriangle size={13} />
            Total Claims
          </div>
          <p className="mt-1 text-2xl font-bold text-brand-text-primary">
            {lateArrivalClaims.length}
          </p>
        </div>
        <div className="rounded-2xl border border-brand-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-brand-text-tertiary">
            <Clock size={13} />
            Pending Review
          </div>
          <p className="mt-1 text-2xl font-bold text-brand-yellow">
            {pendingCount}
          </p>
        </div>
        <div className="rounded-2xl border border-brand-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-brand-text-tertiary">
            <CheckCircle2 size={13} />
            Total Approved
          </div>
          <p className="mt-1 text-2xl font-bold text-brand-green">
            {formatPrice(totalApproved)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <PillButtonRow className="mt-5">
        {statusFilters.map((f) => (
          <PillButton key={f.value} active={filter === f.value} onClick={() => setFilter(f.value)}>
            {f.label}
            {f.value === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-yellow/20 px-1 text-[10px] font-bold text-brand-yellow">
                {pendingCount}
              </span>
            )}
          </PillButton>
        ))}
      </PillButtonRow>

      {/* Table */}
      <div className="mt-5 overflow-x-auto rounded-2xl border border-brand-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-card">
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-text-tertiary">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-text-tertiary">Therapist</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold text-brand-text-tertiary md:table-cell">Booking</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-text-tertiary">Min Late</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-text-tertiary">Compensation</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-text-tertiary">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-text-tertiary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((claim) => {
              const staff = getStaffMember(claim.staffId)
              const booking = getBookingInfo(claim.bookingId)
              return (
                <tr
                  key={claim.id}
                  className="border-b border-brand-border last:border-b-0 hover:bg-brand-bg-tertiary/30"
                >
                  <td className="px-4 py-3 font-medium text-brand-text-primary">
                    {getCustomerName(claim.customerId)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {staff && (
                        <StaffAvatar src={staff.avatar} name={staff.name} size="sm" />
                      )}
                      <span className="text-brand-text-secondary">
                        {staff?.nickname ?? staff?.name ?? claim.staffId}
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-brand-text-secondary md:table-cell">
                    {booking ? (
                      <div>
                        <span className="block text-brand-text-secondary">{booking.serviceName}</span>
                        <span className="text-xs text-brand-text-tertiary">
                          {booking.date} {booking.startTime}
                        </span>
                      </div>
                    ) : (
                      <span className="text-brand-text-tertiary">{claim.bookingId}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-brand-text-primary">{claim.minutesLate} min</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium text-brand-primary">
                        {formatPrice(claim.compensationAmount)}
                      </span>
                      <span className="ml-1 text-xs capitalize text-brand-text-tertiary">
                        ({claim.compensationType})
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={claimStatusVariant(claim.status)} dot>
                      {claim.status}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    {claim.status === "pending" ? (
                      <div className="space-y-2">
                        <Input
                          value={managerNotes[claim.id] ?? ""}
                          onChange={(e) =>
                            setManagerNotes((prev) => ({ ...prev, [claim.id]: e.target.value }))
                          }
                          placeholder="Manager note..."
                          className="h-8 min-w-[140px] border-brand-border bg-card text-xs text-brand-text-primary"
                        />
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 border-brand-green/30 text-brand-green hover:bg-brand-green/10"
                            onClick={() => handleResolve(claim.id, "approved")}
                          >
                            <CheckCircle2 size={12} />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 border-brand-coral/30 text-brand-coral hover:bg-brand-coral/10"
                            onClick={() => handleResolve(claim.id, "rejected")}
                          >
                            <XCircle size={12} />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-brand-text-tertiary">
                        {claim.resolvedAt && (
                          <p>
                            Resolved {new Date(claim.resolvedAt).toLocaleDateString()}
                          </p>
                        )}
                        {claim.managerNote && (
                          <p className="mt-0.5 italic">&ldquo;{claim.managerNote}&rdquo;</p>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Scale size={32} className="mx-auto text-brand-text-tertiary/40" />
            <p className="mt-2 text-sm text-brand-text-tertiary">No claims found</p>
          </div>
        )}
      </div>
    </div>
  )
}
