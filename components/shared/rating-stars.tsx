"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function RatingStars({
  rating,
  max = 5,
  size = 16,
  interactive = false,
  onRate,
  className,
}: {
  rating: number
  max?: number
  size?: number
  interactive?: boolean
  onRate?: (rating: number) => void
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(rating)
        const partial = !filled && i < rating
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(i + 1)}
            className={cn(
              "relative transition-transform",
              interactive && "cursor-pointer hover:scale-110",
              !interactive && "cursor-default"
            )}
            style={{ animationDelay: `${i * 80}ms` }}
            aria-label={`${i + 1} star`}
          >
            <Star
              size={size}
              className={cn(
                "transition-colors",
                filled ? "fill-brand-yellow text-brand-yellow" :
                partial ? "fill-brand-yellow/50 text-brand-yellow" :
                "fill-transparent text-brand-text-tertiary"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

export function RatingDisplay({
  rating,
  reviews,
  className,
}: {
  rating: number
  reviews?: number
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Star size={14} className="fill-brand-yellow text-brand-yellow" />
      <span className="text-sm font-semibold text-brand-text-primary">{rating.toFixed(1)}</span>
      {reviews !== undefined && (
        <span className="text-xs text-brand-text-tertiary">({reviews})</span>
      )}
    </div>
  )
}
