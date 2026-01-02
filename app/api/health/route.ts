import { NextResponse } from "next/server"
import { initializeBackend } from "@/lib/init"

// Initialize on first request
let hasInitialized = false

export async function GET() {
  try {
    if (!hasInitialized) {
      initializeBackend()
      hasInitialized = true
    }

    return NextResponse.json({
      status: "ok",
      message: "Backend is running",
      timestamp: new Date().toISOString(),
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
