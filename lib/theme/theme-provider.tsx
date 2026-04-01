"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { BrandConfig } from "@/lib/types"
import { kokoDarkBrandConfig, kokoLightBrandConfig, brandConfigToCSSVars } from "./brand-config"
import { useShop } from "@/lib/shop/shop-context"

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
  const { shopConfig } = useShop()
  const baseBrand = shopConfig?.brand ?? kokoDarkBrandConfig
  const lightBrand = shopConfig?.lightBrand ?? kokoLightBrandConfig

  const [mode, setMode] = useState<ThemeMode>("dark")
  const [brandConfig, setBrandConfig] = useState<BrandConfig>(
    initialConfig ?? kokoDarkBrandConfig
  )

  // Re-apply brand when shop changes or on mount
  // eslint-disable-line: initialConfig intentionally excluded — it's a one-time prop
  useEffect(() => {
    try {
      const saved = localStorage.getItem("koko-theme-mode") as ThemeMode | null
      if (saved === "light" || saved === "dark") {
        setMode(saved)
        setBrandConfig(initialConfig ?? (saved === "light" ? lightBrand : baseBrand))
      } else {
        setBrandConfig(initialConfig ?? baseBrand)
      }
    } catch {
      setBrandConfig(initialConfig ?? baseBrand)
    }
  }, [baseBrand, lightBrand]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    applyThemeToDOM(brandConfig, mode)
  }, [brandConfig, mode])

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next: ThemeMode = prev === "dark" ? "light" : "dark"
      try { localStorage.setItem("koko-theme-mode", next) } catch { /* ignore */ }
      setBrandConfig(next === "light" ? lightBrand : baseBrand)
      return next
    })
  }, [baseBrand, lightBrand])

  const updateBrandConfig = useCallback((partial: Partial<BrandConfig>) => {
    setBrandConfig((prev) => ({ ...prev, ...partial }))
  }, [])

  const resetBrandConfig = useCallback(() => {
    setBrandConfig(mode === "light" ? lightBrand : baseBrand)
  }, [mode, baseBrand, lightBrand])

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
