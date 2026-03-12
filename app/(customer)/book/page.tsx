"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Check, ChevronRight, Calendar, User, CreditCard } from "lucide-react"
import { ServiceStep } from "@/components/booking/service-step"
import { TherapistStep } from "@/components/booking/therapist-step"
import { DateTimeStep } from "@/components/booking/datetime-step"
import { ConfirmationStep } from "@/components/booking/confirmation-step"
import { useBookingFlow } from "@/hooks/use-booking-flow"
import { useLanguage } from "@/lib/i18n/language-context"
import { formatPrice } from "@/lib/utils/formatters"
import { cn } from "@/lib/utils"

function BookingFlowInner() {
  const searchParams = useSearchParams()
  const { t } = useLanguage()

  const bk = useBookingFlow(
    searchParams.get("service"),
    searchParams.get("staff"),
    searchParams.get("time"),
  )

  const steps = [
    { id: 1, label: t("stepService"), icon: CreditCard },
    { id: 2, label: t("stepTherapist"), icon: User },
    { id: 3, label: t("stepDateTime"), icon: Calendar },
    { id: 4, label: t("stepConfirm"), icon: Check },
  ]

  if (bk.isBooked) {
    return (
      <ConfirmationStep
        selectedService={bk.selectedService}
        selectedStaff={bk.selectedStaff}
        selectedDuration={bk.selectedDuration}
        selectedDate={bk.selectedDate}
        selectedTime={bk.selectedTime}
        selectedRoom={bk.selectedRoom}
        selectedAddOns={bk.selectedAddOns}
        dates={bk.dates}
        basePrice={bk.basePrice}
        addOnTotal={bk.addOnTotal}
        totalPrice={bk.totalPrice}
        activePromo={bk.activePromo}
        giftCardBalance={bk.giftCardBalance}
        useGiftCard={bk.useGiftCard}
        onToggleGiftCard={() => bk.setUseGiftCard(!bk.useGiftCard)}
        isBooked={true}
      />
    )
  }

  return (
    <div className="pb-44 pt-12">
      {/* Header */}
      <div className="flex items-center gap-3 px-5">
        <button
          type="button"
          onClick={() => (bk.step > 1 ? bk.setStep(bk.step - 1) : window.history.back())}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-bg-secondary"
          aria-label={t("back")}
        >
          <ArrowLeft size={18} className="text-brand-text-primary" />
        </button>
        <h1 className="text-lg font-bold text-brand-text-primary">{t("bookASession")}</h1>
      </div>

      {/* Progress */}
      <div className="mt-5 flex items-center gap-1 px-5">
        {steps.map((s) => (
          <div key={s.id} className="flex flex-1 items-center gap-1">
            <div
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-500",
                s.id <= bk.step ? "bg-brand-primary" : "bg-brand-border"
              )}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between px-5">
        {steps.map((s) => (
          <span
            key={s.id}
            className={cn(
              "text-[10px] font-medium transition-colors",
              s.id <= bk.step ? "text-brand-primary" : "text-brand-text-tertiary"
            )}
          >
            {s.label}
          </span>
        ))}
      </div>

      {/* Step content */}
      {bk.step === 1 && (
        <ServiceStep
          sortedServices={bk.sortedServices}
          selectedService={bk.selectedService}
          selectedDuration={bk.selectedDuration}
          selectedAddOnIds={bk.selectedAddOnIds}
          recommendedTypes={bk.recommendedTypes}
          onSelectService={bk.handleServiceSelect}
          onSelectDuration={bk.setSelectedDuration}
          onToggleAddOn={bk.toggleAddOn}
        />
      )}

      {bk.step === 2 && (
        <TherapistStep
          filteredStaff={bk.filteredStaff}
          selectedStaff={bk.selectedStaff}
          selectedService={bk.selectedService}
          onSelectStaff={bk.setSelectedStaff}
        />
      )}

      {bk.step === 3 && (
        <DateTimeStep
          selectedStaff={bk.selectedStaff}
          dates={bk.dates}
          selectedDate={bk.selectedDate}
          selectedTime={bk.selectedTime}
          selectedRoom={bk.selectedRoom}
          timeSlots={bk.timeSlots}
          activeRooms={bk.activeRooms}
          onSelectDate={bk.setSelectedDate}
          onSelectTime={bk.setSelectedTime}
          onSelectRoom={bk.setSelectedRoom}
        />
      )}

      {bk.step === 4 && (
        <ConfirmationStep
          selectedService={bk.selectedService}
          selectedStaff={bk.selectedStaff}
          selectedDuration={bk.selectedDuration}
          selectedDate={bk.selectedDate}
          selectedTime={bk.selectedTime}
          selectedRoom={bk.selectedRoom}
          selectedAddOns={bk.selectedAddOns}
          dates={bk.dates}
          basePrice={bk.basePrice}
          addOnTotal={bk.addOnTotal}
          totalPrice={bk.totalPrice}
          activePromo={bk.activePromo}
          giftCardBalance={bk.giftCardBalance}
          useGiftCard={bk.useGiftCard}
          onToggleGiftCard={() => bk.setUseGiftCard(!bk.useGiftCard)}
          isBooked={false}
        />
      )}

      {/* Bottom CTA */}
      <div className="fixed bottom-[4.25rem] left-0 right-0 z-[55] border-t border-brand-border bg-brand-bg-secondary/95 p-4 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          {bk.totalPrice > 0 && bk.step < 4 && (
            <div className="flex-1">
              <p className="text-xs text-brand-text-tertiary">{t("total")}</p>
              <p className="text-lg font-bold text-brand-primary">{formatPrice(bk.totalPrice)}</p>
            </div>
          )}
          <button
            type="button"
            disabled={
              (bk.step === 1 && (!bk.selectedService || !bk.selectedDuration)) ||
              (bk.step === 2 && !bk.selectedStaff) ||
              (bk.step === 3 && !bk.selectedTime)
            }
            onClick={() => (bk.step === 4 ? bk.handleBook() : bk.setStep(bk.step + 1))}
            className={cn(
              "flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              bk.step === 4 ? "flex-1" : ""
            )}
          >
            {bk.step === 4 ? t("submitRequest") : t("continue")}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" /></div>}>
      <BookingFlowInner />
    </Suspense>
  )
}
