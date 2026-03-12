"use client"

import { STATUS_STYLES } from "@/lib/constants"
import { toDateStr } from "@/lib/utils/time"
import { cn } from "@/lib/utils"
import type { Booking } from "@/lib/types"
import type { TranslationKey } from "@/lib/i18n/translations"

const shortDayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

interface WeekViewProps {
  weekDays: Date[]
  weekBookingsMap: Record<string, Booking[]>
  todayStr: string
  goToDay: (date: Date) => void
  t: (key: TranslationKey) => string
}

export function WeekView({ weekDays, weekBookingsMap, todayStr, goToDay, t }: WeekViewProps) {
  return (
    <div className="mt-5 overflow-x-auto rounded-2xl border border-brand-border">
      <div className="min-w-[800px]">
        {/* Week header row */}
        <div className="grid grid-cols-7 border-b border-brand-border bg-card">
          {weekDays.map((d, i) => {
            const ds = toDateStr(d)
            const isToday = ds === todayStr
            return (
              <button
                type="button"
                key={ds}
                onClick={() => goToDay(d)}
                className={cn(
                  "border-r border-brand-border p-3 text-center last:border-r-0 hover:bg-brand-primary/10 transition-colors cursor-pointer",
                  isToday && "bg-brand-primary/5"
                )}
              >
                <p className="text-[10px] font-medium uppercase text-brand-text-tertiary">
                  {shortDayNames[i]}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-lg font-bold",
                    isToday ? "text-brand-primary" : "text-brand-text-primary"
                  )}
                >
                  {d.getDate()}
                </p>
              </button>
            )
          })}
        </div>

        {/* Week body */}
        <div className="grid grid-cols-7">
          {weekDays.map((d) => {
            const ds = toDateStr(d)
            const dayBks = weekBookingsMap[ds] || []
            const isToday = ds === todayStr
            return (
              <div
                key={ds}
                onClick={() => goToDay(d)}
                className={cn(
                  "min-h-[200px] border-r border-brand-border p-2 last:border-r-0 cursor-pointer hover:bg-brand-primary/5 transition-colors",
                  isToday && "bg-brand-primary/10"
                )}
              >
                {dayBks.length === 0 && (
                  <p className="py-6 text-center text-[10px] text-brand-text-tertiary">
                    {t("noBookingsFound")}
                  </p>
                )}
                <div className="flex flex-col gap-1.5">
                  {dayBks.map((bk) => (
                    <div
                      key={bk.id}
                      className={cn(
                        "rounded-lg p-2 text-[10px] leading-tight",
                        STATUS_STYLES[bk.status]
                      )}
                    >
                      <p className="font-bold">
                        {bk.startTime}–{bk.endTime}
                      </p>
                      <p className="mt-0.5 font-semibold truncate">{bk.customerName}</p>
                      <p className="truncate opacity-80">{bk.staffName}</p>
                      <p className="truncate opacity-70">{bk.serviceName}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
