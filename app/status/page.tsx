"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, AlertTriangle, Activity, Clock } from "lucide-react"
import type { Service } from "@/lib/utils/types"

export default function StatusPage() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadServices()
    const interval = setInterval(loadServices, 30000)
    return () => clearInterval(interval)
  }, [])

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

  const allOnline = services.every((s) => s.status === "online")
  const someOffline = services.some((s) => s.status === "offline")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-8 py-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl overflow-hidden">
              <img src="/logo-para.svg" alt="Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Status do Sistema</h1>
              <p className="text-lg text-muted-foreground mt-2">Monitoramento em tempo real</p>
            </div>
          </div>

          {/* Overall Status */}
          <div className={`rounded-2xl border-2 p-8 text-center ${
            allOnline
              ? "border-green-500/30 bg-green-500/5"
              : someOffline
              ? "border-red-500/30 bg-red-500/5"
              : "border-yellow-500/30 bg-yellow-500/5"
          }`}>
            <div className="flex items-center justify-center gap-3 mb-2">
              {allOnline ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : someOffline ? (
                <XCircle className="h-8 w-8 text-red-500" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              )}
              <h2 className={`text-3xl font-bold ${
                allOnline ? "text-green-500" : someOffline ? "text-red-500" : "text-yellow-500"
              }`}>
                {allOnline
                  ? "Todos os Sistemas Operacionais"
                  : someOffline
                  ? "Alguns Sistemas Com Problemas"
                  : "Serviços Instáveis"}
              </h2>
            </div>
            <p className="text-muted-foreground">
              Última atualização: {new Date().toLocaleString("pt-BR")}
            </p>
          </div>
        </div>
      </header>

      {/* Services List */}
      <main className="container mx-auto px-8 py-12">
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
              <p className="text-muted-foreground">Carregando status...</p>
            </div>
          ) : (
            services.map((service) => (
              <div
                key={service.id}
                className="rounded-xl border border-border/50 bg-card p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                      service.status === "online"
                        ? "bg-green-500/10"
                        : service.status === "offline"
                        ? "bg-red-500/10"
                        : "bg-yellow-500/10"
                    }`}>
                      {service.status === "online" ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : service.status === "offline" ? (
                        <XCircle className="h-6 w-6 text-red-500" />
                      ) : (
                        <AlertTriangle className="h-6 w-6 text-yellow-500" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">{service.url}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                      service.status === "online"
                        ? "bg-green-500/10 text-green-500"
                        : service.status === "offline"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-yellow-500/10 text-yellow-500"
                    }`}>
                      {service.status === "online"
                        ? "Operacional"
                        : service.status === "offline"
                        ? "Fora do Ar"
                        : "Instável"}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {service.responseTime}ms
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        {service.uptime.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12">
        <div className="container mx-auto px-8 py-6 text-center text-sm text-muted-foreground">
          <p>Sistema de Monitoramento • Atualizado automaticamente a cada 30 segundos</p>
        </div>
      </footer>
    </div>
  )
}
