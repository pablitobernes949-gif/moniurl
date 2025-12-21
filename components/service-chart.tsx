"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { HealthCheck } from "@/lib/types"

interface ServiceChartProps {
  history: HealthCheck[]
}

export function ServiceChart({ history }: ServiceChartProps) {
  const data = history.slice(-20).map((check) => ({
    time: new Date(check.timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    latency: check.responseTime || 0,
    status: check.status,
  }))

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}ms`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                    <p className="text-sm font-medium text-foreground">{payload[0].payload.time}</p>
                    <p className="text-sm text-muted-foreground">Latência: {payload[0].value}ms</p>
                    <p className="text-sm text-muted-foreground">Status: {payload[0].payload.status}</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Line type="monotone" dataKey="latency" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
