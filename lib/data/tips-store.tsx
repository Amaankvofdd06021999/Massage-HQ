"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { TipClaim } from "@/lib/types"
import { tipClaims as seedClaims } from "./mock-data"

interface TipsContextType {
  tipClaims: TipClaim[]
  submitTipClaim: (staffId: string, staffName: string, amount: number) => void
  resolveTipClaim: (claimId: string, status: "approved" | "rejected", resolvedBy: string) => void
  getClaimsForStaff: (staffId: string) => TipClaim[]
  getPendingClaims: () => TipClaim[]
}

const TipsContext = createContext<TipsContextType | null>(null)

const STORAGE_KEY = "koko-tip-claims"

export function TipsProvider({ children }: { children: React.ReactNode }) {
  const [claims, setClaims] = useState<TipClaim[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    setClaims(stored ? JSON.parse(stored) : seedClaims)
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(claims))
  }, [claims, ready])

  const submitTipClaim = useCallback((staffId: string, staffName: string, amount: number) => {
    const claim: TipClaim = {
      id: `tc-${Date.now()}`,
      staffId,
      staffName,
      amount,
      status: "pending",
      requestedAt: new Date().toISOString(),
    }
    setClaims((prev) => [...prev, claim])
  }, [])

  const resolveTipClaim = useCallback((claimId: string, status: "approved" | "rejected", resolvedBy: string) => {
    setClaims((prev) =>
      prev.map((c) =>
        c.id === claimId ? { ...c, status, resolvedAt: new Date().toISOString(), resolvedBy } : c
      )
    )
  }, [])

  const getClaimsForStaff = useCallback(
    (staffId: string) => claims.filter((c) => c.staffId === staffId),
    [claims]
  )

  const getPendingClaims = useCallback(() => claims.filter((c) => c.status === "pending"), [claims])

  const value = useMemo(
    () => ({ tipClaims: claims, submitTipClaim, resolveTipClaim, getClaimsForStaff, getPendingClaims }),
    [claims, submitTipClaim, resolveTipClaim, getClaimsForStaff, getPendingClaims]
  )

  return <TipsContext.Provider value={value}>{children}</TipsContext.Provider>
}

export function useTips() {
  const ctx = useContext(TipsContext)
  if (!ctx) throw new Error("useTips must be used within TipsProvider")
  return ctx
}
