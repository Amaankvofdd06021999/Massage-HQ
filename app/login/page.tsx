"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, LayoutDashboard, User, Eye, EyeOff, Sparkles, Heart, ChevronDown } from "lucide-react"
import { useAuth, DEMO_MANAGER, DEMO_CUSTOMER, DEMO_STAFF } from "@/lib/auth/auth-context"
import type { AuthUser } from "@/lib/auth/auth-context"
import { useLanguage } from "@/lib/i18n/language-context"
import type { Language } from "@/lib/i18n/translations"
import { useShop } from "@/lib/shop/shop-context"

// ── CK demo users ────────────────────────────────────────────
const CK_DEMO_MANAGER: AuthUser = {
  id: "ck-manager-1",
  name: "Preecha Wongsawat",
  email: "manager@ck.com",
  role: "manager",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
}

const CK_DEMO_CUSTOMER: AuthUser = {
  id: "c1", // Same customer across shops
  name: "Alex Chen",
  email: "alex@example.com",
  role: "customer",
  avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=200&h=200&fit=crop&crop=face",
}

const CK_DEMO_STAFF: AuthUser = {
  id: "ck-s1",
  name: "Nuch Sripanya",
  email: "nuch@ck.com",
  role: "staff",
  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
}

export default function LoginPage() {
  const { user, isLoading, login } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const { shopConfig, isShopSelected } = useShop()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [bypassLoading, setBypassLoading] = useState<"manager" | "customer" | "staff" | null>(null)

  useEffect(() => {
    if (!isShopSelected) router.replace("/shops")
  }, [isShopSelected, router])

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "manager") router.replace("/admin")
      else if (user.role === "staff") router.replace("/staff")
      else router.replace("/")
    }
  }, [user, isLoading, router])

  const demoUsers = shopConfig?.id === "ck"
    ? { manager: CK_DEMO_MANAGER, customer: CK_DEMO_CUSTOMER, staff: CK_DEMO_STAFF }
    : { manager: DEMO_MANAGER, customer: DEMO_CUSTOMER, staff: DEMO_STAFF }

  async function handleBypass(role: "manager" | "customer" | "staff") {
    setBypassLoading(role)
    await new Promise((r) => setTimeout(r, 600))
    const demoUser = demoUsers[role]
    login(demoUser)
    router.replace(role === "manager" ? "/admin" : role === "staff" ? "/staff" : "/")
  }

  if (isLoading || user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-5 py-12">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">

        <div className="mb-4 flex justify-end">
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="appearance-none rounded-lg border border-border bg-card pl-3 pr-7 py-1.5 text-xs font-medium text-muted-foreground outline-none focus:border-primary/50 cursor-pointer"
            >
              {([
                { code: "en" as const, label: "EN" },
                { code: "th" as const, label: "TH" },
                { code: "ko" as const, label: "KO" },
                { code: "ja" as const, label: "JA" },
                { code: "de" as const, label: "DE" },
                { code: "ru" as const, label: "RU" },
              ]).map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
            <Sparkles size={28} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{shopConfig?.name ?? t("appName")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{shopConfig?.tagline ?? t("tagline")}</p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">{t("signIn")}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("enterCredentials")}</p>

          <div className="mt-5 space-y-3">
            {/* Email */}
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder={t("emailAddress")}
                className="w-full rounded-xl border border-border bg-secondary py-3 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("password")}
                className="w-full rounded-xl border border-border bg-secondary py-3 pl-10 pr-10 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Sign in button */}
            <button
              type="button"
              className="mt-1 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              {t("signInButton")}
            </button>
          </div>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">{t("orDemoAccess")}</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Bypass buttons */}
          <div className="space-y-3">
            {/* Manager bypass */}
            <button
              type="button"
              onClick={() => handleBypass("manager")}
              disabled={bypassLoading !== null}
              className="group relative w-full overflow-hidden rounded-xl border border-primary/30 bg-primary/5 p-4 text-left transition-all hover:border-primary/60 hover:bg-primary/10 active:scale-[0.98] disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                  {bypassLoading === "manager" ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <LayoutDashboard size={18} className="text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("managerRole")}</p>
                  <p className="text-xs text-muted-foreground">{demoUsers.manager.email}</p>
                </div>
              </div>
            </button>

            {/* Customer bypass */}
            <button
              type="button"
              onClick={() => handleBypass("customer")}
              disabled={bypassLoading !== null}
              className="group relative w-full overflow-hidden rounded-xl border border-border bg-secondary/50 p-4 text-left transition-all hover:border-muted-foreground/30 hover:bg-secondary active:scale-[0.98] disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  {bypassLoading === "customer" ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                  ) : (
                    <User size={18} className="text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("customerRole")}</p>
                  <p className="text-xs text-muted-foreground">{demoUsers.customer.email}</p>
                </div>
              </div>
            </button>

            {/* Staff bypass */}
            <button
              type="button"
              onClick={() => handleBypass("staff")}
              disabled={bypassLoading !== null}
              className="group relative w-full overflow-hidden rounded-xl border border-brand-green/30 bg-brand-green/5 p-4 text-left transition-all hover:border-brand-green/60 hover:bg-brand-green/10 active:scale-[0.98] disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green/15">
                  {bypassLoading === "staff" ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
                  ) : (
                    <Heart size={18} className="text-brand-green" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("staffRole")}</p>
                  <p className="text-xs text-muted-foreground">{demoUsers.staff.email}</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] text-muted-foreground">
          {t("demoDisclaimer")}
        </p>
      </div>
    </div>
  )
}
