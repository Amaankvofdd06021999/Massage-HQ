"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { MessageSquare, Send, ArrowLeft, User } from "lucide-react"
import { StaffAvatar } from "@/components/shared/staff-avatar"
import { Button } from "@/components/ui/button"
import { useMessages } from "@/lib/data/messages-store"
import { useAuth } from "@/lib/auth/auth-context"
import { useShopData } from "@/lib/data/shop-data"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"

export default function AdminMessagesPage() {
  const { t } = useLanguage()
  const { staffMembers } = useShopData()
  const { user } = useAuth()
  const {
    getConversation, sendMessage, markConversationRead, getConversationPartners,
  } = useMessages()

  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [messageText, setMessageText] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentUserId = user?.id ?? "manager-1"
  const currentUserName = user?.name ?? "Manager"

  // Build staff list with unread counts
  const partners = getConversationPartners(currentUserId)

  const staffList = useMemo(() => {
    return staffMembers.map((staff) => {
      const partner = partners.find((p) => p.id === staff.id)
      return {
        ...staff,
        unread: partner?.unread ?? 0,
        lastMessage: partner?.lastMessage ?? null,
      }
    }).sort((a, b) => {
      // Staff with messages first, then by most recent
      if (a.lastMessage && !b.lastMessage) return -1
      if (!a.lastMessage && b.lastMessage) return 1
      if (a.lastMessage && b.lastMessage) {
        return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
      }
      return 0
    })
  }, [partners])

  const selectedStaff = staffMembers.find((s) => s.id === selectedStaffId)
  const conversation = selectedStaffId
    ? getConversation(currentUserId, selectedStaffId)
    : []

  const totalUnread = staffList.reduce((sum, s) => sum + s.unread, 0)

  // Mark messages as read when conversation opened
  useEffect(() => {
    if (selectedStaffId) {
      markConversationRead(currentUserId, selectedStaffId)
    }
  }, [selectedStaffId, currentUserId, markConversationRead])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation.length])

  // Focus input when selecting a conversation
  useEffect(() => {
    if (selectedStaffId) {
      inputRef.current?.focus()
    }
  }, [selectedStaffId])

  function handleSend() {
    if (!messageText.trim() || !selectedStaffId || !selectedStaff) return
    sendMessage({
      fromId: currentUserId,
      fromName: currentUserName,
      toId: selectedStaffId,
      toName: selectedStaff.nickname || selectedStaff.name,
      content: messageText.trim(),
    })
    setMessageText("")
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = date.toDateString() === yesterday.toDateString()

    if (isToday) {
      return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    }
    if (isYesterday) {
      return `Yesterday ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
    }
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Group messages by date
  function getDateHeader(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    if (date.toDateString() === now.toDateString()) return "Today"
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
    return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/15">
          <MessageSquare size={20} className="text-brand-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-brand-text-primary">Messages</h1>
          <p className="mt-0.5 text-sm text-brand-text-secondary">
            {totalUnread > 0 ? `${totalUnread} unread message${totalUnread > 1 ? "s" : ""}` : "Staff communications"}
          </p>
        </div>
      </div>

      {/* Messages layout */}
      <div className="mt-5 flex h-[calc(100vh-12rem)] overflow-hidden rounded-2xl border border-brand-border">
        {/* Left: Staff list */}
        <div
          className={cn(
            "w-full border-r border-brand-border bg-card md:w-80 md:block",
            selectedStaffId ? "hidden md:block" : "block"
          )}
        >
          <div className="border-b border-brand-border px-4 py-3">
            <p className="text-sm font-semibold text-brand-text-primary">Staff</p>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 16rem)" }}>
            {staffList.map((staff) => (
              <button
                key={staff.id}
                type="button"
                onClick={() => setSelectedStaffId(staff.id)}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-brand-border px-4 py-3 text-left transition-colors",
                  selectedStaffId === staff.id
                    ? "bg-brand-primary/10"
                    : "hover:bg-brand-bg-tertiary/50"
                )}
              >
                <StaffAvatar
                  src={staff.avatar}
                  name={staff.name}
                  size="sm"
                  available={staff.isAvailableToday}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-brand-text-primary">
                      {staff.nickname || staff.name}
                    </p>
                    {staff.unread > 0 && (
                      <span className="ml-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-bold text-primary-foreground">
                        {staff.unread}
                      </span>
                    )}
                  </div>
                  {staff.lastMessage ? (
                    <p className="mt-0.5 truncate text-xs text-brand-text-tertiary">
                      {staff.lastMessage.fromId === currentUserId ? "You: " : ""}
                      {staff.lastMessage.content}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-brand-text-tertiary italic">No messages yet</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Conversation */}
        <div
          className={cn(
            "flex flex-1 flex-col bg-brand-bg-secondary",
            !selectedStaffId ? "hidden md:flex" : "flex"
          )}
        >
          {selectedStaff ? (
            <>
              {/* Conversation header */}
              <div className="flex items-center gap-3 border-b border-brand-border px-4 py-3">
                <button
                  type="button"
                  onClick={() => setSelectedStaffId(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-text-tertiary hover:bg-brand-bg-tertiary md:hidden"
                >
                  <ArrowLeft size={18} />
                </button>
                <StaffAvatar
                  src={selectedStaff.avatar}
                  name={selectedStaff.name}
                  size="sm"
                  available={selectedStaff.isAvailableToday}
                />
                <div>
                  <p className="text-sm font-semibold text-brand-text-primary">
                    {selectedStaff.nickname || selectedStaff.name}
                  </p>
                  <p className="text-xs text-brand-text-tertiary">
                    {selectedStaff.name}
                    {selectedStaff.isAvailableToday && (
                      <span className="ml-1 text-brand-green">-- Available</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {conversation.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-bg-tertiary">
                      <MessageSquare size={24} className="text-brand-text-tertiary" />
                    </div>
                    <p className="mt-3 text-sm text-brand-text-tertiary">
                      No messages yet with {selectedStaff.nickname || selectedStaff.name}
                    </p>
                    <p className="mt-1 text-xs text-brand-text-tertiary">
                      Send a message to start the conversation
                    </p>
                  </div>
                ) : (
                  <>
                    {conversation.map((msg, i) => {
                      const isFromMe = msg.fromId === currentUserId
                      const showDateHeader =
                        i === 0 ||
                        new Date(msg.createdAt).toDateString() !==
                          new Date(conversation[i - 1].createdAt).toDateString()

                      return (
                        <div key={msg.id}>
                          {showDateHeader && (
                            <div className="flex items-center gap-3 py-2">
                              <div className="flex-1 border-t border-brand-border" />
                              <span className="text-[10px] font-medium text-brand-text-tertiary">
                                {getDateHeader(msg.createdAt)}
                              </span>
                              <div className="flex-1 border-t border-brand-border" />
                            </div>
                          )}
                          <div
                            className={cn(
                              "flex",
                              isFromMe ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[75%] rounded-2xl px-4 py-2.5",
                                isFromMe
                                  ? "rounded-br-md bg-brand-primary text-primary-foreground"
                                  : "rounded-bl-md bg-brand-bg-tertiary text-brand-text-primary"
                              )}
                            >
                              <p className="text-sm leading-relaxed">{msg.content}</p>
                              <p
                                className={cn(
                                  "mt-1 text-[10px]",
                                  isFromMe
                                    ? "text-primary-foreground/60"
                                    : "text-brand-text-tertiary"
                                )}
                              >
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-brand-border p-3">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${selectedStaff.nickname || selectedStaff.name}...`}
                    className="h-10 flex-1 rounded-full border border-brand-border bg-card px-4 text-sm text-brand-text-primary placeholder:text-brand-text-tertiary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/30"
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!messageText.trim()}
                    className="h-10 w-10 shrink-0 rounded-full"
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-bg-tertiary">
                <MessageSquare size={28} className="text-brand-text-tertiary" />
              </div>
              <p className="mt-4 text-sm font-medium text-brand-text-secondary">
                Select a staff member to start messaging
              </p>
              <p className="mt-1 text-xs text-brand-text-tertiary">
                Choose from the list on the left
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
