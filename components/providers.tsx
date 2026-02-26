"use client"

import { AuthProvider } from "@/lib/auth/auth-context"
import { ServicesProvider } from "@/lib/data/services-store"
import { BookingsProvider } from "@/lib/data/bookings-store"
import { NotesProvider } from "@/lib/data/notes-store"
import { GiftCardsProvider } from "@/lib/data/giftcards-store"
import { LoyaltyProvider } from "@/lib/data/loyalty-store"
import { MessagesProvider } from "@/lib/data/messages-store"
import { LanguageProvider } from "@/lib/i18n/language-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ServicesProvider>
          <BookingsProvider>
            <NotesProvider>
              <GiftCardsProvider>
                <LoyaltyProvider>
                  <MessagesProvider>
                    {children}
                  </MessagesProvider>
                </LoyaltyProvider>
              </GiftCardsProvider>
            </NotesProvider>
          </BookingsProvider>
        </ServicesProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}
