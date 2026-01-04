import { NextResponse } from "next/server"
import { prisma } from "@/lib/database/db"

/**
 * Endpoint de pesquisa para Grafana SimpleJSON datasource
 * URL: /api/grafana/search
 * 
 * Retorna lista de métricas disponíveis e serviços
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { target } = body

    // Se não houver target específico, retornar métricas disponíveis
    if (!target) {
      return NextResponse.json([
        { text: "Latency", value: "latency" },
        { text: "Status", value: "status" },
        { text: "Uptime", value: "uptime" },
        { text: "Packet Loss", value: "packet_loss" },
        { text: "Success Rate", value: "success_rate" },
        { text: "Active Alerts", value: "active_alerts" },
      ])
    }

    // Se houver target, retornar serviços disponíveis
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        url: true,
        type: true,
      },
    })

    const results = services.map((service) => ({
      text: `${service.name} (${service.type})`,
      value: service.id,
    }))

    return NextResponse.json(results)
  } catch (error) {
    console.error("Erro ao processar search:", error)
    return NextResponse.json({ error: "Erro ao processar search" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        url: true,
        type: true,
      },
    })

    const metrics = [
      { text: "Latency", value: "latency" },
      { text: "Status", value: "status" },
      { text: "Uptime", value: "uptime" },
      { text: "Packet Loss", value: "packet_loss" },
      { text: "Success Rate", value: "success_rate" },
      { text: "Active Alerts", value: "active_alerts" },
    ]

    return NextResponse.json({
      metrics,
      services: services.map((s) => ({
        text: `${s.name} (${s.type})`,
        value: s.id,
      })),
    })
  } catch (error) {
    console.error("Erro ao buscar serviços:", error)
    return NextResponse.json({ error: "Erro ao buscar serviços" }, { status: 500 })
  }
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
