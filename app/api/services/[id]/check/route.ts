import { NextResponse } from "next/server"
import { getService, appendHealthCheck } from "@/lib/storage"
import { monitorService, calculateUptime } from "@/lib/monitoring"

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const service = getService(id)
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Perform health check
    const result = await monitorService(service.url)

    // Create health check record
    const check = {
      timestamp: Date.now(),
      status: result.status,
      responseTime: result.responseTime,
    }

    // Append to history and get updated history
    const updatedHistory = appendHealthCheck(params.id, check)

    // Calculate new uptime
    const newUptime = calculateUptime(updatedHistory)

    // Get updated service
    const updated = getService(params.id)
    if (!updated) {
      return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
    }

    return NextResponse.json({
      service: {
        ...updated,
        uptime: newUptime,
      },
    })
  } catch (error) {
    console.error("Error checking service:", error)
    return NextResponse.json({ error: "Failed to check service" }, { status: 500 })
  }
}
