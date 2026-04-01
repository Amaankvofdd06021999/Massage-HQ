"use client"

import { useState } from "react"
import { Plus, Sparkles, Package, DoorOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { useServices } from "@/lib/data/services-store"
import { useLanguage } from "@/lib/i18n/language-context"
import { ROOM_TYPE_COLORS } from "@/lib/constants"
import type { ServiceOption, ServiceAddOn, MassageRoom, RoomType } from "@/lib/types"

import { ServiceModal } from "@/components/admin/services/service-modal"
import { AddOnModal } from "@/components/admin/services/addon-modal"
import { RoomModal } from "@/components/admin/services/room-modal"
import { ServiceCard } from "@/components/admin/services/service-card"
import { AddOnCard } from "@/components/admin/services/addon-card"
import { RoomCard } from "@/components/admin/services/room-card"
import { DeleteConfirm } from "@/components/admin/services/delete-confirm"

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "services" | "addons" | "rooms"
type Modal =
  | { kind: "new-service" }
  | { kind: "edit-service"; service: ServiceOption }
  | { kind: "delete-service"; service: ServiceOption }
  | { kind: "new-addon" }
  | { kind: "edit-addon"; addOn: ServiceAddOn }
  | { kind: "delete-addon"; addOn: ServiceAddOn }
  | { kind: "new-room" }
  | { kind: "edit-room"; room: MassageRoom }
  | { kind: "delete-room"; room: MassageRoom }
  | null

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const { t } = useLanguage()
  const { services, addOns, rooms, createService, updateService, deleteService, createAddOn, updateAddOn, deleteAddOn, createRoom, updateRoom, deleteRoom } = useServices()
  const [tab, setTab] = useState<Tab>("services")
  const [modal, setModal] = useState<Modal>(null)

  function handleSaveService(draft: Parameters<typeof createService>[0]) {
    if (modal?.kind === "edit-service") updateService(modal.service.id, draft)
    else createService(draft)
    setModal(null)
  }
  function handleSaveAddOn(draft: Parameters<typeof createAddOn>[0]) {
    if (modal?.kind === "edit-addon") updateAddOn(modal.addOn.id, draft)
    else createAddOn(draft)
    setModal(null)
  }
  function handleSaveRoom(draft: Parameters<typeof createRoom>[0]) {
    if (modal?.kind === "edit-room") updateRoom(modal.room.id, draft)
    else createRoom(draft)
    setModal(null)
  }

  const newButtonLabel = tab === "services" ? t("addService") : tab === "addons" ? t("addAddOn") : t("addRoom")
  const newButtonModal: Modal = tab === "services" ? { kind: "new-service" } : tab === "addons" ? { kind: "new-addon" } : { kind: "new-room" }

  const activeRooms = rooms.filter((r) => r.isActive).length

  const roomTypeLabels: Record<RoomType, string> = {
    room: t("roomTypePrivate"),
    bed: t("roomTypeOpenBed"),
    suite: t("roomTypeVIP"),
    couple: t("roomTypeCouple"),
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-text-primary">{t("navServices")}</h1>
          <p className="mt-0.5 text-sm text-brand-text-secondary">{t("massageTypes")}, {t("addOnsTab")}, {t("roomsBedsTab")}</p>
        </div>
        <button type="button" onClick={() => setModal(newButtonModal)}
          className="flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
          <Plus size={16} /> {newButtonLabel}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-brand-border bg-brand-bg-secondary p-1">
        {([
          { id: "services" as Tab, label: t("massageTypes"), icon: <Sparkles size={14} />, count: `${services.filter((s) => s.isActive).length}/${services.length}` },
          { id: "addons"   as Tab, label: t("addOnsTab"),    icon: <Package size={14} />,  count: `${addOns.filter((a) => a.isActive).length}/${addOns.length}` },
          { id: "rooms"    as Tab, label: t("roomsBedsTab"), icon: <DoorOpen size={14} />, count: `${activeRooms}/${rooms.length}` },
        ]).map((tabItem) => (
          <button key={tabItem.id} type="button" onClick={() => setTab(tabItem.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors",
              tab === tabItem.id ? "bg-brand-primary text-primary-foreground" : "text-brand-text-secondary hover:text-brand-text-primary"
            )}>
            {tabItem.icon} {tabItem.label}
            <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold", tab === tabItem.id ? "bg-primary-foreground/20" : "bg-brand-bg-tertiary")}>
              {tabItem.count}
            </span>
          </button>
        ))}
      </div>

      {/* Services list */}
      {tab === "services" && (
        <div className="space-y-3">
          {services.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-border py-16 text-center">
              <Sparkles size={32} className="mb-3 text-brand-text-tertiary" />
              <p className="text-sm font-medium text-brand-text-secondary">{t("noServices")}</p>
            </div>
          ) : services.map((service) => (
            <ServiceCard key={service.id} service={service}
              onEdit={() => setModal({ kind: "edit-service", service })}
              onDelete={() => setModal({ kind: "delete-service", service })}
              onToggle={() => updateService(service.id, { isActive: !service.isActive })} />
          ))}
        </div>
      )}

      {/* Add-ons list */}
      {tab === "addons" && (
        <div className="space-y-3">
          {addOns.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-border py-16 text-center">
              <Package size={32} className="mb-3 text-brand-text-tertiary" />
              <p className="text-sm font-medium text-brand-text-secondary">{t("noAddOns")}</p>
            </div>
          ) : addOns.map((addOn) => (
            <AddOnCard key={addOn.id} addOn={addOn}
              onEdit={() => setModal({ kind: "edit-addon", addOn })}
              onDelete={() => setModal({ kind: "delete-addon", addOn })}
              onToggle={() => updateAddOn(addOn.id, { isActive: !addOn.isActive })} />
          ))}
        </div>
      )}

      {/* Rooms list */}
      {tab === "rooms" && (
        <div className="space-y-3">
          {rooms.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {(["room", "bed", "suite", "couple"] as RoomType[]).map((type) => {
                const count = rooms.filter((r) => r.type === type && r.isActive).length
                return (
                  <div key={type} className="rounded-xl border border-brand-border bg-card p-3 text-center">
                    <p className={cn("text-lg font-bold", ROOM_TYPE_COLORS[type].split(" ")[1])}>{count}</p>
                    <p className="text-[10px] text-brand-text-tertiary mt-0.5">{roomTypeLabels[type]}</p>
                  </div>
                )
              })}
            </div>
          )}

          {rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-border py-16 text-center">
              <DoorOpen size={32} className="mb-3 text-brand-text-tertiary" />
              <p className="text-sm font-medium text-brand-text-secondary">{t("noRooms")}</p>
            </div>
          ) : rooms.map((room) => (
            <RoomCard key={room.id} room={room}
              onEdit={() => setModal({ kind: "edit-room", room })}
              onDelete={() => setModal({ kind: "delete-room", room })}
              onToggle={() => updateRoom(room.id, { isActive: !room.isActive })} />
          ))}
        </div>
      )}

      {/* Modals */}
      {(modal?.kind === "new-service" || modal?.kind === "edit-service") && (
        <ServiceModal initial={modal.kind === "edit-service" ? modal.service : undefined} onSave={handleSaveService} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "delete-service" && (
        <DeleteConfirm name={modal.service.name} onConfirm={() => { deleteService(modal.service.id); setModal(null) }} onCancel={() => setModal(null)} />
      )}
      {(modal?.kind === "new-addon" || modal?.kind === "edit-addon") && (
        <AddOnModal initial={modal.kind === "edit-addon" ? modal.addOn : undefined} onSave={handleSaveAddOn} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "delete-addon" && (
        <DeleteConfirm name={modal.addOn.name} onConfirm={() => { deleteAddOn(modal.addOn.id); setModal(null) }} onCancel={() => setModal(null)} />
      )}
      {(modal?.kind === "new-room" || modal?.kind === "edit-room") && (
        <RoomModal initial={modal.kind === "edit-room" ? modal.room : undefined} onSave={handleSaveRoom} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "delete-room" && (
        <DeleteConfirm name={modal.room.name} onConfirm={() => { deleteRoom(modal.room.id); setModal(null) }} onCancel={() => setModal(null)} />
      )}
    </div>
  )
}
