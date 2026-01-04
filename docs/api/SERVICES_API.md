# 🌐 Services API - Documentação

## Base URL
```
http://localhost:3000/api/services
```

## Endpoints

### 1. Listar Todos os Serviços
**GET** `/api/services`

Retorna todos os serviços cadastrados.

**Response 200:**
```json
{
  "services": [
    {
      "id": "clxxx123",
      "name": "API Principal",
      "url": "https://api.example.com",
      "type": "http",
      "status": "online",
      "responseTime": 120,
      "uptime": 99.95,
      "lastCheck": "2026-01-03T12:00:00Z",
      "createdAt": "2026-01-01T00:00:00Z",
      "checkInterval": 60,
      "timeout": 5000
    }
  ]
}
```

---

### 2. Criar Novo Serviço
**POST** `/api/services`

Cria um novo serviço para monitoramento.

**Request Body:**
```json
{
  "name": "Minha API",
  "url": "https://api.example.com/health",
  "type": "http",
  "checkInterval": 60,
  "timeout": 5000,
  "expectedStatus": 200
}
```

**Campos:**
- `name` (string, obrigatório): Nome do serviço
- `url` (string, obrigatório): URL para verificação
- `type` (string, obrigatório): Tipo de verificação (`http`, `ping`, `tcp`)
- `checkInterval` (number, opcional): Intervalo em segundos (padrão: 60)
- `timeout` (number, opcional): Timeout em ms (padrão: 5000)
- `expectedStatus` (number, opcional): Status HTTP esperado (padrão: 200)

**Response 201:**
```json
{
  "id": "clxxx456",
  "name": "Minha API",
  "url": "https://api.example.com/health",
  "status": "unknown",
  "createdAt": "2026-01-03T12:30:00Z"
}
```

**Response 400:**
```json
{
  "error": "Nome e URL são obrigatórios"
}
```

---

### 3. Obter Serviço por ID
**GET** `/api/services/:id`

Retorna detalhes de um serviço específico.

**Response 200:**
```json
{
  "id": "clxxx123",
  "name": "API Principal",
  "url": "https://api.example.com",
  "type": "http",
  "status": "online",
  "responseTime": 120,
  "uptime": 99.95,
  "lastCheck": "2026-01-03T12:00:00Z",
  "checksLast24h": 1440,
  "failuresLast24h": 3,
  "averageResponseTime": 135
}
```

**Response 404:**
```json
{
  "error": "Serviço não encontrado"
}
```

---

### 4. Atualizar Serviço
**PUT** `/api/services/:id`

Atualiza configurações de um serviço.

**Request Body:**
```json
{
  "name": "API Principal (Prod)",
  "checkInterval": 30,
  "timeout": 3000
}
```

**Response 200:**
```json
{
  "id": "clxxx123",
  "name": "API Principal (Prod)",
  "checkInterval": 30,
  "updatedAt": "2026-01-03T12:45:00Z"
}
```

---

### 5. Deletar Serviço
**DELETE** `/api/services/:id`

Remove um serviço do sistema.

**Response 200:**
```json
{
  "success": true,
  "message": "Serviço removido com sucesso"
}
```

**Response 404:**
```json
{
  "error": "Serviço não encontrado"
}
```

---

### 6. Verificar Serviço Agora
**POST** `/api/services/:id/check`

Força uma verificação imediata do serviço.

**Response 200:**
```json
{
  "id": "clxxx123",
  "status": "online",
  "responseTime": 145,
  "checkedAt": "2026-01-03T12:50:00Z",
  "statusCode": 200
}
```

**Response 500:**
```json
{
  "id": "clxxx123",
  "status": "offline",
  "error": "Connection timeout",
  "checkedAt": "2026-01-03T12:50:00Z"
}
```

---

### 7. Histórico de Verificações
**GET** `/api/services/:id/history`

Retorna histórico de verificações de um serviço.

**Query Parameters:**
- `limit` (number, opcional): Número de registros (padrão: 100)
- `startDate` (ISO 8601, opcional): Data inicial
- `endDate` (ISO 8601, opcional): Data final

**Exemplo:**
```
GET /api/services/clxxx123/history?limit=50&startDate=2026-01-01T00:00:00Z
```

**Response 200:**
```json
{
  "serviceId": "clxxx123",
  "checks": [
    {
      "id": "check123",
      "timestamp": "2026-01-03T12:00:00Z",
      "status": "online",
      "responseTime": 120,
      "statusCode": 200
    },
    {
      "id": "check124",
      "timestamp": "2026-01-03T11:59:00Z",
      "status": "online",
      "responseTime": 135,
      "statusCode": 200
    }
  ],
  "total": 1440,
  "page": 1
}
```

---

### 8. Estatísticas do Serviço
**GET** `/api/services/:id/stats`

Retorna estatísticas agregadas de um serviço.

**Query Parameters:**
- `period` (string, opcional): Período (`1h`, `24h`, `7d`, `30d`) - padrão: `24h`

**Response 200:**
```json
{
  "serviceId": "clxxx123",
  "period": "24h",
  "stats": {
    "uptime": 99.95,
    "totalChecks": 1440,
    "successfulChecks": 1439,
    "failedChecks": 1,
    "averageResponseTime": 135,
    "minResponseTime": 95,
    "maxResponseTime": 450,
    "incidents": [
      {
        "startTime": "2026-01-03T08:30:00Z",
        "endTime": "2026-01-03T08:31:00Z",
        "duration": 60,
        "reason": "HTTP 503"
      }
    ]
  }
}
```

---

### 9. Eventos do Serviço
**GET** `/api/services/:id/events`

Retorna eventos importantes (mudanças de status, alertas).

**Query Parameters:**
- `limit` (number, opcional): Número de eventos (padrão: 50)
- `type` (string, opcional): Tipo de evento (`status_change`, `alert`, `recovery`)

**Response 200:**
```json
{
  "serviceId": "clxxx123",
  "events": [
    {
      "id": "event123",
      "type": "status_change",
      "timestamp": "2026-01-03T08:30:00Z",
      "data": {
        "previousStatus": "online",
        "newStatus": "offline",
        "reason": "Connection timeout"
      }
    },
    {
      "id": "event124",
      "type": "recovery",
      "timestamp": "2026-01-03T08:31:00Z",
      "data": {
        "downtime": 60,
        "message": "Serviço restaurado"
      }
    }
  ]
}
```

---

## Tipos de Status

| Status | Descrição | Cor |
|--------|-----------|-----|
| `online` | Serviço funcionando normalmente | 🟢 Verde |
| `offline` | Serviço indisponível | 🔴 Vermelho |
| `degraded` | Serviço com problemas de performance | 🟡 Amarelo |
| `unknown` | Status desconhecido (sem verificação) | ⚪ Cinza |

## Tipos de Verificação

### HTTP/HTTPS (`type: "http"`)
- Faz request HTTP GET
- Verifica status code
- Mede tempo de resposta
- Pode verificar conteúdo da resposta

### Ping ICMP (`type: "ping"`)
- Envia pacote ICMP
- Verifica conectividade de rede
- Mede latência

### TCP (`type: "tcp"`)
- Tenta conectar em porta TCP
- Verifica se porta está aberta
- Mede tempo de conexão

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Bad Request - Dados inválidos |
| 404 | Not Found - Serviço não encontrado |
| 500 | Internal Server Error - Erro no servidor |
| 503 | Service Unavailable - Serviço temporariamente indisponível |

## Exemplos de Uso

### cURL

**Criar serviço:**
```bash
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Minha API",
    "url": "https://api.example.com/health",
    "type": "http",
    "checkInterval": 60
  }'
```

**Listar serviços:**
```bash
curl http://localhost:3000/api/services
```

**Verificar agora:**
```bash
curl -X POST http://localhost:3000/api/services/clxxx123/check
```

### JavaScript/Fetch

```javascript
// Criar serviço
const response = await fetch('http://localhost:3000/api/services', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Minha API',
    url: 'https://api.example.com/health',
    type: 'http'
  })
});
const service = await response.json();

// Obter histórico
const history = await fetch(`http://localhost:3000/api/services/${service.id}/history?limit=100`);
const data = await history.json();
```

### Python

```python
import requests

# Criar serviço
response = requests.post('http://localhost:3000/api/services', json={
    'name': 'Minha API',
    'url': 'https://api.example.com/health',
    'type': 'http',
    'checkInterval': 60
})
service = response.json()

# Obter estatísticas
stats = requests.get(f'http://localhost:3000/api/services/{service["id"]}/stats?period=24h')
print(stats.json())
```

---

**Veja também:**
- [Metrics API](./METRICS_API.md) - Integração com Grafana
- [Alerts API](./ALERTS_API.md) - Sistema de alertas
- [Dependencies API](./DEPENDENCIES_API.md) - Gerenciamento de dependências
