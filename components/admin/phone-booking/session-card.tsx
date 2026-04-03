"use client"

import { useState, useMemo } from "react"
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react"
import { ServiceOption, StaffMember, Booking, ServiceAddOn, DayOfWeek } from "@/lib/types"
import { useLanguage } from "@/lib/i18n/language-context"
import { formatPrice } from "@/lib/utils/formatters"
import { TherapistTimeline } from "./therapist-timeline"
import { GuestRow, GuestData } from "./guest-row"

export interface SessionData {
  id: string
  serviceId: string
  serviceName: string
  serviceType: string
  duration: number
  price: number
  date: string
  staffId: string
  staffName: string
  time: string
  addOnIds: string[]
  guests: GuestData[]
  isCollapsed: boolean
}

interface SessionCardProps {
  session: SessionData
  sessionIndex: number
  services: ServiceOption[]
  addOns: ServiceAddOn[]
  staff: StaffMember[]
  allBookings: Booking[]
  tentativeBookingsForDate: { startTime: string; duration: number; staffId: string }[]
  onUpdate: (id: string, updates: Partial<SessionData>) => void
  onRemove: (id: string) => void
}

function genGuestId(): string {
  return `g-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`
}

export function SessionCard({
  session,
  sessionIndex,
  services,
  addOns,
  staff,
  allBookings,
  tentativeBookingsForDate,
  onUpdate,
  onRemove,
}: SessionCardProps) {
  const { t } = useLanguage()
  const [showAddOns, setShowAddOns] = useState(false)

  const activeServices = services.filter(s => s.isActive)
  const selectedService = activeServices.find(s => s.id === session.serviceId)
  const durations = selectedService?.durations || []

  // Filter staff who offer the selected service type
  const qualifiedStaff = useMemo(() => {
    if (!selectedService) return []
    return staff.filter(s => s.specialties.includes(selectedService.type))
  }, [staff, selectedService])

  // Sort by availability (most free slots first, day-off last)
  const sortedStaff = useMemo(() => {
    if (!session.date) return qualifiedStaff
    return [...qualifiedStaff].sort((a, b) => {
      const dayKey = new Date(session.date).toLocaleDateString("en-US", { weekday: "short" }).toLowerCase().slice(0, 3) as DayOfWeek
      const aOff = !a.availability[dayKey]
      const bOff = !b.availability[dayKey]
      if (aOff && !bOff) return 1
      if (!aOff && bOff) return -1
      return 0
    })
  }, [qualifiedStaff, session.date])

  // Applicable add-ons for selected service
  const applicableAddOns = useMemo(() => {
    if (!selectedService) return []
    return addOns.filter(a => a.isActive && (a.applicableServices === "all" || a.applicableServices.includes(selectedService.type)))
  }, [addOns, selectedService])

  const isComplete = session.serviceId && session.date && session.staffId && session.time
  const groupSize = 1 + session.guests.length

  // Calculate add-on prices
  const addOnTotal = session.addOnIds.reduce((sum, id) => {
    const addon = addOns.find(a => a.id === id)
    return sum + (addon?.price || 0)
  }, 0)
  const sessionTotal = session.price + addOnTotal + session.guests.reduce((s, g) => s + g.price, 0)

  // Collapsed view
  if (session.isCollapsed && isComplete) {
    return (
      <div className="rounded-lg border border-green-600 bg-brand-bg-secondary p-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-[10px] text-white">✓</span>
            <span className="text-sm font-semibold text-brand-text-primary">{t("phoneBookingSession")} {sessionIndex + 1}</span>
            {groupSize > 1 && (
              <span className="bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-full text-[10px]">
                {t("phoneBookingGroup")} × {groupSize}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => onUpdate(session.id, { isCollapsed: false })} className="text-xs text-brand-primary">{t("phoneBookingEditSession")}</button>
            <button onClick={() => onRemove(session.id)} className="text-xs text-red-500">{t("phoneBookingRemoveSession")}</button>
          </div>
        </div>
        <div className="flex gap-4 flex-wrap text-xs text-brand-text-secondary">
          <span>🧖 {session.serviceName} · {session.duration}min</span>
          <span>👤 {session.staffName}</span>
          <span>📅 {session.date} · {session.time}</span>
          <span className="text-green-500">{formatPrice(sessionTotal)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border ${isComplete ? "border-green-600" : "border-brand-primary"} bg-brand-bg-secondary p-3`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center text-[10px] text-white font-bold">
            {sessionIndex + 1}
          </span>
          <span className="text-sm font-semibold text-brand-text-primary">{t("phoneBookingSession")} {sessionIndex + 1}</span>
          {groupSize > 1 && (
            <span className="bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-full text-[10px]">
              {t("phoneBookingGroup")} × {groupSize}
            </span>
          )}
        </div>
        <button onClick={() => onRemove(session.id)} className="text-xs text-red-500">{t("phoneBookingRemoveSession")}</button>
      </div>

      {/* Service / Duration / Date row */}
      <div className="flex gap-2 flex-wrap mb-3">
        <div className="flex-1 min-w-[140px]">
          <label className="text-[11px] text-brand-text-secondary uppercase mb-1 block">{t("phoneBookingService")}</label>
          <select
            value={session.serviceId}
            onChange={(e) => {
              const svc = activeServices.find(s => s.id === e.target.value)
              if (svc) {
                onUpdate(session.id, {
                  serviceId: svc.id,
                  serviceName: svc.name,
                  serviceType: svc.type,
                  duration: svc.durations[0].minutes,
                  price: svc.durations[0].price,
                  staffId: "",
                  staffName: "",
                  time: "",
                  addOnIds: [],
                })
              }
            }}
            className="w-full px-2 py-2 rounded-md border border-brand-border bg-brand-bg-primary text-brand-text-primary text-sm"
          >
            <option value="">{t("phoneBookingService")}...</option>
            {activeServices.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {selectedService && (
          <div className="flex-1 min-w-[100px]">
            <label className="text-[11px] text-brand-text-secondary uppercase mb-1 block">{t("phoneBookingDuration")}</label>
            <select
              value={session.duration}
              onChange={(e) => {
                const dur = durations.find(d => d.minutes === Number(e.target.value))
                if (dur) onUpdate(session.id, { duration: dur.minutes, price: dur.price, staffId: "", staffName: "", time: "" })
              }}
              className="w-full px-2 py-2 rounded-md border border-brand-border bg-brand-bg-primary text-brand-text-primary text-sm"
            >
              {durations.map(d => (
                <option key={d.minutes} value={d.minutes}>{d.minutes} {t("min")}</option>
              ))}
            </select>
          </div>
        )}

        {selectedService && (
          <div className="flex-1 min-w-[120px]">
            <label className="text-[11px] text-brand-text-secondary uppercase mb-1 block">{t("phoneBookingDate")}</label>
            <input
              type="date"
              value={session.date}
              onChange={(e) => onUpdate(session.id, { date: e.target.value, staffId: "", staffName: "", time: "" })}
              className="w-full px-2 py-2 rounded-md border border-brand-border bg-brand-bg-primary text-brand-text-primary text-sm"
            />
          </div>
        )}
      </div>

      {/* Therapist timeline section */}
      {selectedService && session.duration && session.date && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-brand-text-primary">{t("phoneBookingSelectTherapistTime")}</div>
          </div>

          {/* Time axis */}
          <div className="flex ml-24 mb-1">
            {Array.from({ length: 11 }, (_, i) => (
              <div key={i} className="flex-1 text-[10px] text-brand-text-secondary">{10 + i}</div>
            ))}
          </div>

          {/* "Any Available" option */}
          <div className={`flex items-center gap-2 rounded-lg p-1.5 mb-1.5 transition-colors ${
            session.staffId === "any"
              ? "border-2 border-brand-primary bg-brand-primary/5"
              : "border border-brand-border bg-brand-bg-primary hover:bg-brand-bg-secondary"
          }`}>
            <button
              onClick={() => onUpdate(session.id, { staffId: "any", staffName: t("phoneBookingAnyAvailable"), time: "" })}
              className="w-24 flex items-center gap-2 shrink-0"
            >
              <div className="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center text-xs text-white font-medium">?</div>
              <div className="text-xs font-medium text-brand-text-primary">{t("phoneBookingAnyAvailable")}</div>
            </button>
            {session.staffId === "any" && (
              <select
                value={session.time}
                onChange={(e) => onUpdate(session.id, { time: e.target.value })}
                className="ml-2 px-2 py-1 rounded border border-brand-border bg-brand-bg-primary text-brand-text-primary text-xs"
              >
                <option value="">Select time...</option>
                {Array.from({ length: 22 }, (_, i) => {
                  const hour = 10 + Math.floor(i / 2)
                  const min = i % 2 === 0 ? "00" : "30"
                  if (hour >= 21) return null
                  return <option key={i} value={`${hour.toString().padStart(2, "0")}:${min}`}>{hour}:{min}</option>
                }).filter(Boolean)}
              </select>
            )}
            <div className="text-xs text-brand-text-secondary">Auto-assigns the most available therapist</div>
          </div>

          <div className="space-y-1.5">
            {sortedStaff.map(s => (
              <TherapistTimeline
                key={s.id}
                staff={s}
                date={session.date}
                existingBookings={allBookings}
                tentativeBookings={tentativeBookingsForDate.filter(tb => tb.staffId === s.id).map(tb => ({ startTime: tb.startTime, duration: tb.duration }))}
                requiredDuration={session.duration}
                selectedTime={session.staffId === s.id ? session.time : undefined}
                onSelectTime={(staffId, time) => {
                  const selectedStaff = staff.find(st => st.id === staffId)
                  onUpdate(session.id, {
                    staffId,
                    staffName: selectedStaff?.nickname || selectedStaff?.name || "",
                    time,
                  })
                }}
              />
            ))}
          </div>

          {session.staffId && session.time && (
            <div className="mt-2 rounded-lg border border-brand-border bg-brand-bg-primary px-3 py-2 flex items-center justify-between text-xs">
              <span className="text-brand-text-primary">
                <strong>{t("phoneBookingSelected")}:</strong> {session.staffName} · {session.time}–{
                  (() => {
                    const [h, m] = session.time.split(":").map(Number)
                    const end = h * 60 + m + session.duration
                    return `${Math.floor(end / 60).toString().padStart(2, "0")}:${(end % 60).toString().padStart(2, "0")}`
                  })()
                } · {session.date}
              </span>
              <span className="text-green-500">✓ {t("phoneBookingConfirmedSlot")}</span>
            </div>
          )}
        </div>
      )}

      {/* Bottom actions row */}
      <div className="flex gap-2 flex-wrap mt-2">
        {selectedService && applicableAddOns.length > 0 && (
          <button
            onClick={() => setShowAddOns(!showAddOns)}
            className="text-xs text-brand-text-secondary bg-brand-bg-primary border border-brand-border rounded px-2 py-1 hover:text-brand-text-primary transition-colors flex items-center gap-1"
          >
            {t("phoneBookingAddOns")} {showAddOns ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}

        <button
          onClick={() => {
            const newGuest: GuestData = {
              id: genGuestId(),
              name: `Guest ${session.guests.length + 1}`,
              serviceId: session.serviceId,
              serviceName: session.serviceName,
              serviceType: session.serviceType,
              duration: session.duration,
              price: session.price,
              staffId: "",
              staffName: "",
            }
            onUpdate(session.id, { guests: [...session.guests, newGuest] })
          }}
          className="text-xs text-brand-text-secondary bg-brand-bg-primary border border-brand-border rounded px-2 py-1 hover:text-brand-text-primary transition-colors"
        >
          {t("phoneBookingAddGuest")}
        </button>

        {isComplete && (
          <button
            onClick={() => onUpdate(session.id, { isCollapsed: true })}
            className="ml-auto text-xs text-green-500 hover:text-green-400 transition-colors"
          >
            ✓ Done
          </button>
        )}
      </div>

      {/* Add-ons panel */}
      {showAddOns && (
        <div className="mt-2 p-2 rounded-md border border-brand-border bg-brand-bg-primary">
          {applicableAddOns.map(addon => (
            <label key={addon.id} className="flex items-center gap-2 py-1 cursor-pointer">
              <input
                type="checkbox"
                checked={session.addOnIds.includes(addon.id)}
                onChange={(e) => {
                  const newIds = e.target.checked
                    ? [...session.addOnIds, addon.id]
                    : session.addOnIds.filter(id => id !== addon.id)
                  onUpdate(session.id, { addOnIds: newIds })
                }}
                className="rounded"
              />
              <span className="text-xs text-brand-text-primary flex-1">{addon.name}</span>
              <span className="text-xs text-brand-text-secondary">+{formatPrice(addon.price)} · +{addon.extraMinutes}min</span>
            </label>
          ))}
        </div>
      )}

      {/* Group guests */}
      {session.guests.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {session.guests.map((guest, i) => (
            <GuestRow
              key={guest.id}
              guest={guest}
              index={i}
              services={services}
              staff={qualifiedStaff}
              onUpdate={(guestId, updates) => {
                const newGuests = session.guests.map(g => g.id === guestId ? { ...g, ...updates } : g)
                onUpdate(session.id, { guests: newGuests })
              }}
              onRemove={(guestId) => {
                onUpdate(session.id, { guests: session.guests.filter(g => g.id !== guestId) })
              }}
            />
          ))}
          <button
            onClick={() => {
              const newGuest: GuestData = {
                id: genGuestId(),
                name: `Guest ${session.guests.length + 1}`,
                serviceId: session.serviceId,
                serviceName: session.serviceName,
                serviceType: session.serviceType,
                duration: session.duration,
                price: session.price,
                staffId: "",
                staffName: "",
              }
              onUpdate(session.id, { guests: [...session.guests, newGuest] })
            }}
            className="text-xs text-purple-500 hover:text-purple-400 px-2 py-1"
          >
            {t("phoneBookingAddAnotherGuest")}
          </button>
        </div>
      )}
    </div>
  )
}
