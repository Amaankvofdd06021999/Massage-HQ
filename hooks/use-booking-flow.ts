"use client"

import { useState, useMemo, useCallback } from "react"
import { staffMembers, customers } from "@/lib/data/mock-data"
import { generateTimeSlots } from "@/lib/utils/time"
import { useServices } from "@/lib/data/services-store"
import { useBookings } from "@/lib/data/bookings-store"
import { usePromotions } from "@/lib/data/promotions-store"
import { useAuth } from "@/lib/auth/auth-context"
import { useGiftCards } from "@/lib/data/giftcards-store"
import { useLanguage } from "@/lib/i18n/language-context"
import type { StaffMember, ServiceOption, MassageRoom, MassageType, HealthCondition, PainArea } from "@/lib/types"

// ─── Recommendation Maps ────────────────────────────────────────────────────

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

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useBookingFlow(preselectedService: string | null, preselectedStaff: string | null, preselectedTime: string | null) {
  const { t } = useLanguage()
  const { services, addOns, getActiveRooms } = useServices()
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

  // ── State ───────────────────────────────────────────────────────────────

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
  const [selectedTime, setSelectedTime] = useState<string | null>(preselectedTime)
  const [selectedRoom, setSelectedRoom] = useState<MassageRoom | null>(null)
  const [isBooked, setIsBooked] = useState(false)
  const [useGiftCard, setUseGiftCard] = useState(false)

  // ── Derived data ────────────────────────────────────────────────────────

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

  // ── Handlers ────────────────────────────────────────────────────────────

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

  return {
    // Step
    step,
    setStep,
    // Selections
    selectedService,
    selectedDuration,
    setSelectedDuration,
    selectedAddOnIds,
    selectedStaff,
    setSelectedStaff,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    selectedRoom,
    setSelectedRoom,
    isBooked,
    useGiftCard,
    setUseGiftCard,
    // Derived
    dates,
    timeSlots,
    filteredStaff,
    selectedAddOns,
    sortedServices,
    addOnTotal,
    basePrice,
    totalPrice,
    activePromo,
    activeRooms,
    recommendedTypes,
    giftCardBalance,
    // Handlers
    toggleAddOn,
    handleServiceSelect,
    handleBook,
  }
}
