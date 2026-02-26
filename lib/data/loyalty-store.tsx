"use client"

import {
  createContext, useContext, useState, useCallback, useEffect, type ReactNode,
} from "react"
import type {
  LoyaltyConfig, LoyaltyStamp, LoyaltyRedemption, LoyaltyPointRedemption, MassageType,
} from "@/lib/types"
import {
  loyaltyConfig as SEED_CONFIG,
  loyaltyStamps as SEED_STAMPS,
  loyaltyRedemptions as SEED_REDEMPTIONS,
  loyaltyPointRedemptions as SEED_POINT_REDEMPTIONS,
} from "@/lib/data/mock-data"

const CONFIG_KEY = "koko-loyalty-config"
const STAMPS_KEY = "koko-loyalty-stamps"
const REDEMPTIONS_KEY = "koko-loyalty-redemptions"
const POINT_REDEMPTIONS_KEY = "koko-loyalty-point-redemptions"

interface LoyaltyContextType {
  config: LoyaltyConfig
  stamps: LoyaltyStamp[]
  redemptions: LoyaltyRedemption[]
  pointRedemptions: LoyaltyPointRedemption[]
  // Stamps
  earnStamp: (customerId: string, bookingId: string, serviceType: MassageType) => void
  getStampsForCustomer: (customerId: string) => LoyaltyStamp[]
  getStampCount: (customerId: string) => number
  canRedeemStamps: (customerId: string) => boolean
  redeemFreeSession: (customerId: string, serviceType: MassageType, bookingId?: string) => LoyaltyRedemption | null
  // Points
  calculatePoints: (amountSpent: number) => number
  getPointsBalance: (customerId: string, totalSpent: number) => number
  canRedeemPoints: (customerId: string, totalSpent: number, pointsToRedeem: number) => boolean
  redeemPoints: (customerId: string, pointsUsed: number, discountAmount: number, bookingId?: string) => LoyaltyPointRedemption | null
  getPointRedemptionsForCustomer: (customerId: string) => LoyaltyPointRedemption[]
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined)

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

export function LoyaltyProvider({ children }: { children: ReactNode }) {
  const [config] = useState<LoyaltyConfig>(SEED_CONFIG)
  const [stamps, setStamps] = useState<LoyaltyStamp[]>(SEED_STAMPS)
  const [redemptions, setRedemptions] = useState<LoyaltyRedemption[]>(SEED_REDEMPTIONS)
  const [pointRedemptions, setPointRedemptions] = useState<LoyaltyPointRedemption[]>(SEED_POINT_REDEMPTIONS)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setStamps(load(STAMPS_KEY, SEED_STAMPS))
    setRedemptions(load(REDEMPTIONS_KEY, SEED_REDEMPTIONS))
    setPointRedemptions(load(POINT_REDEMPTIONS_KEY, SEED_POINT_REDEMPTIONS))
    setReady(true)
  }, [])

  useEffect(() => { if (ready) save(STAMPS_KEY, stamps) }, [stamps, ready])
  useEffect(() => { if (ready) save(REDEMPTIONS_KEY, redemptions) }, [redemptions, ready])
  useEffect(() => { if (ready) save(POINT_REDEMPTIONS_KEY, pointRedemptions) }, [pointRedemptions, ready])

  const earnStamp = useCallback((customerId: string, bookingId: string, serviceType: MassageType) => {
    const stamp: LoyaltyStamp = {
      id: genId("ls"),
      customerId,
      bookingId,
      earnedAt: new Date().toISOString(),
      serviceType,
    }
    setStamps((prev) => [...prev, stamp])
  }, [])

  const getStampsForCustomer = useCallback(
    (customerId: string) => stamps.filter((s) => s.customerId === customerId),
    [stamps]
  )

  const getStampCount = useCallback(
    (customerId: string) => {
      const earned = stamps.filter((s) => s.customerId === customerId).length
      const used = redemptions
        .filter((r) => r.customerId === customerId)
        .reduce((sum, r) => sum + r.stampsUsed, 0)
      return earned - used
    },
    [stamps, redemptions]
  )

  const canRedeemStamps = useCallback(
    (customerId: string) => {
      const count = getStampCount(customerId)
      return count >= config.stampsForFreeSession
    },
    [getStampCount, config.stampsForFreeSession]
  )

  const redeemFreeSession = useCallback(
    (customerId: string, serviceType: MassageType, bookingId?: string): LoyaltyRedemption | null => {
      if (!canRedeemStamps(customerId)) return null
      const redemption: LoyaltyRedemption = {
        id: genId("lr"),
        customerId,
        stampsUsed: config.stampsForFreeSession,
        bookingId,
        redeemedAt: new Date().toISOString(),
        serviceType,
        type: "stamp",
      }
      setRedemptions((prev) => [...prev, redemption])
      return redemption
    },
    [canRedeemStamps, config.stampsForFreeSession]
  )

  const calculatePoints = useCallback(
    (amountSpent: number) => Math.floor(amountSpent / config.spendUnit) * config.pointsPerSpend,
    [config]
  )

  const getPointsBalance = useCallback(
    (customerId: string, totalSpent: number) => {
      const totalEarned = calculatePoints(totalSpent)
      const totalUsed = pointRedemptions
        .filter((r) => r.customerId === customerId)
        .reduce((sum, r) => sum + r.pointsUsed, 0)
      return totalEarned - totalUsed
    },
    [calculatePoints, pointRedemptions]
  )

  const canRedeemPoints = useCallback(
    (customerId: string, totalSpent: number, pointsToRedeem: number) => {
      return getPointsBalance(customerId, totalSpent) >= pointsToRedeem
    },
    [getPointsBalance]
  )

  const redeemPoints = useCallback(
    (customerId: string, pointsUsed: number, discountAmount: number, bookingId?: string): LoyaltyPointRedemption | null => {
      const redemption: LoyaltyPointRedemption = {
        id: genId("lpr"),
        customerId,
        pointsUsed,
        discountAmount,
        bookingId,
        redeemedAt: new Date().toISOString(),
        type: "points",
      }
      setPointRedemptions((prev) => [...prev, redemption])
      return redemption
    },
    []
  )

  const getPointRedemptionsForCustomer = useCallback(
    (customerId: string) => pointRedemptions.filter((r) => r.customerId === customerId),
    [pointRedemptions]
  )

  return (
    <LoyaltyContext.Provider value={{
      config, stamps, redemptions, pointRedemptions,
      earnStamp, getStampsForCustomer, getStampCount,
      canRedeemStamps, redeemFreeSession,
      calculatePoints, getPointsBalance, canRedeemPoints,
      redeemPoints, getPointRedemptionsForCustomer,
    }}>
      {children}
    </LoyaltyContext.Provider>
  )
}

export function useLoyalty() {
  const ctx = useContext(LoyaltyContext)
  if (!ctx) throw new Error("useLoyalty must be used within LoyaltyProvider")
  return ctx
}
