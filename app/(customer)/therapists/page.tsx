"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Filter, ArrowUpDown } from "lucide-react"
import { SearchBar } from "@/components/shared/search-bar"
import { PillButton, PillButtonRow } from "@/components/shared/pill-button"
import { StaffAvatar } from "@/components/shared/staff-avatar"
import { RatingDisplay } from "@/components/shared/rating-stars"
import { StatusBadge } from "@/components/shared/status-badge"
import { staffMembers, formatPrice, formatMassageType } from "@/lib/data/mock-data"
import { useLanguage } from "@/lib/i18n/language-context"
import type { MassageType } from "@/lib/types"

type SortOption = "rating" | "price-low" | "price-high" | "experience"

export default function StaffPage() {
  const { t } = useLanguage()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<MassageType | "all">("all")
  const [sort, setSort] = useState<SortOption>("rating")
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)

  const massageTypes: { value: MassageType | "all"; label: string }[] = [
    { value: "all", label: t("allTypes") },
    { value: "thai", label: t("massageThai") },
    { value: "swedish", label: t("massageSwedish") },
    { value: "deep-tissue", label: t("massageDeepTissue") },
    { value: "aromatherapy", label: t("massageAromatherapy") },
    { value: "hot-stone", label: t("massageHotStone") },
    { value: "sports", label: t("massageSports") },
    { value: "reflexology", label: t("massageReflexology") },
    { value: "shiatsu", label: t("massageShiatsu") },
  ]

  const filtered = useMemo(() => {
    let result = staffMembers

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.nickname.toLowerCase().includes(q) ||
          s.specialties.some((sp) => sp.includes(q))
      )
    }

    if (typeFilter !== "all") {
      result = result.filter((s) => s.specialties.includes(typeFilter))
    }

    if (showAvailableOnly) {
      result = result.filter((s) => s.isAvailableToday)
    }

    result = [...result].sort((a, b) => {
      switch (sort) {
        case "rating": return b.rating - a.rating
        case "price-low": return a.pricePerHour - b.pricePerHour
        case "price-high": return b.pricePerHour - a.pricePerHour
        case "experience": return b.yearsExperience - a.yearsExperience
        default: return 0
      }
    })

    return result
  }, [search, typeFilter, sort, showAvailableOnly])

  const sortLabels: Record<SortOption, string> = {
    rating: t("sortRating"),
    "price-low": t("sortPriceLow"),
    "price-high": t("sortPriceHigh"),
    experience: t("sortExperience"),
  }

  return (
    <div className="px-5 pb-8 pt-12">
      <h1 className="text-2xl font-bold text-brand-text-primary">{t("ourTherapists")}</h1>
      <p className="mt-1 text-sm text-brand-text-secondary">{staffMembers.length} {t("expertTherapists")}</p>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={t("searchByNameOrSpecialty")}
        className="mt-4"
      />

      <PillButtonRow className="mt-4">
        {massageTypes.map((mt) => (
          <PillButton
            key={mt.value}
            active={typeFilter === mt.value}
            onClick={() => setTypeFilter(mt.value)}
          >
            {mt.label}
          </PillButton>
        ))}
      </PillButtonRow>

      <div className="mt-3 flex items-center gap-2">
        <PillButton
          active={showAvailableOnly}
          onClick={() => setShowAvailableOnly(!showAvailableOnly)}
        >
          <Filter size={14} className="mr-1" />
          {t("availableTodayFilter")}
        </PillButton>
        <div className="ml-auto flex gap-1">
          {(["rating", "price-low", "price-high", "experience"] as SortOption[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSort(s)}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] transition-colors ${
                sort === s
                  ? "bg-brand-primary/15 text-brand-primary"
                  : "text-brand-text-tertiary hover:text-brand-text-secondary"
              }`}
            >
              <ArrowUpDown size={10} />
              {sortLabels[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {filtered.map((staff) => (
          <Link
            key={staff.id}
            href={`/therapists/${staff.id}`}
            className="flex gap-4 rounded-2xl border border-brand-border bg-card p-4 transition-all card-press"
          >
            <StaffAvatar
              src={staff.avatar}
              name={staff.name}
              size="lg"
              available={staff.isAvailableToday}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-brand-text-primary">{staff.nickname}</p>
                  <p className="text-xs text-brand-text-tertiary">{staff.name}</p>
                </div>
                {staff.isAvailableToday && (
                  <StatusBadge variant="success" dot>{t("todayBadge")}</StatusBadge>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {staff.specialties.slice(0, 3).map((sp) => (
                  <span
                    key={sp}
                    className="rounded-full bg-brand-bg-tertiary px-2 py-0.5 text-[10px] text-brand-text-secondary"
                  >
                    {formatMassageType(sp)}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RatingDisplay rating={staff.rating} reviews={staff.totalReviews} />
                  <span className="text-xs text-brand-text-tertiary">{staff.yearsExperience}{t("yrExp")}</span>
                </div>
                <p className="text-sm font-semibold text-brand-primary">{formatPrice(staff.pricePerHour)}/hr</p>
              </div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-brand-text-tertiary">{t("noTherapistsFound")}</p>
          </div>
        )}
      </div>
    </div>
  )
}
