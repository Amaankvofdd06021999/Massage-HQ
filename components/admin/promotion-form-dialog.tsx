"use client"

import { useState, useEffect } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Plus, X, Save } from "lucide-react"
import type { Promotion, PromoType, MassageType } from "@/lib/types"

const promoTypes: { value: PromoType; label: string }[] = [
  { value: "package", label: "Package" },
  { value: "happy-hour", label: "Happy Hour" },
  { value: "trial", label: "Trial" },
  { value: "loyalty", label: "Loyalty" },
  { value: "first-timer", label: "First Timer" },
  { value: "seasonal", label: "Seasonal" },
]

const badgeColors: { value: Promotion["color"]; label: string; className: string }[] = [
  { value: "green", label: "Green", className: "bg-brand-green/15 text-brand-green" },
  { value: "coral", label: "Coral", className: "bg-brand-coral/15 text-brand-coral" },
  { value: "yellow", label: "Yellow", className: "bg-brand-yellow/15 text-brand-yellow" },
  { value: "blue", label: "Blue", className: "bg-brand-blue/15 text-brand-blue" },
]

const allMassageTypes: { value: MassageType; label: string }[] = [
  { value: "thai", label: "Thai Massage" },
  { value: "swedish", label: "Swedish" },
  { value: "deep-tissue", label: "Deep Tissue" },
  { value: "aromatherapy", label: "Aromatherapy" },
  { value: "hot-stone", label: "Hot Stone" },
  { value: "sports", label: "Sports" },
  { value: "reflexology", label: "Reflexology" },
  { value: "shiatsu", label: "Shiatsu" },
]

interface FormState {
  title: string
  description: string
  type: PromoType
  discountPercent: string
  sessions: string
  originalPrice: string
  promoPrice: string
  code: string
  validFrom: string
  validUntil: string
  badge: string
  color: Promotion["color"]
  terms: string[]
  applicableServices: MassageType[]
  allServices: boolean
}

function getInitialState(promotion?: Promotion): FormState {
  if (promotion) {
    return {
      title: promotion.title,
      description: promotion.description,
      type: promotion.type,
      discountPercent: promotion.discountPercent?.toString() ?? "",
      sessions: promotion.sessions?.toString() ?? "",
      originalPrice: promotion.originalPrice?.toString() ?? "",
      promoPrice: promotion.promoPrice?.toString() ?? "",
      code: promotion.code ?? "",
      validFrom: promotion.validFrom,
      validUntil: promotion.validUntil,
      badge: promotion.badge,
      color: promotion.color,
      terms: promotion.terms,
      applicableServices: promotion.applicableServices ?? allMassageTypes.map((t) => t.value),
      allServices: !promotion.applicableServices || promotion.applicableServices.length === allMassageTypes.length,
    }
  }
  return {
    title: "",
    description: "",
    type: "package",
    discountPercent: "",
    sessions: "",
    originalPrice: "",
    promoPrice: "",
    code: "",
    validFrom: "",
    validUntil: "",
    badge: "",
    color: "green",
    terms: [],
    applicableServices: allMassageTypes.map((t) => t.value),
    allServices: true,
  }
}

export function PromotionFormDialog({
  promotion,
  open,
  onOpenChange,
  onSave,
}: {
  promotion?: Promotion
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (promo: Partial<Promotion>) => void
}) {
  const [form, setForm] = useState<FormState>(() => getInitialState(promotion))
  const [newTerm, setNewTerm] = useState("")

  useEffect(() => {
    if (open) {
      setForm(getInitialState(promotion))
      setNewTerm("")
    }
  }, [open, promotion])

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleAddTerm() {
    if (newTerm.trim()) {
      updateField("terms", [...form.terms, newTerm.trim()])
      setNewTerm("")
    }
  }

  function handleRemoveTerm(index: number) {
    updateField("terms", form.terms.filter((_, i) => i !== index))
  }

  function handleToggleAllServices(checked: boolean) {
    updateField("allServices", checked)
    if (checked) {
      updateField("applicableServices", allMassageTypes.map((t) => t.value))
    }
  }

  function handleToggleService(service: MassageType, checked: boolean) {
    const updated = checked
      ? [...form.applicableServices, service]
      : form.applicableServices.filter((s) => s !== service)
    updateField("applicableServices", updated)
    updateField("allServices", updated.length === allMassageTypes.length)
  }

  function handleSave() {
    const result: Partial<Promotion> = {
      title: form.title,
      description: form.description,
      type: form.type,
      badge: form.badge,
      color: form.color,
      terms: form.terms,
      validFrom: form.validFrom,
      validUntil: form.validUntil,
      isActive: true,
      applicableServices: form.allServices ? undefined : form.applicableServices,
    }

    if (form.discountPercent) result.discountPercent = Number(form.discountPercent)
    if (form.sessions) result.sessions = Number(form.sessions)
    if (form.originalPrice) result.originalPrice = Number(form.originalPrice)
    if (form.promoPrice) result.promoPrice = Number(form.promoPrice)
    if (form.code) result.code = form.code

    if (promotion) result.id = promotion.id

    onSave(result)
    onOpenChange(false)
  }

  const isValid = form.title.trim() && form.validFrom && form.validUntil

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-brand-border bg-brand-bg-secondary sm:max-w-xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-brand-text-primary">
            {promotion ? "Edit Promotion" : "Create Promotion"}
          </DialogTitle>
          <DialogDescription className="text-brand-text-secondary">
            {promotion ? "Update the promotion details below." : "Fill in the details for the new promotion."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto px-6">
          <div className="space-y-4 pb-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs text-brand-text-tertiary">Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g., 5-Session Package"
                className="border-brand-border bg-card text-brand-text-primary"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs text-brand-text-tertiary">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe the promotion..."
                className="min-h-16 border-brand-border bg-card text-brand-text-primary"
                rows={2}
              />
            </div>

            {/* Type + Discount row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-brand-text-tertiary">Type *</Label>
                <Select value={form.type} onValueChange={(v) => updateField("type", v as PromoType)}>
                  <SelectTrigger className="w-full border-brand-border bg-card text-brand-text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {promoTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-brand-text-tertiary">Discount %</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.discountPercent}
                  onChange={(e) => updateField("discountPercent", e.target.value)}
                  placeholder="e.g., 20"
                  className="border-brand-border bg-card text-brand-text-primary"
                />
              </div>
            </div>

            {/* Sessions + Code row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-brand-text-tertiary">Sessions</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.sessions}
                  onChange={(e) => updateField("sessions", e.target.value)}
                  placeholder="e.g., 5"
                  className="border-brand-border bg-card text-brand-text-primary"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-brand-text-tertiary">Promo Code</Label>
                <Input
                  value={form.code}
                  onChange={(e) => updateField("code", e.target.value.toUpperCase())}
                  placeholder="e.g., PACK5"
                  className="border-brand-border bg-card font-mono text-brand-text-primary"
                />
              </div>
            </div>

            {/* Prices row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-brand-text-tertiary">Original Price</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.originalPrice}
                  onChange={(e) => updateField("originalPrice", e.target.value)}
                  placeholder="e.g., 5500"
                  className="border-brand-border bg-card text-brand-text-primary"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-brand-text-tertiary">Promo Price</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.promoPrice}
                  onChange={(e) => updateField("promoPrice", e.target.value)}
                  placeholder="e.g., 4400"
                  className="border-brand-border bg-card text-brand-text-primary"
                />
              </div>
            </div>

            {/* Valid dates row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-brand-text-tertiary">Valid From *</Label>
                <Input
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => updateField("validFrom", e.target.value)}
                  className="border-brand-border bg-card text-brand-text-primary"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-brand-text-tertiary">Valid Until *</Label>
                <Input
                  type="date"
                  value={form.validUntil}
                  onChange={(e) => updateField("validUntil", e.target.value)}
                  className="border-brand-border bg-card text-brand-text-primary"
                />
              </div>
            </div>

            {/* Badge text + Badge color */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-brand-text-tertiary">Badge Text</Label>
                <Input
                  value={form.badge}
                  onChange={(e) => updateField("badge", e.target.value)}
                  placeholder="e.g., Best Value"
                  className="border-brand-border bg-card text-brand-text-primary"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-brand-text-tertiary">Badge Color</Label>
                <Select value={form.color} onValueChange={(v) => updateField("color", v as Promotion["color"])}>
                  <SelectTrigger className="w-full border-brand-border bg-card text-brand-text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {badgeColors.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <span className="flex items-center gap-2">
                          <span className={cn("h-3 w-3 rounded-full", c.className.split(" ")[0])} />
                          {c.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Applicable Services */}
            <div className="space-y-2">
              <Label className="text-xs text-brand-text-tertiary">Applicable Services</Label>
              <div className="rounded-xl border border-brand-border bg-card p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="all-services"
                    checked={form.allServices}
                    onCheckedChange={(checked) => handleToggleAllServices(checked === true)}
                  />
                  <label htmlFor="all-services" className="text-sm font-medium text-brand-text-primary cursor-pointer">
                    All Services
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pl-1">
                  {allMassageTypes.map((type) => (
                    <div key={type.value} className="flex items-center gap-2">
                      <Checkbox
                        id={`service-${type.value}`}
                        checked={form.applicableServices.includes(type.value)}
                        onCheckedChange={(checked) => handleToggleService(type.value, checked === true)}
                        disabled={form.allServices}
                      />
                      <label
                        htmlFor={`service-${type.value}`}
                        className={cn(
                          "text-sm cursor-pointer",
                          form.allServices ? "text-brand-text-tertiary" : "text-brand-text-secondary"
                        )}
                      >
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="space-y-2">
              <Label className="text-xs text-brand-text-tertiary">Terms &amp; Conditions</Label>
              <div className="space-y-2">
                {form.terms.map((term, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg border border-brand-border bg-card px-3 py-2"
                  >
                    <span className="flex-1 text-sm text-brand-text-secondary">{term}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTerm(i)}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-brand-text-tertiary hover:bg-brand-bg-tertiary hover:text-destructive"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    placeholder="Add a term..."
                    className="border-brand-border bg-card text-brand-text-primary"
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTerm() } }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddTerm}
                    disabled={!newTerm.trim()}
                    className="shrink-0 border-brand-border"
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t border-brand-border p-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-brand-border text-brand-text-secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid}
            className="gap-2"
          >
            <Save size={14} />
            {promotion ? "Save Changes" : "Create Promotion"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
