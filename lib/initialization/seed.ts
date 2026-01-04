/**
 * Script para semear dados de teste no banco
 * Execute com: npx ts-node lib/seed.ts
 */

import { createService } from "../database/storage"
import type { Service } from "../utils/types"

const sampleServices = [
  {
    name: "Google DNS",
    url: "https://8.8.8.8",
  },
  {
    name: "Cloudflare DNS",
    url: "https://1.1.1.1",
  },
  {
    name: "Amazon Web Services",
    url: "https://aws.amazon.com",
  },
  {
    name: "GitHub",
    url: "https://github.com",
  },
]

async function seed() {
  console.log("🌱 Seeding test data...")

  for (const { name, url } of sampleServices) {
    const service: Service = {
      id: Date.now().toString() + Math.random(),
      name,
      url,
      status: "checking",
      lastCheck: Date.now(),
      responseTime: null,
      history: [],
      uptime: 100,
      createdAt: Date.now(),
    }

    createService(service)
    console.log(`✓ Created service: ${name}`)
  }

  console.log("✓ Seeding complete!")
}

seed().catch(console.error)
