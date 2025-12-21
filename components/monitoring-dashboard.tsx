"use client"

import { useState, useEffect } from "react"
import { Plus, Activity, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ServiceCard } from "@/components/service-card"
import { AddServiceDialog } from "@/components/add-service-dialog"
import { ServiceDetailsModal } from "@/components/service-details-modal"
import type { Service } from "@/lib/types"
import { monitorService, calculateUptime } from "@/lib/monitoring"

export function MonitoringDashboard() {
  const [services, setServices] = useState<Service[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("monitored-services")
    if (stored) {
      setServices(JSON.parse(stored))
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading && services.length > 0) {
      localStorage.setItem("monitored-services", JSON.stringify(services))
    }
  }, [services, isLoading])

  useEffect(() => {
    const interval = setInterval(async () => {
      if (services.length === 0) return

      const updatedServices = await Promise.all(
        services.map(async (service) => {
          const result = await monitorService(service.url)
          const newCheck = {
            timestamp: Date.now(),
            status: result.status,
            responseTime: result.responseTime,
          }

          const updatedHistory = [...service.history, newCheck].slice(-50)

          return {
            ...service,
            status: result.status,
            lastCheck: Date.now(),
            responseTime: result.responseTime,
            history: updatedHistory,
            uptime: calculateUptime(updatedHistory),
          }
        }),
      )

      setServices(updatedServices)
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [services])

  const handleAddService = async (url: string, name: string) => {
    const result = await monitorService(url)
    const newService: Service = {
      id: Date.now().toString(),
      name,
      url,
      status: result.status,
      lastCheck: Date.now(),
      responseTime: result.responseTime,
      history: [
        {
          timestamp: Date.now(),
          status: result.status,
          responseTime: result.responseTime,
        },
      ],
      uptime: 100,
      createdAt: Date.now(),
    }

    setServices([...services, newService])
    setIsAddDialogOpen(false)
  }

  const handleDeleteService = (id: string) => {
    setServices(services.filter((s) => s.id !== id))
  }

  const handleCheckNow = async (id: string) => {
    const service = services.find((s) => s.id === id)
    if (!service) return

    const result = await monitorService(service.url)
    const newCheck = {
      timestamp: Date.now(),
      status: result.status,
      responseTime: result.responseTime,
    }

    const updatedHistory = [...service.history, newCheck].slice(-50)

    setServices(
      services.map((s) =>
        s.id === id
          ? {
              ...s,
              status: result.status,
              lastCheck: Date.now(),
              responseTime: result.responseTime,
              history: updatedHistory,
              uptime: calculateUptime(updatedHistory),
            }
          : s,
      ),
    )
  }

  const handleViewDetails = (service: Service) => {
    setSelectedService(service)
    setIsDetailsOpen(true)
  }

  const activeServices = services.filter((s) => s.status === "online").length
  const downServices = services.filter((s) => s.status === "offline").length
  const unstableServices = services.filter((s) => s.status === "unstable").length
  const avgResponseTime =
    services.length > 0 ? Math.round(services.reduce((acc, s) => acc + (s.responseTime || 0), 0) / services.length) : 0

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
                <Activity className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Service Monitor</h1>
                <p className="text-base text-muted-foreground mt-1">Monitoramento em tempo real de serviços</p>
              </div>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} size="lg" className="h-12 px-6">
              <Plus className="mr-2 h-5 w-5" />
              Adicionar Serviço
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-8 py-10">
        <div className="mb-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Serviços</p>
                <p className="mt-3 text-4xl font-bold text-foreground">{services.length}</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Activity className="h-7 w-7 text-primary" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Online</p>
                <p className="mt-3 text-4xl font-bold text-green-500">{activeServices}</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-500/10">
                <CheckCircle className="h-7 w-7 text-green-500" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Offline</p>
                <p className="mt-3 text-4xl font-bold text-red-500">{downServices}</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/10">
                <AlertCircle className="h-7 w-7 text-red-500" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Latência Média</p>
                <p className="mt-3 text-4xl font-bold text-foreground">{avgResponseTime}ms</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Clock className="h-7 w-7 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {services.length === 0 ? (
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
          <div className="grid gap-8 xl:grid-cols-2">
            {services.map((service) => (
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
      </main>

      <AddServiceDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAdd={handleAddService} />
      <ServiceDetailsModal service={selectedService} open={isDetailsOpen} onOpenChange={setIsDetailsOpen} />
    </div>
  )
}
