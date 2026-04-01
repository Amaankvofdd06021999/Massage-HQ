import * as kokoSeeds from "./koko"
import * as ckSeeds from "./ck-footworks"

export type ShopSeeds = typeof kokoSeeds

const seedMap: Record<string, ShopSeeds> = {
  koko: kokoSeeds,
  ck: ckSeeds,
}

export function getSeedsForShop(shopId: string): ShopSeeds {
  return seedMap[shopId] ?? kokoSeeds
}
