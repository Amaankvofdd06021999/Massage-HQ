"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import {
  LayoutDashboard, Calendar, BookOpen, Users, Tag,
  Palette, ChevronLeft, ChevronRight, ChevronDown, Menu, X, Sun, Moon, LogOut, Sparkles, Star,
  Scale, MessageSquare, Heart, DollarSign, Languages, Phone,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeProvider, useBrand } from "@/lib/theme/theme-provider"
import { useAuth } from "@/lib/auth/auth-context"
import { useShop } from "@/lib/shop/shop-context"
import { useLanguage } from "@/lib/i18n/language-context"
import type { Language } from "@/lib/i18n/translations"
import { useState } from "react"
import Image from "next/image"

function AdminSidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { brandConfig, mode, toggleMode } = useBrand()
  const { user, logout } = useAuth()
  const { t, language, setLanguage } = useLanguage()

  const navItems = [
    { label: t("navDashboard"), href: "/admin", icon: LayoutDashboard },
    { label: t("navCalendar"), href: "/admin/calendar", icon: Calendar },
    { label: t("navPhoneBooking"), href: "/admin/phone-booking", icon: Phone },
    { label: t("navBookings"), href: "/admin/bookings", icon: BookOpen },
    { label: t("navStaff"), href: "/admin/staff", icon: Users },
    { label: t("navReviews"), href: "/admin/reviews", icon: Star },
    { label: t("navServices"), href: "/admin/services", icon: Sparkles },
    { label: t("navPromotions"), href: "/admin/promotions", icon: Tag },
    { label: t("loyaltySettings"), href: "/admin/loyalty", icon: Heart },
    { label: t("navCustomers"), href: "/admin/customers", icon: Users },
    { label: t("navClaims"), href: "/admin/claims", icon: Scale },
    { label: t("tipClaims"), href: "/admin/tips", icon: DollarSign },
    { label: t("messages"), href: "/admin/messages", icon: MessageSquare },
    { label: t("navBrandSettings"), href: "/admin/settings", icon: Palette },
  ]

  function handleLogout() {
    logout()
    router.replace("/login")
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-dvh flex-col border-r border-brand-border bg-brand-bg-secondary transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-brand-border px-4">
        {!collapsed && (
          <span className="text-lg font-bold text-brand-text-primary">{brandConfig.shopName}</span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-text-tertiary hover:bg-brand-bg-tertiary hover:text-brand-text-primary"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-primary/15 text-brand-primary"
                  : "text-brand-text-secondary hover:bg-brand-bg-tertiary hover:text-brand-text-primary",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-brand-border p-3 space-y-1">
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-brand-bg-tertiary">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name} fill className="object-cover" sizes="28px" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs font-bold text-brand-text-primary">
                  {user.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-brand-text-primary">{user.name}</p>
              <p className="truncate text-[10px] text-brand-text-tertiary">{user.email}</p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={toggleMode}
          aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className={cn(
            "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-brand-text-secondary transition-colors hover:bg-brand-bg-tertiary hover:text-brand-text-primary w-full",
            collapsed && "justify-center px-2"
          )}
        >
          {mode === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          {!collapsed && <span>{mode === "dark" ? t("lightMode") : t("darkMode")}</span>}
        </button>

        {!collapsed ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5">
            <Languages size={14} className="shrink-0 text-brand-text-tertiary" />
            <div className="relative flex-1">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="appearance-none w-full rounded-md border border-brand-border bg-brand-bg-tertiary pl-1.5 pr-5 py-0.5 text-[10px] font-semibold text-brand-text-primary outline-none focus:border-brand-primary/50 cursor-pointer"
              >
                {(["en", "th", "ko", "ja", "de", "ru"] as const).map((code) => (
                  <option key={code} value={code}>{code.toUpperCase()}</option>
                ))}
              </select>
              <ChevronDown size={10} className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-brand-text-tertiary" />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              const langs = ["en", "th", "ko", "ja", "de", "ru"] as const
              const idx = langs.indexOf(language)
              setLanguage(langs[(idx + 1) % langs.length])
            }}
            className="flex items-center justify-center rounded-xl px-2 py-2 text-[10px] font-bold text-brand-text-tertiary hover:bg-brand-bg-tertiary hover:text-brand-text-primary transition-colors w-full"
            title={t("language")}
          >
            <Languages size={15} />
          </button>
        )}

        {!collapsed && (
          <Link href="/" className="block px-3 text-xs text-brand-text-tertiary hover:text-brand-primary py-1.5 rounded-xl hover:bg-brand-bg-tertiary transition-colors">
            {t("viewCustomerApp")}
          </Link>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-brand-text-secondary transition-colors hover:bg-destructive/10 hover:text-destructive w-full",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? t("signOutLower") : undefined}
        >
          <LogOut size={15} />
          {!collapsed && <span>{t("signOutLower")}</span>}
        </button>
      </div>
    </aside>
  )
}

function MobileHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { brandConfig, mode, toggleMode } = useBrand()
  const { user, logout } = useAuth()
  const { t, language, setLanguage } = useLanguage()

  const navItems = [
    { label: t("navDashboard"), href: "/admin", icon: LayoutDashboard },
    { label: t("navCalendar"), href: "/admin/calendar", icon: Calendar },
    { label: t("navPhoneBooking"), href: "/admin/phone-booking", icon: Phone },
    { label: t("navBookings"), href: "/admin/bookings", icon: BookOpen },
    { label: t("navStaff"), href: "/admin/staff", icon: Users },
    { label: t("navReviews"), href: "/admin/reviews", icon: Star },
    { label: t("navServices"), href: "/admin/services", icon: Sparkles },
    { label: t("navPromotions"), href: "/admin/promotions", icon: Tag },
    { label: t("loyaltySettings"), href: "/admin/loyalty", icon: Heart },
    { label: t("navCustomers"), href: "/admin/customers", icon: Users },
    { label: t("navClaims"), href: "/admin/claims", icon: Scale },
    { label: t("tipClaims"), href: "/admin/tips", icon: DollarSign },
    { label: t("messages"), href: "/admin/messages", icon: MessageSquare },
    { label: t("navBrandSettings"), href: "/admin/settings", icon: Palette },
  ]

  function handleLogout() {
    logout()
    router.replace("/login")
  }

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-brand-border bg-brand-bg-secondary/95 px-4 backdrop-blur-lg lg:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu size={22} className="text-brand-text-primary" />
        </button>
        <span className="text-sm font-bold text-brand-text-primary">{brandConfig.shopName} Admin</span>
        <button
          type="button"
          onClick={toggleMode}
          aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-text-secondary hover:bg-brand-bg-tertiary hover:text-brand-text-primary transition-colors"
        >
          {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-brand-bg-secondary p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-brand-text-primary">{brandConfig.shopName}</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu">
                <X size={20} className="text-brand-text-tertiary" />
              </button>
            </div>

            {user && (
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-brand-bg-tertiary px-3 py-2.5">
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-brand-bg-secondary">
                  {user.avatar ? (
                    <Image src={user.avatar} alt={user.name} fill className="object-cover" sizes="32px" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xs font-bold text-brand-text-primary">
                      {user.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-brand-text-primary">{user.name}</p>
                  <p className="truncate text-xs text-brand-text-tertiary">{user.email}</p>
                </div>
              </div>
            )}

            <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-brand-primary/15 text-brand-primary"
                        : "text-brand-text-secondary hover:bg-brand-bg-tertiary"
                    )}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="shrink-0 border-t border-brand-border pt-3 space-y-1">
              <div className="flex items-center gap-2 px-3 py-2">
                <Languages size={16} className="shrink-0 text-brand-text-tertiary" />
                <div className="relative flex-1">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="appearance-none w-full rounded-lg border border-brand-border bg-brand-bg-tertiary pl-2.5 pr-7 py-1 text-xs font-semibold text-brand-text-primary outline-none focus:border-brand-primary/50 cursor-pointer"
                  >
                    {(["en", "th", "ko", "ja", "de", "ru"] as const).map((code) => (
                      <option key={code} value={code}>{code.toUpperCase()}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-brand-text-tertiary" />
                </div>
              </div>
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2 text-sm text-brand-text-secondary hover:bg-brand-bg-tertiary transition-colors"
              >
                {t("viewCustomerApp")}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-brand-text-secondary hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut size={16} />
                <span>{t("signOutLower")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, isLoading } = useAuth()
  const { isShopSelected } = useShop()
  const router = useRouter()

  useEffect(() => {
    if (!isShopSelected) router.replace("/shops")
  }, [isShopSelected, router])

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.replace("/login")
      else if (user.role === "customer") router.replace("/")
      else if (user.role === "staff") router.replace("/staff")
    }
  }, [user, isLoading, router])

  if (!isShopSelected || isLoading || !user || user.role !== "manager") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0A0A0F]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="hidden lg:block">
        <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>
      <MobileHeader />
      <main
        className={cn(
          "min-h-dvh pt-14 transition-all duration-300 lg:pt-0",
          collapsed ? "lg:pl-16" : "lg:pl-60"
        )}
      >
        <div className="page-transition p-4 lg:p-6">{children}</div>
      </main>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </ThemeProvider>
  )
}
