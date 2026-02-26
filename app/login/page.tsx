"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, LayoutDashboard, User, Eye, EyeOff, Sparkles, Heart } from "lucide-react"
import { useAuth, DEMO_MANAGER, DEMO_CUSTOMER, DEMO_STAFF } from "@/lib/auth/auth-context"
import { useLanguage } from "@/lib/i18n/language-context"

export default function LoginPage() {
  const { user, isLoading, login } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [bypassLoading, setBypassLoading] = useState<"manager" | "customer" | "staff" | null>(null)

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "manager") router.replace("/admin")
      else if (user.role === "staff") router.replace("/staff")
      else router.replace("/")
    }
  }, [user, isLoading, router])

  async function handleBypass(role: "manager" | "customer" | "staff") {
    setBypassLoading(role)
    await new Promise((r) => setTimeout(r, 600))
    const demoUser = role === "manager" ? DEMO_MANAGER : role === "staff" ? DEMO_STAFF : DEMO_CUSTOMER
    login(demoUser)
    router.replace(role === "manager" ? "/admin" : role === "staff" ? "/staff" : "/")
  }

  if (isLoading || user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0A0A0F]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FACC15] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#0A0A0F] px-5 py-12">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FACC15]/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">

        {/* Language toggle */}
        <div className="mb-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
              language === "en"
                ? "bg-[#FACC15]/20 text-[#FACC15]"
                : "text-[#6B6B7B] hover:text-[#A0A0B0]"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage("th")}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
              language === "th"
                ? "bg-[#FACC15]/20 text-[#FACC15]"
                : "text-[#6B6B7B] hover:text-[#A0A0B0]"
            }`}
          >
            TH
          </button>
        </div>

        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FACC15]/15 ring-1 ring-[#FACC15]/30">
            <Sparkles size={28} className="text-[#FACC15]" />
          </div>
          <h1 className="text-2xl font-bold text-[#F5F5F5]">{t("appName")}</h1>
          <p className="mt-1 text-sm text-[#6B6B7B]">{t("tagline")}</p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-[#2A2A35] bg-[#141419] p-6">
          <h2 className="text-lg font-semibold text-[#F5F5F5]">{t("signIn")}</h2>
          <p className="mt-0.5 text-sm text-[#6B6B7B]">{t("enterCredentials")}</p>

          <div className="mt-5 space-y-3">
            {/* Email */}
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B7B]" />
              <input
                type="email"
                placeholder={t("emailAddress")}
                className="w-full rounded-xl border border-[#2A2A35] bg-[#1E1E26] py-3 pl-10 pr-4 text-sm text-[#F5F5F5] placeholder-[#6B6B7B] outline-none focus:border-[#FACC15]/50 focus:ring-1 focus:ring-[#FACC15]/30 transition-colors"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B7B]" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("password")}
                className="w-full rounded-xl border border-[#2A2A35] bg-[#1E1E26] py-3 pl-10 pr-10 text-sm text-[#F5F5F5] placeholder-[#6B6B7B] outline-none focus:border-[#FACC15]/50 focus:ring-1 focus:ring-[#FACC15]/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B6B7B] hover:text-[#A0A0B0] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Sign in button */}
            <button
              type="button"
              className="mt-1 w-full rounded-xl bg-[#FACC15] py-3 text-sm font-semibold text-[#0A0A0F] transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              {t("signInButton")}
            </button>
          </div>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#2A2A35]" />
            <span className="text-xs font-medium text-[#6B6B7B]">{t("orDemoAccess")}</span>
            <div className="h-px flex-1 bg-[#2A2A35]" />
          </div>

          {/* Bypass buttons */}
          <div className="space-y-3">
            {/* Manager bypass */}
            <button
              type="button"
              onClick={() => handleBypass("manager")}
              disabled={bypassLoading !== null}
              className="group relative w-full overflow-hidden rounded-xl border border-[#FACC15]/30 bg-[#FACC15]/5 p-4 text-left transition-all hover:border-[#FACC15]/60 hover:bg-[#FACC15]/10 active:scale-[0.98] disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FACC15]/15">
                  {bypassLoading === "manager" ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#FACC15] border-t-transparent" />
                  ) : (
                    <LayoutDashboard size={18} className="text-[#FACC15]" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#F5F5F5]">{t("managerRole")}</p>
                  <p className="text-xs text-[#6B6B7B]">{t("managerEmail")}</p>
                </div>
              </div>
            </button>

            {/* Customer bypass */}
            <button
              type="button"
              onClick={() => handleBypass("customer")}
              disabled={bypassLoading !== null}
              className="group relative w-full overflow-hidden rounded-xl border border-[#2A2A35] bg-[#1E1E26]/50 p-4 text-left transition-all hover:border-[#A0A0B0]/30 hover:bg-[#1E1E26] active:scale-[0.98] disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E1E26]">
                  {bypassLoading === "customer" ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#A0A0B0] border-t-transparent" />
                  ) : (
                    <User size={18} className="text-[#A0A0B0]" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#F5F5F5]">{t("customerRole")}</p>
                  <p className="text-xs text-[#6B6B7B]">{t("customerEmail")}</p>
                </div>
              </div>
            </button>

            {/* Staff bypass */}
            <button
              type="button"
              onClick={() => handleBypass("staff")}
              disabled={bypassLoading !== null}
              className="group relative w-full overflow-hidden rounded-xl border border-[#4ADE80]/30 bg-[#4ADE80]/5 p-4 text-left transition-all hover:border-[#4ADE80]/60 hover:bg-[#4ADE80]/10 active:scale-[0.98] disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4ADE80]/15">
                  {bypassLoading === "staff" ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#4ADE80] border-t-transparent" />
                  ) : (
                    <Heart size={18} className="text-[#4ADE80]" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#F5F5F5]">{t("staffRole")}</p>
                  <p className="text-xs text-[#6B6B7B]">{t("staffEmail")}</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] text-[#6B6B7B]">
          {t("demoDisclaimer")}
        </p>
      </div>
    </div>
  )
}
