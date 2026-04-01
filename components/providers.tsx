"use client"

import { AuthProvider } from "@/lib/auth/auth-context"
import { ServicesProvider } from "@/lib/data/services-store"
import { BookingsProvider } from "@/lib/data/bookings-store"
import { NotesProvider } from "@/lib/data/notes-store"
import { GiftCardsProvider } from "@/lib/data/giftcards-store"
import { LoyaltyProvider } from "@/lib/data/loyalty-store"
import { PromotionsProvider } from "@/lib/data/promotions-store"
import { TipsProvider } from "@/lib/data/tips-store"
import { TranslationProvider } from "@/lib/data/translation-store"
import { MessagesProvider } from "@/lib/data/messages-store"
import { LanguageProvider } from "@/lib/i18n/language-context"
import { ShopProvider } from "@/lib/shop/shop-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ShopProvider>
    <LanguageProvider>
      <AuthProvider>
        <ServicesProvider>
          <BookingsProvider>
            <NotesProvider>
              <GiftCardsProvider>
                <LoyaltyProvider>
                  <PromotionsProvider>
                    <TipsProvider>
                      <TranslationProvider>
                        <MessagesProvider>
                          {children}
                        </MessagesProvider>
                      </TranslationProvider>
                    </TipsProvider>
                  </PromotionsProvider>
                </LoyaltyProvider>
              </GiftCardsProvider>
            </NotesProvider>
          </BookingsProvider>
        </ServicesProvider>
      </AuthProvider>
    </LanguageProvider>
    </ShopProvider>
  )
}
