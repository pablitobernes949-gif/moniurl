# 🔗 Dependencies API - Sistema de Dependências

## Base URL
```
http://localhost:3000/api/services/:id/dependencies
```

## Visão Geral

A Dependencies API permite gerenciar dependências entre serviços, criando um grafo de relacionamentos. Útil para:
- Mapear arquitetura de microsserviços
- Identificar pontos críticos de falha
- Cascata de alertas (quando dependência cai, alertar dependentes)
- Visualizar impacto de mudanças

## Conceitos

### Tipos de Dependência
- **Obrigatória (required)**: Dependência crítica - serviço não funciona sem ela
- **Opcional (optional)**: Dependência secundária - serviço pode funcionar com degradação

### Grafo Direcionado
```
Serviço A → Serviço B
(A depende de B)
```

## Endpoints

### 1. Listar Dependências
**GET** `/api/services/:id/dependencies`

Retorna dependências e dependentes de um serviço.

**Response 200:**
```json
{
  "serviceId": "clxxx123",
  "serviceName": "API Principal",
  "dependencies": [
    {
      "id": "dep123",
      "dependencyId": "clxxx456",
      "dependency": {
        "id": "clxxx456",
        "name": "Banco de Dados",
        "status": "online",
        "url": "postgresql://..."
      },
      "type": "required",
      "description": "Banco de dados principal",
      "createdAt": "2026-01-01T00:00:00Z"
    },
    {
      "id": "dep124",
      "dependencyId": "clxxx789",
      "dependency": {
        "id": "clxxx789",
        "name": "Cache Redis",
        "status": "online",
        "url": "redis://..."
      },
      "type": "optional",
      "description": "Cache para otimização",
      "createdAt": "2026-01-02T00:00:00Z"
    }
  ],
  "dependents": [
    {
      "id": "dep125",
      "serviceId": "clxxx111",
      "service": {
        "id": "clxxx111",
        "name": "Frontend",
        "status": "online",
        "url": "https://app.example.com"
      },
      "type": "required",
      "description": "Frontend web",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ],
  "hasCriticalDependencies": false
}
```

**Campos da resposta:**
- `dependencies`: Serviços dos quais este serviço depende
- `dependents`: Serviços que dependem deste serviço
- `hasCriticalDependencies`: `true` se há dependências obrigatórias offline

---

### 2. Adicionar Dependência
**POST** `/api/services/:id/dependencies`

Cria uma nova dependência.

**Request Body:**
```json
{
  "dependencyId": "clxxx456",
  "type": "required",
  "description": "Banco de dados principal"
}
```

**Campos:**
- `dependencyId` (string, obrigatório): ID do serviço dependência
- `type` (string, obrigatório): `"required"` ou `"optional"`
- `description` (string, opcional): Descrição da dependência

**Response 201:**
```json
{
  "id": "dep123",
  "serviceId": "clxxx123",
  "dependencyId": "clxxx456",
  "type": "required",
  "description": "Banco de dados principal",
  "createdAt": "2026-01-03T12:00:00Z"
}
```

**Response 400 (Dependência duplicada):**
```json
{
  "error": "Dependência já existe"
}
```

**Response 400 (Dependência circular):**
```json
{
  "error": "Não é possível criar dependência circular"
}
```

**Response 404:**
```json
{
  "error": "Serviço ou dependência não encontrados"
}
```

---

### 3. Remover Dependência
**DELETE** `/api/services/:id/dependencies/:dependencyId`

Remove uma dependência específica.

**Response 200:**
```json
{
  "success": true,
  "message": "Dependência removida com sucesso"
}
```

**Response 404:**
```json
{
  "error": "Dependência não encontrada"
}
```

---

### 4. Obter Grafo Completo
**GET** `/api/services/dependencies/graph`

Retorna o grafo completo de dependências de todos os serviços.

**Response 200:**
```json
{
  "nodes": [
    {
      "id": "clxxx123",
      "name": "API Principal",
      "status": "online",
      "type": "http"
    },
    {
      "id": "clxxx456",
      "name": "Banco de Dados",
      "status": "online",
      "type": "tcp"
    }
  ],
  "edges": [
    {
      "id": "dep123",
      "source": "clxxx123",
      "target": "clxxx456",
      "type": "required",
      "description": "Banco de dados principal"
    }
  ],
  "stats": {
    "totalServices": 10,
    "totalDependencies": 15,
    "criticalDependencies": 8,
    "optionalDependencies": 7,
    "isolatedServices": 2
  }
}
```

---

## Validações

### 1. Dependência Circular

O sistema **impede dependências circulares**:

```
❌ Inválido:
A → B → C → A

✅ Válido:
A → B → C → D
```

**Algoritmo de Detecção:**
```javascript
async function checkCircularDependency(startId, targetId, visited = new Set()) {
  if (startId === targetId) return true;
  if (visited.has(startId)) return false;
  
  visited.add(startId);
  
  const dependencies = await getDependencies(startId);
  for (const dep of dependencies) {
    if (await checkCircularDependency(dep.dependencyId, targetId, visited)) {
      return true;
    }
  }
  
  return false;
}
```

### 2. Duplicação

Não é possível criar a mesma dependência duas vezes:
```
A → B (✅ Permitido)
A → B (❌ Bloqueado - duplicado)
```

### 3. Auto-Dependência

Um serviço não pode depender de si mesmo:
```
A → A (❌ Bloqueado)
```

### 4. Serviço Inexistente

Ambos os serviços (origem e destino) devem existir no banco de dados.

---

## Cascata de Alertas

Quando uma dependência **obrigatória** fica **offline**, o sistema:

1. **Marca status como degraded** nos serviços dependentes
2. **Gera alerta** informando qual dependência causou o problema
3. **Calcula impacto** mostrando quantos serviços são afetados

**Exemplo:**

```
Banco de Dados (offline)
↓
API Principal (degraded - "Dependência crítica offline: Banco de Dados")
↓
Frontend (degraded - "Dependência crítica offline: API Principal")
```

---

## Análise de Impacto

### Impacto Downstream (Para Baixo)
Quantos serviços serão afetados se este serviço cair:

```
GET /api/services/:id/dependencies/impact/downstream
```

**Response:**
```json
{
  "serviceId": "clxxx456",
  "serviceName": "Banco de Dados",
  "directDependents": 3,
  "totalImpact": 8,
  "affectedServices": [
    {"id": "clxxx123", "name": "API Principal", "type": "required"},
    {"id": "clxxx789", "name": "API Secundária", "type": "required"},
    {"id": "clxxx111", "name": "Frontend", "type": "required"}
  ],
  "impactTree": {
    "level0": ["API Principal", "API Secundária"],
    "level1": ["Frontend", "Mobile App"],
    "level2": ["Analytics Dashboard"]
  }
}
```

### Impacto Upstream (Para Cima)
Se este serviço cair, quais dependências serão afetadas:

```
GET /api/services/:id/dependencies/impact/upstream
```

---

## Visualização em Grafo

### Endpoint de Dados para Canvas

**GET** `/api/services/dependencies/canvas`

Retorna dados otimizados para renderização em canvas HTML5:

**Response:**
```json
{
  "nodes": [
    {
      "id": "clxxx123",
      "name": "API Principal",
      "status": "online",
      "x": 400,
      "y": 200,
      "layer": 1,
      "dependencies": ["clxxx456", "clxxx789"]
    }
  ],
  "layout": "topological",
  "dimensions": {
    "width": 800,
    "height": 600,
    "layers": 4
  }
}
```

### Algoritmo de Layout (Topological Sort)

```javascript
function calculateNodePositions(services, dependencies) {
  // 1. Calcular in-degree (quantas dependências cada nó tem)
  const inDegree = new Map();
  
  // 2. Layer 0: Serviços sem dependências (raiz)
  const layer0 = services.filter(s => inDegree.get(s.id) === 0);
  
  // 3. Distribuir em layers
  const layers = [layer0];
  
  // 4. Processar cada layer
  let currentLayer = 0;
  while (layers[currentLayer].length > 0) {
    const nextLayer = [];
    layers[currentLayer].forEach(node => {
      // Adicionar dependentes ao próximo layer
      const dependents = getDependents(node.id);
      nextLayer.push(...dependents);
    });
    layers.push(nextLayer);
    currentLayer++;
  }
  
  // 5. Calcular posições (x, y)
  const layerHeight = 600 / (layers.length + 1);
  const positions = [];
  
  layers.forEach((layer, layerIndex) => {
    const layerWidth = 800 / (layer.length + 1);
    layer.forEach((node, nodeIndex) => {
      positions.push({
        id: node.id,
        x: layerWidth * (nodeIndex + 1),
        y: layerHeight * (layerIndex + 1)
      });
    });
  });
  
  return positions;
}
```

---

## Exemplos de Uso

### cURL

**Listar dependências:**
```bash
curl http://localhost:3000/api/services/clxxx123/dependencies
```

**Adicionar dependência:**
```bash
curl -X POST http://localhost:3000/api/services/clxxx123/dependencies \
  -H "Content-Type: application/json" \
  -d '{
    "dependencyId": "clxxx456",
    "type": "required",
    "description": "Banco de dados principal"
  }'
```

**Remover dependência:**
```bash
curl -X DELETE http://localhost:3000/api/services/clxxx123/dependencies/dep123
```

**Obter grafo completo:**
```bash
curl http://localhost:3000/api/services/dependencies/graph
```

### JavaScript

```javascript
// Adicionar dependência
const response = await fetch('http://localhost:3000/api/services/api-id/dependencies', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dependencyId: 'db-id',
    type: 'required',
    description: 'Banco de dados principal'
  })
});

if (response.ok) {
  const dependency = await response.json();
  console.log('Dependência criada:', dependency);
} else {
  const error = await response.json();
  console.error('Erro:', error.error);
}

// Obter grafo
const graph = await fetch('http://localhost:3000/api/services/dependencies/graph');
const data = await graph.json();
console.log(`Total de dependências: ${data.stats.totalDependencies}`);
```

### Python

```python
import requests

# Adicionar dependência
response = requests.post(
    'http://localhost:3000/api/services/api-id/dependencies',
    json={
        'dependencyId': 'db-id',
        'type': 'required',
        'description': 'Banco de dados principal'
    }
)

if response.status_code == 201:
    dependency = response.json()
    print(f"Dependência criada: {dependency['id']}")
elif response.status_code == 400:
    error = response.json()
    print(f"Erro: {error['error']}")

# Obter grafo
graph = requests.get('http://localhost:3000/api/services/dependencies/graph')
data = graph.json()
print(f"Serviços: {data['stats']['totalServices']}")
print(f"Dependências: {data['stats']['totalDependencies']}")
```

---

## Casos de Uso

### 1. Arquitetura de Microsserviços

```
API Gateway (Layer 0)
├── Auth Service (Layer 1)
├── User Service (Layer 1)
│   └── Database (Layer 2)
└── Payment Service (Layer 1)
    ├── Database (Layer 2)
    └── Queue (Layer 2)
```

**Configuração:**
```bash
# API Gateway depende de Auth
POST /api/services/gateway-id/dependencies
{"dependencyId": "auth-id", "type": "required"}

# API Gateway depende de User
POST /api/services/gateway-id/dependencies
{"dependencyId": "user-id", "type": "required"}

# User Service depende de Database
POST /api/services/user-id/dependencies
{"dependencyId": "db-id", "type": "required"}
```

### 2. Sistema SEFA (Governo do Pará)

```
Load Balancer
├── Web Server 1
│   ├── App Backend
│   │   ├── Oracle Database
│   │   └── Redis Cache (optional)
│   └── File Storage
└── Web Server 2
    └── ... (espelhado)
```

### 3. Stack Web Moderna

```
Frontend (React)
└── API REST
    ├── PostgreSQL (required)
    ├── Redis (optional)
    └── S3 Storage (required)
```

---

## Schema Prisma

```prisma
model ServiceDependency {
  id            String   @id @default(cuid())
  serviceId     String
  dependencyId  String
  
  service       Service  @relation("ServiceDependencies", fields: [serviceId], references: [id], onDelete: Cascade)
  dependency    Service  @relation("DependentServices", fields: [dependencyId], references: [id], onDelete: Cascade)
  
  type          String   @default("required") // "required" | "optional"
  description   String?
  createdAt     DateTime @default(now())

  @@unique([serviceId, dependencyId])
  @@index([serviceId])
  @@index([dependencyId])
}
```

---

**Veja também:**
- [Services API](./SERVICES_API.md) - CRUD de serviços
- [Dependencies Guide](../guides/DEPENDENCIES_GUIDE.md) - Guia do usuário
- [Grafana Dashboard](../guides/GRAFANA_SETUP.md) - Monitorar dependências
