"use client"

import { useEffect } from "react"

export function BackendInitializer() {
  useEffect(() => {
    // Initialize backend on client mount
    const initBackend = async () => {
      try {
        console.log("[Frontend] Initializing backend...")
        const res = await fetch("/api/health")
        const data = await res.json()
        if (res.ok) {
          console.log("[Frontend] ✓ Backend initialized:", data)
        } else {
          console.warn("[Frontend] Backend returned error:", data)
        }
      } catch (error) {
        console.warn("[Frontend] Backend initialization request failed:", error)
      }
    }

    // Initialize immediately
    initBackend()
    
    // Also try again after 2 seconds to ensure it's ready
    const timeout = setTimeout(initBackend, 2000)
    
    return () => clearTimeout(timeout)
  }, [])

  return null
}
