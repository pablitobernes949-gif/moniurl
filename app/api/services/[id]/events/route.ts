import { NextResponse } from "next/server"
import { getHistory, subscribe } from "@/lib/realtime"
import { getHistoryAws } from "@/lib/aws-realtime"

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

      controller.signal.addEventListener("abort", () => {
        unsub()
      })
    },
    cancel() {},
  })

  return stream
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id
  // If AWS configured, fetch initial state from DynamoDB; otherwise from in-memory
  const initialHistory = process.env.AWS_DYNAMODB_TABLE ? await getHistoryAws(id) : getHistory(id)
  const stream = createSSEStream(id, { history: initialHistory })
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
