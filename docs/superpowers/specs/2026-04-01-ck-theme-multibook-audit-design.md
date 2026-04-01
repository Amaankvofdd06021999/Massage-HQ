# CK Dark/Light Mode Fix, Multi-Person Booking & UI Audit

**Date:** 2026-04-01
**Deadline:** Presentation-ready by 2026-04-02

---

## 1. CK Footworks Dark/Light Mode Fix

### Problem

The theme provider (`lib/theme/theme-provider.tsx:57-63`) hardcodes `kokoLightBrandConfig` when toggling to light mode, regardless of which shop is active. CK Footworks has only one brand config (a light-themed config with white backgrounds and dark text) defined inline in `lib/shop/shop-registry.ts:5-33`. This means:

- **Toggle to light:** Gets Koko's amber/white light theme instead of CK's green/white theme
- **Toggle to dark:** Falls back to CK's single config, which is already light-toned (white bg, dark text) — so CK effectively has no dark mode at all

The root cause: CK's current `ckBrandConfig` is a light theme being assigned to the `brand` slot (the dark default). There is no true CK dark variant.

### Solution

**1a. Create CK brand variants in `lib/theme/brand-config.ts`:**

- `ckDarkBrandConfig`: Deep green primary (#2D6A4F), dark backgrounds (#0D1F17, #132B21, #1A3A2C), light text (#F0FDF4), green accents
- `ckLightBrandConfig`: The existing CK config (white/warm-beige background, green primary) — move from shop-registry.ts into brand-config.ts

**1b. Update `lib/shop/types.ts` — add `lightBrand` to `ShopConfig`:**

```typescript
export interface ShopConfig {
  id: string
  code: string
  name: string
  tagline: string
  logo: string
  brand: BrandConfig       // default brand (dark mode)
  lightBrand: BrandConfig  // light mode brand
  features: ShopFeatures
  operatingHours: { open: string; close: string }
  massageTypes: string[]   // keep as string[] to match existing usage
}
```

Update both SHOPS entries in `shop-registry.ts` to include `lightBrand`.

**1c. Fix `lib/theme/theme-provider.tsx`:**

- Derive `lightBrand` from `shopConfig?.lightBrand ?? kokoLightBrandConfig`
- `toggleMode`: use `lightBrand` for light, `baseBrand` for dark (instead of hardcoded `kokoLightBrandConfig`)
- `resetBrandConfig`: same pattern
- Initial load from localStorage: same pattern

**1d. localStorage key** — The current key `koko-theme-mode` is shared across shops. This is a conscious decision: theme mode is a user-global preference (like "I prefer dark mode"), not per-shop. No change needed.

**1e. Hardcoded color audit** — The following hardcoded colors break under CK's theme and must be replaced:

- `text-[#0A0A0F]` (Koko's dark bg used as text on primary buttons): found in `components/booking/service-step.tsx`, `components/admin/services/room-modal.tsx`, `components/admin/services/addon-modal.tsx`, `components/admin/services/service-modal.tsx` → replace with `text-primary-foreground`
- `text-black` on `bg-brand-yellow` in buttons (e.g., `confirmation-step.tsx` line 94) → replace with `text-primary-foreground`
- Any `bg-white`, `text-white` outside of intentional primary-foreground usage → replace with brand variables

---

## 2. Multi-Person Booking ("Add Guest")

### Scope Decision

Given the presentation deadline, group booking is capped at **max 2 guests** (3 people total). Per-guest add-ons are **excluded** from v1 — only the primary booker can select add-ons. This reduces UI complexity in every step while still demonstrating the feature.

### Data Model

**New interfaces in `lib/types/index.ts`:**

```typescript
// Final guest data stored in a booking
export interface BookingGuest {
  id: string              // generated UUID
  name: string
  serviceId: string
  serviceName: string
  serviceType: MassageType
  staffId: string
  staffName: string
  staffAvatar: string
  duration: number
  price: number
  roomId?: string
}

// Draft state during booking flow — all fields optional until their step
export interface BookingGuestDraft {
  id: string              // generated on addGuest()
  name: string            // required — entered in Step 1
  serviceId?: string      // set in Step 1
  serviceName?: string    // set in Step 1
  serviceType?: MassageType // set in Step 1
  duration?: number       // set in Step 1
  price?: number          // derived from service + duration
  staffId?: string        // set in Step 2
  staffName?: string      // set in Step 2
  staffAvatar?: string    // resolved from StaffMember on selection
  roomId?: string         // set in Step 3
}
```

**Extend `Booking` interface:**

```typescript
export interface Booking {
  // ... existing fields ...
  guests?: BookingGuest[]
  groupSize?: number       // 1 = solo (default), 2-3 = group
}
```

**Note:** `createBooking` in `bookings-store.tsx` uses `Omit<Booking, "id" | "createdAt">` — once the type is extended, the guests field flows through automatically. No changes to `createBooking` logic needed.

### Booking Flow Changes

**Step 1 — Service Selection:**

- Add toggle at top: "Just me" (default) / "Group booking"
- When "Group booking" selected, show "Add Guest" button (max 2 guests)
- Each guest rendered as a collapsible card with:
  - Name input (required)
  - Service picker (same service list as primary)
  - Duration picker
- Primary booker's service selection remains unchanged
- Guest cards have a remove button
- No per-guest add-ons in v1

**Step 2 — Therapist Selection:**

- Show therapist selection for primary booker first (existing behavior)
- Below, show a section per guest with their own therapist list
- Per-guest filtering: the hook exposes `getFilteredStaffForGuest(guestId): StaffMember[]` which filters `staffMembers` by that guest's `serviceType`
- Already-assigned therapists show a subtle "(also serving [name])" label but are NOT blocked

**Step 3 — Date/Time:**

- Single shared date and time picker for the group (existing behavior)
- Room assignment: manual per-person room picker (same room dropdown, shown once per person). If there aren't enough rooms, show a warning but don't block — rooms are optional.

**Step 4 — Confirmation:**

- Line item per person: name, service, therapist, duration, room, price
- Group subtotal and grand total
- Promo/gift card applied to primary booker only (v1)

### Hook Changes (`hooks/use-booking-flow.ts`)

New state:
- `isGroupBooking: boolean` (default false)
- `guests: BookingGuestDraft[]`

New handlers:
- `toggleGroupBooking()`: toggle mode, clear guests when turning off
- `addGuest()`: push new draft with generated id (max 2)
- `removeGuest(id)`: remove by id
- `updateGuest(id, partial: Partial<BookingGuestDraft>)`: merge partial into guest
- `getFilteredStaffForGuest(guestId: string): StaffMember[]`: returns staffMembers filtered by that guest's `serviceType`

Derived:
- `groupSize = 1 + guests.length`
- `guestsTotalPrice = guests.reduce((sum, g) => sum + (g.price ?? 0), 0)`
- `groupTotalPrice = totalPrice + guestsTotalPrice`

`handleBook()`:
- Convert `BookingGuestDraft[]` to `BookingGuest[]` (resolve staffAvatar from staffMembers lookup)
- Create booking with `guests` array and `groupSize`

### i18n Keys

New translation keys needed:
- `justMe`, `groupBooking`, `addGuest`, `removeGuest`, `guestName`
- `alsoServing` (for "(also serving [name])")
- `groupSubtotal`, `groupTotal`, `guests` (label)
- `maxGuestsReached`, `noRoomsWarning`

---

## 3. Full UI Audit & Cleanup

### 3a. Theme Consistency Audit

Scan all component files for hardcoded colors that should use brand variables:
- `text-[#0A0A0F]` → `text-primary-foreground` (5 instances identified)
- `text-black` on brand-colored buttons → `text-primary-foreground`
- `bg-white`, `bg-black` outside of intentional usage → brand bg variables
- `text-yellow-*`, `bg-yellow-*` → brand primary variables
- `border-gray-*` → `border-brand-border`

### 3b. Layout Issues

- **Bottom nav overlap:** Ensure all pages have sufficient bottom padding (`pb-20` minimum)
- **Mode toggle overlap:** The fixed toggle at `right-4 top-4` may overlap page headers — ensure headers have `pr-14` or similar
- **Safe area:** Verify `safe-area-pb` class on bottom nav

### 3c. Booking Flow Polish

- Step wizard: back/next buttons always visible and functional
- Group booking UI integrates cleanly; "Just me" remains default
- Confirmation step handles both single and group bookings
- Price calculations correct for all combinations

### 3d. Admin & Staff Layouts

- Admin sidebar theme toggle works for CK shop
- Admin layout (`app/admin/layout.tsx`) uses correct shop brand via the same `lightBrand` mechanism
- Staff layout (`app/staff/layout.tsx`) same treatment

### 3e. Navigation & Routing

- All bottom nav links resolve correctly
- Role guards prevent cross-role access
- No dead links or 404s
- Shop selection flow works for both shops

### 3f. Functional Checks

- Create booking (single + group) works
- Cancel booking works
- Promo application works
- Gift card redemption works
- Loyalty stamp tracking works
- All localStorage persistence works across page refreshes

---

## Files to Modify

| File | Changes |
|------|---------|
| `lib/types/index.ts` | Add `BookingGuest`, `BookingGuestDraft`, extend `Booking` |
| `lib/theme/brand-config.ts` | Add `ckDarkBrandConfig`, `ckLightBrandConfig` |
| `lib/shop/types.ts` | Add `lightBrand` to `ShopConfig` |
| `lib/shop/shop-registry.ts` | Update both shops with `lightBrand`, move CK config to brand-config.ts |
| `lib/theme/theme-provider.tsx` | Use shop-specific light/dark brands |
| `hooks/use-booking-flow.ts` | Add guest state, handlers, group pricing, `getFilteredStaffForGuest` |
| `components/booking/service-step.tsx` | Group toggle, guest cards, fix `text-[#0A0A0F]` |
| `components/booking/therapist-step.tsx` | Per-person therapist selection |
| `components/booking/datetime-step.tsx` | Per-person room assignment |
| `components/booking/confirmation-step.tsx` | Group summary, per-person line items, fix `text-black` |
| `app/(customer)/book/page.tsx` | Wire new hook fields to components |
| `app/(customer)/bookings/page.tsx` | Show guest count badge on booking cards |
| `components/shared/booking-card.tsx` | Guest count badge display |
| `app/(customer)/layout.tsx` | Theme audit |
| `app/admin/layout.tsx` | Theme audit |
| `app/admin/bookings/page.tsx` | Group booking display |
| `app/staff/layout.tsx` | Theme audit |
| `app/staff/bookings/page.tsx` | Group booking display |
| `lib/i18n/*` | New translation keys for group booking |
| `components/admin/services/room-modal.tsx` | Fix `text-[#0A0A0F]` |
| `components/admin/services/addon-modal.tsx` | Fix `text-[#0A0A0F]` |
| `components/admin/services/service-modal.tsx` | Fix `text-[#0A0A0F]` |

---

## Out of Scope

- Backend API integration (all data is localStorage-based)
- Payment processing
- Push notifications
- Guest accounts / login for guests
- Per-guest promo/gift card (v1: primary booker only)
- Per-guest add-ons (v1: primary booker only)
- More than 2 guests (max 3 people total for v1)
