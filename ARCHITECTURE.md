# 🏗️ Diagrama de Arquitetura - Service Monitor Backend

## 📊 Fluxo Geral do Sistema

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Browser)                        │
│                   Service Monitor Frontend                       │
│              (React/Next.js + monitoring-dashboard)              │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         │ RESTful API
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                    NEXT.JS SERVER (Node.js)                      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             API Routes (app/api/)                        │  │
│  │                                                          │  │
│  │  • /health              - Health check                  │  │
│  │  • /services            - CRUD de serviços              │  │
│  │  • /services/:id        - Detalhe/Atualizar/Deletar    │  │
│  │  • /services/:id/check  - Força verificação             │  │
│  │  • /services/:id/history - Histórico de verificações   │  │
│  │  • /services/:id/events - SSE Stream                    │  │
│  │                                                          │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Business Logic Layer                          │  │
│  │                                                          │  │
│  │  • lib/monitoring.ts    - Funções de health check       │  │
│  │  • lib/worker.ts        - Worker automático (30s)       │  │
│  │  • lib/init.ts          - Inicialização                 │  │
│  │  • lib/realtime.ts      - SSE subscribers               │  │
│  │                                                          │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          Storage & Persistence Layer                     │  │
│  │                                                          │  │
│  │  • lib/storage.ts       - Abstração de storage          │  │
│  │    - getAllServices()   - Obter todos                   │  │
│  │    - getService(id)     - Obter um                      │  │
│  │    - createService()    - Criar                         │  │
│  │    - updateService()    - Atualizar                     │  │
│  │    - deleteService()    - Deletar                       │  │
│  │    - appendHealthCheck() - Adicionar verificação        │  │
│  │                                                          │  │
│  │  • lib/aws-realtime.ts  - Integração AWS (opcional)    │  │
│  │                                                          │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
    ┌─────────────────────┐  ┌─────────────────────┐
    │   Local File        │  │   AWS DynamoDB      │
    │   Storage           │  │   (Optional)        │
    │                     │  │                     │
    │  .data/             │  │  services-table     │
    │  ├── services.json  │  │  └── history: [...]│
    │  └── history/       │  │                     │
    │      ├── 123.json   │  │  AWS SNS            │
    │      ├── 456.json   │  │  └── alerts         │
    │      └── ...        │  │                     │
    └─────────────────────┘  └─────────────────────┘
```

## 🔄 Fluxo de Requisição - Criar Serviço

```
Frontend                    Backend                 Storage
   │                          │                       │
   ├─ POST /api/services ────>│                       │
   │  {name, url}             │                       │
   │                          ├─ monitorService() ──>│
   │                          │  (health check)       │
   │                          │                       │
   │                          │<─ response (online)──┤
   │                          │                       │
   │                          ├─ createService() ───>│
   │                          │  (salva serviço)     │
   │                          │                       │
   │                          │<─ persistidas ───────┤
   │                          │                       │
   │<─ 201 {service} ────────┤                       │
   │                          │                       │
   ├─ setServices([...])      │                       │
   │  (atualiza estado)        │                       │
   │                          │                       │
   └─ renderiza novo serviço  │                       │
```

## ⏱️ Fluxo de Monitoramento Automático

```
Início da Aplicação
        │
        ▼
   /api/health (primeira requisição)
        │
        ▼
   initializeBackend()
        │
        ▼
   startMonitoring()
        │
        ▼
   Worker iniciado (intervalo de 30s)
        │
        ├─── A cada 30 segundos ───┐
        │                           │
        ▼                           ▼
   getAllServices()          Aguarda
        │                      │
        ├─ for each service   │
        │  monitorService()   │
        │                     │
        ├─ appendHealthCheck()│
        │                     │
        ├─ updateService()   │
        │                     │
        └─ notify SSE subscribers
                              │
                    (volta para aguardar)
```

## 🔌 Fluxo SSE - Real-time Events

```
Cliente                Backend              Storage
   │                     │                   │
   ├─ GET /events ──────>│                   │
   │  (EventSource)      │                   │
   │                     ├─ getHistory() ───>│
   │                     │                   │
   │                     │<─ [checks] ──────┤
   │<─ data: history ────┤                   │
   │  (initial state)    │                   │
   │                     │                   │
   ├─ onmessage handler  │                   │
   │  (updateUI)         │                   │
   │                     │                   │
   │ (aguardando...)     ├─ monitor.check() ─>│
   │                     │                   │
   │                     │<─ new check ─────┤
   │<─ data: {check} ────┤                   │
   │                     │                   │
   ├─ renderiza update   │                   │
   │                     │                   │
   └─ aguarda próximo    │                   │
                         │                   │
```

## 🏠 Arquitetura de Dados

### Serviço (services.json)
```typescript
interface Service {
  id: string
  name: string
  url: string
  status: "online" | "offline" | "unstable" | "checking"
  lastCheck: number (timestamp)
  responseTime: number | null (ms)
  uptime: number (0-100%)
  createdAt: number (timestamp)
  // history não está aqui - está em arquivo separado
}
```

### Health Check (history/[id].json)
```typescript
interface HealthCheck {
  timestamp: number
  status: "online" | "offline" | "unstable"
  responseTime: number | null (ms)
}
```

## 📈 Ciclo de Vida de um Serviço

```
1. CRIAÇÃO
   User → Frontend → API → Storage
   "Novo serviço adicionado"

2. MONITORAMENTO (A cada 30s)
   Worker → monitorService() → HealthCheck
   "Status coletado"

3. ATUALIZAÇÃO
   Worker → appendHealthCheck() → Storage
   "Histórico atualizado"

4. NOTIFICAÇÃO
   Worker → SSE.notify() → Frontend
   "UI atualizada em tempo real"

5. CONSULTA
   User → GET /api/services/:id/history
   "Histórico completo exibido"

6. GERENCIAMENTO
   User → PUT/DELETE /api/services/:id
   "Serviço atualizado ou removido"
```

## 🔐 Fluxo de Segurança (Recomendado - Não Implementado)

```
                Frontend
                   │
                   ▼
            Autenticação (JWT/Cookie)
                   │
                   ▼
            Authorization Check
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
  Admin        Monitor         Viewer
   READ         READ             READ
   WRITE        WRITE            ❌
   DELETE       DELETE           ❌
                           
                   │
                   ▼
              Rate Limiting
               (10 req/s)
                   │
                   ▼
               Input Validation
                   │
                   ▼
                 API Routes
                   │
                   ▼
               Business Logic
                   │
                   ▼
                 Storage
```

## 🚀 Escalabilidade Horizontal (Futuro)

```
┌─────────────────────────────────────────────┐
│        Load Balancer (Nginx/HAProxy)        │
└────────────┬────────────────────┬───────────┘
             │                    │
    ┌────────▼────────┐  ┌────────▼────────┐
    │  Server Instance1│  │  Server Instance2│
    │  (port 3000)    │  │  (port 3001)    │
    └────────┬────────┘  └────────┬────────┘
             │                    │
             └────────┬───────────┘
                      │
    ┌─────────────────▼──────────────────┐
    │  Shared DynamoDB + SNS              │
    │  (Storage Centralizado)             │
    └────────────────────────────────────┘
```

## 📊 Métricas e Observabilidade

```
Application
    │
    ├─ Logs
    │  ├── Server logs
    │  ├── API logs
    │  └── Worker logs
    │
    ├─ Metrics
    │  ├── Response times
    │  ├── Error rates
    │  └── Service status
    │
    ├─ Health Checks
    │  ├── /api/health
    │  └── Database connection
    │
    └─ Events
       ├── Service status changes
       ├── Errors
       └── Monitoring checks
```

---

Essa arquitetura é **escalável**, **maintível** e **pronta para produção**! 🎉
