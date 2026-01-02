"use client"

import { useState } from "react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Brush } from "recharts"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import type { HealthCheck } from "@/lib/types"

interface ServiceChartProps {
  history: HealthCheck[]
}

export function ServiceChart({ history }: ServiceChartProps) {
  const [zoomRange, setZoomRange] = useState<{ startIndex: number; endIndex: number } | null>(null)
  
  // Pegar últimas 48 entradas para o gráfico (últimas 12 horas com checks de 30 em 30 segundos)
  const recentHistory = history.slice(-48)
  
  // Se não há histórico, mostrar mensagem
  if (recentHistory.length === 0) {
    return (
      <div className="h-[200px] w-full rounded-lg border border-border/50 bg-muted/20 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Aguardando dados de monitoramento...</p>
      </div>
    )
  }
  
  const data = recentHistory.map((check) => ({
    time: new Date(check.timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    latency: check.responseTime || 0,
    minLatency: check.minLatency || 0,
    maxLatency: check.maxLatency || 0,
    avgLatency: check.avgLatency || check.responseTime || 0,
    packetLoss: check.packetLoss || 0,
    status: check.status,
  }))

  // Calcular estatísticas do período visível
  const validLatencies = recentHistory
    .filter((check) => check.responseTime !== null && check.status === "online")
    .map((check) => check.responseTime!)
  
  const stats = validLatencies.length > 0 ? {
    min: Math.min(...validLatencies),
    max: Math.max(...validLatencies),
    avg: Math.round(validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length),
  } : { min: 0, max: 0, avg: 0 }

  const handleResetZoom = () => {
    setZoomRange(null)
  }

  const handleZoomIn = () => {
    const currentStart = zoomRange?.startIndex || 0
    const currentEnd = zoomRange?.endIndex || data.length - 1
    const range = currentEnd - currentStart
    const newRange = Math.max(Math.floor(range * 0.7), 5)
    const center = Math.floor((currentStart + currentEnd) / 2)
    setZoomRange({
      startIndex: Math.max(0, center - Math.floor(newRange / 2)),
      endIndex: Math.min(data.length - 1, center + Math.floor(newRange / 2)),
    })
  }

  const handleZoomOut = () => {
    if (!zoomRange) {
      return
    }
    const currentStart = zoomRange.startIndex
    const currentEnd = zoomRange.endIndex
    const range = currentEnd - currentStart
    const newRange = Math.min(Math.floor(range * 1.5), data.length - 1)
    const center = Math.floor((currentStart + currentEnd) / 2)
    const newStart = Math.max(0, center - Math.floor(newRange / 2))
    const newEnd = Math.min(data.length - 1, center + Math.floor(newRange / 2))
    
    if (newStart === 0 && newEnd === data.length - 1) {
      setZoomRange(null)
    } else {
      setZoomRange({ startIndex: newStart, endIndex: newEnd })
    }
  }

  return (
    <div className="space-y-4">
      {/* Controles de Zoom */}
      <div className="flex items-center gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          disabled={zoomRange && (zoomRange.endIndex - zoomRange.startIndex) <= 5}
        >
          <ZoomIn className="h-4 w-4 mr-1" />
          Zoom +
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-4 w-4 mr-1" />
          Zoom -
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetZoom}
          disabled={!zoomRange}
        >
          <Maximize2 className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>

      {/* Gráfico de Latência com Range */}
      <div className="h-[300px] w-full rounded-lg border border-blue-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data} 
            margin={{ top: 10, right: 20, left: 0, bottom: zoomRange ? 60 : 30 }}
          >
            <defs>
              <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              fontSize={13}
              fontWeight={500}
              tickLine={false} 
              axisLine={{ stroke: "#475569", strokeWidth: 1 }}
              interval="preserveStartEnd"
              tick={{ fill: "#e2e8f0", fontSize: 13, fontWeight: 500 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              fontSize={13}
              fontWeight={500}
              tickLine={false}
              axisLine={{ stroke: "#475569", strokeWidth: 1 }}
              tickFormatter={(value) => `${value}ms`}
              domain={['auto', 'auto']}
              tick={{ fill: "#e2e8f0", fontSize: 13, fontWeight: 500 }}
              width={50}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="rounded-lg border-2 border-blue-500 bg-slate-950 p-4 shadow-2xl">
                      <p className="text-base font-bold text-blue-300 mb-3">{data.time}</p>
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-8">
                          <span className="text-sm font-semibold text-slate-300">Latência:</span>
                          <span className="text-xl font-bold text-blue-400">{data.latency}ms</span>
                        </div>
                        {data.minLatency > 0 && (
                          <>
                            <div className="flex items-center justify-between gap-8">
                              <span className="text-sm font-semibold text-slate-300">Min:</span>
                              <span className="text-lg font-bold text-green-400">{data.minLatency}ms</span>
                            </div>
                            <div className="flex items-center justify-between gap-8">
                              <span className="text-sm font-semibold text-slate-300">Média:</span>
                              <span className="text-lg font-bold text-blue-400">{data.avgLatency}ms</span>
                            </div>
                            <div className="flex items-center justify-between gap-8">
                              <span className="text-sm font-semibold text-slate-300">Max:</span>
                              <span className="text-lg font-bold text-orange-400">{data.maxLatency}ms</span>
                            </div>
                          </>
                        )}
                        {data.packetLoss !== undefined && (
                          <div className="flex items-center justify-between gap-8 pt-2.5 border-t border-slate-700">
                            <span className="text-sm font-semibold text-slate-300">Perda Pacotes:</span>
                            <span className={`text-lg font-bold ${data.packetLoss > 0 ? 'text-red-400' : 'text-green-400'}`}>
                              {data.packetLoss}%
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-8">
                          <span className="text-sm font-semibold text-slate-300">Status:</span>
                          <span className={`text-lg font-bold ${data.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                            {data.status === 'online' ? '🟢 Online' : '🔴 Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="latency"
              stroke="#60a5fa"
              strokeWidth={3}
              fill="url(#latencyGradient)"
              fillOpacity={1}
              isAnimationActive={false}
            />
            {/* Brush para zoom e pan */}
            {data.length > 10 && (
              <Brush
                dataKey="time"
                height={30}
                stroke="#60a5fa"
                fill="#1e293b"
                startIndex={zoomRange?.startIndex}
                endIndex={zoomRange?.endIndex}
                onChange={(range) => {
                  if (range && 'startIndex' in range && 'endIndex' in range) {
                    setZoomRange({
                      startIndex: range.startIndex || 0,
                      endIndex: range.endIndex || data.length - 1,
                    })
                  }
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
