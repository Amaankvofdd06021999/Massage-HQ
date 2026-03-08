"use client"

import { useState, useEffect } from "react"
import { Heart, Stamp, Coins, Settings2, Save } from "lucide-react"
import { useLoyalty } from "@/lib/data/loyalty-store"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"
import type { MassageType } from "@/lib/types"

const ALL_SERVICES: { value: MassageType; label: string }[] = [
  { value: "thai", label: "Thai" },
  { value: "swedish", label: "Swedish" },
  { value: "deep-tissue", label: "Deep Tissue" },
  { value: "aromatherapy", label: "Aromatherapy" },
  { value: "hot-stone", label: "Hot Stone" },
  { value: "sports", label: "Sports" },
  { value: "reflexology", label: "Reflexology" },
  { value: "shiatsu", label: "Shiatsu" },
  { value: "foot", label: "Foot" },
]

export default function AdminLoyaltyPage() {
  const { t } = useLanguage()
  const { config, updateConfig } = useLoyalty()

  const [localConfig, setLocalConfig] = useState(config)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  const handleSave = () => {
    updateConfig(localConfig)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleService = (service: MassageType, field: "eligibleStampServices" | "freeSessionServices") => {
    const current = localConfig[field]
    const updated = current.includes(service)
      ? current.filter((s) => s !== service)
      : [...current, service]
    setLocalConfig({ ...localConfig, [field]: updated })
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-text-primary">{t("loyaltySettings")}</h1>
          <p className="mt-1 text-sm text-brand-text-secondary">Configure your loyalty program</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
            saved
              ? "bg-brand-green/15 text-brand-green"
              : "bg-brand-primary text-brand-primary-foreground hover:opacity-90"
          )}
        >
          <Save size={16} />
          {saved ? "Saved!" : t("save")}
        </button>
      </div>

      {/* Master Toggle */}
      <div className="mt-6 rounded-2xl border border-brand-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-coral/15">
              <Heart size={20} className="text-brand-coral" />
            </div>
            <div>
              <p className="font-semibold text-brand-text-primary">{t("loyaltyMasterToggle")}</p>
              <p className="text-sm text-brand-text-secondary">Enable or disable the entire loyalty program</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLocalConfig({ ...localConfig, programActive: !localConfig.programActive })}
            className={cn(
              "relative h-7 w-12 rounded-full transition-colors",
              localConfig.programActive ? "bg-brand-green" : "bg-brand-border"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform",
                localConfig.programActive ? "translate-x-5" : "translate-x-0.5"
              )}
            />
          </button>
        </div>
      </div>

      {localConfig.programActive && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {/* Stamp Program */}
          <div className="rounded-2xl border border-brand-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-yellow/15">
                  <Stamp size={20} className="text-brand-yellow" />
                </div>
                <div>
                  <p className="font-semibold text-brand-text-primary">{t("enableStamps")}</p>
                  <p className="text-xs text-brand-text-secondary">Earn stamps per visit</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLocalConfig({ ...localConfig, stampEnabled: !localConfig.stampEnabled })}
                className={cn(
                  "relative h-7 w-12 rounded-full transition-colors",
                  localConfig.stampEnabled ? "bg-brand-green" : "bg-brand-border"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform",
                    localConfig.stampEnabled ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>

            {localConfig.stampEnabled && (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-brand-text-secondary">{t("stampsForFree")}</label>
                  <input
                    type="number"
                    value={localConfig.stampsForFreeSession}
                    onChange={(e) => setLocalConfig({ ...localConfig, stampsForFreeSession: parseInt(e.target.value) || 10 })}
                    className="mt-1 w-full rounded-xl border border-brand-border bg-brand-bg-secondary px-3 py-2 text-sm text-brand-text-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-brand-text-secondary">{t("maxFreeDuration")} (min)</label>
                  <input
                    type="number"
                    value={localConfig.freeSessionMaxDuration}
                    onChange={(e) => setLocalConfig({ ...localConfig, freeSessionMaxDuration: parseInt(e.target.value) || 90 })}
                    className="mt-1 w-full rounded-xl border border-brand-border bg-brand-bg-secondary px-3 py-2 text-sm text-brand-text-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-brand-text-secondary">{t("eligibleServices")}</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ALL_SERVICES.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => toggleService(s.value, "eligibleStampServices")}
                        className={cn(
                          "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                          localConfig.eligibleStampServices.includes(s.value)
                            ? "bg-brand-primary/15 text-brand-primary"
                            : "bg-brand-bg-secondary text-brand-text-tertiary"
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Points Program */}
          <div className="rounded-2xl border border-brand-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/15">
                  <Coins size={20} className="text-brand-blue" />
                </div>
                <div>
                  <p className="font-semibold text-brand-text-primary">{t("enablePoints")}</p>
                  <p className="text-xs text-brand-text-secondary">Earn points based on spending</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLocalConfig({ ...localConfig, pointsEnabled: !localConfig.pointsEnabled })}
                className={cn(
                  "relative h-7 w-12 rounded-full transition-colors",
                  localConfig.pointsEnabled ? "bg-brand-green" : "bg-brand-border"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform",
                    localConfig.pointsEnabled ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>

            {localConfig.pointsEnabled && (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-brand-text-secondary">{t("pointsPerUnit")}</label>
                  <input
                    type="number"
                    value={localConfig.pointsPerSpend}
                    onChange={(e) => setLocalConfig({ ...localConfig, pointsPerSpend: parseInt(e.target.value) || 1 })}
                    className="mt-1 w-full rounded-xl border border-brand-border bg-brand-bg-secondary px-3 py-2 text-sm text-brand-text-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-brand-text-secondary">{t("spendUnitAmount")} (baht)</label>
                  <input
                    type="number"
                    value={localConfig.spendUnit}
                    onChange={(e) => setLocalConfig({ ...localConfig, spendUnit: parseInt(e.target.value) || 100 })}
                    className="mt-1 w-full rounded-xl border border-brand-border bg-brand-bg-secondary px-3 py-2 text-sm text-brand-text-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-brand-text-secondary">{t("minRedemption")}</label>
                  <input
                    type="number"
                    value={localConfig.minRedemptionPoints}
                    onChange={(e) => setLocalConfig({ ...localConfig, minRedemptionPoints: parseInt(e.target.value) || 50 })}
                    className="mt-1 w-full rounded-xl border border-brand-border bg-brand-bg-secondary px-3 py-2 text-sm text-brand-text-primary"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!localConfig.programActive && (
        <div className="mt-6 rounded-2xl border border-dashed border-brand-border bg-brand-bg-secondary p-8 text-center">
          <Settings2 size={32} className="mx-auto text-brand-text-tertiary" />
          <p className="mt-3 text-sm text-brand-text-secondary">{t("loyaltyDisabled")}</p>
          <p className="mt-1 text-xs text-brand-text-tertiary">Toggle the switch above to enable</p>
        </div>
      )}
    </div>
  )
}
