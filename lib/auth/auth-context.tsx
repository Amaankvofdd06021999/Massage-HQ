"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useShop } from "@/lib/shop/shop-context"

export type UserRole = "manager" | "customer" | "staff"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatar: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ── Demo users ─────────────────────────────────────────────
export const DEMO_MANAGER: AuthUser = {
  id: "manager-1",
  name: "Nattawut Kositchai",
  email: "manager@koko.com",
  role: "manager",
  avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&h=200&fit=crop&crop=face",
}

export const DEMO_CUSTOMER: AuthUser = {
  id: "c1",
  name: "Alex Chen",
  email: "alex@example.com",
  role: "customer",
  avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=200&h=200&fit=crop&crop=face",
}

export const DEMO_STAFF: AuthUser = {
  id: "s1",
  name: "Somchai Patel",
  email: "joy@koko.com",
  role: "staff",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
}

// ── Provider ───────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const { shopId } = useShop()
  const prefix = shopId ?? "koko"
  const STORAGE_KEY = `${prefix}-auth-user`

  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setUser(JSON.parse(stored) as AuthUser)
      else setUser(null)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [shopId]) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback((newUser: AuthUser) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser)) } catch { /* ignore */ }
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
