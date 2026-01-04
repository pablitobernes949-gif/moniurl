#!/usr/bin/env node

/**
 * Script de teste para integração com Grafana
 * Testa todos os endpoints e valida respostas
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, details = "") {
  const icon = passed ? "✅" : "❌";
  const color = passed ? "green" : "red";
  log(`${icon} ${name}`, color);
  if (details) {
    log(`   ${details}`, "cyan");
  }
}

async function testEndpoint(name, url, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${url}`, options);
    const isJson = response.headers.get("content-type")?.includes("json");
    const isText = response.headers.get("content-type")?.includes("text");

    let data;
    if (isJson) {
      data = await response.json();
    } else if (isText) {
      data = await response.text();
    }

    const passed = response.ok;
    logTest(
      name,
      passed,
      `Status: ${response.status}, Type: ${isJson ? "JSON" : "Text"}`
    );

    return { passed, data, response };
  } catch (error) {
    logTest(name, false, `Erro: ${error.message}`);
    return { passed: false, error };
  }
}

async function runTests() {
  log("\n📊 TESTE DE INTEGRAÇÃO COM GRAFANA\n", "blue");
  log(`Base URL: ${BASE_URL}\n`, "cyan");

  let totalTests = 0;
  let passedTests = 0;

  // =========================================
  // TESTE 1: Prometheus Metrics
  // =========================================
  log("\n🔍 Testando Prometheus Metrics...", "yellow");
  totalTests++;
  const prometheusTest = await testEndpoint(
    "Prometheus Metrics",
    "/api/grafana/prometheus"
  );

  if (prometheusTest.passed && prometheusTest.data) {
    passedTests++;
    const metrics = prometheusTest.data.split("\n").filter((l) => l && !l.startsWith("#"));
    log(`   Métricas encontradas: ${metrics.length}`, "cyan");

    // Verificar métricas esperadas
    const expectedMetrics = [
      "service_up",
      "service_latency_milliseconds",
      "service_uptime_percentage",
      "service_alerts_active",
    ];

    expectedMetrics.forEach((metric) => {
      const found = prometheusTest.data.includes(metric);
      logTest(`   - ${metric}`, found);
    });
  }

  // =========================================
  // TESTE 2: Query Endpoint (GET)
  // =========================================
  log("\n🔍 Testando Query Endpoint (GET)...", "yellow");
  totalTests++;
  const queryGetTest = await testEndpoint("Query GET", "/api/grafana/query");
  if (queryGetTest.passed) passedTests++;

  // =========================================
  // TESTE 3: Query Endpoint (POST)
  // =========================================
  log("\n🔍 Testando Query Endpoint (POST)...", "yellow");
  totalTests++;
  const queryPostTest = await testEndpoint("Query POST", "/api/grafana/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      targets: [{ target: "latency" }],
      range: {
        from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
      },
    }),
  });

  if (queryPostTest.passed && queryPostTest.data) {
    passedTests++;
    log(`   Séries retornadas: ${queryPostTest.data.length}`, "cyan");
    if (queryPostTest.data.length > 0) {
      const firstSeries = queryPostTest.data[0];
      log(`   Primeira série: ${firstSeries.target}`, "cyan");
      log(`   Datapoints: ${firstSeries.datapoints?.length || 0}`, "cyan");
    }
  }

  // =========================================
  // TESTE 4: Search Endpoint (GET)
  // =========================================
  log("\n🔍 Testando Search Endpoint (GET)...", "yellow");
  totalTests++;
  const searchGetTest = await testEndpoint("Search GET", "/api/grafana/search");

  if (searchGetTest.passed && searchGetTest.data) {
    passedTests++;
    log(`   Métricas disponíveis: ${searchGetTest.data.metrics?.length || 0}`, "cyan");
    log(`   Serviços disponíveis: ${searchGetTest.data.services?.length || 0}`, "cyan");
  }

  // =========================================
  // TESTE 5: Search Endpoint (POST)
  // =========================================
  log("\n🔍 Testando Search Endpoint (POST)...", "yellow");
  totalTests++;
  const searchPostTest = await testEndpoint("Search POST", "/api/grafana/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target: "" }),
  });

  if (searchPostTest.passed && searchPostTest.data) {
    passedTests++;
    log(`   Resultados: ${searchPostTest.data.length}`, "cyan");
  }

  // =========================================
  // TESTE 6: Annotations Endpoint (GET)
  // =========================================
  log("\n🔍 Testando Annotations Endpoint (GET)...", "yellow");
  totalTests++;
  const annotationsGetTest = await testEndpoint(
    "Annotations GET",
    "/api/grafana/annotations"
  );
  if (annotationsGetTest.passed) passedTests++;

  // =========================================
  // TESTE 7: Annotations Endpoint (POST)
  // =========================================
  log("\n🔍 Testando Annotations Endpoint (POST)...", "yellow");
  totalTests++;
  const annotationsPostTest = await testEndpoint(
    "Annotations POST",
    "/api/grafana/annotations",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        range: {
          from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString(),
        },
        annotation: { name: "Alerts" },
      }),
    }
  );

  if (annotationsPostTest.passed && annotationsPostTest.data) {
    passedTests++;
    log(`   Anotações encontradas: ${annotationsPostTest.data.length}`, "cyan");
  }

  // =========================================
  // TESTE 8: CORS Headers
  // =========================================
  log("\n🔍 Testando CORS Headers...", "yellow");
  totalTests++;
  const corsTest = await testEndpoint("CORS Options", "/api/grafana/query", {
    method: "OPTIONS",
  });

  if (corsTest.passed) {
    passedTests++;
    const headers = corsTest.response.headers;
    log(`   Access-Control-Allow-Origin: ${headers.get("access-control-allow-origin")}`, "cyan");
    log(`   Access-Control-Allow-Methods: ${headers.get("access-control-allow-methods")}`, "cyan");
  }

  // =========================================
  // RESUMO
  // =========================================
  log("\n" + "=".repeat(50), "blue");
  log("📊 RESUMO DOS TESTES", "blue");
  log("=".repeat(50), "blue");

  const percentage = ((passedTests / totalTests) * 100).toFixed(1);
  const color = percentage === "100.0" ? "green" : percentage >= 70 ? "yellow" : "red";

  log(`\nTotal de testes: ${totalTests}`, "cyan");
  log(`Testes passados: ${passedTests}`, "green");
  log(`Testes falhos: ${totalTests - passedTests}`, "red");
  log(`Taxa de sucesso: ${percentage}%`, color);

  if (passedTests === totalTests) {
    log("\n🎉 Todos os testes passaram! Integração com Grafana está funcionando perfeitamente!", "green");
  } else {
    log("\n⚠️  Alguns testes falharam. Verifique a configuração.", "yellow");
  }

  log("\n📚 Próximos passos:", "cyan");
  log("1. Configure os data sources no Grafana", "cyan");
  log("2. Importe o dashboard: config/grafana-dashboard-complete.json", "cyan");
  log("3. Acesse: http://localhost:3001", "cyan");

  process.exit(passedTests === totalTests ? 0 : 1);
}

// Executar testes
runTests().catch((error) => {
  log(`\n❌ Erro ao executar testes: ${error.message}`, "red");
  process.exit(1);
});
