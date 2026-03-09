"use client"

import { useState, useMemo, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, ChevronRight, Clock, Calendar, User, CreditCard, Package, Plus, DoorOpen, Clock3, MessageSquare } from "lucide-react"
import { StaffAvatar } from "@/components/shared/staff-avatar"
import { RatingDisplay } from "@/components/shared/rating-stars"
import { PillButton, PillButtonRow } from "@/components/shared/pill-button"
import { StaffReviewsDialog } from "@/components/shared/staff-reviews-dialog"
import { useLanguage } from "@/lib/i18n/language-context"
import {
  staffMembers, generateTimeSlots,
  formatPrice, formatMassageType,
} from "@/lib/data/mock-data"
import { useServices } from "@/lib/data/services-store"
import { useBookings } from "@/lib/data/bookings-store"
import { usePromotions } from "@/lib/data/promotions-store"
import { useAuth } from "@/lib/auth/auth-context"
import { cn } from "@/lib/utils"
import type { StaffMember, ServiceOption, MassageRoom, RoomType, MassageType, HealthCondition, PainArea } from "@/lib/types"
import { customers } from "@/lib/data/mock-data"
import { Sparkles, Gift, Wallet } from "lucide-react"
import { useGiftCards } from "@/lib/data/giftcards-store"

const ROOM_TYPE_COLORS: Record<RoomType, string> = {
  room:   "bg-blue-500/15 text-blue-400",
  bed:    "bg-green-500/15 text-green-400",
  suite:  "bg-yellow-500/15 text-yellow-400",
  couple: "bg-pink-500/15 text-pink-400",
}

const CONDITION_RECOMMENDATIONS: Record<HealthCondition, MassageType[]> = {
  "office-syndrome": ["deep-tissue", "shiatsu", "thai"],
  "sports-injury": ["sports", "deep-tissue"],
  "chronic-pain": ["deep-tissue", "thai", "shiatsu"],
  "stress-anxiety": ["swedish", "aromatherapy", "hot-stone"],
  "insomnia": ["swedish", "aromatherapy"],
  "poor-circulation": ["reflexology", "foot", "thai"],
  "muscle-tension": ["deep-tissue", "sports", "thai"],
  "post-surgery": ["swedish", "aromatherapy"],
  "pregnancy": ["swedish", "aromatherapy"],
}

const PAIN_AREA_RECOMMENDATIONS: Partial<Record<PainArea, MassageType[]>> = {
  "neck": ["deep-tissue", "shiatsu", "thai"],
  "shoulders": ["deep-tissue", "shiatsu", "sports"],
  "upper-back": ["deep-tissue", "thai", "shiatsu"],
  "lower-back": ["deep-tissue", "thai"],
  "feet": ["reflexology", "foot"],
  "legs": ["sports", "reflexology", "foot"],
  "knees": ["sports", "reflexology"],
}

function getRecommendedTypes(conditions: HealthCondition[], painAreas: PainArea[]): Set<MassageType> {
  const types = new Set<MassageType>()
  for (const c of conditions) {
    for (const t of CONDITION_RECOMMENDATIONS[c] ?? []) types.add(t)
  }
  for (const a of painAreas) {
    for (const t of PAIN_AREA_RECOMMENDATIONS[a] ?? []) types.add(t)
  }
  return types
}

function BookingFlowInner() {
  const searchParams = useSearchParams()
  const preselectedStaff = searchParams.get("staff")
  const preselectedService = searchParams.get("service")
  const { t } = useLanguage()

  const { services, addOns, getAddOnsForService, getActiveRooms } = useServices()
  const { createBooking } = useBookings()
  const { hasActivePromotionForService } = usePromotions()
  const { getGiftCardsForCustomer } = useGiftCards()
  const { user } = useAuth()
  const activeServices = services.filter((s) => s.isActive)
  const activeRooms = getActiveRooms()

  const customerData = customers.find((c) => c.id === user?.id) ?? customers[0]
  const prefs = customerData.massagePreferences
  const recommendedTypes = useMemo(
    () => prefs ? getRecommendedTypes(prefs.conditions, prefs.painAreas) : new Set<MassageType>(),
    [prefs]
  )
  const myGiftCards = user ? getGiftCardsForCustomer(user.id) : []
  const giftCardBalance = myGiftCards.reduce((sum, gc) => sum + gc.currentBalance, 0)

  const roomTypeLabels: Record<RoomType, string> = {
    room: t("roomTypePrivate"),
    bed: t("roomTypeOpenBed"),
    suite: t("roomTypeVIP"),
    couple: t("roomTypeCouple"),
  }

  const steps = [
    { id: 1, label: t("stepService"), icon: CreditCard },
    { id: 2, label: t("stepTherapist"), icon: User },
    { id: 3, label: t("stepDateTime"), icon: Calendar },
    { id: 4, label: t("stepConfirm"), icon: Check },
  ]

  const [step, setStep] = useState(preselectedService ? 2 : 1)
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(
    preselectedService ? (activeServices.find((s) => s.id === preselectedService) ?? null) : null
  )
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null)
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([])
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(
    preselectedStaff ? staffMembers.find((s) => s.id === preselectedStaff) ?? null : null
  )
  const [selectedDate, setSelectedDate] = useState(0)
  const [selectedTime, setSelectedTime] = useState<string | null>(searchParams.get("time"))
  const [selectedRoom, setSelectedRoom] = useState<MassageRoom | null>(null)
  const [isBooked, setIsBooked] = useState(false)
  const [reviewStaff, setReviewStaff] = useState<StaffMember | null>(null)
  const [useGiftCard, setUseGiftCard] = useState(false)

  const dates = useMemo(() => {
    const result = []
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      result.push({
        label: i === 0 ? t("today") : i === 1 ? t("tomorrow") : d.toLocaleDateString("en", { weekday: "short" }),
        date: d.toISOString().split("T")[0],
        dayNum: d.getDate(),
        month: d.toLocaleDateString("en", { month: "short" }),
      })
    }
    return result
  }, [t])

  const timeSlots = useMemo(
    () => selectedStaff ? generateTimeSlots(dates[selectedDate].date, selectedStaff.id) : [],
    [selectedStaff, selectedDate, dates]
  )

  const filteredStaff = useMemo(
    () => selectedService
      ? staffMembers.filter((s) => s.specialties.includes(selectedService.type))
      : staffMembers,
    [selectedService]
  )

  const availableAddOns = useMemo(
    () => selectedService ? getAddOnsForService(selectedService.type) : [],
    [selectedService, getAddOnsForService]
  )

  const selectedAddOns = useMemo(
    () => addOns.filter((a) => selectedAddOnIds.includes(a.id)),
    [addOns, selectedAddOnIds]
  )

  const sortedServices = useMemo(() => {
    if (recommendedTypes.size === 0) return activeServices
    return [...activeServices].sort((a, b) => {
      const aRec = recommendedTypes.has(a.type) ? 1 : 0
      const bRec = recommendedTypes.has(b.type) ? 1 : 0
      return bRec - aRec
    })
  }, [activeServices, recommendedTypes])

  const addOnTotal = useMemo(
    () => selectedAddOns.reduce((sum, a) => sum + a.price, 0),
    [selectedAddOns]
  )

  const basePrice = useMemo(() => {
    if (!selectedService || !selectedDuration) return 0
    return selectedService.durations.find((d) => d.minutes === selectedDuration)?.price ?? 0
  }, [selectedService, selectedDuration])

  const totalPrice = basePrice + addOnTotal
  const activePromo = user ? hasActivePromotionForService(user.id, selectedService?.type as MassageType) : null

  function toggleAddOn(id: string) {
    setSelectedAddOnIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function handleServiceSelect(svc: ServiceOption) {
    setSelectedService(svc)
    setSelectedDuration(svc.durations[0].minutes)
    setSelectedAddOnIds([])
  }

  const handleBook = useCallback(() => {
    if (!selectedService || !selectedStaff || !selectedTime || !selectedDuration) return
    const endMinutes =
      parseInt(selectedTime.split(":")[0]) * 60 +
      parseInt(selectedTime.split(":")[1]) +
      selectedDuration +
      selectedAddOns.reduce((sum, a) => sum + a.extraMinutes, 0)
    const endH = String(Math.floor(endMinutes / 60)).padStart(2, "0")
    const endM = String(endMinutes % 60).padStart(2, "0")

    createBooking({
      customerId: user?.id ?? "c1",
      customerName: user?.name ?? "Guest",
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      staffAvatar: selectedStaff.avatar,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      serviceType: selectedService.type,
      date: dates[selectedDate].date,
      startTime: selectedTime,
      endTime: `${endH}:${endM}`,
      duration: selectedDuration + selectedAddOns.reduce((sum, a) => sum + a.extraMinutes, 0),
      price: activePromo ? 0 : totalPrice,
      status: "pending",
      roomId: selectedRoom?.id,
      promotionId: activePromo?.id,
    })
    setIsBooked(true)
  }, [selectedService, selectedStaff, selectedTime, selectedDuration, selectedAddOns, selectedRoom, selectedDate, dates, totalPrice, user, createBooking, activePromo])

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
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground"
        >
          {t("backToHome")}
        </Link>
        <Link href="/bookings" className="mt-3 text-sm text-brand-primary">
          {t("viewMyBookings")}
        </Link>
      </div>
    )
  }

  return (
    <div className="pb-44 pt-12">
      {/* Header */}
      <div className="flex items-center gap-3 px-5">
        <button
          type="button"
          onClick={() => (step > 1 ? setStep(step - 1) : window.history.back())}
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
                s.id <= step ? "bg-brand-primary" : "bg-brand-border"
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
              s.id <= step ? "text-brand-primary" : "text-brand-text-tertiary"
            )}
          >
            {s.label}
          </span>
        ))}
      </div>

      {/* Step 1: Service Selection */}
      {step === 1 && (
        <div className="mt-6 px-5 page-transition">
          <h2 className="text-lg font-bold text-brand-text-primary">{t("chooseAService")}</h2>
          <p className="mt-1 text-sm text-brand-text-secondary">{t("selectMassageType")}</p>
          {/* Recommendation banner */}
          {recommendedTypes.size > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20 px-3 py-2">
              <Sparkles size={14} className="shrink-0 text-brand-primary" />
              <p className="text-xs text-brand-text-secondary">{t("recommendedForYou")}</p>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3">
            {sortedServices.map((svc) => {
              const isSelected = selectedService?.id === svc.id
              const svcAddOns = getAddOnsForService(svc.type)
              const isRecommended = recommendedTypes.has(svc.type)
              return (
                <div
                  key={svc.id}
                  className={cn(
                    "rounded-2xl border transition-all",
                    isSelected ? "border-brand-primary bg-brand-primary/5" : isRecommended ? "border-brand-primary/30 bg-brand-primary/[0.02]" : "border-brand-border bg-card"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleServiceSelect(svc)}
                    className="w-full p-4 text-left card-press"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary">
                              <Check size={11} className="text-[#0A0A0F]" />
                            </div>
                          )}
                          <p className="font-semibold text-brand-text-primary">{svc.name}</p>
                          {isRecommended && !isSelected && (
                            <span className="flex items-center gap-1 rounded-full bg-brand-primary/15 px-2 py-0.5 text-[10px] font-semibold text-brand-primary">
                              <Sparkles size={10} />
                              {t("recommended")}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-brand-text-tertiary">{svc.description}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {svc.isPopular && (
                          <span className="rounded-full bg-brand-coral/15 px-2 py-0.5 text-[10px] font-semibold text-brand-coral">
                            {t("popular")}
                          </span>
                        )}
                        <span className="text-xs text-brand-text-tertiary">
                          {t("from")} {formatPrice(svc.durations[0].price)}
                        </span>
                      </div>
                    </div>
                  </button>

                  {isSelected && (
                    <div className="border-t border-brand-primary/20 px-4 pb-4">
                      <p className="mb-2 mt-3 text-xs font-semibold text-brand-text-secondary uppercase tracking-wide">
                        {t("durationHeader")}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {svc.durations.map((d) => (
                          <button
                            key={d.minutes}
                            type="button"
                            onClick={() => setSelectedDuration(d.minutes)}
                            className={cn(
                              "rounded-xl border px-4 py-2.5 text-xs font-medium transition-colors",
                              selectedDuration === d.minutes
                                ? "border-brand-primary bg-brand-primary/15 text-brand-primary"
                                : "border-brand-border bg-brand-bg-tertiary text-brand-text-secondary hover:border-brand-primary/40"
                            )}
                          >
                            <span className="block font-semibold">{d.minutes} {t("min")}</span>
                            <span className="block text-[10px] mt-0.5">{formatPrice(d.price)}</span>
                          </button>
                        ))}
                      </div>

                      {svcAddOns.length > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Package size={13} className="text-brand-text-tertiary" />
                            <p className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wide">
                              {t("addOnsHeader")}
                            </p>
                            <span className="rounded-full bg-brand-bg-tertiary px-1.5 py-0.5 text-[10px] text-brand-text-tertiary">
                              {t("optional")}
                            </span>
                          </div>
                          <div className="flex flex-col gap-2">
                            {svcAddOns.map((addOn) => {
                              const selected = selectedAddOnIds.includes(addOn.id)
                              return (
                                <button
                                  key={addOn.id}
                                  type="button"
                                  onClick={() => toggleAddOn(addOn.id)}
                                  className={cn(
                                    "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                                    selected
                                      ? "border-brand-primary bg-brand-primary/5"
                                      : "border-brand-border bg-brand-bg-tertiary hover:border-brand-primary/30"
                                  )}
                                >
                                  <div className={cn(
                                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                    selected
                                      ? "border-brand-primary bg-brand-primary text-[#0A0A0F]"
                                      : "border-brand-border text-brand-text-tertiary"
                                  )}>
                                    {selected ? <Check size={10} /> : <Plus size={10} />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-brand-text-primary">{addOn.name}</p>
                                    <p className="text-[10px] text-brand-text-tertiary line-clamp-1">{addOn.description}</p>
                                    {addOn.extraMinutes > 0 && (
                                      <p className="text-[10px] text-brand-text-tertiary">+{addOn.extraMinutes} {t("min")}</p>
                                    )}
                                  </div>
                                  <span className="shrink-0 text-xs font-bold text-brand-primary">+{formatPrice(addOn.price)}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 2: Therapist Selection */}
      {step === 2 && (
        <div className="mt-6 px-5 page-transition">
          <h2 className="text-lg font-bold text-brand-text-primary">{t("chooseYourTherapist")}</h2>
          <p className="mt-1 text-sm text-brand-text-secondary">
            {filteredStaff.length} {t("therapistsAvailableFor")} {selectedService ? formatMassageType(selectedService.type) : t("thisService")}
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {filteredStaff.map((staff) => (
              <button
                key={staff.id}
                type="button"
                onClick={() => setSelectedStaff(staff)}
                className={cn(
                  "flex gap-3 rounded-2xl border p-4 text-left transition-all card-press",
                  selectedStaff?.id === staff.id
                    ? "border-brand-primary bg-brand-primary/5"
                    : "border-brand-border bg-card"
                )}
              >
                <StaffAvatar src={staff.avatar} name={staff.name} size="md" available={staff.isAvailableToday} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-brand-text-primary">{staff.nickname}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <RatingDisplay rating={staff.rating} reviews={staff.totalReviews} />
                    <span className="text-xs text-brand-text-tertiary">{staff.yearsExperience}yr</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-sm font-semibold text-brand-primary">{formatPrice(staff.pricePerHour)}/hr</p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setReviewStaff(staff) }}
                    className="flex items-center gap-1 rounded-lg border border-brand-border px-2 py-1 text-xs text-brand-text-secondary hover:bg-brand-bg-tertiary transition-colors"
                  >
                    <MessageSquare size={12} />
                    {t("viewReviews")}
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Date & Time */}
      {step === 3 && (
        <div className="mt-6 px-5 page-transition">
          <h2 className="text-lg font-bold text-brand-text-primary">{t("selectDateAndTime")}</h2>
          <p className="mt-1 text-sm text-brand-text-secondary">
            {t("bookingWith")} {selectedStaff?.nickname}
          </p>
          <PillButtonRow className="mt-4">
            {dates.map((d, i) => (
              <PillButton key={d.date} active={selectedDate === i} onClick={() => { setSelectedDate(i); setSelectedTime(null) }}>
                <div className="flex flex-col items-center">
                  <span className="text-[10px]">{d.label}</span>
                  <span className="text-sm font-bold">{d.dayNum}</span>
                  <span className="text-[10px]">{d.month}</span>
                </div>
              </PillButton>
            ))}
          </PillButtonRow>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot.time}
                type="button"
                disabled={!slot.available}
                onClick={() => setSelectedTime(slot.time)}
                className={cn(
                  "rounded-lg border py-2.5 text-center text-xs font-medium transition-all",
                  selectedTime === slot.time
                    ? "border-brand-primary bg-brand-primary/15 text-brand-primary"
                    : slot.available
                    ? "border-brand-border bg-card text-brand-text-primary hover:border-brand-text-tertiary"
                    : "cursor-not-allowed border-transparent bg-brand-bg-tertiary/50 text-brand-text-tertiary line-through"
                )}
              >
                {slot.time}
              </button>
            ))}
          </div>

          {/* Room / Bed selection */}
          {activeRooms.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <DoorOpen size={16} className="text-brand-text-tertiary" />
                <h3 className="text-sm font-semibold text-brand-text-primary">{t("chooseRoomOrBed")}</h3>
                <span className="rounded-full bg-brand-bg-tertiary px-2 py-0.5 text-[10px] text-brand-text-tertiary">{t("optional")}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {activeRooms.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setSelectedRoom(selectedRoom?.id === room.id ? null : room)}
                    className={cn(
                      "overflow-hidden rounded-2xl border text-left transition-all card-press",
                      selectedRoom?.id === room.id
                        ? "border-brand-primary bg-brand-primary/5"
                        : "border-brand-border bg-card"
                    )}
                  >
                    {room.image && (
                      <div className="relative h-24 w-full">
                        <img src={room.image} alt={room.name} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="p-3.5">
                      <div className={cn("mb-1.5 inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold", ROOM_TYPE_COLORS[room.type])}>
                        {roomTypeLabels[room.type]}
                      </div>
                      <p className="text-sm font-semibold text-brand-text-primary leading-tight">{room.name}</p>
                      {room.floor && <p className="mt-0.5 text-[10px] text-brand-text-tertiary">{room.floor}</p>}
                      {room.description && <p className="mt-1 text-xs text-brand-text-secondary line-clamp-2">{room.description}</p>}
                      {room.capacity > 1 && (
                        <p className="mt-1 text-[10px] text-brand-text-tertiary">{t("upToGuests")} {room.capacity} {t("guests")}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
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
                    onClick={() => setUseGiftCard(!useGiftCard)}
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
      )}

      {/* Bottom CTA — sits above the bottom nav */}
      <div className="fixed bottom-[4.25rem] left-0 right-0 z-[55] border-t border-brand-border bg-brand-bg-secondary/95 p-4 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          {totalPrice > 0 && step < 4 && (
            <div className="flex-1">
              <p className="text-xs text-brand-text-tertiary">{t("total")}</p>
              <p className="text-lg font-bold text-brand-primary">{formatPrice(totalPrice)}</p>
            </div>
          )}
          <button
            type="button"
            disabled={
              (step === 1 && (!selectedService || !selectedDuration)) ||
              (step === 2 && !selectedStaff) ||
              (step === 3 && !selectedTime)
            }
            onClick={() => (step === 4 ? handleBook() : setStep(step + 1))}
            className={cn(
              "flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              step === 4 ? "flex-1" : ""
            )}
          >
            {step === 4 ? t("submitRequest") : t("continue")}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <StaffReviewsDialog
        staff={reviewStaff}
        open={!!reviewStaff}
        onOpenChange={(open) => { if (!open) setReviewStaff(null) }}
      />
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
