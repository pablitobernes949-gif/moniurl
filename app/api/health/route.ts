import { NextResponse } from "next/server"
import { initializeBackend } from "@/lib/initialization/init"

// Initialize backend on any request
let hasInitialized = false

export async function GET() {
  try {
    // Initialize backend if not already done
    if (!hasInitialized) {
      console.log("[Health] Initializing backend on first health check...")
      initializeBackend()
      hasInitialized = true
    }

    return NextResponse.json({
      status: "ok",
      message: "Backend is running",
      timestamp: new Date().toISOString(),
      initialized: hasInitialized,
    })
  } catch (error) {
    console.error("Error in health check:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Backend health check failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
