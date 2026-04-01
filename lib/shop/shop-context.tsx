"use client"

import {
  createContext, useContext, useState, useEffect, type ReactNode,
} from "react"
import type { ShopConfig } from "./types"
import { SHOPS, getShopById, getShopByCode } from "./shop-registry"

const ACTIVE_SHOP_KEY = "active-shop-id"
const MY_SHOPS_KEY = "my-shop-ids"

interface ShopContextType {
  shopId: string | null
  shopConfig: ShopConfig | null
  myShops: ShopConfig[]
  setActiveShop: (id: string) => void
  addShopByCode: (code: string) => ShopConfig | null
  removeShop: (id: string) => void
  isShopSelected: boolean
}

const ShopContext = createContext<ShopContextType | undefined>(undefined)

export function ShopProvider({ children }: { children: ReactNode }) {
  const [shopId, setShopId] = useState<string | null>(null)
  const [myShopIds, setMyShopIds] = useState<string[]>([])
  const [ready, setReady] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedShopIds = localStorage.getItem(MY_SHOPS_KEY)
      const ids = storedShopIds ? (JSON.parse(storedShopIds) as string[]) : SHOPS.map((s) => s.id)
      setMyShopIds(ids)

      const storedActive = localStorage.getItem(ACTIVE_SHOP_KEY)
      if (storedActive && ids.includes(storedActive)) {
        setShopId(storedActive)
      } else {
        // Default to Koko on first visit
        setShopId("koko")
        try { localStorage.setItem(ACTIVE_SHOP_KEY, "koko") } catch { /* ignore */ }
      }
    } catch { /* ignore */ }
    setReady(true)
  }, [])

  // Persist shop list
  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(MY_SHOPS_KEY, JSON.stringify(myShopIds))
    } catch { /* ignore */ }
  }, [myShopIds, ready])

  function setActiveShop(id: string) {
    setShopId(id)
    try { localStorage.setItem(ACTIVE_SHOP_KEY, id) } catch { /* ignore */ }
  }

  function addShopByCode(code: string): ShopConfig | null {
    const shop = getShopByCode(code)
    if (!shop) return null
    if (!myShopIds.includes(shop.id)) {
      setMyShopIds((prev) => [...prev, shop.id])
    }
    return shop
  }

  function removeShop(id: string) {
    setMyShopIds((prev) => prev.filter((s) => s !== id))
    if (shopId === id) {
      setShopId(null)
      try { localStorage.removeItem(ACTIVE_SHOP_KEY) } catch { /* ignore */ }
    }
  }

  const shopConfig = shopId ? getShopById(shopId) ?? null : null
  const myShops = myShopIds.map(getShopById).filter(Boolean) as ShopConfig[]

  return (
    <ShopContext.Provider value={{
      shopId,
      shopConfig,
      myShops,
      setActiveShop,
      addShopByCode,
      removeShop,
      isShopSelected: shopId !== null && shopConfig !== null,
    }}>
      {children}
    </ShopContext.Provider>
  )
}

export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error("useShop must be used within ShopProvider")
  return ctx
}
