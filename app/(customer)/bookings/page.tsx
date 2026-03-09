"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"
import { BookingCard } from "@/components/shared/booking-card"
import { PackageSessionTracker } from "@/components/shared/package-session-tracker"
import { PillButton, PillButtonRow } from "@/components/shared/pill-button"
import { useBookings } from "@/lib/data/bookings-store"
import { promotions, promoSessionUsages, formatPrice } from "@/lib/data/mock-data"
import { useLanguage } from "@/lib/i18n/language-context"
import { useAuth } from "@/lib/auth/auth-context"

type Tab = "upcoming" | "past" | "packages"

export default function BookingsPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const { bookings } = useBookings()
  const [tab, setTab] = useState<Tab>("upcoming")

  // Sort: in-progress first, then by date ascending (soonest first)
  const upcoming = bookings
    .filter((b) => b.status === "confirmed" || b.status === "in-progress" || b.status === "pending")
    .sort((a, b) => {
      if (a.status === "in-progress" && b.status !== "in-progress") return -1
      if (b.status === "in-progress" && a.status !== "in-progress") return 1
      if (a.status === "pending" && b.status !== "pending" && b.status !== "in-progress") return -1
      if (b.status === "pending" && a.status !== "pending" && a.status !== "in-progress") return 1
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

  const past = bookings
    .filter((b) => b.status === "completed" || b.status === "cancelled" || b.status === "no-show" || b.status === "rejected")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const packages = promotions.filter((p) => p.type === "package" && p.sessions)

  return (
    <div className="px-5 pb-24 pt-12">
      <div className="flex items-center gap-2">
        <Calendar size={20} className="text-brand-primary" />
        <h1 className="text-2xl font-bold text-brand-text-primary">{t("myBookings")}</h1>
      </div>

      <PillButtonRow className="mt-5">
        <PillButton active={tab === "upcoming"} onClick={() => setTab("upcoming")}>
          {t("upcomingTab")} ({upcoming.length})
        </PillButton>
        <PillButton active={tab === "past"} onClick={() => setTab("past")}>
          {t("pastTab")} ({past.length})
        </PillButton>
        <PillButton active={tab === "packages"} onClick={() => setTab("packages")}>
          {t("packagesTab")} ({packages.length})
        </PillButton>
      </PillButtonRow>

      {tab === "upcoming" && (
        <div className="mt-5 flex flex-col gap-3 page-transition">
          {upcoming.length > 0 ? (
            upcoming.map((b) => <BookingCard key={b.id} booking={b} />)
          ) : (
            <div className="py-16 text-center">
              <p className="text-sm text-brand-text-tertiary">{t("noUpcomingBookings")}</p>
            </div>
          )}
        </div>
      )}

      {tab === "past" && (
        <div className="mt-5 flex flex-col gap-3 page-transition">
          {past.length > 0 ? (
            past.map((b) => <BookingCard key={b.id} booking={b} showActions={false} />)
          ) : (
            <div className="py-16 text-center">
              <p className="text-sm text-brand-text-tertiary">{t("noPastBookings")}</p>
            </div>
          )}
        </div>
      )}

      {tab === "packages" && (
        <div className="mt-5 flex flex-col gap-3 page-transition">
          {packages.map((pkg) => (
            <div key={pkg.id} className="rounded-2xl border border-brand-border bg-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-brand-text-primary">{pkg.title}</p>
                  <p className="mt-1 text-xs text-brand-text-tertiary">{pkg.description}</p>
                </div>
                <span className="rounded-full bg-brand-green/15 px-2 py-0.5 text-[10px] font-semibold text-brand-green">
                  {pkg.badge}
                </span>
              </div>

              {/* Session tracker with per-type breakdown */}
              <PackageSessionTracker
                promotion={pkg}
                sessionUsages={promoSessionUsages.filter((u) => u.promotionId === pkg.id)}
              />

              {pkg.sessions && (
                <>
                  <div className="mt-3 flex gap-1.5">
                    {Array.from({ length: pkg.sessions }, (_, i) => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded-full ${
                          i < (pkg.sessionsUsed ?? 0) ? "bg-brand-green" : "bg-brand-border"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-brand-text-tertiary">
                      {pkg.sessionsUsed ?? 0} {t("sessionsUsedOf")} {pkg.sessions} {t("sessionsUsed")}
                    </span>
                    <span className="font-medium text-brand-green">
                      {pkg.sessions - (pkg.sessionsUsed ?? 0)} {t("sessionsRemaining")}
                    </span>
                  </div>
                </>
              )}
              <div className="mt-3 flex items-center justify-between border-t border-brand-border pt-3 text-sm">
                <span className="text-brand-text-tertiary line-through">{formatPrice(pkg.originalPrice ?? 0)}</span>
                <span className="font-bold text-brand-primary">{formatPrice(pkg.promoPrice ?? 0)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
