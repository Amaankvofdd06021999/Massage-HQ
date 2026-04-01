"use client"

import { ThemeProvider } from "@/lib/theme/theme-provider"

export default function ShopsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--bg-primary)]">
        {children}
      </div>
    </ThemeProvider>
  )
}
