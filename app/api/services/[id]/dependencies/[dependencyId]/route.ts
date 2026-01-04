import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// DELETE /api/services/[id]/dependencies/[dependencyId] - Remove dependency
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; dependencyId: string } }
) {
  try {
    const { id, dependencyId } = params

    const dependency = await prisma.serviceDependency.findFirst({
      where: {
        serviceId: id,
        id: dependencyId,
      },
    })

    if (!dependency) {
      return NextResponse.json({ error: "Dependency not found" }, { status: 404 })
    }

    await prisma.serviceDependency.delete({
      where: { id: dependencyId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing dependency:", error)
    return NextResponse.json({ error: "Failed to remove dependency" }, { status: 500 })
  }
}
