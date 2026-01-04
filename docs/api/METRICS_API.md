# 📊 Metrics API - Integração Grafana

## Base URL
```
http://localhost:3000/api/metrics
```

## Visão Geral

A Metrics API expõe dados do sistema em formatos compatíveis com Grafana (JSON e Prometheus). Permite visualizar métricas de monitoramento em dashboards personalizados.

## Endpoints

### 1. Health Check
**GET** `/api/metrics`

Verifica se a API está funcionando.

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-03T12:00:00Z",
  "version": "2.0"
}
```

---

### 2. Métricas Gerais (JSON)
**GET** `/api/metrics/json`

Retorna métricas gerais do sistema em formato JSON (compatível com Grafana JSON datasource).

**Response 200:**
```json
{
  "timestamp": "2026-01-03T12:00:00Z",
  "system": {
    "totalServices": 15,
    "onlineServices": 14,
    "offlineServices": 1,
    "degradedServices": 0,
    "overallUptime": 99.3,
    "averageResponseTime": 145,
    "totalChecks24h": 21600,
    "failedChecks24h": 18
  },
  "services": [
    {
      "id": "clxxx123",
      "name": "API Principal",
      "status": "online",
      "responseTime": 120,
      "uptime": 99.95,
      "lastCheck": "2026-01-03T11:59:00Z"
    }
  ]
}
```

---

### 3. Métricas Prometheus
**GET** `/api/metrics/prometheus`

Retorna métricas em formato Prometheus (texto).

**Response 200 (text/plain):**
```prometheus
# HELP service_status Status do serviço (1=online, 0=offline)
# TYPE service_status gauge
service_status{service="API Principal",id="clxxx123"} 1
service_status{service="Banco de Dados",id="clxxx456"} 0

# HELP service_response_time Tempo de resposta em ms
# TYPE service_response_time gauge
service_response_time{service="API Principal",id="clxxx123"} 120
service_response_time{service="Banco de Dados",id="clxxx456"} 0

# HELP service_uptime Uptime do serviço (%)
# TYPE service_uptime gauge
service_uptime{service="API Principal",id="clxxx123"} 99.95
service_uptime{service="Banco de Dados",id="clxxx456"} 98.30

# HELP system_total_services Total de serviços monitorados
# TYPE system_total_services gauge
system_total_services 15

# HELP system_online_services Serviços online
# TYPE system_online_services gauge
system_online_services 14

# HELP system_offline_services Serviços offline
# TYPE system_offline_services gauge
system_offline_services 1

# HELP system_checks_total Total de verificações nas últimas 24h
# TYPE system_checks_total counter
system_checks_total 21600

# HELP system_checks_failed Verificações falhas nas últimas 24h
# TYPE system_checks_failed counter
system_checks_failed 18
```

---

### 4. Série Temporal (Grafana)
**POST** `/api/metrics/query`

Endpoint compatível com Grafana Simple JSON Datasource para consultas de série temporal.

**Request Body:**
```json
{
  "range": {
    "from": "2026-01-03T00:00:00Z",
    "to": "2026-01-03T23:59:59Z"
  },
  "targets": [
    {
      "target": "service_response_time",
      "refId": "A",
      "type": "timeseries",
      "data": {
        "serviceId": "clxxx123"
      }
    }
  ],
  "interval": "1m",
  "maxDataPoints": 1000
}
```

**Response 200:**
```json
[
  {
    "target": "API Principal - Response Time",
    "datapoints": [
      [120, 1704240000000],
      [135, 1704240060000],
      [110, 1704240120000]
    ]
  }
]
```

---

### 5. Métricas por Serviço
**GET** `/api/metrics/services/:id`

Retorna métricas detalhadas de um serviço específico.

**Query Parameters:**
- `period` (string, opcional): `1h`, `24h`, `7d`, `30d` (padrão: `24h`)
- `format` (string, opcional): `json` ou `prometheus` (padrão: `json`)

**Response 200 (JSON):**
```json
{
  "serviceId": "clxxx123",
  "serviceName": "API Principal",
  "period": "24h",
  "metrics": {
    "status": "online",
    "uptime": 99.95,
    "totalChecks": 1440,
    "successfulChecks": 1439,
    "failedChecks": 1,
    "responseTime": {
      "current": 120,
      "average": 135,
      "min": 95,
      "max": 450,
      "p50": 130,
      "p95": 200,
      "p99": 350
    },
    "incidents": [
      {
        "startTime": "2026-01-03T08:30:00Z",
        "endTime": "2026-01-03T08:31:00Z",
        "duration": 60
      }
    ]
  },
  "timeseries": {
    "responseTime": [
      {"timestamp": "2026-01-03T00:00:00Z", "value": 125},
      {"timestamp": "2026-01-03T01:00:00Z", "value": 130}
    ],
    "status": [
      {"timestamp": "2026-01-03T00:00:00Z", "value": 1},
      {"timestamp": "2026-01-03T01:00:00Z", "value": 1}
    ]
  }
}
```

---

### 6. Métricas de Múltiplos Serviços
**GET** `/api/metrics/services/compare`

Compara métricas de múltiplos serviços.

**Query Parameters:**
- `ids` (string, obrigatório): IDs separados por vírgula (ex: `id1,id2,id3`)
- `period` (string, opcional): Período de análise
- `metric` (string, opcional): Métrica específica (`responseTime`, `uptime`, `availability`)

**Exemplo:**
```
GET /api/metrics/services/compare?ids=clxxx123,clxxx456,clxxx789&period=7d&metric=responseTime
```

**Response 200:**
```json
{
  "period": "7d",
  "metric": "responseTime",
  "services": [
    {
      "id": "clxxx123",
      "name": "API Principal",
      "average": 135,
      "min": 95,
      "max": 450
    },
    {
      "id": "clxxx456",
      "name": "Banco de Dados",
      "average": 8,
      "min": 5,
      "max": 25
    }
  ]
}
```

---

### 7. Alertas Ativos
**GET** `/api/metrics/alerts`

Retorna alertas ativos no sistema.

**Response 200:**
```json
{
  "timestamp": "2026-01-03T12:00:00Z",
  "activeAlerts": 3,
  "alerts": [
    {
      "id": "alert123",
      "serviceId": "clxxx456",
      "serviceName": "Banco de Dados",
      "severity": "critical",
      "message": "Serviço offline há 5 minutos",
      "triggeredAt": "2026-01-03T11:55:00Z",
      "duration": 300
    }
  ]
}
```

---

## Integração com Grafana

### 1. JSON Datasource

**Configuração:**
1. Instalar plugin "Simple JSON Datasource"
2. Adicionar datasource apontando para `http://localhost:3000/api/metrics`
3. Criar dashboard com queries

**Exemplo de Query:**
```json
{
  "target": "service_response_time",
  "serviceId": "clxxx123"
}
```

### 2. Prometheus Datasource

**Configuração:**
1. Configurar Prometheus para scraping:
```yaml
scrape_configs:
  - job_name: 'monitoring-system'
    scrape_interval: 30s
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics/prometheus'
```

2. Adicionar Prometheus datasource no Grafana
3. Criar painéis com PromQL

**Exemplos de Queries (PromQL):**
```promql
# Taxa de sucesso
rate(system_checks_total[5m]) - rate(system_checks_failed[5m])

# Tempo médio de resposta
avg(service_response_time)

# Serviços offline
sum(service_status == 0)

# Uptime por serviço
avg by (service) (service_uptime)
```

---

## Dashboard Grafana Pronto

Importe o dashboard JSON disponível em `/grafana-dashboard.json`:

**Painéis incluídos:**
- ✅ Status geral do sistema
- 📊 Tempo de resposta por serviço
- 🔴 Alertas ativos
- 📈 Uptime histórico
- ⚡ Latência P95/P99
- 🔢 Total de verificações

**Para importar:**
1. Grafana → Dashboards → Import
2. Upload do arquivo `grafana-dashboard.json`
3. Selecionar datasource
4. Salvar

---

## Exemplos de Uso

### cURL

**Métricas Prometheus:**
```bash
curl http://localhost:3000/api/metrics/prometheus
```

**Métricas JSON:**
```bash
curl http://localhost:3000/api/metrics/json
```

**Métricas de serviço:**
```bash
curl http://localhost:3000/api/metrics/services/clxxx123?period=7d
```

### JavaScript

```javascript
// Obter métricas gerais
const metrics = await fetch('http://localhost:3000/api/metrics/json');
const data = await metrics.json();
console.log(`Uptime geral: ${data.system.overallUptime}%`);

// Comparar serviços
const comparison = await fetch(
  'http://localhost:3000/api/metrics/services/compare?ids=id1,id2&metric=responseTime'
);
const compareData = await comparison.json();
```

### Python

```python
import requests

# Métricas Prometheus
response = requests.get('http://localhost:3000/api/metrics/prometheus')
print(response.text)

# Métricas JSON
metrics = requests.get('http://localhost:3000/api/metrics/json').json()
print(f"Total de serviços: {metrics['system']['totalServices']}")
```

---

## Formatos de Resposta

### Timestamps
- **JSON**: ISO 8601 (`"2026-01-03T12:00:00Z"`)
- **Prometheus**: Unix timestamp em milissegundos

### Valores Numéricos
- **Response Time**: Milissegundos (ms)
- **Uptime**: Porcentagem (0-100)
- **Status**: Boolean (1=online, 0=offline)
- **Duration**: Segundos

---

**Veja também:**
- [Services API](./SERVICES_API.md) - CRUD de serviços
- [Alerts API](./ALERTS_API.md) - Configuração de alertas
- [Grafana Setup Guide](../guides/GRAFANA_SETUP.md) - Guia completo
