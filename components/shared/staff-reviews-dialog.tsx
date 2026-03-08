"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StaffAvatar } from "@/components/shared/staff-avatar"
import { useBookings } from "@/lib/data/bookings-store"
import { useLanguage } from "@/lib/i18n/language-context"
import { Star } from "lucide-react"
import type { StaffMember } from "@/lib/types"

export function StaffReviewsDialog({
  staff,
  open,
  onOpenChange,
}: {
  staff: StaffMember | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useLanguage()
  const { bookings } = useBookings()

  if (!staff) return null

  const reviews = bookings
    .filter((b) => b.staffId === staff.id && b.rating && b.review)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto bg-card border-brand-border max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <StaffAvatar src={staff.avatar} name={staff.name} size="md" />
            <div>
              <DialogTitle className="text-brand-text-primary">{staff.nickname}</DialogTitle>
              <div className="mt-1 flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.round(staff.rating) ? "fill-brand-yellow text-brand-yellow" : "text-brand-border"}
                  />
                ))}
                <span className="ml-1 text-xs text-brand-text-secondary">
                  {staff.rating.toFixed(1)} ({staff.totalReviews} {t("staffReviews").toLowerCase()})
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-3">
          {reviews.length === 0 ? (
            <p className="py-8 text-center text-sm text-brand-text-secondary">{t("noReviewsYet")}</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-brand-border bg-brand-bg-secondary p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < (review.rating ?? 0) ? "fill-brand-yellow text-brand-yellow" : "text-brand-border"}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-brand-text-tertiary">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-sm text-brand-text-secondary">{review.review}</p>
                <p className="mt-1 text-xs text-brand-text-tertiary">{review.customerName}</p>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
