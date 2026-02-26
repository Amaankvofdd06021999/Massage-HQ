"use client"

import { useState } from "react"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ClientNoteCard } from "@/components/shared/client-note-card"
import { useNotes } from "@/lib/data/notes-store"
import { useAuth } from "@/lib/auth/auth-context"
import { cn } from "@/lib/utils"
import { Plus, X } from "lucide-react"
import type { ClientNote, NoteCategory } from "@/lib/types"

const categories: { value: NoteCategory; label: string }[] = [
  { value: "injury", label: "Injury" },
  { value: "allergy", label: "Allergy" },
  { value: "medical", label: "Medical" },
  { value: "warning", label: "⚠ Warning (Behavior)" },
  { value: "preference", label: "Preference" },
  { value: "general", label: "General" },
]

export function ClientNotesPanel({
  customerId,
  customerName,
  open,
  onOpenChange,
}: {
  customerId: string
  customerName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { getNotesForCustomer, addNote, updateNote, deleteNote } = useNotes()
  const { user } = useAuth()

  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState<ClientNote | null>(null)
  const [category, setCategory] = useState<NoteCategory>("general")
  const [content, setContent] = useState("")
  const [isPinned, setIsPinned] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const allNotes = getNotesForCustomer(customerId)
  const pinnedNotes = allNotes.filter((n) => n.isPinned)
  const unpinnedNotes = allNotes.filter((n) => !n.isPinned)
  const sortedNotes = [...pinnedNotes, ...unpinnedNotes]

  function resetForm() {
    setContent("")
    setCategory("general")
    setIsPinned(false)
    setShowForm(false)
    setEditingNote(null)
  }

  function handleSubmit() {
    if (!content.trim() || !user) return

    if (editingNote) {
      updateNote(editingNote.id, {
        content: content.trim(),
        category,
        isPinned,
      })
    } else {
      addNote({
        customerId,
        authorId: user.id,
        authorName: user.name,
        authorRole: user.role === "manager" ? "manager" : "staff",
        content: content.trim(),
        category,
        isPinned,
      })
    }
    resetForm()
  }

  function handleEdit(note: ClientNote) {
    setEditingNote(note)
    setContent(note.content)
    setCategory(note.category)
    setIsPinned(note.isPinned)
    setShowForm(true)
  }

  function handleDelete(id: string) {
    if (deleteConfirmId === id) {
      deleteNote(id)
      setDeleteConfirmId(null)
    } else {
      setDeleteConfirmId(id)
      setTimeout(() => setDeleteConfirmId(null), 3000)
    }
  }

  function handleTogglePin(id: string) {
    const note = allNotes.find((n) => n.id === id)
    if (note) {
      updateNote(id, { isPinned: !note.isPinned })
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); resetForm(); setDeleteConfirmId(null) }}>
      <SheetContent
        side="right"
        className="flex w-full flex-col sm:max-w-md border-brand-border bg-brand-bg-secondary p-0"
      >
        <SheetHeader className="border-b border-brand-border p-4">
          <SheetTitle className="text-brand-text-primary">
            Client Notes
          </SheetTitle>
          <p className="text-sm text-brand-text-secondary">{customerName}</p>
        </SheetHeader>

        {/* Add / Edit form */}
        <div className="border-b border-brand-border p-4">
          {showForm ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-brand-text-primary">
                  {editingNote ? "Edit Note" : "Add Note"}
                </p>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-brand-text-tertiary hover:bg-brand-bg-tertiary hover:text-brand-text-primary"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-brand-text-tertiary">Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as NoteCategory)}>
                  <SelectTrigger className="w-full border-brand-border bg-card text-brand-text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-brand-text-tertiary">Note</Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write a note about this client..."
                  className="min-h-20 border-brand-border bg-card text-brand-text-primary placeholder:text-brand-text-tertiary"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={isPinned}
                  onCheckedChange={setIsPinned}
                  id="pin-toggle"
                />
                <Label htmlFor="pin-toggle" className="text-sm text-brand-text-secondary cursor-pointer">
                  Pin this note
                </Label>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!content.trim()}
                className="w-full"
                size="sm"
              >
                {editingNote ? "Save Changes" : "Add Note"}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 border-brand-border text-brand-text-primary hover:bg-brand-bg-tertiary"
              onClick={() => setShowForm(true)}
            >
              <Plus size={14} />
              Add Note
            </Button>
          )}
        </div>

        {/* Notes list */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="space-y-3 p-4">
            {sortedNotes.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-brand-text-tertiary">No notes yet</p>
                <p className="mt-1 text-xs text-brand-text-tertiary">
                  Add notes about injuries, preferences, allergies, or behavior warnings
                </p>
              </div>
            ) : (
              sortedNotes.map((note) => (
                <div key={note.id} className="relative">
                  <ClientNoteCard
                    note={note}
                    showActions
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTogglePin={handleTogglePin}
                  />
                  {deleteConfirmId === note.id && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-brand-bg-secondary/90 backdrop-blur-sm">
                      <div className="text-center">
                        <p className="text-sm font-medium text-brand-text-primary">Delete this note?</p>
                        <div className="mt-2 flex gap-2 justify-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(note.id)}
                          >
                            Delete
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-brand-border text-brand-text-secondary"
                            onClick={() => setDeleteConfirmId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
