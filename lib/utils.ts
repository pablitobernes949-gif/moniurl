import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDistanceToNow(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return "agora há pouco"
  } else if (minutes < 60) {
    return `há ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`
  } else if (hours < 24) {
    return `há ${hours} ${hours === 1 ? "hora" : "horas"}`
  } else {
    return `há ${days} ${days === 1 ? "dia" : "dias"}`
  }
}
