"use client"

import { useState } from "react"
import { SearchBar } from "@/components/shared/search-bar"
import { StatusBadge } from "@/components/shared/status-badge"
import { ClientNotesPanel } from "@/components/admin/client-notes-panel"
import { customers, formatPrice } from "@/lib/data/mock-data"
import { useLanguage } from "@/lib/i18n/language-context"
import { StickyNote } from "lucide-react"
import type { Customer } from "@/lib/types"

export default function AdminCustomersPage() {
  const { t } = useLanguage()
  const [search, setSearch] = useState("")
  const [notesCustomer, setNotesCustomer] = useState<Customer | null>(null)

  const filtered = search
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())
      )
    : customers

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text-primary">{t("customers")}</h1>
      <p className="mt-1 text-sm text-brand-text-secondary">{customers.length} {t("registeredCustomers")}</p>

      <SearchBar value={search} onChange={setSearch} placeholder={t("searchCustomers")} className="mt-4" />

      <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((customer) => (
          <div key={customer.id} className="rounded-2xl border border-brand-border bg-card p-5">
            <div className="flex items-center gap-3">
              <img
                src={customer.avatar}
                alt={customer.name}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-brand-border"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brand-text-primary">{customer.name}</p>
                <p className="text-xs text-brand-text-tertiary">{customer.email}</p>
              </div>
              {customer.trialActive && <StatusBadge variant="active" dot>{t("trialBadge")}</StatusBadge>}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-brand-bg-tertiary/50 p-2 text-center">
                <p className="text-sm font-bold text-brand-text-primary">{customer.totalBookings}</p>
                <p className="text-[10px] text-brand-text-tertiary">{t("bookingsLabel")}</p>
              </div>
              <div className="rounded-lg bg-brand-bg-tertiary/50 p-2 text-center">
                <p className="text-sm font-bold text-brand-primary">{formatPrice(customer.totalSpent)}</p>
                <p className="text-[10px] text-brand-text-tertiary">{t("spentLabel")}</p>
              </div>
              <div className="rounded-lg bg-brand-bg-tertiary/50 p-2 text-center">
                <p className="text-sm font-bold text-brand-yellow">{customer.loyaltyPoints}</p>
                <p className="text-[10px] text-brand-text-tertiary">{t("pointsLabel")}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-brand-text-tertiary">
                {t("memberSince")} {new Date(customer.memberSince).toLocaleDateString("en", { month: "short", year: "numeric" })}
                {" / "}{customer.phone}
              </span>
              <button
                type="button"
                onClick={() => setNotesCustomer(customer)}
                className="flex items-center gap-1.5 rounded-lg border border-brand-border px-2.5 py-1.5 text-xs font-medium text-brand-text-secondary transition-colors hover:bg-brand-bg-tertiary hover:text-brand-text-primary"
              >
                <StickyNote size={13} />
                {t("clientNotes")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Notes Panel */}
      {notesCustomer && (
        <ClientNotesPanel
          customerId={notesCustomer.id}
          customerName={notesCustomer.name}
          open={!!notesCustomer}
          onOpenChange={(open) => !open && setNotesCustomer(null)}
        />
      )}
    </div>
  )
}
