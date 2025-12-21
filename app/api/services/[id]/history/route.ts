import { NextResponse } from "next/server"
import { getHistory, appendCheck, setHistory } from "@/lib/realtime"
import { getHistoryAws, appendCheckAws, setHistoryAws } from "@/lib/aws-realtime"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  // Prefer AWS table if configured
  if (process.env.AWS_DYNAMODB_TABLE) {
    const history = await getHistoryAws(params.id)
    return NextResponse.json({ history })
  }
  const history = getHistory(params.id)
  return NextResponse.json({ history })
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    // Accept { check } to append or { history } to replace
    if (body.check) {
      if (process.env.AWS_DYNAMODB_TABLE) {
        const updated = await appendCheckAws(params.id, body.check)
        return NextResponse.json({ history: updated })
      }
      const updated = appendCheck(params.id, body.check)
      return NextResponse.json({ history: updated })
    }
    if (Array.isArray(body.history)) {
      if (process.env.AWS_DYNAMODB_TABLE) {
        await setHistoryAws(params.id, body.history)
        return NextResponse.json({ history: body.history })
      }
      setHistory(params.id, body.history)
      return NextResponse.json({ history: body.history })
    }
    return NextResponse.json({ error: "invalid payload" }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }
}
