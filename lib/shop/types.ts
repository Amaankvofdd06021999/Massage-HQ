import type { BrandConfig } from "@/lib/types"

export interface ShopFeatures {
  loyalty: boolean
  giftCards: boolean
  promotions: boolean
  trialRotation: boolean
  translationChat: boolean
}

export interface ShopConfig {
  id: string
  code: string
  name: string
  tagline: string
  logo: string
  brand: BrandConfig
  lightBrand: BrandConfig
  features: ShopFeatures
  operatingHours: { open: string; close: string }
  massageTypes: string[]
}
