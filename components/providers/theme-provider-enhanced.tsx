"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  playAlert: (severity: "critical" | "warning" | "info") => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    // Load from localStorage
    const savedTheme = localStorage.getItem("theme") as Theme
    const savedSound = localStorage.getItem("soundEnabled")
    if (savedTheme) setTheme(savedTheme)
    if (savedSound !== null) setSoundEnabled(savedSound === "true")
  }, [])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }

    localStorage.setItem("theme", theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem("soundEnabled", soundEnabled.toString())
  }, [soundEnabled])

  const playAlert = (severity: "critical" | "warning" | "info") => {
    if (!soundEnabled) return

    // Create audio context and play sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Different frequencies for different severities
    const frequencies = {
      critical: [800, 600, 800],
      warning: [600, 500],
      info: [400],
    }

    const freq = frequencies[severity]
    let i = 0

    const playNote = () => {
      if (i < freq.length) {
        oscillator.frequency.value = freq[i]
        gainNode.gain.value = 0.3
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
        i++
        setTimeout(playNote, 300)
      }
    }

    playNote()
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, soundEnabled, setSoundEnabled, playAlert }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}
