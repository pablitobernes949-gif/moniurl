"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { Service } from "@/lib/utils/types"

interface ComparisonChartModalProps {
  isOpen: boolean
  onClose: () => void
  services: Service[]
}

const COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
]

export function ComparisonChartModal({
  isOpen,
  onClose,
  services,
}: ComparisonChartModalProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [comparisonData, setComparisonData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (selectedServices.length > 0) {
      loadComparisonData()
    } else {
      setComparisonData([])
    }
  }, [selectedServices])

  const loadComparisonData = async () => {
    setIsLoading(true)
    try {
      // Carregar dados de todos os serviços selecionados
      const dataPromises = selectedServices.map(async (serviceId) => {
        const res = await fetch(`/api/services/${serviceId}/history?period=1h`)
        if (res.ok) {
          const data = await res.json()
          return { serviceId, checks: data.checks || [] }
        }
        return { serviceId, checks: [] }
      })

      const allData = await Promise.all(dataPromises)

      // Combinar dados por timestamp
      const timeMap = new Map<string, any>()

      allData.forEach(({ serviceId, checks }) => {
        const service = services.find((s) => s.id === serviceId)
        if (!service) return

        checks.forEach((check: any) => {
          const timeKey = new Date(check.timestamp).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })

          if (!timeMap.has(timeKey)) {
            timeMap.set(timeKey, { time: timeKey })
          }

          const entry = timeMap.get(timeKey)
          entry[service.name] = check.status === "online" ? check.responseTime : null
        })
      })

      const combined = Array.from(timeMap.values())
      setComparisonData(combined)
    } catch (error) {
      console.error("Error loading comparison data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Comparação de Serviços</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Service Selection */}
          <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
            {services.map((service) => (
              <div key={service.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`service-${service.id}`}
                  checked={selectedServices.includes(service.id)}
                  onCheckedChange={() => handleToggleService(service.id)}
                  disabled={
                    !selectedServices.includes(service.id) &&
                    selectedServices.length >= 8
                  }
                />
                <Label
                  htmlFor={`service-${service.id}`}
                  className="text-sm cursor-pointer"
                >
                  {service.name}
                </Label>
              </div>
            ))}
          </div>

          {/* Comparison Chart */}
          {selectedServices.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Selecione pelo menos um serviço para comparar
            </div>
          )}

          {selectedServices.length > 0 && isLoading && (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-muted-foreground">Carregando dados...</p>
            </div>
          )}

          {selectedServices.length > 0 && !isLoading && (
            <div className="h-[400px] w-full rounded-lg border bg-gradient-to-b from-slate-900 to-slate-950 p-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparisonData}>
                  <XAxis
                    dataKey="time"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#475569" }}
                    tick={{ fill: "#e2e8f0" }}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#475569" }}
                    tickFormatter={(value) => `${value}ms`}
                    tick={{ fill: "#e2e8f0" }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border-2 border-blue-500 bg-slate-950 p-4 shadow-2xl">
                            <p className="font-bold text-blue-300 mb-2">
                              {payload[0].payload.time}
                            </p>
                            <div className="space-y-1">
                              {payload.map((entry, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between gap-4"
                                >
                                  <span className="text-sm text-slate-300">
                                    {entry.name}:
                                  </span>
                                  <span
                                    className="font-bold"
                                    style={{ color: entry.color }}
                                  >
                                    {entry.value ? `${entry.value}ms` : "Offline"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="line"
                    wrapperStyle={{ color: "#e2e8f0" }}
                  />
                  {selectedServices.map((serviceId, index) => {
                    const service = services.find((s) => s.id === serviceId)
                    return (
                      <Line
                        key={serviceId}
                        type="monotone"
                        dataKey={service?.name || ""}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                      />
                    )
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
