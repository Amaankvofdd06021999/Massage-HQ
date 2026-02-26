"use client"

import {
  createContext, useContext, useState, useCallback, useEffect, type ReactNode,
} from "react"
import type {
  Booking, CancellationRecord, CancellationPolicy, BookingReminder, LateArrivalClaim,
} from "@/lib/types"
import {
  bookings as SEED_BOOKINGS,
  cancellationPolicy as SEED_POLICY,
  cancellationRecords as SEED_CANCELLATIONS,
  bookingReminders as SEED_REMINDERS,
  lateArrivalClaims as SEED_CLAIMS,
} from "@/lib/data/mock-data"

// ─── Storage keys ────────────────────────────────────────────────────────────
const BOOKINGS_KEY = "koko-bookings"
const CANCELLATIONS_KEY = "koko-cancellations"
const REMINDERS_KEY = "koko-reminders"
const CLAIMS_KEY = "koko-claims"

// ─── Context ─────────────────────────────────────────────────────────────────
interface BookingsContextType {
  bookings: Booking[]
  cancellations: CancellationRecord[]
  cancellationPolicy: CancellationPolicy
  reminders: BookingReminder[]
  lateArrivalClaims: LateArrivalClaim[]
  // Booking mutations
  updateBooking: (id: string, patch: Partial<Booking>) => void
  cancelBooking: (id: string, reason?: string) => CancellationRecord | null
  createBooking: (booking: Omit<Booking, "id" | "createdAt">) => Booking
  approveBooking: (id: string, approvedBy?: string) => void
  rejectBooking: (id: string, reason?: string) => void
  // Reminders
  sendReminder: (bookingId: string, type: BookingReminder["type"]) => void
  // Late arrival
  submitLateArrivalClaim: (claim: Omit<LateArrivalClaim, "id" | "submittedAt" | "status">) => void
  resolveLateArrivalClaim: (id: string, status: "approved" | "rejected", managerNote?: string) => void
  // Helpers
  getBookingsForCustomer: (customerId: string) => Booking[]
  getBookingsForStaff: (staffId: string) => Booking[]
  getUpcomingBookings: (userId?: string, role?: "customer" | "staff") => Booking[]
  getPastBookings: (userId?: string, role?: "customer" | "staff") => Booking[]
}

const BookingsContext = createContext<BookingsContextType | undefined>(undefined)

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function load<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : seed
  } catch { return seed }
}

function save<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(SEED_BOOKINGS)
  const [cancellations, setCancellations] = useState<CancellationRecord[]>(SEED_CANCELLATIONS)
  const [reminders, setReminders] = useState<BookingReminder[]>(SEED_REMINDERS)
  const [claims, setClaims] = useState<LateArrivalClaim[]>(SEED_CLAIMS)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setBookings(load(BOOKINGS_KEY, SEED_BOOKINGS))
    setCancellations(load(CANCELLATIONS_KEY, SEED_CANCELLATIONS))
    setReminders(load(REMINDERS_KEY, SEED_REMINDERS))
    setClaims(load(CLAIMS_KEY, SEED_CLAIMS))
    setReady(true)
  }, [])

  useEffect(() => { if (ready) save(BOOKINGS_KEY, bookings) }, [bookings, ready])
  useEffect(() => { if (ready) save(CANCELLATIONS_KEY, cancellations) }, [cancellations, ready])
  useEffect(() => { if (ready) save(REMINDERS_KEY, reminders) }, [reminders, ready])
  useEffect(() => { if (ready) save(CLAIMS_KEY, claims) }, [claims, ready])

  const updateBooking = useCallback((id: string, patch: Partial<Booking>) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }, [])

  const createBooking = useCallback((booking: Omit<Booking, "id" | "createdAt">): Booking => {
    const newBooking: Booking = {
      ...booking,
      id: genId("b"),
      createdAt: new Date().toISOString(),
    }
    setBookings((prev) => [...prev, newBooking])
    return newBooking
  }, [])

  const cancelBooking = useCallback((id: string, reason?: string): CancellationRecord | null => {
    const booking = bookings.find((b) => b.id === id)
    if (!booking || (booking.status !== "confirmed" && booking.status !== "pending")) return null

    const now = new Date()
    const bookingStart = new Date(`${booking.date}T${booking.startTime}:00`)
    const hoursUntil = (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60)
    const isLate = hoursUntil < SEED_POLICY.freeWindowHours

    const fee = isLate ? Math.round(booking.price * SEED_POLICY.lateCancelFeePercent / 100) : 0
    const staffComp = isLate ? Math.round(fee * SEED_POLICY.staffCompensationPercent / 100) : 0

    const record: CancellationRecord = {
      id: genId("cr"),
      bookingId: id,
      customerId: booking.customerId,
      cancelledAt: now.toISOString(),
      reason,
      isLateCancellation: isLate,
      fee,
      staffCompensation: staffComp,
      refundAmount: booking.price - fee,
    }

    setCancellations((prev) => [...prev, record])
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as const, cancellationFee: fee } : b))
    )
    return record
  }, [bookings])

  const approveBooking = useCallback((id: string, approvedBy?: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id && b.status === "pending"
          ? { ...b, status: "confirmed" as const, approvedBy, approvedAt: new Date().toISOString() }
          : b
      )
    )
  }, [])

  const rejectBooking = useCallback((id: string, reason?: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id && b.status === "pending"
          ? { ...b, status: "rejected" as const, rejectionReason: reason }
          : b
      )
    )
  }, [])

  const sendReminder = useCallback((bookingId: string, type: BookingReminder["type"]) => {
    const booking = bookings.find((b) => b.id === bookingId)
    if (!booking) return
    const reminder: BookingReminder = {
      id: genId("br"),
      bookingId,
      customerId: booking.customerId,
      sentAt: new Date().toISOString(),
      type,
      status: "sent",
    }
    setReminders((prev) => [...prev, reminder])
  }, [bookings])

  const submitLateArrivalClaim = useCallback(
    (claim: Omit<LateArrivalClaim, "id" | "submittedAt" | "status">) => {
      const newClaim: LateArrivalClaim = {
        ...claim,
        id: genId("lac"),
        submittedAt: new Date().toISOString(),
        status: "pending",
      }
      setClaims((prev) => [...prev, newClaim])
    }, []
  )

  const resolveLateArrivalClaim = useCallback(
    (id: string, status: "approved" | "rejected", managerNote?: string) => {
      setClaims((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, status, resolvedAt: new Date().toISOString(), managerNote }
            : c
        )
      )
    }, []
  )

  const getBookingsForCustomer = useCallback(
    (customerId: string) => bookings.filter((b) => b.customerId === customerId),
    [bookings]
  )

  const getBookingsForStaff = useCallback(
    (staffId: string) => bookings.filter((b) => b.staffId === staffId),
    [bookings]
  )

  const getUpcomingBookings = useCallback(
    (userId?: string, role?: "customer" | "staff") => {
      const today = new Date().toISOString().split("T")[0]
      return bookings
        .filter((b) => {
          const isUpcoming = (b.status === "pending" || b.status === "confirmed" || b.status === "in-progress") && b.date >= today
          if (!userId) return isUpcoming
          if (role === "staff") return isUpcoming && b.staffId === userId
          return isUpcoming && b.customerId === userId
        })
        .sort((a, b) => {
          const priority: Record<string, number> = { "in-progress": 0, "pending": 1, "confirmed": 2 }
          const pa = priority[a.status] ?? 3
          const pb = priority[b.status] ?? 3
          if (pa !== pb) return pa - pb
          const dateA = new Date(`${a.date}T${a.startTime}`)
          const dateB = new Date(`${b.date}T${b.startTime}`)
          return dateA.getTime() - dateB.getTime()
        })
    },
    [bookings]
  )

  const getPastBookings = useCallback(
    (userId?: string, role?: "customer" | "staff") => {
      return bookings
        .filter((b) => {
          const isPast = b.status === "completed" || b.status === "cancelled" || b.status === "no-show" || b.status === "rejected"
          if (!userId) return isPast
          if (role === "staff") return isPast && b.staffId === userId
          return isPast && b.customerId === userId
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },
    [bookings]
  )

  return (
    <BookingsContext.Provider
      value={{
        bookings, cancellations, cancellationPolicy: SEED_POLICY,
        reminders, lateArrivalClaims: claims,
        updateBooking, cancelBooking, createBooking, approveBooking, rejectBooking,
        sendReminder, submitLateArrivalClaim, resolveLateArrivalClaim,
        getBookingsForCustomer, getBookingsForStaff,
        getUpcomingBookings, getPastBookings,
      }}
    >
      {children}
    </BookingsContext.Provider>
  )
}

export function useBookings() {
  const ctx = useContext(BookingsContext)
  if (!ctx) throw new Error("useBookings must be used within BookingsProvider")
  return ctx
}
