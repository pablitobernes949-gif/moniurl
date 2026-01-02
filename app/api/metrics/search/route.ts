import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Endpoint de search para Grafana SimpleJSON datasource
export async function POST(request: Request) {
  try {
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        url: true,
        type: true,
      },
    })

    // Retornar lista de serviços para o Grafana
    return NextResponse.json(
      services.map((service) => ({
        text: `${service.name} (${service.url})`,
        value: service.id,
      }))
    )
  } catch (error) {
    console.error("Error in search endpoint:", error)
    return NextResponse.json({ error: "Failed to search services" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: "Search endpoint is working" })
}
