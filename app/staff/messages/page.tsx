"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { MessageSquare, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/auth-context"
import { useMessages } from "@/lib/data/messages-store"
import { useLanguage } from "@/lib/i18n/language-context"

const MANAGER_ID = "manager-1"
const MANAGER_NAME = "Nattawut"

export default function StaffMessagesPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { getConversation, sendMessage, markConversationRead } = useMessages()
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const conversation = useMemo(
    () => (user ? getConversation(user.id, MANAGER_ID) : []),
    [user, getConversation]
  )

  // Mark unread messages as read on mount and when conversation changes
  useEffect(() => {
    if (user) {
      markConversationRead(user.id, MANAGER_ID)
    }
  }, [user, markConversationRead, conversation.length])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation.length])

  function handleSend() {
    if (!newMessage.trim() || !user) return
    sendMessage({
      fromId: user.id,
      fromName: user.name,
      toId: MANAGER_ID,
      toName: MANAGER_NAME,
      content: newMessage.trim(),
    })
    setNewMessage("")
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function formatTime(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })
  }

  function formatDateDivider(dateStr: string): string {
    const date = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const msgDate = new Date(date)
    msgDate.setHours(0, 0, 0, 0)

    const diffDays = Math.round((today.getTime() - msgDate.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    return date.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })
  }

  // Group messages by date for date dividers
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: typeof conversation }[] = []
    let currentDate = ""

    for (const msg of conversation) {
      const msgDate = new Date(msg.createdAt).toDateString()
      if (msgDate !== currentDate) {
        currentDate = msgDate
        groups.push({ date: msg.createdAt, messages: [msg] })
      } else {
        groups[groups.length - 1].messages.push(msg)
      }
    }

    return groups
  }, [conversation])

  return (
    <div className="flex h-[calc(100dvh-5rem)] flex-col pt-12">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/15">
          <MessageSquare size={20} className="text-brand-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-brand-text-primary">Messages</h1>
          <p className="text-sm text-brand-text-secondary">
            Chat with {MANAGER_NAME} (Manager)
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto px-5 pb-4"
      >
        {conversation.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-bg-tertiary">
              <MessageSquare size={24} className="text-brand-text-tertiary" />
            </div>
            <p className="text-sm font-medium text-brand-text-secondary">No messages yet</p>
            <p className="mt-1 text-xs text-brand-text-tertiary">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {groupedMessages.map((group) => (
              <div key={group.date}>
                {/* Date Divider */}
                <div className="my-4 flex items-center gap-3">
                  <div className="flex-1 border-t border-brand-border" />
                  <span className="text-[10px] font-medium text-brand-text-tertiary">
                    {formatDateDivider(group.date)}
                  </span>
                  <div className="flex-1 border-t border-brand-border" />
                </div>

                {/* Messages in this group */}
                <div className="space-y-2">
                  {group.messages.map((msg) => {
                    const isSent = msg.fromId === user?.id
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex",
                          isSent ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-2.5",
                            isSent
                              ? "rounded-br-md bg-brand-primary text-primary-foreground"
                              : "rounded-bl-md bg-brand-bg-secondary text-brand-text-primary"
                          )}
                        >
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <p
                            className={cn(
                              "mt-1 text-[10px]",
                              isSent ? "text-primary-foreground/60" : "text-brand-text-tertiary"
                            )}
                          >
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="border-t border-brand-border bg-brand-bg-secondary/95 px-4 py-3 backdrop-blur-lg safe-area-pb">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="h-10 flex-1 rounded-full border border-brand-border bg-brand-bg-primary px-4 text-sm text-brand-text-primary placeholder:text-brand-text-tertiary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/30"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-primary-foreground transition-opacity disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
