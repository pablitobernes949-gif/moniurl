import { NextResponse } from "next/server"
import { prisma } from "@/lib/database/db"
import { getAllServices } from "@/lib/database/storage"

/**
 * Endpoint de time series para Grafana
 * URL: /api/grafana/query
 * 
 * Compatible com Grafana SimpleJSON datasource
 * Retorna séries temporais de todos os serviços monitorados
 */

// POST /api/grafana/query - Query time series
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { targets, range } = body

    // Parse range
    const from = new Date(range?.from || Date.now() - 24 * 60 * 60 * 1000)
    const to = new Date(range?.to || Date.now())

    const results = []

    for (const target of targets || []) {
      const targetType = target.target || "latency"

      // Buscar todos os serviços
      const services = await prisma.service.findMany({
        include: {
          checks: {
            where: {
              createdAt: {
                gte: from,
                lte: to,
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      })

      // Gerar série temporal para cada serviço
      for (const service of services) {
        const datapoints: [number, number][] = []

        service.checks.forEach((check) => {
          const timestamp = check.createdAt.getTime()
          let value = 0

          switch (targetType) {
            case "latency":
              value = check.latency
              break
            case "status":
              value = check.status === "up" ? 1 : 0
              break
            case "uptime":
              // Calcular uptime até este ponto
              const checksUntilNow = service.checks.filter(
                (c) => c.createdAt <= check.createdAt
              )
              const upCount = checksUntilNow.filter((c) => c.status === "up").length
              value = (upCount / checksUntilNow.length) * 100
              break
            case "packet_loss":
              // Calcular packet loss
              const recentChecks = service.checks.filter(
                (c) =>
                  c.createdAt <= check.createdAt &&
                  c.createdAt >= new Date(check.createdAt.getTime() - 60 * 60 * 1000)
              )
              const lossCount = recentChecks.filter((c) => c.status === "down").length
              value = recentChecks.length > 0 ? (lossCount / recentChecks.length) * 100 : 0
              break
            default:
              value = check.latency
          }

          datapoints.push([value, timestamp])
        })

        results.push({
          target: `${service.name} - ${targetType}`,
          datapoints,
        })
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Erro ao processar query:", error)
    return NextResponse.json({ error: "Erro ao processar query" }, { status: 500 })
  }
}

// GET /api/grafana/query - Test connection
export async function GET() {
  return NextResponse.json({ status: "ok", message: "Grafana datasource ready" })
}

/**
 * OPTIONS /api/grafana/query - CORS support
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
