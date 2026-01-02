import { NextResponse } from "next/server"
import { getAllServices, createService } from "@/lib/storage"
import { monitorService } from "@/lib/monitoring"
import type { Service } from "@/lib/types"

export async function GET() {
  try {
    const services = getAllServices()
    return NextResponse.json({ services })
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, url } = body

    if (!name || !url) {
      return NextResponse.json({ error: "Missing required fields: name, url" }, { status: 400 })
    }

    // Perform initial health check
    const result = await monitorService(url)

    // Create new service
    const newService: Service = {
      id: Date.now().toString(),
      name: String(name).trim(),
      url: String(url).trim(),
      status: result.status,
      lastCheck: Date.now(),
      responseTime: result.responseTime,
      history: [
        {
          timestamp: Date.now(),
          status: result.status,
          responseTime: result.responseTime,
        },
      ],
      uptime: 100,
      createdAt: Date.now(),
    }

    const created = createService(newService)
    return NextResponse.json({ service: created }, { status: 201 })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}
