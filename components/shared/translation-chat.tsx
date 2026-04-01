"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Globe, Mic, Send, ArrowLeftRight, ChevronDown, MessageCircle } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"
import { useShopData } from "@/lib/data/shop-data"
import type { ChatLanguage } from "@/lib/types"

function translateWithPhrases(
  text: string, fromLang: string, toLang: string,
  phrases: Record<string, Record<string, string>>,
): string {
  if (fromLang === toLang) return text
  const fromPhrases = phrases[fromLang]
  const toPhrases = phrases[toLang]
  if (fromPhrases && toPhrases) {
    for (const [engKey, localText] of Object.entries(fromPhrases)) {
      if (localText.toLowerCase() === text.toLowerCase()) {
        return toPhrases[engKey] || text
      }
    }
  }
  return `[${toLang}] ${text}`
}

interface TranslationChatProps {
  bookingId: string
  userRole: "customer" | "staff"
  userId: string
  userName: string
  alwaysOpen?: boolean
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

const LANG_FLAGS: Record<ChatLanguage, string> = {
  english: "EN",
  thai: "TH",
  japanese: "JP",
  mandarin: "CN",
  korean: "KR",
  german: "DE",
  french: "FR",
  russian: "RU",
}

const LANG_LABELS: Record<ChatLanguage, string> = {
  english: "English",
  thai: "ไทย",
  japanese: "日本語",
  mandarin: "中文",
  korean: "한국어",
  german: "Deutsch",
  french: "Français",
  russian: "Русский",
}

const ALL_LANGUAGES: ChatLanguage[] = ["english", "thai", "japanese", "mandarin", "korean", "german", "french", "russian"]

// Quick phrases grouped by category
const QUICK_PHRASES: Record<string, { key: string; phrases: Record<ChatLanguage, string> }[]> = {
  pressure: [
    {
      key: "more-pressure",
      phrases: { english: "More pressure please", thai: "กดแรงขึ้นหน่อยค่ะ", japanese: "もっと強くお願いします", mandarin: "请加大力度", korean: "더 세게 해주세요", german: "Bitte mehr Druck", french: "Plus de pression s'il vous plaît", russian: "Пожалуйста, нажмите сильнее" },
    },
    {
      key: "less-pressure",
      phrases: { english: "Less pressure please", thai: "กดเบาลงหน่อยค่ะ", japanese: "もう少し弱くお願いします", mandarin: "请轻一点", korean: "좀 더 약하게 해주세요", german: "Bitte weniger Druck", french: "Moins de pression s'il vous plaît", russian: "Пожалуйста, нажмите мягче" },
    },
  ],
  focus: [
    {
      key: "focus-shoulders",
      phrases: { english: "Can you focus on my shoulders?", thai: "ช่วยเน้นที่ไหล่หน่อยได้ไหมคะ?", japanese: "肩を重点的にお願いします", mandarin: "可以重点按摩肩膀吗？", korean: "어깨 위주로 해주세요", german: "Können Sie sich auf meine Schultern konzentrieren?", french: "Pouvez-vous vous concentrer sur mes épaules ?", russian: "Можете сосредоточиться на плечах?" },
    },
    {
      key: "focus-back",
      phrases: { english: "Can you focus on my back?", thai: "ช่วยเน้นที่หลังหน่อยได้ไหมคะ?", japanese: "背中を重点的にお願いします", mandarin: "可以重点按摩背部吗？", korean: "등 위주로 해주세요", german: "Können Sie sich auf meinen Rücken konzentrieren?", french: "Pouvez-vous vous concentrer sur mon dos ?", russian: "Можете сосредоточиться на спине?" },
    },
    {
      key: "pain-here",
      phrases: { english: "I have pain here", thai: "เจ็บตรงนี้ค่ะ", japanese: "ここが痛いです", mandarin: "这里疼", korean: "여기가 아파요", german: "Hier habe ich Schmerzen", french: "J'ai mal ici", russian: "Здесь болит" },
    },
  ],
  comfort: [
    {
      key: "feels-great",
      phrases: { english: "That feels wonderful", thai: "รู้สึกดีมากค่ะ", japanese: "とても気持ちいいです", mandarin: "感觉太好了", korean: "너무 좋아요", german: "Das fühlt sich wunderbar an", french: "C'est merveilleux", russian: "Чудесные ощущения" },
    },
    {
      key: "too-cold",
      phrases: { english: "The room is too cold", thai: "ห้องเย็นเกินไปค่ะ", japanese: "部屋が寒すぎます", mandarin: "房间太冷了", korean: "방이 너무 추워요", german: "Der Raum ist zu kalt", french: "La pièce est trop froide", russian: "В комнате слишком холодно" },
    },
    {
      key: "water",
      phrases: { english: "Can I have some water?", thai: "ขอน้ำหน่อยได้ไหมคะ?", japanese: "お水をいただけますか？", mandarin: "可以给我一杯水吗？", korean: "물 좀 주시겠어요?", german: "Kann ich etwas Wasser haben?", french: "Puis-je avoir de l'eau ?", russian: "Можно воды?" },
    },
  ],
  general: [
    {
      key: "thank-you",
      phrases: { english: "Thank you", thai: "ขอบคุณค่ะ", japanese: "ありがとうございます", mandarin: "谢谢", korean: "감사합니다", german: "Danke schön", french: "Merci beaucoup", russian: "Спасибо" },
    },
    {
      key: "time-left",
      phrases: { english: "How much time is left?", thai: "เหลือเวลาอีกเท่าไหร่คะ?", japanese: "残り時間はどのくらいですか？", mandarin: "还剩多少时间？", korean: "시간이 얼마나 남았나요?", german: "Wie viel Zeit ist noch übrig?", french: "Combien de temps reste-t-il ?", russian: "Сколько времени осталось?" },
    },
    {
      key: "need-break",
      phrases: { english: "I need a break", thai: "ขอพักหน่อยค่ะ", japanese: "少し休憩をください", mandarin: "我需要休息一下", korean: "잠깐 쉬어야 해요", german: "Ich brauche eine Pause", french: "J'ai besoin d'une pause", russian: "Мне нужен перерыв" },
    },
  ],
}

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
    "ได้เลยค่ะ จะปรับแรงกดให้นะคะ",
    "ตอนนี้รู้สึกยังไงบ้างคะ?",
    "บอกได้เลยนะคะถ้าต้องการอะไร",
    "เหลือเวลาอีกประมาณ 30 นาทีค่ะ",
    "จะเน้นบริเวณนั้นให้นะคะ",
    "ได้เลยค่ะ ไม่มีปัญหา",
    "อุณหภูมิสบายดีไหมคะ?",
  ],
  japanese: [
    "もちろん、圧を調整します。",
    "今はどう感じますか？",
    "何か必要なものがあればお知らせください。",
    "残り約30分です。",
    "その部分に集中します。",
    "はい、問題ありません。",
    "温度は快適ですか？",
  ],
  mandarin: [
    "好的，我来调整力度。",
    "现在感觉怎么样？",
    "有什么需要请告诉我。",
    "还剩大约30分钟。",
    "我会重点按摩那个部位。",
    "好的，没问题。",
    "温度舒适吗？",
  ],
  korean: [
    "네, 압력을 조절할게요.",
    "지금 기분이 어떠세요?",
    "필요한 것이 있으면 말씀해주세요.",
    "약 30분 정도 남았어요.",
    "그 부위에 집중할게요.",
    "네, 문제없어요.",
    "온도가 편안하신가요?",
  ],
  german: [
    "Natürlich, ich passe den Druck an.",
    "Wie fühlt sich das jetzt an?",
    "Lassen Sie mich wissen, wenn Sie etwas brauchen.",
    "Wir haben noch etwa 30 Minuten.",
    "Ich werde mich auf diesen Bereich konzentrieren.",
    "Kein Problem.",
    "Ist die Temperatur angenehm?",
  ],
  french: [
    "Bien sûr, je vais ajuster la pression.",
    "Comment vous sentez-vous maintenant ?",
    "N'hésitez pas si vous avez besoin de quoi que ce soit.",
    "Il reste environ 30 minutes.",
    "Je vais me concentrer sur cette zone.",
    "Bien sûr, aucun problème.",
    "La température est-elle confortable ?",
  ],
  russian: [
    "Конечно, я отрегулирую давление.",
    "Как вы себя чувствуете сейчас?",
    "Дайте знать, если вам что-нибудь нужно.",
    "Осталось примерно 30 минут.",
    "Сосредоточусь на этой области.",
    "Конечно, без проблем.",
    "Вам комфортна температура?",
  ],
}

export function TranslationChat({ bookingId, userRole, userId, userName, alwaysOpen }: TranslationChatProps) {
  const { t } = useLanguage()
  const { translationPhrases } = useShopData()
  const [myLang, setMyLang] = useState<ChatLanguage>("english")
  const [theirLang, setTheirLang] = useState<ChatLanguage>("thai")
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isOpen, setIsOpen] = useState(alwaysOpen ?? false)
  const [showQuickPhrases, setShowQuickPhrases] = useState(true)
  const [showMyLangPicker, setShowMyLangPicker] = useState(false)
  const [showTheirLangPicker, setShowTheirLangPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const storageKey = `koko-chat-${bookingId}`

  // Load messages from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      setMessages(JSON.parse(stored))
      setShowQuickPhrases(false)
    }
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

  const sendMessageText = useCallback((text: string) => {
    if (!text.trim()) return

    const translated = translateWithPhrases(text.trim(), myLang, theirLang, translationPhrases)
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderRole: userRole,
      senderName: userName,
      originalText: text.trim(),
      translatedText: translated,
      fromLang: myLang,
      toLang: theirLang,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, newMsg])
    setInput("")
    setShowQuickPhrases(false)

    // Simulate auto-reply
    const otherRole = userRole === "customer" ? "staff" : "customer"
    const otherName = userRole === "customer" ? "Therapist" : "Customer"
    const replies = THERAPIST_REPLIES[theirLang] || THERAPIST_REPLIES.english
    const randomReply = replies[Math.floor(Math.random() * replies.length)]
    const replyTranslated = translateWithPhrases(randomReply, theirLang, myLang, translationPhrases)

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
  }, [myLang, theirLang, userRole, userName, translationPhrases])

  const handleSend = useCallback(() => {
    sendMessageText(input)
  }, [input, sendMessageText])

  const handleQuickPhrase = useCallback((phrase: Record<ChatLanguage, string>) => {
    sendMessageText(phrase[myLang])
  }, [myLang, sendMessageText])

  const handleVoice = useCallback(() => {
    setIsRecording(true)
    // Simulate voice recording → transcription
    setTimeout(() => {
      const phrases = translationPhrases[myLang]
      if (phrases) {
        const keys = Object.values(phrases)
        const randomPhrase = keys[Math.floor(Math.random() * keys.length)]
        setInput(randomPhrase)
      }
      setIsRecording(false)
    }, 1200)
  }, [myLang])

  const swapLanguages = useCallback(() => {
    setMyLang(theirLang)
    setTheirLang(myLang)
  }, [myLang, theirLang])

  if (!isOpen && !alwaysOpen) {
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
    <div className={cn("rounded-2xl border border-brand-border bg-card overflow-hidden", alwaysOpen && "flex flex-col h-full border-0 rounded-none")}>
      {/* Header with language selector */}
      <div className="border-b border-brand-border bg-brand-bg-secondary px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Globe size={16} className="shrink-0 text-brand-blue" />

          {/* My Language */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setShowMyLangPicker(!showMyLangPicker); setShowTheirLangPicker(false) }}
              className="flex items-center gap-1 rounded-lg bg-brand-primary/10 px-2.5 py-1.5 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-primary/20"
            >
              {LANG_FLAGS[myLang]}
              <ChevronDown size={12} />
            </button>
            {showMyLangPicker && (
              <div className="absolute left-0 top-full z-20 mt-1 rounded-xl border border-brand-border bg-card py-1 shadow-lg min-w-[140px]">
                {ALL_LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => { setMyLang(lang); setShowMyLangPicker(false) }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-brand-bg-tertiary",
                      myLang === lang ? "text-brand-primary font-semibold" : "text-brand-text-primary"
                    )}
                  >
                    <span className="font-semibold w-6">{LANG_FLAGS[lang]}</span>
                    {LANG_LABELS[lang]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={swapLanguages}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand-border text-brand-text-tertiary transition-all hover:bg-brand-bg-tertiary hover:text-brand-primary active:scale-90"
            title={t("swapLanguages")}
          >
            <ArrowLeftRight size={12} />
          </button>

          {/* Their Language */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setShowTheirLangPicker(!showTheirLangPicker); setShowMyLangPicker(false) }}
              className="flex items-center gap-1 rounded-lg bg-brand-bg-tertiary px-2.5 py-1.5 text-xs font-semibold text-brand-text-secondary transition-colors hover:bg-brand-border"
            >
              {LANG_FLAGS[theirLang]}
              <ChevronDown size={12} />
            </button>
            {showTheirLangPicker && (
              <div className="absolute left-0 top-full z-20 mt-1 rounded-xl border border-brand-border bg-card py-1 shadow-lg min-w-[140px]">
                {ALL_LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => { setTheirLang(lang); setShowTheirLangPicker(false) }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-brand-bg-tertiary",
                      theirLang === lang ? "text-brand-primary font-semibold" : "text-brand-text-primary"
                    )}
                  >
                    <span className="font-semibold w-6">{LANG_FLAGS[lang]}</span>
                    {LANG_LABELS[lang]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1" />

          {!alwaysOpen && (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-brand-text-secondary hover:text-brand-text-primary"
            >
              {t("cancel")}
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        className={cn("flex flex-col gap-2 p-4 overflow-y-auto", alwaysOpen ? "flex-1" : "max-h-[300px]")}
        onClick={() => { setShowMyLangPicker(false); setShowTheirLangPicker(false) }}
      >
        {messages.length === 0 && !showQuickPhrases && (
          <p className="py-6 text-center text-xs text-brand-text-tertiary">{t("typeMessage")}</p>
        )}

        {/* Quick Phrases */}
        {messages.length === 0 && showQuickPhrases && (
          <div className="space-y-3">
            <p className="text-center text-xs text-brand-text-tertiary mb-2">{t("quickPhrases")}</p>
            {Object.entries(QUICK_PHRASES).map(([, phrases]) => (
              <div key={phrases[0].key} className="flex flex-wrap gap-1.5">
                {phrases.map((phrase) => (
                  <button
                    key={phrase.key}
                    type="button"
                    onClick={() => handleQuickPhrase(phrase.phrases)}
                    className="rounded-full border border-brand-border bg-brand-bg-tertiary/50 px-3 py-1.5 text-xs text-brand-text-secondary transition-colors hover:border-brand-primary/30 hover:bg-brand-primary/5 hover:text-brand-primary active:scale-95"
                  >
                    {phrase.phrases[myLang]}
                  </button>
                ))}
              </div>
            ))}
          </div>
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

      {/* Quick phrases toggle when there are messages */}
      {messages.length > 0 && (
        <div className="border-t border-brand-border px-3 pt-2">
          <button
            type="button"
            onClick={() => setShowQuickPhrases(!showQuickPhrases)}
            className="flex items-center gap-1.5 text-xs text-brand-text-tertiary hover:text-brand-primary transition-colors"
          >
            <MessageCircle size={12} />
            {t("quickPhrases")}
            <ChevronDown size={10} className={cn("transition-transform", showQuickPhrases && "rotate-180")} />
          </button>
          {showQuickPhrases && (
            <div className="mt-2 pb-2 flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto">
              {Object.values(QUICK_PHRASES).flat().map((phrase) => (
                <button
                  key={phrase.key}
                  type="button"
                  onClick={() => handleQuickPhrase(phrase.phrases)}
                  className="rounded-full border border-brand-border bg-brand-bg-tertiary/50 px-2.5 py-1 text-[11px] text-brand-text-secondary transition-colors hover:border-brand-primary/30 hover:text-brand-primary active:scale-95"
                >
                  {phrase.phrases[myLang]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-brand-border bg-brand-bg-secondary/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleVoice}
            disabled={isRecording}
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all",
              isRecording
                ? "bg-brand-coral text-white animate-pulse scale-110"
                : "bg-brand-primary/15 text-brand-primary hover:bg-brand-primary/25"
            )}
            title={t("voiceInput")}
          >
            <Mic size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSend() }}
            placeholder={isRecording ? t("listening") : t("typeMessage")}
            className="flex-1 rounded-xl border border-brand-border bg-card px-4 py-3 text-sm text-brand-text-primary placeholder:text-brand-text-tertiary focus:border-brand-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-primary text-brand-primary-foreground disabled:opacity-40 transition-all active:scale-90"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
