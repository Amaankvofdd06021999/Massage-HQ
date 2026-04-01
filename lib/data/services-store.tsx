"use client"

import {
  createContext, useContext, useState, useCallback, useEffect, type ReactNode,
} from "react"
import type { ServiceOption, ServiceAddOn, MassageRoom, MassageType } from "@/lib/types"
import { getSeedsForShop } from "@/lib/data/seeds"
import { useShop } from "@/lib/shop/shop-context"

// ─── Context ──────────────────────────────────────────────────────────────────

interface ServicesContextType {
  services: ServiceOption[]
  addOns: ServiceAddOn[]
  rooms: MassageRoom[]
  // Service CRUD
  createService: (s: Omit<ServiceOption, "id">) => void
  updateService: (id: string, patch: Partial<Omit<ServiceOption, "id">>) => void
  deleteService: (id: string) => void
  // Add-on CRUD
  createAddOn: (a: Omit<ServiceAddOn, "id">) => void
  updateAddOn: (id: string, patch: Partial<Omit<ServiceAddOn, "id">>) => void
  deleteAddOn: (id: string) => void
  // Room CRUD
  createRoom: (r: Omit<MassageRoom, "id">) => void
  updateRoom: (id: string, patch: Partial<Omit<MassageRoom, "id">>) => void
  deleteRoom: (id: string) => void
  // Helpers
  getAddOnsForService: (type: MassageType) => ServiceAddOn[]
  getActiveRooms: () => MassageRoom[]
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined)

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function load<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : seed
  } catch {
    return seed
  }
}

function save<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ServicesProvider({ children }: { children: ReactNode }) {
  const { shopId } = useShop()
  const prefix = shopId ?? "koko"
  const SERVICES_KEY = `${prefix}-services`
  const ADDONS_KEY = `${prefix}-addons`
  const ROOMS_KEY = `${prefix}-rooms-v2`

  const [services, setServices] = useState<ServiceOption[]>([])
  const [addOns, setAddOns]     = useState<ServiceAddOn[]>([])
  const [rooms, setRooms]       = useState<MassageRoom[]>([])
  const [ready, setReady]       = useState(false)

  useEffect(() => {
    setReady(false)
    const seeds = getSeedsForShop(prefix)
    setServices(load(SERVICES_KEY, seeds.services))
    setAddOns(load(ADDONS_KEY, seeds.addOns))
    setRooms(load(ROOMS_KEY, seeds.rooms))
    setReady(true)
  }, [shopId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (ready) save(SERVICES_KEY, services) }, [services, ready])
  useEffect(() => { if (ready) save(ADDONS_KEY, addOns) },     [addOns, ready])
  useEffect(() => { if (ready) save(ROOMS_KEY, rooms) },       [rooms, ready])

  // ── Service CRUD ──
  const createService = useCallback((s: Omit<ServiceOption, "id">) => {
    setServices((prev) => [...prev, { ...s, id: genId("srv") }])
  }, [])
  const updateService = useCallback((id: string, patch: Partial<Omit<ServiceOption, "id">>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }, [])
  const deleteService = useCallback((id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id))
  }, [])

  // ── Add-on CRUD ──
  const createAddOn = useCallback((a: Omit<ServiceAddOn, "id">) => {
    setAddOns((prev) => [...prev, { ...a, id: genId("add") }])
  }, [])
  const updateAddOn = useCallback((id: string, patch: Partial<Omit<ServiceAddOn, "id">>) => {
    setAddOns((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }, [])
  const deleteAddOn = useCallback((id: string) => {
    setAddOns((prev) => prev.filter((a) => a.id !== id))
  }, [])

  // ── Room CRUD ──
  const createRoom = useCallback((r: Omit<MassageRoom, "id">) => {
    setRooms((prev) => [...prev, { ...r, id: genId("rm") }])
  }, [])
  const updateRoom = useCallback((id: string, patch: Partial<Omit<MassageRoom, "id">>) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }, [])
  const deleteRoom = useCallback((id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id))
  }, [])

  // ── Helpers ──
  const getAddOnsForService = useCallback(
    (type: MassageType) =>
      addOns.filter(
        (a) => a.isActive && (a.applicableServices === "all" || a.applicableServices.includes(type))
      ),
    [addOns]
  )

  const getActiveRooms = useCallback(
    () => rooms.filter((r) => r.isActive),
    [rooms]
  )

  return (
    <ServicesContext.Provider
      value={{
        services, addOns, rooms,
        createService, updateService, deleteService,
        createAddOn, updateAddOn, deleteAddOn,
        createRoom, updateRoom, deleteRoom,
        getAddOnsForService, getActiveRooms,
      }}
    >
      {children}
    </ServicesContext.Provider>
  )
}

export function useServices() {
  const ctx = useContext(ServicesContext)
  if (!ctx) throw new Error("useServices must be used within ServicesProvider")
  return ctx
}
