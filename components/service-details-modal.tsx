"use client"

import { Activity, TrendingUp, Clock, AlertTriangle, CheckCircle2, XCircle, Server, Cpu, HardDrive, Calendar, Download } from "lucide-react"
import { useEffect, useState, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Service } from "@/lib/types"
import { formatDistanceToNow } from "@/lib/utils"
import { ServiceDetailsChart } from "@/components/service-details-chart"
import { IncidentHistory } from "@/components/incident-history"

interface ServiceDetailsModalProps {
  service: Service | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

type PeriodType = "1h" | "6h" | "12h" | "24h" | "48h" | "7d" | "30d" | "custom"

export function ServiceDetailsModal({ service, open, onOpenChange }: ServiceDetailsModalProps) {
  if (!service) return null

  const [liveHistory, setLiveHistory] = useState<typeof service.history>(service.history)
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("24h")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [isLoadingPeriod, setIsLoadingPeriod] = useState(false)

  // Poll backend for real-time updates (every 5s). Expects an endpoint like `/api/services/:id/history`.
  const pollingRef = useRef<number | null>(null)
  const sseRef = useRef<EventSource | null>(null)
  
  const buildApiUrl = useCallback(() => {
    const baseUrl = `/api/services/${service.id}/history`
    
    if (selectedPeriod === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate).toISOString()
      const end = new Date(customEndDate).toISOString()
      return `${baseUrl}?startDate=${start}&endDate=${end}&limit=2000`
    }
    
    const hoursMap: Record<PeriodType, number> = {
      "1h": 1,
      "6h": 6,
      "12h": 12,
      "24h": 24,
      "48h": 48,
      "7d": 168,
      "30d": 720,
      "custom": 24
    }
    
    const hours = hoursMap[selectedPeriod] || 24
    return `${baseUrl}?hours=${hours}&limit=2000`
  }, [service.id, selectedPeriod, customStartDate, customEndDate])
  
  useEffect(() => {
    let mounted = true
    const fetchHistory = async () => {
      try {
        setIsLoadingPeriod(true)
        const apiUrl = buildApiUrl()
        console.log(`[Modal] Fetching history with: ${apiUrl}`)
        const res = await fetch(apiUrl)
        if (!res.ok) return
        const json = await res.json()
        // Accept either { history: [...] } or an array
        const newHistory = (json.history ?? json) as typeof service.history
        console.log(`[Modal] Received ${newHistory.length} checks for period ${selectedPeriod}`)
        if (mounted) setLiveHistory(newHistory)
      } catch (e) {
        console.error('[Modal] Error fetching history:', e)
      } finally {
        setIsLoadingPeriod(false)
      }
    }

    // Always fetch on mount or when period changes
    fetchHistory()

    // Use SSE only for default period (real-time updates)
    // For filtered periods, disable SSE to avoid mixing live data with historical
    const useRealtime = selectedPeriod === "24h" && !customStartDate && !customEndDate
    
    if (useRealtime) {
      try {
        const es = new EventSource(`/api/services/${service.id}/events`)
        sseRef.current = es
        es.onopen = () => {
          console.log('[Modal] SSE connected')
          if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }
        }
        es.onmessage = (ev) => {
          try {
            const data = JSON.parse(ev.data)
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
          console.log('[Modal] SSE error, switching to polling')
          if (sseRef.current) { sseRef.current.close(); sseRef.current = null }
          if (!pollingRef.current) pollingRef.current = window.setInterval(fetchHistory, 5000)
        }
      } catch (e) {
        console.log('[Modal] SSE not available, using polling')
        pollingRef.current = window.setInterval(fetchHistory, 5000)
      }
    } else {
      // For filtered periods, use polling with longer interval
      console.log(`[Modal] Using polling for period: ${selectedPeriod}`)
      pollingRef.current = window.setInterval(fetchHistory, 10000)
    }

    return () => {
      mounted = false
      if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }
      if (sseRef.current) { sseRef.current.close(); sseRef.current = null }
    }
  }, [buildApiUrl, service.id, selectedPeriod, customStartDate, customEndDate])
  
  const handlePeriodChange = (value: PeriodType) => {
    setSelectedPeriod(value)
  }
  
  const handleApplyCustomDates = () => {
    if (customStartDate && customEndDate) {
      setSelectedPeriod("custom")
    }
  }
  
  const handleExportCSV = () => {
    const csvHeader = "Timestamp,Data/Hora,Status,Latência (ms),Packet Loss (%)\n"
    const csvRows = displayHistory
      .map((check) => {
        const date = new Date(check.timestamp).toLocaleString("pt-BR")
        return `${check.timestamp},"${date}",${check.status},${check.responseTime || 0},${check.packetLoss || 0}`
      })
      .join("\n")
    
    const csv = csvHeader + csvRows
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${service.name}_${selectedPeriod}_${Date.now()}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  const handleExportJSON = () => {
    const exportData = {
      service: {
        id: service.id,
        name: service.name,
        url: service.url,
        uptime: service.uptime,
      },
      period: selectedPeriod,
      exportDate: new Date().toISOString(),
      totalChecks: displayHistory.length,
      data: displayHistory.map((check) => ({
        timestamp: check.timestamp,
        dateTime: new Date(check.timestamp).toISOString(),
        status: check.status,
        responseTime: check.responseTime,
        packetLoss: check.packetLoss,
      })),
    }
    
    const json = JSON.stringify(exportData, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${service.name}_${selectedPeriod}_${Date.now()}.json`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Use all data from liveHistory (already filtered by API based on selected period)
  const displayHistory = liveHistory
  const last24Hours = liveHistory.slice(-48)
  const lastWeek = liveHistory.slice(-168)
  const lastMonth = liveHistory.slice(-720)

  const avgLatency =
    displayHistory.length > 0 ? Math.round(displayHistory.reduce((acc, check) => acc + (check.responseTime || 0), 0) / displayHistory.length) : 0

  const minLatency = displayHistory.length > 0 ? Math.min(...displayHistory.filter((c) => c.responseTime).map((c) => c.responseTime!)) : 0

  const maxLatency = displayHistory.length > 0 ? Math.max(...displayHistory.filter((c) => c.responseTime).map((c) => c.responseTime!)) : 0

  const totalChecks = displayHistory.length
  const onlineChecks = displayHistory.filter((c) => c.status === "online").length

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1600px] sm:!max-w-[1600px] max-h-[92vh] overflow-auto p-0 bg-transparent" showCloseButton={true}>
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
                    {displayHistory.filter((c) => c.status === "offline").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Instável</span>
                  <span className="font-semibold text-yellow-600">
                    {displayHistory.filter((c) => c.status === "unstable").length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-transparent">
            <div className="w-full">
              <DialogHeader className="px-8 py-6 bg-transparent border-b border-gray-700 sticky top-0 z-10">
                <DialogTitle className="text-2xl font-semibold text-gray-100 text-center mb-6">Visão Geral do Monitoramento</DialogTitle>
                
                {/* Filtro de Período */}
                <div className="flex flex-col gap-4 bg-gray-800/50 p-5 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    <span className="text-sm font-semibold text-gray-200">Período de Visualização:</span>
                    <div className="ml-auto flex gap-2">
                      <Button
                        onClick={handleExportCSV}
                        variant="outline"
                        size="sm"
                        className="bg-gray-800 border-gray-600 hover:bg-gray-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        CSV
                      </Button>
                      <Button
                        onClick={handleExportJSON}
                        variant="outline"
                        size="sm"
                        className="bg-gray-800 border-gray-600 hover:bg-gray-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        JSON
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-xs text-gray-400 mb-1.5 block">Selecione o período</label>
                      <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                        <SelectTrigger className="w-full bg-gray-900 border-gray-600 text-gray-100">
                          <SelectValue placeholder="Escolha um período" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-600">
                          <SelectItem value="1h" className="text-gray-100">Última Hora</SelectItem>
                          <SelectItem value="6h" className="text-gray-100">Últimas 6 Horas</SelectItem>
                          <SelectItem value="12h" className="text-gray-100">Últimas 12 Horas</SelectItem>
                          <SelectItem value="24h" className="text-gray-100">Últimas 24 Horas</SelectItem>
                          <SelectItem value="48h" className="text-gray-100">Últimas 48 Horas</SelectItem>
                          <SelectItem value="7d" className="text-gray-100">Últimos 7 Dias</SelectItem>
                          <SelectItem value="30d" className="text-gray-100">Últimos 30 Dias</SelectItem>
                          <SelectItem value="custom" className="text-gray-100">Período Customizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedPeriod === "custom" && (
                      <>
                        <div className="flex-1 min-w-[180px]">
                          <label className="text-xs text-gray-400 mb-1.5 block">Data Inicial</label>
                          <input
                            type="datetime-local"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex-1 min-w-[180px]">
                          <label className="text-xs text-gray-400 mb-1.5 block">Data Final</label>
                          <input
                            type="datetime-local"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <Button
                          onClick={handleApplyCustomDates}
                          disabled={!customStartDate || !customEndDate}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 h-[42px]"
                        >
                          Aplicar
                        </Button>
                      </>
                    )}
                    
                    <div className="text-xs text-gray-400 ml-auto">
                      {isLoadingPeriod ? (
                        <span className="text-blue-400">Carregando...</span>
                      ) : (
                        <span>{displayHistory.length} registros</span>
                      )}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="p-8 space-y-8">
                <div className="w-full max-w-6xl mx-auto">
                  <ServiceDetailsChart history={displayHistory} />
                </div>
                
                <div className="w-full max-w-6xl mx-auto">
                  <IncidentHistory history={displayHistory} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
