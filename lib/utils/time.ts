import type { TimeSlot } from "@/lib/types"

// ─── Time & Date Utilities ──────────────────────────────────────────────────

function seededHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function generateTimeSlots(date: string, staffId: string): TimeSlot[] {
  const seed = seededHash(`${date}-${staffId}`)
  const slots: TimeSlot[] = []
  const hours = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
  hours.forEach((h, i) => {
    slots.push({
      time: `${h.toString().padStart(2, "0")}:00`,
      available: ((seed + i * 7) % 10) > 2,
    })
    slots.push({
      time: `${h.toString().padStart(2, "0")}:30`,
      available: ((seed + i * 7 + 3) % 10) > 3,
    })
  })
  return slots
}

export function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}
