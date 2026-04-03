"use client"

import { useState } from "react"
import { Phone } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"
import { usePhoneBooking } from "@/hooks/use-phone-booking"
import { useShopData } from "@/lib/data/shop-data"
import { CustomerSearch } from "@/components/admin/phone-booking/customer-search"
import { CustomerQuickCreate } from "@/components/admin/phone-booking/customer-quick-create"
import { CustomerInfoCard } from "@/components/admin/phone-booking/customer-info-card"
import { SessionCard } from "@/components/admin/phone-booking/session-card"
import { BookingSummary } from "@/components/admin/phone-booking/booking-summary"
import { SuccessScreen } from "@/components/admin/phone-booking/success-screen"
import { ClientNotesPanel } from "@/components/admin/client-notes-panel"

export default function PhoneBookingPage() {
  const { t } = useLanguage()
  const { staffMembers } = useShopData()
  const [notesPanelOpen, setNotesPanelOpen] = useState(false)

  const {
    selectedCustomer, setSelectedCustomer,
    showNewCustomer, setShowNewCustomer,
    sessions, updateSession, removeSession, addSession,
    getTentativeBookingsForDate,
    callNotes, setCallNotes,
    isConfirming, confirmAllBookings,
    successData, resetForm,
    services, addOns, allBookings,
  } = usePhoneBooking()

  // Success screen
  if (successData) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <SuccessScreen
          bookingCount={successData.bookingCount}
          customerName={successData.customerName}
          guestCount={successData.guestCount}
          firstDate={successData.firstDate}
          onNewBooking={resetForm}
        />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <Phone className="w-6 h-6 text-brand-primary" />
        <h1 className="text-xl font-bold text-brand-text-primary">{t("phoneBookingTitle")}</h1>
      </div>

      {/* Section 1: Customer */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold">1</span>
          <span className="text-sm font-semibold text-brand-text-primary">{t("navCustomers")}</span>
        </div>

        {!selectedCustomer && !showNewCustomer && (
          <>
            <CustomerSearch
              onSelect={(customer) => {
                setSelectedCustomer(customer)
                setShowNewCustomer(false)
              }}
              onNewClick={() => setShowNewCustomer(true)}
            />
            <div className="mt-3 rounded-lg border border-brand-border bg-brand-bg-secondary p-3 text-sm text-brand-text-secondary italic text-center">
              {t("phoneBookingNoCustomer")}
            </div>
          </>
        )}

        {showNewCustomer && !selectedCustomer && (
          <CustomerQuickCreate
            onCreated={(customer) => {
              setSelectedCustomer(customer)
              setShowNewCustomer(false)
            }}
            onCancel={() => setShowNewCustomer(false)}
          />
        )}

        {selectedCustomer && (
          <CustomerInfoCard
            customer={selectedCustomer}
            onClear={() => setSelectedCustomer(null)}
          />
        )}
      </div>

      {/* Section 2: Sessions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold">2</span>
            <span className="text-sm font-semibold text-brand-text-primary">{t("phoneBookingSessions")}</span>
          </div>
          <button
            onClick={addSession}
            className="text-xs text-brand-primary border border-brand-border rounded-lg px-3 py-1.5 hover:bg-brand-bg-secondary transition-colors"
          >
            {t("phoneBookingAddSession")}
          </button>
        </div>

        <div className="space-y-3">
          {sessions.map((session, i) => (
            <SessionCard
              key={session.id}
              session={session}
              sessionIndex={i}
              services={services}
              addOns={addOns}
              staff={staffMembers}
              allBookings={allBookings}
              tentativeBookingsForDate={getTentativeBookingsForDate(session.date, session.id)}
              onUpdate={updateSession}
              onRemove={removeSession}
            />
          ))}
        </div>
      </div>

      {/* Section 3: Notes & Confirm */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold">3</span>
          <span className="text-sm font-semibold text-brand-text-primary">{t("phoneBookingCallNotes")} & {t("confirm")}</span>
        </div>

        <BookingSummary
          sessions={sessions}
          addOns={addOns}
          callNotes={callNotes}
          onCallNotesChange={setCallNotes}
          onOpenNotesPanel={() => setNotesPanelOpen(true)}
          onConfirm={confirmAllBookings}
          isConfirming={isConfirming}
        />
      </div>

      {/* Client Notes Panel (side sheet) */}
      {selectedCustomer && (
        <ClientNotesPanel
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.name}
          open={notesPanelOpen}
          onOpenChange={setNotesPanelOpen}
        />
      )}
    </div>
  )
}
