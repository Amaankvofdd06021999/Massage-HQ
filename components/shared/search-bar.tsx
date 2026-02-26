"use client"

import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={cn("relative", className)}>
      <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-text-tertiary" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-11 w-full rounded-full border border-brand-border bg-brand-bg-secondary pl-10 pr-10 text-sm text-brand-text-primary placeholder:text-brand-text-tertiary",
          "focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/30",
          "transition-colors"
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-text-tertiary hover:text-brand-text-secondary"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
