"use client"

import { useState, useMemo, useCallback } from "react"
import { useShopData } from "@/lib/data/shop-data"
import { generateTimeSlots } from "@/lib/utils/time"
import { useServices } from "@/lib/data/services-store"
import { useBookings } from "@/lib/data/bookings-store"
import { usePromotions } from "@/lib/data/promotions-store"
import { useAuth } from "@/lib/auth/auth-context"
import { useGiftCards } from "@/lib/data/giftcards-store"
import { useLanguage } from "@/lib/i18n/language-context"
import type { StaffMember, ServiceOption, MassageRoom, MassageType, HealthCondition, PainArea, BookingGuestDraft, BookingGuest } from "@/lib/types"

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
  const { staffMembers, customers } = useShopData()

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
  const [isGroupBooking, setIsGroupBooking] = useState(false)
  const [guests, setGuests] = useState<BookingGuestDraft[]>([])

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

  const guestsTotalPrice = useMemo(
    () => guests.reduce((sum, g) => sum + (g.price ?? 0), 0),
    [guests]
  )
  const groupTotalPrice = totalPrice + guestsTotalPrice
  const groupSize = 1 + guests.length

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

  function toggleGroupBooking() {
    setIsGroupBooking((prev) => {
      if (prev) setGuests([])
      return !prev
    })
  }

  function addGuest() {
    if (guests.length >= 2) return // max 2 guests (3 total)
    setGuests((prev) => [...prev, { id: crypto.randomUUID(), name: "" }])
  }

  function removeGuest(id: string) {
    setGuests((prev) => prev.filter((g) => g.id !== id))
  }

  function updateGuest(id: string, partial: Partial<BookingGuestDraft>) {
    setGuests((prev) => prev.map((g) => g.id === id ? { ...g, ...partial } : g))
  }

  function getFilteredStaffForGuest(guestId: string): StaffMember[] {
    const guest = guests.find((g) => g.id === guestId)
    if (!guest?.serviceType) return staffMembers
    return staffMembers.filter((s) => s.specialties.includes(guest.serviceType!))
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
      guests: guests.length > 0 ? guests.map((g): BookingGuest => ({
        id: g.id,
        name: g.name,
        serviceId: g.serviceId ?? selectedService!.id,
        serviceName: g.serviceName ?? selectedService!.name,
        serviceType: g.serviceType ?? selectedService!.type,
        staffId: g.staffId ?? selectedStaff!.id,
        staffName: g.staffName ?? selectedStaff!.name,
        staffAvatar: g.staffAvatar ?? selectedStaff!.avatar,
        duration: g.duration ?? selectedDuration!,
        price: g.price ?? 0,
        roomId: g.roomId,
      })) : undefined,
      groupSize: guests.length > 0 ? 1 + guests.length : undefined,
      promotionId: activePromo?.id,
    })
    setIsBooked(true)
  }, [selectedService, selectedStaff, selectedTime, selectedDuration, selectedAddOns, selectedRoom, selectedDate, dates, totalPrice, user, createBooking, activePromo, guests])

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
    // Group booking
    isGroupBooking,
    guests,
    groupSize,
    guestsTotalPrice,
    groupTotalPrice,
    toggleGroupBooking,
    addGuest,
    removeGuest,
    updateGuest,
    getFilteredStaffForGuest,
    // Handlers
    toggleAddOn,
    handleServiceSelect,
    handleBook,
  }
}
