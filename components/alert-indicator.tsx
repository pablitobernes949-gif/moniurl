"use client"

import { useEffect, useState } from "react"
import { AlertCircle, AlertTriangle, Settings, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertSettingsDialog } from "@/components/alert-settings-dialog"
import { AlertHistoryDialog } from "@/components/alert-history-dialog"
import type { Alert } from "@/lib/types"

interface AlertIndicatorProps {
  serviceId: string
}

export function AlertIndicator({ serviceId }: AlertIndicatorProps) {
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    loadActiveAlerts()
    const interval = setInterval(loadActiveAlerts, 10000)
    return () => clearInterval(interval)
  }, [serviceId])

  const loadActiveAlerts = async () => {
    try {
      const res = await fetch("/api/alerts/active")
      if (res.ok) {
        const data = await res.json()
        const filtered = (data.alerts || []).filter((a: Alert) => a.serviceId === serviceId)
        setActiveAlerts(filtered)
      }
    } catch (error) {
      console.error("Failed to load active alerts:", error)
    }
  }

  if (activeAlerts.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(true)}
          className="h-8 w-8 p-0"
          title="Configurar alertas"
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowHistory(true)}
          className="h-8 w-8 p-0"
          title="Ver histórico"
        >
          <History className="h-4 w-4 text-muted-foreground" />
        </Button>
        <AlertSettingsDialog serviceId={serviceId} open={showSettings} onOpenChange={setShowSettings} />
        <AlertHistoryDialog serviceId={serviceId} open={showHistory} onOpenChange={setShowHistory} />
      </div>
    )
  }

  const criticalCount = activeAlerts.filter((a) => a.severity === "critical").length
  const warningCount = activeAlerts.filter((a) => a.severity === "warning").length

  return (
    <div className="flex items-center gap-3">
      {criticalCount > 0 && (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {criticalCount} Crítico
        </Badge>
      )}
      {warningCount > 0 && (
        <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {warningCount} Aviso
        </Badge>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowSettings(true)}
        className="h-8 w-8 p-0"
        title="Configurar alertas"
      >
        <Settings className="h-4 w-4 text-muted-foreground" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowHistory(true)}
        className="h-8 w-8 p-0"
        title="Ver histórico"
      >
        <History className="h-4 w-4 text-muted-foreground" />
      </Button>

      <AlertSettingsDialog serviceId={serviceId} open={showSettings} onOpenChange={setShowSettings} />
      <AlertHistoryDialog serviceId={serviceId} open={showHistory} onOpenChange={setShowHistory} />
    </div>
  )
}
