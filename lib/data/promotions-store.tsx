"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { PurchasedPromotion, MassageType } from "@/lib/types"
import { purchasedPromotions as seedPromotions } from "./mock-data"

interface PromotionsContextType {
  purchasedPromotions: PurchasedPromotion[]
  purchasePromotion: (promo: Omit<PurchasedPromotion, "id">) => void
  getPromotionsForCustomer: (customerId: string) => PurchasedPromotion[]
  getActivePromotionsForCustomer: (customerId: string) => PurchasedPromotion[]
  markServiceUsed: (promoId: string, serviceIndex: number, bookingId: string) => void
  hasActivePromotionForService: (customerId: string, serviceType: MassageType) => PurchasedPromotion | null
}

const PromotionsContext = createContext<PromotionsContextType | null>(null)

const STORAGE_KEY = "koko-purchased-promotions"

export function PromotionsProvider({ children }: { children: React.ReactNode }) {
  const [purchasedPromos, setPurchasedPromos] = useState<PurchasedPromotion[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    setPurchasedPromos(stored ? JSON.parse(stored) : seedPromotions)
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(purchasedPromos))
  }, [purchasedPromos, ready])

  const purchasePromotion = useCallback((promo: Omit<PurchasedPromotion, "id">) => {
    const newPromo: PurchasedPromotion = {
      ...promo,
      id: `pp-${Date.now()}`,
    }
    setPurchasedPromos((prev) => [...prev, newPromo])
  }, [])

  const getPromotionsForCustomer = useCallback(
    (customerId: string) => purchasedPromos.filter((p) => p.customerId === customerId),
    [purchasedPromos]
  )

  const getActivePromotionsForCustomer = useCallback(
    (customerId: string) =>
      purchasedPromos.filter(
        (p) => p.customerId === customerId && p.services.some((s) => !s.completed)
      ),
    [purchasedPromos]
  )

  const markServiceUsed = useCallback((promoId: string, serviceIndex: number, bookingId: string) => {
    setPurchasedPromos((prev) =>
      prev.map((p) => {
        if (p.id !== promoId) return p
        const services = [...p.services]
        services[serviceIndex] = {
          ...services[serviceIndex],
          completed: true,
          bookingId,
          completedAt: new Date().toISOString(),
        }
        return { ...p, services }
      })
    )
  }, [])

  const hasActivePromotionForService = useCallback(
    (customerId: string, serviceType: MassageType): PurchasedPromotion | null => {
      return (
        purchasedPromos.find(
          (p) =>
            p.customerId === customerId &&
            p.services.some((s) => s.serviceType === serviceType && !s.completed)
        ) || null
      )
    },
    [purchasedPromos]
  )

  const value = useMemo(
    () => ({
      purchasedPromotions: purchasedPromos,
      purchasePromotion,
      getPromotionsForCustomer,
      getActivePromotionsForCustomer,
      markServiceUsed,
      hasActivePromotionForService,
    }),
    [purchasedPromos, purchasePromotion, getPromotionsForCustomer, getActivePromotionsForCustomer, markServiceUsed, hasActivePromotionForService]
  )

  return <PromotionsContext.Provider value={value}>{children}</PromotionsContext.Provider>
}

export function usePromotions() {
  const ctx = useContext(PromotionsContext)
  if (!ctx) throw new Error("usePromotions must be used within PromotionsProvider")
  return ctx
}
