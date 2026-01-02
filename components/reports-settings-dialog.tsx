"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Mail, Download, Calendar } from "lucide-react"
import type { Service } from "@/lib/types"

interface ReportConfig {
  frequency: "daily" | "weekly" | "monthly"
  email: string
  includeCharts: boolean
  includeIncidents: boolean
  includeSLA: boolean
  selectedServices: string[]
}

interface ReportsSettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  services: Service[]
}

export function ReportsSettingsDialog({
  isOpen,
  onClose,
  services,
}: ReportsSettingsDialogProps) {
  const [config, setConfig] = useState<ReportConfig>({
    frequency: "weekly",
    email: "",
    includeCharts: true,
    includeIncidents: true,
    includeSLA: true,
    selectedServices: services.map((s) => s.id),
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleToggleService = (serviceId: string) => {
    setConfig((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter((id) => id !== serviceId)
        : [...prev.selectedServices, serviceId],
    }))
  }

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      // Simular geração de relatório
      const reportData = {
        generatedAt: new Date().toISOString(),
        period: config.frequency,
        services: config.selectedServices.map((id) => {
          const service = services.find((s) => s.id === id)
          return {
            name: service?.name || "",
            status: service?.status || "",
            uptime: service?.uptime || 0,
            avgLatency: service?.responseTime || 0,
          }
        }),
        includeCharts: config.includeCharts,
        includeIncidents: config.includeIncidents,
        includeSLA: config.includeSLA,
      }

      // Criar arquivo JSON para download
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `report-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      alert("✅ Relatório gerado com sucesso!")
    } catch (error) {
      alert("❌ Erro ao gerar relatório: " + (error as Error).message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleScheduleReport = async () => {
    try {
      // Em produção, salvar configuração no banco de dados
      console.log("Configuração de relatório agendado:", config)
      alert(
        `✅ Relatório ${config.frequency === "daily" ? "diário" : config.frequency === "weekly" ? "semanal" : "mensal"} agendado para ${config.email}`
      )
      onClose()
    } catch (error) {
      alert("❌ Erro ao agendar relatório: " + (error as Error).message)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatórios Automáticos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Frequency */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              Frequência
            </Label>
            <Select
              value={config.frequency}
              onValueChange={(value: "daily" | "weekly" | "monthly") =>
                setConfig({ ...config, frequency: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4" />
              Email para Envio
            </Label>
            <Input
              type="email"
              value={config.email}
              onChange={(e) => setConfig({ ...config, email: e.target.value })}
              placeholder="seu-email@exemplo.com"
            />
          </div>

          {/* Content Options */}
          <div>
            <Label className="mb-3 block font-semibold">Conteúdo do Relatório</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCharts"
                  checked={config.includeCharts}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, includeCharts: !!checked })
                  }
                />
                <Label htmlFor="includeCharts" className="cursor-pointer">
                  Incluir Gráficos
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeIncidents"
                  checked={config.includeIncidents}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, includeIncidents: !!checked })
                  }
                />
                <Label htmlFor="includeIncidents" className="cursor-pointer">
                  Incluir Histórico de Incidentes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeSLA"
                  checked={config.includeSLA}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, includeSLA: !!checked })
                  }
                />
                <Label htmlFor="includeSLA" className="cursor-pointer">
                  Incluir Métricas de SLA
                </Label>
              </div>
            </div>
          </div>

          {/* Service Selection */}
          <div>
            <Label className="mb-3 block font-semibold">
              Serviços ({config.selectedServices.length}/{services.length})
            </Label>
            <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto p-4 border rounded-lg">
              {services.map((service) => (
                <div key={service.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`report-service-${service.id}`}
                    checked={config.selectedServices.includes(service.id)}
                    onCheckedChange={() => handleToggleService(service.id)}
                  />
                  <Label
                    htmlFor={`report-service-${service.id}`}
                    className="cursor-pointer text-sm"
                  >
                    {service.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Info */}
          <div className="p-4 bg-muted rounded-lg text-sm">
            <p className="font-semibold mb-2">📊 Prévia do Relatório:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Frequência: {config.frequency === "daily" ? "Diário" : config.frequency === "weekly" ? "Semanal" : "Mensal"}</li>
              <li>• Serviços: {config.selectedServices.length} selecionados</li>
              <li>• Formato: PDF (email) ou JSON (download)</li>
              <li>
                • Conteúdo:{" "}
                {[
                  config.includeCharts && "Gráficos",
                  config.includeIncidents && "Incidentes",
                  config.includeSLA && "SLA",
                ]
                  .filter(Boolean)
                  .join(", ")}
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateReport}
              disabled={
                isGenerating || config.selectedServices.length === 0
              }
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? "Gerando..." : "Gerar Agora (JSON)"}
            </Button>
            <Button
              onClick={handleScheduleReport}
              disabled={!config.email || config.selectedServices.length === 0}
              variant="outline"
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-2" />
              Agendar Envio
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
