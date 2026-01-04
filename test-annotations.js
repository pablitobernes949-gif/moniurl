// Teste rápido do endpoint annotations
const BASE_URL = "http://localhost:3000";

async function testAnnotations() {
  try {
    console.log("Testando endpoint de annotations...\n");
    
    const response = await fetch(`${BASE_URL}/api/grafana/annotations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        range: {
          from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString(),
        },
        annotation: { name: "Alerts" },
      }),
    });

    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    
    const data = await response.json();
    console.log("\nDados retornados:");
    console.log(JSON.stringify(data, null, 2));
    
    console.log("\nNúmero de anotações:", Array.isArray(data) ? data.length : "N/A");
    
    if (response.ok) {
      console.log("\n✅ Teste passou!");
    } else {
      console.log("\n❌ Teste falhou!");
    }
  } catch (error) {
    console.error("\n❌ Erro:", error.message);
  }
}

testAnnotations();
