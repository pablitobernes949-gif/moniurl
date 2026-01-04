import type { ServiceStatus, HealthCheck } from "../utils/types"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

// Ping using native OS command for IP addresses
async function pingIP(ip: string, count: number = 5): Promise<{
  responses: number[]
  failures: number
}> {
  const responses: number[] = []
  let failures = 0
  let receivedCount = 0

  try {
    console.log(`[Monitor] Using native ICMP ping for ${ip} (${count} packets)`)
    
    // Windows ping command: ping -n <count> <ip>
    const { stdout } = await execAsync(`ping -n ${count} ${ip}`, { 
      timeout: 15000,
      windowsHide: true 
    })

    console.log(`[Monitor] Ping output received for ${ip}`)

    // Parse Windows ping output
    // Example: "Resposta de 8.8.8.8: bytes=32 tempo=52ms TTL=112"
    const lines = stdout.split("\n")
    
    for (const line of lines) {
      // Match response lines with latency
      const match = line.match(/tempo[<=](\d+)ms/i)
      if (match) {
        const latency = parseInt(match[1], 10)
        responses.push(latency)
        receivedCount++
        console.log(`[Monitor] Ping response: ${latency}ms`)
      }
    }

    // Parse statistics line for packet loss more carefully
    // "Pacotes: Enviados = 4, Recebidos = 4, Perdidos = 0 (0% de perda)"
    const statsMatch = stdout.match(/Perdidos\s*=\s*(\d+)/i)
    if (statsMatch) {
      failures = parseInt(statsMatch[1], 10)
      console.log(`[Monitor] Packet loss from ping stats: ${failures}/${count} packets lost`)
    } else if (receivedCount > 0) {
      // Fallback: calculate from responses received
      failures = count - receivedCount
      console.log(`[Monitor] Packet loss calculated: ${failures}/${count} packets lost`)
    } else {
      // No responses received at all
      failures = count
      console.log(`[Monitor] All packets lost for ${ip}`)
    }

  } catch (error) {
    console.error(`[Monitor] Ping command failed for ${ip}:`, error instanceof Error ? error.message : error)
    failures = count // All failed
  }

  return { responses, failures }
}

export async function monitorService(url: string): Promise<{
  status: ServiceStatus
  responseTime: number | null
  packetLoss: number
  minLatency: number | null
  maxLatency: number | null
  avgLatency: number | null
}> {
  const NUM_REQUESTS = 5
  const responses: number[] = []
  let failures = 0

  const detectIPv4 = (str: string) => /^\d+\.\d+\.\d+\.\d+$/.test(str.trim())

  try {
    const checkUrl = url.trim()
    const isIP = detectIPv4(checkUrl)

    // For pure IPs, use native ICMP ping
    if (isIP) {
      const result = await pingIP(checkUrl, NUM_REQUESTS)
      responses.push(...result.responses)
      failures = result.failures
    } else {
      // For URLs, use HTTP fetch
      let normalizedUrl = checkUrl
      if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
        normalizedUrl = `https://${normalizedUrl}`
      }

      console.log(`[Monitor] Testing ${normalizedUrl} (${NUM_REQUESTS} HTTP requests)`)

      // Send multiple requests in parallel
      const promises = Array.from({ length: NUM_REQUESTS }).map((_, index) =>
        (async () => {
          const startTime = Date.now()
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 10000)

            const response = await fetch(normalizedUrl, {
              method: "HEAD",
              signal: controller.signal,
            }).catch(() =>
              fetch(normalizedUrl, {
                method: "GET",
                signal: controller.signal,
              })
            )

            clearTimeout(timeoutId)
            const latency = Date.now() - startTime

            if (response && response.ok) {
              responses.push(latency)
              console.log(`[Monitor] Request ${index + 1}: ✓ ${latency}ms`)
              return latency
            } else if (response) {
              responses.push(latency)
              console.log(`[Monitor] Request ${index + 1}: ✓ ${latency}ms (status: ${response.status})`)
              return latency
            } else {
              failures++
              console.log(`[Monitor] Request ${index + 1}: ✗ Failed`)
              return null
            }
          } catch (error) {
            failures++
            const msg = error instanceof Error ? error.message : String(error)
            console.log(`[Monitor] Request ${index + 1}: ✗ ${msg}`)
            return null
          }
        })()
      )

      await Promise.allSettled(promises)
    }

    // Calculate metrics
    const packetLoss = (failures / NUM_REQUESTS) * 100
    const minLatency = responses.length > 0 ? Math.min(...responses) : null
    const maxLatency = responses.length > 0 ? Math.max(...responses) : null
    const avgLatency = responses.length > 0 ? Math.round(responses.reduce((a, b) => a + b, 0) / responses.length) : null
    const responseTime = avgLatency

    const status = packetLoss >= 100 ? "offline" : packetLoss > 50 ? "unstable" : "online"

    console.log(
      `[Monitor] Results: ${status} | Loss: ${packetLoss.toFixed(0)}% | Min: ${minLatency}ms | Avg: ${avgLatency}ms | Max: ${maxLatency}ms`
    )

    return {
      status,
      responseTime,
      packetLoss: Math.round(packetLoss),
      minLatency,
      maxLatency,
      avgLatency,
    }
  } catch (error) {
    console.error(`[Monitor] Fatal error for ${url}:`, error)
    return {
      status: "offline",
      responseTime: null,
      packetLoss: 100,
      minLatency: null,
      maxLatency: null,
      avgLatency: null,
    }
  }
}

export function calculateUptime(history: HealthCheck[]): number {
  if (history.length === 0) return 100
  const onlineChecks = history.filter((h) => h.status === "online").length
  return Math.round((onlineChecks / history.length) * 100 * 100) / 100
}
