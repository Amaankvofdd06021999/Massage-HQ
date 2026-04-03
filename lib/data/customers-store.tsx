"use client"

import React, {
  createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode,
} from "react"
import type { Customer } from "@/lib/types"
import { useShop } from "@/lib/shop/shop-context"
import { getSeedsForShop } from "@/lib/data/seeds"
import { generateMembershipNumber } from "@/lib/data/mock-data"

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function load<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : seed
  } catch { return seed }
}

function save<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

interface CustomersContextType {
  customers: Customer[]
  createCustomer: (name: string, phone: string, email?: string) => Customer
  searchCustomers: (query: string) => Customer[]
  getCustomerById: (id: string) => Customer | undefined
}

const CustomersContext = createContext<CustomersContextType | null>(null)

export function CustomersProvider({ children }: { children: ReactNode }) {
  const { shopId } = useShop()
  const prefix = shopId ?? "koko"
  const CUSTOMERS_KEY = `${prefix}-customers`

  const [customers, setCustomers] = useState<Customer[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
    const seeds = getSeedsForShop(prefix)
    setCustomers(load(CUSTOMERS_KEY, seeds.customers))
    setReady(true)
  }, [shopId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (ready) save(CUSTOMERS_KEY, customers) }, [customers, ready])

  const createCustomer = useCallback((name: string, phone: string, email?: string): Customer => {
    const newCustomer: Customer = {
      id: genId("c"),
      name,
      phone,
      email: email || "",
      avatar: "",
      memberSince: new Date().toISOString().split("T")[0],
      membershipNumber: generateMembershipNumber(),
      totalBookings: 0,
      totalSpent: 0,
      preferredStaff: [],
      preferredServices: [],
      loyaltyPoints: 0,
      loyaltyStamps: 0,
      giftCardBalance: 0,
      trialActive: false,
    }
    setCustomers(prev => [...prev, newCustomer])
    return newCustomer
  }, [])

  const searchCustomers = useCallback((query: string): Customer[] => {
    if (!query.trim()) return []
    const q = query.toLowerCase().trim()
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.membershipNumber.toLowerCase().includes(q)
    )
  }, [customers])

  const getCustomerById = useCallback((id: string): Customer | undefined => {
    return customers.find(c => c.id === id)
  }, [customers])

  const value = useMemo(() => ({
    customers, createCustomer, searchCustomers, getCustomerById
  }), [customers, createCustomer, searchCustomers, getCustomerById])

  return (
    <CustomersContext.Provider value={value}>
      {children}
    </CustomersContext.Provider>
  )
}

export function useCustomers() {
  const ctx = useContext(CustomersContext)
  if (!ctx) throw new Error("useCustomers must be used within CustomersProvider")
  return ctx
}
