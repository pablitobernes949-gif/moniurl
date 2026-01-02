"use client"

import { useEffect } from "react"
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Alert } from "@/lib/types"

export function AlertNotificationSystem() {
  const { toast } = useToast()

  useEffect(() => {
    // Setup SSE for real-time alerts
    try {
      const es = new EventSource("/api/alerts/stream")

      es.onmessage = (event) => {
        try {
          const alert: Alert = JSON.parse(event.data)
          showAlertToast(alert, toast)
        } catch (e) {
          console.error("Failed to parse alert event:", e)
        }
      }

      es.onerror = () => {
        console.warn("Alert stream connection lost, will retry...")
        es.close()
      }

      return () => es.close()
    } catch (e) {
      console.error("Failed to setup alert stream:", e)
    }
  }, [toast])

  return null
}

function showAlertToast(alert: Alert, toast: ReturnType<typeof useToast>["toast"]) {
  const iconMap = {
    info: <AlertCircle className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    critical: <AlertCircle className="h-4 w-4 text-red-500" />,
  }

  const colorMap = {
    info: "bg-blue-500/10 border-blue-500/30",
    warning: "bg-yellow-500/10 border-yellow-500/30",
    critical: "bg-red-500/10 border-red-500/30",
  }

  toast({
    title: alert.message,
    description: `Value: ${alert.value} | Threshold: ${alert.threshold}`,
    duration: alert.severity === "critical" ? 10000 : 5000,
  })
}
