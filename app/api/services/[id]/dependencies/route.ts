import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET /api/services/[id]/dependencies - List dependencies
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const dependencies = await prisma.serviceDependency.findMany({
      where: { serviceId: id },
      include: {
        dependency: {
          select: {
            id: true,
            name: true,
            status: true,
            url: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Também buscar serviços que dependem deste
    const dependents = await prisma.serviceDependency.findMany({
      where: { dependencyId: id },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    })

    return NextResponse.json({
      dependencies,
      dependents,
      hasCriticalDependencies: dependencies.some(
        (d) => d.type === "required" && d.dependency.status !== "online"
      ),
    })
  } catch (error) {
    console.error("Error fetching dependencies:", error)
    return NextResponse.json({ error: "Failed to fetch dependencies" }, { status: 500 })
  }
}

// POST /api/services/[id]/dependencies - Add dependency
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { dependencyId, type = "required", description } = body

    if (!dependencyId) {
      return NextResponse.json({ error: "Dependency ID is required" }, { status: 400 })
    }

    // Verificar se o serviço existe
    const service = await prisma.service.findUnique({ where: { id } })
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Verificar se a dependência existe
    const dependency = await prisma.service.findUnique({ where: { id: dependencyId } })
    if (!dependency) {
      return NextResponse.json({ error: "Dependency service not found" }, { status: 404 })
    }

    // Verificar se já existe essa dependência
    const existing = await prisma.serviceDependency.findFirst({
      where: { serviceId: id, dependencyId },
    })

    if (existing) {
      return NextResponse.json({ error: "Dependency already exists" }, { status: 400 })
    }

    // Verificar dependência circular
    const wouldCreateCycle = await checkCircularDependency(dependencyId, id)
    if (wouldCreateCycle) {
      return NextResponse.json(
        { error: "Cannot create circular dependency" },
        { status: 400 }
      )
    }

    // Criar dependência
    const newDependency = await prisma.serviceDependency.create({
      data: {
        serviceId: id,
        dependencyId,
        type,
        description,
      },
      include: {
        dependency: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    })

    return NextResponse.json(newDependency, { status: 201 })
  } catch (error) {
    console.error("Error adding dependency:", error)
    return NextResponse.json({ error: "Failed to add dependency" }, { status: 500 })
  }
}

// Helper function to check circular dependencies
async function checkCircularDependency(
  startId: string,
  targetId: string,
  visited = new Set<string>()
): Promise<boolean> {
  if (startId === targetId) return true
  if (visited.has(startId)) return false

  visited.add(startId)

  const dependencies = await prisma.serviceDependency.findMany({
    where: { serviceId: startId },
    select: { dependencyId: true },
  })

  for (const dep of dependencies) {
    if (await checkCircularDependency(dep.dependencyId, targetId, visited)) {
      return true
    }
  }

  return false
}
