"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, AlertTriangle, X } from "lucide-react"
import type { Alert } from "@/lib/types"

interface AlertHistoryDialogProps {
  serviceId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const severityColors = {
  info: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  warning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  critical: "bg-red-500/10 text-red-600 border-red-500/30",
}

const statusColors = {
  active: "bg-red-500/10 text-red-600",
  acknowledged: "bg-yellow-500/10 text-yellow-600",
  resolved: "bg-green-500/10 text-green-600",
}

const statusIcons = {
  active: <AlertCircle className="h-4 w-4" />,
  acknowledged: <AlertTriangle className="h-4 w-4" />,
  resolved: <CheckCircle className="h-4 w-4" />,
}

export function AlertHistoryDialog({ serviceId, open, onOpenChange }: AlertHistoryDialogProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    loadAlerts()
  }, [open])

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/alerts/${serviceId}`)
      if (res.ok) {
        const data = await res.json()
        setAlerts(data.alerts || [])
      }
    } catch (error) {
      console.error("Failed to load alert history:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledge = async (alert: Alert) => {
    try {
      const res = await fetch("/api/alerts/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "acknowledge",
          alertId: alert.id,
        }),
      })
      if (res.ok) {
        await loadAlerts()
      }
    } catch (error) {
      console.error("Failed to acknowledge alert:", error)
    }
  }

  const handleResolve = async (alert: Alert) => {
    try {
      const res = await fetch("/api/alerts/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resolve",
          alertId: alert.id,
        }),
      })
      if (res.ok) {
        await loadAlerts()
      }
    } catch (error) {
      console.error("Failed to resolve alert:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[600px]">
        <DialogHeader>
          <DialogTitle>Histórico de Alertas</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <p>Nenhum alerta registrado</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <Card key={alert.id} className={`p-4 border ${severityColors[alert.severity]}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {statusIcons[alert.status]}
                      <span className="font-semibold">{alert.message}</span>
                      <Badge className={statusColors[alert.status]}>
                        {alert.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Valor: {alert.value} | Limiar: {alert.threshold}</p>
                      <p>
                        Disparado: {new Date(alert.triggeredAt).toLocaleString("pt-BR")}
                      </p>
                      {alert.acknowledgedAt && (
                        <p>Reconhecido: {new Date(alert.acknowledgedAt).toLocaleString("pt-BR")}</p>
                      )}
                      {alert.resolvedAt && (
                        <p>Resolvido: {new Date(alert.resolvedAt).toLocaleString("pt-BR")}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {alert.status === "active" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAcknowledge(alert)}
                        >
                          Reconhecer
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolve(alert)}
                        >
                          Resolver
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
