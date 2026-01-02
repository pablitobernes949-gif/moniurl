"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Trash2 } from "lucide-react"
import type { AlertRule, AlertType, AlertSeverity } from "@/lib/types"

interface AlertSettingsDialogProps {
  serviceId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AlertSettingsDialog({ serviceId, open, onOpenChange }: AlertSettingsDialogProps) {
  const [rules, setRules] = useState<AlertRule[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    loadRules()
  }, [open])

  const loadRules = async () => {
    try {
      const res = await fetch(`/api/services/${serviceId}/alerts`)
      if (res.ok) {
        const data = await res.json()
        setRules(data.rules || [])
      }
    } catch (error) {
      console.error("Failed to load alert rules:", error)
    }
  }

  const handleInitDefaults = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/services/${serviceId}/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "init-defaults" }),
      })
      if (res.ok) {
        const data = await res.json()
        setRules(data.rules || [])
      }
    } catch (error) {
      console.error("Failed to initialize defaults:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleRule = async (rule: AlertRule) => {
    try {
      const res = await fetch(`/api/services/${serviceId}/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          ruleId: rule.id,
          enabled: !rule.enabled,
          threshold: rule.threshold,
        }),
      })
      if (res.ok) {
        await loadRules()
      }
    } catch (error) {
      console.error("Failed to toggle rule:", error)
    }
  }

  const handleUpdateThreshold = async (rule: AlertRule, newThreshold: number) => {
    try {
      const res = await fetch(`/api/services/${serviceId}/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          ruleId: rule.id,
          enabled: rule.enabled,
          threshold: newThreshold,
        }),
      })
      if (res.ok) {
        await loadRules()
      }
    } catch (error) {
      console.error("Failed to update threshold:", error)
    }
  }

  const handleDeleteRule = async (rule: AlertRule) => {
    try {
      const res = await fetch(`/api/services/${serviceId}/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          ruleId: rule.id,
        }),
      })
      if (res.ok) {
        await loadRules()
      }
    } catch (error) {
      console.error("Failed to delete rule:", error)
    }
  }

  const typeLabels: Record<AlertType, string> = {
    latency: "Latência",
    packet_loss: "Perda de Pacotes",
    availability: "Disponibilidade",
  }

  const typeUnits: Record<AlertType, string> = {
    latency: "ms",
    packet_loss: "%",
    availability: "%",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configurar Alertas</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {rules.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 text-center">
              <AlertTriangle className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="mb-4 text-sm text-muted-foreground">Nenhuma regra de alerta configurada</p>
              <Button onClick={handleInitDefaults} disabled={loading}>
                Usar Padrões
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => (
                <Card key={rule.id} className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">{typeLabels[rule.type]}</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Ativar</span>
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={() => handleToggleRule(rule)}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Label htmlFor={`threshold-${rule.id}`} className="text-sm text-muted-foreground">
                          Limiar:
                        </Label>
                        <Input
                          id={`threshold-${rule.id}`}
                          type="number"
                          value={rule.threshold}
                          onChange={(e) => handleUpdateThreshold(rule, parseInt(e.target.value))}
                          className="w-24"
                          disabled={!rule.enabled}
                        />
                        <span className="text-sm text-muted-foreground">{typeUnits[rule.type]}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Label htmlFor={`severity-${rule.id}`} className="text-sm text-muted-foreground">
                          Severidade:
                        </Label>
                        <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                          {rule.severity}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRule(rule)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
