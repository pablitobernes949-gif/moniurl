import { startMonitoring } from "./worker"

let initialized = false

export function initializeBackend() {
  if (initialized) return

  console.log("🚀 Initializing backend services...")

  // Start monitoring worker (check every 30 seconds)
  startMonitoring(30000)

  initialized = true
  console.log("✓ Backend services initialized")
}
