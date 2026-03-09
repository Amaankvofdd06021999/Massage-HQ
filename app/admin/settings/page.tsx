"use client"

import { useState, useCallback } from "react"
import { RotateCcw, Save, Eye, Palette, Type, Globe, Clock, Languages } from "lucide-react"
import { useBrand } from "@/lib/theme/theme-provider"
import { useLanguage } from "@/lib/i18n/language-context"
import { kokoBrandConfig } from "@/lib/theme/brand-config"
import type { BrandConfig } from "@/lib/types"
import { cn } from "@/lib/utils"

type SettingsTab = "colors" | "branding" | "operations" | "preview" | "language"

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (val: string) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-bg-tertiary/50 px-4 py-3">
      <span className="text-sm text-brand-text-secondary">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded-lg border border-brand-border bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-[90px] rounded-lg border border-brand-border bg-brand-bg-secondary px-2 py-1 text-xs font-mono text-brand-text-primary"
        />
      </div>
    </div>
  )
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
}) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-bg-tertiary/50 px-4 py-3">
      <label className="mb-1.5 block text-xs font-medium text-brand-text-tertiary">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-brand-border bg-brand-bg-secondary px-3 py-2 text-sm text-brand-text-primary placeholder:text-brand-text-tertiary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/30"
      />
    </div>
  )
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  label: string
  value: number
  onChange: (val: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-bg-tertiary/50 px-4 py-3">
      <span className="text-sm text-brand-text-secondary">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="range"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="w-24 accent-[var(--brand-primary)]"
        />
        <span className="w-14 text-right text-sm font-medium text-brand-text-primary">
          {value}{suffix}
        </span>
      </div>
    </div>
  )
}

function ColorsTab({ config, update }: { config: BrandConfig; update: (p: Partial<BrandConfig>) => void }) {
  const { t } = useLanguage()
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">{t("coreColors")}</h3>
      <ColorInput label={t("primaryColor")} value={config.primaryColor} onChange={(v) => update({ primaryColor: v })} />
      <ColorInput label={t("accentColor")} value={config.accentColor} onChange={(v) => update({ accentColor: v })} />
      <ColorInput label={t("greenColor")} value={config.accentGreen} onChange={(v) => update({ accentGreen: v })} />
      <ColorInput label={t("coralColor")} value={config.accentCoral} onChange={(v) => update({ accentCoral: v })} />
      <ColorInput label={t("yellowColor")} value={config.accentYellow} onChange={(v) => update({ accentYellow: v })} />
      <ColorInput label={t("blueColor")} value={config.accentBlue} onChange={(v) => update({ accentBlue: v })} />

      <h3 className="mt-3 text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">{t("backgrounds")}</h3>
      <ColorInput label={t("bgPrimary")} value={config.bgPrimary} onChange={(v) => update({ bgPrimary: v })} />
      <ColorInput label={t("bgSecondary")} value={config.bgSecondary} onChange={(v) => update({ bgSecondary: v })} />
      <ColorInput label={t("bgTertiary")} value={config.bgTertiary} onChange={(v) => update({ bgTertiary: v })} />

      <h3 className="mt-3 text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">{t("textBorders")}</h3>
      <ColorInput label={t("textPrimary")} value={config.textPrimary} onChange={(v) => update({ textPrimary: v })} />
      <ColorInput label={t("textSecondary")} value={config.textSecondary} onChange={(v) => update({ textSecondary: v })} />
      <ColorInput label={t("textTertiary")} value={config.textTertiary} onChange={(v) => update({ textTertiary: v })} />
      <ColorInput label={t("border")} value={config.borderColor} onChange={(v) => update({ borderColor: v })} />

      <h3 className="mt-3 text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">{t("shape")}</h3>
      <NumberInput label={t("borderRadius")} value={config.borderRadius} onChange={(v) => update({ borderRadius: v })} min={0} max={2} step={0.125} suffix="rem" />
    </div>
  )
}

function BrandingTab({ config, update }: { config: BrandConfig; update: (p: Partial<BrandConfig>) => void }) {
  const { t } = useLanguage()
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">{t("shopIdentity")}</h3>
      <TextInput label={t("shopName")} value={config.shopName} onChange={(v) => update({ shopName: v })} />
      <TextInput label={t("taglineLabel")} value={config.tagline} onChange={(v) => update({ tagline: v })} />
      <TextInput label={t("logoUrl")} value={config.logo} onChange={(v) => update({ logo: v })} placeholder="/logo.svg" />
      <TextInput label={t("logoIconUrl")} value={config.logoIcon} onChange={(v) => update({ logoIcon: v })} placeholder="/logo-icon.svg" />
      <TextInput label={t("fontFamily")} value={config.fontFamily} onChange={(v) => update({ fontFamily: v })} />

      <h3 className="mt-3 text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">{t("currency")}</h3>
      <TextInput label={t("currencyCode")} value={config.currency} onChange={(v) => update({ currency: v })} placeholder="THB" />
      <TextInput label={t("currencySymbol")} value={config.currencySymbol} onChange={(v) => update({ currencySymbol: v })} placeholder="฿" />

      <h3 className="mt-3 text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">{t("socialLinks")}</h3>
      {Object.entries(config.socialLinks).map(([key, val]) => (
        <TextInput
          key={key}
          label={key.charAt(0).toUpperCase() + key.slice(1)}
          value={val}
          onChange={(v) => update({ socialLinks: { ...config.socialLinks, [key]: v } })}
          placeholder={`https://${key}.com/...`}
        />
      ))}
    </div>
  )
}

function OperationsTab({ config, update }: { config: BrandConfig; update: (p: Partial<BrandConfig>) => void }) {
  const { t } = useLanguage()
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">{t("operatingHours")}</h3>
      <div className="grid grid-cols-2 gap-3">
        <TextInput
          label={t("openTime")}
          value={config.operatingHours.open}
          onChange={(v) => update({ operatingHours: { ...config.operatingHours, open: v } })}
          placeholder="10:00"
        />
        <TextInput
          label={t("closeTime")}
          value={config.operatingHours.close}
          onChange={(v) => update({ operatingHours: { ...config.operatingHours, close: v } })}
          placeholder="22:00"
        />
      </div>
    </div>
  )
}

function PreviewTab({ config }: { config: BrandConfig }) {
  const { t } = useLanguage()
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">{t("livePreview")}</h3>

      {/* Mini preview card */}
      <div className="overflow-hidden rounded-2xl border border-brand-border" style={{ background: config.bgPrimary }}>
        <div className="p-4" style={{ background: config.bgSecondary }}>
          <p className="text-lg font-bold" style={{ color: config.textPrimary }}>{config.shopName}</p>
          <p className="text-sm" style={{ color: config.textSecondary }}>{config.tagline}</p>
        </div>
        <div className="flex gap-2 p-4">
          <button
            type="button"
            className="rounded-full px-4 py-2 text-sm font-semibold"
            style={{ background: config.primaryColor, color: config.bgPrimary }}
          >
            {t("bookNow")}
          </button>
          <button
            type="button"
            className="rounded-full border px-4 py-2 text-sm font-medium"
            style={{ borderColor: config.borderColor, color: config.textSecondary }}
          >
            {t("viewStaff")}
          </button>
        </div>
        <div className="flex gap-3 border-t p-4" style={{ borderColor: config.borderColor }}>
          <div className="rounded-xl p-3" style={{ background: config.bgTertiary }}>
            <p className="text-xs" style={{ color: config.textTertiary }}>{t("rating")}</p>
            <p className="text-lg font-bold" style={{ color: config.accentYellow }}>4.9</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: config.bgTertiary }}>
            <p className="text-xs" style={{ color: config.textTertiary }}>{t("revenue")}</p>
            <p className="text-lg font-bold" style={{ color: config.accentGreen }}>{config.currencySymbol}6,600</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: config.bgTertiary }}>
            <p className="text-xs" style={{ color: config.textTertiary }}>{t("navPromotions")}</p>
            <p className="text-lg font-bold" style={{ color: config.accentCoral }}>20%</p>
          </div>
        </div>
        <div className="flex gap-2 px-4 pb-4">
          <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: `${config.primaryColor}22`, color: config.primaryColor }}>{t("massageThai")}</span>
          <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: `${config.accentBlue}22`, color: config.accentBlue }}>{t("massageSwedish")}</span>
          <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: `${config.accentCoral}22`, color: config.accentCoral }}>{t("popular")}</span>
        </div>
      </div>

      {/* Color Swatches */}
      <div>
        <p className="mb-2 text-xs font-medium text-brand-text-tertiary">{t("colorPalette")}</p>
        <div className="grid grid-cols-7 gap-2">
          {[
            { label: t("primaryColor"), color: config.primaryColor },
            { label: t("accentColor"), color: config.accentColor },
            { label: t("greenColor"), color: config.accentGreen },
            { label: t("coralColor"), color: config.accentCoral },
            { label: t("yellowColor"), color: config.accentYellow },
            { label: t("blueColor"), color: config.accentBlue },
            { label: t("border"), color: config.borderColor },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <div
                className="h-8 w-8 rounded-full border border-brand-border"
                style={{ background: s.color }}
              />
              <span className="text-[9px] text-brand-text-tertiary">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Config JSON */}
      <div>
        <p className="mb-2 text-xs font-medium text-brand-text-tertiary">{t("exportConfig")}</p>
        <pre className="max-h-48 overflow-auto rounded-xl border border-brand-border bg-brand-bg-tertiary p-3 text-[10px] text-brand-text-secondary">
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>
    </div>
  )
}

function LanguageTab() {
  const { t, language, setLanguage } = useLanguage()
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">{t("language")}</h3>
        <p className="mt-1 text-sm text-brand-text-secondary">{t("chooseLanguage")}</p>
      </div>
      <div className="rounded-2xl border border-brand-border bg-card p-5">
        <div className="flex items-center gap-3">
          <Languages size={20} className="text-brand-text-tertiary" />
          <span className="flex-1 text-sm font-medium text-brand-text-primary">{t("chooseLanguage")}</span>
          <div className="flex flex-wrap gap-2">
            {([
              { code: "en" as const, label: t("english") },
              { code: "th" as const, label: t("thai") },
              { code: "ko" as const, label: t("korean") },
              { code: "ja" as const, label: t("japanese") },
            ]).map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
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
  )
}

export default function AdminSettingsPage() {
  const { brandConfig, updateBrandConfig, resetBrandConfig } = useBrand()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<SettingsTab>("colors")
  const [saved, setSaved] = useState(false)

  const handleSave = useCallback(() => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [])

  const hasChanges = JSON.stringify(brandConfig) !== JSON.stringify(kokoBrandConfig)

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: "colors",     label: t("colorsTab"),     icon: Palette },
    { id: "branding",   label: t("brandingTab"),   icon: Type },
    { id: "operations", label: t("operationsTab"), icon: Clock },
    { id: "preview",    label: t("previewTab"),    icon: Eye },
    { id: "language",   label: t("language"),      icon: Languages },
  ]

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-text-primary">{t("brandSettings")}</h1>
          <p className="mt-1 text-sm text-brand-text-secondary">
            {t("brandSettingsDesc")}
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <button
              type="button"
              onClick={resetBrandConfig}
              className="flex items-center gap-2 rounded-xl border border-brand-border px-4 py-2.5 text-sm font-medium text-brand-text-secondary hover:bg-brand-bg-tertiary"
            >
              <RotateCcw size={14} />
              {t("reset")}
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
              saved
                ? "bg-brand-green/20 text-brand-green"
                : "bg-primary text-primary-foreground active:scale-95"
            )}
          >
            <Save size={14} />
            {saved ? t("saved") : t("saveChanges")}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-5 flex gap-1 rounded-xl border border-brand-border bg-brand-bg-secondary p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-brand-bg-tertiary text-brand-primary"
                  : "text-brand-text-tertiary hover:text-brand-text-secondary"
              )}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-5 page-transition">
        {activeTab === "colors" && <ColorsTab config={brandConfig} update={updateBrandConfig} />}
        {activeTab === "branding" && <BrandingTab config={brandConfig} update={updateBrandConfig} />}
        {activeTab === "operations" && <OperationsTab config={brandConfig} update={updateBrandConfig} />}
        {activeTab === "preview" && <PreviewTab config={brandConfig} />}
        {activeTab === "language" && <LanguageTab />}
      </div>
    </div>
  )
}
