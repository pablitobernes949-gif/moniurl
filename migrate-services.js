// Script para migrar services da memória para o banco
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Services em memória (copiados do estado atual)
const inMemoryServices = [
  {
    id: "1767352059637",
    name: "Google",
    url: "8.8.8.8",
    type: "ip",
    createdAt: 1767352059637
  },
  {
    id: "1767355243638",
    name: "Site Huios",
    url: "huiosconsultoria.net.br",
    type: "url",
    createdAt: 1767355243638
  },
  {
    id: "1767357004025",
    name: "teste",
    url: "192.168.0.0",
    type: "ip",
    createdAt: 1767357004025
  }
];

async function migrateServices() {
  try {
    console.log('📦 Migrating services to database...\n');
    
    for (const svc of inMemoryServices) {
      // Check if service already exists
      const existing = await prisma.service.findFirst({
        where: { id: svc.id }
      });
      
      if (!existing) {
        await prisma.service.create({
          data: {
            id: svc.id,
            name: svc.name,
            url: svc.url,
            type: svc.type,
            createdAt: new Date(svc.createdAt),
            updatedAt: new Date(svc.createdAt)
          }
        });
        console.log(`✅ Created service: ${svc.name} (${svc.url})`);
      } else {
        console.log(`⏭️  Service already exists: ${svc.name}`);
      }
    }
    
    const totalServices = await prisma.service.count();
    console.log(`\n✅ Migration complete! Total services: ${totalServices}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

migrateServices();
