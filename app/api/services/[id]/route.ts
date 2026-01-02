import { NextResponse } from "next/server"
import { getService, updateService, deleteService } from "@/lib/storage"
import type { Service } from "@/lib/types"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const service = getService(id)
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }
    return NextResponse.json({ service })
  } catch (error) {
    console.error("Error fetching service:", error)
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const service = updateService(id, body)
    
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }
    
    return NextResponse.json({ service })
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const deleted = deleteService(id)
    if (!deleted) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }
    return NextResponse.json({ message: "Service deleted successfully" })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
  }
}
