import type { ServiceStatus, HealthCheck } from "./types"

export async function monitorService(url: string): Promise<{
  status: ServiceStatus
  responseTime: number | null
}> {
  const startTime = Date.now()

  try {
    // Normalize URL
    let checkUrl = url.trim()
    if (!checkUrl.startsWith("http://") && !checkUrl.startsWith("https://")) {
      checkUrl = `https://${checkUrl}`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const response = await fetch(checkUrl, {
      method: "HEAD",
      mode: "no-cors",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const responseTime = Date.now() - startTime

    // With no-cors, we can't check status, so we assume success if no error
    return {
      status: responseTime < 5000 ? "online" : "unstable",
      responseTime,
    }
  } catch (error) {
    const responseTime = Date.now() - startTime

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return { status: "offline", responseTime: null }
      }
    }

    // Consider it offline if request fails
    return { status: "offline", responseTime: null }
  }
}

export function calculateUptime(history: HealthCheck[]): number {
  if (history.length === 0) return 100

  const onlineChecks = history.filter((check) => check.status === "online").length
  return (onlineChecks / history.length) * 100
}
