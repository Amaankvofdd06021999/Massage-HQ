"use client"

import {
  createContext, useContext, useState, useCallback, useEffect, type ReactNode,
} from "react"
import type { ServiceOption, ServiceAddOn, MassageRoom, MassageType } from "@/lib/types"

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_SERVICES: ServiceOption[] = [
  {
    id: "srv1", name: "Traditional Thai Massage", type: "thai",
    description: "Ancient healing art combining acupressure, stretching, and energy work along the body's sen lines.",
    durations: [{ minutes: 60, price: 800 }, { minutes: 90, price: 1100 }, { minutes: 120, price: 1400 }],
    isPopular: true, isActive: true,
  },
  {
    id: "srv2", name: "Swedish Relaxation", type: "swedish",
    description: "Classic long-stroke massage for full-body relaxation, improved circulation and stress relief.",
    durations: [{ minutes: 60, price: 900 }, { minutes: 90, price: 1200 }, { minutes: 120, price: 1500 }],
    isPopular: true, isActive: true,
  },
  {
    id: "srv3", name: "Deep Tissue Therapy", type: "deep-tissue",
    description: "Intense pressure targeting deep muscle layers to release chronic tension and knots.",
    durations: [{ minutes: 60, price: 1000 }, { minutes: 90, price: 1400 }, { minutes: 120, price: 1800 }],
    isPopular: true, isActive: true,
  },
  {
    id: "srv4", name: "Aromatherapy Bliss", type: "aromatherapy",
    description: "Therapeutic massage enhanced with premium essential oil blends for mind-body harmony.",
    durations: [{ minutes: 60, price: 1000 }, { minutes: 90, price: 1350 }, { minutes: 120, price: 1700 }],
    isPopular: false, isActive: true,
  },
  {
    id: "srv5", name: "Hot Stone Therapy", type: "hot-stone",
    description: "Heated basalt stones placed along energy centres while soothing strokes melt away tension.",
    durations: [{ minutes: 60, price: 1100 }, { minutes: 90, price: 1500 }, { minutes: 120, price: 1900 }],
    isPopular: false, isActive: true,
  },
  {
    id: "srv6", name: "Sports Recovery", type: "sports",
    description: "Athletic-focused treatment combining deep pressure, stretching, and targeted trigger point therapy.",
    durations: [{ minutes: 60, price: 1100 }, { minutes: 90, price: 1500 }],
    isPopular: false, isActive: true,
  },
  {
    id: "srv7", name: "Reflexology", type: "reflexology",
    description: "Pressure point therapy on feet and hands stimulating corresponding organs and systems.",
    durations: [{ minutes: 30, price: 500 }, { minutes: 60, price: 900 }],
    isPopular: false, isActive: true,
  },
  {
    id: "srv8", name: "Japanese Shiatsu", type: "shiatsu",
    description: "Rhythmic finger pressure along meridian lines to restore energy balance and relieve pain.",
    durations: [{ minutes: 60, price: 1200 }, { minutes: 90, price: 1600 }],
    isPopular: false, isActive: true,
  },
]

const SEED_ADDONS: ServiceAddOn[] = [
  {
    id: "add1", name: "Premium Essential Oils", isActive: true,
    description: "Upgrade to our signature blend of lavender, eucalyptus, and rose oils.",
    price: 150, extraMinutes: 0,
    applicableServices: ["swedish", "thai", "deep-tissue", "sports"],
  },
  {
    id: "add2", name: "Hot Herbal Compress", isActive: true,
    description: "Traditional Thai herbal ball steamed and pressed across the body to release muscle tension.",
    price: 200, extraMinutes: 10,
    applicableServices: ["thai"],
  },
  {
    id: "add3", name: "Scalp & Hair Mask", isActive: true,
    description: "Nourishing coconut-infused scalp massage with a leave-in hair treatment.",
    price: 180, extraMinutes: 15,
    applicableServices: "all",
  },
  {
    id: "add4", name: "Foot Scrub & Soak", isActive: true,
    description: "Exfoliating salt scrub followed by a warm aromatic foot bath before your session.",
    price: 120, extraMinutes: 10,
    applicableServices: "all",
  },
  {
    id: "add5", name: "Back Scrub Upgrade", isActive: true,
    description: "Coffee and coconut sugar exfoliation on the back before your massage begins.",
    price: 160, extraMinutes: 10,
    applicableServices: ["swedish", "deep-tissue", "hot-stone"],
  },
  {
    id: "add6", name: "Extended Reflexology Add-on", isActive: true,
    description: "15 minutes of focused foot reflexology appended to your main session.",
    price: 250, extraMinutes: 15,
    applicableServices: ["thai", "swedish", "deep-tissue", "aromatherapy"],
  },
]

const SEED_ROOMS: MassageRoom[] = [
  {
    id: "rm1", name: "Room 1", type: "room", capacity: 1,
    floor: "Ground Floor",
    description: "Standard treatment room with calming ambient lighting.",
    image: "https://images.pexels.com/photos/11774389/pexels-photo-11774389.jpeg?auto=compress&cs=tinysrgb&w=600",
    isActive: true,
  },
  {
    id: "rm2", name: "Room 2", type: "room", capacity: 1,
    floor: "Ground Floor",
    description: "Standard treatment room facing the garden.",
    image: "https://images.pexels.com/photos/3865792/pexels-photo-3865792.jpeg?auto=compress&cs=tinysrgb&w=600",
    isActive: true,
  },
  {
    id: "rm3", name: "Room 3", type: "room", capacity: 1,
    floor: "Ground Floor",
    description: "Standard treatment room with extra ventilation.",
    image: "https://images.pexels.com/photos/35546242/pexels-photo-35546242.jpeg?auto=compress&cs=tinysrgb&w=600",
    isActive: true,
  },
  {
    id: "rm4", name: "VIP Suite A", type: "suite", capacity: 1,
    floor: "1st Floor",
    description: "Luxury private suite with rainfall shower and dedicated relaxation lounge.",
    image: "https://images.pexels.com/photos/5240818/pexels-photo-5240818.jpeg?auto=compress&cs=tinysrgb&w=600",
    isActive: true,
  },
  {
    id: "rm5", name: "VIP Suite B", type: "suite", capacity: 1,
    floor: "1st Floor",
    description: "Luxury private suite with panoramic garden view and en-suite bath.",
    image: "https://images.pexels.com/photos/5240808/pexels-photo-5240808.jpeg?auto=compress&cs=tinysrgb&w=600",
    isActive: true,
  },
  {
    id: "rm6", name: "Couples Suite", type: "couple", capacity: 2,
    floor: "1st Floor",
    description: "Spacious double-bed room designed for couples sessions side by side.",
    image: "https://images.pexels.com/photos/3760262/pexels-photo-3760262.jpeg?auto=compress&cs=tinysrgb&w=600",
    isActive: true,
  },
  {
    id: "rm7", name: "Bed 1", type: "bed", capacity: 1,
    floor: "Ground Floor",
    description: "Open-plan relaxation bed in the main wellness area.",
    image: "https://images.pexels.com/photos/9146378/pexels-photo-9146378.jpeg?auto=compress&cs=tinysrgb&w=600",
    isActive: true,
  },
  {
    id: "rm8", name: "Bed 2", type: "bed", capacity: 1,
    floor: "Ground Floor",
    description: "Open-plan relaxation bed in the main wellness area.",
    image: "https://images.pexels.com/photos/6628599/pexels-photo-6628599.jpeg?auto=compress&cs=tinysrgb&w=600",
    isActive: true,
  },
]

// ─── Storage keys ─────────────────────────────────────────────────────────────

const SERVICES_KEY = "koko-services"
const ADDONS_KEY   = "koko-addons"
const ROOMS_KEY    = "koko-rooms-v2"

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
  const [services, setServices] = useState<ServiceOption[]>(SEED_SERVICES)
  const [addOns, setAddOns]     = useState<ServiceAddOn[]>(SEED_ADDONS)
  const [rooms, setRooms]       = useState<MassageRoom[]>(SEED_ROOMS)
  const [ready, setReady]       = useState(false)

  useEffect(() => {
    setServices(load(SERVICES_KEY, SEED_SERVICES))
    setAddOns(load(ADDONS_KEY, SEED_ADDONS))
    setRooms(load(ROOMS_KEY, SEED_ROOMS))
    setReady(true)
  }, [])

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
