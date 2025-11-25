"use client"

import { createContext, useContext } from "react"

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  // Light mode only - no theme switching
  const value = {
    isDarkMode: false,
    toggleTheme: () => {}, // No-op function
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
