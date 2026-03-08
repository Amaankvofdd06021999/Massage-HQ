"use client"

import { cn } from "@/lib/utils"
import { Clock, Gift, Sparkles, Tag, Trophy, Zap } from "lucide-react"
import type { Promotion } from "@/lib/types"

const colorMap = {
  green: { bg: "bg-brand-green/10", border: "border-brand-green/20", text: "text-brand-green", badge: "bg-brand-green/20 text-brand-green" },
  coral: { bg: "bg-brand-coral/10", border: "border-brand-coral/20", text: "text-brand-coral", badge: "bg-brand-coral/20 text-brand-coral" },
  yellow: { bg: "bg-brand-yellow/10", border: "border-brand-yellow/20", text: "text-brand-yellow", badge: "bg-brand-yellow/20 text-brand-yellow" },
  blue: { bg: "bg-brand-blue/10", border: "border-brand-blue/20", text: "text-brand-blue", badge: "bg-brand-blue/20 text-brand-blue" },
}

const typeIcons: Record<string, React.ReactNode> = {
  package: <Gift size={20} />,
  "happy-hour": <Clock size={20} />,
  trial: <Sparkles size={20} />,
  loyalty: <Trophy size={20} />,
  "first-timer": <Zap size={20} />,
  seasonal: <Tag size={20} />,
}

export function PromoCard({
  promo,
  compact = false,
  onClick,
  onPurchase,
  className,
}: {
  promo: Promotion
  compact?: boolean
  onClick?: () => void
  onPurchase?: () => void
  className?: string
}) {
  const colors = colorMap[promo.color]

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 rounded-xl border p-3 text-left transition-all card-press",
          colors.bg, colors.border,
          className
        )}
      >
        <span className={cn("shrink-0", colors.text)}>{typeIcons[promo.type]}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-brand-text-primary">{promo.title}</p>
          {promo.discountPercent && (
            <p className={cn("text-xs font-medium", colors.text)}>{promo.discountPercent}% off</p>
          )}
        </div>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", colors.badge)}>
          {promo.badge}
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col rounded-2xl border p-5 text-left transition-all card-press",
        colors.bg, colors.border,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn("rounded-xl bg-background/50 p-2.5", colors.text)}>{typeIcons[promo.type]}</span>
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", colors.badge)}>
          {promo.badge}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-bold text-brand-text-primary">{promo.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-brand-text-secondary line-clamp-2">{promo.description}</p>
      {promo.discountPercent && (
        <div className="mt-4 flex items-baseline gap-2">
          <span className={cn("text-2xl font-bold", colors.text)}>{promo.discountPercent}%</span>
          <span className="text-sm text-brand-text-tertiary">off</span>
        </div>
      )}
      {promo.sessions && (
        <div className="mt-3 flex gap-1">
          {Array.from({ length: promo.sessions }, (_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                i < (promo.sessionsUsed ?? 0) ? "bg-current" : "bg-brand-border"
              )}
              style={{ color: `var(--brand-${promo.color === "coral" ? "coral" : promo.color})` }}
            />
          ))}
        </div>
      )}
      {onPurchase && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onPurchase() }}
          className={cn("mt-4 w-full rounded-xl py-2.5 text-sm font-semibold transition-all", colors.badge)}
        >
          Purchase
        </button>
      )}
    </button>
  )
}
