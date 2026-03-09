"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Calendar, Star, Gift, Settings, HelpCircle,
  ChevronRight, LogOut, Shield, Bell, CreditCard, Languages,
  Stamp, Wallet, Activity, AlertTriangle, Gauge,
} from "lucide-react"
import { customers, formatPrice } from "@/lib/data/mock-data"
import { useBrand } from "@/lib/theme/theme-provider"
import { useAuth } from "@/lib/auth/auth-context"
import { useLanguage } from "@/lib/i18n/language-context"
import { useLoyalty } from "@/lib/data/loyalty-store"
import { useGiftCards } from "@/lib/data/giftcards-store"
import { usePromotions } from "@/lib/data/promotions-store"
import Image from "next/image"

export default function ProfilePage() {
  const { brandConfig } = useBrand()
  const { user, logout } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const router = useRouter()
  const { getStampCount, getPointsBalance } = useLoyalty()
  const { getGiftCardsForCustomer } = useGiftCards()
  const { getActivePromotionsForCustomer } = usePromotions()

  const customerData = customers.find((c) => c.id === user?.id) ?? customers[0]
  const stampCount = user ? getStampCount(user.id) : 0
  const pointsBalance = user ? getPointsBalance(user.id, customerData.totalSpent) : 0
  const myGiftCards = user ? getGiftCardsForCustomer(user.id) : []
  const giftCardBalance = myGiftCards.reduce((sum, gc) => sum + gc.currentBalance, 0)
  const activePromos = user ? getActivePromotionsForCustomer(user.id) : []

  function handleSignOut() {
    logout()
    router.replace("/login")
  }

  const menuSections = [
    {
      title: t("myAccount"),
      items: [
        { label: t("myBookingsMenu"), href: "/bookings", icon: Calendar, badge: "3" },
        { label: t("favourites"), href: "#", icon: Star },
        { label: t("promotionsRewards"), href: "/promotions", icon: Gift, badge: `${pointsBalance} pts` },
        { label: t("giftCards"), href: "/gift-cards", icon: Wallet, badge: giftCardBalance > 0 ? formatPrice(giftCardBalance) : undefined },
        { label: t("loyaltyProgram"), href: "/loyalty", icon: Stamp, badge: `${stampCount}/10` },
        { label: t("trialRotation"), href: "/trial", icon: Star },
      ],
    },
    {
      title: t("preferences"),
      items: [
        { label: t("notifications"), href: "#", icon: Bell },
        { label: t("paymentMethods"), href: "#", icon: CreditCard },
        { label: t("privacySecurity"), href: "#", icon: Shield },
      ],
    },
    {
      title: t("support"),
      items: [
        { label: t("helpCentre"), href: "#", icon: HelpCircle },
        { label: t("appSettings"), href: "#", icon: Settings },
      ],
    },
  ]

  return (
    <div className="px-5 pb-8 pt-12">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-brand-primary/30 bg-brand-bg-tertiary">
          {user?.avatar ? (
            <Image src={user.avatar} alt={user.name} fill className="object-cover" sizes="64px" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xl font-bold text-brand-text-primary">
              {user?.name?.charAt(0) ?? "?"}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-brand-text-primary">{user?.name ?? customerData.name}</h1>
          <p className="text-sm text-brand-text-secondary">{user?.email ?? customerData.email}</p>
          <p className="mt-0.5 text-xs text-brand-text-tertiary">
            {t("memberSince")} {new Date(customerData.memberSince).toLocaleDateString("en", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Membership Number */}
      {customerData && (
        <div className="mt-4 px-5">
          <div className="flex items-center gap-2 rounded-xl bg-brand-primary/10 px-4 py-2.5">
            <CreditCard size={16} className="text-brand-primary" />
            <span className="text-xs text-brand-text-secondary">{t("membershipNumber")}:</span>
            <span className="text-sm font-bold text-brand-primary">{customerData.membershipNumber}</span>
          </div>
        </div>
      )}

      {/* Active Promotions Banner */}
      {activePromos.length > 0 && (
        <Link href="/promotions/my" className="mx-5 mt-3 block">
          <div className="flex items-center gap-3 rounded-xl border border-brand-green/20 bg-brand-green/10 p-3">
            <Gift size={20} className="text-brand-green" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-brand-green">
                {activePromos.length} {t("activePromotions")}
              </p>
              <p className="text-xs text-brand-text-secondary">{t("viewAll")}</p>
            </div>
            <ChevronRight size={16} className="text-brand-green" />
          </div>
        </Link>
      )}

      {/* Stats */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-brand-border bg-card p-3 text-center">
          <p className="text-lg font-bold text-brand-primary">{customerData.totalBookings}</p>
          <p className="text-[10px] text-brand-text-tertiary">{t("bookingsLabel")}</p>
        </div>
        <div className="rounded-xl border border-brand-border bg-card p-3 text-center">
          <p className="text-lg font-bold text-brand-yellow">{pointsBalance}</p>
          <p className="text-[10px] text-brand-text-tertiary">{t("pointsLabel")}</p>
        </div>
        <div className="rounded-xl border border-brand-border bg-card p-3 text-center">
          <p className="text-lg font-bold text-brand-text-primary">{formatPrice(customerData.totalSpent)}</p>
          <p className="text-[10px] text-brand-text-tertiary">{t("spentLabel")}</p>
        </div>
      </div>

      {/* Loyalty Mini Card */}
      <Link href="/loyalty" className="mt-4 block rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-4 transition-colors hover:bg-brand-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/15">
              <Stamp size={18} className="text-brand-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-text-primary">{t("loyaltyProgram")}</p>
              <p className="text-xs text-brand-text-tertiary">{stampCount}/10 {t("stampsLabel")} &middot; {pointsBalance} {t("pointsLabel")}</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-brand-text-tertiary" />
        </div>
      </Link>

      {/* Massage Preferences */}
      <div className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">
          {t("massagePreferences")}
        </h2>
        <div className="rounded-2xl border border-brand-border bg-card p-4 space-y-4">
          {/* Pressure Preference */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Gauge size={14} className="text-brand-text-tertiary" />
              <p className="text-xs font-semibold text-brand-text-secondary">{t("pressureLevel")}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {([
                { key: "light" as const, label: t("pressureLight") },
                { key: "medium" as const, label: t("pressureMedium") },
                { key: "firm" as const, label: t("pressureFirm") },
                { key: "deep" as const, label: t("pressureDeep") },
              ]).map((p) => (
                <span
                  key={p.key}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    customerData.massagePreferences?.pressurePreference === p.key
                      ? "bg-brand-primary text-primary-foreground"
                      : "bg-brand-bg-tertiary text-brand-text-tertiary"
                  }`}
                >
                  {p.label}
                </span>
              ))}
            </div>
          </div>

          {/* Pain Areas */}
          {customerData.massagePreferences?.painAreas && customerData.massagePreferences.painAreas.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity size={14} className="text-brand-coral" />
                <p className="text-xs font-semibold text-brand-text-secondary">{t("painAreas")}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {customerData.massagePreferences.painAreas.map((area) => (
                  <span key={area} className="rounded-full bg-brand-coral/10 px-3 py-1 text-xs font-medium text-brand-coral">
                    {area.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Conditions */}
          {customerData.massagePreferences?.conditions && customerData.massagePreferences.conditions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-brand-yellow" />
                <p className="text-xs font-semibold text-brand-text-secondary">{t("healthConditions")}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {customerData.massagePreferences.conditions.map((cond) => (
                  <span key={cond} className="rounded-full bg-brand-yellow/10 px-3 py-1 text-xs font-medium text-brand-yellow">
                    {cond.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Injuries */}
          {customerData.massagePreferences?.injuries && customerData.massagePreferences.injuries.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-brand-coral" />
                <p className="text-xs font-semibold text-brand-text-secondary">{t("injuries")}</p>
              </div>
              <div className="flex flex-col gap-1">
                {customerData.massagePreferences.injuries.map((inj, i) => (
                  <p key={i} className="text-xs text-brand-text-secondary">&bull; {inj}</p>
                ))}
              </div>
            </div>
          )}

          {!customerData.massagePreferences && (
            <p className="text-xs text-brand-text-tertiary">{t("noPreferencesSet")}</p>
          )}
        </div>
      </div>

      {/* Language Setting */}
      <div className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">
          {t("language")}
        </h2>
        <div className="rounded-2xl border border-brand-border bg-card">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Languages size={18} className="text-brand-text-tertiary" />
            <span className="flex-1 text-sm text-brand-text-primary">{t("chooseLanguage")}</span>
            <div className="flex flex-wrap gap-1.5">
              {([
                { code: "en" as const, label: "EN" },
                { code: "th" as const, label: "TH" },
                { code: "ko" as const, label: "KO" },
                { code: "ja" as const, label: "JA" },
              ]).map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    language === lang.code
                      ? "bg-brand-primary text-primary-foreground"
                      : "border border-brand-border text-brand-text-secondary hover:bg-brand-bg-tertiary"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      {menuSections.map((section) => (
        <div key={section.title} className="mt-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">
            {section.title}
          </h2>
          <div className="rounded-2xl border border-brand-border bg-card">
            {section.items.map((item, idx) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-brand-bg-tertiary/50 ${
                  idx < section.items.length - 1 ? "border-b border-brand-border" : ""
                }`}
              >
                <item.icon size={18} className="text-brand-text-tertiary" />
                <span className="flex-1 text-sm text-brand-text-primary">{item.label}</span>
                {item.badge && (
                  <span className="rounded-full bg-brand-primary/15 px-2 py-0.5 text-[10px] font-semibold text-brand-primary">
                    {item.badge}
                  </span>
                )}
                <ChevronRight size={16} className="text-brand-text-tertiary" />
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Sign Out */}
      <button
        type="button"
        onClick={handleSignOut}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-border bg-card py-3.5 text-sm font-medium text-brand-coral transition-colors hover:bg-brand-coral/5"
      >
        <LogOut size={16} />
        {t("signOut")}
      </button>

      <p className="mt-4 text-center text-[10px] text-brand-text-tertiary">
        {brandConfig.shopName} {t("poweredBy")}
      </p>
    </div>
  )
}
