# Phone / Walk-in Booking — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated admin page where managers can quickly create bookings on behalf of phone callers or walk-in customers, with customer search/create, multi-session support, group guests, therapist availability timelines, and call notes.

**Architecture:** Customer-first single-page flow as a new admin route (`/admin/phone-booking`). New sidebar nav item after Calendar. Page built from composable components: customer search/create, session cards with inline therapist timelines, notes section, and booking summary. All state managed locally in the page component, bookings created via existing `BookingsContext`. A new `addOns` field is added to the `Booking` type and a `source` field to track booking origin.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Radix UI components, Tailwind CSS, lucide-react icons, existing React Context data stores.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `lib/types/index.ts` | Add `source` and `addOns` fields to `Booking` type |
| `lib/i18n/locales/en.ts` | Add phone booking translation keys |
| `lib/i18n/locales/th.ts` | Add phone booking translation keys (Thai) |
| `lib/i18n/locales/ko.ts` | Add phone booking translation keys (Korean) |
| `lib/i18n/locales/ja.ts` | Add phone booking translation keys (Japanese) |
| `lib/i18n/locales/de.ts` | Add phone booking translation keys (German) |
| `lib/i18n/locales/ru.ts` | Add phone booking translation keys (Russian) |
| `app/admin/layout.tsx` | Add nav item for phone booking |
| `app/admin/phone-booking/page.tsx` | Main page component orchestrating all sections |
| `components/admin/phone-booking/customer-search.tsx` | Search bar + results dropdown + customer info card |
| `components/admin/phone-booking/customer-quick-create.tsx` | Inline new customer form (name + phone) |
| `components/admin/phone-booking/session-card.tsx` | Single session: service/duration/date pickers + therapist timeline |
| `components/admin/phone-booking/therapist-timeline.tsx` | Availability timeline strip for one therapist |
| `components/admin/phone-booking/guest-row.tsx` | Guest within a group session: name/service/therapist fields |
| `components/admin/phone-booking/booking-summary.tsx` | Itemized summary with totals + confirm button |
| `components/admin/phone-booking/success-screen.tsx` | Post-confirmation screen with action links |
| `hooks/use-phone-booking.ts` | State management hook for the phone booking page |
| `lib/data/customers-store.tsx` | New context for customer CRUD (currently customers are static mock data) |
| `components/providers.tsx` | Register CustomersProvider |

---

## Chunk 1: Data Layer & Navigation

### Task 1: Add `source` and `addOns` fields to Booking type

**Files:**
- Modify: `lib/types/index.ts`

- [ ] **Step 1: Add `source` field to Booking interface**

In `lib/types/index.ts`, find the `Booking` interface (around line 113). Add after the `guests?` and `groupSize?` fields:

```typescript
  source?: "online" | "phone"
  addOns?: { addOnId: string; name: string; price: number; extraMinutes: number }[]
```

Both fields are optional so existing bookings remain valid without migration.

- [ ] **Step 2: Verify the app still compiles**

Run: `cd "/Users/amaan/Documents/Apps - Pixeltec/massagePro/massage pro" && npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds (no type errors from adding optional fields).

- [ ] **Step 3: Commit**

```bash
git add lib/types/index.ts
git commit -m "feat: add source and addOns fields to Booking type"
```

---

### Task 2: Create CustomersProvider for customer CRUD

**Files:**
- Create: `lib/data/customers-store.tsx`
- Modify: `components/providers.tsx`

Currently customers are static mock data with no mutation support. We need a context to search and create customers.

- [ ] **Step 1: Create the customers store**

Create `lib/data/customers-store.tsx`:

```tsx
"use client"

import React, {
  createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode,
} from "react"
import type { Customer } from "@/lib/types"
import { useShop } from "@/lib/shop/shop-context"
import { getSeedsForShop } from "@/lib/data/seeds"
import { generateMembershipNumber } from "@/lib/data/mock-data"

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function load<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : seed
  } catch { return seed }
}

function save<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

interface CustomersContextType {
  customers: Customer[]
  createCustomer: (name: string, phone: string, email?: string) => Customer
  searchCustomers: (query: string) => Customer[]
  getCustomerById: (id: string) => Customer | undefined
}

const CustomersContext = createContext<CustomersContextType | null>(null)

export function CustomersProvider({ children }: { children: ReactNode }) {
  const { shopId } = useShop()
  const prefix = shopId ?? "koko"
  const CUSTOMERS_KEY = `${prefix}-customers`

  const [customers, setCustomers] = useState<Customer[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
    const seeds = getSeedsForShop(prefix)
    setCustomers(load(CUSTOMERS_KEY, seeds.customers))
    setReady(true)
  }, [shopId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (ready) save(CUSTOMERS_KEY, customers) }, [customers, ready])

  const createCustomer = useCallback((name: string, phone: string, email?: string): Customer => {
    const newCustomer: Customer = {
      id: genId("c"),
      name,
      phone,
      email: email || "",
      avatar: "",
      memberSince: new Date().toISOString().split("T")[0],
      membershipNumber: generateMembershipNumber(),
      totalBookings: 0,
      totalSpent: 0,
      preferredStaff: [],
      preferredServices: [],
      loyaltyPoints: 0,
      loyaltyStamps: 0,
      giftCardBalance: 0,
      trialActive: false,
    }
    setCustomers(prev => [...prev, newCustomer])
    return newCustomer
  }, [])

  const searchCustomers = useCallback((query: string): Customer[] => {
    if (!query.trim()) return []
    const q = query.toLowerCase().trim()
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.membershipNumber.toLowerCase().includes(q)
    )
  }, [customers])

  const getCustomerById = useCallback((id: string): Customer | undefined => {
    return customers.find(c => c.id === id)
  }, [customers])

  const value = useMemo(() => ({
    customers, createCustomer, searchCustomers, getCustomerById
  }), [customers, createCustomer, searchCustomers, getCustomerById])

  return (
    <CustomersContext.Provider value={value}>
      {children}
    </CustomersContext.Provider>
  )
}

export function useCustomers() {
  const ctx = useContext(CustomersContext)
  if (!ctx) throw new Error("useCustomers must be used within CustomersProvider")
  return ctx
}
```

- [ ] **Step 2: Register CustomersProvider in providers.tsx**

In `components/providers.tsx`, import and wrap `CustomersProvider` around the existing provider stack. Place it after `ShopProvider` and `AuthProvider` but before the data stores that might depend on it. Follow the nesting pattern of the other providers in that file.

- [ ] **Step 3: Verify build**

Run: `cd "/Users/amaan/Documents/Apps - Pixeltec/massagePro/massage pro" && npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add lib/data/customers-store.tsx components/providers.tsx
git commit -m "feat: add CustomersProvider for customer CRUD"
```

---

### Task 3: Add navigation item and translation keys

**Files:**
- Modify: `app/admin/layout.tsx`
- Modify: `lib/i18n/locales/en.ts`
- Modify: `lib/i18n/locales/th.ts`
- Modify: `lib/i18n/locales/ko.ts`
- Modify: `lib/i18n/locales/ja.ts`
- Modify: `lib/i18n/locales/de.ts`
- Modify: `lib/i18n/locales/ru.ts`

- [ ] **Step 1: Add translation keys to English locale**

In `lib/i18n/locales/en.ts`, add these keys in the Admin Nav section (after existing nav keys):

```typescript
  navPhoneBooking: "Phone / Walk-in",
  // Phone Booking page
  phoneBookingTitle: "Phone / Walk-in Booking",
  phoneBookingSearchPlaceholder: "Search by name or membership #...",
  phoneBookingNewCustomer: "New Customer",
  phoneBookingCreateAndContinue: "Create & Continue",
  phoneBookingNameRequired: "Name",
  phoneBookingPhoneRequired: "Phone",
  phoneBookingEmailOptional: "Email (optional)",
  phoneBookingAddEmail: "+ Add email (optional)",
  phoneBookingNoCustomer: "No customer selected — search above or create new",
  phoneBookingClearCustomer: "Clear",
  phoneBookingVisits: "Visits",
  phoneBookingSpent: "Spent",
  phoneBookingLoyalty: "Loyalty",
  phoneBookingPreferred: "Preferred",
  phoneBookingLastVisit: "Last visit",
  phoneBookingViewHistory: "View history",
  phoneBookingNone: "None",
  phoneBookingSessions: "Sessions",
  phoneBookingSession: "Session",
  phoneBookingAddSession: "+ Add Another Session",
  phoneBookingService: "Service",
  phoneBookingDuration: "Duration",
  phoneBookingDate: "Date",
  phoneBookingSelectTherapistTime: "Select Therapist & Time",
  phoneBookingFreeSlots: "free slots",
  phoneBookingDayOff: "Day off",
  phoneBookingBooked: "Booked",
  phoneBookingFree: "Free",
  phoneBookingTooShort: "Too short",
  phoneBookingAnyAvailable: "Any Available",
  phoneBookingAddOns: "+ Add-ons",
  phoneBookingAddGuest: "+ Group Guest",
  phoneBookingRemoveSession: "Remove",
  phoneBookingEditSession: "Edit",
  phoneBookingGroup: "Group",
  phoneBookingGuest: "Guest",
  phoneBookingGuestName: "Name (optional)",
  phoneBookingCaller: "caller",
  phoneBookingAddAnotherGuest: "+ Add Another Guest",
  phoneBookingCallNotes: "Call Notes",
  phoneBookingCallNotesHint: "This note will be attached to all bookings from this call",
  phoneBookingOpenFullNotes: "Open Full Notes Panel",
  phoneBookingSummary: "Booking Summary",
  phoneBookingPayAtArrival: "Pay at arrival",
  phoneBookingConfirmAll: "Confirm All Bookings",
  phoneBookingTotal: "Total",
  phoneBookingBookingsConfirmed: "Bookings Confirmed",
  phoneBookingFor: "For",
  phoneBookingPlusGuests: "guests",
  phoneBookingViewCalendar: "View in Calendar",
  phoneBookingViewCustomer: "View Customer",
  phoneBookingNewBooking: "New Phone Booking",
  phoneBookingOperatingHours: "Operating hours",
  phoneBookingSelected: "Selected",
  phoneBookingConfirmedSlot: "Confirmed slot",
  phoneBookingMemberSince: "Member since",
  phoneBookingNoResults: "No customers found",
```

- [ ] **Step 2: Add translation keys to all other locales**

Add the same keys to `th.ts`, `ko.ts`, `ja.ts`, `de.ts`, and `ru.ts` with appropriate translations. Follow the existing pattern in each file. For each locale, translate all the keys added in Step 1.

- [ ] **Step 3: Add nav item to admin sidebar**

In `app/admin/layout.tsx`:

1. Add `Phone` to the lucide-react import:
```typescript
import {
  LayoutDashboard, Calendar, BookOpen, Users, Tag,
  Palette, ChevronLeft, ChevronRight, ChevronDown, Menu, X, Sun, Moon, LogOut, Sparkles, Star,
  Scale, MessageSquare, Heart, DollarSign, Languages, Phone,
} from "lucide-react"
```

2. Add the nav item after Calendar (position 3 in the array):
```typescript
{ label: t("navPhoneBooking"), href: "/admin/phone-booking", icon: Phone },
```

The `navItems` array should now be:
```
Dashboard, Calendar, Phone / Walk-in, Bookings, Staff, ...
```

- [ ] **Step 4: Create the placeholder page**

Create `app/admin/phone-booking/page.tsx`:

```tsx
"use client"

import { useLanguage } from "@/lib/i18n/language-context"

export default function PhoneBookingPage() {
  const { t } = useLanguage()
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-brand-text-primary">{t("phoneBookingTitle")}</h1>
      <p className="text-brand-text-secondary mt-2">Coming soon...</p>
    </div>
  )
}
```

- [ ] **Step 5: Verify build and nav item renders**

Run: `cd "/Users/amaan/Documents/Apps - Pixeltec/massagePro/massage pro" && npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds. Manually verify the nav item appears in the sidebar.

- [ ] **Step 6: Commit**

```bash
git add app/admin/layout.tsx app/admin/phone-booking/page.tsx lib/i18n/locales/
git commit -m "feat: add phone booking nav item, placeholder page, and translation keys"
```

---

## Chunk 2: Customer Section Components

### Task 4: Build CustomerSearch component

**Files:**
- Create: `components/admin/phone-booking/customer-search.tsx`

- [ ] **Step 1: Create the component**

Create `components/admin/phone-booking/customer-search.tsx`:

```tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { Search } from "lucide-react"
import { Customer } from "@/lib/types"
import { useCustomers } from "@/lib/data/customers-store"
import { useLanguage } from "@/lib/i18n/language-context"

interface CustomerSearchProps {
  onSelect: (customer: Customer) => void
  onNewClick: () => void
}

export function CustomerSearch({ onSelect, onNewClick }: CustomerSearchProps) {
  const { t } = useLanguage()
  const { searchCustomers } = useCustomers()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Customer[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim().length > 0) {
      setResults(searchCustomers(query))
      setIsOpen(true)
    } else {
      setResults([])
      setIsOpen(false)
    }
  }, [query, searchCustomers])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function handleSelect(customer: Customer) {
    onSelect(customer)
    setQuery("")
    setIsOpen(false)
  }

  return (
    <div className="flex gap-2" ref={containerRef}>
      <div className="flex-1 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("phoneBookingSearchPlaceholder")}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-brand-border bg-brand-bg-secondary text-brand-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        {/* Results dropdown */}
        {isOpen && results.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-brand-border bg-brand-bg-secondary shadow-lg overflow-hidden">
            {results.map((customer) => (
              <button
                key={customer.id}
                onClick={() => handleSelect(customer)}
                className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-brand-bg-primary transition-colors text-left border-b border-brand-border last:border-b-0"
              >
                <div className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center text-white text-sm font-medium shrink-0">
                  {customer.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-brand-text-primary truncate">{customer.name}</div>
                  <div className="text-xs text-brand-text-secondary">
                    {customer.membershipNumber} · {customer.phone.slice(0, -4)}**** · {customer.totalBookings} {t("phoneBookingVisits").toLowerCase()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {isOpen && query.trim().length > 0 && results.length === 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-brand-border bg-brand-bg-secondary shadow-lg p-3 text-sm text-brand-text-secondary">
            {t("phoneBookingNoResults")} "{query}"
          </div>
        )}
      </div>

      <button
        onClick={onNewClick}
        className="px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors whitespace-nowrap"
      >
        + {t("phoneBookingNewCustomer")}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd "/Users/amaan/Documents/Apps - Pixeltec/massagePro/massage pro" && npx next build --no-lint 2>&1 | tail -5`

- [ ] **Step 3: Commit**

```bash
git add components/admin/phone-booking/customer-search.tsx
git commit -m "feat: add CustomerSearch component for phone booking"
```

---

### Task 5: Build CustomerQuickCreate component

**Files:**
- Create: `components/admin/phone-booking/customer-quick-create.tsx`

- [ ] **Step 1: Create the component**

Create `components/admin/phone-booking/customer-quick-create.tsx`:

```tsx
"use client"

import { useState } from "react"
import { Customer } from "@/lib/types"
import { useCustomers } from "@/lib/data/customers-store"
import { useLanguage } from "@/lib/i18n/language-context"

interface CustomerQuickCreateProps {
  onCreated: (customer: Customer) => void
  onCancel: () => void
}

export function CustomerQuickCreate({ onCreated, onCancel }: CustomerQuickCreateProps) {
  const { t } = useLanguage()
  const { createCustomer } = useCustomers()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [showEmail, setShowEmail] = useState(false)
  const [email, setEmail] = useState("")

  function handleSubmit() {
    if (!name.trim() || !phone.trim()) return
    const customer = createCustomer(name.trim(), phone.trim(), email.trim() || undefined)
    onCreated(customer)
  }

  return (
    <div className="rounded-xl border border-brand-border bg-brand-bg-secondary p-4">
      <div className="text-sm font-semibold text-brand-text-primary mb-3">
        {t("phoneBookingNewCustomer")}
      </div>

      <div className="flex gap-3 mb-3">
        <div className="flex-1">
          <label className="text-xs text-brand-text-secondary uppercase mb-1 block">
            {t("phoneBookingNameRequired")} *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("phoneBookingNameRequired")}
            className="w-full px-3 py-2 rounded-lg border border-brand-border bg-brand-bg-primary text-brand-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            autoFocus
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-brand-text-secondary uppercase mb-1 block">
            {t("phoneBookingPhoneRequired")} *
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("phoneBookingPhoneRequired")}
            className="w-full px-3 py-2 rounded-lg border border-brand-border bg-brand-bg-primary text-brand-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>

      {showEmail && (
        <div className="mb-3">
          <label className="text-xs text-brand-text-secondary uppercase mb-1 block">
            {t("phoneBookingEmailOptional")}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="w-full px-3 py-2 rounded-lg border border-brand-border bg-brand-bg-primary text-brand-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        {!showEmail && (
          <button
            onClick={() => setShowEmail(true)}
            className="text-xs text-brand-text-secondary hover:text-brand-text-primary transition-colors"
          >
            {t("phoneBookingAddEmail")}
          </button>
        )}
        <div className="ml-auto flex gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-brand-text-secondary hover:text-brand-text-primary transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !phone.trim()}
            className="px-4 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("phoneBookingCreateAndContinue")}
          </button>
        </div>
      </div>

      <div className="mt-2 text-xs text-brand-text-secondary italic">
        A membership number will be auto-generated. Full profile can be completed later.
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd "/Users/amaan/Documents/Apps - Pixeltec/massagePro/massage pro" && npx next build --no-lint 2>&1 | tail -5`

- [ ] **Step 3: Commit**

```bash
git add components/admin/phone-booking/customer-quick-create.tsx
git commit -m "feat: add CustomerQuickCreate component for phone booking"
```

---

### Task 6: Build CustomerInfoCard (selected customer display)

**Files:**
- Create: `components/admin/phone-booking/customer-info-card.tsx`

- [ ] **Step 1: Create the component**

This component displays the selected customer's info card with stats, alert badges, and last visit. It receives the customer and their bookings history.

Create `components/admin/phone-booking/customer-info-card.tsx`:

```tsx
"use client"

import { Customer, Booking, ClientNote, StaffMember } from "@/lib/types"
import { useLanguage } from "@/lib/i18n/language-context"
import { useBookings } from "@/lib/data/bookings-store"
import { useNotes } from "@/lib/data/notes-store"
import { useShopData } from "@/lib/data/shop-data"
import { formatPrice } from "@/lib/utils/formatters"
import { X } from "lucide-react"

interface CustomerInfoCardProps {
  customer: Customer
  onClear: () => void
}

export function CustomerInfoCard({ customer, onClear }: CustomerInfoCardProps) {
  const { t } = useLanguage()
  const { bookings } = useBookings()
  const { getNotesForCustomer } = useNotes()
  const { staffMembers } = useShopData()

  // Get customer's bookings sorted by date desc
  const customerBookings = bookings
    .filter(b => b.customerId === customer.id && b.status === "completed")
    .sort((a, b) => b.date.localeCompare(a.date))

  const lastBooking = customerBookings[0]

  // Get notes for alert badges
  const allNotes = getNotesForCustomer(customer.id)
  const injuryNotes = allNotes.filter(n => n.category === "injury" || n.category === "warning" || n.category === "allergy" || n.category === "medical")

  // Resolve preferred therapist ID to display name
  const preferredTherapist = (() => {
    if (customer.preferredStaff.length === 0) return t("phoneBookingNone")
    const staffMember = staffMembers.find(s => s.id === customer.preferredStaff[0])
    return staffMember?.nickname || staffMember?.name || t("phoneBookingNone")
  })()

  const initials = customer.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="rounded-xl border border-brand-border bg-brand-bg-secondary overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-11 h-11 rounded-full bg-brand-primary flex items-center justify-center text-white text-base font-semibold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-brand-text-primary">{customer.name}</div>
          <div className="text-xs text-brand-text-secondary">
            {customer.membershipNumber} · {t("phoneBookingMemberSince")} {customer.memberSince}
          </div>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-red-500 hover:text-red-400 transition-colors flex items-center gap-1"
        >
          <X className="w-3 h-3" /> {t("phoneBookingClearCustomer")}
        </button>
      </div>

      {/* Quick stats */}
      <div className="flex border-t border-brand-border text-xs">
        <div className="flex-1 px-3 py-2.5 text-center border-r border-brand-border">
          <div className="text-brand-text-secondary">{t("phoneBookingVisits")}</div>
          <div className="font-semibold text-brand-text-primary">{customer.totalBookings}</div>
        </div>
        <div className="flex-1 px-3 py-2.5 text-center border-r border-brand-border">
          <div className="text-brand-text-secondary">{t("phoneBookingSpent")}</div>
          <div className="font-semibold text-brand-text-primary">{formatPrice(customer.totalSpent)}</div>
        </div>
        <div className="flex-1 px-3 py-2.5 text-center border-r border-brand-border">
          <div className="text-brand-text-secondary">{t("phoneBookingLoyalty")}</div>
          <div className="font-semibold text-brand-text-primary">{customer.loyaltyStamps} stamps</div>
        </div>
        <div className="flex-1 px-3 py-2.5 text-center">
          <div className="text-brand-text-secondary">{t("phoneBookingPreferred")}</div>
          <div className="font-semibold text-brand-text-primary truncate">{preferredTherapist}</div>
        </div>
      </div>

      {/* Alert badges */}
      {(injuryNotes.length > 0 || customer.massagePreferences) && (
        <div className="border-t border-brand-border px-4 py-2.5 flex gap-1.5 flex-wrap">
          {injuryNotes.map(note => (
            <span key={note.id} className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full text-xs">
              ⚠ {note.content.slice(0, 30)}{note.content.length > 30 ? "..." : ""}
            </span>
          ))}
          {customer.massagePreferences?.pressurePreference && (
            <span className="bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full text-xs">
              Pressure: {customer.massagePreferences.pressurePreference}
            </span>
          )}
          {customer.preferredServices.length > 0 && (
            <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full text-xs">
              Fav: {customer.preferredServices[0]}
            </span>
          )}
        </div>
      )}

      {/* Last visit */}
      {lastBooking && (
        <div className="border-t border-brand-border px-4 py-2.5 text-xs text-brand-text-secondary">
          {t("phoneBookingLastVisit")}: {lastBooking.date} — {lastBooking.serviceName} {lastBooking.duration}min with {lastBooking.staffName}
          {" · "}
          <button className="text-brand-primary hover:underline">
            {t("phoneBookingViewHistory")} →
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd "/Users/amaan/Documents/Apps - Pixeltec/massagePro/massage pro" && npx next build --no-lint 2>&1 | tail -5`

- [ ] **Step 3: Commit**

```bash
git add components/admin/phone-booking/customer-info-card.tsx
git commit -m "feat: add CustomerInfoCard component for phone booking"
```

---

## Chunk 3: Session Components — Therapist Timeline & Session Card

### Task 7: Build TherapistTimeline component

**Files:**
- Create: `components/admin/phone-booking/therapist-timeline.tsx`

This is the core visual component — a horizontal bar showing a therapist's day with booked/free blocks.

- [ ] **Step 1: Create the component**

Create `components/admin/phone-booking/therapist-timeline.tsx`:

```tsx
"use client"

import { useMemo } from "react"
import { StaffMember, Booking } from "@/lib/types"
import { useLanguage } from "@/lib/i18n/language-context"

interface TimeBlock {
  startMinutes: number  // Minutes from midnight
  endMinutes: number
  type: "free" | "booked" | "selected" | "too-short"
  label?: string
}

interface TherapistTimelineProps {
  staff: StaffMember
  date: string                    // YYYY-MM-DD
  existingBookings: Booking[]     // All bookings for this staff on this date
  tentativeBookings?: { startTime: string; duration: number }[]  // Bookings being built in current call
  requiredDuration: number        // Minutes needed for the service
  selectedTime?: string           // Currently selected time on this row
  onSelectTime: (staffId: string, time: string) => void
  operatingStart?: number         // Hour (default 10)
  operatingEnd?: number           // Hour (default 21)
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`
}

export function TherapistTimeline({
  staff,
  date,
  existingBookings,
  tentativeBookings = [],
  requiredDuration,
  selectedTime,
  onSelectTime,
  operatingStart = 10,
  operatingEnd = 21,
}: TherapistTimelineProps) {
  const { t } = useLanguage()

  // Determine if this staff works on this date and get their actual working hours
  const dayOfWeek = new Date(date).toLocaleDateString("en-US", { weekday: "short" }).toLowerCase().slice(0, 3) as
    "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"
  const availability = staff.availability[dayOfWeek]
  const isDayOff = !availability

  // Use staff's actual working hours instead of shop operating hours
  const effectiveStart = availability ? parseInt(availability.start.split(":")[0]) : operatingStart
  const effectiveEnd = availability ? parseInt(availability.end.split(":")[0]) : operatingEnd
  const totalMinutes = (effectiveEnd - effectiveStart) * 60

  // Compute booked blocks from existing + tentative bookings
  const bookedRanges = useMemo(() => {
    const ranges: { start: number; end: number }[] = []

    existingBookings
      .filter(b => b.staffId === staff.id && b.date === date && b.status !== "cancelled" && b.status !== "rejected")
      .forEach(b => {
        ranges.push({ start: timeToMinutes(b.startTime), end: timeToMinutes(b.endTime) })
      })

    tentativeBookings.forEach(tb => {
      const start = timeToMinutes(tb.startTime)
      ranges.push({ start, end: start + tb.duration })
    })

    return ranges.sort((a, b) => a.start - b.start)
  }, [existingBookings, tentativeBookings, staff.id, date])

  // Build time blocks for the timeline
  const blocks = useMemo(() => {
    if (isDayOff) return []

    const opStart = effectiveStart * 60
    const opEnd = effectiveEnd * 60
    const result: TimeBlock[] = []
    let cursor = opStart

    for (const range of bookedRanges) {
      if (range.start > cursor) {
        // Free gap before this booking
        const gapDuration = range.start - cursor
        result.push({
          startMinutes: cursor,
          endMinutes: range.start,
          type: gapDuration >= requiredDuration ? "free" : "too-short",
        })
      }
      result.push({
        startMinutes: Math.max(range.start, cursor),
        endMinutes: range.end,
        type: "booked",
        label: t("phoneBookingBooked"),
      })
      cursor = Math.max(cursor, range.end)
    }

    // Trailing free gap
    if (cursor < opEnd) {
      const gapDuration = opEnd - cursor
      result.push({
        startMinutes: cursor,
        endMinutes: opEnd,
        type: gapDuration >= requiredDuration ? "free" : "too-short",
      })
    }

    return result
  }, [bookedRanges, isDayOff, effectiveStart, effectiveEnd, requiredDuration, t])

  // Count free slots (30-min increments that fit the required duration)
  const freeSlotCount = useMemo(() => {
    return blocks
      .filter(b => b.type === "free")
      .reduce((count, block) => {
        const slots = Math.floor((block.endMinutes - block.startMinutes) / 30)
        return count + slots
      }, 0)
  }, [blocks])

  const initials = staff.nickname?.[0] || staff.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
  const isSelected = !!selectedTime

  return (
    <div className={`flex items-center rounded-lg p-1.5 ${
      isDayOff ? "opacity-40" : ""
    } ${isSelected ? "border-2 border-brand-primary" : "border border-brand-border"} bg-brand-bg-primary`}>
      {/* Staff name column */}
      <div className="w-24 flex items-center gap-2 shrink-0">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs text-white font-medium ${
          isDayOff ? "bg-gray-500" : freeSlotCount > 0 ? "bg-green-600" : "bg-gray-500"
        }`}>
          {initials}
        </div>
        <div>
          <div className="text-xs font-medium text-brand-text-primary truncate">{staff.nickname || staff.name.split(" ")[0]}</div>
          <div className={`text-[10px] ${isDayOff ? "text-red-500" : freeSlotCount > 0 ? "text-green-500" : "text-red-500"}`}>
            {isDayOff ? t("phoneBookingDayOff") : `${freeSlotCount} ${t("phoneBookingFreeSlots")}`}
          </div>
        </div>
      </div>

      {/* Timeline bar */}
      <div className="flex-1 h-7 relative bg-brand-bg-secondary rounded overflow-hidden">
        {isDayOff ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-brand-text-secondary"
            style={{ background: "repeating-linear-gradient(45deg, transparent, transparent 4px, var(--brand-border) 4px, var(--brand-border) 8px)" }}>
            {t("phoneBookingDayOff")}
          </div>
        ) : (
          blocks.map((block, i) => {
            const left = ((block.startMinutes - effectiveStart * 60) / totalMinutes) * 100
            const width = ((block.endMinutes - block.startMinutes) / totalMinutes) * 100

            if (block.type === "booked") {
              return (
                <div
                  key={i}
                  className="absolute top-0 h-full bg-red-500/15 border border-red-500/30 rounded-sm flex items-center justify-center text-[9px] text-red-500"
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  {width > 8 ? t("phoneBookingBooked") : ""}
                </div>
              )
            }

            if (block.type === "too-short") {
              return (
                <div
                  key={i}
                  className="absolute top-0 h-full bg-yellow-500/10 border border-yellow-500/20 rounded-sm flex items-center justify-center text-[9px] text-yellow-500/60"
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  {width > 8 ? t("phoneBookingTooShort") : ""}
                </div>
              )
            }

            // Free block — render clickable 30-min slots
            const slotCount = Math.floor((block.endMinutes - block.startMinutes) / 30)
            const slotWidth = width / slotCount

            return Array.from({ length: slotCount }, (_, j) => {
              const slotStart = block.startMinutes + j * 30
              const slotTime = minutesToTime(slotStart)
              const isThisSelected = selectedTime === slotTime

              return (
                <button
                  key={`${i}-${j}`}
                  onClick={() => onSelectTime(staff.id, slotTime)}
                  className={`absolute top-0 h-full rounded-sm flex items-center justify-center text-[9px] transition-colors ${
                    isThisSelected
                      ? "bg-brand-primary/30 border-2 border-brand-primary text-brand-primary font-bold"
                      : "bg-green-500/10 border border-dashed border-green-500/30 text-green-500 hover:bg-green-500/20"
                  }`}
                  style={{ left: `${left + j * slotWidth}%`, width: `${slotWidth}%` }}
                >
                  {isThisSelected ? slotTime : (slotWidth > 6 ? "●" : "")}
                </button>
              )
            })
          })
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd "/Users/amaan/Documents/Apps - Pixeltec/massagePro/massage pro" && npx next build --no-lint 2>&1 | tail -5`

- [ ] **Step 3: Commit**

```bash
git add components/admin/phone-booking/therapist-timeline.tsx
git commit -m "feat: add TherapistTimeline component for phone booking"
```

---

### Task 8: Build GuestRow component

**Files:**
- Create: `components/admin/phone-booking/guest-row.tsx`

- [ ] **Step 1: Create the component**

Create `components/admin/phone-booking/guest-row.tsx`:

```tsx
"use client"

import { X } from "lucide-react"
import { ServiceOption, StaffMember } from "@/lib/types"
import { useLanguage } from "@/lib/i18n/language-context"

export interface GuestData {
  id: string
  name: string
  serviceId: string
  serviceName: string
  serviceType: string
  duration: number
  price: number
  staffId: string
  staffName: string
}

interface GuestRowProps {
  guest: GuestData
  index: number
  services: ServiceOption[]
  staff: StaffMember[]
  onUpdate: (id: string, updates: Partial<GuestData>) => void
  onRemove: (id: string) => void
}

export function GuestRow({ guest, index, services, staff, onUpdate, onRemove }: GuestRowProps) {
  const { t } = useLanguage()

  const activeServices = services.filter(s => s.isActive)
  const selectedService = activeServices.find(s => s.id === guest.serviceId)

  return (
    <div className="flex gap-2 flex-wrap p-2 bg-brand-bg-primary rounded-md">
      <div className="w-full flex items-center gap-2 mb-1">
        <span className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-[9px] text-white">
          G{index + 1}
        </span>
        <strong className="text-xs text-brand-text-primary">{t("phoneBookingGuest")} {index + 1}</strong>
        <input
          type="text"
          value={guest.name === `Guest ${index + 1}` ? "" : guest.name}
          onChange={(e) => onUpdate(guest.id, { name: e.target.value || `Guest ${index + 1}` })}
          placeholder={t("phoneBookingGuestName")}
          className="bg-brand-bg-secondary border border-brand-border rounded px-2 py-0.5 text-xs text-brand-text-primary w-28"
        />
        <button
          onClick={() => onRemove(guest.id)}
          className="ml-auto text-red-500 hover:text-red-400"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <select
          value={guest.serviceId}
          onChange={(e) => {
            const svc = activeServices.find(s => s.id === e.target.value)
            if (svc) {
              onUpdate(guest.id, {
                serviceId: svc.id,
                serviceName: svc.name,
                serviceType: svc.type,
                duration: svc.durations[0].minutes,
                price: svc.durations[0].price,
              })
            }
          }}
          className="bg-brand-bg-secondary border border-brand-border rounded px-2 py-1 text-xs text-brand-text-primary"
        >
          <option value="">{t("phoneBookingService")}</option>
          {activeServices.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        {selectedService && (
          <select
            value={guest.duration}
            onChange={(e) => {
              const dur = selectedService.durations.find(d => d.minutes === Number(e.target.value))
              if (dur) onUpdate(guest.id, { duration: dur.minutes, price: dur.price })
            }}
            className="bg-brand-bg-secondary border border-brand-border rounded px-2 py-1 text-xs text-brand-text-primary"
          >
            {selectedService.durations.map(d => (
              <option key={d.minutes} value={d.minutes}>{d.minutes}min</option>
            ))}
          </select>
        )}

        <select
          value={guest.staffId}
          onChange={(e) => {
            const s = staff.find(s => s.id === e.target.value)
            if (s) onUpdate(guest.id, { staffId: s.id, staffName: s.nickname || s.name })
          }}
          className="bg-brand-bg-secondary border border-brand-border rounded px-2 py-1 text-xs text-brand-text-primary"
        >
          <option value="">{t("phoneBookingAnyAvailable")}</option>
          {staff.map(s => (
            <option key={s.id} value={s.id}>{s.nickname || s.name}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd "/Users/amaan/Documents/Apps - Pixeltec/massagePro/massage pro" && npx next build --no-lint 2>&1 | tail -5`

- [ ] **Step 3: Commit**

```bash
git add components/admin/phone-booking/guest-row.tsx
git commit -m "feat: add GuestRow component for group bookings in phone booking"
```

---

### Task 9: Build SessionCard component

**Files:**
- Create: `components/admin/phone-booking/session-card.tsx`

This is the main session card that combines service/duration/date selectors, the therapist timeline, add-ons, and group guest rows.

- [ ] **Step 1: Create the component**

Create `components/admin/phone-booking/session-card.tsx`. This is a larger component — key sections:

1. **Header** — session number, group badge, edit/remove buttons
2. **Service/Duration/Date row** — three dropdowns
3. **Therapist timeline section** — appears when service+duration+date are set; shows `TherapistTimeline` for each qualifying therapist, sorted by availability
4. **Add-ons toggle** — expandable list of applicable add-ons with checkboxes
5. **Group guests** — list of `GuestRow` components + "Add Guest" button

```tsx
"use client"

import { useState, useMemo } from "react"
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react"
import { ServiceOption, StaffMember, Booking, ServiceAddOn } from "@/lib/types"
import { useLanguage } from "@/lib/i18n/language-context"
import { formatPrice } from "@/lib/utils/formatters"
import { TherapistTimeline } from "./therapist-timeline"
import { GuestRow, GuestData } from "./guest-row"

export interface SessionData {
  id: string
  serviceId: string
  serviceName: string
  serviceType: string
  duration: number
  price: number
  date: string
  staffId: string
  staffName: string
  time: string
  addOnIds: string[]
  guests: GuestData[]
  isCollapsed: boolean
}

interface SessionCardProps {
  session: SessionData
  sessionIndex: number
  services: ServiceOption[]
  addOns: ServiceAddOn[]
  staff: StaffMember[]
  allBookings: Booking[]
  tentativeBookingsForDate: { startTime: string; duration: number; staffId: string }[]
  onUpdate: (id: string, updates: Partial<SessionData>) => void
  onRemove: (id: string) => void
}

function genGuestId(): string {
  return `g-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`
}

export function SessionCard({
  session,
  sessionIndex,
  services,
  addOns,
  staff,
  allBookings,
  tentativeBookingsForDate,
  onUpdate,
  onRemove,
}: SessionCardProps) {
  const { t } = useLanguage()
  const [showAddOns, setShowAddOns] = useState(false)

  const activeServices = services.filter(s => s.isActive)
  const selectedService = activeServices.find(s => s.id === session.serviceId)
  const durations = selectedService?.durations || []

  // Filter staff who offer the selected service type
  const qualifiedStaff = useMemo(() => {
    if (!selectedService) return []
    return staff.filter(s => s.specialties.includes(selectedService.type))
  }, [staff, selectedService])

  // Sort by availability (most free slots first, day-off last)
  const sortedStaff = useMemo(() => {
    if (!session.date) return qualifiedStaff
    return [...qualifiedStaff].sort((a, b) => {
      const dayKey = new Date(session.date).toLocaleDateString("en-US", { weekday: "short" }).toLowerCase().slice(0, 3) as any
      const aOff = !a.availability[dayKey]
      const bOff = !b.availability[dayKey]
      if (aOff && !bOff) return 1
      if (!aOff && bOff) return -1
      return 0
    })
  }, [qualifiedStaff, session.date])

  // Applicable add-ons for selected service
  const applicableAddOns = useMemo(() => {
    if (!selectedService) return []
    return addOns.filter(a => a.isActive && (a.applicableServices === "all" || a.applicableServices.includes(selectedService.type)))
  }, [addOns, selectedService])

  const isComplete = session.serviceId && session.date && session.staffId && session.time
  const groupSize = 1 + session.guests.length

  // Calculate add-on prices
  const addOnTotal = session.addOnIds.reduce((sum, id) => {
    const addon = addOns.find(a => a.id === id)
    return sum + (addon?.price || 0)
  }, 0)
  const sessionTotal = session.price + addOnTotal + session.guests.reduce((s, g) => s + g.price, 0)

  // Collapsed view
  if (session.isCollapsed && isComplete) {
    return (
      <div className="rounded-lg border border-green-600 bg-brand-bg-secondary p-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-[10px] text-white">✓</span>
            <span className="text-sm font-semibold text-brand-text-primary">{t("phoneBookingSession")} {sessionIndex + 1}</span>
            {groupSize > 1 && (
              <span className="bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-full text-[10px]">
                {t("phoneBookingGroup")} × {groupSize}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => onUpdate(session.id, { isCollapsed: false })} className="text-xs text-brand-primary">{t("phoneBookingEditSession")}</button>
            <button onClick={() => onRemove(session.id)} className="text-xs text-red-500">{t("phoneBookingRemoveSession")}</button>
          </div>
        </div>
        <div className="flex gap-4 flex-wrap text-xs text-brand-text-secondary">
          <span>🧖 {session.serviceName} · {session.duration}min</span>
          <span>👤 {session.staffName}</span>
          <span>📅 {session.date} · {session.time}</span>
          <span className="text-green-500">{formatPrice(sessionTotal)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border ${isComplete ? "border-green-600" : "border-brand-primary"} bg-brand-bg-secondary p-3`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center text-[10px] text-white font-bold">
            {sessionIndex + 1}
          </span>
          <span className="text-sm font-semibold text-brand-text-primary">{t("phoneBookingSession")} {sessionIndex + 1}</span>
          {groupSize > 1 && (
            <span className="bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-full text-[10px]">
              {t("phoneBookingGroup")} × {groupSize}
            </span>
          )}
        </div>
        <button onClick={() => onRemove(session.id)} className="text-xs text-red-500">{t("phoneBookingRemoveSession")}</button>
      </div>

      {/* Service / Duration / Date row */}
      <div className="flex gap-2 flex-wrap mb-3">
        <div className="flex-1 min-w-[140px]">
          <label className="text-[11px] text-brand-text-secondary uppercase mb-1 block">{t("phoneBookingService")}</label>
          <select
            value={session.serviceId}
            onChange={(e) => {
              const svc = activeServices.find(s => s.id === e.target.value)
              if (svc) {
                onUpdate(session.id, {
                  serviceId: svc.id,
                  serviceName: svc.name,
                  serviceType: svc.type,
                  duration: svc.durations[0].minutes,
                  price: svc.durations[0].price,
                  staffId: "",
                  staffName: "",
                  time: "",
                  addOnIds: [],
                })
              }
            }}
            className="w-full px-2 py-2 rounded-md border border-brand-border bg-brand-bg-primary text-brand-text-primary text-sm"
          >
            <option value="">{t("phoneBookingService")}...</option>
            {activeServices.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {selectedService && (
          <div className="flex-1 min-w-[100px]">
            <label className="text-[11px] text-brand-text-secondary uppercase mb-1 block">{t("phoneBookingDuration")}</label>
            <select
              value={session.duration}
              onChange={(e) => {
                const dur = durations.find(d => d.minutes === Number(e.target.value))
                if (dur) onUpdate(session.id, { duration: dur.minutes, price: dur.price, staffId: "", staffName: "", time: "" })
              }}
              className="w-full px-2 py-2 rounded-md border border-brand-border bg-brand-bg-primary text-brand-text-primary text-sm"
            >
              {durations.map(d => (
                <option key={d.minutes} value={d.minutes}>{d.minutes} {t("min")}</option>
              ))}
            </select>
          </div>
        )}

        {selectedService && (
          <div className="flex-1 min-w-[120px]">
            <label className="text-[11px] text-brand-text-secondary uppercase mb-1 block">{t("phoneBookingDate")}</label>
            <input
              type="date"
              value={session.date}
              onChange={(e) => onUpdate(session.id, { date: e.target.value, staffId: "", staffName: "", time: "" })}
              className="w-full px-2 py-2 rounded-md border border-brand-border bg-brand-bg-primary text-brand-text-primary text-sm"
            />
          </div>
        )}
      </div>

      {/* Therapist timeline section */}
      {selectedService && session.duration && session.date && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-brand-text-primary">{t("phoneBookingSelectTherapistTime")}</div>
          </div>

          {/* Time axis */}
          <div className="flex ml-24 mb-1">
            {Array.from({ length: 11 }, (_, i) => (
              <div key={i} className="flex-1 text-[10px] text-brand-text-secondary">{10 + i}</div>
            ))}
          </div>

          {/* "Any Available" option */}
          <div className={`flex items-center gap-2 rounded-lg p-1.5 mb-1.5 transition-colors ${
            session.staffId === "any"
              ? "border-2 border-brand-primary bg-brand-primary/5"
              : "border border-brand-border bg-brand-bg-primary hover:bg-brand-bg-secondary"
          }`}>
            <button
              onClick={() => onUpdate(session.id, { staffId: "any", staffName: t("phoneBookingAnyAvailable"), time: "" })}
              className="w-24 flex items-center gap-2 shrink-0"
            >
              <div className="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center text-xs text-white font-medium">?</div>
              <div className="text-xs font-medium text-brand-text-primary">{t("phoneBookingAnyAvailable")}</div>
            </button>
            {session.staffId === "any" && (
              <select
                value={session.time}
                onChange={(e) => onUpdate(session.id, { time: e.target.value })}
                className="ml-2 px-2 py-1 rounded border border-brand-border bg-brand-bg-primary text-brand-text-primary text-xs"
              >
                <option value="">Select time...</option>
                {Array.from({ length: 22 }, (_, i) => {
                  const hour = 10 + Math.floor(i / 2)
                  const min = i % 2 === 0 ? "00" : "30"
                  if (hour >= 21) return null
                  return <option key={i} value={`${hour.toString().padStart(2, "0")}:${min}`}>{hour}:{min}</option>
                }).filter(Boolean)}
              </select>
            )}
            <div className="text-xs text-brand-text-secondary">Auto-assigns the most available therapist</div>
          </div>

          <div className="space-y-1.5">
            {sortedStaff.map(s => (
              <TherapistTimeline
                key={s.id}
                staff={s}
                date={session.date}
                existingBookings={allBookings}
                tentativeBookings={tentativeBookingsForDate.filter(tb => tb.staffId === s.id).map(tb => ({ startTime: tb.startTime, duration: tb.duration }))}
                requiredDuration={session.duration}
                selectedTime={session.staffId === s.id ? session.time : undefined}
                onSelectTime={(staffId, time) => {
                  const selectedStaff = staff.find(st => st.id === staffId)
                  onUpdate(session.id, {
                    staffId,
                    staffName: selectedStaff?.nickname || selectedStaff?.name || "",
                    time,
                  })
                }}
              />
            ))}
          </div>

          {session.staffId && session.time && (
            <div className="mt-2 rounded-lg border border-brand-border bg-brand-bg-primary px-3 py-2 flex items-center justify-between text-xs">
              <span className="text-brand-text-primary">
                <strong>{t("phoneBookingSelected")}:</strong> {session.staffName} · {session.time}–{
                  (() => {
                    const [h, m] = session.time.split(":").map(Number)
                    const end = h * 60 + m + session.duration
                    return `${Math.floor(end / 60).toString().padStart(2, "0")}:${(end % 60).toString().padStart(2, "0")}`
                  })()
                } · {session.date}
              </span>
              <span className="text-green-500">✓ {t("phoneBookingConfirmedSlot")}</span>
            </div>
          )}
        </div>
      )}

      {/* Bottom actions row */}
      <div className="flex gap-2 flex-wrap mt-2">
        {selectedService && applicableAddOns.length > 0 && (
          <button
            onClick={() => setShowAddOns(!showAddOns)}
            className="text-xs text-brand-text-secondary bg-brand-bg-primary border border-brand-border rounded px-2 py-1 hover:text-brand-text-primary transition-colors flex items-center gap-1"
          >
            {t("phoneBookingAddOns")} {showAddOns ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}

        <button
          onClick={() => {
            const newGuest: GuestData = {
              id: genGuestId(),
              name: `Guest ${session.guests.length + 1}`,
              serviceId: session.serviceId,
              serviceName: session.serviceName,
              serviceType: session.serviceType,
              duration: session.duration,
              price: session.price,
              staffId: "",
              staffName: "",
            }
            onUpdate(session.id, { guests: [...session.guests, newGuest] })
          }}
          className="text-xs text-brand-text-secondary bg-brand-bg-primary border border-brand-border rounded px-2 py-1 hover:text-brand-text-primary transition-colors"
        >
          {t("phoneBookingAddGuest")}
        </button>

        {isComplete && (
          <button
            onClick={() => onUpdate(session.id, { isCollapsed: true })}
            className="ml-auto text-xs text-green-500 hover:text-green-400 transition-colors"
          >
            ✓ Done
          </button>
        )}
      </div>

      {/* Add-ons panel */}
      {showAddOns && (
        <div className="mt-2 p-2 rounded-md border border-brand-border bg-brand-bg-primary">
          {applicableAddOns.map(addon => (
            <label key={addon.id} className="flex items-center gap-2 py-1 cursor-pointer">
              <input
                type="checkbox"
                checked={session.addOnIds.includes(addon.id)}
                onChange={(e) => {
                  const newIds = e.target.checked
                    ? [...session.addOnIds, addon.id]
                    : session.addOnIds.filter(id => id !== addon.id)
                  onUpdate(session.id, { addOnIds: newIds })
                }}
                className="rounded"
              />
              <span className="text-xs text-brand-text-primary flex-1">{addon.name}</span>
              <span className="text-xs text-brand-text-secondary">+{formatPrice(addon.price)} · +{addon.extraMinutes}min</span>
            </label>
          ))}
        </div>
      )}

      {/* Group guests */}
      {session.guests.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {session.guests.map((guest, i) => (
            <GuestRow
              key={guest.id}
              guest={guest}
              index={i}
              services={services}
              staff={qualifiedStaff}
              onUpdate={(guestId, updates) => {
                const newGuests = session.guests.map(g => g.id === guestId ? { ...g, ...updates } : g)
                onUpdate(session.id, { guests: newGuests })
              }}
              onRemove={(guestId) => {
                onUpdate(session.id, { guests: session.guests.filter(g => g.id !== guestId) })
              }}
            />
          ))}
          <button
            onClick={() => {
              const newGuest: GuestData = {
                id: genGuestId(),
                name: `Guest ${session.guests.length + 1}`,
                serviceId: session.serviceId,
                serviceName: session.serviceName,
                serviceType: session.serviceType,
                duration: session.duration,
                price: session.price,
                staffId: "",
                staffName: "",
              }
              onUpdate(session.id, { guests: [...session.guests, newGuest] })
            }}
            className="text-xs text-purple-500 hover:text-purple-400 px-2 py-1"
          >
            {t("phoneBookingAddAnotherGuest")}
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd "/Users/amaan/Documents/Apps - Pixeltec/massagePro/massage pro" && npx next build --no-lint 2>&1 | tail -5`

- [ ] **Step 3: Commit**

```bash
git add components/admin/phone-booking/session-card.tsx
git commit -m "feat: add SessionCard component with therapist timeline and group guests"
```

---

## Chunk 4: Summary, Success Screen & Main Page

### Task 10: Build BookingSummary component

**Files:**
- Create: `components/admin/phone-booking/booking-summary.tsx`

- [ ] **Step 1: Create the component**

Create `components/admin/phone-booking/booking-summary.tsx`:

```tsx
"use client"

import { useLanguage } from "@/lib/i18n/language-context"
import { formatPrice } from "@/lib/utils/formatters"
import { ServiceAddOn } from "@/lib/types"
import { SessionData } from "./session-card"

interface BookingSummaryProps {
  sessions: SessionData[]
  addOns: ServiceAddOn[]
  callNotes: string
  onCallNotesChange: (notes: string) => void
  onOpenNotesPanel: () => void
  onConfirm: () => void
  isConfirming: boolean
}

export function BookingSummary({
  sessions,
  addOns,
  callNotes,
  onCallNotesChange,
  onOpenNotesPanel,
  onConfirm,
  isConfirming,
}: BookingSummaryProps) {
  const { t } = useLanguage()

  // Calculate totals
  const sessionTotals = sessions.map(session => {
    const addOnTotal = session.addOnIds.reduce((sum, id) => {
      const addon = addOns.find(a => a.id === id)
      return sum + (addon?.price || 0)
    }, 0)
    const guestsTotal = session.guests.reduce((sum, g) => sum + g.price, 0)
    return session.price + addOnTotal + guestsTotal
  })
  const grandTotal = sessionTotals.reduce((sum, t) => sum + t, 0)
  const totalBookingCount = sessions.reduce((count, s) => count + 1 + s.guests.length, 0)

  const allComplete = sessions.every(s => s.serviceId && s.date && s.staffId && s.time)

  return (
    <div>
      {/* Call notes */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-brand-text-secondary uppercase">{t("phoneBookingCallNotes")}</label>
          <button onClick={onOpenNotesPanel} className="text-xs text-brand-primary hover:underline">
            📋 {t("phoneBookingOpenFullNotes")}
          </button>
        </div>
        <textarea
          value={callNotes}
          onChange={(e) => onCallNotesChange(e.target.value)}
          placeholder={t("phoneBookingCallNotes") + "..."}
          className="w-full px-3 py-2.5 rounded-lg border border-brand-border bg-brand-bg-secondary text-brand-text-primary text-sm min-h-[60px] resize-y focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        <div className="text-[11px] text-brand-text-secondary mt-1">{t("phoneBookingCallNotesHint")}</div>
      </div>

      {/* Summary card */}
      <div className="rounded-xl border border-brand-border bg-brand-bg-secondary overflow-hidden">
        <div className="px-4 py-3 border-b border-brand-border">
          <div className="text-sm font-semibold text-brand-text-primary">{t("phoneBookingSummary")}</div>
        </div>

        {sessions.map((session, i) => (
          <div key={session.id} className="px-4 py-2.5 border-b border-brand-border">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-brand-text-primary">
                  {t("phoneBookingSession")} {i + 1} · {session.date} · {session.time}
                  {session.guests.length > 0 && (
                    <span className="bg-purple-500/15 text-purple-400 px-1.5 py-0.5 rounded-full text-[10px] ml-2">
                      {t("phoneBookingGroup")} × {1 + session.guests.length}
                    </span>
                  )}
                </div>
                <div className="text-xs text-brand-text-secondary mt-1">
                  {session.staffName ? `${session.staffName}` : ""} — {session.serviceName} {session.duration}min
                  {session.guests.map((g, j) => (
                    <span key={g.id}><br />{g.name} — {g.serviceName} {g.duration}min</span>
                  ))}
                </div>
              </div>
              <div className="text-sm font-semibold text-brand-text-primary whitespace-nowrap">
                {formatPrice(sessionTotals[i])}
              </div>
            </div>
          </div>
        ))}

        {/* Total + confirm */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-brand-text-primary">{t("phoneBookingTotal")}: {formatPrice(grandTotal)}</div>
            <div className="text-xs text-brand-text-secondary">
              {sessions.length} {sessions.length === 1 ? "session" : "sessions"} · {totalBookingCount} {totalBookingCount === 1 ? "booking" : "bookings"} · {t("phoneBookingPayAtArrival")}
            </div>
          </div>
          <button
            onClick={onConfirm}
            disabled={!allComplete || isConfirming}
            className="px-8 py-3 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("phoneBookingConfirmAll")}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd "/Users/amaan/Documents/Apps - Pixeltec/massagePro/massage pro" && npx next build --no-lint 2>&1 | tail -5`

- [ ] **Step 3: Commit**

```bash
git add components/admin/phone-booking/booking-summary.tsx
git commit -m "feat: add BookingSummary component for phone booking"
```

---

### Task 11: Build SuccessScreen component

**Files:**
- Create: `components/admin/phone-booking/success-screen.tsx`

- [ ] **Step 1: Create the component**

Create `components/admin/phone-booking/success-screen.tsx`:

```tsx
"use client"

import { useRouter } from "next/navigation"
import { Calendar, User } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

interface SuccessScreenProps {
  bookingCount: number
  customerName: string
  guestCount: number
  firstDate: string
  onNewBooking: () => void
}

export function SuccessScreen({ bookingCount, customerName, guestCount, firstDate, onNewBooking }: SuccessScreenProps) {
  const { t } = useLanguage()
  const router = useRouter()

  return (
    <div className="py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4 text-3xl text-white">
        ✓
      </div>
      <div className="text-xl font-semibold text-brand-text-primary mb-1">
        {bookingCount} {t("phoneBookingBookingsConfirmed")}
      </div>
      <div className="text-sm text-brand-text-secondary mb-6">
        {t("phoneBookingFor")} {customerName}
        {guestCount > 0 && ` + ${guestCount} ${t("phoneBookingPlusGuests")}`}
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={() => router.push(`/admin/calendar?date=${firstDate}`)}
          className="px-4 py-2 rounded-lg border border-brand-border bg-brand-bg-secondary text-brand-primary text-sm flex items-center gap-2 hover:bg-brand-bg-primary transition-colors"
        >
          <Calendar className="w-4 h-4" /> {t("phoneBookingViewCalendar")}
        </button>
        <button
          onClick={() => router.push("/admin/customers")}
          className="px-4 py-2 rounded-lg border border-brand-border bg-brand-bg-secondary text-brand-primary text-sm flex items-center gap-2 hover:bg-brand-bg-primary transition-colors"
        >
          <User className="w-4 h-4" /> {t("phoneBookingViewCustomer")}
        </button>
        <button
          onClick={onNewBooking}
          className="px-6 py-2 rounded-lg bg-brand-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          📞 {t("phoneBookingNewBooking")}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd "/Users/amaan/Documents/Apps - Pixeltec/massagePro/massage pro" && npx next build --no-lint 2>&1 | tail -5`

- [ ] **Step 3: Commit**

```bash
git add components/admin/phone-booking/success-screen.tsx
git commit -m "feat: add SuccessScreen component for phone booking"
```

---

### Task 12: Build the main PhoneBookingPage and usePhoneBooking hook

**Files:**
- Create: `hooks/use-phone-booking.ts`
- Modify: `app/admin/phone-booking/page.tsx`

- [ ] **Step 1: Create the usePhoneBooking hook**

Create `hooks/use-phone-booking.ts`. This hook manages all page-level state:

```tsx
"use client"

import { useState, useCallback } from "react"
import { Customer, Booking } from "@/lib/types"
import { useBookings } from "@/lib/data/bookings-store"
import { useServices } from "@/lib/data/services-store"
import { useShopData } from "@/lib/data/shop-data"
import { SessionData } from "@/components/admin/phone-booking/session-card"

function genSessionId(): string {
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`
}

function createEmptySession(): SessionData {
  return {
    id: genSessionId(),
    serviceId: "",
    serviceName: "",
    serviceType: "",
    duration: 0,
    price: 0,
    date: new Date().toISOString().split("T")[0],
    staffId: "",
    staffName: "",
    time: "",
    addOnIds: [],
    guests: [],
    isCollapsed: false,
  }
}

export function usePhoneBooking() {
  const { createBooking, bookings: allBookings } = useBookings()
  const { services, addOns } = useServices()
  const { staffMembers } = useShopData()

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [sessions, setSessions] = useState<SessionData[]>([createEmptySession()])
  const [callNotes, setCallNotes] = useState("")
  const [isConfirming, setIsConfirming] = useState(false)
  const [successData, setSuccessData] = useState<{
    bookingCount: number
    customerName: string
    guestCount: number
    firstDate: string
  } | null>(null)

  const updateSession = useCallback((id: string, updates: Partial<SessionData>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }, [])

  const removeSession = useCallback((id: string) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id)
      return next.length === 0 ? [createEmptySession()] : next
    })
  }, [])

  const addSession = useCallback(() => {
    setSessions(prev => [...prev, createEmptySession()])
  }, [])

  // Compute tentative bookings (from sessions being built) for timeline conflict display
  const getTentativeBookingsForDate = useCallback((date: string, excludeSessionId: string) => {
    return sessions
      .filter(s => s.date === date && s.id !== excludeSessionId && s.staffId && s.time)
      .flatMap(s => {
        const bookings = [{ startTime: s.time, duration: s.duration, staffId: s.staffId }]
        // Also include guest bookings if they have a staff assigned
        s.guests.forEach(g => {
          if (g.staffId) {
            bookings.push({ startTime: s.time, duration: g.duration, staffId: g.staffId })
          }
        })
        return bookings
      })
  }, [sessions])

  const confirmAllBookings = useCallback(() => {
    if (!selectedCustomer) return

    setIsConfirming(true)
    let totalBookings = 0
    let totalGuests = 0
    const firstDate = sessions[0]?.date || ""

    for (const session of sessions) {
      // Resolve "Any Available" to the most available therapist
      let resolvedStaffId = session.staffId
      let resolvedStaffName = session.staffName
      if (session.staffId === "any") {
        // Find therapist with most free slots on this date who offers the selected service
        const dayKey = new Date(session.date).toLocaleDateString("en-US", { weekday: "short" }).toLowerCase().slice(0, 3) as any
        const candidates = (services.find(s => s.id === session.serviceId)?.type
          ? staffMembers.filter(s => s.specialties.includes(services.find(sv => sv.id === session.serviceId)!.type) && s.availability[dayKey])
          : staffMembers.filter(s => s.availability[dayKey])
        )
        // Pick the one with fewest existing bookings on that date
        const staffBookingCounts = candidates.map(s => ({
          staff: s,
          count: allBookings.filter(b => b.staffId === s.id && b.date === session.date && b.status !== "cancelled").length,
        }))
        staffBookingCounts.sort((a, b) => a.count - b.count)
        const best = staffBookingCounts[0]?.staff
        if (best) {
          resolvedStaffId = best.id
          resolvedStaffName = best.nickname || best.name
        }
      }

      const addOnData = session.addOnIds.map(id => {
        const addon = addOns.find(a => a.id === id)
        return addon ? { addOnId: addon.id, name: addon.name, price: addon.price, extraMinutes: addon.extraMinutes } : null
      }).filter(Boolean) as { addOnId: string; name: string; price: number; extraMinutes: number }[]

      const extraMinutes = addOnData.reduce((sum, a) => sum + a.extraMinutes, 0)
      const [h, m] = session.time.split(":").map(Number)
      const endMinutes = h * 60 + m + session.duration + extraMinutes
      const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`

      const guests = session.guests.map(g => ({
        id: g.id,
        name: g.name,
        serviceId: g.serviceId,
        serviceName: g.serviceName,
        serviceType: g.serviceType as any,
        staffId: g.staffId,
        staffName: g.staffName,
        staffAvatar: "",
        duration: g.duration,
        price: g.price,
      }))

      createBooking({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        staffId: resolvedStaffId,
        staffName: resolvedStaffName,
        staffAvatar: "",
        serviceId: session.serviceId,
        serviceName: session.serviceName,
        serviceType: session.serviceType as any,
        date: session.date,
        startTime: session.time,
        endTime,
        duration: session.duration,
        price: session.price,
        status: "confirmed",
        notes: callNotes || undefined,
        source: "phone",
        addOns: addOnData.length > 0 ? addOnData : undefined,
        guests: guests.length > 0 ? guests : undefined,
        groupSize: guests.length > 0 ? 1 + guests.length : undefined,
      })

      totalBookings += 1 + session.guests.length
      totalGuests += session.guests.length
    }

    setSuccessData({
      bookingCount: totalBookings,
      customerName: selectedCustomer.name,
      guestCount: totalGuests,
      firstDate,
    })
    setIsConfirming(false)
  }, [selectedCustomer, sessions, callNotes, addOns, services, staffMembers, allBookings, createBooking])

  const resetForm = useCallback(() => {
    setSelectedCustomer(null)
    setShowNewCustomer(false)
    setSessions([createEmptySession()])
    setCallNotes("")
    setSuccessData(null)
  }, [])

  return {
    // Customer
    selectedCustomer,
    setSelectedCustomer,
    showNewCustomer,
    setShowNewCustomer,
    // Sessions
    sessions,
    updateSession,
    removeSession,
    addSession,
    getTentativeBookingsForDate,
    // Notes & confirm
    callNotes,
    setCallNotes,
    isConfirming,
    confirmAllBookings,
    // Success
    successData,
    resetForm,
    // Data
    services,
    addOns,
    allBookings,
  }
}
```

- [ ] **Step 2: Build the main page component**

Replace `app/admin/phone-booking/page.tsx` with the full page that wires all components together:

```tsx
"use client"

import { useState } from "react"
import { Phone } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"
import { usePhoneBooking } from "@/hooks/use-phone-booking"
import { useShopData } from "@/lib/data/shop-data"
import { CustomerSearch } from "@/components/admin/phone-booking/customer-search"
import { CustomerQuickCreate } from "@/components/admin/phone-booking/customer-quick-create"
import { CustomerInfoCard } from "@/components/admin/phone-booking/customer-info-card"
import { SessionCard } from "@/components/admin/phone-booking/session-card"
import { BookingSummary } from "@/components/admin/phone-booking/booking-summary"
import { SuccessScreen } from "@/components/admin/phone-booking/success-screen"
import { ClientNotesPanel } from "@/components/admin/client-notes-panel"

export default function PhoneBookingPage() {
  const { t } = useLanguage()
  const { staffMembers } = useShopData()
  const [notesPanelOpen, setNotesPanelOpen] = useState(false)

  const {
    selectedCustomer, setSelectedCustomer,
    showNewCustomer, setShowNewCustomer,
    sessions, updateSession, removeSession, addSession,
    getTentativeBookingsForDate,
    callNotes, setCallNotes,
    isConfirming, confirmAllBookings,
    successData, resetForm,
    services, addOns, allBookings,
  } = usePhoneBooking()

  // Success screen
  if (successData) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <SuccessScreen
          bookingCount={successData.bookingCount}
          customerName={successData.customerName}
          guestCount={successData.guestCount}
          firstDate={successData.firstDate}
          onNewBooking={resetForm}
        />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <Phone className="w-6 h-6 text-brand-primary" />
        <h1 className="text-xl font-bold text-brand-text-primary">{t("phoneBookingTitle")}</h1>
      </div>

      {/* Section 1: Customer */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold">1</span>
          <span className="text-sm font-semibold text-brand-text-primary">{t("navCustomers")}</span>
        </div>

        {!selectedCustomer && !showNewCustomer && (
          <>
            <CustomerSearch
              onSelect={(customer) => {
                setSelectedCustomer(customer)
                setShowNewCustomer(false)
              }}
              onNewClick={() => setShowNewCustomer(true)}
            />
            <div className="mt-3 rounded-lg border border-brand-border bg-brand-bg-secondary p-3 text-sm text-brand-text-secondary italic text-center">
              {t("phoneBookingNoCustomer")}
            </div>
          </>
        )}

        {showNewCustomer && !selectedCustomer && (
          <CustomerQuickCreate
            onCreated={(customer) => {
              setSelectedCustomer(customer)
              setShowNewCustomer(false)
            }}
            onCancel={() => setShowNewCustomer(false)}
          />
        )}

        {selectedCustomer && (
          <CustomerInfoCard
            customer={selectedCustomer}
            onClear={() => setSelectedCustomer(null)}
          />
        )}
      </div>

      {/* Section 2: Sessions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold">2</span>
            <span className="text-sm font-semibold text-brand-text-primary">{t("phoneBookingSessions")}</span>
          </div>
          <button
            onClick={addSession}
            className="text-xs text-brand-primary border border-brand-border rounded-lg px-3 py-1.5 hover:bg-brand-bg-secondary transition-colors"
          >
            {t("phoneBookingAddSession")}
          </button>
        </div>

        <div className="space-y-3">
          {sessions.map((session, i) => (
            <SessionCard
              key={session.id}
              session={session}
              sessionIndex={i}
              services={services}
              addOns={addOns}
              staff={staffMembers}
              allBookings={allBookings}
              tentativeBookingsForDate={getTentativeBookingsForDate(session.date, session.id)}
              onUpdate={updateSession}
              onRemove={removeSession}
            />
          ))}
        </div>
      </div>

      {/* Section 3: Notes & Confirm */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold">3</span>
          <span className="text-sm font-semibold text-brand-text-primary">{t("phoneBookingCallNotes")} & {t("confirm")}</span>
        </div>

        <BookingSummary
          sessions={sessions}
          addOns={addOns}
          callNotes={callNotes}
          onCallNotesChange={setCallNotes}
          onOpenNotesPanel={() => setNotesPanelOpen(true)}
          onConfirm={confirmAllBookings}
          isConfirming={isConfirming}
        />
      </div>

      {/* Client Notes Panel (side sheet) */}
      {selectedCustomer && (
        <ClientNotesPanel
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.name}
          open={notesPanelOpen}
          onOpenChange={setNotesPanelOpen}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `cd "/Users/amaan/Documents/Apps - Pixeltec/massagePro/massage pro" && npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 4: Manual smoke test**

Run: `cd "/Users/amaan/Documents/Apps - Pixeltec/massagePro/massage pro" && npx next dev`

Test the following flows:
1. Navigate to Phone / Walk-in Booking in sidebar
2. Search for an existing customer by name
3. Clear customer and create a new one
4. Select a service, duration, and date — verify therapist timelines appear
5. Click a free slot — verify therapist and time are selected
6. Add a second session
7. Add a group guest to a session
8. Type call notes
9. Click "Confirm All Bookings"
10. Verify success screen with action links
11. Click "New Phone Booking" to reset

- [ ] **Step 5: Commit**

```bash
git add hooks/use-phone-booking.ts app/admin/phone-booking/page.tsx
git commit -m "feat: add main PhoneBookingPage and usePhoneBooking hook"
```

---

## Chunk 5: Integration Adjustments & Polish

### Task 13: Verify shop data integration

**Files:**
- May modify: `lib/data/shop-data.ts` or `lib/data/mock-data.ts`

- [ ] **Step 1: Verify useShopData provides staffMembers**

Read `lib/data/shop-data.ts` to confirm it exports `staffMembers` and that the hook works with the page. If the field is named differently (e.g., `staff` instead of `staffMembers`), update the import in `page.tsx` accordingly.

- [ ] **Step 2: Verify customer seeds are accessible by CustomersProvider**

Check that `getSeedsForShop` returns a `customers` array. If the seed structure is different, adapt the `CustomersProvider` initialization accordingly.

- [ ] **Step 3: Fix any integration issues found**

Address any mismatches in field names, import paths, or data structures between the new components and existing stores.

- [ ] **Step 4: Commit if changes were needed**

```bash
git add -A
git commit -m "fix: resolve integration issues with shop data and customer seeds"
```

---

### Task 14: Final build verification and cleanup

- [ ] **Step 1: Full build**

Run: `cd "/Users/amaan/Documents/Apps - Pixeltec/massagePro/massage pro" && npx next build --no-lint 2>&1 | tail -20`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Run dev server and do full walkthrough**

Test the complete flow end-to-end:
1. Nav item visible and styled correctly
2. Customer search works with instant filtering
3. New customer creation works
4. Customer info card shows stats and badges
5. Session card dropdowns work
6. Therapist timeline renders with correct availability
7. Clicking slots selects therapist + time
8. Multiple sessions work
9. Group guests work
10. Add-ons toggle and selection work
11. Call notes and full notes panel work
12. Summary calculates correctly
13. Confirm creates bookings
14. Success screen renders with correct counts
15. "New Phone Booking" resets everything
16. Check responsive behavior (mobile sidebar shows the new nav item)

- [ ] **Step 3: Commit any final fixes**

```bash
git add -A
git commit -m "fix: phone booking final polish and fixes"
```
