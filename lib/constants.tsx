"use client"

import { DoorOpen, Layers, Sparkles, Users } from "lucide-react"
import type { MassageType, RoomType, PainArea, HealthCondition } from "@/lib/types"

// ─── Massage Types ──────────────────────────────────────────────────────────

export const MASSAGE_TYPE_VALUES: MassageType[] = [
  "thai", "swedish", "deep-tissue", "aromatherapy",
  "hot-stone", "sports", "reflexology", "shiatsu",
]

// ─── Room Types ─────────────────────────────────────────────────────────────

export const ROOM_TYPE_VALUES: { value: RoomType; icon: React.ReactNode }[] = [
  { value: "room",   icon: <DoorOpen size={14} /> },
  { value: "bed",    icon: <Layers size={14} /> },
  { value: "suite",  icon: <Sparkles size={14} /> },
  { value: "couple", icon: <Users size={14} /> },
]

export const ROOM_TYPE_COLORS: Record<RoomType, string> = {
  room:   "bg-blue-500/15 text-blue-400",
  bed:    "bg-green-500/15 text-green-400",
  suite:  "bg-yellow-500/15 text-yellow-400",
  couple: "bg-pink-500/15 text-pink-400",
}

// ─── Booking Status Styles ──────────────────────────────────────────────────

export const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-brand-green/15 text-brand-green",
  pending: "bg-brand-yellow/15 text-brand-yellow",
  completed: "bg-brand-text-tertiary/15 text-brand-text-secondary",
  cancelled: "bg-brand-coral/15 text-brand-coral",
  "in-progress": "bg-brand-blue/15 text-brand-blue",
  "no-show": "bg-brand-coral/15 text-brand-coral",
  rejected: "bg-brand-coral/15 text-brand-coral",
}

export const STATUS_DOT_COLORS: Record<string, string> = {
  confirmed: "bg-brand-green",
  pending: "bg-brand-yellow",
  completed: "bg-brand-text-tertiary",
  cancelled: "bg-brand-coral",
  "in-progress": "bg-brand-blue",
  "no-show": "bg-brand-coral",
  rejected: "bg-brand-coral",
}

// ─── Customer Preference Lists ──────────────────────────────────────────────

export const ALL_PAIN_AREAS: PainArea[] = [
  "neck", "shoulders", "upper-back", "lower-back",
  "arms", "hands", "hips", "legs", "knees", "feet",
]

export const ALL_CONDITIONS: HealthCondition[] = [
  "office-syndrome", "sports-injury", "chronic-pain",
  "stress-anxiety", "insomnia", "poor-circulation",
  "muscle-tension", "post-surgery", "pregnancy",
]

// ─── Tips ───────────────────────────────────────────────────────────────────

export const TIP_PRESETS: number[] = [50, 100, 200, 500]

// ─── Language Options ───────────────────────────────────────────────────────

export const LANGUAGE_OPTIONS: { code: "en" | "th" | "ko" | "ja" | "de"; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English",  nativeLabel: "English" },
  { code: "th", label: "Thai",     nativeLabel: "ภาษาไทย" },
  { code: "ko", label: "Korean",   nativeLabel: "한국어" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語" },
  { code: "de", label: "German",   nativeLabel: "Deutsch" },
]
