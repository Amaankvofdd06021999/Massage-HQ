# Multi-Shop White-Label — Design Document

**Goal:** Let multiple massage shops share one app instance. Each shop has its own branding, services, staff, and data. Customers can join multiple shops and switch between them. Massage preferences (pain areas, injuries, pressure) stay global.

## Decisions

- **Shop switching:** Shop selector screen on entry + "Switch Shop" in customer profile. Managers/staff go straight to their shop.
- **Accounts:** Fully separate per shop. A person working at two shops has two logins.
- **Theming:** Each shop gets a distinct visual theme (colors, fonts) configured by its manager.
- **Feature flags:** Shops opt in/out of loyalty, gift cards, promotions, trial rotation, translation chat.
- **Customer onboarding:** Customers add shops by entering a unique Shop Code in their profile.

## ShopConfig

```typescript
interface ShopFeatures {
  loyalty: boolean
  giftCards: boolean
  promotions: boolean
  trialRotation: boolean
  translationChat: boolean
}

interface ShopConfig {
  id: string                          // "koko", "ck", etc.
  code: string                        // "KOKO2024" — customer-facing join code
  name: string
  tagline: string
  logo: string
  brand: BrandConfig                  // full theme (colors, fonts, currency)
  features: ShopFeatures
  operatingHours: { open: string; close: string }
  massageTypes: string[]              // subset this shop offers
}
```

## Architecture

### Provider hierarchy

```
ShopProvider          ← active shopId + ShopConfig
  └─ ThemeProvider    ← reads brand from ShopConfig
    └─ AuthProvider   ← scoped demo users per shop
      └─ All data store providers
```

### Data scoping

Every store prefixes localStorage keys with `shopId`:
- `koko-bookings`, `ck-bookings`
- `koko-services`, `ck-services`
- etc.

When the user switches shops, ShopProvider updates → child providers re-mount with new shop data.

### Shared vs. scoped

| Shared (global) | Scoped (per shop) |
|---|---|
| Customer identity (name, email, avatar) | Bookings, history |
| Massage preferences (pain, injuries, pressure) | Services, add-ons, rooms |
| Language preference | Staff members |
| | Loyalty stamps/points |
| | Gift cards & balances |
| | Promotions |
| | Client notes, tips, messages |

### Feature flags

Components check `shopConfig.features.loyalty` etc. before rendering. If `false`, menu items and sections are hidden. No code paths change — just conditional rendering.

## User Flows

### Customer

1. Opens app → no shop selected → `/shops` screen with joined shops listed
2. "Add a shop" input at bottom — enter Shop Code to join
3. Tap a shop → UI re-themes, scoped data loads, redirect to `/`
4. Profile menu has "Switch Shop" → back to `/shops`
5. Massage preferences persist across all shops

### Manager

1. Logs in → goes directly to their shop's admin dashboard
2. Branding editor in admin settings saves to `{shopId}-brand-config`
3. No shop selector — locked to their shop

### Staff

1. Logs in → goes directly to their assigned shop
2. No shop selector

## Demo Setup

### Koko Massage (`koko`)

- Dark theme (existing purple/dark brand)
- Full service range: thai, swedish, deep-tissue, aromatherapy, hot-stone, sports, reflexology, shiatsu, foot
- Features: loyalty ✓, gift cards ✓, promotions ✓, trial rotation ✓, translation chat ✓
- Existing seed data (6 staff, 3 customers, 15 bookings, etc.)

### CK Footworks (`ck`)

- Light warm theme: buttons #201A16, highlight #F0EDAF, bg #FFFFFF, text #1F1F1F
- Foot-focused services: reflexology, foot massage, thai foot
- Features: loyalty ✗, gift cards ✓, promotions ✓, trial rotation ✗, translation chat ✓
- New seed data: 3-4 staff, services, rooms, bookings

## File Changes

### New files

```
lib/shop/types.ts               — ShopConfig, ShopFeatures interfaces
lib/shop/shop-context.tsx        — ShopProvider, useShop() hook
lib/shop/shop-registry.ts       — static registry + lookup by code
lib/data/seeds/koko.ts           — Koko seed data (extracted from mock-data.ts)
lib/data/seeds/ck-footworks.ts   — CK Footworks seed data
lib/theme/brand-configs.ts       — CK brand config added
app/shops/page.tsx               — Shop selector screen
```

### Modified files

- `lib/data/mock-data.ts` — thin router, exports from active shop's seed
- All 9 store files — prefix localStorage keys with shopId
- `lib/theme/theme-provider.tsx` — reads config from ShopConfig.brand
- `lib/auth/auth-context.tsx` — stores shopId, scoped demo users
- `app/layout.tsx` — wraps with ShopProvider
- `app/login/page.tsx` — shop-aware login with per-shop demo users
- `app/(customer)/profile/page.tsx` — "Switch Shop" menu item
- Pages with loyalty/trial — feature flag guards
