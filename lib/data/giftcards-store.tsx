"use client"

import {
  createContext, useContext, useState, useCallback, useEffect, type ReactNode,
} from "react"
import type { GiftCard, MassageType } from "@/lib/types"
import { getSeedsForShop } from "@/lib/data/seeds"
import { useShop } from "@/lib/shop/shop-context"

interface GiftCardsContextType {
  giftCards: GiftCard[]
  addGiftCard: (card: Omit<GiftCard, "id" | "code" | "status" | "purchasedAt">) => GiftCard
  purchaseGiftCard: (opts: {
    purchasedBy: string
    purchaserName: string
    recipientName: string
    recipientEmail: string
    message?: string
    amount: number
    applicableServices: MassageType[] | "all"
  }) => GiftCard
  redeemGiftCard: (code: string, amount: number, bookingId?: string) => boolean
  validateGiftCard: (code: string) => GiftCard | null
  getGiftCardsForCustomer: (customerId: string) => GiftCard[]
  getReceivedGiftCards: (email: string) => GiftCard[]
}

const GiftCardsContext = createContext<GiftCardsContextType | undefined>(undefined)

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function genCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const seg = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `GIFT-${seg(4)}-${seg(4)}`
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

export function GiftCardsProvider({ children }: { children: ReactNode }) {
  const { shopId } = useShop()
  const prefix = shopId ?? "koko"
  const GIFTCARDS_KEY = `${prefix}-giftcards`

  const [cards, setCards] = useState<GiftCard[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
    const seeds = getSeedsForShop(prefix)
    setCards(load(GIFTCARDS_KEY, seeds.giftCards))
    setReady(true)
  }, [shopId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (ready) save(GIFTCARDS_KEY, cards) }, [cards, ready])

  const addGiftCard = useCallback((card: Omit<GiftCard, "id" | "code" | "status" | "purchasedAt">): GiftCard => {
    const newCard: GiftCard = {
      ...card,
      id: genId("gc"),
      code: genCode(),
      status: "active",
      purchasedAt: new Date().toISOString(),
    }
    setCards((prev) => [...prev, newCard])
    return newCard
  }, [])

  const purchaseGiftCard = useCallback((opts: {
    purchasedBy: string
    purchaserName: string
    recipientName: string
    recipientEmail: string
    message?: string
    amount: number
    applicableServices: MassageType[] | "all"
  }): GiftCard => {
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)
    const newCard: GiftCard = {
      id: genId("gc"),
      code: genCode(),
      purchasedBy: opts.purchasedBy,
      purchaserName: opts.purchaserName,
      recipientName: opts.recipientName,
      recipientEmail: opts.recipientEmail,
      message: opts.message,
      originalBalance: opts.amount,
      currentBalance: opts.amount,
      applicableServices: opts.applicableServices,
      status: "active",
      purchasedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    }
    setCards((prev) => [...prev, newCard])
    return newCard
  }, [])

  const redeemGiftCard = useCallback((code: string, amount: number, bookingId?: string): boolean => {
    const card = cards.find((c) => c.code === code && c.status === "active")
    if (!card || card.currentBalance < amount) return false
    setCards((prev) =>
      prev.map((c) => {
        if (c.code !== code) return c
        const newBalance = c.currentBalance - amount
        return {
          ...c,
          currentBalance: newBalance,
          status: newBalance <= 0 ? "redeemed" as const : "active" as const,
          redeemedAt: newBalance <= 0 ? new Date().toISOString() : c.redeemedAt,
          bookingId: bookingId || c.bookingId,
        }
      })
    )
    return true
  }, [cards])

  const validateGiftCard = useCallback((code: string): GiftCard | null => {
    const card = cards.find((c) => c.code === code)
    if (!card) return null
    if (card.status !== "active") return null
    if (new Date(card.expiresAt) < new Date()) return null
    return card
  }, [cards])

  const getGiftCardsForCustomer = useCallback(
    (customerId: string) => cards.filter((c) => c.purchasedBy === customerId),
    [cards]
  )

  const getReceivedGiftCards = useCallback(
    (email: string) => cards.filter((c) => c.recipientEmail === email),
    [cards]
  )

  return (
    <GiftCardsContext.Provider value={{
      giftCards: cards, addGiftCard, purchaseGiftCard,
      redeemGiftCard, validateGiftCard,
      getGiftCardsForCustomer, getReceivedGiftCards,
    }}>
      {children}
    </GiftCardsContext.Provider>
  )
}

export function useGiftCards() {
  const ctx = useContext(GiftCardsContext)
  if (!ctx) throw new Error("useGiftCards must be used within GiftCardsProvider")
  return ctx
}
