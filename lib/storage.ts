import type { Service, HealthCheck } from "./types"
import * as fs from "fs"
import * as path from "path"

const DATA_DIR = path.join(process.cwd(), ".data")
const SERVICES_FILE = path.join(DATA_DIR, "services.json")
const HISTORY_DIR = path.join(DATA_DIR, "history")

// In-memory cache
let servicesCache: Map<string, Service> = new Map()
let isInitialized = false

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR, { recursive: true })
  }
}

function initializeStorage() {
  if (isInitialized) return
  
  ensureDataDir()
  
  try {
    if (fs.existsSync(SERVICES_FILE)) {
      const content = fs.readFileSync(SERVICES_FILE, "utf-8")
      const services: Service[] = JSON.parse(content)
      servicesCache.clear()
      services.forEach((s) => servicesCache.set(s.id, s))
    }
  } catch (e) {
    console.warn("Failed to load services from disk:", e)
    servicesCache.clear()
  }
  
  isInitialized = true
}

function persistServices() {
  try {
    ensureDataDir()
    const services = Array.from(servicesCache.values())
    fs.writeFileSync(SERVICES_FILE, JSON.stringify(services, null, 2))
  } catch (e) {
    console.warn("Failed to persist services:", e)
  }
}

function getHistoryFilePath(serviceId: string) {
  return path.join(HISTORY_DIR, `${serviceId}.json`)
}

function loadHistory(serviceId: string): HealthCheck[] {
  try {
    const filePath = getHistoryFilePath(serviceId)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8")
      return JSON.parse(content) as HealthCheck[]
    }
  } catch (e) {
    console.warn(`Failed to load history for ${serviceId}:`, e)
  }
  return []
}

function persistHistory(serviceId: string, history: HealthCheck[]) {
  try {
    ensureDataDir()
    const filePath = getHistoryFilePath(serviceId)
    // Keep only last 1000 entries
    const limited = history.slice(-1000)
    fs.writeFileSync(filePath, JSON.stringify(limited, null, 2))
  } catch (e) {
    console.warn(`Failed to persist history for ${serviceId}:`, e)
  }
}

// Public API
export function getAllServices(): Service[] {
  initializeStorage()
  const services = Array.from(servicesCache.values())
  // Ensure all services have the new fields
  return services.map((s) => ({
    ...s,
    packetLoss: s.packetLoss ?? 0,
    minLatency: s.minLatency ?? null,
    maxLatency: s.maxLatency ?? null,
    avgLatency: s.avgLatency ?? null,
  }))
}

export function getService(id: string): Service | null {
  initializeStorage()
  let service = servicesCache.get(id)
  if (service) {
    // Load latest history from disk
    service.history = loadHistory(id)
    // Ensure new fields exist
    service.packetLoss = service.packetLoss ?? 0
    service.minLatency = service.minLatency ?? null
    service.maxLatency = service.maxLatency ?? null
    service.avgLatency = service.avgLatency ?? null
  }
  return service || null
}

export function createService(service: Service): Service {
  initializeStorage()
  const withHistory: Service = {
    ...service,
    history: loadHistory(service.id) || [],
  }
  servicesCache.set(service.id, withHistory)
  persistServices()
  persistHistory(service.id, withHistory.history)
  return withHistory
}

export function updateService(id: string, updates: Partial<Service>): Service | null {
  initializeStorage()
  const existing = servicesCache.get(id)
  if (!existing) return null
  
  const updated: Service = {
    ...existing,
    ...updates,
    id: existing.id, // Prevent ID change
    createdAt: existing.createdAt, // Prevent createdAt change
  }
  servicesCache.set(id, updated)
  persistServices()
  
  if (updates.history) {
    persistHistory(id, updates.history)
  }
  
  return updated
}

export function deleteService(id: string): boolean {
  initializeStorage()
  const existed = servicesCache.has(id)
  servicesCache.delete(id)
  persistServices()
  
  // Clean up history file
  try {
    const filePath = getHistoryFilePath(id)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (e) {
    console.warn(`Failed to delete history file for ${id}:`, e)
  }
  
  return existed
}

export function appendHealthCheck(serviceId: string, check: HealthCheck): HealthCheck[] {
  initializeStorage()
  const service = servicesCache.get(serviceId)
  if (!service) return []
  
  const history = loadHistory(serviceId)
  history.push(check)
  
  // Keep only last 1000 entries
  const limited = history.slice(-1000)
  persistHistory(serviceId, limited)
  
  // Update service lastCheck
  const updated = {
    ...service,
    lastCheck: check.timestamp,
    status: check.status,
    responseTime: check.responseTime,
    history: limited,
  }
  servicesCache.set(serviceId, updated)
  persistServices()
  
  return limited
}

export function getServiceHistory(serviceId: string): HealthCheck[] {
  initializeStorage()
  const service = servicesCache.get(serviceId)
  if (!service) return []
  return loadHistory(serviceId)
}

export function setServiceHistory(serviceId: string, history: HealthCheck[]): boolean {
  initializeStorage()
  const service = servicesCache.get(serviceId)
  if (!service) return false
  
  persistHistory(serviceId, history)
  
  const updated = {
    ...service,
    history: history.slice(-1000),
  }
  servicesCache.set(serviceId, updated)
  persistServices()
  
  return true
}
