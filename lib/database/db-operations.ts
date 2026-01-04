import { prisma } from './db'

/**
 * Save a service check result to database
 */
export async function saveServiceCheck(
  serviceId: string,
  status: string,
  latency: number | null,
  loss: number,
  uptime: number
) {
  try {
    await prisma.serviceCheck.create({
      data: {
        serviceId,
        status,
        latency,
        loss,
        uptime,
      },
    })
  } catch (error) {
    console.error(`[DB] Failed to save check for service ${serviceId}:`, error)
  }
}

/**
 * Get recent service checks from database (last N checks)
 */
export async function getRecentChecks(serviceId: string, limit: number = 300) {
  try {
    const checks = await prisma.serviceCheck.findMany({
      where: { serviceId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    return checks.reverse() // Return oldest first
  } catch (error) {
    console.error(`[DB] Failed to get checks for service ${serviceId}:`, error)
    return []
  }
}

/**
 * Get service checks by time period
 * @param serviceId - Service ID
 * @param hours - Number of hours to look back (default: 24)
 * @param limit - Maximum number of checks to return (default: 1000)
 */
export async function getChecksByPeriod(
  serviceId: string,
  hours: number = 24,
  limit: number = 1000
) {
  try {
    const now = new Date()
    const startDate = new Date(now.getTime() - (hours * 60 * 60 * 1000))
    
    console.log(`[DB] getChecksByPeriod - Service: ${serviceId}, Hours: ${hours}`)
    console.log(`[DB] Time range: ${startDate.toISOString()} to ${now.toISOString()}`)

    const checks = await prisma.serviceCheck.findMany({
      where: {
        serviceId,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    })
    
    console.log(`[DB] Found ${checks.length} checks`)
    if (checks.length > 0) {
      console.log(`[DB] First check: ${checks[0].createdAt.toISOString()}`)
      console.log(`[DB] Last check: ${checks[checks.length - 1].createdAt.toISOString()}`)
    }
    
    return checks
  } catch (error) {
    console.error(`[DB] Failed to get checks by period for service ${serviceId}:`, error)
    return []
  }
}

/**
 * Get service checks by date range
 * @param serviceId - Service ID
 * @param startDate - Start date
 * @param endDate - End date
 * @param limit - Maximum number of checks to return (default: 1000)
 */
export async function getChecksByDateRange(
  serviceId: string,
  startDate: Date,
  endDate: Date,
  limit: number = 1000
) {
  try {
    console.log(`[DB] getChecksByDateRange - Service: ${serviceId}`)
    console.log(`[DB] Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`)
    
    const checks = await prisma.serviceCheck.findMany({
      where: {
        serviceId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    })
    
    console.log(`[DB] Found ${checks.length} checks in date range`)
    if (checks.length > 0) {
      console.log(`[DB] First check: ${checks[0].createdAt.toISOString()}`)
      console.log(`[DB] Last check: ${checks[checks.length - 1].createdAt.toISOString()}`)
    }
    
    return checks
  } catch (error) {
    console.error(`[DB] Failed to get checks by date range for service ${serviceId}:`, error)
    return []
  }
}

/**
 * Get all alert rules for a service
 */
export async function getServiceAlertRules(serviceId: string) {
  try {
    const rules = await prisma.alertRule.findMany({
      where: { serviceId },
    })
    return rules
  } catch (error) {
    console.error(`[DB] Failed to get alert rules for service ${serviceId}:`, error)
    return []
  }
}

/**
 * Save an alert to database
 */
export async function saveAlert(
  serviceId: string,
  type: string,
  severity: string,
  message: string,
  status: string = 'active'
) {
  try {
    const alert = await prisma.alert.create({
      data: {
        serviceId,
        type,
        severity,
        message,
        status,
      },
    })
    return alert
  } catch (error) {
    console.error(`[DB] Failed to save alert for service ${serviceId}:`, error)
    return null
  }
}

/**
 * Get recent alerts for a service
 */
export async function getRecentAlerts(serviceId: string, limit: number = 100) {
  try {
    const alerts = await prisma.alert.findMany({
      where: { serviceId },
      orderBy: { triggeredAt: 'desc' },
      take: limit,
    })
    return alerts
  } catch (error) {
    console.error(`[DB] Failed to get alerts for service ${serviceId}:`, error)
    return []
  }
}

/**
 * Update alert status
 */
export async function updateAlertStatus(alertId: string, status: string, acknowledgedAt?: Date, resolvedAt?: Date) {
  try {
    const alert = await prisma.alert.update({
      where: { id: alertId },
      data: {
        status,
        ...(acknowledgedAt && { acknowledgedAt }),
        ...(resolvedAt && { resolvedAt }),
      },
    })
    return alert
  } catch (error) {
    console.error(`[DB] Failed to update alert ${alertId}:`, error)
    return null
  }
}

/**
 * Get all active alerts
 */
export async function getActiveAlerts() {
  try {
    const alerts = await prisma.alert.findMany({
      where: { status: 'active' },
      orderBy: { triggeredAt: 'desc' },
      include: { service: true },
    })
    return alerts
  } catch (error) {
    console.error(`[DB] Failed to get active alerts:`, error)
    return []
  }
}

/**
 * Get alert count by service and severity
 */
export async function getAlertCountByService(serviceId: string) {
  try {
    const critical = await prisma.alert.count({
      where: { serviceId, severity: 'critical', status: 'active' },
    })
    const warning = await prisma.alert.count({
      where: { serviceId, severity: 'warning', status: 'active' },
    })
    const info = await prisma.alert.count({
      where: { serviceId, severity: 'info', status: 'active' },
    })
    return { critical, warning, info }
  } catch (error) {
    console.error(`[DB] Failed to get alert counts for service ${serviceId}:`, error)
    return { critical: 0, warning: 0, info: 0 }
  }
}

/**
 * Create or update alert rule
 */
export async function createOrUpdateAlertRule(
  serviceId: string,
  type: string,
  threshold: number,
  severity: string
) {
  try {
    const rule = await prisma.alertRule.upsert({
      where: {
        serviceId_type: {
          serviceId,
          type,
        },
      },
      create: {
        serviceId,
        type,
        threshold,
        severity,
      },
      update: {
        threshold,
        severity,
      },
    })
    return rule
  } catch (error) {
    console.error(`[DB] Failed to create/update alert rule:`, error)
    return null
  }
}
