"use client"

import { use, useState, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Globe, Award, Star, ChevronRight } from "lucide-react"
import { StaffAvatar } from "@/components/shared/staff-avatar"
import { RatingStars, RatingDisplay } from "@/components/shared/rating-stars"
import { StatusBadge } from "@/components/shared/status-badge"
import { PillButton, PillButtonRow } from "@/components/shared/pill-button"
import { useLanguage } from "@/lib/i18n/language-context"
import {
  staffMembers, services, bookings, generateTimeSlots,
  formatPrice, formatMassageType,
} from "@/lib/data/mock-data"

export default function StaffProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { t } = useLanguage()
  const staff = staffMembers.find((s) => s.id === id)
  const [selectedDate, setSelectedDate] = useState(0)

  const dates = useMemo(() => {
    const result = []
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      result.push({
        label: i === 0 ? t("today") : i === 1 ? t("tomorrow") : d.toLocaleDateString("en", { weekday: "short" }),
        date: d.toISOString().split("T")[0],
        dayNum: d.getDate(),
        month: d.toLocaleDateString("en", { month: "short" }),
      })
    }
    return result
  }, [t])

  const timeSlots = useMemo(
    () => (staff ? generateTimeSlots(dates[selectedDate].date, staff.id) : []),
    [staff, selectedDate, dates]
  )

  const staffServices = useMemo(
    () => (staff ? services.filter((s) => staff.specialties.includes(s.type)) : []),
    [staff]
  )

  const staffReviews = useMemo(
    () =>
      staff
        ? bookings.filter((b) => b.staffId === staff.id && b.rating).slice(0, 5)
        : [],
    [staff]
  )

  if (!staff) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-brand-text-tertiary">{t("therapistNotFound")}</p>
      </div>
    )
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-b from-brand-primary/10 to-transparent" />
        <Link
          href="/therapists"
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-brand-bg-secondary/80 backdrop-blur"
          aria-label={t("backToStaff")}
        >
          <ArrowLeft size={18} className="text-brand-text-primary" />
        </Link>
        <div className="absolute -bottom-12 left-5">
          <StaffAvatar src={staff.avatar} name={staff.name} size="xl" available={staff.isAvailableToday} />
        </div>
      </div>

      <div className="px-5 pt-14">
        {/* Name & Meta */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-brand-text-primary">{staff.nickname}</h1>
            <p className="text-sm text-brand-text-secondary">{staff.name}</p>
          </div>
          {staff.isAvailableToday && <StatusBadge variant="success" dot>{t("availableTodayBadge")}</StatusBadge>}
        </div>

        <div className="mt-3 flex items-center gap-4">
          <RatingDisplay rating={staff.rating} reviews={staff.totalReviews} />
          <span className="flex items-center gap-1 text-xs text-brand-text-tertiary">
            <Clock size={12} /> {staff.yearsExperience} {t("years")}
          </span>
          <span className="flex items-center gap-1 text-xs text-brand-text-tertiary">
            <Globe size={12} /> {staff.languages.map((l) => l.charAt(0).toUpperCase() + l.slice(1)).join(", ")}
          </span>
        </div>

        {/* Bio */}
        <p className="mt-4 text-sm leading-relaxed text-brand-text-secondary">{staff.bio}</p>

        {/* Certifications */}
        {staff.certifications.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {staff.certifications.map((cert) => (
              <span key={cert} className="flex items-center gap-1.5 rounded-full bg-brand-bg-tertiary px-3 py-1 text-xs text-brand-text-secondary">
                <Award size={12} className="text-brand-yellow" />
                {cert}
              </span>
            ))}
          </div>
        )}

        {/* Specialties */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-brand-text-primary">{t("specialties")}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {staff.specialties.map((sp) => (
              <span key={sp} className="rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary">
                {formatMassageType(sp)}
              </span>
            ))}
          </div>
        </div>

        {/* Services & Pricing */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-brand-text-primary">{t("servicesPricing")}</h2>
          <div className="mt-3 flex flex-col gap-2">
            {staffServices.map((svc) => (
              <div key={svc.id} className="rounded-xl border border-brand-border bg-card p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-brand-text-primary">{svc.name}</p>
                  {svc.isPopular && <StatusBadge variant="promo">{t("popular")}</StatusBadge>}
                </div>
                <div className="mt-2 flex gap-2">
                  {svc.durations.map((d) => (
                    <span key={d.minutes} className="rounded-lg bg-brand-bg-tertiary px-2.5 py-1 text-xs text-brand-text-secondary">
                      {d.minutes}{t("min")} - <span className="font-medium text-brand-primary">{formatPrice(d.price)}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Availability Calendar */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-brand-text-primary">{t("availability")}</h2>
          <PillButtonRow className="mt-3">
            {dates.map((d, i) => (
              <PillButton key={d.date} active={selectedDate === i} onClick={() => setSelectedDate(i)}>
                <div className="flex flex-col items-center">
                  <span className="text-[10px]">{d.label}</span>
                  <span className="text-sm font-bold">{d.dayNum}</span>
                </div>
              </PillButton>
            ))}
          </PillButtonRow>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {timeSlots.map((slot) => (
              <Link
                key={slot.time}
                href={slot.available ? `/book?staff=${staff.id}&date=${dates[selectedDate].date}&time=${slot.time}` : "#"}
                className={`rounded-lg border py-2 text-center text-xs font-medium transition-all ${
                  slot.available
                    ? "border-brand-border bg-card text-brand-text-primary hover:border-brand-primary hover:bg-brand-primary/10"
                    : "cursor-not-allowed border-transparent bg-brand-bg-tertiary/50 text-brand-text-tertiary line-through"
                }`}
              >
                {slot.time}
              </Link>
            ))}
          </div>
        </div>

        {/* Reviews */}
        {staffReviews.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-brand-text-primary">{t("recentReviews")}</h2>
            <div className="mt-3 flex flex-col gap-3">
              {staffReviews.map((b) => (
                <div key={b.id} className="rounded-xl border border-brand-border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-brand-text-primary">{b.customerName}</p>
                    <RatingStars rating={b.rating!} size={12} />
                  </div>
                  {b.review && (
                    <p className="mt-1.5 text-xs leading-relaxed text-brand-text-secondary">{b.review}</p>
                  )}
                  <p className="mt-1 text-[10px] text-brand-text-tertiary">{b.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/book?staff=${staff.id}`}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
        >
          {t("bookWith")} {staff.nickname}
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  )
}
