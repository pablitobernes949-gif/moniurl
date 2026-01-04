"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from "recharts"
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from "lucide-react"
import type { Service } from "@/lib/utils/types"

interface TrendsDashboardProps {
  services: Service[]
}

interface DayStats {
  date: string
  uptime: number
  avgLatency: number
  incidents: number
}

export function TrendsDashboard({ services }: TrendsDashboardProps) {
  const [trendsData, setTrendsData] = useState<DayStats[]>([])
  const [anomalies, setAnomalies] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTrendsData()
  }, [services])

  const loadTrendsData = async () => {
    setIsLoading(true)
    try {
      // Simular dados de 30 dias (em produção, vir do banco de dados)
      const last30Days: DayStats[] = []
      const now = new Date()

      for (let i = 29; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const dateStr = date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        })

        // Calcular estatísticas do dia
        const dayUptime = 95 + Math.random() * 5 // 95-100%
        const dayLatency = 50 + Math.random() * 100 // 50-150ms
        const dayIncidents = Math.floor(Math.random() * 3) // 0-2 incidents

        last30Days.push({
          date: dateStr,
          uptime: Number(dayUptime.toFixed(2)),
          avgLatency: Number(dayLatency.toFixed(0)),
          incidents: dayIncidents,
        })
      }

      setTrendsData(last30Days)

      // Detectar anomalias (2σ do média)
      const latencies = last30Days.map((d) => d.avgLatency)
      const mean = latencies.reduce((a, b) => a + b, 0) / latencies.length
      const variance =
        latencies.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / latencies.length
      const stdDev = Math.sqrt(variance)

      const anomalyDates = last30Days
        .filter((d) => Math.abs(d.avgLatency - mean) > 2 * stdDev)
        .map((d) => d.date)

      setAnomalies(anomalyDates)
    } catch (error) {
      console.error("Error loading trends:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-muted-foreground">Carregando tendências...</p>
      </div>
    )
  }

  // Calcular tendências
  const recentUptime =
    trendsData.slice(-7).reduce((a, b) => a + b.uptime, 0) / 7
  const previousUptime =
    trendsData.slice(-14, -7).reduce((a, b) => a + b.uptime, 0) / 7
  const uptimeTrend = recentUptime - previousUptime

  const recentLatency =
    trendsData.slice(-7).reduce((a, b) => a + b.avgLatency, 0) / 7
  const previousLatency =
    trendsData.slice(-14, -7).reduce((a, b) => a + b.avgLatency, 0) / 7
  const latencyTrend = ((recentLatency - previousLatency) / previousLatency) * 100

  const totalIncidents = trendsData.reduce((a, b) => a + b.incidents, 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tendência de Uptime
            </CardTitle>
            {uptimeTrend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentUptime.toFixed(2)}%</div>
            <p
              className={`text-xs ${
                uptimeTrend >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {uptimeTrend >= 0 ? "+" : ""}
              {uptimeTrend.toFixed(2)}% vs. semana anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tendência de Latência
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentLatency.toFixed(0)}ms</div>
            <p
              className={`text-xs ${
                latencyTrend <= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {latencyTrend <= 0 ? "" : "+"}
              {latencyTrend.toFixed(1)}% vs. semana anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Incidentes (30 dias)
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIncidents}</div>
            <p className="text-xs text-muted-foreground">
              {anomalies.length} anomalias detectadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Uptime Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Uptime (30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendsData}>
                <defs>
                  <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#475569" }}
                  tick={{ fill: "#94a3b8" }}
                />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#475569" }}
                  tick={{ fill: "#94a3b8" }}
                  domain={[90, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <p className="font-semibold">{data.date}</p>
                          <p className="text-sm text-green-500">
                            Uptime: {data.uptime}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Incidentes: {data.incidents}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="uptime"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#uptimeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Latency Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Latência (30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsData}>
                <XAxis
                  dataKey="date"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#475569" }}
                  tick={{ fill: "#94a3b8" }}
                />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#475569" }}
                  tick={{ fill: "#94a3b8" }}
                  tickFormatter={(value) => `${value}ms`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      const isAnomaly = anomalies.includes(data.date)
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <p className="font-semibold">{data.date}</p>
                          <p className="text-sm text-blue-500">
                            Latência: {data.avgLatency}ms
                          </p>
                          {isAnomaly && (
                            <p className="text-sm text-yellow-500">
                              ⚠️ Anomalia detectada
                            </p>
                          )}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgLatency"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={(props) => {
                    const isAnomaly = anomalies.includes(
                      trendsData[props.index]?.date || ""
                    )
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={isAnomaly ? 6 : 3}
                        fill={isAnomaly ? "#f59e0b" : "#3b82f6"}
                        stroke={isAnomaly ? "#dc2626" : "#3b82f6"}
                        strokeWidth={isAnomaly ? 2 : 0}
                      />
                    )
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Anomalies Alert */}
      {anomalies.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-500">
              <AlertTriangle className="h-5 w-5" />
              Anomalias Detectadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Os seguintes dias apresentaram latências anormais (≥2σ):
            </p>
            <div className="flex flex-wrap gap-2">
              {anomalies.map((date) => (
                <span
                  key={date}
                  className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-sm font-medium"
                >
                  {date}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
