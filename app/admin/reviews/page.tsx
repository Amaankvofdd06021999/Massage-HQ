"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { StaffAvatar } from "@/components/shared/staff-avatar"
import { RatingStars, RatingDisplay } from "@/components/shared/rating-stars"
import { PillButton, PillButtonRow } from "@/components/shared/pill-button"
import { useShopData } from "@/lib/data/shop-data"
import { formatPrice } from "@/lib/utils/formatters"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"

export default function AdminReviewsPage() {
  const { t } = useLanguage()
  const { staffMembers, bookings } = useShopData()
  const [selectedStaff, setSelectedStaff] = useState<string>("all")

  // All bookings that have a rating
  const allReviews = bookings.filter((b) => b.rating !== undefined)

  const filteredReviews = selectedStaff === "all"
    ? allReviews
    : allReviews.filter((b) => b.staffId === selectedStaff)

  // Aggregate stats per staff
  const staffStats = staffMembers.map((s) => {
    const reviews = allReviews.filter((b) => b.staffId === s.id)
    const avg = reviews.length
      ? reviews.reduce((sum, b) => sum + (b.rating ?? 0), 0) / reviews.length
      : 0
    const totalTips = reviews.reduce((sum, b) => sum + (b.tip ?? 0), 0)
    return { ...s, reviewCount: reviews.length, avgRating: avg, totalTips }
  }).filter((s) => s.reviewCount > 0)

  // Rating breakdown for the selected staff
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: filteredReviews.filter((b) => b.rating === star).length,
  }))
  const maxCount = Math.max(...breakdown.map((b) => b.count), 1)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-text-primary">{t("therapistReviews")}</h1>
        <p className="mt-1 text-sm text-brand-text-secondary">
          {allReviews.length} {t("reviewsCount")}
        </p>
      </div>

      {/* Staff summary cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {staffStats.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedStaff(s.id === selectedStaff ? "all" : s.id)}
            className={cn(
              "rounded-2xl border p-4 text-left transition-all",
              selectedStaff === s.id
                ? "border-brand-primary bg-brand-primary/5"
                : "border-brand-border bg-card hover:border-brand-primary/40"
            )}
          >
            <div className="flex items-center gap-3">
              <StaffAvatar src={s.avatar} name={s.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brand-text-primary">{s.nickname}</p>
                <RatingDisplay rating={s.avgRating} reviews={s.reviewCount} />
              </div>
            </div>
            {s.totalTips > 0 && (
              <div className="mt-2 flex items-center justify-between rounded-lg bg-brand-bg-tertiary/50 px-3 py-1.5 text-xs">
                <span className="text-brand-text-tertiary">{t("tip")}</span>
                <span className="font-semibold text-brand-primary">{formatPrice(s.totalTips)}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Filter pill */}
      <PillButtonRow className="mb-5">
        <PillButton active={selectedStaff === "all"} onClick={() => setSelectedStaff("all")}>
          {t("allStaffFilter")} ({allReviews.length})
        </PillButton>
        {staffStats.map((s) => (
          <PillButton
            key={s.id}
            active={selectedStaff === s.id}
            onClick={() => setSelectedStaff(s.id)}
          >
            {s.nickname} ({s.reviewCount})
          </PillButton>
        ))}
      </PillButtonRow>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Reviews list */}
        <div className="flex flex-col gap-3">
          {filteredReviews.length === 0 ? (
            <div className="py-16 text-center text-sm text-brand-text-tertiary">{t("noReviewsYet")}</div>
          ) : (
            filteredReviews.map((review) => {
              const staff = staffMembers.find((s) => s.id === review.staffId)
              return (
                <div key={review.id} className="rounded-2xl border border-brand-border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <StaffAvatar src={review.staffAvatar} name={review.staffName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-brand-text-primary">{review.customerName}</p>
                          <p className="text-xs text-brand-text-tertiary">
                            {t("with")} {review.staffName} · {review.date}
                          </p>
                        </div>
                        <RatingStars rating={review.rating ?? 0} size={13} />
                      </div>
                      <p className="mt-1 text-xs text-brand-text-secondary">{review.serviceName}</p>
                      {review.review && (
                        <p className="mt-2 text-sm text-brand-text-primary leading-relaxed">
                          &ldquo;{review.review}&rdquo;
                        </p>
                      )}
                      {review.tip !== undefined && review.tip > 0 && (
                        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-green/10 px-2.5 py-0.5 text-xs font-medium text-brand-green">
                          {t("tip")}: {formatPrice(review.tip)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Rating breakdown sidebar */}
        <div className="rounded-2xl border border-brand-border bg-card p-5 h-fit">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">
            {t("rating")}
          </p>
          <div className="mb-4 text-center">
            <p className="text-5xl font-bold text-brand-text-primary">
              {filteredReviews.length > 0
                ? (filteredReviews.reduce((s, b) => s + (b.rating ?? 0), 0) / filteredReviews.length).toFixed(1)
                : "–"}
            </p>
            <div className="mt-1 flex justify-center">
              <RatingStars
                rating={filteredReviews.length > 0
                  ? filteredReviews.reduce((s, b) => s + (b.rating ?? 0), 0) / filteredReviews.length
                  : 0}
                size={16}
              />
            </div>
            <p className="mt-1 text-xs text-brand-text-tertiary">
              {filteredReviews.length} {t("reviewsCount")}
            </p>
          </div>

          <div className="space-y-2">
            {breakdown.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="w-3 text-xs text-brand-text-tertiary text-right">{star}</span>
                <Star size={10} className="shrink-0 fill-brand-yellow text-brand-yellow" />
                <div className="flex-1 overflow-hidden rounded-full bg-brand-border" style={{ height: 6 }}>
                  <div
                    className="h-full rounded-full bg-brand-yellow transition-all"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-4 text-xs text-brand-text-tertiary">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
