"use client"

import { useState } from "react"
import { Area, AreaChart, BarChart, Bar, Line, LineChart, ComposedChart, Scatter, ScatterChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import type { HealthCheck } from "@/lib/utils/types"

interface ServiceDetailsChartProps {
  history: HealthCheck[]
}

type ChartType = "area" | "line" | "bar" | "composed" | "scatter" | "stacked"

export function ServiceDetailsChart({ history }: ServiceDetailsChartProps) {
  const [chartType, setChartType] = useState<ChartType>("area")

  // Calcular período de tempo total
  const timeSpan = history.length > 0 
    ? new Date(history[history.length - 1].timestamp).getTime() - new Date(history[0].timestamp).getTime()
    : 0
  const hoursSpan = timeSpan / (1000 * 60 * 60)
  
  // Debug - remover depois
  console.log("📊 Período de dados:", {
    totalPoints: history.length,
    hoursSpan: hoursSpan.toFixed(2),
    firstTimestamp: history[0]?.timestamp,
    lastTimestamp: history[history.length - 1]?.timestamp,
  })
  
  // Usar formato com data se o período for >= 6 horas (para distinguir dia/noite)
  const showDate = hoursSpan >= 6
  
  // Usar todos os dados disponíveis
  const data = history.map((check) => {
    const date = new Date(check.timestamp)
    
    let timeStr = ""
    if (showDate) {
      // Formato: DD/MM HH:MM
      timeStr = date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }) + " " + date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } else {
      // Formato: HH:MM:SS
      timeStr = date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    }
    
    return {
      time: timeStr,
      timestamp: check.timestamp,
      latency: check.responseTime || 0,
      minLatency: check.minLatency || 0,
      maxLatency: check.maxLatency || 0,
      avgLatency: check.avgLatency || check.responseTime || 0,
      packetLoss: check.packetLoss || 0,
      status: check.status,
    }
  })
  
  // Função para mostrar labels de forma inteligente baseado na quantidade de dados
  const tickFormatter = (value: string, index: number) => {
    // Calcular intervalo baseado na quantidade de dados
    const totalPoints = data.length
    let showEvery = 1
    
    if (totalPoints > 100) {
      showEvery = Math.floor(totalPoints / 10) // Mostrar ~10 labels
    } else if (totalPoints > 50) {
      showEvery = Math.floor(totalPoints / 8) // Mostrar ~8 labels
    } else if (totalPoints > 20) {
      showEvery = Math.floor(totalPoints / 6) // Mostrar ~6 labels
    }
    
    // Sempre mostrar primeiro e último
    if (index === 0 || index === totalPoints - 1 || index % showEvery === 0) {
      return value
    }
    
    return ''
  }

  // Calcular estatísticas do período visível
  const validLatencies = history
    .filter((check) => check.responseTime !== null && check.status === "online")
    .map((check) => check.responseTime!)
  
  const stats = validLatencies.length > 0 ? {
    min: Math.min(...validLatencies),
    max: Math.max(...validLatencies),
    avg: Math.round(validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length),
  } : { min: 0, max: 0, avg: 0 }

  const chartButtons = [
    { id: "area" as ChartType, label: "Area" },
    { id: "line" as ChartType, label: "Linha" },
    { id: "bar" as ChartType, label: "Barra" },
    { id: "composed" as ChartType, label: "Composto" },
    { id: "scatter" as ChartType, label: "Dispersao" },
    { id: "stacked" as ChartType, label: "Empilhado" },
  ]

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 20, left: 0, bottom: 30 }
    }

    const tooltipContent = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload
        return (
          <div className="rounded-lg border-2 border-blue-500 bg-slate-950 p-4 shadow-2xl">
            <p className="text-base font-bold text-blue-300 mb-3">{data.time}</p>
            <div className="space-y-2.5">
              {payload.map((entry: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between gap-8">
                  <span className="text-sm font-semibold text-slate-300">{entry.name}:</span>
                  <span className="text-lg font-bold" style={{ color: entry.color }}>{entry.value}ms</span>
                </div>
              ))}
              {data.packetLoss !== undefined && (
                <div className="flex items-center justify-between gap-8 pt-2.5 border-t border-slate-700">
                  <span className="text-sm font-semibold text-slate-300">Perda Pacotes:</span>
                  <span className={`text-lg font-bold ${data.packetLoss > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {data.packetLoss}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )
      }
      return null
    }

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <XAxis dataKey="time" fontSize={13} fontWeight={500} tickLine={false} axisLine={{ stroke: "#475569", strokeWidth: 1 }} interval={0} tickFormatter={tickFormatter} tick={{ fill: "#e2e8f0", fontSize: 13, fontWeight: 500 }} angle={-45} textAnchor="end" height={60} />
            <YAxis fontSize={13} fontWeight={500} tickLine={false} axisLine={{ stroke: "#475569", strokeWidth: 1 }} tickFormatter={(value) => `${value}ms`} tick={{ fill: "#e2e8f0", fontSize: 13, fontWeight: 500 }} width={50} />
            <Tooltip content={tooltipContent} />
            <Line type="monotone" dataKey="latency" stroke="#60a5fa" strokeWidth={3} dot={false} name="Latência" />
            <Line type="monotone" dataKey="avgLatency" stroke="#f97316" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Média" />
          </LineChart>
        )
      
      case "bar":
        return (
          <BarChart {...commonProps}>
            <XAxis dataKey="time" fontSize={13} fontWeight={500} tickLine={false} axisLine={{ stroke: "#475569", strokeWidth: 1 }} interval={0} tickFormatter={tickFormatter} tick={{ fill: "#e2e8f0", fontSize: 13, fontWeight: 500 }} angle={-45} textAnchor="end" height={60} />
            <YAxis fontSize={13} fontWeight={500} tickLine={false} axisLine={{ stroke: "#475569", strokeWidth: 1 }} tickFormatter={(value) => `${value}ms`} tick={{ fill: "#e2e8f0", fontSize: 13, fontWeight: 500 }} width={50} />
            <Tooltip content={tooltipContent} />
            <Bar dataKey="latency" fill="#60a5fa" name="Latência" />
          </BarChart>
        )
      
      case "composed":
        return (
          <ComposedChart {...commonProps}>
            <XAxis dataKey="time" fontSize={13} fontWeight={500} tickLine={false} axisLine={{ stroke: "#475569", strokeWidth: 1 }} interval={0} tickFormatter={tickFormatter} tick={{ fill: "#e2e8f0", fontSize: 13, fontWeight: 500 }} angle={-45} textAnchor="end" height={60} />
            <YAxis fontSize={13} fontWeight={500} tickLine={false} axisLine={{ stroke: "#475569", strokeWidth: 1 }} tickFormatter={(value) => `${value}ms`} tick={{ fill: "#e2e8f0", fontSize: 13, fontWeight: 500 }} width={50} />
            <Tooltip content={tooltipContent} />
            <Bar dataKey="latency" fill="#60a5fa" name="Latência" />
            <Line type="monotone" dataKey="avgLatency" stroke="#f97316" strokeWidth={2} name="Média" />
          </ComposedChart>
        )
      
      case "scatter":
        return (
          <ScatterChart {...commonProps}>
            <XAxis dataKey="time" fontSize={13} fontWeight={500} tickLine={false} axisLine={{ stroke: "#475569", strokeWidth: 1 }} interval={0} tickFormatter={tickFormatter} tick={{ fill: "#e2e8f0", fontSize: 13, fontWeight: 500 }} angle={-45} textAnchor="end" height={60} />
            <YAxis fontSize={13} fontWeight={500} tickLine={false} axisLine={{ stroke: "#475569", strokeWidth: 1 }} tickFormatter={(value) => `${value}ms`} tick={{ fill: "#e2e8f0", fontSize: 13, fontWeight: 500 }} width={50} />
            <Tooltip content={tooltipContent} />
            <Scatter dataKey="latency" fill="#60a5fa" name="Latência" />
          </ScatterChart>
        )
      
      case "stacked":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" fontSize={13} fontWeight={500} tickLine={false} axisLine={{ stroke: "#475569", strokeWidth: 1 }} interval={0} tickFormatter={tickFormatter} tick={{ fill: "#e2e8f0", fontSize: 13, fontWeight: 500 }} angle={-45} textAnchor="end" height={60} />
            <YAxis fontSize={13} fontWeight={500} tickLine={false} axisLine={{ stroke: "#475569", strokeWidth: 1 }} tickFormatter={(value) => `${value}ms`} tick={{ fill: "#e2e8f0", fontSize: 13, fontWeight: 500 }} width={50} />
            <Tooltip content={tooltipContent} />
            <Area type="monotone" dataKey="minLatency" stackId="1" stroke="#22c55e" fill="url(#colorMin)" name="Mínima" isAnimationActive={false} />
            <Area type="monotone" dataKey="avgLatency" stackId="1" stroke="#60a5fa" fill="url(#colorAvg)" name="Média" isAnimationActive={false} />
            <Area type="monotone" dataKey="maxLatency" stackId="1" stroke="#f97316" fill="url(#colorMax)" name="Máxima" isAnimationActive={false} />
          </AreaChart>
        )
      
      default: // area
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" fontSize={13} fontWeight={500} tickLine={false} axisLine={{ stroke: "#475569", strokeWidth: 1 }} interval={0} tickFormatter={tickFormatter} tick={{ fill: "#e2e8f0", fontSize: 13, fontWeight: 500 }} angle={-45} textAnchor="end" height={60} />
            <YAxis fontSize={13} fontWeight={500} tickLine={false} axisLine={{ stroke: "#475569", strokeWidth: 1 }} tickFormatter={(value) => `${value}ms`} domain={['auto', 'auto']} tick={{ fill: "#e2e8f0", fontSize: 13, fontWeight: 500 }} width={50} />
            <Tooltip content={tooltipContent} />
            <Area type="monotone" dataKey="latency" stroke="#60a5fa" strokeWidth={3} fill="url(#latencyGradient)" fillOpacity={1} isAnimationActive={false} />
          </AreaChart>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Seletor de Tipo de Gráfico */}
      <div className="flex flex-wrap gap-2">
        {chartButtons.map((btn) => (
          <Button
            key={btn.id}
            onClick={() => setChartType(btn.id)}
            variant={chartType === btn.id ? "default" : "outline"}
            size="sm"
            className={`text-xs font-medium ${
              chartType === btn.id
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "border-slate-600 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {btn.label}
          </Button>
        ))}
      </div>

      {/* Gráfico de Latência */}
      <div className="h-[400px] w-full rounded-lg border border-blue-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-6">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Perda de Pacotes */}
      <div className="h-[300px] w-full rounded-lg border border-red-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-6">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-slate-300">Perda de Pacotes</h3>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
            <XAxis dataKey="time" fontSize={13} fontWeight={500} tickLine={false} axisLine={{ stroke: "#475569", strokeWidth: 1 }} interval={0} tickFormatter={tickFormatter} tick={{ fill: "#e2e8f0", fontSize: 13, fontWeight: 500 }} angle={-45} textAnchor="end" height={60} />
            <YAxis fontSize={13} fontWeight={500} tickLine={false} axisLine={{ stroke: "#475569", strokeWidth: 1 }} tickFormatter={(value) => `${value}%`} tick={{ fill: "#e2e8f0", fontSize: 13, fontWeight: 500 }} width={50} />
            <Tooltip content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload
                return (
                  <div className="rounded-lg border-2 border-red-500 bg-slate-950 p-4 shadow-2xl">
                    <p className="text-base font-bold text-red-300 mb-3">{item.time}</p>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-sm font-semibold text-slate-300">Perda:</span>
                        <span className="text-lg font-bold text-red-400">{item.packetLoss}%</span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }} />
            <Line type="stepAfter" dataKey="packetLoss" stroke="#ef4444" strokeWidth={2} dot={false} name="Perda de Pacotes" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
