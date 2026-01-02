"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Bell, XCircle, CheckCircle, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Alert {
  id: string
  serviceId: string
  serviceName: string
  type: string
  severity: "critical" | "warning" | "info"
  message: string
  triggeredAt: Date
  status: "active" | "acknowledged" | "resolved"
}

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadAlerts()
    const interval = setInterval(loadAlerts, 10000) // Check every 10s
    return () => clearInterval(interval)
  }, [])

  const loadAlerts = async () => {
    try {
      const res = await fetch("/api/alerts/active")
      if (res.ok) {
        const data = await res.json()
        setAlerts(data.alerts || [])
        setUnreadCount(data.alerts?.filter((a: Alert) => a.status === "active").length || 0)
      }
    } catch (error) {
      console.error("Failed to load alerts:", error)
    }
  }

  const handleAcknowledge = async (alertId: string) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "acknowledged" }),
      })
      if (res.ok) {
        loadAlerts()
      }
    } catch (error) {
      console.error("Failed to acknowledge alert:", error)
    }
  }

  const severityColors = {
    critical: "bg-red-500/10 border-red-500/30 text-red-400",
    warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    info: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  }

  const severityIcons = {
    critical: XCircle,
    warning: AlertTriangle,
    info: Bell,
  }

  if (alerts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Alert Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg relative"
        variant={unreadCount > 0 ? "destructive" : "default"}
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Alerts Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 max-h-[600px] bg-card border border-border rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-card border-b border-border p-4 flex items-center justify-between sticky top-0">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Alertas Ativos</h3>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {alerts.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Alerts List */}
          <div className="overflow-y-auto max-h-[500px] p-3 space-y-2">
            {alerts.map((alert) => {
              const SeverityIcon = severityIcons[alert.severity]
              return (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-4 ${severityColors[alert.severity]}`}
                >
                  <div className="flex items-start gap-3">
                    <SeverityIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm truncate">
                          {alert.serviceName}
                        </span>
                        <span className="text-xs opacity-70 ml-2 flex-shrink-0">
                          {new Date(alert.triggeredAt).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-xs opacity-90 mb-3">{alert.message}</p>
                      
                      {alert.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAcknowledge(alert.id)}
                          className="h-7 text-xs"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Reconhecer
                        </Button>
                      )}
                      
                      {alert.status === "acknowledged" && (
                        <div className="flex items-center gap-1 text-xs opacity-70">
                          <CheckCircle className="h-3 w-3" />
                          <span>Reconhecido</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
