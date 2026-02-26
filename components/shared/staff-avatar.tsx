import { cn } from "@/lib/utils"

export function StaffAvatar({
  src,
  name,
  size = "md",
  available,
  className,
}: {
  src: string
  name: string
  size?: "sm" | "md" | "lg" | "xl"
  available?: boolean
  className?: string
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  }

  return (
    <div className={cn("relative shrink-0", className)}>
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full object-cover ring-2 ring-brand-border",
          sizeClasses[size]
        )}
      />
      {available !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-brand-bg-primary",
            available ? "bg-brand-green" : "bg-brand-text-tertiary"
          )}
        />
      )}
    </div>
  )
}

export function AvatarCluster({
  avatars,
  max = 3,
  size = "sm",
}: {
  avatars: { src: string; name: string }[]
  max?: number
  size?: "sm" | "md"
}) {
  const shown = avatars.slice(0, max)
  const remaining = avatars.length - max

  const sizeClasses = {
    sm: "h-8 w-8 -ml-2 first:ml-0",
    md: "h-10 w-10 -ml-3 first:ml-0",
  }

  return (
    <div className="flex items-center">
      {shown.map((a, i) => (
        <img
          key={i}
          src={a.src}
          alt={a.name}
          className={cn(
            "rounded-full object-cover ring-2 ring-brand-bg-primary",
            sizeClasses[size]
          )}
          style={{ zIndex: max - i }}
        />
      ))}
      {remaining > 0 && (
        <span
          className={cn(
            "flex items-center justify-center rounded-full bg-brand-bg-tertiary text-xs font-medium text-brand-text-secondary ring-2 ring-brand-bg-primary",
            sizeClasses[size]
          )}
          style={{ zIndex: 0 }}
        >
          +{remaining}
        </span>
      )}
    </div>
  )
}
