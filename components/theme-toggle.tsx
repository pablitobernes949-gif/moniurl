"use client"

import { Moon, Sun, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/providers/theme-provider-enhanced"

export function ThemeToggle() {
  const { theme, setTheme, soundEnabled, setSoundEnabled } = useTheme()

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="h-10 w-10"
      >
        {soundEnabled ? (
          <Volume2 className="h-5 w-5" />
        ) : (
          <VolumeX className="h-5 w-5" />
        )}
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="h-10 w-10"
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
    </div>
  )
}
