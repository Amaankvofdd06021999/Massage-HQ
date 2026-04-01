import type { ShopConfig } from "./types"
import { kokoDarkBrandConfig, kokoLightBrandConfig, ckDarkBrandConfig, ckLightBrandConfig } from "@/lib/theme/brand-config"

export const SHOPS: ShopConfig[] = [
  {
    id: "koko",
    code: "KOKO2024",
    name: "Koko Massage",
    tagline: "Where relaxation meets artistry",
    logo: "/logo.svg",
    brand: kokoDarkBrandConfig,
    lightBrand: kokoLightBrandConfig,
    features: {
      loyalty: true,
      giftCards: true,
      promotions: true,
      trialRotation: true,
      translationChat: true,
    },
    operatingHours: { open: "10:00", close: "22:00" },
    massageTypes: ["thai", "swedish", "deep-tissue", "aromatherapy", "hot-stone", "sports", "reflexology", "shiatsu", "foot"],
  },
  {
    id: "ck",
    code: "CKFOOT2024",
    name: "CK Footworks",
    tagline: "Step into relaxation",
    logo: "/logo-ck.svg",
    brand: ckDarkBrandConfig,
    lightBrand: ckLightBrandConfig,
    features: {
      loyalty: false,
      giftCards: true,
      promotions: true,
      trialRotation: false,
      translationChat: true,
    },
    operatingHours: { open: "10:00", close: "21:00" },
    massageTypes: ["reflexology", "foot"],
  },
]

export function getShopById(id: string): ShopConfig | undefined {
  return SHOPS.find((s) => s.id === id)
}

export function getShopByCode(code: string): ShopConfig | undefined {
  return SHOPS.find((s) => s.code.toLowerCase() === code.toLowerCase())
}
