import { NextResponse } from "next/server"
import { getAllServices, createService } from "@/lib/database/storage"
import { monitorService } from "@/lib/monitoring/monitoring"
import { initializeDefaultRules } from "@/lib/monitoring/alerts"
import { prisma } from "@/lib/database/db"
import { saveServiceCheck } from "@/lib/database/db-operations"
import type { Service } from "@/lib/utils/types"

export async function GET() {
  try {
    // Get services from database
    const dbServices = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Get in-memory services for history data
    const memoryServices = getAllServices()
    const memoryMap = new Map(memoryServices.map(s => [s.id, s]))

    // Merge database data with in-memory history
    const services: Service[] = dbServices.map(dbService => {
      const memoryService = memoryMap.get(dbService.id)
      return {
        id: dbService.id,
        name: dbService.name,
        url: dbService.url,
        status: memoryService?.status || 'checking',
        lastCheck: memoryService?.lastCheck || Date.now(),
        responseTime: memoryService?.responseTime || 0,
        packetLoss: memoryService?.packetLoss || 0,
        minLatency: memoryService?.minLatency || 0,
        maxLatency: memoryService?.maxLatency || 0,
        avgLatency: memoryService?.avgLatency || 0,
        history: memoryService?.history || [],
        uptime: memoryService?.uptime || 0,
        createdAt: dbService.createdAt.getTime(),
      }
    })

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

    // Check if service already exists
    const existing = await prisma.service.findUnique({
      where: { url: url.trim() },
    })

    if (existing) {
      return NextResponse.json({ error: "Já existe um serviço cadastrado com esta URL. Por favor, use uma URL diferente ou edite o serviço existente." }, { status: 409 })
    }

    // Perform initial health check
    const result = await monitorService(url)

    // Create service in database
    const dbService = await prisma.service.create({
      data: {
        name: String(name).trim(),
        url: String(url).trim(),
        type: /^\d+\.\d+\.\d+\.\d+$/.test(url.trim()) ? "ip" : "url",
      },
    })

    // Save initial check to database
    await saveServiceCheck(
      dbService.id,
      result.status,
      result.avgLatency,
      result.packetLoss,
      result.status === "online" ? 100 : 0
    )

    // Create service in in-memory storage for backward compatibility
    const newService: Service = {
      id: dbService.id,
      name: String(name).trim(),
      url: String(url).trim(),
      status: result.status,
      lastCheck: Date.now(),
      responseTime: result.responseTime,
      packetLoss: result.packetLoss,
      minLatency: result.minLatency,
      maxLatency: result.maxLatency,
      avgLatency: result.avgLatency,
      history: [
        {
          timestamp: Date.now(),
          status: result.status,
          responseTime: result.responseTime,
          packetLoss: result.packetLoss,
          minLatency: result.minLatency,
          maxLatency: result.maxLatency,
          avgLatency: result.avgLatency,
        },
      ],
      uptime: result.status === "online" ? 100 : 0,
      createdAt: Date.now(),
    }

    const created = createService(newService)

    // Initialize default alert rules
    await initializeDefaultRules(created.id)

    return NextResponse.json({ service: created }, { status: 201 })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}
