"use client"

import { useState } from "react"
import { MoreVertical, Trash2, RefreshCw, TrendingUp, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ServiceChart } from "@/components/service-chart"
import { AlertIndicator } from "@/components/alert-indicator"
import type { Service } from "@/lib/types"
import { formatDistanceToNow } from "@/lib/utils"

interface ServiceCardProps {
  service: Service
  onDelete: (id: string) => void
  onCheckNow: (id: string) => void
  onViewDetails: (service: Service) => void
}

export function ServiceCard({ service, onDelete, onCheckNow, onViewDetails }: ServiceCardProps) {
  const [isChecking, setIsChecking] = useState(false)

  const handleCheckNow = async () => {
    setIsChecking(true)
    await onCheckNow(service.id)
    setIsChecking(false)
  }

  const statusColor = {
    online: "bg-green-500",
    offline: "bg-red-500",
    unstable: "bg-yellow-500",
    checking: "bg-gray-400",
  }

  const statusText = {
    online: "Online",
    offline: "Offline",
    unstable: "Instável",
    checking: "Verificando...",
  }

  const statusBg = {
    online: "bg-green-500/10 text-green-400 border-green-500/20",
    offline: "bg-red-500/10 text-red-400 border-red-500/20",
    unstable: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    checking: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-5 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full flex-shrink-0 ${statusColor[service.status]} shadow-lg shadow-${service.status === "online" ? "green" : service.status === "offline" ? "red" : "yellow"}-500/50`}
            />
            <h3 className="text-lg font-semibold text-foreground truncate">{service.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground truncate">{service.url}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCheckNow} disabled={isChecking}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Verificar Agora
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(service.id)} className="text-red-400">
              <Trash2 className="mr-2 h-4 w-4" />
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
          <div
            className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${
              statusBg[service.status]
            }`}
          >
            {statusText[service.status]}
          </div>
        </div>

        <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Uptime</p>
          <p className="text-xl font-bold text-foreground">{service.uptime.toFixed(1)}%</p>
        </div>

        <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Latência</p>
          <p className="text-xl font-bold text-foreground">{service.responseTime || 0}ms</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Histórico (24h)</p>
          <p className="text-xs text-muted-foreground">Última: {formatDistanceToNow(service.lastCheck)}</p>
        </div>
        <ServiceChart history={service.history} />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{service.history.length} verificações</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Há {Math.floor((Date.now() - service.createdAt) / (1000 * 60 * 60))}h</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AlertIndicator serviceId={service.id} />
          <Button variant="outline" size="sm" onClick={() => onViewDetails(service)} className="h-8 text-sm">
            Ver Detalhes
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
