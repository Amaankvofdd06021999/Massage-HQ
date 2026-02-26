"use client"

import {
  createContext, useContext, useState, useCallback, useEffect, type ReactNode,
} from "react"
import type { StaffMessage } from "@/lib/types"
import { staffMessages as SEED_MESSAGES } from "@/lib/data/mock-data"

const MESSAGES_KEY = "koko-messages"

interface MessagesContextType {
  messages: StaffMessage[]
  sendMessage: (msg: Omit<StaffMessage, "id" | "createdAt" | "isRead">) => void
  markAsRead: (id: string) => void
  markConversationRead: (userId: string, otherUserId: string) => void
  getConversation: (userId1: string, userId2: string) => StaffMessage[]
  getUnreadCount: (userId: string) => number
  getConversationPartners: (userId: string) => { id: string; name: string; lastMessage: StaffMessage; unread: number }[]
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined)

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

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<StaffMessage[]>(SEED_MESSAGES)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setMessages(load(MESSAGES_KEY, SEED_MESSAGES))
    setReady(true)
  }, [])

  useEffect(() => { if (ready) save(MESSAGES_KEY, messages) }, [messages, ready])

  const sendMessage = useCallback((msg: Omit<StaffMessage, "id" | "createdAt" | "isRead">) => {
    const newMsg: StaffMessage = {
      ...msg,
      id: genId("sm"),
      createdAt: new Date().toISOString(),
      isRead: false,
    }
    setMessages((prev) => [...prev, newMsg])
  }, [])

  const markAsRead = useCallback((id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)))
  }, [])

  const markConversationRead = useCallback((userId: string, otherUserId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.toId === userId && m.fromId === otherUserId && !m.isRead
          ? { ...m, isRead: true }
          : m
      )
    )
  }, [])

  const getConversation = useCallback(
    (userId1: string, userId2: string) =>
      messages
        .filter(
          (m) =>
            (m.fromId === userId1 && m.toId === userId2) ||
            (m.fromId === userId2 && m.toId === userId1)
        )
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [messages]
  )

  const getUnreadCount = useCallback(
    (userId: string) => messages.filter((m) => m.toId === userId && !m.isRead).length,
    [messages]
  )

  const getConversationPartners = useCallback(
    (userId: string) => {
      const partnerMap = new Map<string, { id: string; name: string; lastMessage: StaffMessage; unread: number }>()
      const relevant = messages.filter((m) => m.fromId === userId || m.toId === userId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

      for (const msg of relevant) {
        const partnerId = msg.fromId === userId ? msg.toId : msg.fromId
        const partnerName = msg.fromId === userId ? msg.toName : msg.fromName
        const existing = partnerMap.get(partnerId)
        const unread = (existing?.unread || 0) + (msg.toId === userId && !msg.isRead ? 1 : 0)
        partnerMap.set(partnerId, { id: partnerId, name: partnerName, lastMessage: msg, unread })
      }

      return Array.from(partnerMap.values())
        .sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime())
    },
    [messages]
  )

  return (
    <MessagesContext.Provider value={{
      messages, sendMessage, markAsRead, markConversationRead,
      getConversation, getUnreadCount, getConversationPartners,
    }}>
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessages() {
  const ctx = useContext(MessagesContext)
  if (!ctx) throw new Error("useMessages must be used within MessagesProvider")
  return ctx
}
