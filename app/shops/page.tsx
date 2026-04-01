"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Store, Plus, ArrowRight, CheckCircle, XCircle } from "lucide-react"
import { useShop } from "@/lib/shop/shop-context"

export default function ShopsPage() {
  const { myShops, setActiveShop, addShopByCode } = useShop()
  const router = useRouter()

  const [shopCode, setShopCode] = useState("")
  const [feedback, setFeedback] = useState<"success" | "error" | null>(null)

  function handleSelectShop(shopId: string) {
    setActiveShop(shopId)
    router.push("/login")
  }

  function handleJoinShop() {
    if (!shopCode.trim()) return
    const result = addShopByCode(shopCode.trim())
    if (result) {
      setFeedback("success")
      setShopCode("")
    } else {
      setFeedback("error")
    }
    setTimeout(() => setFeedback(null), 3000)
  }

  return (
    <div className="flex min-h-dvh flex-col items-center px-5 py-12">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-color)]/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-color)]/15 ring-1 ring-[var(--accent-color)]/30">
            <Store size={28} className="text-[var(--accent-color)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Select Your Shop
          </h1>
          <p className="mt-1 text-sm text-[var(--text-tertiary)]">
            Choose a shop to continue
          </p>
        </div>

        {/* Shop cards */}
        <div className="space-y-3">
          {myShops.map((shop) => (
            <button
              key={shop.id}
              type="button"
              onClick={() => handleSelectShop(shop.id)}
              className="group relative w-full overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-left transition-all hover:border-[var(--text-tertiary)]/40 active:scale-[0.98]"
            >
              {/* Accent strip */}
              <div
                className="h-1.5 w-full"
                style={{ backgroundColor: shop.brand.primaryColor }}
              />
              <div className="flex items-center gap-3 p-4">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${shop.brand.primaryColor}20` }}
                >
                  <Store
                    size={20}
                    style={{ color: shop.brand.primaryColor }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                    {shop.name}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] truncate">
                    {shop.tagline}
                  </p>
                </div>
                <ArrowRight
                  size={16}
                  className="shrink-0 text-[var(--text-tertiary)] transition-transform group-hover:translate-x-0.5"
                />
              </div>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="my-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border-color)]" />
          <span className="text-xs font-medium text-[var(--text-tertiary)]">
            Add a new shop
          </span>
          <div className="h-px flex-1 bg-[var(--border-color)]" />
        </div>

        {/* Add shop by code */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Plus size={16} className="text-[var(--text-secondary)]" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Join with Shop Code
            </p>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mb-4">
            Enter the code provided by the shop to add it to your list.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={shopCode}
              onChange={(e) => setShopCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoinShop()}
              placeholder="e.g. SHOP2024"
              className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent-color)]/50 focus:ring-1 focus:ring-[var(--accent-color)]/30 transition-colors"
            />
            <button
              type="button"
              onClick={handleJoinShop}
              disabled={!shopCode.trim()}
              className="shrink-0 rounded-xl bg-[var(--accent-color)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
            >
              Join
            </button>
          </div>

          {/* Feedback */}
          {feedback === "success" && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--accent-green)]/10 px-3 py-2">
              <CheckCircle size={14} className="text-[var(--accent-green)]" />
              <p className="text-xs font-medium text-[var(--accent-green)]">
                Shop added successfully!
              </p>
            </div>
          )}
          {feedback === "error" && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--accent-coral)]/10 px-3 py-2">
              <XCircle size={14} className="text-[var(--accent-coral)]" />
              <p className="text-xs font-medium text-[var(--accent-coral)]">
                Invalid shop code. Please try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
