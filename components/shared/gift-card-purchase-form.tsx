"use client"

import { useState } from "react"
import { Gift, CheckCircle2, Copy, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useGiftCards } from "@/lib/data/giftcards-store"
import { useAuth } from "@/lib/auth/auth-context"
import { useLanguage } from "@/lib/i18n/language-context"
import { formatPrice, formatMassageType } from "@/lib/utils/formatters"
import { cn } from "@/lib/utils"
import type { GiftCard, MassageType } from "@/lib/types"

interface GiftCardPurchaseFormProps {
  onPurchase: (card: GiftCard) => void
}

const PRESET_AMOUNTS = [1000, 2000, 3000, 5000]
const ALL_MASSAGE_TYPES: MassageType[] = [
  "thai", "swedish", "deep-tissue", "aromatherapy",
  "hot-stone", "sports", "reflexology", "shiatsu",
]

export function GiftCardPurchaseForm({ onPurchase }: GiftCardPurchaseFormProps) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const { purchaseGiftCard } = useGiftCards()

  const [recipientName, setRecipientName] = useState("")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [message, setMessage] = useState("")
  const [amount, setAmount] = useState(2000)
  const [customAmount, setCustomAmount] = useState("")
  const [isCustom, setIsCustom] = useState(false)
  const [allServices, setAllServices] = useState(true)
  const [selectedTypes, setSelectedTypes] = useState<MassageType[]>([])
  const [purchasedCard, setPurchasedCard] = useState<GiftCard | null>(null)
  const [copied, setCopied] = useState(false)

  const effectiveAmount = isCustom ? Number(customAmount) || 0 : amount

  function toggleType(type: MassageType) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  function handlePurchase() {
    if (!user || !recipientName || !recipientEmail || effectiveAmount <= 0) return

    const card = purchaseGiftCard({
      purchasedBy: user.id,
      purchaserName: user.name,
      recipientName,
      recipientEmail,
      message: message || undefined,
      amount: effectiveAmount,
      applicableServices: allServices ? "all" : selectedTypes,
    })

    setPurchasedCard(card)
    onPurchase(card)
  }

  function handleCopyCode() {
    if (purchasedCard) {
      navigator.clipboard.writeText(purchasedCard.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const isValid = recipientName.trim() && recipientEmail.trim() && effectiveAmount >= 500 && (allServices || selectedTypes.length > 0)

  // Success state
  if (purchasedCard) {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-green/15">
          <CheckCircle2 size={28} className="text-brand-green" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-brand-text-primary">{t("giftCardPurchased")}</h3>
          <p className="mt-1 text-sm text-brand-text-secondary">
            {formatPrice(purchasedCard.originalBalance)} gift card for {purchasedCard.recipientName}
          </p>
        </div>

        <div className="w-full rounded-xl border border-brand-primary/30 bg-brand-primary/5 p-4">
          <p className="text-center text-xs font-medium uppercase tracking-wider text-brand-text-tertiary">
            {t("giftCardCode")}
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <p className="text-xl font-bold tracking-widest text-brand-primary">
              {purchasedCard.code}
            </p>
            <button
              type="button"
              onClick={handleCopyCode}
              className="rounded-lg p-1.5 transition-colors hover:bg-brand-bg-tertiary"
            >
              {copied ? (
                <Check size={16} className="text-brand-green" />
              ) : (
                <Copy size={16} className="text-brand-text-tertiary" />
              )}
            </button>
          </div>
        </div>

        <Button
          onClick={() => {
            setPurchasedCard(null)
            setRecipientName("")
            setRecipientEmail("")
            setMessage("")
            setAmount(2000)
            setCustomAmount("")
            setIsCustom(false)
            setAllServices(true)
            setSelectedTypes([])
          }}
          variant="outline"
          className="w-full border-brand-border text-brand-text-primary hover:bg-brand-bg-tertiary"
        >
          {t("buyGiftCard")}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 py-2">
      {/* Recipient info */}
      <div className="flex flex-col gap-3">
        <div>
          <Label className="mb-1.5 text-sm font-medium text-brand-text-secondary">
            {t("recipientName")}
          </Label>
          <Input
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder={t("recipientName")}
            className="border-brand-border bg-card text-brand-text-primary placeholder:text-brand-text-tertiary"
          />
        </div>
        <div>
          <Label className="mb-1.5 text-sm font-medium text-brand-text-secondary">
            {t("recipientEmail")}
          </Label>
          <Input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder={t("recipientEmail")}
            className="border-brand-border bg-card text-brand-text-primary placeholder:text-brand-text-tertiary"
          />
        </div>
        <div>
          <Label className="mb-1.5 text-sm font-medium text-brand-text-secondary">
            {t("giftMessage")} <span className="text-brand-text-tertiary">({t("optional")})</span>
          </Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("giftMessagePlaceholder")}
            className="border-brand-border bg-card text-brand-text-primary placeholder:text-brand-text-tertiary"
            rows={3}
          />
        </div>
      </div>

      {/* Amount selection */}
      <div>
        <Label className="mb-2 text-sm font-medium text-brand-text-secondary">
          {t("giftCardAmount")}
        </Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setAmount(preset)
                setIsCustom(false)
              }}
              className={cn(
                "rounded-xl border px-3 py-3 text-sm font-semibold transition-all",
                !isCustom && amount === preset
                  ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                  : "border-brand-border bg-card text-brand-text-secondary hover:border-brand-primary/50"
              )}
            >
              {formatPrice(preset)}
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCustom(true)}
            className={cn(
              "rounded-xl border px-3 py-2 text-sm font-medium transition-all",
              isCustom
                ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                : "border-brand-border bg-card text-brand-text-secondary hover:border-brand-primary/50"
            )}
          >
            Custom
          </button>
          {isCustom && (
            <Input
              type="number"
              min={500}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="e.g. 1500"
              className="flex-1 border-brand-border bg-card text-brand-text-primary placeholder:text-brand-text-tertiary"
            />
          )}
        </div>
      </div>

      {/* Applicable services */}
      <div>
        <Label className="mb-2 text-sm font-medium text-brand-text-secondary">
          {t("applicableServices")}
        </Label>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2.5 rounded-xl border border-brand-border bg-card p-3 transition-colors hover:bg-brand-bg-tertiary/50">
            <Checkbox
              checked={allServices}
              onCheckedChange={(checked) => {
                setAllServices(!!checked)
                if (checked) setSelectedTypes([])
              }}
            />
            <span className="text-sm font-medium text-brand-text-primary">{t("allMassageTypes")}</span>
          </label>
          {!allServices && (
            <div className="grid grid-cols-2 gap-2">
              {ALL_MASSAGE_TYPES.map((type) => (
                <label
                  key={type}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border p-3 transition-colors hover:bg-brand-bg-tertiary/50",
                    selectedTypes.includes(type)
                      ? "border-brand-primary/40 bg-brand-primary/5"
                      : "border-brand-border bg-card"
                  )}
                >
                  <Checkbox
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => toggleType(type)}
                  />
                  <span className="text-sm text-brand-text-primary">{formatMassageType(type)}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Total */}
      {effectiveAmount > 0 && (
        <div className="rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-brand-text-secondary">{t("total")}</span>
            <span className="text-xl font-bold text-brand-primary">
              {formatPrice(effectiveAmount)}
            </span>
          </div>
        </div>
      )}

      {/* Purchase button */}
      <Button
        onClick={handlePurchase}
        disabled={!isValid}
        className="w-full bg-brand-primary text-primary-foreground hover:bg-brand-primary/90 disabled:opacity-50"
        size="lg"
      >
        <Gift size={18} />
        {t("purchaseGiftCard")}
      </Button>
    </div>
  )
}
