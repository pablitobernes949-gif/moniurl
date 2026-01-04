import { NextResponse } from "next/server"
import { subscribe } from "@/lib/monitoring/alerts"

function createAlertSSEStream() {
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

      const unsubscribe = subscribe((alert) => {
        send(alert)
      })

      if (controller.signal) {
        controller.signal.addEventListener("abort", () => {
          unsubscribe()
        })
      }
    },
    cancel() {},
  })

  return stream
}

export async function GET() {
  try {
    const stream = createAlertSSEStream()
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Error setting up alert SSE:", error)
    return new Response("Error setting up event stream", { status: 500 })
  }
}
