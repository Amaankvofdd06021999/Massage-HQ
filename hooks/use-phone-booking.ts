"use client"

import { useState, useCallback } from "react"
import { Customer, Booking } from "@/lib/types"
import { useBookings } from "@/lib/data/bookings-store"
import { useServices } from "@/lib/data/services-store"
import { useShopData } from "@/lib/data/shop-data"
import { SessionData } from "@/components/admin/phone-booking/session-card"

function genSessionId(): string {
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`
}

function createEmptySession(): SessionData {
  return {
    id: genSessionId(),
    serviceId: "",
    serviceName: "",
    serviceType: "",
    duration: 0,
    price: 0,
    date: new Date().toISOString().split("T")[0],
    staffId: "",
    staffName: "",
    time: "",
    addOnIds: [],
    guests: [],
    isCollapsed: false,
  }
}

export function usePhoneBooking() {
  const { createBooking, bookings: allBookings } = useBookings()
  const { services, addOns } = useServices()
  const { staffMembers } = useShopData()

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [sessions, setSessions] = useState<SessionData[]>([createEmptySession()])
  const [callNotes, setCallNotes] = useState("")
  const [isConfirming, setIsConfirming] = useState(false)
  const [successData, setSuccessData] = useState<{
    bookingCount: number
    customerName: string
    guestCount: number
    firstDate: string
  } | null>(null)

  const updateSession = useCallback((id: string, updates: Partial<SessionData>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }, [])

  const removeSession = useCallback((id: string) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id)
      return next.length === 0 ? [createEmptySession()] : next
    })
  }, [])

  const addSession = useCallback(() => {
    setSessions(prev => [...prev, createEmptySession()])
  }, [])

  // Compute tentative bookings (from sessions being built) for timeline conflict display
  const getTentativeBookingsForDate = useCallback((date: string, excludeSessionId: string) => {
    return sessions
      .filter(s => s.date === date && s.id !== excludeSessionId && s.staffId && s.time)
      .flatMap(s => {
        const bookings = [{ startTime: s.time, duration: s.duration, staffId: s.staffId }]
        // Also include guest bookings if they have a staff assigned
        s.guests.forEach(g => {
          if (g.staffId) {
            bookings.push({ startTime: s.time, duration: g.duration, staffId: g.staffId })
          }
        })
        return bookings
      })
  }, [sessions])

  const confirmAllBookings = useCallback(() => {
    if (!selectedCustomer) return

    setIsConfirming(true)
    let totalBookings = 0
    let totalGuests = 0
    const firstDate = sessions[0]?.date || ""

    for (const session of sessions) {
      // Resolve "Any Available" to the most available therapist
      let resolvedStaffId = session.staffId
      let resolvedStaffName = session.staffName
      if (session.staffId === "any") {
        // Find therapist with most free slots on this date who offers the selected service
        const dayKey = new Date(session.date).toLocaleDateString("en-US", { weekday: "short" }).toLowerCase().slice(0, 3) as any
        const candidates = (services.find(s => s.id === session.serviceId)?.type
          ? staffMembers.filter(s => s.specialties.includes(services.find(sv => sv.id === session.serviceId)!.type) && s.availability[dayKey])
          : staffMembers.filter(s => s.availability[dayKey])
        )
        // Pick the one with fewest existing bookings on that date
        const staffBookingCounts = candidates.map(s => ({
          staff: s,
          count: allBookings.filter(b => b.staffId === s.id && b.date === session.date && b.status !== "cancelled").length,
        }))
        staffBookingCounts.sort((a, b) => a.count - b.count)
        const best = staffBookingCounts[0]?.staff
        if (best) {
          resolvedStaffId = best.id
          resolvedStaffName = best.nickname || best.name
        }
      }

      const addOnData = session.addOnIds.map(id => {
        const addon = addOns.find(a => a.id === id)
        return addon ? { addOnId: addon.id, name: addon.name, price: addon.price, extraMinutes: addon.extraMinutes } : null
      }).filter(Boolean) as { addOnId: string; name: string; price: number; extraMinutes: number }[]

      const extraMinutes = addOnData.reduce((sum, a) => sum + a.extraMinutes, 0)
      const [h, m] = session.time.split(":").map(Number)
      const endMinutes = h * 60 + m + session.duration + extraMinutes
      const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`

      const guests = session.guests.map(g => ({
        id: g.id,
        name: g.name,
        serviceId: g.serviceId,
        serviceName: g.serviceName,
        serviceType: g.serviceType as any,
        staffId: g.staffId,
        staffName: g.staffName,
        staffAvatar: "",
        duration: g.duration,
        price: g.price,
      }))

      createBooking({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        staffId: resolvedStaffId,
        staffName: resolvedStaffName,
        staffAvatar: "",
        serviceId: session.serviceId,
        serviceName: session.serviceName,
        serviceType: session.serviceType as any,
        date: session.date,
        startTime: session.time,
        endTime,
        duration: session.duration,
        price: session.price,
        status: "confirmed",
        notes: callNotes || undefined,
        source: "phone",
        addOns: addOnData.length > 0 ? addOnData : undefined,
        guests: guests.length > 0 ? guests : undefined,
        groupSize: guests.length > 0 ? 1 + guests.length : undefined,
      })

      totalBookings += 1 + session.guests.length
      totalGuests += session.guests.length
    }

    setSuccessData({
      bookingCount: totalBookings,
      customerName: selectedCustomer.name,
      guestCount: totalGuests,
      firstDate,
    })
    setIsConfirming(false)
  }, [selectedCustomer, sessions, callNotes, addOns, services, staffMembers, allBookings, createBooking])

  const resetForm = useCallback(() => {
    setSelectedCustomer(null)
    setShowNewCustomer(false)
    setSessions([createEmptySession()])
    setCallNotes("")
    setSuccessData(null)
  }, [])

  return {
    // Customer
    selectedCustomer,
    setSelectedCustomer,
    showNewCustomer,
    setShowNewCustomer,
    // Sessions
    sessions,
    updateSession,
    removeSession,
    addSession,
    getTentativeBookingsForDate,
    // Notes & confirm
    callNotes,
    setCallNotes,
    isConfirming,
    confirmAllBookings,
    // Success
    successData,
    resetForm,
    // Data
    services,
    addOns,
    allBookings,
  }
}
