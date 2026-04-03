"use client"

import { Customer, Booking, ClientNote, StaffMember } from "@/lib/types"
import { useLanguage } from "@/lib/i18n/language-context"
import { useBookings } from "@/lib/data/bookings-store"
import { useNotes } from "@/lib/data/notes-store"
import { useShopData } from "@/lib/data/shop-data"
import { formatPrice } from "@/lib/utils/formatters"
import { X } from "lucide-react"

interface CustomerInfoCardProps {
  customer: Customer
  onClear: () => void
}

export function CustomerInfoCard({ customer, onClear }: CustomerInfoCardProps) {
  const { t } = useLanguage()
  const { bookings } = useBookings()
  const { getNotesForCustomer } = useNotes()
  const { staffMembers } = useShopData()

  // Get customer's bookings sorted by date desc
  const customerBookings = bookings
    .filter(b => b.customerId === customer.id && b.status === "completed")
    .sort((a, b) => b.date.localeCompare(a.date))

  const lastBooking = customerBookings[0]

  // Get notes for alert badges
  const allNotes = getNotesForCustomer(customer.id)
  const injuryNotes = allNotes.filter(n => n.category === "injury" || n.category === "warning" || n.category === "allergy" || n.category === "medical")

  // Resolve preferred therapist ID to display name
  const preferredTherapist = (() => {
    if (customer.preferredStaff.length === 0) return t("phoneBookingNone")
    const staffMember = staffMembers.find(s => s.id === customer.preferredStaff[0])
    return staffMember?.nickname || staffMember?.name || t("phoneBookingNone")
  })()

  const initials = customer.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="rounded-xl border border-brand-border bg-brand-bg-secondary overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-11 h-11 rounded-full bg-brand-primary flex items-center justify-center text-white text-base font-semibold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-brand-text-primary">{customer.name}</div>
          <div className="text-xs text-brand-text-secondary">
            {customer.membershipNumber} · {t("phoneBookingMemberSince")} {customer.memberSince}
          </div>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-red-500 hover:text-red-400 transition-colors flex items-center gap-1"
        >
          <X className="w-3 h-3" /> {t("phoneBookingClearCustomer")}
        </button>
      </div>

      {/* Quick stats */}
      <div className="flex border-t border-brand-border text-xs">
        <div className="flex-1 px-3 py-2.5 text-center border-r border-brand-border">
          <div className="text-brand-text-secondary">{t("phoneBookingVisits")}</div>
          <div className="font-semibold text-brand-text-primary">{customer.totalBookings}</div>
        </div>
        <div className="flex-1 px-3 py-2.5 text-center border-r border-brand-border">
          <div className="text-brand-text-secondary">{t("phoneBookingSpent")}</div>
          <div className="font-semibold text-brand-text-primary">{formatPrice(customer.totalSpent)}</div>
        </div>
        <div className="flex-1 px-3 py-2.5 text-center border-r border-brand-border">
          <div className="text-brand-text-secondary">{t("phoneBookingLoyalty")}</div>
          <div className="font-semibold text-brand-text-primary">{customer.loyaltyStamps} stamps</div>
        </div>
        <div className="flex-1 px-3 py-2.5 text-center">
          <div className="text-brand-text-secondary">{t("phoneBookingPreferred")}</div>
          <div className="font-semibold text-brand-text-primary truncate">{preferredTherapist}</div>
        </div>
      </div>

      {/* Alert badges */}
      {(injuryNotes.length > 0 || customer.massagePreferences) && (
        <div className="border-t border-brand-border px-4 py-2.5 flex gap-1.5 flex-wrap">
          {injuryNotes.map(note => (
            <span key={note.id} className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full text-xs">
              ⚠ {note.content.slice(0, 30)}{note.content.length > 30 ? "..." : ""}
            </span>
          ))}
          {customer.massagePreferences?.pressurePreference && (
            <span className="bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full text-xs">
              Pressure: {customer.massagePreferences.pressurePreference}
            </span>
          )}
          {customer.preferredServices.length > 0 && (
            <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full text-xs">
              Fav: {customer.preferredServices[0]}
            </span>
          )}
        </div>
      )}

      {/* Last visit */}
      {lastBooking && (
        <div className="border-t border-brand-border px-4 py-2.5 text-xs text-brand-text-secondary">
          {t("phoneBookingLastVisit")}: {lastBooking.date} — {lastBooking.serviceName} {lastBooking.duration}min with {lastBooking.staffName}
          {" · "}
          <button className="text-brand-primary hover:underline">
            {t("phoneBookingViewHistory")} →
          </button>
        </div>
      )}
    </div>
  )
}
