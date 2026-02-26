"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { BrandConfig } from "@/lib/types"
import { kokoDarkBrandConfig, kokoLightBrandConfig, brandConfigToCSSVars } from "./brand-config"

export type ThemeMode = "dark" | "light"

interface ThemeContextType {
  brandConfig: BrandConfig
  mode: ThemeMode
  updateBrandConfig: (config: Partial<BrandConfig>) => void
  resetBrandConfig: () => void
  toggleMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function applyThemeToDOM(config: BrandConfig, mode: ThemeMode) {
  const vars = brandConfigToCSSVars(config)
  const root = document.documentElement
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
  root.classList.toggle("light", mode === "light")
}

export function ThemeProvider({ children, initialConfig }: { children: ReactNode; initialConfig?: BrandConfig }) {
  const [mode, setMode] = useState<ThemeMode>("dark")
  const [brandConfig, setBrandConfig] = useState<BrandConfig>(
    initialConfig ?? kokoDarkBrandConfig
  )

  // Restore saved mode from localStorage on first mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("koko-theme-mode") as ThemeMode | null
      if (saved === "light" || saved === "dark") {
        const baseConfig = saved === "light" ? kokoLightBrandConfig : kokoDarkBrandConfig
        setMode(saved)
        setBrandConfig(initialConfig ?? baseConfig)
      }
    } catch {
      // localStorage unavailable (private browsing, SSR)
    }
  }, [initialConfig])

  useEffect(() => {
    applyThemeToDOM(brandConfig, mode)
  }, [brandConfig, mode])

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next: ThemeMode = prev === "dark" ? "light" : "dark"
      try { localStorage.setItem("koko-theme-mode", next) } catch { /* ignore */ }
      setBrandConfig(next === "light" ? kokoLightBrandConfig : kokoDarkBrandConfig)
      return next
    })
  }, [])

  const updateBrandConfig = useCallback((partial: Partial<BrandConfig>) => {
    setBrandConfig((prev) => ({ ...prev, ...partial }))
  }, [])

  const resetBrandConfig = useCallback(() => {
    setBrandConfig(mode === "light" ? kokoLightBrandConfig : kokoDarkBrandConfig)
  }, [mode])

  return (
    <ThemeContext.Provider value={{ brandConfig, mode, updateBrandConfig, resetBrandConfig, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useBrand() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useBrand must be used within ThemeProvider")
  return ctx
}
