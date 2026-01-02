import { getAllServices, appendHealthCheck } from "./storage"
import { monitorService, calculateUptime } from "./monitoring"
import { updateService } from "./storage"
import type { HealthCheck } from "./types"

class MonitoringWorker {
  private interval: NodeJS.Timeout | null = null
  private isRunning = false

  start(intervalMs: number = 30000) {
    if (this.isRunning) {
      console.log("Monitoring worker already running")
      return
    }

    this.isRunning = true
    console.log(`Starting monitoring worker (interval: ${intervalMs}ms)`)

    this.runCheck()
    this.interval = setInterval(() => this.runCheck(), intervalMs)
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    this.isRunning = false
    console.log("Monitoring worker stopped")
  }

  private async runCheck() {
    try {
      const services = getAllServices()

      if (services.length === 0) {
        return
      }

      for (const service of services) {
        try {
          const result = await monitorService(service.url)

          const check: HealthCheck = {
            timestamp: Date.now(),
            status: result.status,
            responseTime: result.responseTime,
          }

          const updatedHistory = appendHealthCheck(service.id, check)
          const newUptime = calculateUptime(updatedHistory)

          // Update service with new status
          updateService(service.id, {
            status: result.status,
            lastCheck: Date.now(),
            responseTime: result.responseTime,
            uptime: newUptime,
          })

          console.log(`✓ Checked ${service.name}: ${result.status}`)
        } catch (error) {
          console.error(`✗ Error checking ${service.name}:`, error)
        }
      }
    } catch (error) {
      console.error("Error in monitoring worker:", error)
    }
  }
}

// Global instance
let worker: MonitoringWorker | null = null

export function getMonitoringWorker(): MonitoringWorker {
  if (!worker) {
    worker = new MonitoringWorker()
  }
  return worker
}

export function startMonitoring(intervalMs: number = 30000) {
  const w = getMonitoringWorker()
  w.start(intervalMs)
}

export function stopMonitoring() {
  if (worker) {
    worker.stop()
  }
}
