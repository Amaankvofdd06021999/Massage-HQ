# Phone / Walk-in Booking — Design Spec

## Overview

A dedicated admin page for managers to create bookings on behalf of customers who call or walk in. This is a daily-use feature that mirrors the natural flow of a phone call: identify the customer, build one or more sessions, add notes, and confirm.

## Placement

- **New top-level nav item** in the admin sidebar, labeled "Phone / Walk-in Booking"
- Positioned prominently (after Dashboard or Calendar) since it's a daily workflow
- Icon: Phone or similar

## Page Structure

Single-page, customer-first flow. No wizard steps — everything on one scrollable page for speed. Three logical sections:

### Section 1: Customer

**Search (existing customers):**
- Single search bar with instant-filter dropdown
- Matches on customer name and membership number
- Each result shows: name, membership #, phone (masked), visit count
- Selecting a customer expands a **customer info card** showing:
  - Quick stats: total visits, total spent, loyalty stamps, preferred therapist
  - Alert badges: injuries, pressure preference, favorite service (pulled from customer preferences and notes)
  - Last visit: date, service, therapist — so manager can suggest "same as last time?"
  - "View history" link for deeper dive
  - "Clear" button to switch customers

**Quick create (new customers):**
- "+ New" button beside the search bar
- Inline form with two required fields: **name** and **phone**
- Optional expandable field for email
- Membership number auto-generated
- "Create & Continue" button — creates the customer and selects them in one action
- Full profile (preferences, health conditions, etc.) can be completed later

### Section 2: Sessions

Each session is a compact card containing all booking fields inline:

**Session card fields:**
- Service (dropdown — from active services)
- Duration (dropdown — based on selected service's available durations)
- Date (date picker)

**Therapist & time selection (inline mini-schedule):**
Once service, duration, and date are selected, a **therapist availability timeline** appears below the session card:
- One row per therapist who offers the selected service
- Each row shows the therapist's full day as a horizontal timeline strip (operating hours)
- **Green blocks** = free slots, **Red blocks** = booked slots, **Striped** = day off
- Free slot count displayed per therapist (e.g., "4 free slots")
- Therapists sorted by availability (most free slots at top)
- Day-off therapists shown at bottom, fully greyed out
- Manager **clicks a free slot** to select both therapist and time in one action
- Selected slot highlighted in blue with time label
- "Any Available" option remains for cases where the customer doesn't care

**Add-ons:**
- "+ Add-ons" button on each session card
- Opens inline selector for available add-ons (from existing add-ons system)

**Multiple sessions:**
- "+ Add Another Session" button below the last session card
- Each session is independent (different date, service, therapist)
- Completed sessions collapse to a compact summary line showing: service, duration, therapist, date/time, price
- Collapsed sessions have "Edit" and "Remove" actions
- Use case: "Book me for Thursday and Saturday"

**Group guests (within a session):**
- "+ Group Guest" button on each session card
- Adds guest rows within the same session card
- Each guest gets: name (optional), service, duration, therapist selection
- Guest names are optional since they may be unknown walk-ins
- Session card shows a "Group × N" badge
- All guests share the same date/time slot
- Uses the existing group booking data model
- Use case: "I'm bringing 2 friends"

**Combined scenario:** A single call can produce Session 1 (group of 3 on Thursday) + Session 2 (solo on Saturday). Each session card independently supports group guests.

### Section 3: Notes & Confirm

**Call notes:**
- Free-text textarea for quick informal notes
- Attached to all bookings created from this call
- Example: "Customer requested ground floor room. Neck has been sore lately."
- Subtitle: "This note will be attached to all bookings from this call"

**Full notes panel:**
- "Open Full Notes Panel" link opens the existing categorized client notes panel (injury, preference, allergy, medical, warning)
- This is the existing `ClientNotesPanel` component, opened as a side sheet

**Booking summary:**
- Itemized list of all sessions with:
  - Session number, date, time
  - Group badge if applicable
  - Individual line items per person (name, service, duration, therapist)
  - Price per session
- Running total at the bottom
- "Pay at arrival" label — no payment captured at booking time
- Session count and total booking count (e.g., "2 sessions · 4 bookings")

**Confirm:**
- Single "Confirm All Bookings" button
- Creates all bookings at once
- All bookings created with status "confirmed" (manager-booked, no approval needed)
- Booking source tagged as "phone" or "walk-in" to distinguish from online bookings

**Success screen:**
- Confirmation message with count: "4 Bookings Confirmed"
- Customer name and guest count
- Quick action links:
  - "View in Calendar" — navigates to calendar on the relevant date
  - "View Customer" — navigates to the customer's profile
  - "New Phone Booking" — most prominent, resets the form for the next call

## Data Model Considerations

**Booking source:** Add a `source` field to the booking type to distinguish phone/walk-in bookings from online customer bookings. Values: `"online"`, `"phone"`, `"walk-in"`.

**Call notes:** The quick call note is stored as a regular note on the booking record (existing `notes` field or similar). It is copied to all bookings created in the same call.

**New customer creation:** Uses the existing Customer type. Only `name` and `phone` are required at creation time. All other fields (`email`, `preferredStaff`, `massagePreferences`, etc.) default to empty/null and can be filled in later via the customer management page.

**Auto-generated membership number:** Follows the existing pattern in the codebase for membership number generation.

**Group bookings:** Leverages the existing group booking data model already present in the customer-facing booking flow.

## Availability Logic

The therapist schedule timeline requires computing availability by cross-referencing:
1. The therapist's working hours for the selected date (from staff availability data)
2. Existing confirmed bookings for that therapist on that date
3. The selected service duration (to determine if a free gap is long enough)

Only free gaps that can fit the selected service duration should be shown as selectable. Gaps shorter than the required duration should appear as "too short" or be visually distinct.

## Navigation

- New sidebar nav item: "Phone / Walk-in Booking"
- Position: after Calendar (3rd item) — prominent but not displacing Dashboard
- Icon: `Phone` from lucide-react (consistent with existing icon usage)
- Translation keys needed for all 6 supported languages

## Edge Cases

1. **Customer not found in search:** Manager clicks "+ New" to quick-create
2. **No therapist available at requested time:** Timeline shows all-red for that time, manager can suggest alternative times visible in the green gaps
3. **Overlapping group booking:** If a group guest needs the same therapist at the same time as another guest, the timeline should reflect the tentative selection (the slot selected in the current call should appear as taken for subsequent guest rows)
4. **Removing a session:** Removes from summary and recalculates total
5. **Switching customer mid-flow:** "Clear" on the customer card resets to search, but preserves session data in case the manager just picked the wrong person
6. **Call abandoned:** No auto-save. If manager navigates away, the form resets. This is intentional — partial phone bookings shouldn't clutter the system.

## Out of Scope

- Payment capture at booking time (payment happens at arrival)
- SMS/email confirmation sent to customer (can be added later)
- Call recording or telephony integration
- Recurring/subscription bookings
- Waitlist management
