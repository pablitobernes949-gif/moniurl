"use client"

import { useState } from "react"
import { Settings, Clock, Zap, Network } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Service } from "@/lib/utils/types"

interface ServiceSettingsDialogProps {
  service: Service | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (settings: ServiceSettings) => void
}

export interface ServiceSettings {
  checkInterval: number // in seconds
  timeout: number // in milliseconds
  monitoringType: "ping" | "http" | "tcp"
  alertThreshold: number // consecutive failures before alert
}

export function ServiceSettingsDialog({ service, open, onOpenChange, onSave }: ServiceSettingsDialogProps) {
  const [checkInterval, setCheckInterval] = useState("30")
  const [timeout, setTimeout] = useState("5000")
  const [monitoringType, setMonitoringType] = useState<"ping" | "http" | "tcp">("ping")
  const [alertThreshold, setAlertThreshold] = useState("3")

  if (!service) return null

  const handleSave = () => {
    onSave({
      checkInterval: parseInt(checkInterval),
      timeout: parseInt(timeout),
      monitoringType,
      alertThreshold: parseInt(alertThreshold),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações - {service.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Check Interval */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Intervalo de Verificação
            </Label>
            <Select value={checkInterval} onValueChange={setCheckInterval}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 segundos</SelectItem>
                <SelectItem value="30">30 segundos</SelectItem>
                <SelectItem value="60">1 minuto</SelectItem>
                <SelectItem value="300">5 minutos</SelectItem>
                <SelectItem value="900">15 minutos</SelectItem>
                <SelectItem value="1800">30 minutos</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Frequência de verificação do serviço
            </p>
          </div>

          {/* Timeout */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Timeout (ms)
            </Label>
            <Input
              type="number"
              value={timeout}
              onChange={(e) => setTimeout(e.target.value)}
              min="1000"
              max="60000"
              step="1000"
            />
            <p className="text-xs text-muted-foreground">
              Tempo máximo de espera por resposta
            </p>
          </div>

          {/* Monitoring Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Tipo de Monitoramento
            </Label>
            <Select value={monitoringType} onValueChange={(v: any) => setMonitoringType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ping">PING (ICMP)</SelectItem>
                <SelectItem value="http">HTTP/HTTPS</SelectItem>
                <SelectItem value="tcp">TCP Port</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Método de verificação utilizado
            </p>
          </div>

          {/* Alert Threshold */}
          <div className="space-y-2">
            <Label>Limite para Alerta</Label>
            <Input
              type="number"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
              min="1"
              max="10"
            />
            <p className="text-xs text-muted-foreground">
              Falhas consecutivas antes de gerar alerta
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
