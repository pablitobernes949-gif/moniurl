import { startMonitoring } from "./worker"

let initialized = false

export function initializeBackend() {
  if (initialized) {
    console.log("[Init] Backend already initialized")
    return
  }

  console.log("[Init] 🚀 Initializing backend services...")

  try {
    // Start monitoring worker (check every 30 seconds)
    startMonitoring(30000)
    initialized = true
    console.log("[Init] ✓ Backend services initialized successfully")
  } catch (error) {
    console.error("[Init] ✗ Failed to initialize backend:", error)
  }
}

// Force initialization on module load (for development/server startup)
if (typeof global !== 'undefined') {
  console.log("[Init] Backend module loaded")
}
