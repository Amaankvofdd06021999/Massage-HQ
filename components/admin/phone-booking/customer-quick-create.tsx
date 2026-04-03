"use client"

import { useState } from "react"
import { Customer } from "@/lib/types"
import { useCustomers } from "@/lib/data/customers-store"
import { useLanguage } from "@/lib/i18n/language-context"

interface CustomerQuickCreateProps {
  onCreated: (customer: Customer) => void
  onCancel: () => void
}

export function CustomerQuickCreate({ onCreated, onCancel }: CustomerQuickCreateProps) {
  const { t } = useLanguage()
  const { createCustomer } = useCustomers()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [showEmail, setShowEmail] = useState(false)
  const [email, setEmail] = useState("")

  function handleSubmit() {
    if (!name.trim() || !phone.trim()) return
    const customer = createCustomer(name.trim(), phone.trim(), email.trim() || undefined)
    onCreated(customer)
  }

  return (
    <div className="rounded-xl border border-brand-border bg-brand-bg-secondary p-4">
      <div className="text-sm font-semibold text-brand-text-primary mb-3">
        {t("phoneBookingNewCustomer")}
      </div>

      <div className="flex gap-3 mb-3">
        <div className="flex-1">
          <label className="text-xs text-brand-text-secondary uppercase mb-1 block">
            {t("phoneBookingNameRequired")} *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("phoneBookingNameRequired")}
            className="w-full px-3 py-2 rounded-lg border border-brand-border bg-brand-bg-primary text-brand-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            autoFocus
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-brand-text-secondary uppercase mb-1 block">
            {t("phoneBookingPhoneRequired")} *
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("phoneBookingPhoneRequired")}
            className="w-full px-3 py-2 rounded-lg border border-brand-border bg-brand-bg-primary text-brand-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>

      {showEmail && (
        <div className="mb-3">
          <label className="text-xs text-brand-text-secondary uppercase mb-1 block">
            {t("phoneBookingEmailOptional")}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="w-full px-3 py-2 rounded-lg border border-brand-border bg-brand-bg-primary text-brand-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        {!showEmail && (
          <button
            onClick={() => setShowEmail(true)}
            className="text-xs text-brand-text-secondary hover:text-brand-text-primary transition-colors"
          >
            {t("phoneBookingAddEmail")}
          </button>
        )}
        <div className="ml-auto flex gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-brand-text-secondary hover:text-brand-text-primary transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !phone.trim()}
            className="px-4 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("phoneBookingCreateAndContinue")}
          </button>
        </div>
      </div>

      <div className="mt-2 text-xs text-brand-text-secondary italic">
        A membership number will be auto-generated. Full profile can be completed later.
      </div>
    </div>
  )
}
