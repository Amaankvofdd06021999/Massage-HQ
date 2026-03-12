"use client"

import { useState } from "react"
import { MessageSquare } from "lucide-react"
import { StaffAvatar } from "@/components/shared/staff-avatar"
import { RatingDisplay } from "@/components/shared/rating-stars"
import { StaffReviewsDialog } from "@/components/shared/staff-reviews-dialog"
import { useLanguage } from "@/lib/i18n/language-context"
import { formatPrice, formatMassageType } from "@/lib/utils/formatters"
import { cn } from "@/lib/utils"
import type { StaffMember, ServiceOption } from "@/lib/types"

interface TherapistStepProps {
  filteredStaff: StaffMember[]
  selectedStaff: StaffMember | null
  selectedService: ServiceOption | null
  onSelectStaff: (staff: StaffMember) => void
}

export function TherapistStep({
  filteredStaff,
  selectedStaff,
  selectedService,
  onSelectStaff,
}: TherapistStepProps) {
  const { t } = useLanguage()
  const [reviewStaff, setReviewStaff] = useState<StaffMember | null>(null)

  return (
    <div className="mt-6 px-5 page-transition">
      <h2 className="text-lg font-bold text-brand-text-primary">{t("chooseYourTherapist")}</h2>
      <p className="mt-1 text-sm text-brand-text-secondary">
        {filteredStaff.length} {t("therapistsAvailableFor")} {selectedService ? formatMassageType(selectedService.type) : t("thisService")}
      </p>
      <div className="mt-4 flex flex-col gap-3">
        {filteredStaff.map((staff) => (
          <div
            key={staff.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectStaff(staff)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelectStaff(staff) }}
            className={cn(
              "flex gap-3 rounded-2xl border p-4 text-left transition-all card-press cursor-pointer",
              selectedStaff?.id === staff.id
                ? "border-brand-primary bg-brand-primary/5"
                : "border-brand-border bg-card"
            )}
          >
            <StaffAvatar src={staff.avatar} name={staff.name} size="md" available={staff.isAvailableToday} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-brand-text-primary">{staff.nickname}</p>
              <div className="mt-1 flex items-center gap-2">
                <RatingDisplay rating={staff.rating} reviews={staff.totalReviews} />
                <span className="text-xs text-brand-text-tertiary">{staff.yearsExperience}yr</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="text-sm font-semibold text-brand-primary">{formatPrice(staff.pricePerHour)}/hr</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setReviewStaff(staff) }}
                className="flex items-center gap-1 rounded-lg border border-brand-border px-2 py-1 text-xs text-brand-text-secondary hover:bg-brand-bg-tertiary transition-colors"
              >
                <MessageSquare size={12} />
                {t("viewReviews")}
              </button>
            </div>
          </div>
        ))}
      </div>

      <StaffReviewsDialog
        staff={reviewStaff}
        open={!!reviewStaff}
        onOpenChange={(open) => { if (!open) setReviewStaff(null) }}
      />
    </div>
  )
}
