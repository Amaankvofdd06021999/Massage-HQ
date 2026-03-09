"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Star, Award, BookOpen, DollarSign, LogOut, Languages,
  BadgeCheck, Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/auth-context"
import { useBookings } from "@/lib/data/bookings-store"
import { useLanguage } from "@/lib/i18n/language-context"
import { useBrand } from "@/lib/theme/theme-provider"
import { staffMembers, formatPrice, formatMassageType } from "@/lib/data/mock-data"
import { RatingStars, RatingDisplay } from "@/components/shared/rating-stars"
import Image from "next/image"

export default function StaffProfilePage() {
  const { user, logout } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const { brandConfig } = useBrand()
  const { getBookingsForStaff } = useBookings()
  const router = useRouter()

  const staffMember = staffMembers.find((s) => s.id === user?.id)
  const allBookings = useMemo(
    () => (user ? getBookingsForStaff(user.id) : []),
    [user, getBookingsForStaff]
  )

  const completedBookings = useMemo(
    () => allBookings.filter((b) => b.status === "completed"),
    [allBookings]
  )

  const totalEarnings = useMemo(
    () => completedBookings.reduce((sum, b) => sum + b.price, 0),
    [completedBookings]
  )

  const reviewedBookings = useMemo(
    () => completedBookings.filter((b) => b.rating !== undefined),
    [completedBookings]
  )

  const avgRating = useMemo(() => {
    if (reviewedBookings.length === 0) return staffMember?.rating ?? 0
    return reviewedBookings.reduce((sum, b) => sum + (b.rating ?? 0), 0) / reviewedBookings.length
  }, [reviewedBookings, staffMember])

  const recentReviews = useMemo(
    () =>
      reviewedBookings
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5),
    [reviewedBookings]
  )

  function handleSignOut() {
    logout()
    router.replace("/login")
  }

  if (!staffMember) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-brand-text-secondary">Staff profile not found</p>
      </div>
    )
  }

  return (
    <div className="px-5 pb-8 pt-12">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-brand-primary/30 bg-brand-bg-tertiary">
          {user?.avatar ? (
            <Image src={user.avatar} alt={user.name} fill className="object-cover" sizes="64px" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xl font-bold text-brand-text-primary">
              {user?.name?.charAt(0) ?? "?"}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-brand-text-primary">{staffMember.name}</h1>
          <p className="text-sm text-brand-text-secondary">&ldquo;{staffMember.nickname}&rdquo;</p>
          <div className="mt-1 flex items-center gap-2">
            <RatingDisplay rating={staffMember.rating} reviews={staffMember.totalReviews} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-brand-border bg-card p-3 text-center">
          <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/15">
            <BookOpen size={16} className="text-brand-primary" />
          </div>
          <p className="text-lg font-bold text-brand-primary">{completedBookings.length}</p>
          <p className="text-[10px] text-brand-text-tertiary">Completed</p>
        </div>
        <div className="rounded-xl border border-brand-border bg-card p-3 text-center">
          <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-yellow/15">
            <Star size={16} className="text-brand-yellow" />
          </div>
          <p className="text-lg font-bold text-brand-yellow">{avgRating.toFixed(1)}</p>
          <p className="text-[10px] text-brand-text-tertiary">Avg Rating</p>
        </div>
        <div className="rounded-xl border border-brand-border bg-card p-3 text-center">
          <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green/15">
            <DollarSign size={16} className="text-brand-green" />
          </div>
          <p className="text-lg font-bold text-brand-green">{formatPrice(totalEarnings)}</p>
          <p className="text-[10px] text-brand-text-tertiary">Earnings</p>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-brand-text-secondary">Recent Reviews</h2>
        {recentReviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-border bg-card/50 py-8 text-center">
            <Star size={20} className="mx-auto mb-2 text-brand-text-tertiary" />
            <p className="text-sm text-brand-text-secondary">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentReviews.map((booking) => (
              <div
                key={booking.id}
                className="rounded-2xl border border-brand-border bg-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-brand-text-primary">{booking.customerName}</p>
                    <p className="text-xs text-brand-text-tertiary">
                      {booking.serviceName} -{" "}
                      {new Date(booking.date).toLocaleDateString("en", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <RatingStars rating={booking.rating!} size={12} />
                </div>
                {booking.review && (
                  <p className="mt-2 text-sm text-brand-text-secondary leading-relaxed">
                    &ldquo;{booking.review}&rdquo;
                  </p>
                )}
                {booking.tip !== undefined && booking.tip > 0 && (
                  <p className="mt-1.5 text-xs font-medium text-brand-green">
                    Tip: {formatPrice(booking.tip)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certifications */}
      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-brand-text-secondary">Certifications</h2>
        <div className="rounded-2xl border border-brand-border bg-card">
          {staffMember.certifications.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-brand-text-tertiary">No certifications listed</p>
            </div>
          ) : (
            staffMember.certifications.map((cert, idx) => (
              <div
                key={cert}
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  idx < staffMember.certifications.length - 1 && "border-b border-brand-border"
                )}
              >
                <BadgeCheck size={16} className="shrink-0 text-brand-green" />
                <span className="text-sm text-brand-text-primary">{cert}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Specialties */}
      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-brand-text-secondary">Specialties</h2>
        <div className="flex flex-wrap gap-2">
          {staffMember.specialties.map((spec) => (
            <span
              key={spec}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/15 px-3 py-1.5 text-xs font-medium text-brand-primary"
            >
              <Sparkles size={12} />
              {formatMassageType(spec)}
            </span>
          ))}
        </div>
      </div>

      {/* Language Setting */}
      <div className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">
          {t("language")}
        </h2>
        <div className="rounded-2xl border border-brand-border bg-card">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Languages size={18} className="text-brand-text-tertiary" />
            <span className="flex-1 text-sm text-brand-text-primary">{t("chooseLanguage")}</span>
            <div className="flex flex-wrap gap-1.5">
              {([
                { code: "en" as const, label: "EN" },
                { code: "th" as const, label: "TH" },
                { code: "ko" as const, label: "KO" },
                { code: "ja" as const, label: "JA" },
              ]).map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    language === lang.code
                      ? "bg-brand-primary text-primary-foreground"
                      : "border border-brand-border text-brand-text-secondary hover:bg-brand-bg-tertiary"
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <button
        type="button"
        onClick={handleSignOut}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-border bg-card py-3.5 text-sm font-medium text-brand-coral transition-colors hover:bg-brand-coral/5"
      >
        <LogOut size={16} />
        {t("signOut")}
      </button>

      <p className="mt-4 text-center text-[10px] text-brand-text-tertiary">
        {brandConfig.shopName} Staff Portal
      </p>
    </div>
  )
}
