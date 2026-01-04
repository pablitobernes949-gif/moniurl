import { NextResponse } from "next/server"
import { prisma } from "@/lib/database/db"

// Endpoint de query para Grafana SimpleJSON datasource
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { target } = body

    // Retornar lista de métricas disponíveis
    if (!target) {
      return NextResponse.json([
        { text: "Latency", value: "latency" },
        { text: "Uptime", value: "uptime" },
        { text: "Packet Loss", value: "packet_loss" },
        { text: "Status", value: "status" },
      ])
    }

    // Retornar serviços disponíveis para o target selecionado
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        url: true,
      },
    })

    return NextResponse.json(
      services.map((service) => ({
        text: service.name,
        value: service.id,
      }))
    )
  } catch (error) {
    console.error("Error in query endpoint:", error)
    return NextResponse.json({ error: "Failed to process query" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: "Query endpoint is working" })
}
