export type ServiceStatus = "online" | "offline" | "unstable" | "checking"

export interface HealthCheck {
  timestamp: number
  status: ServiceStatus
  responseTime: number | null
}

export interface Service {
  id: string
  name: string
  url: string
  status: ServiceStatus
  lastCheck: number
  responseTime: number | null
  history: HealthCheck[]
  uptime: number
  createdAt: number
}
