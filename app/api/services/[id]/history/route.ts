import { NextResponse } from "next/server"
import { getServiceHistory, setServiceHistory, appendHealthCheck, getService } from "@/lib/storage"
import { getHistoryAws, appendCheckAws, setHistoryAws } from "@/lib/aws-realtime"
import { getRecentChecks, saveServiceCheck, getChecksByPeriod, getChecksByDateRange } from "@/lib/db-operations"
import type { HealthCheck } from "@/lib/types"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    
    // Support period parameters: hours, startDate, endDate, limit
    const hours = searchParams.get('hours') ? parseInt(searchParams.get('hours')!) : null
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : null
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : null
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 500
    
    console.log(`[History API] Service ${id} - hours: ${hours}, startDate: ${startDate}, endDate: ${endDate}, limit: ${limit}`)
    
    let dbChecks = []
    
    // Try to get from database with specified period
    if (startDate && endDate) {
      // Use date range
      console.log(`[History API] Using date range query`)
      dbChecks = await getChecksByDateRange(id, startDate, endDate, limit)
    } else if (hours) {
      // Use hours period
      console.log(`[History API] Using hours period query: ${hours}h`)
      dbChecks = await getChecksByPeriod(id, hours, limit)
    } else {
      // Default: last 500 checks
      console.log(`[History API] Using default recent checks: ${limit}`)
      dbChecks = await getRecentChecks(id, limit)
    }
    
    console.log(`[History API] Found ${dbChecks.length} checks in database`)
    
    if (dbChecks.length > 0) {
      // Convert database format to HealthCheck format
      const history: HealthCheck[] = dbChecks.map((check) => ({
        timestamp: new Date(check.createdAt).getTime(),
        status: check.status as any,
        responseTime: check.latency,
        packetLoss: check.loss,
        minLatency: null,
        maxLatency: null,
        avgLatency: check.latency,
      }))
      return NextResponse.json({ history })
    }
    // Fallback to AWS if configured
    if (process.env.AWS_DYNAMODB_TABLE) {
      const history = await getHistoryAws(id)
      return NextResponse.json({ history })
    }
    // Fallback to in-memory storage
    const history = getServiceHistory(id)
    return NextResponse.json({ history })
  } catch (error) {
    console.error("Error fetching history:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    // Accept { check } to append or { history } to replace
    if (body.check) {
      const check = body.check as HealthCheck
      // Save to database
      await saveServiceCheck(id, check.status, check.avgLatency, check.packetLoss, 0)
      // Also keep in-memory copy
      if (process.env.AWS_DYNAMODB_TABLE) {
        const updated = await appendCheckAws(id, check)
        return NextResponse.json({ history: updated })
      }
      const updated = appendHealthCheck(id, check)
      return NextResponse.json({ history: updated })
    }
    if (Array.isArray(body.history)) {
      if (process.env.AWS_DYNAMODB_TABLE) {
        await setHistoryAws(id, body.history)
        return NextResponse.json({ history: body.history })
      }
      setServiceHistory(id, body.history as HealthCheck[])
      return NextResponse.json({ history: body.history })
    }
    return NextResponse.json({ error: "invalid payload" }, { status: 400 })
  } catch (e) {
    console.error("Error updating history:", e)
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }
}
