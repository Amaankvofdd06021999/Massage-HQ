# Full Codebase Refactoring — Design Document

**Goal:** Restructure for maintainability and scalability. No behavior changes.

## Phase 1: Constants & Utilities
- Create `lib/constants.ts` — ROOM_TYPE_COLORS, MASSAGE_TYPES, STATUS_COLORS, PAIN_AREAS, CONDITIONS, TIP_PRESETS, LANGUAGE_OPTIONS
- Create `lib/utils/formatters.ts` — formatPrice, formatMassageType, formatDuration (extracted from mock-data.ts)
- Create `lib/utils/time.ts` — generateTimeSlots, date helpers (extracted from mock-data.ts)
- Slim `lib/data/mock-data.ts` to only seed data

## Phase 2: Split Oversized Pages
- `admin/services/page.tsx` (829→~150) → extract ServiceModal, AddOnModal, RoomModal, ServiceCard, AddOnCard, RoomCard, DeleteConfirm
- `(customer)/book/page.tsx` (765→~100) → extract ServiceStep, TherapistStep, DateTimeStep, ConfirmationStep + useBookingFlow hook
- `(customer)/profile/page.tsx` (503→~200) → extract PreferencesEditor, ProfileHeader
- `admin/calendar/page.tsx` (530→~150) → extract DayView, WeekView, MonthView

## Phase 3: Shared Components
- `components/shared/language-dropdown.tsx` — replaces 6 copy-pasted selects
- `components/shared/status-badge.tsx` — booking status with colors
- `components/shared/delete-confirm-dialog.tsx` — confirmation dialog

## Phase 4: Translation Split
- Split `translations.ts` (3721 lines) into `lib/i18n/locales/{en,th,ko,ja,de}.ts`
- Keep `translations.ts` as barrel with type safety
