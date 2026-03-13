# Multi-Shop White-Label Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Support multiple massage shops in one app instance — each with its own branding, services, staff, and data — while sharing customer identity and massage preferences across shops.

**Architecture:** A `ShopProvider` context wraps the entire app above all existing providers. It holds the active `shopId` and `ShopConfig`. All 9 data stores prefix localStorage keys with `shopId` so each shop's data is isolated. `ThemeProvider` reads brand colors from `ShopConfig`. Customers select/add shops from a `/shops` screen; managers and staff go straight to their assigned shop.

**Tech Stack:** React 19 Context API, Next.js 16 App Router, localStorage, TypeScript 5.7, Tailwind CSS 4

**Design doc:** `docs/plans/2026-03-13-multi-shop-design.md`

---

## Task 1: Shop types and registry

**Files:**
- Create: `lib/shop/types.ts`
- Create: `lib/shop/shop-registry.ts`

**Step 1: Create ShopConfig types**

Create `lib/shop/types.ts`:

```typescript
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
  features: ShopFeatures
  operatingHours: { open: string; close: string }
  massageTypes: string[]
}
```

**Step 2: Create shop registry**

Create `lib/shop/shop-registry.ts`. Import `kokoDarkBrandConfig` from `lib/theme/brand-config.ts` for Koko. Define a new `ckBrandConfig` inline for CK Footworks with the user-specified colors (#201A16 buttons, #F0EDAF highlight, #FFFFFF bg, #1F1F1F text).

```typescript
import type { ShopConfig } from "./types"
import type { BrandConfig } from "@/lib/types"
import { kokoDarkBrandConfig } from "@/lib/theme/brand-config"

const ckBrandConfig: BrandConfig = {
  shopName: "CK Footworks",
  tagline: "Step into relaxation",
  logo: "/logo-ck.svg",
  logoIcon: "/logo-ck-icon.svg",
  primaryColor: "#201A16",
  primaryForeground: "#FFFFFF",
  secondaryColor: "#F7F5F0",
  accentColor: "#F0EDAF",
  bgPrimary: "#FFFFFF",
  bgSecondary: "#F7F5F0",
  bgTertiary: "#EDEBE6",
  borderColor: "#D4D0C8",
  textPrimary: "#1F1F1F",
  textSecondary: "#6B6560",
  textTertiary: "#9B9590",
  accentGreen: "#4ADE80",
  accentCoral: "#E94560",
  accentYellow: "#F0EDAF",
  accentBlue: "#60A5FA",
  fontFamily: "Inter",
  borderRadius: 0.75,
  currency: "THB",
  currencySymbol: "฿",
  operatingHours: { open: "10:00", close: "21:00" },
  socialLinks: {
    instagram: "https://instagram.com/ckfootworks",
    line: "https://line.me/ckfootworks",
  },
}

export const SHOPS: ShopConfig[] = [
  {
    id: "koko",
    code: "KOKO2024",
    name: "Koko Massage",
    tagline: "Where relaxation meets artistry",
    logo: "/logo.svg",
    brand: kokoDarkBrandConfig,
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
    brand: ckBrandConfig,
    features: {
      loyalty: false,
      giftCards: true,
      promotions: true,
      trialRotation: false,
      translationChat: true,
    },
    operatingHours: { open: "10:00", close: "21:00" },
    massageTypes: ["reflexology", "foot", "thai"],
  },
]

export function getShopById(id: string): ShopConfig | undefined {
  return SHOPS.find((s) => s.id === id)
}

export function getShopByCode(code: string): ShopConfig | undefined {
  return SHOPS.find((s) => s.code.toLowerCase() === code.toLowerCase())
}
```

**Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

**Step 4: Commit**

```
git add lib/shop/
git commit -m "feat: add shop types and registry with Koko + CK Footworks"
```

---

## Task 2: ShopProvider context

**Files:**
- Create: `lib/shop/shop-context.tsx`
- Modify: `components/providers.tsx`

**Step 1: Create ShopProvider**

Create `lib/shop/shop-context.tsx`:

```typescript
"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
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
      }
    } catch { /* ignore */ }
    setReady(true)
  }, [])

  // Persist
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
```

**Step 2: Update providers.tsx**

Add `ShopProvider` as the outermost wrapper in `components/providers.tsx`:

```typescript
import { ShopProvider } from "@/lib/shop/shop-context"
// ... existing imports ...

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ShopProvider>
      <LanguageProvider>
        <AuthProvider>
          {/* ... rest unchanged ... */}
        </AuthProvider>
      </LanguageProvider>
    </ShopProvider>
  )
}
```

**Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`

**Step 4: Commit**

```
git add lib/shop/shop-context.tsx components/providers.tsx
git commit -m "feat: add ShopProvider context with shop switching and add-by-code"
```

---

## Task 3: Scope all data stores with shopId prefix

**Files:**
- Modify: All 9 store files in `lib/data/`
- Modify: `lib/auth/auth-context.tsx`

**Context:** Every store currently uses hardcoded localStorage keys like `"koko-bookings"`. We need them to use `"{shopId}-bookings"` so each shop's data is isolated.

**Step 1: Update each store to accept a shopId-prefixed key**

The pattern for each store is the same. Every store has constants like:
```typescript
const BOOKINGS_KEY = "koko-bookings"
```

Change these to functions that read from a prop or build from shopId. The cleanest approach: each store provider accepts an optional `storagePrefix` prop, defaulting to `"koko"`. The `ShopProvider` passes the active `shopId` down.

However, since stores are nested inside providers.tsx and don't receive props from ShopProvider directly, the cleanest approach is to have each store call `useShop()` to get the `shopId`, then derive its key.

**Important:** Stores must re-initialize when `shopId` changes. The `ready` flag resets, and the `useEffect` re-runs with new keys.

For each of the 9 store files, make these changes:

1. Import `useShop` from `@/lib/shop/shop-context`
2. Replace hardcoded key constants with derived keys using `shopId`
3. Add `shopId` to the dependency array of the initialization useEffect
4. Reset `ready` flag when shopId changes

**Example for bookings-store.tsx (apply same pattern to all 9):**

Before:
```typescript
const BOOKINGS_KEY = "koko-bookings"
```

After:
```typescript
// Inside the provider component:
const { shopId } = useShop()
const prefix = shopId ?? "koko"
const BOOKINGS_KEY = `${prefix}-bookings`
```

The initialization useEffect changes from `[]` dependency to `[shopId]`:
```typescript
useEffect(() => {
  setReady(false)
  setBookings(load(BOOKINGS_KEY, SEED_BOOKINGS))
  // ... other loads
  setReady(true)
}, [shopId]) // eslint-disable-line react-hooks/exhaustive-deps
```

**Apply this pattern to all 9 stores:**

| Store file | Current keys | New keys (prefixed) |
|---|---|---|
| `bookings-store.tsx` | `koko-bookings`, `koko-cancellations`, `koko-reminders`, `koko-claims` | `{prefix}-bookings`, etc. |
| `services-store.tsx` | `koko-services`, `koko-addons`, `koko-rooms-v2` | `{prefix}-services`, etc. |
| `loyalty-store.tsx` | `koko-loyalty-config`, `koko-loyalty-stamps`, `koko-loyalty-redemptions`, `koko-loyalty-point-redemptions` | `{prefix}-loyalty-config`, etc. |
| `giftcards-store.tsx` | `koko-giftcards` | `{prefix}-giftcards` |
| `promotions-store.tsx` | `koko-purchased-promotions` | `{prefix}-purchased-promotions` |
| `notes-store.tsx` | `koko-client-notes` | `{prefix}-client-notes` |
| `messages-store.tsx` | `koko-messages` | `{prefix}-messages` |
| `tips-store.tsx` | `koko-tip-claims` | `{prefix}-tip-claims` |
| `translation-store.tsx` | `koko-translation-messages` | `{prefix}-translation-messages` |

**Step 2: Update auth-context.tsx**

The auth storage key `"koko-auth-user"` should also be scoped per shop: `"{shopId}-auth-user"`. Import `useShop` and derive the key.

Additionally, add `shopId` to the `AuthUser` type so we know which shop the user logged into:
```typescript
interface AuthUser {
  id: string
  name: string
  email: string
  role: "manager" | "customer" | "staff"
  avatar: string
  shopId?: string  // new field
}
```

**Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`

**Step 4: Test manually**

Open localhost:3000, verify existing Koko data still loads (default prefix is "koko").

**Step 5: Commit**

```
git add lib/data/ lib/auth/
git commit -m "feat: scope all data stores and auth with shopId prefix"
```

---

## Task 4: Wire ThemeProvider to ShopConfig

**Files:**
- Modify: `lib/theme/theme-provider.tsx`
- Modify: `app/(customer)/layout.tsx`
- Modify: `app/admin/layout.tsx`
- Modify: `app/staff/layout.tsx`

**Step 1: Update ThemeProvider to accept shop brand**

Currently `ThemeProvider` uses `kokoDarkBrandConfig` and `kokoLightBrandConfig` as defaults. Update it to read from `useShop()` and use `shopConfig.brand` as the dark config base. Generate a light variant from it (or keep the existing light theme logic).

In `lib/theme/theme-provider.tsx`, add:
```typescript
import { useShop } from "@/lib/shop/shop-context"
```

In the provider body, before the existing brand config state:
```typescript
const { shopConfig } = useShop()
const baseBrand = shopConfig?.brand ?? kokoDarkBrandConfig
```

Use `baseBrand` instead of `kokoDarkBrandConfig` when initializing the brand config state.

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```
git add lib/theme/theme-provider.tsx
git commit -m "feat: wire ThemeProvider to read brand from active ShopConfig"
```

---

## Task 5: Create CK Footworks seed data

**Files:**
- Create: `lib/data/seeds/ck-footworks.ts`

**Step 1: Create CK seed data**

Create `lib/data/seeds/ck-footworks.ts` with:
- **3-4 staff** specializing in foot/reflexology (different names, avatars, bios from Koko staff)
- **3 services**: Reflexology (60/90min), Thai Foot Massage (60min), Foot Scrub & Soak (30min)
- **2-3 rooms**: Foot Spa Room, Open Floor area
- **5-8 bookings** across different statuses
- **3 customers** (can reuse same IDs as Koko to demo cross-shop identity)
- **2-3 gift cards**
- **1-2 promotions** (no loyalty data since CK doesn't use loyalty)
- **Empty arrays** for loyalty stamps, redemptions, trial rotation

Follow the exact type shapes from `lib/types/index.ts`. Use Pexels/placeholder URLs for staff avatars.

**Step 2: Create seed index for Koko**

Create `lib/data/seeds/koko.ts` that re-exports everything from the existing `mock-data.ts`. This is a thin re-export so we don't have to move all the existing data right now:

```typescript
export {
  staffMembers, services, bookings, promotions, customers,
  activeTrialRotation, dashboardStats, staffBlockedDates,
  cancellationPolicy, cancellationRecords, clientNotes, giftCards,
  loyaltyConfig, loyaltyStamps, loyaltyRedemptions, loyaltyPointRedemptions,
  staffMessages, promoSessionUsages, bookingReminders, lateArrivalClaims,
  purchasedPromotions, tipClaims, translationPhrases,
} from "@/lib/data/mock-data"
```

**Step 3: Update mock-data.ts to route based on active shop**

Rather than modifying every import site, make `mock-data.ts` shop-aware by having the stores import from the correct seed file based on `shopId`. For the demo, stores can import seeds directly from either `seeds/koko.ts` or `seeds/ck-footworks.ts` based on the active shop.

The simplest approach: each store's seed import becomes dynamic based on shopId. Add a `getSeedsForShop(shopId: string)` function in a new `lib/data/seeds/index.ts` that returns the appropriate seed data object.

**Step 4: Verify TypeScript**

Run: `npx tsc --noEmit`

**Step 5: Commit**

```
git add lib/data/seeds/
git commit -m "feat: add CK Footworks seed data and shop-aware seed loader"
```

---

## Task 6: Shop selector page

**Files:**
- Create: `app/shops/page.tsx`
- Create: `app/shops/layout.tsx` (minimal layout without navbar)

**Step 1: Create the shop selector page**

`app/shops/page.tsx`:
- Shows cards for each shop in `myShops` — logo, name, tagline, with an accent color strip from `shop.brand.primaryColor`
- "Add a Shop" section at the bottom with an input for Shop Code and "Join" button
- On tap, calls `setActiveShop(shop.id)` and redirects to `/`
- If code entered, calls `addShopByCode(code)`, shows success/error toast
- Uses `useShop()` to get `myShops`, `setActiveShop`, `addShopByCode`
- Uses `useLanguage()` for `t()` translations

**Step 2: Create minimal layout**

`app/shops/layout.tsx`:
- No bottom navbar, no sidebar — just centered content
- Wraps with ThemeProvider using a neutral default theme

**Step 3: Verify TypeScript and test visually**

Run: `npx tsc --noEmit`
Open `localhost:3000/shops` and verify the shop list renders.

**Step 4: Commit**

```
git add app/shops/
git commit -m "feat: add shop selector page with add-by-code"
```

---

## Task 7: Update login page to be shop-aware

**Files:**
- Modify: `app/login/page.tsx`

**Step 1: Make login shop-aware**

The login page should:
1. Read `shopConfig` from `useShop()` to display the active shop's branding (name, logo)
2. If no shop is selected, redirect to `/shops`
3. Show demo users labeled for the active shop (e.g. "Koko Manager" vs "CK Manager")
4. On login, store `shopId` alongside the user in auth context

Define per-shop demo users in the login page or in the shop registry:
- **Koko:** manager@koko.com / alex@example.com / joy@koko.com (existing)
- **CK:** manager@ck.com / alex@example.com / ck-staff@ck.com (new)

The customer demo user (`alex@example.com`, id `c1`) is the same across shops — this demonstrates that the same customer can visit multiple shops.

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```
git add app/login/page.tsx
git commit -m "feat: shop-aware login page with per-shop demo users"
```

---

## Task 8: Add "Switch Shop" to customer profile

**Files:**
- Modify: `app/(customer)/profile/page.tsx`

**Step 1: Add Switch Shop menu item**

In the profile page's `menuSections` array, add a new section or item. The cleanest spot is above the sign-out button. Add a "Switch Shop" button that navigates to `/shops`:

```typescript
// In the JSX, before the sign-out button:
<Link href="/shops" className="mt-6 flex w-full items-center ...">
  <Store size={16} />
  {t("switchShop")}
</Link>
```

Import `Store` from `lucide-react`.

Also show the current shop name somewhere visible — the `brandConfig.shopName` from `useBrand()` is already displayed at the bottom of the profile page in the "powered by" line.

**Step 2: Add translation keys**

Add `switchShop` key to all 5 locale files:
- en: "Switch Shop"
- th: "เปลี่ยนร้าน"
- ko: "매장 변경"
- ja: "店舗を切り替え"
- de: "Shop wechseln"

**Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`

**Step 4: Commit**

```
git add app/(customer)/profile/page.tsx lib/i18n/locales/
git commit -m "feat: add Switch Shop to customer profile menu"
```

---

## Task 9: Feature flag guards

**Files:**
- Modify: `app/(customer)/profile/page.tsx` — hide loyalty menu items when `features.loyalty === false`
- Modify: `app/(customer)/page.tsx` (home) — hide loyalty/trial sections conditionally
- Modify: Any page referencing loyalty, trial rotation, gift cards, promotions

**Step 1: Add feature checks**

In pages/components that reference optional features, import `useShop` and conditionally render:

```typescript
const { shopConfig } = useShop()

// In menu sections:
...(shopConfig?.features.loyalty ? [
  { label: t("loyaltyProgram"), href: "/loyalty", icon: Stamp, badge: `${stampCount}/10` },
] : []),
...(shopConfig?.features.trialRotation ? [
  { label: t("trialRotation"), href: "/trial", icon: Star },
] : []),
```

Key pages to guard:
- `app/(customer)/profile/page.tsx` — loyalty and trial menu items
- `app/(customer)/page.tsx` — loyalty mini card, trial rotation section on home
- `app/(customer)/loyalty/page.tsx` — redirect to `/` if loyalty disabled
- `app/(customer)/trial/page.tsx` — redirect to `/` if trial disabled

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`

**Step 3: Test manually**

Switch to CK Footworks and verify loyalty/trial items are hidden. Switch back to Koko and verify they appear.

**Step 4: Commit**

```
git add app/
git commit -m "feat: add feature flag guards for loyalty, trial, gift cards"
```

---

## Task 10: Auto-redirect to /shops when no shop selected

**Files:**
- Modify: `app/(customer)/layout.tsx`
- Modify: `app/admin/layout.tsx`
- Modify: `app/staff/layout.tsx`

**Step 1: Add redirect logic**

In each role-specific layout, check if a shop is selected. If not, redirect to `/shops` (for customers) or `/login` (for manager/staff since they need a shop to be set before login).

In `app/(customer)/layout.tsx`, inside the inner component that has access to hooks:

```typescript
const { isShopSelected } = useShop()
const router = useRouter()

useEffect(() => {
  if (!isShopSelected) router.replace("/shops")
}, [isShopSelected])

if (!isShopSelected) return null
```

For admin/staff layouts, redirect to `/login` since managers/staff select their shop implicitly by logging in.

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```
git add app/(customer)/layout.tsx app/admin/layout.tsx app/staff/layout.tsx
git commit -m "feat: redirect to /shops when no shop selected"
```

---

## Task 11: Update layout.tsx metadata and flash-prevention script

**Files:**
- Modify: `app/layout.tsx`

**Step 1: Make metadata dynamic**

The root layout has hardcoded `title: 'Koko Massage | ...'`. Since this is a server component and can't use hooks, keep it generic:

```typescript
title: 'Massage Pro | Premium Wellness Booking',
```

Update the theme-flash prevention script to also check for the active shop's theme mode:
```typescript
`try{var s=localStorage.getItem('active-shop-id')||'koko';if(localStorage.getItem(s+'-theme-mode')==='light')document.documentElement.classList.add('light')}catch(e){}`
```

**Step 2: Commit**

```
git add app/layout.tsx
git commit -m "feat: update root layout for multi-shop support"
```

---

## Task 12: End-to-end verification and final commit

**Step 1: TypeScript check**

Run: `npx tsc --noEmit`
Expected: zero errors

**Step 2: Production build**

Run: `npx next build`
Expected: all pages compile successfully

**Step 3: Manual smoke test**

1. Open app → should land on `/shops`
2. Tap "Koko Massage" → dark theme, full menu with loyalty
3. Go to profile → "Switch Shop" visible
4. Tap Switch Shop → back to `/shops`
5. Tap "CK Footworks" → light warm theme, no loyalty in menu
6. Book a session → CK's foot services shown
7. Switch back to Koko → Koko's full services, CK booking not visible
8. Test "Add a Shop" with code `CKFOOT2024`

**Step 4: Final commit and push**

```
git add -A
git commit -m "feat: complete multi-shop white-label support with Koko + CK Footworks"
git push
```
