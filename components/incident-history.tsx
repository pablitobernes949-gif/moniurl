"use client"

import { AlertTriangle, CheckCircle, Clock } from "lucide-react"
import type { HealthCheck } from "@/lib/types"

interface IncidentHistoryProps {
  history: HealthCheck[]
}

interface Incident {
  startTime: number
  endTime: number |null
  duration: number | null
  status: "offline" | "unstable"
  checksAffected: number
}

export function IncidentHistory({ history }: IncidentHistoryProps) {
  // Detect incidents from history
  const incidents: Incident[] = []

  // Sort history by timestamp
  const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp)

  for (let i = 0; i < sortedHistory.length; i++) {
    const check = sortedHistory[i]
    
    if (check.status === "offline" || check.status === "unstable") {
      // Start of an incident
      const startTime = check.timestamp
      let endTime: number | null = null
      let checksAffected = 1
      const status = check.status

      // Look ahead to find the end of this incident
      for (let j = i + 1; j < sortedHistory.length; j++) {
        if (sortedHistory[j].status === "offline" || sortedHistory[j].status === "unstable") {
          checksAffected++
          i = j
        } else {
          endTime = sortedHistory[j].timestamp
          i = j - 1
          break
        }
      }

      // If no end found, incident is ongoing
      if (endTime === null) {
        endTime = Date.now()
        i = sortedHistory.length // Exit loop
      }

      const duration = endTime - startTime

      incidents.push({
        startTime,
        endTime,
        duration,
        status,
        checksAffected,
      })
    }
  }

  // Show last 10 incidents
  const recentIncidents = incidents.slice(-10).reverse()

  const formatDuration = (ms: number | null) => {
    if (!ms) return "Em andamento"
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  if (recentIncidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-green-500/5 border-green-500/20">
        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum Incidente Registrado</h3>
        <p className="text-sm text-muted-foreground">
          O serviço tem estado estável sem interrupções recentes
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Histórico de Incidentes</h3>
        <span className="text-sm text-muted-foreground">
          Últimos {recentIncidents.length} incidentes
        </span>
      </div>

      <div className="space-y-3">
        {recentIncidents.map((incident, index) => (
          <div
            key={index}
            className={`rounded-lg border p-4 ${
              incident.status === "offline"
                ? "border-red-500/30 bg-red-500/5"
                : "border-yellow-500/30 bg-yellow-500/5"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className={`h-5 w-5 ${
                    incident.status === "offline" ? "text-red-500" : "text-yellow-500"
                  }`}
                />
                <span
                  className={`font-semibold ${
                    incident.status === "offline" ? "text-red-500" : "text-yellow-500"
                  }`}
                >
                  {incident.status === "offline" ? "Offline" : "Instável"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDuration(incident.duration)}
              </div>
            </div>

            <div className="text-sm space-y-1">
              <div className="text-muted-foreground">
                <span className="font-medium">Início:</span>{" "}
                {new Date(incident.startTime).toLocaleString("pt-BR")}
              </div>
              {incident.endTime && (
                <div className="text-muted-foreground">
                  <span className="font-medium">Fim:</span>{" "}
                  {incident.endTime === Date.now()
                    ? "Em andamento"
                    : new Date(incident.endTime).toLocaleString("pt-BR")}
                </div>
              )}
              <div className="text-muted-foreground">
                <span className="font-medium">Verificações afetadas:</span>{" "}
                {incident.checksAffected}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
