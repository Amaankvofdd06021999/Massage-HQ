"use client"

import { Pin, PinOff, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ClientNote } from "@/lib/types"

const categoryStyles: Record<string, { bg: string; text: string; label: string }> = {
  injury:     { bg: "bg-brand-coral/15", text: "text-brand-coral", label: "Injury" },
  allergy:    { bg: "bg-brand-coral/15", text: "text-brand-coral", label: "Allergy" },
  medical:    { bg: "bg-brand-blue/15",  text: "text-brand-blue",  label: "Medical" },
  warning:    { bg: "bg-red-500/15",     text: "text-red-500",     label: "⚠ Warning" },
  preference: { bg: "bg-brand-green/15", text: "text-brand-green", label: "Preference" },
  general:    { bg: "bg-brand-bg-tertiary", text: "text-brand-text-secondary", label: "General" },
}

export function ClientNoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  showActions = false,
}: {
  note: ClientNote
  onEdit?: (note: ClientNote) => void
  onDelete?: (id: string) => void
  onTogglePin?: (id: string) => void
  showActions?: boolean
}) {
  const style = categoryStyles[note.category] ?? categoryStyles.general

  return (
    <div
      className={cn(
        "rounded-xl border border-brand-border bg-card p-4 transition-colors",
        note.category === "warning" && "border-red-500/40 bg-red-500/5",
        note.isPinned && note.category !== "warning" && "border-brand-primary/30 bg-brand-primary/5"
      )}
    >
      {/* Header: category badge + actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
              style.bg,
              style.text
            )}
          >
            {style.label}
          </span>
          {note.isPinned && (
            <Pin size={12} className="text-brand-primary" />
          )}
        </div>

        {showActions && (
          <div className="flex items-center gap-0.5">
            {onTogglePin && (
              <button
                type="button"
                onClick={() => onTogglePin(note.id)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-brand-text-tertiary hover:bg-brand-bg-tertiary hover:text-brand-text-primary transition-colors"
                aria-label={note.isPinned ? "Unpin note" : "Pin note"}
              >
                {note.isPinned ? <PinOff size={13} /> : <Pin size={13} />}
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(note)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-brand-text-tertiary hover:bg-brand-bg-tertiary hover:text-brand-text-primary transition-colors"
                aria-label="Edit note"
              >
                <Pencil size={13} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(note.id)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-brand-text-tertiary hover:bg-destructive/10 hover:text-destructive transition-colors"
                aria-label="Delete note"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <p className="mt-2 text-sm leading-relaxed text-brand-text-primary">
        {note.content}
      </p>

      {/* Footer: author + date */}
      <div className="mt-3 flex items-center gap-2 text-xs text-brand-text-tertiary">
        <span className="font-medium text-brand-text-secondary">
          {note.authorName}
        </span>
        <span className="capitalize">({note.authorRole})</span>
        <span className="ml-auto">
          {new Date(note.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  )
}
