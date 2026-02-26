import { cn } from "@/lib/utils"

type BadgeVariant = "success" | "active" | "warning" | "info" | "promo" | "neutral"

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-brand-green/15 text-brand-green",
  active: "bg-brand-blue/15 text-brand-blue",
  warning: "bg-brand-yellow/15 text-brand-yellow",
  info: "bg-brand-blue/15 text-brand-blue",
  promo: "bg-brand-coral/15 text-brand-coral",
  neutral: "bg-brand-bg-tertiary text-brand-text-secondary",
}

export function StatusBadge({
  variant = "neutral",
  children,
  className,
  dot = false,
}: {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  dot?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {children}
    </span>
  )
}

// Map booking status to badge variant
export function bookingStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "pending": return "warning"
    case "confirmed": return "success"
    case "in-progress": return "active"
    case "completed": return "info"
    case "cancelled": return "warning"
    case "rejected": return "promo"
    case "no-show": return "promo"
    default: return "neutral"
  }
}
