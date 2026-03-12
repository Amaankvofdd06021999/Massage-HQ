"use client"

import Link from "next/link"
import { Check, Clock, Calendar, CreditCard, Package, DoorOpen, Clock3, Gift, Wallet } from "lucide-react"
import { StaffAvatar } from "@/components/shared/staff-avatar"
import { useLanguage } from "@/lib/i18n/language-context"
import { formatPrice } from "@/lib/utils/formatters"
import { cn } from "@/lib/utils"
import type { StaffMember, ServiceOption, MassageRoom, ServiceAddOn } from "@/lib/types"

interface DateInfo {
  label: string
  date: string
  dayNum: number
  month: string
}

interface ConfirmationStepProps {
  selectedService: ServiceOption | null
  selectedStaff: StaffMember | null
  selectedDuration: number | null
  selectedDate: number
  selectedTime: string | null
  selectedRoom: MassageRoom | null
  selectedAddOns: ServiceAddOn[]
  dates: DateInfo[]
  basePrice: number
  addOnTotal: number
  totalPrice: number
  activePromo: { id: string; promotionTitle: string } | null
  giftCardBalance: number
  useGiftCard: boolean
  onToggleGiftCard: () => void
  isBooked: boolean
}

export function ConfirmationStep({
  selectedService,
  selectedStaff,
  selectedDuration,
  selectedDate,
  selectedTime,
  selectedRoom,
  selectedAddOns,
  dates,
  basePrice,
  addOnTotal,
  totalPrice,
  activePromo,
  giftCardBalance,
  useGiftCard,
  onToggleGiftCard,
  isBooked,
}: ConfirmationStepProps) {
  const { t } = useLanguage()

  if (isBooked) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-5 pb-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-yellow/20">
          <Clock3 size={40} className="text-brand-yellow" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-brand-text-primary">{t("requestSentTitle")}</h1>
        <p className="mt-2 text-sm text-brand-text-secondary">
          {selectedService?.name} {t("with")} {selectedStaff?.nickname} {t("confirmedDesc")}{" "}
          {dates[selectedDate].label} {t("confirmedAt")} {selectedTime}
          {selectedRoom ? ` ${t("confirmedIn")} ${selectedRoom.name}` : ""}.
        </p>
        {selectedAddOns.length > 0 && (
          <p className="mt-1 text-xs text-brand-text-tertiary">
            + {selectedAddOns.map((a) => a.name).join(", ")}
          </p>
        )}
        {activePromo ? (
          <div className="mt-4">
            <p className="text-sm text-brand-green font-semibold">{t("coveredByPromotion")}</p>
            <p className="text-xs text-brand-text-tertiary">{activePromo.promotionTitle}</p>
            <p className="mt-1 text-xl font-bold text-brand-green">{formatPrice(0)}</p>
          </div>
        ) : useGiftCard && giftCardBalance > 0 ? (
          <div className="mt-4">
            <p className="text-sm line-through text-brand-text-tertiary">{formatPrice(totalPrice)}</p>
            <p className="text-xs text-brand-blue">{t("giftCardDeduction")}: -{formatPrice(Math.min(giftCardBalance, totalPrice))}</p>
            <p className="mt-1 text-xl font-bold text-brand-primary">{formatPrice(Math.max(0, totalPrice - giftCardBalance))}</p>
          </div>
        ) : (
          <p className="mt-4 text-xl font-bold text-brand-primary">{formatPrice(totalPrice)}</p>
        )}
        <p className="mt-3 rounded-xl bg-brand-yellow/10 border border-brand-yellow/30 px-4 py-2.5 text-xs text-brand-yellow">
          {t("pendingApprovalNote")}
        </p>
        <Link
          href="/bookings"
          className="mt-8 inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-brand-yellow px-8 py-3.5 text-sm font-bold text-black"
        >
          {t("viewMyBookings")}
        </Link>
        <Link href="/" className="mt-3 text-sm text-brand-text-secondary">
          {t("backToHome")}
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-6 px-5 page-transition">
      <h2 className="text-lg font-bold text-brand-text-primary">{t("confirmBooking")}</h2>
      <p className="mt-1 text-sm text-brand-text-secondary">{t("reviewBookingDetails")}</p>

      <div className="mt-4 rounded-2xl border border-brand-border bg-card p-5">
        <div className="flex items-center gap-3">
          {selectedStaff && <StaffAvatar src={selectedStaff.avatar} name={selectedStaff.name} size="lg" />}
          <div>
            <p className="font-semibold text-brand-text-primary">{selectedStaff?.nickname}</p>
            <p className="text-xs text-brand-text-tertiary">{selectedStaff?.name}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-brand-text-secondary"><CreditCard size={14} /> {t("serviceLabel")}</span>
            <span className="font-medium text-brand-text-primary">{selectedService?.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-brand-text-secondary"><Clock size={14} /> {t("durationLabel")}</span>
            <span className="font-medium text-brand-text-primary">{selectedDuration} {t("minutes")}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-brand-text-secondary"><Calendar size={14} /> {t("dateLabel")}</span>
            <span className="font-medium text-brand-text-primary">{dates[selectedDate].label}, {dates[selectedDate].date}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-brand-text-secondary"><Clock size={14} /> {t("timeLabel")}</span>
            <span className="font-medium text-brand-text-primary">{selectedTime}</span>
          </div>
          {selectedRoom && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-brand-text-secondary"><DoorOpen size={14} /> {t("roomBedLabel")}</span>
              <span className="font-medium text-brand-text-primary">{selectedRoom.name}</span>
            </div>
          )}

          {selectedAddOns.length > 0 && (
            <>
              <div className="border-t border-brand-border pt-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-brand-text-secondary">
                  <Package size={13} /> {t("addons")}
                </p>
                {selectedAddOns.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-sm py-0.5">
                    <span className="text-brand-text-secondary">{a.name}</span>
                    <span className="font-medium text-brand-text-primary">+{formatPrice(a.price)}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Promotion deduction */}
          {activePromo ? (
            <div className="rounded-xl border border-brand-green/20 bg-brand-green/10 p-3">
              <div className="flex items-center gap-2">
                <Gift size={14} className="text-brand-green" />
                <p className="text-sm font-semibold text-brand-green">{t("coveredByPromotion")}</p>
              </div>
              <p className="mt-0.5 text-xs text-brand-text-secondary">{activePromo.promotionTitle}</p>
            </div>
          ) : null}

          {/* Gift card option */}
          {!activePromo && giftCardBalance > 0 && (
            <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/10 p-3">
              <button
                type="button"
                onClick={onToggleGiftCard}
                className="flex w-full items-center gap-2 text-left"
              >
                <div className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                  useGiftCard
                    ? "border-brand-blue bg-brand-blue text-white"
                    : "border-brand-border"
                )}>
                  {useGiftCard && <Check size={10} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <Wallet size={14} className="text-brand-blue" />
                    <p className="text-sm font-semibold text-brand-blue">{t("useGiftCardBalance")}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-brand-text-secondary">
                    {t("availableBalance")}: {formatPrice(giftCardBalance)}
                  </p>
                </div>
              </button>
            </div>
          )}

          <div className="border-t border-brand-border pt-3 space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-brand-text-secondary">{t("baseprice")}</span>
              <span className="text-brand-text-primary">{formatPrice(basePrice)}</span>
            </div>
            {addOnTotal > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-text-secondary">{t("addons")}</span>
                <span className="text-brand-text-primary">+{formatPrice(addOnTotal)}</span>
              </div>
            )}
            {activePromo && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-green">{t("promoDiscount")}</span>
                <span className="font-medium text-brand-green">-{formatPrice(totalPrice)}</span>
              </div>
            )}
            {!activePromo && useGiftCard && giftCardBalance > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-blue">{t("giftCardDeduction")}</span>
                <span className="font-medium text-brand-blue">-{formatPrice(Math.min(giftCardBalance, totalPrice))}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1">
              <span className="font-semibold text-brand-text-primary">{t("total")}</span>
              <span className="text-lg font-bold text-brand-primary">
                {formatPrice(
                  activePromo
                    ? 0
                    : useGiftCard
                    ? Math.max(0, totalPrice - giftCardBalance)
                    : totalPrice
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
