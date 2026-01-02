"use client"

import { TrendingUp, Target, Award } from "lucide-react"
import type { HealthCheck } from "@/lib/types"

interface SLAMetricsProps {
  history: HealthCheck[]
  serviceName: string
}

export function SLAMetrics({ history, serviceName }: SLAMetricsProps) {
  // Calculate SLA metrics
  const totalChecks = history.length
  const onlineChecks = history.filter((c) => c.status === "online").length
  const uptimePercentage = totalChecks > 0 ? (onlineChecks / totalChecks) * 100 : 0

  // Calculate downtime in minutes (assuming 30s interval)
  const offlineChecks = totalChecks - onlineChecks
  const downtimeMinutes = (offlineChecks * 30) / 60

  // SLA targets
  const slaTargets = [
    { name: "99.9%", value: 99.9, color: "text-green-500", bgColor: "bg-green-500/10" },
    { name: "99.99%", value: 99.99, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { name: "99.999%", value: 99.999, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  ]

  const achievedSLA = slaTargets.filter((sla) => uptimePercentage >= sla.value)
  const currentSLA = achievedSLA.length > 0 ? achievedSLA[achievedSLA.length - 1] : null

  // Calculate allowed downtime for period
  const periodHours = (totalChecks * 30) / 3600
  const allowedDowntime99 = (periodHours * 60 * (100 - 99.9)) / 100
  const allowedDowntime999 = (periodHours * 60 * (100 - 99.99)) / 100
  const allowedDowntime9999 = (periodHours * 60 * (100 - 99.999)) / 100

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
        <Target className="h-5 w-5 text-blue-500" />
        Métricas de SLA
      </h3>

      {/* Current Uptime */}
      <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-400">Uptime Atual</p>
            <p className="text-3xl font-bold text-gray-100 mt-1">
              {uptimePercentage.toFixed(4)}%
            </p>
          </div>
          {currentSLA && (
            <div className={`${currentSLA.bgColor} ${currentSLA.color} px-4 py-2 rounded-lg flex items-center gap-2`}>
              <Award className="h-5 w-5" />
              <span className="font-semibold">{currentSLA.name} SLA</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Verificações Online</p>
            <p className="text-gray-100 font-semibold">{onlineChecks} / {totalChecks}</p>
          </div>
          <div>
            <p className="text-gray-400">Downtime Total</p>
            <p className="text-gray-100 font-semibold">{downtimeMinutes.toFixed(1)} min</p>
          </div>
        </div>
      </div>

      {/* SLA Targets */}
      <div className="grid gap-3">
        {slaTargets.map((sla) => {
          const achieved = uptimePercentage >= sla.value
          const allowedDowntime = 
            sla.value === 99.9 ? allowedDowntime99 :
            sla.value === 99.99 ? allowedDowntime999 :
            allowedDowntime9999

          return (
            <div
              key={sla.name}
              className={`rounded-lg border p-4 ${
                achieved
                  ? `border-green-500/30 ${sla.bgColor}`
                  : "border-gray-700 bg-gray-800/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {achieved ? (
                    <Award className={`h-4 w-4 ${sla.color}`} />
                  ) : (
                    <Target className="h-4 w-4 text-gray-500" />
                  )}
                  <span className={`font-semibold ${achieved ? sla.color : "text-gray-400"}`}>
                    {sla.name} SLA
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  achieved ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400"
                }`}>
                  {achieved ? "Atingido" : "Não atingido"}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                Downtime permitido: {allowedDowntime.toFixed(2)} min
                {!achieved && ` | Excedido: ${(downtimeMinutes - allowedDowntime).toFixed(2)} min`}
              </div>
            </div>
          )
        })}
      </div>

      {/* Period Info */}
      <div className="text-xs text-gray-500 text-center">
        Métricas calculadas para {totalChecks} verificações ({periodHours.toFixed(1)}h de monitoramento)
      </div>
    </div>
  )
}
