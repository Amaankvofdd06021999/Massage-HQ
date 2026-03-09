"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Calendar, Star, Gift, Settings, HelpCircle,
  ChevronRight, LogOut, Shield, Bell, CreditCard, Languages,
  Stamp, Wallet, Activity, AlertTriangle, Gauge, Pencil, Plus, X,
} from "lucide-react"
import { customers, formatPrice } from "@/lib/data/mock-data"
import { useBrand } from "@/lib/theme/theme-provider"
import { useAuth } from "@/lib/auth/auth-context"
import { useLanguage } from "@/lib/i18n/language-context"
import { useLoyalty } from "@/lib/data/loyalty-store"
import { useGiftCards } from "@/lib/data/giftcards-store"
import { usePromotions } from "@/lib/data/promotions-store"
import Image from "next/image"
import type { PressurePreference, PainArea, HealthCondition } from "@/lib/types"

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

  const ALL_PAIN_AREAS: PainArea[] = ["neck", "shoulders", "upper-back", "lower-back", "arms", "hands", "hips", "legs", "knees", "feet"]
  const ALL_CONDITIONS: HealthCondition[] = ["office-syndrome", "sports-injury", "chronic-pain", "stress-anxiety", "insomnia", "poor-circulation", "muscle-tension", "post-surgery", "pregnancy"]

  const [isEditingPrefs, setIsEditingPrefs] = useState(false)
  const [editPressure, setEditPressure] = useState<PressurePreference>(customerData.massagePreferences?.pressurePreference ?? "medium")
  const [editPainAreas, setEditPainAreas] = useState<PainArea[]>(customerData.massagePreferences?.painAreas ?? [])
  const [editConditions, setEditConditions] = useState<HealthCondition[]>(customerData.massagePreferences?.conditions ?? [])
  const [editInjuries, setEditInjuries] = useState<string[]>(customerData.massagePreferences?.injuries ?? [])
  const [newInjury, setNewInjury] = useState("")

  function startEditPrefs() {
    setEditPressure(customerData.massagePreferences?.pressurePreference ?? "medium")
    setEditPainAreas([...(customerData.massagePreferences?.painAreas ?? [])])
    setEditConditions([...(customerData.massagePreferences?.conditions ?? [])])
    setEditInjuries([...(customerData.massagePreferences?.injuries ?? [])])
    setNewInjury("")
    setIsEditingPrefs(true)
  }

  function handleSavePrefs() {
    customerData.massagePreferences = {
      pressurePreference: editPressure,
      painAreas: editPainAreas,
      conditions: editConditions,
      injuries: editInjuries.filter((i) => i.trim()),
    }
    setIsEditingPrefs(false)
  }

  function togglePainArea(area: PainArea) {
    setEditPainAreas((prev) => prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area])
  }

  function toggleCondition(cond: HealthCondition) {
    setEditConditions((prev) => prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond])
  }

  function addInjury() {
    if (newInjury.trim()) {
      setEditInjuries((prev) => [...prev, newInjury.trim()])
      setNewInjury("")
    }
  }

  function removeInjury(index: number) {
    setEditInjuries((prev) => prev.filter((_, i) => i !== index))
  }

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
    <div className="px-5 pb-24 pt-12">
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
        <div className="mt-4">
          <div className="flex items-center gap-2 rounded-xl bg-brand-primary/10 px-4 py-2.5">
            <CreditCard size={16} className="text-brand-primary" />
            <span className="text-xs text-brand-text-secondary">{t("membershipNumber")}:</span>
            <span className="text-sm font-bold text-brand-primary">{customerData.membershipNumber}</span>
          </div>
        </div>
      )}

      {/* Active Promotions Banner */}
      {activePromos.length > 0 && (
        <Link href="/promotions/my" className="mt-3 block">
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
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">
            {t("massagePreferences")}
          </h2>
          {!isEditingPrefs && (
            <button type="button" onClick={startEditPrefs} className="flex items-center gap-1 text-xs text-brand-primary font-medium">
              <Pencil size={12} />
              {t("edit")}
            </button>
          )}
        </div>
        <div className="rounded-2xl border border-brand-border bg-card p-4 space-y-4">
          {isEditingPrefs ? (
            <>
              {/* Edit: Pressure */}
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
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setEditPressure(p.key)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        editPressure === p.key
                          ? "bg-brand-primary text-primary-foreground"
                          : "bg-brand-bg-tertiary text-brand-text-tertiary hover:bg-brand-border"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit: Pain Areas */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={14} className="text-brand-coral" />
                  <p className="text-xs font-semibold text-brand-text-secondary">{t("painAreas")}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_PAIN_AREAS.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => togglePainArea(area)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        editPainAreas.includes(area)
                          ? "bg-brand-coral/15 text-brand-coral"
                          : "bg-brand-bg-tertiary text-brand-text-tertiary hover:bg-brand-border"
                      }`}
                    >
                      {area.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit: Conditions */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} className="text-brand-yellow" />
                  <p className="text-xs font-semibold text-brand-text-secondary">{t("healthConditions")}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_CONDITIONS.map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => toggleCondition(cond)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        editConditions.includes(cond)
                          ? "bg-brand-yellow/15 text-brand-yellow"
                          : "bg-brand-bg-tertiary text-brand-text-tertiary hover:bg-brand-border"
                      }`}
                    >
                      {cond.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit: Injuries */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} className="text-brand-coral" />
                  <p className="text-xs font-semibold text-brand-text-secondary">{t("injuries")}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  {editInjuries.map((inj, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <p className="flex-1 text-xs text-brand-text-secondary">&bull; {inj}</p>
                      <button type="button" onClick={() => removeInjury(i)} className="text-brand-text-tertiary hover:text-brand-coral">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={newInjury}
                      onChange={(e) => setNewInjury(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") addInjury() }}
                      placeholder={t("addInjuryPlaceholder")}
                      className="flex-1 rounded-lg border border-brand-border bg-brand-bg-tertiary/30 px-3 py-1.5 text-xs text-brand-text-primary placeholder:text-brand-text-tertiary focus:border-brand-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addInjury}
                      disabled={!newInjury.trim()}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary/15 text-brand-primary disabled:opacity-40"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Save/Cancel */}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsEditingPrefs(false)} className="flex-1 rounded-xl border border-brand-border py-2.5 text-xs font-semibold text-brand-text-secondary">
                  {t("cancel")}
                </button>
                <button type="button" onClick={handleSavePrefs} className="flex-1 rounded-xl bg-brand-primary py-2.5 text-xs font-semibold text-primary-foreground">
                  {t("save")}
                </button>
              </div>
            </>
          ) : (
            <>
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
            </>
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
