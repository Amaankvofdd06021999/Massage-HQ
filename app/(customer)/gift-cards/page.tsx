"use client"

import { useState } from "react"
import {
  Gift, CreditCard, ShoppingBag, CheckCircle2, AlertCircle,
  Calendar, Tag,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { GiftCardPurchaseForm } from "@/components/shared/gift-card-purchase-form"
import { useGiftCards } from "@/lib/data/giftcards-store"
import { useAuth } from "@/lib/auth/auth-context"
import { useLanguage } from "@/lib/i18n/language-context"
import { formatPrice, formatMassageType } from "@/lib/utils/formatters"
import { cn } from "@/lib/utils"
import type { GiftCard } from "@/lib/types"

const statusColors: Record<string, string> = {
  active: "bg-brand-green/15 text-brand-green",
  redeemed: "bg-brand-blue/15 text-brand-blue",
  expired: "bg-brand-coral/15 text-brand-coral",
}

function GiftCardItem({ card }: { card: GiftCard }) {
  const { t } = useLanguage()

  const applicableLabel =
    card.applicableServices === "all"
      ? t("allMassageTypes")
      : (card.applicableServices as string[]).map(formatMassageType).join(", ")

  return (
    <div className="rounded-2xl border border-brand-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10">
            <Gift size={16} className="text-brand-primary" />
          </div>
          <div>
            <p className="text-xs font-mono font-semibold tracking-wider text-brand-text-primary">
              {card.code}
            </p>
            {card.recipientName && (
              <p className="text-xs text-brand-text-tertiary">
                {card.purchaserName ? `${card.purchaserName} → ` : ""}{card.recipientName}
              </p>
            )}
          </div>
        </div>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", statusColors[card.status])}>
          {card.status}
        </span>
      </div>

      {card.message && (
        <p className="mt-2 rounded-lg bg-brand-bg-tertiary/50 px-3 py-2 text-xs italic text-brand-text-secondary">
          &ldquo;{card.message}&rdquo;
        </p>
      )}

      <div className="mt-3 flex flex-col gap-1.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-brand-text-tertiary">{t("giftCardBalance")}</span>
          <span className="font-bold text-brand-text-primary">
            {formatPrice(card.currentBalance)}
            {card.currentBalance < card.originalBalance && (
              <span className="ml-1 text-xs font-normal text-brand-text-tertiary line-through">
                {formatPrice(card.originalBalance)}
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-brand-text-tertiary">
            <Tag size={12} />
            {t("giftCardApplicable")}
          </span>
          <span className="max-w-[60%] truncate text-right text-brand-text-secondary">{applicableLabel}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-brand-text-tertiary">
            <Calendar size={12} />
            {t("giftCardExpires")}
          </span>
          <span className="text-brand-text-secondary">
            {new Date(card.expiresAt).toLocaleDateString("en", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function GiftCardsPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const { validateGiftCard, getGiftCardsForCustomer, getReceivedGiftCards } = useGiftCards()

  const [redeemCode, setRedeemCode] = useState("")
  const [redeemResult, setRedeemResult] = useState<{
    success: boolean
    card?: GiftCard
    error?: string
  } | null>(null)

  const customerId = user?.id ?? "c1"
  const email = user?.email ?? "alex@example.com"

  const purchasedCards = getGiftCardsForCustomer(customerId)
  const receivedCards = getReceivedGiftCards(email)

  function handleValidate() {
    const code = redeemCode.trim().toUpperCase()
    if (!code) return

    const card = validateGiftCard(code)
    if (card) {
      setRedeemResult({ success: true, card })
    } else {
      setRedeemResult({ success: false, error: t("invalidGiftCard") })
    }
  }

  return (
    <div className="px-5 pb-24 pt-12">
      {/* Page header */}
      <div className="pr-10">
        <div className="flex items-center gap-2">
          <Gift size={20} className="text-brand-primary" />
          <h1 className="text-2xl font-bold text-brand-text-primary">{t("giftCards")}</h1>
        </div>
        <p className="mt-1 text-sm text-brand-text-secondary">
          Send or redeem gift cards for massage sessions
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="buy" className="mt-5">
        <TabsList className="w-full">
          <TabsTrigger value="buy" className="flex-1 gap-1.5">
            <ShoppingBag size={14} />
            {t("buyGiftCard")}
          </TabsTrigger>
          <TabsTrigger value="redeem" className="flex-1 gap-1.5">
            <CreditCard size={14} />
            {t("redeemGiftCard")}
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex-1 gap-1.5">
            <Gift size={14} />
            {t("myGiftCards")}
          </TabsTrigger>
        </TabsList>

        {/* Buy tab */}
        <TabsContent value="buy" className="page-transition">
          <GiftCardPurchaseForm onPurchase={() => {}} />
        </TabsContent>

        {/* Redeem tab */}
        <TabsContent value="redeem" className="page-transition">
          <div className="mt-2 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-text-secondary">
                {t("giftCardCode")}
              </label>
              <div className="flex gap-2">
                <Input
                  value={redeemCode}
                  onChange={(e) => {
                    setRedeemCode(e.target.value.toUpperCase())
                    setRedeemResult(null)
                  }}
                  placeholder={t("enterGiftCardCode")}
                  className="flex-1 border-brand-border bg-card font-mono uppercase text-brand-text-primary placeholder:text-brand-text-tertiary placeholder:normal-case"
                />
                <Button
                  onClick={handleValidate}
                  disabled={!redeemCode.trim()}
                  className="bg-brand-primary text-primary-foreground hover:bg-brand-primary/90"
                >
                  {t("applyGiftCard")}
                </Button>
              </div>
            </div>

            {/* Validation result */}
            {redeemResult && (
              <div
                className={cn(
                  "rounded-xl border p-4",
                  redeemResult.success
                    ? "border-brand-green/30 bg-brand-green/5"
                    : "border-brand-coral/30 bg-brand-coral/5"
                )}
              >
                {redeemResult.success && redeemResult.card ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-brand-green" />
                      <span className="font-semibold text-brand-green">{t("giftCardRedeemed")}</span>
                    </div>
                    <div className="mt-3 flex flex-col gap-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-brand-text-tertiary">{t("giftCardBalance")}</span>
                        <span className="font-bold text-brand-text-primary">
                          {formatPrice(redeemResult.card.currentBalance)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-brand-text-tertiary">{t("giftCardApplicable")}</span>
                        <span className="text-brand-text-secondary">
                          {redeemResult.card.applicableServices === "all"
                            ? t("allMassageTypes")
                            : (redeemResult.card.applicableServices as string[]).map(formatMassageType).join(", ")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-brand-text-tertiary">{t("giftCardExpires")}</span>
                        <span className="text-brand-text-secondary">
                          {new Date(redeemResult.card.expiresAt).toLocaleDateString("en", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      {redeemResult.card.message && (
                        <p className="mt-1 rounded-lg bg-brand-bg-tertiary/50 px-3 py-2 text-xs italic text-brand-text-secondary">
                          &ldquo;{redeemResult.card.message}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle size={18} className="text-brand-coral" />
                    <span className="text-sm font-medium text-brand-coral">{redeemResult.error}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* My Cards tab */}
        <TabsContent value="cards" className="page-transition">
          <div className="mt-2 flex flex-col gap-6">
            {/* Purchased cards */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">
                {t("purchasedCards")} ({purchasedCards.length})
              </h3>
              {purchasedCards.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {purchasedCards.map((card) => (
                    <GiftCardItem key={card.id} card={card} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-brand-border py-8 text-center">
                  <ShoppingBag size={24} className="mx-auto text-brand-text-tertiary/40" />
                  <p className="mt-2 text-sm text-brand-text-tertiary">
                    No purchased gift cards yet
                  </p>
                </div>
              )}
            </div>

            {/* Received cards */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-text-tertiary">
                {t("receivedCards")} ({receivedCards.length})
              </h3>
              {receivedCards.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {receivedCards.map((card) => (
                    <GiftCardItem key={card.id} card={card} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-brand-border py-8 text-center">
                  <Gift size={24} className="mx-auto text-brand-text-tertiary/40" />
                  <p className="mt-2 text-sm text-brand-text-tertiary">
                    No received gift cards yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
