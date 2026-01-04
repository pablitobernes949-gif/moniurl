import { NextResponse } from "next/server"
import { prisma } from "@/lib/database/db"

// Endpoint de timeseries para Grafana
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { range, targets } = body

    // Formato esperado pelo Grafana SimpleJSON
    const from = range?.from ? new Date(range.from) : new Date(Date.now() - 24 * 60 * 60 * 1000)
    const to = range?.to ? new Date(range.to) : new Date()

    const results = []

    for (const target of targets || []) {
      const { target: metric, serviceId } = target

      if (!serviceId) continue

      // Buscar checks no período
      const checks = await prisma.serviceCheck.findMany({
        where: {
          serviceId,
          createdAt: {
            gte: from,
            lte: to,
          },
        },
        orderBy: { createdAt: "asc" },
      })

      let datapoints = []

      switch (metric) {
        case "latency":
          datapoints = checks.map((check) => [check.latency || 0, check.createdAt.getTime()])
          break
        case "uptime":
          datapoints = checks.map((check) => [check.uptime, check.createdAt.getTime()])
          break
        case "packet_loss":
          datapoints = checks.map((check) => [check.loss, check.createdAt.getTime()])
          break
        case "status":
          datapoints = checks.map((check) => [check.status === "online" ? 1 : 0, check.createdAt.getTime()])
          break
        default:
          datapoints = checks.map((check) => [check.latency || 0, check.createdAt.getTime()])
      }

      results.push({
        target: `${metric} (${serviceId})`,
        datapoints,
      })
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error fetching timeseries:", error)
    return NextResponse.json({ error: "Failed to fetch timeseries" }, { status: 500 })
  }
}

// Test connectivity
export async function GET() {
  return NextResponse.json({ message: "Timeseries endpoint is working" })
}
