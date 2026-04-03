"use client"

import { X } from "lucide-react"
import { ServiceOption, StaffMember } from "@/lib/types"
import { useLanguage } from "@/lib/i18n/language-context"

export interface GuestData {
  id: string
  name: string
  serviceId: string
  serviceName: string
  serviceType: string
  duration: number
  price: number
  staffId: string
  staffName: string
}

interface GuestRowProps {
  guest: GuestData
  index: number
  services: ServiceOption[]
  staff: StaffMember[]
  onUpdate: (id: string, updates: Partial<GuestData>) => void
  onRemove: (id: string) => void
}

export function GuestRow({ guest, index, services, staff, onUpdate, onRemove }: GuestRowProps) {
  const { t } = useLanguage()

  const activeServices = services.filter(s => s.isActive)
  const selectedService = activeServices.find(s => s.id === guest.serviceId)

  return (
    <div className="flex gap-2 flex-wrap p-2 bg-brand-bg-primary rounded-md">
      <div className="w-full flex items-center gap-2 mb-1">
        <span className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-[9px] text-white">
          G{index + 1}
        </span>
        <strong className="text-xs text-brand-text-primary">{t("phoneBookingGuest")} {index + 1}</strong>
        <input
          type="text"
          value={guest.name === `Guest ${index + 1}` ? "" : guest.name}
          onChange={(e) => onUpdate(guest.id, { name: e.target.value || `Guest ${index + 1}` })}
          placeholder={t("phoneBookingGuestName")}
          className="bg-brand-bg-secondary border border-brand-border rounded px-2 py-0.5 text-xs text-brand-text-primary w-28"
        />
        <button
          onClick={() => onRemove(guest.id)}
          className="ml-auto text-red-500 hover:text-red-400"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <select
          value={guest.serviceId}
          onChange={(e) => {
            const svc = activeServices.find(s => s.id === e.target.value)
            if (svc) {
              onUpdate(guest.id, {
                serviceId: svc.id,
                serviceName: svc.name,
                serviceType: svc.type,
                duration: svc.durations[0].minutes,
                price: svc.durations[0].price,
              })
            }
          }}
          className="bg-brand-bg-secondary border border-brand-border rounded px-2 py-1 text-xs text-brand-text-primary"
        >
          <option value="">{t("phoneBookingService")}</option>
          {activeServices.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        {selectedService && (
          <select
            value={guest.duration}
            onChange={(e) => {
              const dur = selectedService.durations.find(d => d.minutes === Number(e.target.value))
              if (dur) onUpdate(guest.id, { duration: dur.minutes, price: dur.price })
            }}
            className="bg-brand-bg-secondary border border-brand-border rounded px-2 py-1 text-xs text-brand-text-primary"
          >
            {selectedService.durations.map(d => (
              <option key={d.minutes} value={d.minutes}>{d.minutes}min</option>
            ))}
          </select>
        )}

        <select
          value={guest.staffId}
          onChange={(e) => {
            const s = staff.find(s => s.id === e.target.value)
            if (s) onUpdate(guest.id, { staffId: s.id, staffName: s.nickname || s.name })
          }}
          className="bg-brand-bg-secondary border border-brand-border rounded px-2 py-1 text-xs text-brand-text-primary"
        >
          <option value="">{t("phoneBookingAnyAvailable")}</option>
          {staff.map(s => (
            <option key={s.id} value={s.id}>{s.nickname || s.name}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
