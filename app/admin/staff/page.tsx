"use client"

import { useState } from "react"
import { Plus, Edit2, ToggleLeft, ToggleRight, CalendarDays, X, Trash2 } from "lucide-react"
import { StaffAvatar } from "@/components/shared/staff-avatar"
import { RatingDisplay } from "@/components/shared/rating-stars"
import { StatusBadge } from "@/components/shared/status-badge"
import { SearchBar } from "@/components/shared/search-bar"
import {
  staffMembers, getBookingsForStaff,
  staffBlockedDates, getBlockedDatesForStaff,
} from "@/lib/data/mock-data"
import { formatPrice, formatMassageType } from "@/lib/utils/formatters"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"
import type { StaffMember, StaffBlockedDate, DayOfWeek } from "@/lib/types"

const DAYS: DayOfWeek[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
const DAY_LABELS: Record<DayOfWeek, string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
}

// ─── Availability Calendar Modal ─────────────────────────────────────────────
function AvailabilityModal({
  staff,
  onClose,
}: {
  staff: StaffMember
  onClose: () => void
}) {
  const { t } = useLanguage()

  // Local state for blocked dates (starts from mock data)
  const [blocked, setBlocked] = useState<StaffBlockedDate[]>(
    getBlockedDatesForStaff(staff.id)
  )

  // Form state for adding a new block
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    from: "",
    to: "",
    reason: "day-off" as StaffBlockedDate["reason"],
    note: "",
  })

  const addBlock = () => {
    if (!form.from || !form.to) return
    const newBlock: StaffBlockedDate = {
      id: `bd-${Date.now()}`,
      staffId: staff.id,
      from: form.from,
      to: form.to,
      reason: form.reason,
      note: form.note || undefined,
    }
    setBlocked((prev) => [...prev, newBlock])
    setForm({ from: "", to: "", reason: "day-off", note: "" })
    setShowForm(false)
  }

  const removeBlock = (id: string) => {
    setBlocked((prev) => prev.filter((b) => b.id !== id))
  }

  const reasonLabel = (r: StaffBlockedDate["reason"]) => {
    if (r === "vacation") return t("blockVacation")
    if (r === "day-off") return t("blockDayOff")
    return t("blockOther")
  }

  const reasonColor = (r: StaffBlockedDate["reason"]) => {
    if (r === "vacation") return "bg-brand-blue/10 text-brand-blue"
    if (r === "day-off") return "bg-brand-coral/10 text-brand-coral"
    return "bg-brand-bg-tertiary text-brand-text-secondary"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-3xl bg-background shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-brand-border bg-background px-6 py-4">
          <div className="flex items-center gap-3">
            <StaffAvatar src={staff.avatar} name={staff.name} size="sm" />
            <div>
              <p className="font-semibold text-brand-text-primary">{staff.nickname}</p>
              <p className="text-xs text-brand-text-tertiary">{t("availabilityCalendar")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-text-tertiary hover:bg-brand-bg-tertiary"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Weekly Schedule */}
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">
              {t("weeklySchedule")}
            </p>
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map((day) => {
                const slot = staff.availability[day]
                return (
                  <div
                    key={day}
                    className={cn(
                      "flex flex-col items-center rounded-xl p-2 text-center",
                      slot ? "bg-brand-primary/5 border border-brand-primary/20" : "bg-brand-bg-tertiary/50"
                    )}
                  >
                    <span className="text-[10px] font-semibold text-brand-text-tertiary">
                      {DAY_LABELS[day]}
                    </span>
                    {slot ? (
                      <>
                        <span className="mt-1 text-[9px] font-medium text-brand-primary">{slot.start}</span>
                        <span className="text-[9px] text-brand-text-tertiary">{slot.end}</span>
                      </>
                    ) : (
                      <span className="mt-1 text-[9px] text-brand-text-tertiary">{t("closedDay")}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* Blocked Dates */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">
                {t("blockedDates")}
              </p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-transform active:scale-95"
              >
                <Plus size={12} />
                {t("addBlock")}
              </button>
            </div>

            {/* Add block form */}
            {showForm && (
              <div className="mb-3 rounded-2xl border border-brand-primary/30 bg-brand-primary/5 p-4 space-y-3">
                <p className="text-xs font-semibold text-brand-text-primary">{t("blockDateRange")}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-[10px] text-brand-text-tertiary">{t("blockFrom")}</label>
                    <input
                      type="date"
                      value={form.from}
                      onChange={(e) => setForm((p) => ({ ...p, from: e.target.value }))}
                      className="w-full rounded-xl border border-brand-border bg-brand-bg-tertiary/30 px-3 py-2 text-xs text-brand-text-primary focus:border-brand-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] text-brand-text-tertiary">{t("blockTo")}</label>
                    <input
                      type="date"
                      value={form.to}
                      onChange={(e) => setForm((p) => ({ ...p, to: e.target.value }))}
                      className="w-full rounded-xl border border-brand-border bg-brand-bg-tertiary/30 px-3 py-2 text-xs text-brand-text-primary focus:border-brand-primary focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-brand-text-tertiary">{t("blockReason")}</label>
                  <select
                    value={form.reason}
                    onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value as StaffBlockedDate["reason"] }))}
                    className="w-full rounded-xl border border-brand-border bg-brand-bg-tertiary/30 px-3 py-2 text-xs text-brand-text-primary focus:border-brand-primary focus:outline-none"
                  >
                    <option value="day-off">{t("blockDayOff")}</option>
                    <option value="vacation">{t("blockVacation")}</option>
                    <option value="other">{t("blockOther")}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-brand-text-tertiary">{t("optional")}</label>
                  <input
                    type="text"
                    value={form.note}
                    onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                    placeholder="Note…"
                    className="w-full rounded-xl border border-brand-border bg-brand-bg-tertiary/30 px-3 py-2 text-xs text-brand-text-primary placeholder:text-brand-text-tertiary focus:border-brand-primary focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 rounded-xl border border-brand-border py-2 text-xs font-semibold text-brand-text-secondary"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={addBlock}
                    disabled={!form.from || !form.to}
                    className="flex-1 rounded-xl bg-primary py-2 text-xs font-semibold text-primary-foreground disabled:opacity-40"
                  >
                    {t("addBlock")}
                  </button>
                </div>
              </div>
            )}

            {blocked.length === 0 ? (
              <p className="py-4 text-center text-xs text-brand-text-tertiary">{t("noBlockedDates")}</p>
            ) : (
              <div className="space-y-2">
                {blocked.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 rounded-xl border border-brand-border bg-card p-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", reasonColor(b.reason))}>
                          {reasonLabel(b.reason)}
                        </span>
                        {b.note && (
                          <span className="truncate text-[10px] text-brand-text-tertiary">{b.note}</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs font-medium text-brand-text-primary">
                        {b.from === b.to ? b.from : `${b.from} → ${b.to}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBlock(b.id)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-brand-text-tertiary hover:bg-brand-coral/10 hover:text-brand-coral transition-colors"
                      aria-label="Remove block"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminStaffPage() {
  const { t } = useLanguage()
  const [search, setSearch] = useState("")
  const [availability, setAvailability] = useState<Record<string, boolean>>(
    Object.fromEntries(staffMembers.map((s) => [s.id, s.isAvailableToday]))
  )
  const [calendarStaff, setCalendarStaff] = useState<StaffMember | null>(null)

  const filtered = search
    ? staffMembers.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.nickname.toLowerCase().includes(search.toLowerCase())
      )
    : staffMembers

  return (
    <>
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-text-primary">{t("staffManagement")}</h1>
            <p className="mt-1 text-sm text-brand-text-secondary">{staffMembers.length} {t("therapistsCount")}</p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
          >
            <Plus size={16} />
            {t("addStaff")}
          </button>
        </div>

        <SearchBar value={search} onChange={setSearch} placeholder={t("searchStaff")} className="mt-4" />

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {filtered.map((staff) => {
            const staffBookings = getBookingsForStaff(staff.id)
            const completedBookings = staffBookings.filter((b) => b.status === "completed")
            const isAvailable = availability[staff.id]
            const blockedCount = staffBlockedDates.filter((b) => b.staffId === staff.id).length

            return (
              <div key={staff.id} className="rounded-2xl border border-brand-border bg-card p-5">
                <div className="flex items-start gap-4">
                  <StaffAvatar src={staff.avatar} name={staff.name} size="lg" available={isAvailable} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-lg font-semibold text-brand-text-primary">{staff.nickname}</p>
                        <p className="text-xs text-brand-text-tertiary">{staff.name}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setCalendarStaff(staff)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border text-brand-text-tertiary hover:bg-brand-bg-tertiary hover:text-brand-primary transition-colors"
                          aria-label={`View calendar for ${staff.nickname}`}
                          title={t("viewCalendar")}
                        >
                          <CalendarDays size={14} />
                        </button>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border text-brand-text-tertiary hover:bg-brand-bg-tertiary"
                          aria-label="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </div>
                    <RatingDisplay rating={staff.rating} reviews={staff.totalReviews} className="mt-1" />
                  </div>
                </div>

                {/* Specialties */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {staff.specialties.map((sp) => (
                    <span key={sp} className="rounded-full bg-brand-bg-tertiary px-2.5 py-0.5 text-[10px] text-brand-text-secondary">
                      {formatMassageType(sp)}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-brand-bg-tertiary/50 p-2 text-center">
                    <p className="text-sm font-bold text-brand-text-primary">{completedBookings.length}</p>
                    <p className="text-[10px] text-brand-text-tertiary">{t("bookingsLabel")}</p>
                  </div>
                  <div className="rounded-lg bg-brand-bg-tertiary/50 p-2 text-center">
                    <p className="text-sm font-bold text-brand-text-primary">{staff.yearsExperience}yr</p>
                    <p className="text-[10px] text-brand-text-tertiary">{t("experience")}</p>
                  </div>
                  <div className="rounded-lg bg-brand-bg-tertiary/50 p-2 text-center">
                    <p className="text-sm font-bold text-brand-primary">{formatPrice(staff.pricePerHour)}</p>
                    <p className="text-[10px] text-brand-text-tertiary">{t("perHourLabel")}</p>
                  </div>
                </div>

                {/* Availability Toggle + Calendar link */}
                <div className="mt-3 flex items-center justify-between rounded-xl border border-brand-border p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-brand-text-secondary">{t("availableTodayFilter")}</span>
                    {isAvailable && <StatusBadge variant="success" dot>{t("active")}</StatusBadge>}
                  </div>
                  <div className="flex items-center gap-2">
                    {blockedCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setCalendarStaff(staff)}
                        className="text-[10px] text-brand-coral hover:underline"
                      >
                        {blockedCount} {t("blockedDates").toLowerCase()}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setAvailability((prev) => ({ ...prev, [staff.id]: !prev[staff.id] }))
                      }
                      className={cn("transition-colors", isAvailable ? "text-brand-green" : "text-brand-text-tertiary")}
                      aria-label={`Toggle availability for ${staff.nickname}`}
                    >
                      {isAvailable ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {calendarStaff && (
        <AvailabilityModal staff={calendarStaff} onClose={() => setCalendarStaff(null)} />
      )}
    </>
  )
}
