import { NextResponse } from "next/server"
import { getHistory, subscribe } from "@/lib/monitoring/realtime"
import { getHistoryAws } from "@/lib/monitoring/aws-realtime"
import { getService } from "@/lib/database/storage"

function createSSEStream(id: string, initial: any) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      const send = (data: any) => {
        try {
          const payload = `data: ${JSON.stringify(data)}\n\n`
          controller.enqueue(encoder.encode(payload))
        } catch (e) {
          // ignore
        }
      }

      // send initial state
      send(initial)

      const cb = (d: any) => send(d)
      const unsub = subscribe(id, cb)

      if (controller.signal) {
        controller.signal.addEventListener("abort", () => {
          unsub()
        })
      }
    },
    cancel() {},
  })

  return stream
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // If AWS configured, fetch initial state from DynamoDB; otherwise from storage
    const service = await getService(id)
    const initialHistory = process.env.AWS_DYNAMODB_TABLE ? await getHistoryAws(id) : service?.history || []
    const stream = createSSEStream(id, { history: initialHistory })
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Error setting up SSE:", error)
    return new Response("Error setting up event stream", { status: 500 })
  }
}
