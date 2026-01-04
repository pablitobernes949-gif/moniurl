"use client"

import type React from "react"

import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { Service } from "@/lib/utils/types"

interface ServiceStatsProps {
  services: Service[]
}

export function ServiceStats({ services }: ServiceStatsProps) {
  const totalServices = services.length
  const onlineServices = services.filter((s) => s.status === "online").length
  const offlineServices = services.filter((s) => s.status === "offline").length
  const avgUptime = services.length > 0 ? services.reduce((acc, s) => acc + s.uptime, 0) / services.length : 0

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatCard title="Total de Serviços" value={totalServices} icon={<Activity className="h-5 w-5" />} trend={null} />
      <StatCard title="Online" value={onlineServices} icon={<TrendingUp className="h-5 w-5" />} trend="positive" />
      <StatCard title="Offline" value={offlineServices} icon={<TrendingDown className="h-5 w-5" />} trend="negative" />
      <StatCard
        title="Uptime Médio"
        value={`${avgUptime.toFixed(1)}%`}
        icon={<Minus className="h-5 w-5" />}
        trend={null}
      />
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string
  value: number | string
  icon: React.ReactNode
  trend: "positive" | "negative" | null
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div
          className={`rounded-lg p-3 ${
            trend === "positive"
              ? "bg-green-100 text-green-600"
              : trend === "negative"
                ? "bg-red-100 text-red-600"
                : "bg-primary/10 text-primary"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}
