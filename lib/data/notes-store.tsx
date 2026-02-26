"use client"

import {
  createContext, useContext, useState, useCallback, useEffect, type ReactNode,
} from "react"
import type { ClientNote, NoteCategory } from "@/lib/types"
import { clientNotes as SEED_NOTES } from "@/lib/data/mock-data"

const NOTES_KEY = "koko-client-notes"

interface NotesContextType {
  clientNotes: ClientNote[]
  addNote: (note: Omit<ClientNote, "id" | "createdAt" | "updatedAt">) => void
  updateNote: (id: string, patch: Partial<Omit<ClientNote, "id" | "createdAt">>) => void
  deleteNote: (id: string) => void
  getNotesForCustomer: (customerId: string) => ClientNote[]
  getPinnedNotes: (customerId: string) => ClientNote[]
  getNotesByCategory: (customerId: string, category: NoteCategory) => ClientNote[]
}

const NotesContext = createContext<NotesContextType | undefined>(undefined)

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

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<ClientNote[]>(SEED_NOTES)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setNotes(load(NOTES_KEY, SEED_NOTES))
    setReady(true)
  }, [])

  useEffect(() => { if (ready) save(NOTES_KEY, notes) }, [notes, ready])

  const addNote = useCallback((note: Omit<ClientNote, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString()
    setNotes((prev) => [...prev, { ...note, id: genId("cn"), createdAt: now, updatedAt: now }])
  }, [])

  const updateNote = useCallback((id: string, patch: Partial<Omit<ClientNote, "id" | "createdAt">>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n))
    )
  }, [])

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const getNotesForCustomer = useCallback(
    (customerId: string) => notes.filter((n) => n.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notes]
  )

  const getPinnedNotes = useCallback(
    (customerId: string) => notes.filter((n) => n.customerId === customerId && n.isPinned),
    [notes]
  )

  const getNotesByCategory = useCallback(
    (customerId: string, category: NoteCategory) =>
      notes.filter((n) => n.customerId === customerId && n.category === category),
    [notes]
  )

  return (
    <NotesContext.Provider value={{
      clientNotes: notes, addNote, updateNote, deleteNote,
      getNotesForCustomer, getPinnedNotes, getNotesByCategory,
    }}>
      {children}
    </NotesContext.Provider>
  )
}

export function useNotes() {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error("useNotes must be used within NotesProvider")
  return ctx
}
