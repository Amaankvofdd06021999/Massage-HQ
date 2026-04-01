"use client"

import { useMemo } from "react"
import { useShop } from "@/lib/shop/shop-context"
import { getSeedsForShop } from "@/lib/data/seeds"

/**
 * Returns all static seed data for the currently active shop.
 * Use this instead of importing directly from mock-data.
 */
export function useShopData() {
  const { shopId } = useShop()
  return useMemo(() => getSeedsForShop(shopId ?? "koko"), [shopId])
}
