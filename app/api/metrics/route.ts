import { NextResponse } from "next/server"
import { prisma } from "@/lib/database/db"
import { getAllServices } from "@/lib/database/storage"

// Endpoint de métricas para Grafana (formato JSON)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "json" // json ou prometheus
    
    // Buscar serviços do banco de dados
    const dbServices = await prisma.service.findMany({
      include: {
        checks: {
          orderBy: { createdAt: "desc" },
          take: 1000, // Últimos 1000 checks
        },
      },
    })

    // Buscar serviços da memória para dados em tempo real
    const memoryServices = getAllServices()
    const memoryMap = new Map(memoryServices.map((s) => [s.id, s]))

    if (format === "prometheus") {
      // Formato Prometheus
      let metrics = "# HELP service_status Service status (1=online, 0=offline, 0.5=unstable)\n"
      metrics += "# TYPE service_status gauge\n"

      dbServices.forEach((service) => {
        const memService = memoryMap.get(service.id)
        const status = memService?.status === "online" ? 1 : memService?.status === "unstable" ? 0.5 : 0
        const labels = `service="${service.name}",url="${service.url}",type="${service.type}"`
        metrics += `service_status{${labels}} ${status}\n`
      })

      metrics += "\n# HELP service_uptime Service uptime percentage\n"
      metrics += "# TYPE service_uptime gauge\n"

      dbServices.forEach((service) => {
        const memService = memoryMap.get(service.id)
        const uptime = memService?.uptime || 0
        const labels = `service="${service.name}",url="${service.url}"`
        metrics += `service_uptime{${labels}} ${uptime}\n`
      })

      metrics += "\n# HELP service_latency Service latency in milliseconds\n"
      metrics += "# TYPE service_latency gauge\n"

      dbServices.forEach((service) => {
        const memService = memoryMap.get(service.id)
        const latency = memService?.responseTime || 0
        const labels = `service="${service.name}",url="${service.url}"`
        metrics += `service_latency_milliseconds{${labels}} ${latency}\n`
      })

      metrics += "\n# HELP service_packet_loss Service packet loss percentage\n"
      metrics += "# TYPE service_packet_loss gauge\n"

      dbServices.forEach((service) => {
        const memService = memoryMap.get(service.id)
        const loss = memService?.packetLoss || 0
        const labels = `service="${service.name}",url="${service.url}"`
        metrics += `service_packet_loss_percent{${labels}} ${loss}\n`
      })

      metrics += "\n# HELP service_checks_total Total number of checks performed\n"
      metrics += "# TYPE service_checks_total counter\n"

      dbServices.forEach((service) => {
        const checksCount = service.checks.length
        const labels = `service="${service.name}",url="${service.url}"`
        metrics += `service_checks_total{${labels}} ${checksCount}\n`
      })

      return new Response(metrics, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    }

    // Formato JSON para Grafana SimpleJSON datasource
    const metrics = dbServices.map((service) => {
      const memService = memoryMap.get(service.id)
      const recentChecks = service.checks.slice(0, 100)

      return {
        service_id: service.id,
        service_name: service.name,
        service_url: service.url,
        service_type: service.type,
        status: memService?.status || "offline",
        uptime: memService?.uptime || 0,
        latency: memService?.responseTime || 0,
        packet_loss: memService?.packetLoss || 0,
        last_check: memService?.lastCheck || service.updatedAt.getTime(),
        checks_count: service.checks.length,
        recent_checks: recentChecks.map((check) => ({
          timestamp: check.createdAt.getTime(),
          status: check.status,
          latency: check.latency,
          loss: check.loss,
          uptime: check.uptime,
        })),
        created_at: service.createdAt.toISOString(),
        updated_at: service.updatedAt.toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      services_count: metrics.length,
      metrics,
    })
  } catch (error) {
    console.error("Error fetching metrics:", error)
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 })
  }
}
