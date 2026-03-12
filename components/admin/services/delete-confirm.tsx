"use client"

import { useLanguage } from "@/lib/i18n/language-context"

// ─── Delete Confirm ───────────────────────────────────────────────────────────

export function DeleteConfirm({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  const { t } = useLanguage()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl border border-brand-border bg-brand-bg-secondary p-5 shadow-2xl">
        <h3 className="text-base font-semibold text-brand-text-primary">{t("deleteConfirmTitle")} "{name}"?</h3>
        <p className="mt-1 text-sm text-brand-text-secondary">{t("deleteConfirmDesc")}</p>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-brand-border py-2.5 text-sm font-medium text-brand-text-secondary hover:bg-brand-bg-tertiary transition-colors">{t("cancel")}</button>
          <button type="button" onClick={onConfirm} className="flex-1 rounded-xl bg-destructive py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity">{t("delete")}</button>
        </div>
      </div>
    </div>
  )
}
