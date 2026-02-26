"use client"

import { useState } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useBookings } from "@/lib/data/bookings-store"
import { cn } from "@/lib/utils"
import { Mail, Smartphone, Bell, Send, CheckCircle2 } from "lucide-react"
import type { Booking, BookingReminder } from "@/lib/types"

const reminderTypes: { value: BookingReminder["type"]; label: string; icon: typeof Mail }[] = [
  { value: "email", label: "Email", icon: Mail },
  { value: "sms", label: "SMS", icon: Smartphone },
  { value: "push", label: "Push Notification", icon: Bell },
]

function generatePreviewMessage(booking: Booking, type: BookingReminder["type"]): string {
  const dateStr = new Date(booking.date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const base = `Hi ${booking.customerName},\n\nThis is a friendly reminder about your upcoming appointment:\n\nService: ${booking.serviceName}\nTherapist: ${booking.staffName}\nDate: ${dateStr}\nTime: ${booking.startTime} - ${booking.endTime}\nDuration: ${booking.duration} minutes\n\nPlease arrive 5-10 minutes early. If you need to reschedule, please contact us at least 24 hours in advance.\n\nWe look forward to seeing you!\n- Koko Massage`

  if (type === "sms") {
    return `Reminder: ${booking.serviceName} with ${booking.staffName} on ${booking.date} at ${booking.startTime}. See you soon! - Koko Massage`
  }

  if (type === "push") {
    return `Upcoming: ${booking.serviceName} with ${booking.staffName} tomorrow at ${booking.startTime}`
  }

  return base
}

export function SendReminderDialog({
  booking,
  open,
  onOpenChange,
}: {
  booking: Booking | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { sendReminder } = useBookings()
  const [selectedType, setSelectedType] = useState<BookingReminder["type"]>("email")
  const [sent, setSent] = useState(false)

  if (!booking) return null

  const previewMessage = generatePreviewMessage(booking, selectedType)

  function handleSend() {
    sendReminder(booking!.id, selectedType)
    setSent(true)
    setTimeout(() => {
      setSent(false)
      onOpenChange(false)
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); setSent(false) }}>
      <DialogContent className="border-brand-border bg-brand-bg-secondary sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-brand-text-primary">Send Booking Reminder</DialogTitle>
          <DialogDescription className="text-brand-text-secondary">
            Remind {booking.customerName} about their upcoming {booking.serviceName} appointment.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-green/15">
              <CheckCircle2 size={28} className="text-brand-green" />
            </div>
            <p className="text-sm font-medium text-brand-text-primary">
              Reminder sent successfully!
            </p>
            <p className="text-xs text-brand-text-tertiary">
              {selectedType === "email" ? "Email" : selectedType === "sms" ? "SMS" : "Push notification"} sent to {booking.customerName}
            </p>
          </div>
        ) : (
          <>
            {/* Reminder type selection */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-brand-text-tertiary">
                Reminder Type
              </p>
              <div className="flex gap-2">
                {reminderTypes.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelectedType(value)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                      selectedType === value
                        ? "border-brand-primary bg-brand-primary/15 text-brand-primary"
                        : "border-brand-border bg-brand-bg-tertiary text-brand-text-secondary hover:border-brand-text-tertiary hover:text-brand-text-primary"
                    )}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message preview */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-brand-text-tertiary">
                Message Preview
              </p>
              <div className="max-h-52 overflow-y-auto rounded-xl border border-brand-border bg-card p-3">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-brand-text-secondary">
                  {previewMessage}
                </pre>
              </div>
            </div>

            <DialogFooter className="mt-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-brand-border text-brand-text-secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                className="gap-2"
              >
                <Send size={14} />
                Send {selectedType === "email" ? "Email" : selectedType === "sms" ? "SMS" : "Push"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
