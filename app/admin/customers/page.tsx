"use client"

import { useState } from "react"
import { SearchBar } from "@/components/shared/search-bar"
import { StatusBadge } from "@/components/shared/status-badge"
import { ClientNotesPanel } from "@/components/admin/client-notes-panel"
import { customers } from "@/lib/data/mock-data"
import { formatPrice, formatMassageType } from "@/lib/utils/formatters"
import { useLanguage } from "@/lib/i18n/language-context"
import { usePromotions } from "@/lib/data/promotions-store"
import { useBookings } from "@/lib/data/bookings-store"
import { cn } from "@/lib/utils"
import { CreditCard, Gift, Check, Circle, ChevronRight, Star, StickyNote } from "lucide-react"
import type { Customer } from "@/lib/types"

export default function AdminCustomersPage() {
  const { t } = useLanguage()
  const [search, setSearch] = useState("")
  const [notesCustomer, setNotesCustomer] = useState<Customer | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const { getPromotionsForCustomer } = usePromotions()
  const { bookings } = useBookings()

  const filtered = search
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase()) ||
          c.membershipNumber.toLowerCase().includes(search.toLowerCase())
      )
    : customers

  const customerPromos = selectedCustomer
    ? getPromotionsForCustomer(selectedCustomer.id)
    : []

  const customerReviews = selectedCustomer
    ? bookings
        .filter((b) => b.customerId === selectedCustomer.id && b.rating)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    : []

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text-primary">{t("customers")}</h1>
      <p className="mt-1 text-sm text-brand-text-secondary">{customers.length} {t("registeredCustomers")}</p>

      <SearchBar value={search} onChange={setSearch} placeholder={t("searchByMembership")} className="mt-4" />

      <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((customer) => (
          <div
            key={customer.id}
            className={cn(
              "cursor-pointer rounded-2xl border border-brand-border bg-card p-5 transition-colors hover:border-brand-primary/40",
              selectedCustomer?.id === customer.id && "border-brand-primary ring-1 ring-brand-primary/30"
            )}
            onClick={() =>
              setSelectedCustomer(
                selectedCustomer?.id === customer.id ? null : customer
              )
            }
          >
            <div className="flex items-center gap-3">
              <img
                src={customer.avatar}
                alt={customer.name}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-brand-border"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brand-text-primary">{customer.name}</p>
                <p className="text-xs font-mono text-brand-primary">{customer.membershipNumber}</p>
                <p className="text-xs text-brand-text-tertiary">{customer.email}</p>
              </div>
              {customer.trialActive && <StatusBadge variant="active" dot>{t("trialBadge")}</StatusBadge>}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-brand-bg-tertiary/50 p-2 text-center">
                <p className="text-sm font-bold text-brand-text-primary">{customer.totalBookings}</p>
                <p className="text-[10px] text-brand-text-tertiary">{t("bookingsLabel")}</p>
              </div>
              <div className="rounded-lg bg-brand-bg-tertiary/50 p-2 text-center">
                <p className="text-sm font-bold text-brand-primary">{formatPrice(customer.totalSpent)}</p>
                <p className="text-[10px] text-brand-text-tertiary">{t("spentLabel")}</p>
              </div>
              <div className="rounded-lg bg-brand-bg-tertiary/50 p-2 text-center">
                <p className="text-sm font-bold text-brand-yellow">{customer.loyaltyPoints}</p>
                <p className="text-[10px] text-brand-text-tertiary">{t("pointsLabel")}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-brand-text-tertiary">
                {t("memberSince")} {new Date(customer.memberSince).toLocaleDateString("en", { month: "short", year: "numeric" })}
                {" / "}{customer.phone}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setNotesCustomer(customer)
                }}
                className="flex items-center gap-1.5 rounded-lg border border-brand-border px-2.5 py-1.5 text-xs font-medium text-brand-text-secondary transition-colors hover:bg-brand-bg-tertiary hover:text-brand-text-primary"
              >
                <StickyNote size={13} />
                {t("clientNotes")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Customer Detail */}
      {selectedCustomer && (
        <div className="mt-5 rounded-2xl border border-brand-border bg-card p-5">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/15 text-brand-primary font-bold text-lg">
              {selectedCustomer.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-text-primary">{selectedCustomer.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <CreditCard size={14} className="text-brand-primary" />
                <span className="text-sm font-mono font-semibold text-brand-primary">{selectedCustomer.membershipNumber}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-brand-bg-secondary p-3 text-center">
              <p className="text-lg font-bold text-brand-text-primary">{selectedCustomer.totalBookings}</p>
              <p className="text-xs text-brand-text-tertiary">{t("bookingsLabel")}</p>
            </div>
            <div className="rounded-xl bg-brand-bg-secondary p-3 text-center">
              <p className="text-lg font-bold text-brand-text-primary">{formatPrice(selectedCustomer.totalSpent)}</p>
              <p className="text-xs text-brand-text-tertiary">{t("spentLabel")}</p>
            </div>
            <div className="rounded-xl bg-brand-bg-secondary p-3 text-center">
              <p className="text-lg font-bold text-brand-text-primary">{selectedCustomer.loyaltyPoints}</p>
              <p className="text-xs text-brand-text-tertiary">{t("pointsLabel")}</p>
            </div>
          </div>

          {/* Active Promotions */}
          <div className="mt-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-text-primary">
              <Gift size={16} className="text-brand-green" />
              {t("customerPromotions")}
            </h3>
            {customerPromos.length === 0 ? (
              <p className="mt-2 text-xs text-brand-text-tertiary">{t("noActivePromotions")}</p>
            ) : (
              <div className="mt-3 space-y-3">
                {customerPromos.map((promo) => {
                  const completed = promo.services.filter((s) => s.completed).length
                  const total = promo.services.length
                  return (
                    <div key={promo.id} className="rounded-xl border border-brand-border bg-brand-bg-secondary p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-brand-text-primary">{promo.promotionTitle}</p>
                        <span className="text-xs text-brand-text-tertiary">{completed}/{total} {t("used")}</span>
                      </div>
                      <div className="mt-2 flex gap-1">
                        {promo.services.map((s, i) => (
                          <div key={i} className={cn("h-1.5 flex-1 rounded-full", s.completed ? "bg-brand-green" : "bg-brand-border")} />
                        ))}
                      </div>
                      <div className="mt-2 space-y-1">
                        {promo.services.map((s, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            {s.completed ? (
                              <Check size={12} className="text-brand-green" />
                            ) : (
                              <Circle size={12} className="text-brand-border" />
                            )}
                            <span className={s.completed ? "text-brand-text-tertiary line-through" : "text-brand-text-secondary"}>
                              {formatMassageType(s.serviceType)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Customer Feedback from past bookings */}
          <div className="mt-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-text-primary">
              <Star size={16} className="text-brand-yellow" />
              {t("customerFeedback")}
            </h3>
            {customerReviews.length === 0 ? (
              <p className="mt-2 text-xs text-brand-text-tertiary">No feedback yet</p>
            ) : (
              <div className="mt-3 space-y-2">
                {customerReviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-brand-border bg-brand-bg-secondary p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} size={12} className={i < (review.rating ?? 0) ? "fill-brand-yellow text-brand-yellow" : "text-brand-border"} />
                        ))}
                      </div>
                      <span className="text-[10px] text-brand-text-tertiary">{review.date}</span>
                    </div>
                    {review.review && <p className="mt-1 text-xs text-brand-text-secondary">{review.review}</p>}
                    <p className="mt-1 text-[10px] text-brand-text-tertiary">{review.serviceName} with {review.staffName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Previous Notes */}
          <div className="mt-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-text-primary">
              <StickyNote size={16} className="text-brand-blue" />
              {t("previousNotes")}
            </h3>
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setNotesCustomer(selectedCustomer)}
                className="flex items-center gap-2 rounded-lg border border-brand-border px-3 py-2 text-xs font-medium text-brand-text-secondary transition-colors hover:bg-brand-bg-tertiary hover:text-brand-text-primary"
              >
                <StickyNote size={14} />
                {t("clientNotes")}
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Panel */}
      {notesCustomer && (
        <ClientNotesPanel
          customerId={notesCustomer.id}
          customerName={notesCustomer.name}
          open={!!notesCustomer}
          onOpenChange={(open) => !open && setNotesCustomer(null)}
        />
      )}
    </div>
  )
}
