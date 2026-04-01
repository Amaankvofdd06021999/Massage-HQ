"use client"

import { StaffAvatar } from "@/components/shared/staff-avatar"
import { useShopData } from "@/lib/data/shop-data"
import { formatPrice } from "@/lib/utils/formatters"
import { STATUS_STYLES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Booking } from "@/lib/types"
import type { TranslationKey } from "@/lib/i18n/translations"

const hours = Array.from({ length: 13 }, (_, i) => i + 10) // 10:00 - 22:00

interface DayViewProps {
  dayBookings: Booking[]
  currentDate: Date
  t: (key: TranslationKey) => string
}

export function DayView({ dayBookings, currentDate, t }: DayViewProps) {
  const { staffMembers } = useShopData()

  return (
    <>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-brand-border">
        <div className="min-w-[800px]">
          {/* Header - Staff columns */}
          <div className="flex border-b border-brand-border bg-card">
            <div className="w-16 shrink-0 border-r border-brand-border p-2" />
            {staffMembers.map((staff) => (
              <div
                key={staff.id}
                className="flex flex-1 items-center gap-2 border-r border-brand-border p-3 last:border-r-0"
              >
                <StaffAvatar src={staff.avatar} name={staff.name} size="sm" available={staff.isAvailableToday} />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-brand-text-primary">{staff.nickname}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Time rows */}
          {hours.map((hour) => (
            <div key={hour} className="flex border-b border-brand-border last:border-b-0">
              <div className="flex w-16 shrink-0 items-start justify-end border-r border-brand-border px-2 py-1">
                <span className="text-[10px] text-brand-text-tertiary">{hour}:00</span>
              </div>
              {staffMembers.map((staff) => {
                const booking = dayBookings.find(
                  (b) => b.staffId === staff.id && parseInt(b.startTime.split(":")[0]) === hour
                )
                return (
                  <div
                    key={staff.id}
                    className="relative flex-1 border-r border-brand-border p-1 last:border-r-0"
                    style={{ minHeight: "48px" }}
                  >
                    {booking && (
                      <div
                        className={cn(
                          "rounded-lg p-1.5 text-[10px]",
                          STATUS_STYLES[booking.status]
                        )}
                        style={{ minHeight: `${(booking.duration / 60) * 48}px` }}
                      >
                        <p className="font-semibold">{booking.customerName}</p>
                        <p className="opacity-75">{booking.serviceName}</p>
                        <p>
                          {booking.startTime}–{booking.endTime}
                        </p>
                        <p className="mt-0.5 font-medium">{formatPrice(booking.price)}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-brand-text-tertiary">
        {dayBookings.length} {t("bookingsFor")}{" "}
        {currentDate.toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long" })}
      </p>
    </>
  )
}
