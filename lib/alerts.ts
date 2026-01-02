import type { AlertType, AlertSeverity, Service, HealthCheck } from "./types"
import { getService } from "./storage"
import { prisma } from "./db"
import {
  saveAlert,
  getRecentAlerts,
  createOrUpdateAlertRule,
  getServiceAlertRules,
  updateAlertStatus,
} from "./db-operations"

// In-memory listeners for real-time notifications
const alertListeners = new Set<(alert: any) => void>()

export async function createAlertRule(
  serviceId: string,
  type: AlertType,
  threshold: number,
  severity: AlertSeverity = "warning"
) {
  try {
    const rule = await createOrUpdateAlertRule(serviceId, type, threshold, severity)
    console.log(`[Alerts] Created rule for ${serviceId}: ${type} > ${threshold}`)
    return rule
  } catch (error) {
    console.error(`[Alerts] Failed to create rule:`, error)
    return null
  }
}

export async function getAlertRules(serviceId: string) {
  try {
    return await getServiceAlertRules(serviceId)
  } catch (error) {
    console.error(`[Alerts] Failed to get rules:`, error)
    return []
  }
}

export async function updateAlertRule(
  serviceId: string,
  ruleId: string,
  enabled: boolean,
  threshold: number
) {
  try {
    const rule = await prisma.alertRule.update({
      where: { id: ruleId },
      data: { enabled, threshold },
    })
    console.log(`[Alerts] Updated rule ${ruleId}: enabled=${enabled}, threshold=${threshold}`)
    return rule
  } catch (error) {
    console.error(`[Alerts] Failed to update rule:`, error)
    return null
  }
}

export async function deleteAlertRule(serviceId: string, ruleId: string): Promise<boolean> {
  try {
    await prisma.alertRule.delete({
      where: { id: ruleId },
    })
    console.log(`[Alerts] Deleted rule ${ruleId}`)
    return true
  } catch (error) {
    console.error(`[Alerts] Failed to delete rule:`, error)
    return false
  }
}

export async function triggerAlert(
  serviceId: string,
  type: AlertType,
  value: number,
  threshold: number,
  severity: AlertSeverity
) {
  try {
    // Check if active alert exists
    const existingAlerts = await prisma.alert.findMany({
      where: {
        serviceId,
        type,
        status: "active",
      },
    })

    if (existingAlerts.length > 0) {
      // Alert already exists, just notify
      const alert = existingAlerts[0]
      notifyAlertListeners(alert)
      return alert
    }

    // Create new alert
    const service = getService(serviceId)
    const message = generateAlertMessage(type, value, threshold, service?.name || "Unknown")

    const alert = await saveAlert(serviceId, type, severity, message, "active")
    if (alert) {
      notifyAlertListeners(alert)
      console.log(`[Alerts] Triggered: ${message}`)
    }

    return alert
  } catch (error) {
    console.error(`[Alerts] Failed to trigger alert:`, error)
    return null
  }
}

export async function resolveAlert(alertId: string) {
  try {
    const alert = await updateAlertStatus(alertId, "resolved", undefined, new Date())
    if (alert) {
      notifyAlertListeners(alert)
      console.log(`[Alerts] Resolved: ${alertId}`)
    }
    return alert
  } catch (error) {
    console.error(`[Alerts] Failed to resolve alert:`, error)
    return null
  }
}

export async function acknowledgeAlert(alertId: string) {
  try {
    const alert = await updateAlertStatus(alertId, "acknowledged", new Date())
    if (alert) {
      notifyAlertListeners(alert)
      console.log(`[Alerts] Acknowledged: ${alertId}`)
    }
    return alert
  } catch (error) {
    console.error(`[Alerts] Failed to acknowledge alert:`, error)
    return null
  }
}

export async function getActiveAlerts() {
  try {
    const alerts = await prisma.alert.findMany({
      where: { status: "active" },
      orderBy: { triggeredAt: "desc" },
      include: { service: true },
    })
    return alerts
  } catch (error) {
    console.error(`[Alerts] Failed to get active alerts:`, error)
    return []
  }
}

export async function getAlertHistory(serviceId?: string, limit: number = 100) {
  try {
    if (serviceId) {
      return await getRecentAlerts(serviceId, limit)
    }
    const alerts = await prisma.alert.findMany({
      orderBy: { triggeredAt: "desc" },
      take: limit,
    })
    return alerts
  } catch (error) {
    console.error(`[Alerts] Failed to get alert history:`, error)
    return []
  }
}

export async function checkAlerts(service: Service, latestCheck: any): Promise<void> {
  try {
    const rules = await getAlertRules(service.id)
    if (rules.length === 0) return

    for (const rule of rules) {
      if (!rule.enabled) continue

      let shouldAlert = false
      let value = 0

      switch (rule.type) {
        case "latency":
          value = latestCheck.responseTime || 0
          shouldAlert = value > rule.threshold
          break

        case "packet_loss":
          value = latestCheck.packetLoss || 0
          shouldAlert = value > rule.threshold
          break

        case "availability":
          value = latestCheck.status === "online" ? 100 : 0
          shouldAlert = value < rule.threshold
          break
      }

      if (shouldAlert) {
        await triggerAlert(service.id, rule.type as AlertType, value, rule.threshold, rule.severity as AlertSeverity)
      } else {
        // Resolve if condition no longer met
        const activeAlerts = await prisma.alert.findMany({
          where: {
            serviceId: service.id,
            type: rule.type,
            status: "active",
          },
        })
        for (const alert of activeAlerts) {
          await resolveAlert(alert.id)
        }
      }
    }
  } catch (error) {
    console.error(`[Alerts] Error checking alerts:`, error)
  }
}

export function subscribe(callback: (alert: any) => void): () => void {
  alertListeners.add(callback)
  return () => alertListeners.delete(callback)
}

function notifyAlertListeners(alert: any): void {
  alertListeners.forEach((callback) => {
    try {
      callback(alert)
    } catch (e) {
      console.error("[Alerts] Listener error:", e)
    }
  })
}

function generateAlertMessage(type: AlertType, value: number, threshold: number, serviceName: string): string {
  switch (type) {
    case "latency":
      return `${serviceName}: Latência alta (${value}ms > ${threshold}ms)`
    case "packet_loss":
      return `${serviceName}: Perda de pacotes (${value}% > ${threshold}%)`
    case "availability":
      return `${serviceName}: Serviço indisponível`
    default:
      return `${serviceName}: Alerta desconhecido`
  }
}

// Initialize with default rules for new services
export async function initializeDefaultRules(serviceId: string): Promise<void> {
  try {
    const existingRules = await getAlertRules(serviceId)
    if (existingRules.length > 0) return

    // Default: Alert if latency > 1000ms, packet loss > 10%, or service availability < 50%
    await createAlertRule(serviceId, "latency", 1000, "warning")
    await createAlertRule(serviceId, "packet_loss", 10, "warning")
    await createAlertRule(serviceId, "availability", 50, "critical")

    console.log(`[Alerts] Initialized default rules for ${serviceId}`)
  } catch (error) {
    console.error(`[Alerts] Failed to initialize default rules:`, error)
  }
}
