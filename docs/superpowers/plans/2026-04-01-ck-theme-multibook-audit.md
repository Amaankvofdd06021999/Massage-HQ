# CK Theme Fix, Multi-Person Booking & UI Audit — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix CK Footworks dark/light mode, add group booking (up to 3 people), and audit all UI flows for presentation readiness.

**Architecture:** Three independent workstreams executed in order: (1) CK theme fix makes the brand system shop-aware, (2) group booking extends the 4-step wizard with guest support, (3) UI audit sweeps all pages for hardcoded colors and layout issues. All data is localStorage-based; no backend changes.

**Tech Stack:** Next.js 16, React 19, shadcn/ui, Tailwind CSS v4, TypeScript, localStorage stores.

**Spec:** `docs/superpowers/specs/2026-04-01-ck-theme-multibook-audit-design.md`

---

## Chunk 1: CK Dark/Light Mode Fix

### Task 1: Create CK brand variants

**Files:**
- Modify: `lib/theme/brand-config.ts`
- Modify: `lib/shop/shop-registry.ts` (remove inline ckBrandConfig)

- [ ] **Step 1: Add ckDarkBrandConfig and ckLightBrandConfig to brand-config.ts**

After the existing `kokoLightBrandConfig` export (line 67) and the backward-compat alias (line 70), add:

```typescript
// CK Footworks — Dark theme
export const ckDarkBrandConfig: BrandConfig = {
  shopName: "CK Footworks",
  tagline: "Step into relaxation",
  logo: "/logo-ck.svg",
  logoIcon: "/logo-ck-icon.svg",
  primaryColor: "#2D6A4F",
  primaryForeground: "#FFFFFF",
  secondaryColor: "#132B21",
  accentColor: "#95D5B2",
  bgPrimary: "#0D1F17",
  bgSecondary: "#132B21",
  bgTertiary: "#1A3A2C",
  borderColor: "#254D3A",
  textPrimary: "#F0FDF4",
  textSecondary: "#A7C4B5",
  textTertiary: "#6B8F7B",
  accentGreen: "#2D6A4F",
  accentCoral: "#E94560",
  accentYellow: "#95D5B2",
  accentBlue: "#60A5FA",
  fontFamily: "Inter",
  borderRadius: 0.75,
  currency: "CAD",
  currencySymbol: "$",
  operatingHours: { open: "10:00", close: "21:00" },
  socialLinks: {
    instagram: "https://instagram.com/ckfootworks",
  },
}

// CK Footworks — Light theme (existing CK config)
export const ckLightBrandConfig: BrandConfig = {
  shopName: "CK Footworks",
  tagline: "Step into relaxation",
  logo: "/logo-ck.svg",
  logoIcon: "/logo-ck-icon.svg",
  primaryColor: "#2D6A4F",
  primaryForeground: "#FFFFFF",
  secondaryColor: "#F7F5F0",
  accentColor: "#95D5B2",
  bgPrimary: "#FFFFFF",
  bgSecondary: "#F7F5F0",
  bgTertiary: "#EDEBE6",
  borderColor: "#D4D0C8",
  textPrimary: "#1F1F1F",
  textSecondary: "#6B6560",
  textTertiary: "#9B9590",
  accentGreen: "#2D6A4F",
  accentCoral: "#E94560",
  accentYellow: "#95D5B2",
  accentBlue: "#60A5FA",
  fontFamily: "Inter",
  borderRadius: 0.75,
  currency: "CAD",
  currencySymbol: "$",
  operatingHours: { open: "10:00", close: "21:00" },
  socialLinks: {
    instagram: "https://instagram.com/ckfootworks",
  },
}
```

- [ ] **Step 2: Update shop-registry.ts — remove inline ckBrandConfig, import from brand-config**

Replace the entire file content of `lib/shop/shop-registry.ts`:

```typescript
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
```

- [ ] **Step 3: Verify no TypeScript errors so far**

Run: `cd "/Users/amaan/Documents/Apps - Pixeltec/massagePro/massage pro" && npx tsc --noEmit 2>&1 | head -30`

This will fail because `ShopConfig` doesn't have `lightBrand` yet. That's expected — we fix it in the next task.

---

### Task 2: Update ShopConfig type and fix ThemeProvider

**Files:**
- Modify: `lib/shop/types.ts` (add `lightBrand`)
- Modify: `lib/theme/theme-provider.tsx` (use shop-specific brands)

- [ ] **Step 1: Add lightBrand to ShopConfig**

In `lib/shop/types.ts`, add after line 17 (`brand: BrandConfig`):

```typescript
  lightBrand: BrandConfig
```

- [ ] **Step 2: Fix theme-provider.tsx to use shop-specific brands**

Replace the entire file content of `lib/theme/theme-provider.tsx`:

```typescript
"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { BrandConfig } from "@/lib/types"
import { kokoDarkBrandConfig, kokoLightBrandConfig, brandConfigToCSSVars } from "./brand-config"
import { useShop } from "@/lib/shop/shop-context"

export type ThemeMode = "dark" | "light"

interface ThemeContextType {
  brandConfig: BrandConfig
  mode: ThemeMode
  updateBrandConfig: (config: Partial<BrandConfig>) => void
  resetBrandConfig: () => void
  toggleMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function applyThemeToDOM(config: BrandConfig, mode: ThemeMode) {
  const vars = brandConfigToCSSVars(config)
  const root = document.documentElement
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
  root.classList.toggle("light", mode === "light")
}

export function ThemeProvider({ children, initialConfig }: { children: ReactNode; initialConfig?: BrandConfig }) {
  const { shopConfig } = useShop()
  const baseBrand = shopConfig?.brand ?? kokoDarkBrandConfig
  const lightBrand = shopConfig?.lightBrand ?? kokoLightBrandConfig

  const [mode, setMode] = useState<ThemeMode>("dark")
  const [brandConfig, setBrandConfig] = useState<BrandConfig>(
    initialConfig ?? kokoDarkBrandConfig
  )

  // Re-apply brand when shop changes or on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("koko-theme-mode") as ThemeMode | null
      if (saved === "light" || saved === "dark") {
        setMode(saved)
        setBrandConfig(initialConfig ?? (saved === "light" ? lightBrand : baseBrand))
      } else {
        setBrandConfig(initialConfig ?? baseBrand)
      }
    } catch {
      setBrandConfig(initialConfig ?? baseBrand)
    }
  }, [baseBrand, lightBrand]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    applyThemeToDOM(brandConfig, mode)
  }, [brandConfig, mode])

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next: ThemeMode = prev === "dark" ? "light" : "dark"
      try { localStorage.setItem("koko-theme-mode", next) } catch { /* ignore */ }
      setBrandConfig(next === "light" ? lightBrand : baseBrand)
      return next
    })
  }, [baseBrand, lightBrand])

  const updateBrandConfig = useCallback((partial: Partial<BrandConfig>) => {
    setBrandConfig((prev) => ({ ...prev, ...partial }))
  }, [])

  const resetBrandConfig = useCallback(() => {
    setBrandConfig(mode === "light" ? lightBrand : baseBrand)
  }, [mode, baseBrand, lightBrand])

  return (
    <ThemeContext.Provider value={{ brandConfig, mode, updateBrandConfig, resetBrandConfig, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useBrand() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useBrand must be used within ThemeProvider")
  return ctx
}
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

Run: `cd "/Users/amaan/Documents/Apps - Pixeltec/massagePro/massage pro" && npx tsc --noEmit 2>&1 | head -30`
Expected: No errors (or only pre-existing warnings).

- [ ] **Step 4: Test in browser**

1. Open http://localhost:3000/shops, select CK Footworks
2. Login, toggle dark/light mode — CK should now have a proper dark theme with green accents on dark backgrounds
3. Switch to Koko Massage — verify Koko's dark/light still works correctly

- [ ] **Step 5: Commit**

```bash
git add lib/theme/brand-config.ts lib/shop/types.ts lib/shop/shop-registry.ts lib/theme/theme-provider.tsx
git commit -m "feat: add CK Footworks dark/light brand configs and fix theme provider to use shop-specific brands"
```

---

## Chunk 2: Multi-Person Booking — Types & Hook

### Task 3: Add booking guest types

**Files:**
- Modify: `lib/types/index.ts`

- [ ] **Step 1: Add BookingGuest and BookingGuestDraft interfaces**

After the `Booking` interface (after line 147), add:

```typescript
// --- Booking Guest (for group bookings) ---
export interface BookingGuest {
  id: string
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

// Draft state during booking flow — fields populated progressively per step
export interface BookingGuestDraft {
  id: string              // generated on addGuest()
  name: string            // entered in Step 1
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

- [ ] **Step 2: Extend Booking interface with guest fields**

In the `Booking` interface, add before the closing `}` (before the line with `roomId?: string`):

```typescript
  guests?: BookingGuest[]
  groupSize?: number
```

---

### Task 4: Add i18n keys for group booking

**Files:**
- Modify: `lib/i18n/locales/en.ts`

- [ ] **Step 1: Add English translation keys**

Add at the end of the `en` object (before the final `}` and `export`):

```typescript
  // ── Group Booking ─────────────────────────────────────────────────────
  justMe: "Just me",
  groupBooking: "Group booking",
  addGuest: "Add guest",
  removeGuest: "Remove",
  guestName: "Guest name",
  guestNamePlaceholder: "Enter guest's name",
  guestService: "Service for",
  alsoServing: "Also serving",
  groupSubtotal: "Group subtotal",
  groupTotal: "Group total",
  guestsLabel: "guests",
  maxGuestsReached: "Maximum 3 people per booking",
  noRoomsWarning: "Not enough rooms available for group size",
  bookingForGroup: "Booking for",
  people: "people",
  primaryBooker: "You",
  selectTherapistFor: "Select therapist for",
  roomFor: "Room for",
```

- [ ] **Step 2: Add same keys to other locale files (th, ko, ja, de) with English fallback values**

For each locale file (`lib/i18n/locales/th.ts`, `ko.ts`, `ja.ts`, `de.ts`), add the same keys with English values as placeholders. The `t()` function already falls back to English when a key is missing, so this is not strictly required — but adding them prevents TypeScript type issues if the translation type is strict.

Add to each file's object (before closing):

```typescript
  // ── Group Booking (English fallback — translate later) ────────────────
  justMe: "Just me",
  groupBooking: "Group booking",
  addGuest: "Add guest",
  removeGuest: "Remove",
  guestName: "Guest name",
  guestNamePlaceholder: "Enter guest's name",
  guestService: "Service for",
  alsoServing: "Also serving",
  groupSubtotal: "Group subtotal",
  groupTotal: "Group total",
  guestsLabel: "guests",
  maxGuestsReached: "Maximum 3 people per booking",
  noRoomsWarning: "Not enough rooms available for group size",
  bookingForGroup: "Booking for",
  people: "people",
  primaryBooker: "You",
  selectTherapistFor: "Select therapist for",
  roomFor: "Room for",
```

- [ ] **Step 3: Commit**

```bash
git add lib/types/index.ts lib/i18n/locales/
git commit -m "feat: add BookingGuest types and i18n keys for group booking"
```

---

### Task 5: Extend use-booking-flow hook with guest state

**Files:**
- Modify: `hooks/use-booking-flow.ts`

- [ ] **Step 1: Add guest imports and state**

At the top of the file, add to the type imports (line 12):

```typescript
import type { StaffMember, ServiceOption, MassageRoom, MassageType, HealthCondition, PainArea, BookingGuestDraft, BookingGuest } from "@/lib/types"
```

- [ ] **Step 2: Add guest state inside useBookingFlow (after the `useGiftCard` state declaration)**

```typescript
  const [isGroupBooking, setIsGroupBooking] = useState(false)
  const [guests, setGuests] = useState<BookingGuestDraft[]>([])
```

- [ ] **Step 3: Add guest handlers (after the `handleServiceSelect` function)**

```typescript
  function toggleGroupBooking() {
    setIsGroupBooking((prev) => {
      if (prev) setGuests([])
      return !prev
    })
  }

  function addGuest() {
    if (guests.length >= 2) return // max 2 guests (3 total)
    setGuests((prev) => [...prev, { id: crypto.randomUUID(), name: "" }])
  }

  function removeGuest(id: string) {
    setGuests((prev) => prev.filter((g) => g.id !== id))
  }

  function updateGuest(id: string, partial: Partial<BookingGuestDraft>) {
    setGuests((prev) => prev.map((g) => g.id === id ? { ...g, ...partial } : g))
  }

  function getFilteredStaffForGuest(guestId: string): StaffMember[] {
    const guest = guests.find((g) => g.id === guestId)
    if (!guest?.serviceType) return staffMembers
    return staffMembers.filter((s) => s.specialties.includes(guest.serviceType!))
  }
```

- [ ] **Step 4: Add derived group pricing (after the `activePromo` derived value)**

```typescript
  const guestsTotalPrice = useMemo(
    () => guests.reduce((sum, g) => sum + (g.price ?? 0), 0),
    [guests]
  )
  const groupTotalPrice = totalPrice + guestsTotalPrice
  const groupSize = 1 + guests.length
```

- [ ] **Step 5: Update handleBook to include guests**

Replace the existing `handleBook` callback. In the `createBooking` call, add these fields after `roomId`:

```typescript
      guests: guests.length > 0 ? guests.map((g): BookingGuest => ({
        id: g.id,
        name: g.name,
        serviceId: g.serviceId ?? selectedService!.id,
        serviceName: g.serviceName ?? selectedService!.name,
        serviceType: g.serviceType ?? selectedService!.type,
        staffId: g.staffId ?? selectedStaff!.id,
        staffName: g.staffName ?? selectedStaff!.name,
        staffAvatar: g.staffAvatar ?? selectedStaff!.avatar,
        duration: g.duration ?? selectedDuration!,
        price: g.price ?? 0,
        roomId: g.roomId,
      })) : undefined,
      groupSize: guests.length > 0 ? 1 + guests.length : undefined,
```

Also add `guests` to the `useCallback` dependency array.

- [ ] **Step 6: Add new fields to the return object**

Add to the return object (after the existing handlers section):

```typescript
    // Group booking
    isGroupBooking,
    guests,
    groupSize,
    guestsTotalPrice,
    groupTotalPrice,
    toggleGroupBooking,
    addGuest,
    removeGuest,
    updateGuest,
    getFilteredStaffForGuest,
```

- [ ] **Step 7: Verify TypeScript compiles**

Run: `cd "/Users/amaan/Documents/Apps - Pixeltec/massagePro/massage pro" && npx tsc --noEmit 2>&1 | head -30`

- [ ] **Step 8: Commit**

```bash
git add hooks/use-booking-flow.ts
git commit -m "feat: add group booking state and handlers to useBookingFlow hook"
```

---

## Chunk 3: Multi-Person Booking — UI Components

### Task 6: Update ServiceStep with group booking toggle and guest cards

**Files:**
- Modify: `components/booking/service-step.tsx`

- [ ] **Step 1: Update the ServiceStepProps interface**

Add these props after `onToggleAddOn`:

```typescript
  isGroupBooking: boolean
  guests: BookingGuestDraft[]
  onToggleGroupBooking: () => void
  onAddGuest: () => void
  onRemoveGuest: (id: string) => void
  onUpdateGuest: (id: string, partial: Partial<BookingGuestDraft>) => void
```

Add the import for `BookingGuestDraft`:

```typescript
import type { ServiceOption, MassageType, ServiceAddOn, BookingGuestDraft } from "@/lib/types"
```

Add `UserPlus, X, Users` to the lucide-react import.

- [ ] **Step 2: Add group toggle and guest cards UI**

After the recommendation banner `</div>` (after line 44) and before the services list `<div className="mt-4 flex flex-col gap-3">` (line 46), add:

```tsx
      {/* Group Booking Toggle */}
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleGroupBooking}
          className={cn(
            "flex-1 rounded-xl border py-2.5 text-center text-xs font-medium transition-all",
            !isGroupBooking
              ? "border-brand-primary bg-brand-primary/15 text-brand-primary"
              : "border-brand-border bg-card text-brand-text-secondary"
          )}
        >
          {t("justMe")}
        </button>
        <button
          type="button"
          onClick={onToggleGroupBooking}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-medium transition-all",
            isGroupBooking
              ? "border-brand-primary bg-brand-primary/15 text-brand-primary"
              : "border-brand-border bg-card text-brand-text-secondary"
          )}
        >
          <Users size={14} />
          {t("groupBooking")}
        </button>
      </div>

      {/* Guest Cards */}
      {isGroupBooking && (
        <div className="mt-3 space-y-2">
          {guests.map((guest, idx) => (
            <div key={guest.id} className="rounded-xl border border-brand-border bg-card p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-brand-text-secondary">
                  {t("guestService")} {guest.name || `Guest ${idx + 1}`}
                </p>
                <button
                  type="button"
                  onClick={() => onRemoveGuest(guest.id)}
                  className="flex items-center gap-1 text-[10px] text-brand-coral hover:text-brand-coral/80"
                >
                  <X size={12} />
                  {t("removeGuest")}
                </button>
              </div>
              <input
                type="text"
                value={guest.name}
                onChange={(e) => onUpdateGuest(guest.id, { name: e.target.value })}
                placeholder={t("guestNamePlaceholder")}
                className={cn(
                  "w-full rounded-lg border bg-brand-bg-tertiary px-3 py-2 text-sm text-brand-text-primary placeholder:text-brand-text-tertiary focus:border-brand-primary focus:outline-none",
                  !guest.name ? "border-brand-coral/40" : "border-brand-border"
                )}
              />
              {/* Guest service picker */}
              <div className="mt-2 flex flex-col gap-1.5">
                {sortedServices.map((svc) => (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => {
                      const dur = svc.durations[0]
                      onUpdateGuest(guest.id, {
                        serviceId: svc.id,
                        serviceName: svc.name,
                        serviceType: svc.type,
                        duration: dur.minutes,
                        price: dur.price,
                      })
                    }}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition-all",
                      guest.serviceId === svc.id
                        ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                        : "border-brand-border bg-brand-bg-tertiary text-brand-text-secondary"
                    )}
                  >
                    <span className="font-medium">{svc.name}</span>
                    <span>{formatPrice(svc.durations[0].price)}</span>
                  </button>
                ))}
              </div>
              {/* Guest duration picker */}
              {guest.serviceId && (() => {
                const guestSvc = sortedServices.find((s) => s.id === guest.serviceId)
                if (!guestSvc || guestSvc.durations.length <= 1) return null
                return (
                  <div className="mt-2 flex gap-1.5 flex-wrap">
                    {guestSvc.durations.map((d) => (
                      <button
                        key={d.minutes}
                        type="button"
                        onClick={() => onUpdateGuest(guest.id, { duration: d.minutes, price: d.price })}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-[10px] font-medium transition-colors",
                          guest.duration === d.minutes
                            ? "border-brand-primary bg-brand-primary/15 text-brand-primary"
                            : "border-brand-border bg-brand-bg-tertiary text-brand-text-secondary"
                        )}
                      >
                        {d.minutes} {t("min")} — {formatPrice(d.price)}
                      </button>
                    ))}
                  </div>
                )
              })()}
            </div>
          ))}
          {guests.length < 2 && (
            <button
              type="button"
              onClick={onAddGuest}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-brand-primary/40 py-3 text-xs font-medium text-brand-primary transition-colors hover:bg-brand-primary/5"
            >
              <UserPlus size={14} />
              {t("addGuest")}
            </button>
          )}
          {guests.length >= 2 && (
            <p className="text-center text-[10px] text-brand-text-tertiary">{t("maxGuestsReached")}</p>
          )}
        </div>
      )}
```

- [ ] **Step 3: Fix hardcoded `text-[#0A0A0F]` on line 69 and line 147**

Replace `text-[#0A0A0F]` with `text-primary-foreground` in both places.

- [ ] **Step 4: Commit**

```bash
git add components/booking/service-step.tsx
git commit -m "feat: add group booking toggle and guest cards to service step"
```

---

### Task 7: Update TherapistStep with per-guest therapist selection

**Files:**
- Modify: `components/booking/therapist-step.tsx`

- [ ] **Step 1: Update TherapistStepProps interface**

Replace the interface:

```typescript
interface TherapistStepProps {
  filteredStaff: StaffMember[]
  selectedStaff: StaffMember | null
  selectedService: ServiceOption | null
  onSelectStaff: (staff: StaffMember) => void
  // Group booking
  isGroupBooking: boolean
  guests: BookingGuestDraft[]
  onUpdateGuest: (id: string, partial: Partial<BookingGuestDraft>) => void
  getFilteredStaffForGuest: (guestId: string) => StaffMember[]
}
```

Add import for `BookingGuestDraft`:

```typescript
import type { StaffMember, ServiceOption, BookingGuestDraft } from "@/lib/types"
```

- [ ] **Step 2: Add per-guest therapist selection after the main therapist list**

After the `StaffReviewsDialog` closing tag (before the final `</div>` of the component), add:

```tsx
      {/* Guest therapist selection */}
      {isGroupBooking && guests.length > 0 && (
        <div className="mt-6 space-y-4">
          {guests.map((guest) => {
            const guestStaff = getFilteredStaffForGuest(guest.id)
            return (
              <div key={guest.id}>
                <h3 className="text-sm font-semibold text-brand-text-primary mb-2">
                  {t("selectTherapistFor")} {guest.name || "Guest"}
                </h3>
                <div className="flex flex-col gap-2">
                  {guestStaff.map((staff) => {
                    const isAssigned = staff.id === guest.staffId
                    const assignedTo = staff.id === selectedStaff?.id
                      ? t("primaryBooker")
                      : guests.find((g) => g.id !== guest.id && g.staffId === staff.id)?.name
                    return (
                      <button
                        key={staff.id}
                        type="button"
                        onClick={() => onUpdateGuest(guest.id, {
                          staffId: staff.id,
                          staffName: staff.name,
                          staffAvatar: staff.avatar,
                        })}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                          isAssigned
                            ? "border-brand-primary bg-brand-primary/5"
                            : "border-brand-border bg-card"
                        )}
                      >
                        <StaffAvatar src={staff.avatar} name={staff.name} size="sm" available={staff.isAvailableToday} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-brand-text-primary">{staff.nickname}</p>
                          {assignedTo && (
                            <p className="text-[10px] text-brand-text-tertiary">
                              {t("alsoServing")} {assignedTo}
                            </p>
                          )}
                        </div>
                        <p className="text-xs font-medium text-brand-primary">{formatPrice(staff.pricePerHour)}/hr</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
```

- [ ] **Step 3: Commit**

```bash
git add components/booking/therapist-step.tsx
git commit -m "feat: add per-guest therapist selection to therapist step"
```

---

### Task 8: Update DateTimeStep with per-guest room assignment

**Files:**
- Modify: `components/booking/datetime-step.tsx`

- [ ] **Step 1: Update DateTimeStepProps interface**

Add these props:

```typescript
  isGroupBooking: boolean
  guests: BookingGuestDraft[]
  onUpdateGuest: (id: string, partial: Partial<BookingGuestDraft>) => void
```

Add import for `BookingGuestDraft`:

```typescript
import type { StaffMember, MassageRoom, RoomType, TimeSlot, BookingGuestDraft } from "@/lib/types"
```

- [ ] **Step 2: Add per-guest room selection after the existing room section**

After the closing `</div>` of the `activeRooms.length > 0` block, add:

```tsx
      {/* Per-guest room assignment */}
      {isGroupBooking && guests.length > 0 && activeRooms.length > 0 && (
        <div className="mt-4 space-y-3">
          {guests.map((guest) => (
            <div key={guest.id}>
              <p className="text-xs font-semibold text-brand-text-secondary mb-2">
                {t("roomFor")} {guest.name || "Guest"}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {activeRooms.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => onUpdateGuest(guest.id, {
                      roomId: guest.roomId === room.id ? undefined : room.id,
                    })}
                    className={cn(
                      "rounded-xl border p-2.5 text-center text-xs transition-all",
                      guest.roomId === room.id
                        ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-medium"
                        : "border-brand-border bg-card text-brand-text-secondary"
                    )}
                  >
                    {room.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
```

- [ ] **Step 3: Commit**

```bash
git add components/booking/datetime-step.tsx
git commit -m "feat: add per-guest room assignment to datetime step"
```

---

### Task 9: Update ConfirmationStep with group summary

**Files:**
- Modify: `components/booking/confirmation-step.tsx`

- [ ] **Step 1: Update ConfirmationStepProps interface**

Add these props:

```typescript
  isGroupBooking: boolean
  guests: BookingGuestDraft[]
  guestsTotalPrice: number
  groupTotalPrice: number
```

Add `Users` to lucide-react import.
Add `BookingGuestDraft` to the types import.

- [ ] **Step 2: Fix hardcoded `text-black` on confirmation button (line 94)**

Replace `text-black` with `text-primary-foreground` in the "View My Bookings" link button.

- [ ] **Step 3: Add group booking summary in the confirmation card**

After the existing price summary section (the `<div className="border-t border-brand-border pt-3 space-y-1.5">` block), but inside the main card `<div>`, add:

```tsx
          {/* Guest line items */}
          {isGroupBooking && guests.length > 0 && (
            <div className="border-t border-brand-border pt-3 mt-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-brand-text-secondary">
                <Users size={13} /> {t("guestsLabel")} ({guests.length})
              </p>
              {guests.map((guest) => (
                <div key={guest.id} className="flex items-center justify-between text-sm py-1">
                  <div>
                    <span className="text-brand-text-primary font-medium">{guest.name || "Guest"}</span>
                    <span className="text-brand-text-tertiary text-xs ml-2">
                      {guest.serviceName} · {guest.duration} {t("minutes")} · {guest.staffName}
                    </span>
                  </div>
                  <span className="font-medium text-brand-text-primary">{formatPrice(guest.price ?? 0)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 mt-1 border-t border-brand-border">
                <span className="font-semibold text-brand-text-primary">{t("groupTotal")}</span>
                <span className="text-lg font-bold text-brand-primary">{formatPrice(groupTotalPrice)}</span>
              </div>
            </div>
          )}
```

- [ ] **Step 4: Update the "booked" success view to show group info**

In the `isBooked` return block, after the service description paragraph, add:

```tsx
        {isGroupBooking && guests.length > 0 && (
          <p className="mt-2 text-sm text-brand-text-secondary">
            {t("bookingForGroup")} {1 + guests.length} {t("people")}
          </p>
        )}
```

- [ ] **Step 5: Commit**

```bash
git add components/booking/confirmation-step.tsx
git commit -m "feat: add group booking summary to confirmation step"
```

---

### Task 10: Wire everything in the book page

**Files:**
- Modify: `app/(customer)/book/page.tsx`

- [ ] **Step 1: Pass group booking props to ServiceStep**

Update the ServiceStep render (around line 93) to add:

```tsx
          isGroupBooking={bk.isGroupBooking}
          guests={bk.guests}
          onToggleGroupBooking={bk.toggleGroupBooking}
          onAddGuest={bk.addGuest}
          onRemoveGuest={bk.removeGuest}
          onUpdateGuest={bk.updateGuest}
```

- [ ] **Step 2: Pass group booking props to TherapistStep**

Update the TherapistStep render to add:

```tsx
          isGroupBooking={bk.isGroupBooking}
          guests={bk.guests}
          onUpdateGuest={bk.updateGuest}
          getFilteredStaffForGuest={bk.getFilteredStaffForGuest}
```

- [ ] **Step 3: Pass group booking props to DateTimeStep**

Add to both DateTimeStep renders:

```tsx
          isGroupBooking={bk.isGroupBooking}
          guests={bk.guests}
          onUpdateGuest={bk.updateGuest}
```

- [ ] **Step 4: Pass group booking props to ConfirmationStep**

Add to both ConfirmationStep renders (the isBooked=true and isBooked=false instances):

```tsx
          isGroupBooking={bk.isGroupBooking}
          guests={bk.guests}
          guestsTotalPrice={bk.guestsTotalPrice}
          groupTotalPrice={bk.groupTotalPrice}
```

- [ ] **Step 5: Update bottom CTA price display to show group total**

In the bottom CTA bar, change the price display condition:

Replace:
```tsx
{bk.totalPrice > 0 && bk.step < 4 && (
```

With:
```tsx
{(bk.groupTotalPrice > 0 || bk.totalPrice > 0) && bk.step < 4 && (
```

And change `{formatPrice(bk.totalPrice)}` to `{formatPrice(bk.isGroupBooking ? bk.groupTotalPrice : bk.totalPrice)}`.

- [ ] **Step 6: Update step 1 disabled check for group booking**

Update the disabled condition for step 1 to also validate guests have names:

Replace:
```tsx
(bk.step === 1 && (!bk.selectedService || !bk.selectedDuration)) ||
```

With:
```tsx
(bk.step === 1 && (!bk.selectedService || !bk.selectedDuration || (bk.isGroupBooking && bk.guests.some(g => !g.name || !g.serviceId)))) ||
```

Also add for step 2, validate guests have therapists if group booking:

Replace:
```tsx
(bk.step === 2 && !bk.selectedStaff) ||
```

With:
```tsx
(bk.step === 2 && (!bk.selectedStaff || (bk.isGroupBooking && bk.guests.some(g => !g.staffId)))) ||
```

- [ ] **Step 7: Verify TypeScript compiles and test in browser**

Run: `cd "/Users/amaan/Documents/Apps - Pixeltec/massagePro/massage pro" && npx tsc --noEmit 2>&1 | head -30`

Test: Open http://localhost:3000/book, toggle to "Group booking", add a guest, fill in details through all 4 steps.

- [ ] **Step 8: Commit**

```bash
git add app/\(customer\)/book/page.tsx
git commit -m "feat: wire group booking props through all booking flow steps"
```

---

## Chunk 4: Booking Card & Display Updates

### Task 11: Update BookingCard with guest count badge

**Files:**
- Modify: `components/shared/booking-card.tsx`

- [ ] **Step 1: Add group badge to booking card**

Add `Users` to the lucide-react import.

After the staff name line (line 61 area, `<p className="text-sm text-brand-text-secondary">{t("with")} {booking.staffName}</p>`), add:

```tsx
                {booking.groupSize && booking.groupSize > 1 && (
                  <span className="flex items-center gap-1 text-xs text-brand-text-tertiary">
                    <Users size={11} />
                    {booking.groupSize} {t("people")}
                  </span>
                )}
```

- [ ] **Step 2: Commit**

```bash
git add components/shared/booking-card.tsx
git commit -m "feat: show group size badge on booking cards"
```

---

## Chunk 5: Hardcoded Color Fixes & UI Audit

### Task 12: Fix hardcoded colors in admin modals and pages

**Files:**
- Modify: `components/admin/services/room-modal.tsx`
- Modify: `components/admin/services/addon-modal.tsx`
- Modify: `components/admin/services/service-modal.tsx`
- Modify: `app/admin/services/page.tsx`
- Modify: `app/login/page.tsx`
- Modify: `components/shared/loyalty-stamp-card.tsx`
- Modify: `app/(customer)/loyalty/page.tsx`

- [ ] **Step 1: Fix text-[#0A0A0F] in room-modal.tsx**

Search for `text-[#0A0A0F]` and replace with `text-primary-foreground`.

- [ ] **Step 2: Fix text-[#0A0A0F] in addon-modal.tsx**

Same replacement.

- [ ] **Step 3: Fix text-[#0A0A0F] in service-modal.tsx**

Same replacement.

- [ ] **Step 4: Fix text-[#0A0A0F] in app/admin/services/page.tsx**

Search for `text-[#0A0A0F]` (2 instances) and replace with `text-primary-foreground`.

- [ ] **Step 5: Fix hardcoded Koko colors in app/login/page.tsx**

Search for `text-[#0A0A0F]` and `bg-[#FACC15]` / `border-[#FACC15]`. Replace with:
- `text-[#0A0A0F]` → `text-primary-foreground`
- `bg-[#FACC15]` → `bg-primary`
- `border-[#FACC15]` → `border-primary`

- [ ] **Step 6: Fix text-black on brand-colored backgrounds in loyalty components**

In `components/shared/loyalty-stamp-card.tsx` and `app/(customer)/loyalty/page.tsx`, find `text-black` on brand-colored button backgrounds and replace with `text-primary-foreground`.

- [ ] **Step 7: Commit**

```bash
git add components/admin/services/room-modal.tsx components/admin/services/addon-modal.tsx components/admin/services/service-modal.tsx app/admin/services/page.tsx app/login/page.tsx components/shared/loyalty-stamp-card.tsx app/\(customer\)/loyalty/page.tsx
git commit -m "fix: replace hardcoded colors with brand variables in admin modals, login, and loyalty pages"
```

---

### Task 13: Full hardcoded color sweep

**Files:**
- Various component files across the project

- [ ] **Step 1: Search for all hardcoded color patterns**

Run these grep commands to find all instances:

```bash
cd "/Users/amaan/Documents/Apps - Pixeltec/massagePro/massage pro"
grep -rn "text-\[#0A0A0F\]" --include="*.tsx" --include="*.ts"
grep -rn 'text-black' --include="*.tsx" --include="*.ts" components/ app/
grep -rn 'bg-white\b' --include="*.tsx" --include="*.ts" components/ app/
grep -rn 'text-white\b' --include="*.tsx" --include="*.ts" components/ app/
grep -rn 'bg-black\b' --include="*.tsx" --include="*.ts" components/ app/
```

- [ ] **Step 2: Fix each instance**

For each result:
- `text-black` on brand-colored backgrounds → `text-primary-foreground`
- `bg-white` → `bg-background` or `bg-card` depending on context
- `text-white` on brand-colored backgrounds → `text-primary-foreground`
- Leave `text-black`/`text-white` alone if they're on a non-themed surface (e.g., a toast or external component)

- [ ] **Step 3: Commit**

```bash
git add -u
git commit -m "fix: replace hardcoded colors with brand/theme variables across all components"
```

---

### Task 14: Layout and overlap audit

**Files:**
- Various page files

- [ ] **Step 1: Check all customer pages for bottom padding**

Every page under `app/(customer)/` must have `pb-20` or more on its outermost scrollable container to avoid content hiding behind the fixed bottom nav.

Grep for pages that might be missing padding:

```bash
grep -rL "pb-2[0-9]\|pb-44\|pb-24" app/\(customer\)/*/page.tsx
```

- [ ] **Step 2: Check for mode toggle overlap**

The `ModeToggle` is fixed at `right-4 top-4`. Any page with a header row needs `pr-14` or should position the header below the toggle. Check each customer page's header area.

- [ ] **Step 3: Verify admin and staff layout theme toggles work for CK**

Open http://localhost:3000 as admin and staff roles with CK Footworks selected. Toggle dark/light. Both should use CK-specific brands now (since both layouts use `ThemeProvider` which reads from `shopConfig`).

- [ ] **Step 4: Spot-check all navigation links**

Click through every bottom nav item (Home, Therapists, Book, Promos, Profile) and verify no 404s. Do the same for admin sidebar items and staff bottom nav.

- [ ] **Step 5: Commit any fixes**

```bash
git add -u
git commit -m "fix: layout padding, overlap, and navigation audit fixes"
```

---

### Task 15: Functional smoke test

- [ ] **Step 1: Test single booking flow end-to-end**

1. Select CK Footworks shop
2. Login as customer
3. Go to Book → select Reflexology → 60min → select therapist → select date/time → confirm → submit
4. Verify booking appears in My Bookings

- [ ] **Step 2: Test group booking flow end-to-end**

1. Go to Book → toggle "Group booking" → add 1 guest
2. Fill in guest name and service
3. Select therapist for both primary and guest
4. Select date/time, optionally rooms
5. Confirm → submit
6. Verify booking shows with group badge in My Bookings

- [ ] **Step 3: Test dark/light toggle on both shops**

1. CK Footworks: toggle dark → proper dark green theme. Toggle light → warm white/green theme.
2. Koko Massage: toggle dark → dark luxury theme. Toggle light → amber/white theme.
3. Switch between shops and verify theme persists per mode.

- [ ] **Step 4: Test promo and gift card flows**

1. Apply a promo to a booking, verify price shows 0
2. Toggle gift card checkbox, verify deduction shows

- [ ] **Step 5: Test cancel booking**

1. Find a pending/confirmed booking
2. Cancel it, verify status updates

- [ ] **Step 6: Final commit if any fixes needed**

```bash
git add -u
git commit -m "fix: functional test fixes"
```
