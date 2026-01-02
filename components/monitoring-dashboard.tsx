"use client"

import { useState, useEffect } from "react"
import { Plus, Activity, AlertCircle, CheckCircle, Clock, Search, Filter, GitCompare, TrendingUp, FileText, Webhook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServiceCard } from "@/components/service-card"
import { AddServiceDialog } from "@/components/add-service-dialog"
import { ServiceDetailsModal } from "@/components/service-details-modal"
import { AlertsPanel } from "@/components/alerts-panel"
import { ComparisonChartModal } from "@/components/comparison-chart-modal"
import { TrendsDashboard } from "@/components/trends-dashboard"
import { WebhookSettingsDialog } from "@/components/webhook-settings-dialog"
import { ReportsSettingsDialog } from "@/components/reports-settings-dialog"
import type { Service } from "@/lib/types"

export function MonitoringDashboard() {
  const [services, setServices] = useState<Service[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline" | "unstable">("all")
  const [isComparisonOpen, setIsComparisonOpen] = useState(false)
  const [isWebhookSettingsOpen, setIsWebhookSettingsOpen] = useState(false)
  const [isReportsSettingsOpen, setIsReportsSettingsOpen] = useState(false)

  // Load services from API on mount
  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await fetch("/api/services")
        if (res.ok) {
          const data = await res.json()
          setServices(data.services || [])
        }
      } catch (error) {
        console.error("Failed to load services:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadServices()
  }, [])

  // Refresh services every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/services")
        if (res.ok) {
          const data = await res.json()
          setServices(data.services || [])
        }
      } catch (error) {
        console.error("Failed to refresh services:", error)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleAddService = async (url: string, name: string) => {
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url }),
      })

      if (res.ok) {
        const data = await res.json()
        setServices([...services, data.service])
        setIsAddDialogOpen(false)
      } else {
        const error = await res.json()
        alert(`❌ ${error.error}`)
      }
    } catch (error) {
      console.error("Error adding service:", error)
      alert("Erro ao conectar com o servidor")
    }
  }

  const handleDeleteService = async (id: string) => {
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" })
      if (res.ok) {
        setServices(services.filter((s) => s.id !== id))
      } else {
        alert("Erro ao deletar serviço")
      }
    } catch (error) {
      console.error("Error deleting service:", error)
      alert("Erro ao conectar com o servidor")
    }
  }

  const handleCheckNow = async (id: string) => {
    try {
      const res = await fetch(`/api/services/${id}/check`, { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setServices(services.map((s) => (s.id === id ? data.service : s)))
        // Update selected service if it's the one being checked
        if (selectedService?.id === id) {
          setSelectedService(data.service)
        }
      }
    } catch (error) {
      console.error("Error checking service:", error)
    }
  }

  const handleViewDetails = (service: Service) => {
    setSelectedService(service)
    setIsDetailsOpen(true)
  }

  // Filter and search logic
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.url.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || service.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const activeServices = services.filter((s) => s.status === "online").length
  const downServices = services.filter((s) => s.status === "offline").length
  const unstableServices = services.filter((s) => s.status === "unstable").length
  const avgResponseTime =
    services.length > 0 ? Math.round(services.reduce((acc, s) => acc + (s.responseTime || 0), 0) / services.length) : 0
  const avgUptime =
    services.length > 0 ? (services.reduce((acc, s) => acc + s.uptime, 0) / services.length).toFixed(2) : "0.00"
  const criticalServices = services.filter((s) => s.status === "offline" || s.responseTime > 1000)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl overflow-hidden">
                <img src="/logo-para.svg" alt="Logo Pará" className="h-full w-full object-cover" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Service Monitor</h1>
                <p className="text-base text-muted-foreground mt-1">Monitoramento em tempo real de serviços</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsComparisonOpen(true)} variant="outline" size="lg">
                <GitCompare className="mr-2 h-5 w-5" />
                Comparar
              </Button>
              <Button onClick={() => setIsWebhookSettingsOpen(true)} variant="outline" size="lg">
                <Webhook className="mr-2 h-5 w-5" />
                Webhooks
              </Button>
              <Button onClick={() => setIsReportsSettingsOpen(true)} variant="outline" size="lg">
                <FileText className="mr-2 h-5 w-5" />
                Relatórios
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)} size="lg" className="h-12 px-6">
                <Plus className="mr-2 h-5 w-5" />
                Adicionar Serviço
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-8 py-10">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-10">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tendências
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="mb-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Serviços</p>
                <p className="mt-3 text-4xl font-bold text-foreground">{services.length}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {unstableServices > 0 && `${unstableServices} instável${unstableServices > 1 ? 'is' : ''}`}
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Activity className="h-7 w-7 text-primary" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Online</p>
                <p className="mt-3 text-4xl font-bold text-green-500">{activeServices}</p>
                <p className="mt-2 text-xs text-green-600">
                  {services.length > 0 ? `${((activeServices / services.length) * 100).toFixed(1)}% disponível` : '0%'}
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-500/10">
                <CheckCircle className="h-7 w-7 text-green-500" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Offline</p>
                <p className="mt-3 text-4xl font-bold text-red-500">{downServices}</p>
                <p className="mt-2 text-xs text-red-600">
                  {criticalServices.length > 0 && `${criticalServices.length} crítico${criticalServices.length > 1 ? 's' : ''}`}
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/10">
                <AlertCircle className="h-7 w-7 text-red-500" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Latência Média</p>
                <p className="mt-3 text-4xl font-bold text-foreground">{avgResponseTime}ms</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Uptime: {avgUptime}%
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Clock className="h-7 w-7 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground">Carregando serviços...</p>
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/50 bg-card p-16 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50">
              <Activity className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mb-3 text-2xl font-semibold text-foreground">Nenhum serviço monitorado</h3>
            <p className="mb-8 max-w-md text-base text-muted-foreground leading-relaxed">
              Adicione seu primeiro serviço para começar o monitoramento em tempo real de disponibilidade e performance
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} size="lg" className="h-12 px-8">
              <Plus className="mr-2 h-5 w-5" />
              Adicionar Primeiro Serviço
            </Button>
          </div>
        ) : (
          <>
            {/* Search and Filter Bar */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card rounded-lg border border-border/50 p-4">
              <div className="flex-1 w-full sm:max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou URL..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background border-border"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="w-[180px] bg-background border-border">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os serviços</SelectItem>
                    <SelectItem value="online">Apenas Online</SelectItem>
                    <SelectItem value="offline">Apenas Offline</SelectItem>
                    <SelectItem value="unstable">Apenas Instável</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {filteredServices.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/50 bg-card p-16 text-center">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="mb-2 text-xl font-semibold text-foreground">Nenhum serviço encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  Tente ajustar os filtros ou termos de busca
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onDelete={handleDeleteService}
                    onCheckNow={handleCheckNow}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </>
        )}
        </TabsContent>

        <TabsContent value="trends">
          <TrendsDashboard services={services} />
        </TabsContent>
      </Tabs>
      </main>

      <AlertsPanel />
      <AddServiceDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAdd={handleAddService} />
      <ServiceDetailsModal service={selectedService} open={isDetailsOpen} onOpenChange={setIsDetailsOpen} />
      <ComparisonChartModal isOpen={isComparisonOpen} onClose={() => setIsComparisonOpen(false)} services={services} />
      <WebhookSettingsDialog isOpen={isWebhookSettingsOpen} onClose={() => setIsWebhookSettingsOpen(false)} onSave={(webhooks) => console.log("Webhooks saved:", webhooks)} />
      <ReportsSettingsDialog isOpen={isReportsSettingsOpen} onClose={() => setIsReportsSettingsOpen(false)} services={services} />
    </div>
  )
}
