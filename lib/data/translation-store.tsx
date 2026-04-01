"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { TranslationMessage, ChatLanguage } from "@/lib/types"
import { mockTranslate } from "./mock-data"
import { useShop } from "@/lib/shop/shop-context"

interface TranslationContextType {
  messages: TranslationMessage[]
  sendMessage: (msg: Omit<TranslationMessage, "id" | "timestamp" | "translatedText">) => void
  getMessagesForBooking: (bookingId: string) => TranslationMessage[]
  clearMessages: (bookingId: string) => void
}

const TranslationContext = createContext<TranslationContextType | null>(null)

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const { shopId } = useShop()
  const prefix = shopId ?? "koko"
  const STORAGE_KEY = `${prefix}-translation-messages`

  const [messages, setMessages] = useState<TranslationMessage[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
    const stored = localStorage.getItem(STORAGE_KEY)
    setMessages(stored ? JSON.parse(stored) : [])
    setReady(true)
  }, [shopId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages, ready])

  const sendMessage = useCallback(
    (msg: Omit<TranslationMessage, "id" | "timestamp" | "translatedText">) => {
      const translated = mockTranslate(msg.originalText, msg.fromLang, msg.toLang)
      const newMsg: TranslationMessage = {
        ...msg,
        id: `tm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        translatedText: translated,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, newMsg])
    },
    []
  )

  const getMessagesForBooking = useCallback(
    (bookingId: string) => messages.filter((m) => m.bookingId === bookingId),
    [messages]
  )

  const clearMessages = useCallback((bookingId: string) => {
    setMessages((prev) => prev.filter((m) => m.bookingId !== bookingId))
  }, [])

  const value = useMemo(
    () => ({ messages, sendMessage, getMessagesForBooking, clearMessages }),
    [messages, sendMessage, getMessagesForBooking, clearMessages]
  )

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
}

export function useTranslationChat() {
  const ctx = useContext(TranslationContext)
  if (!ctx) throw new Error("useTranslationChat must be used within TranslationProvider")
  return ctx
}
