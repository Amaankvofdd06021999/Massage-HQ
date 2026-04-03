"use client"

import { useState, useRef, useEffect } from "react"
import { Search } from "lucide-react"
import { Customer } from "@/lib/types"
import { useCustomers } from "@/lib/data/customers-store"
import { useLanguage } from "@/lib/i18n/language-context"

interface CustomerSearchProps {
  onSelect: (customer: Customer) => void
  onNewClick: () => void
}

export function CustomerSearch({ onSelect, onNewClick }: CustomerSearchProps) {
  const { t } = useLanguage()
  const { searchCustomers } = useCustomers()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Customer[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim().length > 0) {
      setResults(searchCustomers(query))
      setIsOpen(true)
    } else {
      setResults([])
      setIsOpen(false)
    }
  }, [query, searchCustomers])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function handleSelect(customer: Customer) {
    onSelect(customer)
    setQuery("")
    setIsOpen(false)
  }

  return (
    <div className="flex gap-2" ref={containerRef}>
      <div className="flex-1 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("phoneBookingSearchPlaceholder")}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-brand-border bg-brand-bg-secondary text-brand-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        {/* Results dropdown */}
        {isOpen && results.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-brand-border bg-brand-bg-secondary shadow-lg overflow-hidden">
            {results.map((customer) => (
              <button
                key={customer.id}
                onClick={() => handleSelect(customer)}
                className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-brand-bg-primary transition-colors text-left border-b border-brand-border last:border-b-0"
              >
                <div className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center text-white text-sm font-medium shrink-0">
                  {customer.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-brand-text-primary truncate">{customer.name}</div>
                  <div className="text-xs text-brand-text-secondary">
                    {customer.membershipNumber} · {customer.phone.slice(0, -4)}**** · {customer.totalBookings} {t("phoneBookingVisits").toLowerCase()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {isOpen && query.trim().length > 0 && results.length === 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-brand-border bg-brand-bg-secondary shadow-lg p-3 text-sm text-brand-text-secondary">
            {t("phoneBookingNoResults")} "{query}"
          </div>
        )}
      </div>

      <button
        onClick={onNewClick}
        className="px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors whitespace-nowrap"
      >
        + {t("phoneBookingNewCustomer")}
      </button>
    </div>
  )
}
