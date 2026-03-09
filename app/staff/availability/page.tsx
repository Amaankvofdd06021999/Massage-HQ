"use client"

import { useState, useMemo } from "react"
import {
  Clock, CalendarOff, Plus, X, Palmtree, Coffee, HelpCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/auth-context"
import { useLanguage } from "@/lib/i18n/language-context"
import { staffMembers, getBlockedDatesForStaff } from "@/lib/data/mock-data"
import type { DayOfWeek, StaffBlockedDate } from "@/lib/types"

const dayLabels: Record<DayOfWeek, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
}

const dayOrder: DayOfWeek[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]

const reasonConfig = {
  vacation: { label: "Vacation", bg: "bg-brand-blue/15", text: "text-brand-blue", icon: Palmtree },
  "day-off": { label: "Day Off", bg: "bg-brand-coral/15", text: "text-brand-coral", icon: Coffee },
  other: { label: "Other", bg: "bg-brand-bg-tertiary", text: "text-brand-text-secondary", icon: HelpCircle },
}

export default function StaffAvailabilityPage() {
  const { user } = useAuth()
  const { t } = useLanguage()

  const staffMember = staffMembers.find((s) => s.id === user?.id)
  const blockedDates = useMemo(
    () => (user ? getBlockedDatesForStaff(user.id) : []),
    [user]
  )

  // Local state for added blocks (UI only, not persisted)
  const [localBlocks, setLocalBlocks] = useState<StaffBlockedDate[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newFrom, setNewFrom] = useState("")
  const [newTo, setNewTo] = useState("")
  const [newReason, setNewReason] = useState<"vacation" | "day-off" | "other">("day-off")
  const [newNote, setNewNote] = useState("")

  const allBlockedDates = [...blockedDates, ...localBlocks]

  function handleAddBlock() {
    if (!newFrom || !newTo || !user) return
    const block: StaffBlockedDate = {
      id: `bd-local-${Date.now()}`,
      staffId: user.id,
      from: newFrom,
      to: newTo,
      reason: newReason,
      note: newNote || undefined,
    }
    setLocalBlocks((prev) => [...prev, block])
    setNewFrom("")
    setNewTo("")
    setNewReason("day-off")
    setNewNote("")
    setShowAddForm(false)
  }

  if (!staffMember) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-brand-text-secondary">Staff member not found</p>
      </div>
    )
  }

  return (
    <div className="px-5 pb-24 pt-12">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/15">
          <Clock size={20} className="text-brand-primary" />
        </div>
        <h1 className="text-xl font-bold text-brand-text-primary">My Availability</h1>
      </div>

      {/* Weekly Schedule */}
      <div className="mt-5">
        <h2 className="mb-3 text-sm font-semibold text-brand-text-secondary">Weekly Schedule</h2>
        <div className="rounded-2xl border border-brand-border bg-card">
          {dayOrder.map((day, idx) => {
            const slot = staffMember.availability[day]
            return (
              <div
                key={day}
                className={cn(
                  "flex items-center justify-between px-4 py-3",
                  idx < dayOrder.length - 1 && "border-b border-brand-border"
                )}
              >
                <span className="text-sm font-medium text-brand-text-primary">
                  {dayLabels[day]}
                </span>
                {slot ? (
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-brand-green/15 px-2.5 py-0.5 text-xs font-medium text-brand-green">
                      {slot.start}
                    </span>
                    <span className="text-xs text-brand-text-tertiary">-</span>
                    <span className="rounded-full bg-brand-green/15 px-2.5 py-0.5 text-xs font-medium text-brand-green">
                      {slot.end}
                    </span>
                  </div>
                ) : (
                  <span className="rounded-full bg-brand-bg-tertiary px-3 py-0.5 text-xs font-medium text-brand-text-tertiary">
                    Closed
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Blocked Dates */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-brand-text-secondary">Blocked Dates</h2>
          {!showAddForm && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1 rounded-lg bg-brand-primary/15 px-3 py-1.5 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-primary/25"
            >
              <Plus size={14} />
              Add Block
            </button>
          )}
        </div>

        {/* Add Block Form */}
        {showAddForm && (
          <div className="mb-4 rounded-2xl border border-brand-primary/30 bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-brand-text-primary">New Block</h3>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-brand-text-tertiary hover:text-brand-text-primary"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-brand-text-secondary">
                  From
                </label>
                <input
                  type="date"
                  value={newFrom}
                  onChange={(e) => setNewFrom(e.target.value)}
                  className="h-10 w-full rounded-xl border border-brand-border bg-brand-bg-secondary px-3 text-sm text-brand-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-brand-text-secondary">
                  To
                </label>
                <input
                  type="date"
                  value={newTo}
                  onChange={(e) => setNewTo(e.target.value)}
                  className="h-10 w-full rounded-xl border border-brand-border bg-brand-bg-secondary px-3 text-sm text-brand-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/30"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="mb-1.5 block text-xs font-medium text-brand-text-secondary">
                Reason
              </label>
              <div className="flex gap-2">
                {(["vacation", "day-off", "other"] as const).map((reason) => {
                  const config = reasonConfig[reason]
                  return (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setNewReason(reason)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                        newReason === reason
                          ? cn(config.bg, config.text, "ring-1 ring-current")
                          : "bg-brand-bg-tertiary text-brand-text-tertiary hover:text-brand-text-secondary"
                      )}
                    >
                      {config.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-brand-text-secondary">
                Note (optional)
              </label>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="e.g., Family trip..."
                className="h-10 w-full rounded-xl border border-brand-border bg-brand-bg-secondary px-3 text-sm text-brand-text-primary placeholder:text-brand-text-tertiary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/30"
              />
            </div>

            <button
              type="button"
              onClick={handleAddBlock}
              disabled={!newFrom || !newTo}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
            >
              Add Blocked Dates
            </button>
          </div>
        )}

        {/* Blocked Dates List */}
        {allBlockedDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-border bg-card/50 py-10">
            <CalendarOff size={24} className="mb-2 text-brand-text-tertiary" />
            <p className="text-sm text-brand-text-secondary">No blocked dates</p>
            <p className="mt-1 text-xs text-brand-text-tertiary">
              Your schedule is fully open
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allBlockedDates
              .sort((a, b) => a.from.localeCompare(b.from))
              .map((block) => {
                const config = reasonConfig[block.reason]
                const Icon = config.icon
                const isSingleDay = block.from === block.to
                return (
                  <div
                    key={block.id}
                    className="flex items-center gap-3 rounded-2xl border border-brand-border bg-card p-4"
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        config.bg
                      )}
                    >
                      <Icon size={18} className={config.text} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", config.bg, config.text)}>
                          {config.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-brand-text-primary">
                        {isSingleDay
                          ? new Date(block.from + "T00:00:00").toLocaleDateString("en", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })
                          : `${new Date(block.from + "T00:00:00").toLocaleDateString("en", {
                              month: "short",
                              day: "numeric",
                            })} - ${new Date(block.to + "T00:00:00").toLocaleDateString("en", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}`}
                      </p>
                      {block.note && (
                        <p className="mt-0.5 text-xs text-brand-text-tertiary">{block.note}</p>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
