# 🔌 Integração Completa com Grafana

## ✨ O que foi criado

Sistema completo de exportação de métricas para visualização no Grafana, permitindo monitorar todos os serviços de forma centralizada e profissional.

## 📁 Arquivos Criados

### **APIs (4 endpoints):**
1. `app/api/grafana/prometheus/route.ts` - **13 métricas Prometheus**
2. `app/api/grafana/query/route.ts` - **Time series queries**
3. `app/api/grafana/search/route.ts` - **Busca de serviços/métricas**
4. `app/api/grafana/annotations/route.ts` - **Anotações de eventos**

### **Configuração:**
1. `config/grafana-dashboard-complete.json` - **Dashboard com 14 painéis**

### **Documentação:**
1. `docs/guides/GRAFANA_INTEGRATION_COMPLETE.md` - **Guia completo**

### **Scripts de Teste:**
1. `scripts/test-grafana-integration.js` - **Teste Node.js**
2. `scripts/test-grafana.ps1` - **Teste PowerShell**

## 🚀 Como Usar

### **1. Iniciar o Servidor**
```bash
npm run dev
```

### **2. Testar as APIs**

**PowerShell (Windows):**
```powershell
.\scripts\test-grafana.ps1
```

**Node.js (multiplataforma):**
```bash
node scripts/test-grafana-integration.js
```

### **3. Configurar Grafana**

#### **Data Source Prometheus:**
1. Abra Grafana → Configuration → Data Sources
2. Add data source → Prometheus
3. Configure:
   - **Name:** Service Monitor Prometheus
   - **URL:** `http://localhost:3000/api/grafana/prometheus`
   - **Scrape interval:** 30s
4. Save & Test

#### **Data Source SimpleJSON:**
1. Instale o plugin:
   ```bash
   grafana-cli plugins install grafana-simple-json-datasource
   ```
2. Add data source → SimpleJSON
3. Configure:
   - **Name:** Service Monitor JSON
   - **URL:** `http://localhost:3000/api/grafana`
4. Save & Test

### **4. Importar Dashboard**
1. Dashboards → Import
2. Cole o conteúdo de `config/grafana-dashboard-complete.json`
3. Selecione os data sources criados
4. Import

## 📊 Métricas Disponíveis

### **Prometheus (13 métricas):**
- `service_up` - Status (1=online, 0=offline)
- `service_latency_milliseconds` - Latência em ms
- `service_uptime_percentage` - Uptime %
- `service_packet_loss_percentage` - Packet loss %
- `service_checks_total` - Total de checks
- `service_checks_success_total` - Checks bem-sucedidos
- `service_checks_failure_total` - Checks com falha
- `service_alerts_active` - Alertas ativos
- `service_latency_average_milliseconds` - Latência média
- `service_success_rate` - Taxa de sucesso %
- `service_seconds_since_last_check` - Tempo desde último check
- `service_ssl_valid` - SSL válido (1=sim, 0=não)
- `service_status_by_type` - Status por tipo

### **Time Series:**
- Latência histórica
- Status ao longo do tempo
- Uptime histórico
- Packet loss histórico
- Taxa de sucesso histórica

### **Anotações:**
- Alertas disparados
- Mudanças de status
- Incidentes e recuperações

## 🎨 Dashboard Completo

### **14 Painéis:**

1. 📊 **Latência por Serviço** - Gráfico de linha com min/max/avg
2. ✅ **Status dos Serviços** - Timeline de disponibilidade
3. 📈 **Uptime Percentual** - Gráfico com threshold em 99.9%
4. 📉 **Packet Loss** - Perda de pacotes por serviço
5. 🎯 **Taxa de Sucesso** - Percentual de checks bem-sucedidos
6. 🟢 **Serviços Online** - Contador com cores
7. 🔴 **Serviços Offline** - Contador com alertas
8. ⚠️ **Alertas Ativos** - Total de alertas não resolvidos
9. 📊 **Total de Checks** - Contador de atividade
10. 📋 **Resumo dos Serviços** - Tabela consolidada
11. 🎯 **Uptime por Serviço** - Gráfico de barras
12. 🔥 **Heatmap de Latência** - Distribuição de latência
13. 📉 **Latência Média** - Série temporal
14. ⚠️ **Alertas e Eventos** - Lista de alertas

## 🔍 Queries de Exemplo

### **Prometheus:**

```promql
# Serviços online
sum(service_up)

# Latência média
avg(service_latency_average_milliseconds)

# Top 5 serviços mais lentos
topk(5, service_latency_milliseconds)

# Taxa de disponibilidade geral
(sum(service_up) / count(service_up)) * 100

# Alertas ativos
sum(service_alerts_active)
```

### **SimpleJSON:**

```json
{
  "targets": [
    { "target": "latency" },
    { "target": "status" },
    { "target": "uptime" }
  ],
  "range": {
    "from": "2026-01-04T00:00:00Z",
    "to": "2026-01-04T23:59:59Z"
  }
}
```

## 🧪 Testes

### **Teste Manual:**

```bash
# Prometheus
curl http://localhost:3000/api/grafana/prometheus

# Query
curl -X POST http://localhost:3000/api/grafana/query \
  -H "Content-Type: application/json" \
  -d '{"targets":[{"target":"latency"}]}'

# Search
curl http://localhost:3000/api/grafana/search

# Annotations
curl -X POST http://localhost:3000/api/grafana/annotations \
  -H "Content-Type: application/json" \
  -d '{"range":{}}'
```

### **Teste Automatizado:**

```bash
# Node.js
node scripts/test-grafana-integration.js

# PowerShell
.\scripts\test-grafana.ps1
```

## 📚 Documentação Completa

Leia o guia completo em: `docs/guides/GRAFANA_INTEGRATION_COMPLETE.md`

## ✅ Checklist de Configuração

- [ ] Servidor Next.js rodando (`npm run dev`)
- [ ] Grafana instalado e rodando
- [ ] Plugin SimpleJSON instalado
- [ ] Data Source Prometheus configurado
- [ ] Data Source SimpleJSON configurado
- [ ] Dashboard importado
- [ ] Testes executados com sucesso
- [ ] Serviços sendo monitorados
- [ ] Métricas aparecendo no dashboard

## 🎉 Resultado

Após configurar, você terá:

✅ Visualização completa de TODOS os serviços  
✅ 13 métricas Prometheus  
✅ 14 painéis no dashboard  
✅ Atualizações em tempo real (30s)  
✅ Anotações de eventos no timeline  
✅ Alertas configuráveis  
✅ Histórico completo  
✅ Filtros por serviço e tipo  

**Sistema totalmente integrado com Grafana!** 🚀
