"use client"

import { useRouter } from "next/navigation"
import { Calendar, User } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

interface SuccessScreenProps {
  bookingCount: number
  customerName: string
  guestCount: number
  firstDate: string
  onNewBooking: () => void
}

export function SuccessScreen({ bookingCount, customerName, guestCount, firstDate, onNewBooking }: SuccessScreenProps) {
  const { t } = useLanguage()
  const router = useRouter()

  return (
    <div className="py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4 text-3xl text-white">
        ✓
      </div>
      <div className="text-xl font-semibold text-brand-text-primary mb-1">
        {bookingCount} {t("phoneBookingBookingsConfirmed")}
      </div>
      <div className="text-sm text-brand-text-secondary mb-6">
        {t("phoneBookingFor")} {customerName}
        {guestCount > 0 && ` + ${guestCount} ${t("phoneBookingPlusGuests")}`}
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={() => router.push(`/admin/calendar?date=${firstDate}`)}
          className="px-4 py-2 rounded-lg border border-brand-border bg-brand-bg-secondary text-brand-primary text-sm flex items-center gap-2 hover:bg-brand-bg-primary transition-colors"
        >
          <Calendar className="w-4 h-4" /> {t("phoneBookingViewCalendar")}
        </button>
        <button
          onClick={() => router.push("/admin/customers")}
          className="px-4 py-2 rounded-lg border border-brand-border bg-brand-bg-secondary text-brand-primary text-sm flex items-center gap-2 hover:bg-brand-bg-primary transition-colors"
        >
          <User className="w-4 h-4" /> {t("phoneBookingViewCustomer")}
        </button>
        <button
          onClick={onNewBooking}
          className="px-6 py-2 rounded-lg bg-brand-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          📞 {t("phoneBookingNewBooking")}
        </button>
      </div>
    </div>
  )
}
