import { NextResponse } from "next/server"
import { getAlertHistory, getActiveAlerts, acknowledgeAlert, resolveAlert } from "@/lib/alerts"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    if (id === "active") {
      const alerts = await getActiveAlerts()
      return NextResponse.json({ alerts })
    }
    
    // Get history for a specific service
    const alerts = await getAlertHistory(id, 100)
    return NextResponse.json({ alerts })
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    if (body.action === "acknowledge") {
      const alert = await acknowledgeAlert(body.alertId)
      return NextResponse.json({ alert })
    }

    if (body.action === "resolve") {
      const alert = await resolveAlert(body.alertId)
      return NextResponse.json({ alert })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating alert:", error)
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 })
  }
}
