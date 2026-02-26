"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Calendar, ClipboardList, Users, MessageSquare, User, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeProvider, useBrand } from "@/lib/theme/theme-provider"
import { useAuth } from "@/lib/auth/auth-context"
import { useLanguage } from "@/lib/i18n/language-context"
import { useMessages } from "@/lib/data/messages-store"

function BottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { user } = useAuth()
  const { getUnreadCount } = useMessages()

  const unreadCount = user ? getUnreadCount(user.id) : 0

  const navItems = [
    { label: "Schedule", href: "/staff", icon: Calendar },
    { label: "Bookings", href: "/staff/bookings", icon: ClipboardList },
    { label: "Clients", href: "/staff/clients", icon: Users },
    { label: "Messages", href: "/staff/messages", icon: MessageSquare, badge: unreadCount },
    { label: "Profile", href: "/staff/profile", icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-border bg-brand-bg-secondary/95 backdrop-blur-lg safe-area-pb">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/staff" && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors",
                isActive
                  ? "text-brand-primary"
                  : "text-brand-text-tertiary hover:text-brand-text-secondary"
              )}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-coral px-1 text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function ModeToggle() {
  const { mode, toggleMode } = useBrand()
  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="fixed right-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-brand-border bg-brand-bg-secondary/90 text-brand-text-secondary backdrop-blur-sm transition-colors hover:text-brand-text-primary"
    >
      {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}

function StaffLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.replace("/login")
      else if (user.role === "customer") router.replace("/")
      else if (user.role === "manager") router.replace("/admin")
    }
  }, [user, isLoading, router])

  if (isLoading || !user || user.role !== "staff") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <ModeToggle />
      <main className="flex-1 pb-20">
        <div className="page-transition">{children}</div>
      </main>
      <BottomNav />
    </div>
  )
}

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <StaffLayoutInner>{children}</StaffLayoutInner>
    </ThemeProvider>
  )
}
