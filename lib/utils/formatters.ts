// ─── Formatting Utilities ────────────────────────────────────────────────────

export function formatPrice(amount: number, symbol = "฿"): string {
  return `${symbol}${amount.toLocaleString()}`
}

export function formatMassageType(type: string): string {
  return type.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

export function generateMembershipNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = "MEM-"
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
