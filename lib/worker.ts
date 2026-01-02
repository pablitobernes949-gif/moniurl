import { getAllServices, appendHealthCheck } from "./storage"
import { monitorService, calculateUptime } from "./monitoring"
import { updateService, createService } from "./storage"
import { checkAlerts, initializeDefaultRules } from "./alerts"
import { saveServiceCheck } from "./db-operations"
import { prisma } from "./db"
import type { HealthCheck, Service } from "./types"

class MonitoringWorker {
  private interval: NodeJS.Timeout | null = null
  private isRunning = false

  start(intervalMs: number = 30000) {
    if (this.isRunning) {
      console.log("[Worker] Monitoring worker already running")
      return
    }

    this.isRunning = true
    console.log(`[Worker] Starting monitoring worker (interval: ${intervalMs}ms)`)

    // Run first check immediately
    this.runCheck()
    
    // Then schedule recurring checks
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
      // Load services from database
      const dbServices = await prisma.service.findMany()
      
      // Get in-memory services
      const memoryServices = getAllServices()
      const memoryMap = new Map(memoryServices.map(s => [s.id, s]))

      // Sync: add missing services to memory
      for (const dbService of dbServices) {
        if (!memoryMap.has(dbService.id)) {
          console.log(`[Worker] Syncing service from DB to memory: ${dbService.name}`)
          const newService: Service = {
            id: dbService.id,
            name: dbService.name,
            url: dbService.url,
            status: 'checking',
            lastCheck: Date.now(),
            responseTime: 0,
            packetLoss: 0,
            minLatency: 0,
            maxLatency: 0,
            avgLatency: 0,
            history: [],
            uptime: 0,
            createdAt: dbService.createdAt.getTime(),
          }
          createService(newService)
        }
      }

      const services = getAllServices()

      if (services.length === 0) {
        console.log("[Worker] No services to check")
        return
      }

      console.log(`[Worker] Checking ${services.length} service(s)...`)

      for (const service of services) {
        try {
          console.log(`[Worker] Checking ${service.name} at ${service.url}...`)
          const result = await monitorService(service.url)
          console.log(`[Worker] Result for ${service.name}: ${result.status}, loss=${result.packetLoss}%, avg=${result.avgLatency}ms`)

          const check: HealthCheck = {
            timestamp: Date.now(),
            status: result.status,
            responseTime: result.responseTime,
            packetLoss: result.packetLoss,
            minLatency: result.minLatency,
            maxLatency: result.maxLatency,
            avgLatency: result.avgLatency,
          }

          const updatedHistory = appendHealthCheck(service.id, check)
          const newUptime = calculateUptime(updatedHistory)

          // Save check to database for persistence
          await saveServiceCheck(
            service.id,
            result.status,
            result.avgLatency,
            result.packetLoss,
            newUptime
          )

          console.log(`[Worker] Updated ${service.name}: uptime=${newUptime.toFixed(2)}%, loss=${result.packetLoss}%, lat=${result.avgLatency}ms`)

          // Update service with new status
          updateService(service.id, {
            status: result.status,
            lastCheck: Date.now(),
            responseTime: result.responseTime,
            packetLoss: result.packetLoss,
            minLatency: result.minLatency,
            maxLatency: result.maxLatency,
            avgLatency: result.avgLatency,
            uptime: newUptime,
          })

          // Check alerts for this service (make it awaitable)
          await checkAlerts(service, check)

          console.log(
            `✓ [${new Date().toLocaleTimeString()}] ${service.name}: ${result.status} | Loss: ${result.packetLoss}% | Lat: ${result.avgLatency}ms`
          )
        } catch (error) {
          console.error(`✗ Error checking ${service.name}:`, error instanceof Error ? error.message : error)
        }
      }
    } catch (error) {
      console.error("Error in monitoring worker:", error instanceof Error ? error.message : error)
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
