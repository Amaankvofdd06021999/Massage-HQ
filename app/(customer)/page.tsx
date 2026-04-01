"use client"

import Link from "next/link"
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react"
import { StaffAvatar } from "@/components/shared/staff-avatar"
import { PromoCard } from "@/components/shared/promo-card"
import { BookingCard } from "@/components/shared/booking-card"
import { RatingDisplay } from "@/components/shared/rating-stars"
import { StatusBadge } from "@/components/shared/status-badge"
import { useBrand } from "@/lib/theme/theme-provider"
import { useShop } from "@/lib/shop/shop-context"
import { useLanguage } from "@/lib/i18n/language-context"
import type { TranslationKey } from "@/lib/i18n/translations"
import { useShopData } from "@/lib/data/shop-data"
import { formatPrice, formatMassageType } from "@/lib/utils/formatters"

function getGreeting(t: (k: TranslationKey) => string) {
  const hour = new Date().getHours()
  if (hour < 12) return t("goodMorning")
  if (hour < 17) return t("goodAfternoon")
  return t("goodEvening")
}

function HeroSection() {
  const { brandConfig } = useBrand()
  const { t } = useLanguage()
  return (
    <section className="relative overflow-hidden px-5 pb-6 pt-12 pr-14">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 to-transparent" />
      <div className="relative">
        <p className="text-sm text-brand-text-secondary">{getGreeting(t)}</p>
        <h1 className="mt-1 text-2xl font-bold text-brand-text-primary">{brandConfig.shopName}</h1>
        <p className="mt-1 text-sm text-brand-text-tertiary">{brandConfig.tagline}</p>
        <Link
          href="/book"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
        >
          {t("bookSession")}
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}

function QuickRebook() {
  const { t } = useLanguage()
  const { bookings } = useShopData()
  const pastBookings = bookings.filter((b) => b.status === "completed").slice(0, 3)
  if (pastBookings.length === 0) return null

  return (
    <section className="px-5 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-text-primary">{t("quickRebook")}</h2>
        <Link href="/bookings" className="flex items-center gap-1 text-xs text-brand-primary">
          {t("viewAll")} <ChevronRight size={14} />
        </Link>
      </div>
      <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {pastBookings.map((b) => (
          <Link
            key={b.id}
            href={`/book?staff=${b.staffId}&service=${b.serviceId}`}
            className="flex shrink-0 items-center gap-3 rounded-xl border border-brand-border bg-card p-3 transition-all card-press"
          >
            <StaffAvatar src={b.staffAvatar} name={b.staffName} size="sm" />
            <div>
              <p className="text-sm font-medium text-brand-text-primary">{b.staffName}</p>
              <p className="text-xs text-brand-text-tertiary">{formatMassageType(b.serviceType)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function FeaturedStaff() {
  const { t } = useLanguage()
  const { staffMembers } = useShopData()
  const featured = staffMembers.filter((s) => s.isFeatured)

  return (
    <section className="px-5 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-text-primary">{t("featuredTherapists")}</h2>
        <Link href="/therapists" className="flex items-center gap-1 text-xs text-brand-primary">
          {t("seeAll")} <ChevronRight size={14} />
        </Link>
      </div>
      <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {featured.map((staff) => (
          <Link
            key={staff.id}
            href={`/therapists/${staff.id}`}
            className="flex w-36 shrink-0 flex-col items-center rounded-2xl border border-brand-border bg-card p-4 text-center transition-all card-press"
          >
            <StaffAvatar src={staff.avatar} name={staff.name} size="lg" available={staff.isAvailableToday} />
            <p className="mt-3 text-sm font-semibold text-brand-text-primary">{staff.nickname}</p>
            <p className="mt-0.5 text-xs text-brand-text-tertiary">
              {formatMassageType(staff.specialties[0])}
            </p>
            <RatingDisplay rating={staff.rating} reviews={staff.totalReviews} className="mt-2" />
            <p className="mt-1 text-xs font-medium text-brand-primary">
              {formatPrice(staff.pricePerHour)}/{t("perHour")}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}

function ActivePromos() {
  const { t } = useLanguage()
  const { promotions } = useShopData()
  const activePromos = promotions.filter((p) => p.isActive).slice(0, 3)

  return (
    <section className="px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-brand-coral" />
          <h2 className="text-lg font-bold text-brand-text-primary">{t("promotions")}</h2>
        </div>
        <Link href="/promotions" className="flex items-center gap-1 text-xs text-brand-primary">
          {t("allDeals")} <ChevronRight size={14} />
        </Link>
      </div>
      <div className="mt-3 flex flex-col gap-3">
        {activePromos.map((promo) => (
          <PromoCard key={promo.id} promo={promo} compact />
        ))}
      </div>
    </section>
  )
}

function UpcomingBookings() {
  const { t } = useLanguage()
  const { bookings } = useShopData()
  const today = new Date().toISOString().split("T")[0]
  const upcoming = bookings.filter((b) => b.status === "confirmed" && b.date >= today).slice(0, 2)
  if (upcoming.length === 0) return null

  return (
    <section className="px-5 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-text-primary">{t("upcoming")}</h2>
        <Link href="/bookings" className="flex items-center gap-1 text-xs text-brand-primary">
          {t("allBookings")} <ChevronRight size={14} />
        </Link>
      </div>
      <div className="mt-3 flex flex-col gap-3">
        {upcoming.map((b) => (
          <BookingCard key={b.id} booking={b} />
        ))}
      </div>
    </section>
  )
}

function TodayAvailability() {
  const { t } = useLanguage()
  const { staffMembers } = useShopData()
  const available = staffMembers.filter((s) => s.isAvailableToday)

  return (
    <section className="px-5 py-4 pb-24">
      <h2 className="text-lg font-bold text-brand-text-primary">{t("availableToday")}</h2>
      <p className="mt-0.5 text-xs text-brand-text-tertiary">
        {available.length} {t("therapistsReadyToServe")}
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {available.map((staff) => (
          <Link
            key={staff.id}
            href={`/therapists/${staff.id}`}
            className="flex items-center gap-3 rounded-xl border border-brand-border bg-card p-3 transition-all card-press"
          >
            <StaffAvatar src={staff.avatar} name={staff.name} size="md" available />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-brand-text-primary">{staff.nickname}</p>
                <StatusBadge variant="success" dot>{t("active")}</StatusBadge>
              </div>
              <p className="mt-0.5 text-xs text-brand-text-tertiary">
                {staff.specialties.slice(0, 2).map(formatMassageType).join(" / ")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-brand-primary">{formatPrice(staff.pricePerHour)}</p>
              <p className="text-[10px] text-brand-text-tertiary">{t("perHour")}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default function HomePage() {
  const { shopConfig } = useShop()

  return (
    <div>
      <HeroSection />
      <UpcomingBookings />
      <QuickRebook />
      <FeaturedStaff />
      <ActivePromos />
      <TodayAvailability />
    </div>
  )
}
