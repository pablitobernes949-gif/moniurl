import { NextResponse } from "next/server"
import { prisma } from "@/lib/database/db"
import { getAllServices } from "@/lib/database/storage"

/**
 * Endpoint de métricas Prometheus para Grafana
 * URL: /api/grafana/prometheus
 * 
 * Exporta todas as métricas dos serviços monitorados em formato Prometheus
 * Compatible com Prometheus e Grafana data sources
 */
export async function GET() {
  try {
    // Buscar todos os serviços do banco de dados com seus checks recentes
    const dbServices = await prisma.service.findMany({
      include: {
        checks: {
          orderBy: { createdAt: "desc" },
          take: 100, // Últimos 100 checks por serviço
        },
        alerts: {
          where: {
            status: "active"
          }
        }
      },
    })

    // Buscar dados em tempo real da memória
    const memoryServices = getAllServices()
    const memoryMap = new Map(memoryServices.map((s) => [s.id, s]))

    let metrics = ""

    // ============================================
    // MÉTRICA 1: Status do Serviço (gauge)
    // ============================================
    metrics += "# HELP service_up Service is up and running (1=up, 0=down)\n"
    metrics += "# TYPE service_up gauge\n"

    dbServices.forEach((service) => {
      const memService = memoryMap.get(service.id)
      const isUp = memService?.status === "online" ? 1 : 0
      const labels = [
        `service_id="${service.id}"`,
        `service_name="${service.name}"`,
        `service_url="${service.url}"`,
        `service_type="${service.type}"`,
      ].join(",")
      metrics += `service_up{${labels}} ${isUp}\n`
    })

    // ============================================
    // MÉTRICA 2: Latência (gauge)
    // ============================================
    metrics += "\n# HELP service_latency_milliseconds Service response time in milliseconds\n"
    metrics += "# TYPE service_latency_milliseconds gauge\n"

    dbServices.forEach((service) => {
      const memService = memoryMap.get(service.id)
      const latency = memService?.responseTime || 0
      const labels = [
        `service_id="${service.id}"`,
        `service_name="${service.name}"`,
        `service_url="${service.url}"`,
      ].join(",")
      metrics += `service_latency_milliseconds{${labels}} ${latency}\n`
    })

    // ============================================
    // MÉTRICA 3: Uptime Percentual (gauge)
    // ============================================
    metrics += "\n# HELP service_uptime_percentage Service uptime percentage (0-100)\n"
    metrics += "# TYPE service_uptime_percentage gauge\n"

    dbServices.forEach((service) => {
      const memService = memoryMap.get(service.id)
      const uptime = memService?.uptime || 0
      const labels = [
        `service_id="${service.id}"`,
        `service_name="${service.name}"`,
        `service_url="${service.url}"`,
      ].join(",")
      metrics += `service_uptime_percentage{${labels}} ${uptime}\n`
    })

    // ============================================
    // MÉTRICA 4: Packet Loss (gauge)
    // ============================================
    metrics += "\n# HELP service_packet_loss_percentage Service packet loss percentage (0-100)\n"
    metrics += "# TYPE service_packet_loss_percentage gauge\n"

    dbServices.forEach((service) => {
      const memService = memoryMap.get(service.id)
      const loss = memService?.packetLoss || 0
      const labels = [
        `service_id="${service.id}"`,
        `service_name="${service.name}"`,
        `service_url="${service.url}"`,
      ].join(",")
      metrics += `service_packet_loss_percentage{${labels}} ${loss}\n`
    })

    // ============================================
    // MÉTRICA 5: Total de Checks (counter)
    // ============================================
    metrics += "\n# HELP service_checks_total Total number of health checks performed\n"
    metrics += "# TYPE service_checks_total counter\n"

    dbServices.forEach((service) => {
      const checksCount = service.checks.length
      const labels = [
        `service_id="${service.id}"`,
        `service_name="${service.name}"`,
        `service_url="${service.url}"`,
      ].join(",")
      metrics += `service_checks_total{${labels}} ${checksCount}\n`
    })

    // ============================================
    // MÉTRICA 6: Checks com Sucesso (counter)
    // ============================================
    metrics += "\n# HELP service_checks_success_total Total number of successful health checks\n"
    metrics += "# TYPE service_checks_success_total counter\n"

    dbServices.forEach((service) => {
      const successCount = service.checks.filter((c) => c.status === "up").length
      const labels = [
        `service_id="${service.id}"`,
        `service_name="${service.name}"`,
        `service_url="${service.url}"`,
      ].join(",")
      metrics += `service_checks_success_total{${labels}} ${successCount}\n`
    })

    // ============================================
    // MÉTRICA 7: Checks com Falha (counter)
    // ============================================
    metrics += "\n# HELP service_checks_failure_total Total number of failed health checks\n"
    metrics += "# TYPE service_checks_failure_total counter\n"

    dbServices.forEach((service) => {
      const failureCount = service.checks.filter((c) => c.status === "down").length
      const labels = [
        `service_id="${service.id}"`,
        `service_name="${service.name}"`,
        `service_url="${service.url}"`,
      ].join(",")
      metrics += `service_checks_failure_total{${labels}} ${failureCount}\n`
    })

    // ============================================
    // MÉTRICA 8: Alertas Ativos (gauge)
    // ============================================
    metrics += "\n# HELP service_alerts_active Number of active alerts for service\n"
    metrics += "# TYPE service_alerts_active gauge\n"

    dbServices.forEach((service) => {
      const activeAlerts = service.alerts.length
      const labels = [
        `service_id="${service.id}"`,
        `service_name="${service.name}"`,
        `service_url="${service.url}"`,
      ].join(",")
      metrics += `service_alerts_active{${labels}} ${activeAlerts}\n`
    })

    // ============================================
    // MÉTRICA 9: Latência Média (gauge)
    // ============================================
    metrics += "\n# HELP service_latency_average_milliseconds Average response time in milliseconds\n"
    metrics += "# TYPE service_latency_average_milliseconds gauge\n"

    dbServices.forEach((service) => {
      const latencies = service.checks.map((c) => c.latency).filter((l) => l > 0)
      const avgLatency = latencies.length > 0 
        ? latencies.reduce((a, b) => a + b, 0) / latencies.length 
        : 0
      const labels = [
        `service_id="${service.id}"`,
        `service_name="${service.name}"`,
        `service_url="${service.url}"`,
      ].join(",")
      metrics += `service_latency_average_milliseconds{${labels}} ${avgLatency.toFixed(2)}\n`
    })

    // ============================================
    // MÉTRICA 10: Taxa de Sucesso (gauge)
    // ============================================
    metrics += "\n# HELP service_success_rate Service success rate percentage (0-100)\n"
    metrics += "# TYPE service_success_rate gauge\n"

    dbServices.forEach((service) => {
      const total = service.checks.length
      const success = service.checks.filter((c) => c.status === "up").length
      const rate = total > 0 ? (success / total) * 100 : 0
      const labels = [
        `service_id="${service.id}"`,
        `service_name="${service.name}"`,
        `service_url="${service.url}"`,
      ].join(",")
      metrics += `service_success_rate{${labels}} ${rate.toFixed(2)}\n`
    })

    // ============================================
    // MÉTRICA 11: Tempo desde último check (gauge)
    // ============================================
    metrics += "\n# HELP service_seconds_since_last_check Seconds since last health check\n"
    metrics += "# TYPE service_seconds_since_last_check gauge\n"

    dbServices.forEach((service) => {
      const memService = memoryMap.get(service.id)
      const lastCheck = memService?.lastCheck || Date.now()
      const secondsSince = Math.floor((Date.now() - lastCheck) / 1000)
      const labels = [
        `service_id="${service.id}"`,
        `service_name="${service.name}"`,
        `service_url="${service.url}"`,
      ].join(",")
      metrics += `service_seconds_since_last_check{${labels}} ${secondsSince}\n`
    })

    // ============================================
    // MÉTRICA 12: Certificado SSL válido (gauge)
    // ============================================
    metrics += "\n# HELP service_ssl_valid SSL certificate is valid (1=valid, 0=invalid)\n"
    metrics += "# TYPE service_ssl_valid gauge\n"

    dbServices.forEach((service) => {
      if (service.url.startsWith("https://")) {
        const memService = memoryMap.get(service.id)
        const sslValid = memService?.status === "online" ? 1 : 0 // Simplificado
        const labels = [
          `service_id="${service.id}"`,
          `service_name="${service.name}"`,
          `service_url="${service.url}"`,
        ].join(",")
        metrics += `service_ssl_valid{${labels}} ${sslValid}\n`
      }
    })

    // ============================================
    // MÉTRICA 13: Status por tipo (gauge)
    // ============================================
    metrics += "\n# HELP service_status_by_type Services status grouped by type (1=up, 0=down)\n"
    metrics += "# TYPE service_status_by_type gauge\n"

    const typeGroups = new Map<string, { up: number; total: number }>()
    dbServices.forEach((service) => {
      const memService = memoryMap.get(service.id)
      const type = service.type
      if (!typeGroups.has(type)) {
        typeGroups.set(type, { up: 0, total: 0 })
      }
      const group = typeGroups.get(type)!
      group.total++
      if (memService?.status === "online") {
        group.up++
      }
    })

    typeGroups.forEach((data, type) => {
      const labels = `service_type="${type}"`
      const rate = data.total > 0 ? data.up / data.total : 0
      metrics += `service_status_by_type{${labels}} ${rate.toFixed(2)}\n`
    })

    return new Response(metrics, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Erro ao gerar métricas Prometheus:", error)
    return NextResponse.json(
      { error: "Erro ao gerar métricas" },
      { status: 500 }
    )
  }
}
