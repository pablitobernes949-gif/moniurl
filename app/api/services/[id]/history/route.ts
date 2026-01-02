import { NextResponse } from "next/server"
import { getServiceHistory, setServiceHistory, appendHealthCheck, getService } from "@/lib/storage"
import { getHistoryAws, appendCheckAws, setHistoryAws } from "@/lib/aws-realtime"
import type { HealthCheck } from "@/lib/types"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    // Prefer AWS table if configured
    if (process.env.AWS_DYNAMODB_TABLE) {
      const history = await getHistoryAws(params.id)
      return NextResponse.json({ history })
    }
    const history = getServiceHistory(params.id)
    return NextResponse.json({ history })
  } catch (error) {
    console.error("Error fetching history:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    // Accept { check } to append or { history } to replace
    if (body.check) {
      if (process.env.AWS_DYNAMODB_TABLE) {
        const updated = await appendCheckAws(params.id, body.check as HealthCheck)
        return NextResponse.json({ history: updated })
      }
      const updated = appendHealthCheck(params.id, body.check as HealthCheck)
      return NextResponse.json({ history: updated })
    }
    if (Array.isArray(body.history)) {
      if (process.env.AWS_DYNAMODB_TABLE) {
        await setHistoryAws(params.id, body.history)
        return NextResponse.json({ history: body.history })
      }
      setServiceHistory(params.id, body.history as HealthCheck[])
      return NextResponse.json({ history: body.history })
    }
    return NextResponse.json({ error: "invalid payload" }, { status: 400 })
  } catch (e) {
    console.error("Error updating history:", e)
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }
}
