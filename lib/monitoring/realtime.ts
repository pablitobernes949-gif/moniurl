import type { HealthCheck } from "../utils/types"

const histories: Map<string, HealthCheck[]> = new Map()
const subscribers: Map<string, Set<(data: any) => void>> = new Map()

export function getHistory(id: string): HealthCheck[] {
  return histories.get(id) ?? []
}

export function setHistory(id: string, h: HealthCheck[]) {
  histories.set(id, h)
  notify(id, { history: h })
}

export function appendCheck(id: string, check: HealthCheck) {
  const h = histories.get(id) ?? []
  h.push(check)
  // keep last 1000
  if (h.length > 1000) h.splice(0, h.length - 1000)
  histories.set(id, h)
  notify(id, { check })
  return h
}

export function subscribe(id: string, cb: (data: any) => void) {
  let set = subscribers.get(id)
  if (!set) {
    set = new Set()
    subscribers.set(id, set)
  }
  set.add(cb)
  return () => unsubscribe(id, cb)
}

export function unsubscribe(id: string, cb: (data: any) => void) {
  const set = subscribers.get(id)
  if (!set) return
  set.delete(cb)
  if (set.size === 0) subscribers.delete(id)
}

function notify(id: string, data: any) {
  const set = subscribers.get(id)
  if (!set) return
  for (const cb of set) cb(data)
}

// For tests: allow initializing sample data
export function seedHistory(id: string, h: HealthCheck[]) {
  histories.set(id, h)
}

export function clearAll() {
  histories.clear()
  subscribers.clear()
}

export default null
