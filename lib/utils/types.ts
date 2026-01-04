export type ServiceStatus = "online" | "offline" | "unstable" | "checking"

export type AlertType = "latency" | "packet_loss" | "availability"
export type AlertSeverity = "info" | "warning" | "critical"
export type AlertStatus = "active" | "acknowledged" | "resolved"

export interface AlertRule {
  id: string
  serviceId: string
  type: AlertType
  enabled: boolean
  threshold: number // threshold value (ms for latency, % for packet loss/availability)
  severity: AlertSeverity
  createdAt: number
}

export interface Alert {
  id: string
  serviceId: string
  type: AlertType
  severity: AlertSeverity
  status: AlertStatus
  message: string
  value: number // actual value that triggered the alert
  threshold: number // threshold that was exceeded
  triggeredAt: number
  acknowledgedAt?: number
  resolvedAt?: number
}

export interface HealthCheck {
  timestamp: number
  status: ServiceStatus
  responseTime: number | null
  packetLoss?: number // percentage 0-100
  minLatency?: number
  maxLatency?: number
  avgLatency?: number
}

export interface Service {
  id: string
  name: string
  url: string
  status: ServiceStatus
  lastCheck: number
  responseTime: number | null
  packetLoss: number // average packet loss percentage
  minLatency: number | null
  maxLatency: number | null
  avgLatency: number | null
  history: HealthCheck[]
  uptime: number
  createdAt: number
  alertRules?: AlertRule[]
}
