import { NextResponse } from "next/server"
import { 
  getAlertRules, 
  createAlertRule, 
  updateAlertRule, 
  deleteAlertRule,
  initializeDefaultRules
} from "@/lib/alerts"
import type { AlertType, AlertSeverity } from "@/lib/types"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const rules = await getAlertRules(id)
    return NextResponse.json({ rules })
  } catch (error) {
    console.error("Error fetching alert rules:", error)
    return NextResponse.json({ error: "Failed to fetch rules" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    if (body.action === "init-defaults") {
      await initializeDefaultRules(id)
      const rules = await getAlertRules(id)
      return NextResponse.json({ rules })
    }

    if (body.action === "create") {
      const rule = await createAlertRule(
        id,
        body.type as AlertType,
        body.threshold as number,
        body.severity as AlertSeverity
      )
      return NextResponse.json({ rule }, { status: 201 })
    }

    if (body.action === "update") {
      const rule = await updateAlertRule(
        id,
        body.ruleId as string,
        body.enabled as boolean,
        body.threshold as number
      )
      return NextResponse.json({ rule })
    }

    if (body.action === "delete") {
      const success = await deleteAlertRule(id, body.ruleId as string)
      return NextResponse.json({ success })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error) {
    console.error("Error managing alert rules:", error)
    return NextResponse.json({ error: "Failed to manage rules" }, { status: 500 })
  }
}
