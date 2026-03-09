"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Users, Calendar, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/auth-context"
import { useBookings } from "@/lib/data/bookings-store"
import { useLanguage } from "@/lib/i18n/language-context"
import { customers, formatMassageType } from "@/lib/data/mock-data"
import { SearchBar } from "@/components/shared/search-bar"

export default function StaffClientsPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { getBookingsForStaff } = useBookings()
  const router = useRouter()
  const [search, setSearch] = useState("")

  const staffBookings = useMemo(
    () => (user ? getBookingsForStaff(user.id) : []),
    [user, getBookingsForStaff]
  )

  const clientData = useMemo(() => {
    const clientMap = new Map<
      string,
      {
        customerId: string
        bookingCount: number
        lastVisit: string
        services: Set<string>
      }
    >()

    for (const booking of staffBookings) {
      const existing = clientMap.get(booking.customerId)
      if (existing) {
        existing.bookingCount += 1
        if (booking.date > existing.lastVisit) {
          existing.lastVisit = booking.date
        }
        existing.services.add(booking.serviceType)
      } else {
        clientMap.set(booking.customerId, {
          customerId: booking.customerId,
          bookingCount: 1,
          lastVisit: booking.date,
          services: new Set([booking.serviceType]),
        })
      }
    }

    return Array.from(clientMap.values())
      .map((data) => {
        const customer = customers.find((c) => c.id === data.customerId)
        return customer
          ? {
              ...customer,
              bookingCountWithStaff: data.bookingCount,
              lastVisitDate: data.lastVisit,
              servicesUsed: Array.from(data.services),
            }
          : null
      })
      .filter(Boolean)
      .sort((a, b) => b!.lastVisitDate.localeCompare(a!.lastVisitDate)) as Array<
      (typeof customers)[0] & {
        bookingCountWithStaff: number
        lastVisitDate: string
        servicesUsed: string[]
      }
    >
  }, [staffBookings])

  const filteredClients = useMemo(
    () =>
      search
        ? clientData.filter((c) =>
            c.name.toLowerCase().includes(search.toLowerCase())
          )
        : clientData,
    [clientData, search]
  )

  return (
    <div className="px-5 pb-24 pt-12">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/15">
          <Users size={20} className="text-brand-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-brand-text-primary">My Clients</h1>
          <p className="text-sm text-brand-text-secondary">
            {clientData.length} client{clientData.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mt-5">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search clients..."
        />
      </div>

      {/* Client List */}
      <div className="mt-4 space-y-3">
        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-border bg-card/50 py-12">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-bg-tertiary">
              <Users size={24} className="text-brand-text-tertiary" />
            </div>
            <p className="text-sm font-medium text-brand-text-secondary">
              {search ? "No clients found" : "No clients yet"}
            </p>
            <p className="mt-1 text-xs text-brand-text-tertiary">
              {search
                ? "Try a different search term"
                : "Clients you serve will appear here"}
            </p>
          </div>
        ) : (
          filteredClients.map((client) => (
            <button
              key={client.id}
              type="button"
              onClick={() => router.push(`/staff/clients/${client.id}`)}
              className="flex w-full items-center gap-4 rounded-2xl border border-brand-border bg-card p-4 text-left transition-all card-press"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-brand-border">
                <img
                  src={client.avatar}
                  alt={client.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brand-text-primary">{client.name}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-brand-text-tertiary">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {client.bookingCountWithStaff} booking{client.bookingCountWithStaff !== 1 ? "s" : ""}
                  </span>
                  <span>
                    Last: {new Date(client.lastVisitDate).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {client.servicesUsed.slice(0, 3).map((service) => (
                    <span
                      key={service}
                      className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-medium text-brand-primary"
                    >
                      {formatMassageType(service)}
                    </span>
                  ))}
                  {client.servicesUsed.length > 3 && (
                    <span className="rounded-full bg-brand-bg-tertiary px-2 py-0.5 text-[10px] font-medium text-brand-text-tertiary">
                      +{client.servicesUsed.length - 3}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight size={18} className="text-brand-text-tertiary" />
            </button>
          ))
        )}
      </div>
    </div>
  )
}
