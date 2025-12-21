"use client"

import { Activity, TrendingUp, Clock, AlertTriangle, CheckCircle2, XCircle, Server, Cpu, HardDrive } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// Tabs removed: replaced by Observium-like grid layout
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { Service } from "@/lib/types"
import { formatDistanceToNow } from "@/lib/utils"

interface ServiceDetailsModalProps {
  service: Service | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ServiceDetailsModal({ service, open, onOpenChange }: ServiceDetailsModalProps) {
  if (!service) return null

  const [liveHistory, setLiveHistory] = useState<typeof service.history>(service.history)

  // Poll backend for real-time updates (every 5s). Expects an endpoint like `/api/services/:id/history`.
  const pollingRef = useRef<number | null>(null)
  const sseRef = useRef<EventSource | null>(null)
  useEffect(() => {
    let mounted = true
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/services/${service.id}/history`)
        if (!res.ok) return
        const json = await res.json()
        // Accept either { history: [...] } or an array
        const newHistory = (json.history ?? json) as typeof service.history
        if (mounted) setLiveHistory(newHistory)
      } catch (e) {
        // ignore network errors; keep showing existing data
      }
    }

    // Try Server-Sent Events (SSE) first for real-time pushes.
    try {
      const es = new EventSource(`/api/services/${service.id}/events`)
      sseRef.current = es
      es.onopen = () => {
        // when SSE opens, fetch initial state
        fetchHistory()
        // stop any polling if started
        if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }
      }
      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data)
          // data can be { history: [...] } or a single check object
          if (data.history && Array.isArray(data.history)) {
            if (mounted) setLiveHistory(data.history)
          } else if (data.check) {
            if (mounted) setLiveHistory((prev) => [...prev, data.check])
          } else if (Array.isArray(data)) {
            if (mounted) setLiveHistory(data)
          }
        } catch (e) {
          // ignore parse errors
        }
      }
      es.onerror = () => {
        // fallback to polling if SSE fails
        if (sseRef.current) { sseRef.current.close(); sseRef.current = null }
        if (!pollingRef.current) pollingRef.current = window.setInterval(fetchHistory, 5000)
      }
    } catch (e) {
      // If EventSource isn't available or errors, fallback to polling
      fetchHistory()
      pollingRef.current = window.setInterval(fetchHistory, 5000)
    }

    return () => {
      mounted = false
      if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }
      if (sseRef.current) { sseRef.current.close(); sseRef.current = null }
    }
  }, [service.id])

  const last24Hours = liveHistory.slice(-48)
  const lastWeek = liveHistory.slice(-168)
  const lastMonth = liveHistory.slice(-720)

  const prepareChartData = (history: typeof service.history) => {
    return history.map((check) => ({
      time: new Date(check.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      fullTime: new Date(check.timestamp).toLocaleString("pt-BR"),
      latency: check.responseTime || 0,
      status: check.status === "online" ? 100 : 0,
      loss: check.status === "online" ? 0 : 100,
    }))
  }

  const chartData24h = prepareChartData(last24Hours)
  const chartDataWeek = prepareChartData(lastWeek)
  const chartDataMonth = prepareChartData(lastMonth)

  const avgLatency =
    liveHistory.length > 0 ? Math.round(liveHistory.reduce((acc, check) => acc + (check.responseTime || 0), 0) / liveHistory.length) : 0

  const minLatency = liveHistory.length > 0 ? Math.min(...liveHistory.filter((c) => c.responseTime).map((c) => c.responseTime!)) : 0

  const maxLatency = liveHistory.length > 0 ? Math.max(...liveHistory.filter((c) => c.responseTime).map((c) => c.responseTime!)) : 0

  const totalChecks = liveHistory.length
  const onlineChecks = liveHistory.filter((c) => c.status === "online").length

  const statusColor = {
    online: "text-green-400 bg-green-500/10 border-green-500/30",
    offline: "text-red-400 bg-red-500/10 border-red-500/30",
    unstable: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    checking: "text-gray-400 bg-gray-500/10 border-gray-500/30",
  }

  const statusText = {
    online: "Online",
    offline: "Offline",
    unstable: "Instável",
    checking: "Verificando...",
  }

  const LatencyChart = ({ data, title, period, height = 280 }: { data: any[]; title: string; period: string; height?: number }) => (
    <div className="rounded-lg bg-gray-800 border border-gray-700 p-7 text-gray-100">
      <h4 className="text-base font-semibold text-gray-200 mb-3">{title}</h4>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="1 1" stroke="#e5e7eb" strokeWidth={0.5} />
          <XAxis
            dataKey="time"
            stroke="#9ca3af"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#9ca3af"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }}
            tickFormatter={(value) => `${value}`}
            domain={[0, "dataMax + 50"]}
            label={{ value: "ms", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#6b7280" } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "6px",
              padding: "10px 14px",
            }}
            labelStyle={{ color: "#9ca3af", fontSize: "12px", marginBottom: "4px" }}
            itemStyle={{ color: "#22c55e", fontSize: "13px", fontWeight: "600" }}
            formatter={(value: any) => [`${value} ms`, "Latency"]}
          />
          <Line type="monotone" dataKey="latency" stroke="#22c55e" strokeWidth={1.5} dot={false} name="Latency" />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-3 text-sm text-gray-300 space-y-1">
        <div className="flex items-center justify-between">
          <span>Min: {minLatency} ms</span>
          <span>Avg: {avgLatency} ms</span>
          <span>Max: {maxLatency} ms</span>
        </div>
      </div>
    </div>
  )

  const PacketLossChart = ({ data, title, height = 200 }: { data: any[]; title: string; height?: number }) => (
    <div className="rounded-lg bg-gray-800 border border-gray-700 p-7 text-gray-100">
      <h4 className="text-base font-semibold text-gray-200 mb-3">{title}</h4>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="1 1" stroke="#e5e7eb" strokeWidth={0.5} />
          <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }} />
          <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} label={{ value: "%", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#6b7280" } }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "6px", padding: "10px 14px" }}
            labelStyle={{ color: "#9ca3af", fontSize: "12px", marginBottom: "4px" }}
            itemStyle={{ color: "#ef4444", fontSize: "13px", fontWeight: "600" }}
            formatter={(value: any) => [`${value}%`, "Packet Loss"]}
          />
          <Line type="stepAfter" dataKey="loss" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Packet Loss" />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-3 text-sm text-gray-300">
        <span>Perda de pacotes: {liveHistory.filter((c) => c.status !== "online").length} ocorrências</span>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1600px] sm:!max-w-[1600px] max-h-[92vh] overflow-auto p-0 bg-transparent">
          <div className="flex h-full min-h-[70vh]">
            <div className="w-[400px] bg-gray-900 border-r border-gray-700 p-8 overflow-y-auto pb-8 text-gray-100">
              <div className="mb-8">
              <div className="flex flex-col items-start gap-3 mb-3">
                <div className="h-14 w-14 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Server className="h-7 w-7 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-100">{service.url}</h2>
                  <p className="text-sm text-gray-400">{service.name}</p>
                </div>
              </div>
            </div>

            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium mb-8 ${statusColor[service.status]}`}
            >
              <div className="h-2.5 w-2.5 rounded-full bg-current animate-pulse" />
              {statusText[service.status]}
            </div>

            <div className="space-y-4 text-base">
              <div className="pb-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Nome do Serviço</p>
                <p className="font-medium text-gray-100 text-sm">{service.name}</p>
              </div>

              <div className="pb-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Endereço</p>
                <p className="font-medium text-gray-100 text-sm break-all">{service.url}</p>
              </div>

              <div className="pb-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Uptime</p>
                <p className="font-medium text-gray-100 text-sm">{service.uptime.toFixed(2)}%</p>
              </div>

              <div className="pb-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Última Verificação</p>
                <p className="font-medium text-gray-100 text-sm">{formatDistanceToNow(service.lastCheck)}</p>
              </div>

              <div className="pb-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Total de Verificações</p>
                <p className="font-medium text-gray-100 text-sm">{totalChecks}</p>
              </div>

              <div className="pb-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Taxa de Sucesso</p>
                <p className="font-medium text-gray-100 text-sm">
                  {totalChecks > 0 ? ((onlineChecks / totalChecks) * 100).toFixed(1) : 0}%
                </p>
              </div>

              <div className="pb-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Latência Média</p>
                <p className="font-medium text-gray-100 text-sm">{avgLatency} ms</p>
              </div>

              <div className="pb-3">
                <p className="text-xs text-gray-500 mb-1">Criado em</p>
                <p className="font-medium text-gray-100 text-sm">
                  {new Date(service.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
            <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="text-xs font-semibold text-gray-700 mb-3">Resumo de Status</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Online</span>
                  <span className="font-semibold text-green-600">{onlineChecks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Offline</span>
                  <span className="font-semibold text-red-600">
                    {liveHistory.filter((c) => c.status === "offline").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Instável</span>
                  <span className="font-semibold text-yellow-600">
                    {liveHistory.filter((c) => c.status === "unstable").length}
                  </span>
                </div>
              </div>
            </div>
            {/* Removed Traffic chart — showing only Latency and Packet Loss per request */}
          </div>

          <div className="flex-1 overflow-y-auto bg-transparent">
            <div className="w-full">
              <DialogHeader className="px-8 py-6 bg-transparent border-b border-gray-700 sticky top-0 z-10 text-center">
                <DialogTitle className="text-2xl font-semibold text-gray-100">Visão Geral do Monitoramento</DialogTitle>
              </DialogHeader>

              <div className="p-8 flex justify-center">
              <div className="w-full max-w-6xl">
                <div className="space-y-6">
                  <LatencyChart data={chartData24h} title="Latência — Últimas 24h" period="24h" height={360} />
                  <PacketLossChart data={chartData24h} title="Perda de Pacotes — Últimas 24h" height={200} />
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
