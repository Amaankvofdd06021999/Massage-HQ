# Room/Bed Image Improvements

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix broken room images with proper fallbacks, and add file upload capability for managers.

**Architecture:** Create a Next.js API route for image uploads that saves to `public/uploads/rooms/`. Improve the admin RoomModal with upload button + better URL input. Add error fallbacks to all `<img>` tags rendering room images.

**Tech Stack:** Next.js App Router API routes, FormData/multipart, native `<input type="file">`, Tailwind CSS

---

### Task 1: Create Upload API Route

**Files:**
- Create: `app/api/upload/route.ts`

**Step 1: Create the API route**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  // Validate type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type. Use JPG, PNG, or WebP." }, { status: 400 })
  }

  // Validate size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Generate unique filename
  const ext = file.name.split(".").pop() || "jpg"
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const uploadDir = path.join(process.cwd(), "public", "uploads", "rooms")
  await mkdir(uploadDir, { recursive: true })

  const filePath = path.join(uploadDir, filename)
  await writeFile(filePath, buffer)

  return NextResponse.json({ url: `/uploads/rooms/${filename}` })
}
```

**Step 2: Verify by running dev server and confirming no errors**

---

### Task 2: Add Image Upload to Admin RoomModal

**Files:**
- Modify: `app/admin/services/page.tsx` (RoomModal component, lines 329-454)

**Step 1: Add upload state and handler**

Add to RoomModal after the `setField` function:
- `const [uploading, setUploading] = useState(false)` state
- Import `Upload, Loader2` from lucide-react (add to existing import)
- File input ref: `const fileInputRef = useRef<HTMLInputElement>(null)`
- Import `useRef` from react

Upload handler function:
```typescript
async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0]
  if (!file) return
  setUploading(true)
  try {
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: formData })
    const data = await res.json()
    if (res.ok) {
      setField("image", data.url)
    } else {
      alert(data.error || "Upload failed")
    }
  } catch {
    alert("Upload failed")
  } finally {
    setUploading(false)
  }
}
```

**Step 2: Replace the image input section (lines 424-436)**

Replace the current image URL input area with:
- Label row with "Room Image (Optional)"
- URL input with paste support (keep existing)
- "Upload Image" button that triggers hidden file input
- Hidden `<input type="file" accept="image/jpeg,image/png,image/webp">`
- Loading spinner while uploading
- Image preview with "Remove" button (X icon) to clear the image

New JSX structure:
```tsx
<div>
  <label className="mb-1 block text-xs font-medium text-brand-text-secondary">{t("roomImage")} ({t("optional")})</label>

  {/* URL input row */}
  <div className="flex items-center gap-2">
    <ImageIcon size={14} className="shrink-0 text-brand-text-tertiary" />
    <input value={draft.image} onChange={(e) => setField("image", e.target.value)}
      placeholder="https://example.com/room-photo.jpg"
      className="w-full rounded-xl border border-brand-border bg-brand-bg-tertiary px-3 py-2.5 text-sm text-brand-text-primary outline-none focus:border-brand-primary/50 placeholder-brand-text-tertiary" />
  </div>

  {/* Upload button */}
  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-border bg-brand-bg-tertiary py-3 text-sm text-brand-text-secondary hover:border-brand-primary/50 hover:text-brand-primary transition-colors disabled:opacity-50">
    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
    {uploading ? "Uploading…" : "Upload from device"}
  </button>
  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileUpload} />

  {/* Preview with remove */}
  {draft.image && (
    <div className="relative mt-2 h-32 w-full overflow-hidden rounded-xl border border-brand-border">
      <img src={draft.image} alt="Room preview" className="h-full w-full object-cover"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
      <button type="button" onClick={() => setField("image", "")}
        className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
        <X size={12} />
      </button>
    </div>
  )}
</div>
```

**Step 3: Commit**

---

### Task 3: Fix Image Fallbacks on RoomCard (Admin)

**Files:**
- Modify: `app/admin/services/page.tsx` (RoomCard component, lines 566-569)

**Step 1: Add onError fallback to RoomCard img**

Replace line 568:
```tsx
<img src={room.image} alt={room.name} className="h-full w-full object-cover" />
```
With:
```tsx
<img src={room.image} alt={room.name} className="h-full w-full object-cover"
  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
```

---

### Task 4: Fix Image Fallbacks on Customer Booking Page

**Files:**
- Modify: `app/(customer)/book/page.tsx` (room selection, line 563)

**Step 1: Add onError fallback to booking room img**

Replace line 563:
```tsx
<img src={room.image} alt={room.name} className="h-full w-full object-cover" />
```
With:
```tsx
<img src={room.image} alt={room.name} className="h-full w-full object-cover"
  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
```

---

### Task 5: Add Translation Keys

**Files:**
- Modify: `lib/i18n/translations.ts`

**Step 1: Add new translation keys for upload UI**

Add these keys in all 4 language blocks:
- `uploadFromDevice`: EN "Upload from device" / TH "อัปโหลดจากอุปกรณ์" / KO "기기에서 업로드" / JA "デバイスからアップロード"
- `uploading`: EN "Uploading…" / TH "กำลังอัปโหลด…" / KO "업로드 중…" / JA "アップロード中…"
- `removeImage`: EN "Remove image" / TH "ลบรูปภาพ" / KO "이미지 제거" / JA "画像を削除"

---

### Task 6: Verify Everything Works

**Step 1:** Run `npx tsc --noEmit` to verify no type errors
**Step 2:** Test dev server loads without errors
**Step 3:** Commit all changes
