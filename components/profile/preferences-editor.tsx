"use client"

import { useState } from "react"
import {
  Gauge, Activity, AlertTriangle, Pencil, Plus, X,
} from "lucide-react"
import { ALL_PAIN_AREAS, ALL_CONDITIONS } from "@/lib/constants"
import type { Customer, PressurePreference, PainArea, HealthCondition } from "@/lib/types"
import type { TranslationKey } from "@/lib/i18n/translations"

interface PreferencesEditorProps {
  customerData: Customer
  t: (key: TranslationKey) => string
}

export default function PreferencesEditor({ customerData, t }: PreferencesEditorProps) {
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

  return (
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
  )
}
