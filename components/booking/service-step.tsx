"use client"

import { Check, Package, Plus, Sparkles, UserPlus, X, Users } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"
import { useServices } from "@/lib/data/services-store"
import { formatPrice } from "@/lib/utils/formatters"
import { cn } from "@/lib/utils"
import type { ServiceOption, MassageType, ServiceAddOn, BookingGuestDraft } from "@/lib/types"

interface ServiceStepProps {
  sortedServices: ServiceOption[]
  selectedService: ServiceOption | null
  selectedDuration: number | null
  selectedAddOnIds: string[]
  recommendedTypes: Set<MassageType>
  onSelectService: (svc: ServiceOption) => void
  onSelectDuration: (minutes: number) => void
  onToggleAddOn: (id: string) => void
  isGroupBooking: boolean
  guests: BookingGuestDraft[]
  onToggleGroupBooking: () => void
  onAddGuest: () => void
  onRemoveGuest: (id: string) => void
  onUpdateGuest: (id: string, partial: Partial<BookingGuestDraft>) => void
}

export function ServiceStep({
  sortedServices,
  selectedService,
  selectedDuration,
  selectedAddOnIds,
  recommendedTypes,
  onSelectService,
  onSelectDuration,
  onToggleAddOn,
  isGroupBooking,
  guests,
  onToggleGroupBooking,
  onAddGuest,
  onRemoveGuest,
  onUpdateGuest,
}: ServiceStepProps) {
  const { t } = useLanguage()
  const { getAddOnsForService } = useServices()

  return (
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

      {/* Group Booking Toggle */}
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleGroupBooking}
          className={cn(
            "flex-1 rounded-xl border py-2.5 text-center text-xs font-medium transition-all",
            !isGroupBooking
              ? "border-brand-primary bg-brand-primary/15 text-brand-primary"
              : "border-brand-border bg-card text-brand-text-secondary"
          )}
        >
          {t("justMe")}
        </button>
        <button
          type="button"
          onClick={onToggleGroupBooking}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-medium transition-all",
            isGroupBooking
              ? "border-brand-primary bg-brand-primary/15 text-brand-primary"
              : "border-brand-border bg-card text-brand-text-secondary"
          )}
        >
          <Users size={14} />
          {t("groupBooking")}
        </button>
      </div>

      {/* Guest Cards */}
      {isGroupBooking && (
        <div className="mt-3 space-y-2">
          {guests.map((guest, idx) => (
            <div key={guest.id} className="rounded-xl border border-brand-border bg-card p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-brand-text-secondary">
                  {t("guestService")} {guest.name || `Guest ${idx + 1}`}
                </p>
                <button
                  type="button"
                  onClick={() => onRemoveGuest(guest.id)}
                  className="flex items-center gap-1 text-[10px] text-brand-coral hover:text-brand-coral/80"
                >
                  <X size={12} />
                  {t("removeGuest")}
                </button>
              </div>
              <input
                type="text"
                value={guest.name}
                onChange={(e) => onUpdateGuest(guest.id, { name: e.target.value })}
                placeholder={t("guestNamePlaceholder")}
                className={cn(
                  "w-full rounded-lg border bg-brand-bg-tertiary px-3 py-2 text-sm text-brand-text-primary placeholder:text-brand-text-tertiary focus:border-brand-primary focus:outline-none",
                  !guest.name ? "border-brand-coral/40" : "border-brand-border"
                )}
              />
              {/* Guest service picker */}
              <div className="mt-2 flex flex-col gap-1.5">
                {sortedServices.map((svc) => (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => {
                      const dur = svc.durations[0]
                      onUpdateGuest(guest.id, {
                        serviceId: svc.id,
                        serviceName: svc.name,
                        serviceType: svc.type,
                        duration: dur.minutes,
                        price: dur.price,
                      })
                    }}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition-all",
                      guest.serviceId === svc.id
                        ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                        : "border-brand-border bg-brand-bg-tertiary text-brand-text-secondary"
                    )}
                  >
                    <span className="font-medium">{svc.name}</span>
                    <span>{formatPrice(svc.durations[0].price)}</span>
                  </button>
                ))}
              </div>
              {/* Guest duration picker */}
              {guest.serviceId && (() => {
                const guestSvc = sortedServices.find((s) => s.id === guest.serviceId)
                if (!guestSvc || guestSvc.durations.length <= 1) return null
                return (
                  <div className="mt-2 flex gap-1.5 flex-wrap">
                    {guestSvc.durations.map((d) => (
                      <button
                        key={d.minutes}
                        type="button"
                        onClick={() => onUpdateGuest(guest.id, { duration: d.minutes, price: d.price })}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-[10px] font-medium transition-colors",
                          guest.duration === d.minutes
                            ? "border-brand-primary bg-brand-primary/15 text-brand-primary"
                            : "border-brand-border bg-brand-bg-tertiary text-brand-text-secondary"
                        )}
                      >
                        {d.minutes} {t("min")} — {formatPrice(d.price)}
                      </button>
                    ))}
                  </div>
                )
              })()}
            </div>
          ))}
          {guests.length < 2 && (
            <button
              type="button"
              onClick={onAddGuest}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-brand-primary/40 py-3 text-xs font-medium text-brand-primary transition-colors hover:bg-brand-primary/5"
            >
              <UserPlus size={14} />
              {t("addGuest")}
            </button>
          )}
          {guests.length >= 2 && (
            <p className="text-center text-[10px] text-brand-text-tertiary">{t("maxGuestsReached")}</p>
          )}
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
                onClick={() => onSelectService(svc)}
                className="w-full p-4 text-left card-press"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary">
                          <Check size={11} className="text-primary-foreground" />
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
                        onClick={() => onSelectDuration(d.minutes)}
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
                              onClick={() => onToggleAddOn(addOn.id)}
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
                                  ? "border-brand-primary bg-brand-primary text-primary-foreground"
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
  )
}
