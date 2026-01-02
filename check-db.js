// Script para verificar o banco de dados
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('📊 Checking database...\n');
    
    const serviceCount = await prisma.service.count();
    console.log(`✅ Services: ${serviceCount}`);
    
    const checkCount = await prisma.serviceCheck.count();
    console.log(`✅ Service Checks: ${checkCount}`);
    
    const ruleCount = await prisma.alertRule.count();
    console.log(`✅ Alert Rules: ${ruleCount}`);
    
    const alertCount = await prisma.alert.count();
    console.log(`✅ Alerts: ${alertCount}`);
    
    if (checkCount > 0) {
      console.log('\n📈 Recent checks:');
      const recentChecks = await prisma.serviceCheck.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { service: true }
      });
      
      recentChecks.forEach(check => {
        console.log(`  - ${check.service.name}: ${check.status} (${check.latency}ms, loss: ${check.loss}%)`);
      });
    }
    
    console.log('\n✅ Database persistence is working!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
