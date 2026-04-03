"use client"

import { useLanguage } from "@/lib/i18n/language-context"
import { formatPrice } from "@/lib/utils/formatters"
import { ServiceAddOn } from "@/lib/types"
import { SessionData } from "./session-card"

interface BookingSummaryProps {
  sessions: SessionData[]
  addOns: ServiceAddOn[]
  callNotes: string
  onCallNotesChange: (notes: string) => void
  onOpenNotesPanel: () => void
  onConfirm: () => void
  isConfirming: boolean
}

export function BookingSummary({
  sessions,
  addOns,
  callNotes,
  onCallNotesChange,
  onOpenNotesPanel,
  onConfirm,
  isConfirming,
}: BookingSummaryProps) {
  const { t } = useLanguage()

  // Calculate totals
  const sessionTotals = sessions.map(session => {
    const addOnTotal = session.addOnIds.reduce((sum, id) => {
      const addon = addOns.find(a => a.id === id)
      return sum + (addon?.price || 0)
    }, 0)
    const guestsTotal = session.guests.reduce((sum, g) => sum + g.price, 0)
    return session.price + addOnTotal + guestsTotal
  })
  const grandTotal = sessionTotals.reduce((sum, t) => sum + t, 0)
  const totalBookingCount = sessions.reduce((count, s) => count + 1 + s.guests.length, 0)

  const allComplete = sessions.every(s => s.serviceId && s.date && s.staffId && s.time)

  return (
    <div>
      {/* Call notes */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-brand-text-secondary uppercase">{t("phoneBookingCallNotes")}</label>
          <button onClick={onOpenNotesPanel} className="text-xs text-brand-primary hover:underline">
            📋 {t("phoneBookingOpenFullNotes")}
          </button>
        </div>
        <textarea
          value={callNotes}
          onChange={(e) => onCallNotesChange(e.target.value)}
          placeholder={t("phoneBookingCallNotes") + "..."}
          className="w-full px-3 py-2.5 rounded-lg border border-brand-border bg-brand-bg-secondary text-brand-text-primary text-sm min-h-[60px] resize-y focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        <div className="text-[11px] text-brand-text-secondary mt-1">{t("phoneBookingCallNotesHint")}</div>
      </div>

      {/* Summary card */}
      <div className="rounded-xl border border-brand-border bg-brand-bg-secondary overflow-hidden">
        <div className="px-4 py-3 border-b border-brand-border">
          <div className="text-sm font-semibold text-brand-text-primary">{t("phoneBookingSummary")}</div>
        </div>

        {sessions.map((session, i) => (
          <div key={session.id} className="px-4 py-2.5 border-b border-brand-border">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-brand-text-primary">
                  {t("phoneBookingSession")} {i + 1} · {session.date} · {session.time}
                  {session.guests.length > 0 && (
                    <span className="bg-purple-500/15 text-purple-400 px-1.5 py-0.5 rounded-full text-[10px] ml-2">
                      {t("phoneBookingGroup")} × {1 + session.guests.length}
                    </span>
                  )}
                </div>
                <div className="text-xs text-brand-text-secondary mt-1">
                  {session.staffName ? `${session.staffName}` : ""} — {session.serviceName} {session.duration}min
                  {session.guests.map((g, j) => (
                    <span key={g.id}><br />{g.name} — {g.serviceName} {g.duration}min</span>
                  ))}
                </div>
              </div>
              <div className="text-sm font-semibold text-brand-text-primary whitespace-nowrap">
                {formatPrice(sessionTotals[i])}
              </div>
            </div>
          </div>
        ))}

        {/* Total + confirm */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-brand-text-primary">{t("phoneBookingTotal")}: {formatPrice(grandTotal)}</div>
            <div className="text-xs text-brand-text-secondary">
              {sessions.length} {sessions.length === 1 ? "session" : "sessions"} · {totalBookingCount} {totalBookingCount === 1 ? "booking" : "bookings"} · {t("phoneBookingPayAtArrival")}
            </div>
          </div>
          <button
            onClick={onConfirm}
            disabled={!allComplete || isConfirming}
            className="px-8 py-3 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("phoneBookingConfirmAll")}
          </button>
        </div>
      </div>
    </div>
  )
}
