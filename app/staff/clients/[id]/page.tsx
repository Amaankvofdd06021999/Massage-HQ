"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ChevronLeft, Calendar, Star, StickyNote, AlertTriangle,
  Droplets, Heart, Pin, Plus, Send, ShieldAlert
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/auth-context"
import { useBookings } from "@/lib/data/bookings-store"
import { useNotes } from "@/lib/data/notes-store"
import { useLanguage } from "@/lib/i18n/language-context"
import { customers, formatPrice, formatMassageType } from "@/lib/data/mock-data"
import { BookingCard } from "@/components/shared/booking-card"
import { RatingStars } from "@/components/shared/rating-stars"
import { StatusBadge, bookingStatusVariant } from "@/components/shared/status-badge"
import type { NoteCategory } from "@/lib/types"

type TabKey = "bookings" | "reviews" | "notes"

const categoryConfig: Record<NoteCategory, { label: string; bg: string; text: string; icon: typeof AlertTriangle }> = {
  injury: { label: "Injury", bg: "bg-brand-coral/15", text: "text-brand-coral", icon: AlertTriangle },
  allergy: { label: "Allergy", bg: "bg-brand-blue/15", text: "text-brand-blue", icon: Droplets },
  medical: { label: "Medical", bg: "bg-brand-coral/15", text: "text-brand-coral", icon: Heart },
  warning: { label: "Warning", bg: "bg-red-500/15", text: "text-red-500", icon: ShieldAlert },
  preference: { label: "Preference", bg: "bg-brand-yellow/15", text: "text-brand-yellow", icon: Star },
  general: { label: "General", bg: "bg-brand-bg-tertiary", text: "text-brand-text-secondary", icon: StickyNote },
}

export default function StaffClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { t } = useLanguage()
  const { getBookingsForStaff } = useBookings()
  const { getNotesForCustomer, getPinnedNotes, addNote } = useNotes()

  const [activeTab, setActiveTab] = useState<TabKey>("bookings")
  const [newNoteContent, setNewNoteContent] = useState("")
  const [newNoteCategory, setNewNoteCategory] = useState<NoteCategory>("general")
  const [newNotePinned, setNewNotePinned] = useState(false)
  const [showAddNote, setShowAddNote] = useState(false)

  const customer = customers.find((c) => c.id === id)
  const staffBookings = useMemo(
    () => (user ? getBookingsForStaff(user.id) : []),
    [user, getBookingsForStaff]
  )

  const clientBookings = useMemo(
    () =>
      staffBookings
        .filter((b) => b.customerId === id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [staffBookings, id]
  )

  const clientReviews = useMemo(
    () => clientBookings.filter((b) => b.rating !== undefined),
    [clientBookings]
  )

  const clientNotes = useMemo(
    () => getNotesForCustomer(id),
    [getNotesForCustomer, id]
  )

  const pinnedNotes = useMemo(
    () => getPinnedNotes(id),
    [getPinnedNotes, id]
  )

  const importantFlags = useMemo(
    () =>
      pinnedNotes.filter(
        (n) => n.category === "injury" || n.category === "allergy" || n.category === "medical" || n.category === "warning"
      ),
    [pinnedNotes]
  )

  function handleAddNote() {
    if (!newNoteContent.trim() || !user) return
    addNote({
      customerId: id,
      authorId: user.id,
      authorName: user.name,
      authorRole: "staff",
      content: newNoteContent.trim(),
      category: newNoteCategory,
      isPinned: newNotePinned,
    })
    setNewNoteContent("")
    setNewNoteCategory("general")
    setNewNotePinned(false)
    setShowAddNote(false)
  }

  if (!customer) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-brand-text-secondary">Client not found</p>
      </div>
    )
  }

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "bookings", label: "Bookings", count: clientBookings.length },
    { key: "reviews", label: "Reviews", count: clientReviews.length },
    { key: "notes", label: "Notes", count: clientNotes.length },
  ]

  return (
    <div className="px-5 pb-8 pt-12">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => router.push("/staff/clients")}
        className="mb-4 flex items-center gap-1 text-sm text-brand-text-secondary transition-colors hover:text-brand-text-primary"
      >
        <ChevronLeft size={18} />
        Back to Clients
      </button>

      {/* Client Header */}
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-brand-primary/30">
          <img
            src={customer.avatar}
            alt={customer.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-xl font-bold text-brand-text-primary">{customer.name}</h1>
          <p className="text-sm text-brand-text-secondary">
            Member since {new Date(customer.memberSince).toLocaleDateString("en", { month: "long", year: "numeric" })}
          </p>
          <p className="mt-0.5 text-xs text-brand-text-tertiary">
            {clientBookings.length} booking{clientBookings.length !== 1 ? "s" : ""} with you
          </p>
        </div>
      </div>

      {/* Important Flags */}
      {importantFlags.length > 0 && (
        <div className="mt-4 space-y-2">
          {importantFlags.map((note) => {
            const config = categoryConfig[note.category]
            const Icon = config.icon
            return (
              <div
                key={note.id}
                className={cn(
                  "flex items-start gap-3 rounded-xl p-3",
                  config.bg
                )}
              >
                <Icon size={16} className={cn("mt-0.5 shrink-0", config.text)} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-semibold", config.text)}>
                      {config.label}
                    </span>
                    <Pin size={10} className={config.text} />
                  </div>
                  <p className="mt-0.5 text-sm text-brand-text-primary">{note.content}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tabs */}
      <div className="mt-5 flex gap-1 rounded-2xl border border-brand-border bg-card p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-brand-primary text-primary-foreground"
                : "text-brand-text-secondary hover:text-brand-text-primary"
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={cn(
                  "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                  activeTab === tab.key
                    ? "bg-white/20 text-primary-foreground"
                    : "bg-brand-bg-tertiary text-brand-text-tertiary"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="space-y-3">
            {clientBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-border bg-card/50 py-12">
                <Calendar size={24} className="mb-2 text-brand-text-tertiary" />
                <p className="text-sm text-brand-text-secondary">No bookings yet</p>
              </div>
            ) : (
              clientBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="space-y-3">
            {clientReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-border bg-card/50 py-12">
                <Star size={24} className="mb-2 text-brand-text-tertiary" />
                <p className="text-sm text-brand-text-secondary">No reviews yet</p>
              </div>
            ) : (
              clientReviews.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-brand-border bg-card p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-brand-text-primary">
                        {booking.serviceName}
                      </p>
                      <p className="text-xs text-brand-text-tertiary">
                        {new Date(booking.date).toLocaleDateString("en", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <RatingStars rating={booking.rating!} size={14} />
                  </div>
                  {booking.review && (
                    <p className="mt-2 text-sm text-brand-text-secondary leading-relaxed">
                      &ldquo;{booking.review}&rdquo;
                    </p>
                  )}
                  {booking.tip !== undefined && booking.tip > 0 && (
                    <p className="mt-2 text-xs text-brand-green font-medium">
                      Tip: {formatPrice(booking.tip)}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === "notes" && (
          <div className="space-y-3">
            {/* Add Note Button */}
            {!showAddNote && (
              <button
                type="button"
                onClick={() => setShowAddNote(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-border bg-card/50 py-3 text-sm font-medium text-brand-text-secondary transition-colors hover:border-brand-primary hover:text-brand-primary"
              >
                <Plus size={16} />
                Add Note
              </button>
            )}

            {/* Add Note Form */}
            {showAddNote && (
              <div className="rounded-2xl border border-brand-primary/30 bg-card p-4">
                <h3 className="mb-3 text-sm font-semibold text-brand-text-primary">
                  New Note
                </h3>

                {/* Category Select */}
                <div className="mb-3">
                  <label className="mb-1.5 block text-xs font-medium text-brand-text-secondary">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(categoryConfig) as NoteCategory[]).map((cat) => {
                      const config = categoryConfig[cat]
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewNoteCategory(cat)}
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                            newNoteCategory === cat
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

                {/* Content */}
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Write your note..."
                  rows={3}
                  className="mb-3 w-full rounded-xl border border-brand-border bg-brand-bg-secondary p-3 text-sm text-brand-text-primary placeholder:text-brand-text-tertiary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/30"
                />

                {/* Pin Toggle + Actions */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setNewNotePinned(!newNotePinned)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      newNotePinned
                        ? "bg-brand-primary/15 text-brand-primary"
                        : "bg-brand-bg-tertiary text-brand-text-tertiary"
                    )}
                  >
                    <Pin size={12} />
                    {newNotePinned ? "Pinned" : "Pin note"}
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddNote(false)
                        setNewNoteContent("")
                        setNewNoteCategory("general")
                        setNewNotePinned(false)
                      }}
                      className="rounded-xl px-4 py-2 text-xs font-medium text-brand-text-secondary transition-colors hover:bg-brand-bg-tertiary"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddNote}
                      disabled={!newNoteContent.trim()}
                      className="flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
                    >
                      <Send size={12} />
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notes List */}
            {clientNotes.length === 0 && !showAddNote ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-border bg-card/50 py-12">
                <StickyNote size={24} className="mb-2 text-brand-text-tertiary" />
                <p className="text-sm text-brand-text-secondary">No notes yet</p>
                <p className="mt-1 text-xs text-brand-text-tertiary">
                  Add notes to remember client preferences
                </p>
              </div>
            ) : (
              clientNotes.map((note) => {
                const config = categoryConfig[note.category]
                const Icon = config.icon
                return (
                  <div
                    key={note.id}
                    className="rounded-2xl border border-brand-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                            config.bg,
                            config.text
                          )}
                        >
                          <Icon size={10} />
                          {config.label}
                        </span>
                        {note.isPinned && (
                          <Pin size={12} className="text-brand-primary" />
                        )}
                      </div>
                      <span className="text-[10px] text-brand-text-tertiary">
                        {note.authorName} ({note.authorRole})
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-brand-text-primary leading-relaxed">
                      {note.content}
                    </p>
                    <p className="mt-2 text-[10px] text-brand-text-tertiary">
                      {new Date(note.createdAt).toLocaleDateString("en", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
