"use client"

import { cn } from "@/lib/utils"

export function PillButton({
  children,
  active = false,
  onClick,
  className,
}: {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-medium transition-all",
        "border whitespace-nowrap",
        active
          ? "border-brand-primary bg-brand-primary/15 text-brand-primary"
          : "border-brand-border bg-brand-bg-secondary text-brand-text-secondary hover:border-brand-text-tertiary hover:text-brand-text-primary",
        className
      )}
    >
      {children}
    </button>
  )
}

export function PillButtonRow({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto no-scrollbar pb-1", className)}>
      {children}
    </div>
  )
}
