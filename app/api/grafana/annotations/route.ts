import { NextResponse } from "next/server"
import { prisma } from "@/lib/database/db"
import { getAllServices } from "@/lib/database/storage"

/**
 * Endpoint de anotações para Grafana
 * URL: /api/grafana/annotations
 * 
 * Retorna eventos importantes como alertas, incidentes e mudanças de status
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { range, annotation } = body

    // Parse range
    const from = new Date(range?.from || Date.now() - 24 * 60 * 60 * 1000)
    const to = new Date(range?.to || Date.now())

    const annotations: any[] = []

    // Buscar alertas no período (com try/catch separado)
    try {
      const alerts = await prisma.alert.findMany({
        where: {
          createdAt: {
            gte: from,
            lte: to,
          },
        },
        include: {
          service: true,
        },
        orderBy: { createdAt: "desc" },
      })

      // Converter alertas em anotações
      alerts.forEach((alert) => {
        let tags = [alert.severity, alert.type]
        if (alert.status) tags.push(alert.status)

        annotations.push({
          annotation: annotation?.name || "Alerts",
          time: alert.createdAt.getTime(),
          title: `${alert.type}: ${alert.service.name}`,
          text: alert.message,
          tags,
        })
      })
    } catch (alertError) {
      console.log("Aviso: Não foi possível buscar alertas (tabela pode não existir):", alertError)
      // Continuar sem alertas se a tabela não existir
    }

    // Buscar mudanças de status significativas
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

    // Detectar mudanças de status
    services.forEach((service) => {
      let previousStatus: string | null = null

      service.checks.forEach((check) => {
        if (previousStatus && previousStatus !== check.status) {
          // Mudança de status detectada
          const statusChange = `${previousStatus} → ${check.status}`
          const isDowntime = check.status === "down"

          annotations.push({
            annotation: "Status Changes",
            time: check.createdAt.getTime(),
            title: `${service.name}: ${statusChange}`,
            text: `Service ${service.name} changed from ${previousStatus} to ${check.status}`,
            tags: [isDowntime ? "downtime" : "recovery", service.type],
          })
        }
        previousStatus = check.status
      })
    })

    // Ordenar por tempo
    annotations.sort((a, b) => a.time - b.time)

    return NextResponse.json(annotations)
  } catch (error) {
    console.error("Erro ao buscar anotações:", error)
    // Retornar array vazio em vez de erro para não quebrar o Grafana
    return NextResponse.json([])
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", message: "Annotations endpoint ready" })
}

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
