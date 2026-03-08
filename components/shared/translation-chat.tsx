"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Globe, Mic, Send } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"
import { translationPhrases, mockTranslate } from "@/lib/data/mock-data"
import type { ChatLanguage } from "@/lib/types"

interface TranslationChatProps {
  bookingId: string
  userRole: "customer" | "staff"
  userId: string
  userName: string
}

interface ChatMessage {
  id: string
  senderRole: "customer" | "staff"
  senderName: string
  originalText: string
  translatedText: string
  fromLang: ChatLanguage
  toLang: ChatLanguage
  timestamp: string
}

const LANGUAGES: { value: ChatLanguage; label: string }[] = [
  { value: "english", label: "English" },
  { value: "thai", label: "Thai" },
  { value: "japanese", label: "Japanese" },
  { value: "mandarin", label: "Mandarin" },
  { value: "korean", label: "Korean" },
  { value: "german", label: "German" },
]

// Mock therapist auto-replies
const THERAPIST_REPLIES: Record<string, string[]> = {
  english: [
    "Of course, I'll adjust the pressure.",
    "How does that feel now?",
    "Let me know if you need anything.",
    "We have about 30 minutes remaining.",
    "I'll focus on that area.",
    "Sure, no problem at all.",
    "Is the temperature comfortable?",
  ],
  thai: [
    "\u0E44\u0E14\u0E49\u0E40\u0E25\u0E22\u0E04\u0E48\u0E30 \u0E08\u0E30\u0E1B\u0E23\u0E31\u0E1A\u0E41\u0E23\u0E07\u0E01\u0E14\u0E43\u0E2B\u0E49\u0E19\u0E30\u0E04\u0E30",
    "\u0E15\u0E2D\u0E19\u0E19\u0E35\u0E49\u0E23\u0E39\u0E49\u0E2A\u0E36\u0E01\u0E22\u0E31\u0E07\u0E44\u0E07\u0E1A\u0E49\u0E32\u0E07\u0E04\u0E30?",
    "\u0E1A\u0E2D\u0E01\u0E44\u0E14\u0E49\u0E40\u0E25\u0E22\u0E19\u0E30\u0E04\u0E30\u0E16\u0E49\u0E32\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E2D\u0E30\u0E44\u0E23",
    "\u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E40\u0E27\u0E25\u0E32\u0E2D\u0E35\u0E01\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13 30 \u0E19\u0E32\u0E17\u0E35\u0E04\u0E48\u0E30",
    "\u0E08\u0E30\u0E40\u0E19\u0E49\u0E19\u0E1A\u0E23\u0E34\u0E40\u0E27\u0E13\u0E19\u0E31\u0E49\u0E19\u0E43\u0E2B\u0E49\u0E19\u0E30\u0E04\u0E30",
    "\u0E44\u0E14\u0E49\u0E40\u0E25\u0E22\u0E04\u0E48\u0E30 \u0E44\u0E21\u0E48\u0E21\u0E35\u0E1B\u0E31\u0E0D\u0E2B\u0E32",
    "\u0E2D\u0E38\u0E13\u0E2B\u0E20\u0E39\u0E21\u0E34\u0E2A\u0E1A\u0E32\u0E22\u0E14\u0E35\u0E44\u0E2B\u0E21\u0E04\u0E30?",
  ],
  japanese: [
    "\u3082\u3061\u308D\u3093\u3001\u5727\u3092\u8ABF\u6574\u3057\u307E\u3059\u3002",
    "\u4ECA\u306F\u3069\u3046\u611F\u3058\u307E\u3059\u304B\uFF1F",
    "\u4F55\u304B\u5FC5\u8981\u306A\u3082\u306E\u304C\u3042\u308C\u3070\u304A\u77E5\u3089\u305B\u304F\u3060\u3055\u3044\u3002",
    "\u6B8B\u308A\u7D0430\u5206\u3067\u3059\u3002",
    "\u305D\u306E\u90E8\u5206\u306B\u96C6\u4E2D\u3057\u307E\u3059\u3002",
    "\u306F\u3044\u3001\u554F\u984C\u3042\u308A\u307E\u305B\u3093\u3002",
    "\u6E29\u5EA6\u306F\u5FEB\u9069\u3067\u3059\u304B\uFF1F",
  ],
  mandarin: [
    "\u597D\u7684\uFF0C\u6211\u6765\u8C03\u6574\u529B\u5EA6\u3002",
    "\u73B0\u5728\u611F\u89C9\u600E\u4E48\u6837\uFF1F",
    "\u6709\u4EC0\u4E48\u9700\u8981\u8BF7\u544A\u8BC9\u6211\u3002",
    "\u8FD8\u5269\u5927\u7EA630\u5206\u949F\u3002",
    "\u6211\u4F1A\u91CD\u70B9\u6309\u6469\u90A3\u4E2A\u90E8\u4F4D\u3002",
    "\u597D\u7684\uFF0C\u6CA1\u95EE\u9898\u3002",
    "\u6E29\u5EA6\u8212\u9002\u5417\uFF1F",
  ],
  korean: [
    "\uB124, \uC555\uB825\uC744 \uC870\uC808\uD560\uAC8C\uC694.",
    "\uC9C0\uAE08 \uAE30\uBD84\uC774 \uC5B4\uB5A0\uC138\uC694?",
    "\uD544\uC694\uD55C \uAC83\uC774 \uC788\uC73C\uBA74 \uB9D0\uC500\uD574\uC8FC\uC138\uC694.",
    "\uC57D 30\uBD84 \uC815\uB3C4 \uB0A8\uC558\uC5B4\uC694.",
    "\uADF8 \uBD80\uC704\uC5D0 \uC9D1\uC911\uD560\uAC8C\uC694.",
    "\uB124, \uBB38\uC81C\uC5C6\uC5B4\uC694.",
    "\uC628\uB3C4\uAC00 \uD3B8\uC548\uD558\uC2E0\uAC00\uC694?",
  ],
  german: [
    "Nat\u00FCrlich, ich passe den Druck an.",
    "Wie f\u00FChlt sich das jetzt an?",
    "Lassen Sie mich wissen, wenn Sie etwas brauchen.",
    "Wir haben noch etwa 30 Minuten.",
    "Ich werde mich auf diesen Bereich konzentrieren.",
    "Kein Problem.",
    "Ist die Temperatur angenehm?",
  ],
}

export function TranslationChat({ bookingId, userRole, userId, userName }: TranslationChatProps) {
  const { t } = useLanguage()
  const [myLang, setMyLang] = useState<ChatLanguage>("english")
  const [theirLang, setTheirLang] = useState<ChatLanguage>("thai")
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const storageKey = `koko-chat-${bookingId}`

  // Load messages from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) setMessages(JSON.parse(stored))
  }, [storageKey])

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages))
    }
  }, [messages, storageKey])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = useCallback(() => {
    if (!input.trim()) return

    const translated = mockTranslate(input.trim(), myLang, theirLang)
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderRole: userRole,
      senderName: userName,
      originalText: input.trim(),
      translatedText: translated,
      fromLang: myLang,
      toLang: theirLang,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, newMsg])
    setInput("")

    // Simulate auto-reply from the other party after 1.5s
    const otherRole = userRole === "customer" ? "staff" : "customer"
    const otherName = userRole === "customer" ? "Therapist" : "Customer"
    const replies = THERAPIST_REPLIES[theirLang] || THERAPIST_REPLIES.english
    const randomReply = replies[Math.floor(Math.random() * replies.length)]
    const replyTranslated = mockTranslate(randomReply, theirLang, myLang)

    setTimeout(() => {
      const reply: ChatMessage = {
        id: `msg-${Date.now()}-reply`,
        senderRole: otherRole,
        senderName: otherName,
        originalText: randomReply,
        translatedText: replyTranslated,
        fromLang: theirLang,
        toLang: myLang,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, reply])
    }, 1500)
  }, [input, myLang, theirLang, userRole, userName])

  const handleVoice = useCallback(() => {
    // Simulate voice input with a random phrase
    const phrases = translationPhrases[myLang]
    if (phrases) {
      const keys = Object.values(phrases)
      const randomPhrase = keys[Math.floor(Math.random() * keys.length)]
      setInput(randomPhrase)
    }
  }, [myLang])

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-brand-border bg-card p-4 text-left transition-all hover:border-brand-primary/30"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/15">
          <Globe size={20} className="text-brand-blue" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-brand-text-primary">{t("liveTranslation")}</p>
          <p className="text-xs text-brand-text-secondary">{t("typeMessage")}</p>
        </div>
      </button>
    )
  }

  return (
    <div className="rounded-2xl border border-brand-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-border bg-brand-bg-secondary px-4 py-3">
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-brand-blue" />
          <span className="text-sm font-semibold text-brand-text-primary">{t("liveTranslation")}</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-xs text-brand-text-secondary hover:text-brand-text-primary"
        >
          {t("cancel")}
        </button>
      </div>

      {/* Language selectors */}
      <div className="flex items-center gap-2 border-b border-brand-border px-4 py-2">
        <div className="flex-1">
          <label className="text-[10px] uppercase tracking-wider text-brand-text-tertiary">{t("yourLanguage")}</label>
          <select
            value={myLang}
            onChange={(e) => setMyLang(e.target.value as ChatLanguage)}
            className="mt-0.5 w-full rounded-lg border border-brand-border bg-brand-bg-secondary px-2 py-1.5 text-sm text-brand-text-primary"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>
        <div className="mt-4 text-brand-text-tertiary">{"\u2194"}</div>
        <div className="flex-1">
          <label className="text-[10px] uppercase tracking-wider text-brand-text-tertiary">{t("theirLanguage")}</label>
          <select
            value={theirLang}
            onChange={(e) => setTheirLang(e.target.value as ChatLanguage)}
            className="mt-0.5 w-full rounded-lg border border-brand-border bg-brand-bg-secondary px-2 py-1.5 text-sm text-brand-text-primary"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-2 p-4" style={{ maxHeight: "300px", overflowY: "auto" }}>
        {messages.length === 0 && (
          <p className="py-6 text-center text-xs text-brand-text-tertiary">{t("typeMessage")}</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderRole === userRole
          return (
            <div key={msg.id} className={cn("flex flex-col max-w-[80%]", isMe ? "self-end items-end" : "self-start items-start")}>
              <span className="mb-0.5 text-[10px] text-brand-text-tertiary">{msg.senderName}</span>
              <div className={cn(
                "rounded-2xl px-3 py-2",
                isMe ? "bg-brand-primary text-brand-primary-foreground" : "bg-brand-bg-secondary text-brand-text-primary"
              )}>
                <p className="text-sm">{msg.originalText}</p>
              </div>
              <div className={cn(
                "mt-1 rounded-xl px-2.5 py-1.5",
                isMe ? "bg-brand-primary/10" : "bg-brand-bg-tertiary"
              )}>
                <p className="text-xs text-brand-text-secondary italic">{msg.translatedText}</p>
              </div>
              <span className="mt-0.5 text-[10px] text-brand-text-tertiary">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex items-center gap-2 border-t border-brand-border px-3 py-2">
        <button
          type="button"
          onClick={handleVoice}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-border text-brand-text-secondary hover:bg-brand-bg-tertiary transition-colors"
          title={t("voiceInput")}
        >
          <Mic size={16} />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend() }}
          placeholder={t("typeMessage")}
          className="flex-1 rounded-xl border border-brand-border bg-brand-bg-secondary px-3 py-2 text-sm text-brand-text-primary placeholder:text-brand-text-tertiary focus:border-brand-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary text-brand-primary-foreground disabled:opacity-50 transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
