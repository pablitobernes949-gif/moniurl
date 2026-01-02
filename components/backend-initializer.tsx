"use client"

import { useEffect } from "react"

export function BackendInitializer() {
  useEffect(() => {
    // Initialize backend on client mount
    const initBackend = async () => {
      try {
        const res = await fetch("/api/health")
        if (res.ok) {
          console.log("✓ Backend initialized")
        }
      } catch (error) {
        console.warn("Backend initialization request failed:", error)
      }
    }

    initBackend()
  }, [])

  return null
}
