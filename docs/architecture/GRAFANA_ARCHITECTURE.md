# 🏗️ Arquitetura da Integração com Grafana

## 📊 Visão Geral

```
┌─────────────────────────────────────────────────────────────────────┐
│                          GRAFANA DASHBOARD                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Latência   │  │   Status     │  │   Uptime     │  14 Painéis │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Packet Loss  │  │ Taxa Sucesso │  │   Alertas    │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
                              ↑ ↑ ↑
                              │ │ │
        ┌─────────────────────┘ │ └─────────────────────┐
        │                       │                       │
   ┌────▼─────┐           ┌────▼─────┐           ┌────▼─────┐
   │Prometheus│           │SimpleJSON│           │Annotations│
   │  Data    │           │   Data   │           │   Events  │
   │  Source  │           │  Source  │           │  Source   │
   └────┬─────┘           └────┬─────┘           └────┬─────┘
        │                      │                       │
        │                      │                       │
        └──────────────┬───────┴───────┬───────────────┘
                       │               │
                       ▼               ▼
          ┌────────────────────────────────────────┐
          │       NEXT.JS API ROUTES               │
          │                                        │
          │  /api/grafana/prometheus     (GET)    │
          │  /api/grafana/query          (POST)   │
          │  /api/grafana/search         (POST)   │
          │  /api/grafana/annotations    (POST)   │
          └────────────────┬───────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────────────┐
          │        LIB/ BACKEND MODULES            │
          │                                        │
          │  ┌────────────┐    ┌────────────┐     │
          │  │  Database  │    │ Monitoring │     │
          │  │    Layer   │◄───┤   Worker   │     │
          │  └──────┬─────┘    └────────────┘     │
          │         │                              │
          └─────────┼──────────────────────────────┘
                    │
                    ▼
          ┌────────────────────┐
          │   PRISMA + SQLite  │
          │                    │
          │  - Services        │
          │  - Health Checks   │
          │  - Alerts          │
          └────────────────────┘
```

## 🔄 Fluxo de Dados

### **1. Coleta de Dados**

```
Worker Thread (lib/initialization/worker.ts)
    │
    ├─► Health Check a cada 60s
    │   └─► Verifica serviços (HTTP/HTTPS)
    │       └─► Salva no banco (Prisma)
    │
    ├─► Monitora métricas
    │   └─► Latência, uptime, packet loss
    │       └─► Atualiza memória + DB
    │
    └─► Verifica alertas
        └─► Dispara se thresholds excedidos
            └─► Salva alertas no DB
```

### **2. Exportação Prometheus**

```
GET /api/grafana/prometheus
    │
    ├─► Busca serviços do Prisma
    ├─► Busca dados tempo real (memória)
    ├─► Calcula agregações
    │   ├─► Uptime %
    │   ├─► Latência média
    │   ├─► Taxa de sucesso
    │   └─► Alertas ativos
    │
    └─► Retorna 13 métricas formato Prometheus
        service_up{service_name="API"} 1
        service_latency_milliseconds{service_name="API"} 150
        service_uptime_percentage{service_name="API"} 99.5
        ...
```

### **3. Time Series Queries**

```
POST /api/grafana/query
    Body: {
      targets: [{target: "latency"}],
      range: {from: "...", to: "..."}
    }
    │
    ├─► Parse período (from/to)
    ├─► Busca checks no período
    ├─► Agrupa por serviço
    ├─► Gera séries temporais
    │   └─► [[value, timestamp], ...]
    │
    └─► Retorna [{
          target: "API - latency",
          datapoints: [[150, 1704398400000], ...]
        }]
```

### **4. Anotações de Eventos**

```
POST /api/grafana/annotations
    │
    ├─► Busca alertas no período
    ├─► Busca mudanças de status
    ├─► Detecta downtime/recovery
    │
    └─► Retorna eventos:
        {
          time: timestamp,
          title: "Downtime: API",
          text: "Service went down",
          tags: ["alert", "critical"]
        }
```

## 📈 Métricas Exportadas

### **Status e Disponibilidade**
```
service_up                    → 1=online, 0=offline
service_uptime_percentage     → 0-100%
service_status_by_type        → Agrupado por tipo
```

### **Performance**
```
service_latency_milliseconds          → Latência atual
service_latency_average_milliseconds  → Latência média
service_packet_loss_percentage        → 0-100%
service_success_rate                  → Taxa de sucesso
```

### **Monitoramento**
```
service_checks_total          → Total de checks
service_checks_success_total  → Checks OK
service_checks_failure_total  → Checks falhos
service_alerts_active         → Alertas ativos
```

### **Diagnóstico**
```
service_seconds_since_last_check  → Tempo desde último check
service_ssl_valid                 → SSL válido (HTTPS)
```

## 🎨 Painéis do Dashboard

### **Gráficos de Linha (5)**
1. Latência por Serviço
2. Status Online/Offline
3. Uptime Percentual
4. Packet Loss
5. Taxa de Sucesso

### **Estatísticas (4)**
6. Serviços Online (contador)
7. Serviços Offline (contador)
8. Alertas Ativos (contador)
9. Total de Checks (contador)

### **Visualizações Avançadas (5)**
10. Tabela de Resumo
11. Uptime por Serviço (barras)
12. Heatmap de Latência
13. Latência Média (time series)
14. Lista de Alertas

## 🔌 Data Sources

### **Prometheus**
- **Métricas instantâneas** - Estado atual
- **Agregações** - Soma, média, max, min
- **Labels** - Filtros por serviço/tipo
- **Queries PromQL** - Linguagem poderosa

### **SimpleJSON**
- **Time series** - Dados históricos
- **Search** - Busca serviços
- **Annotations** - Eventos no timeline
- **Queries flexíveis** - JSON simples

## 🔄 Atualização em Tempo Real

```
Grafana (refresh: 30s)
    │
    ├─► Polling a cada 30s
    │   ├─► Requisita Prometheus metrics
    │   ├─► Requisita Time series data
    │   └─► Requisita Annotations
    │
    ├─► Backend processa requests
    │   ├─► Lê DB (checks recentes)
    │   ├─► Lê memória (estado atual)
    │   └─► Calcula métricas
    │
    └─► Dashboard atualiza
        ├─► Redesenha gráficos
        ├─► Atualiza contadores
        └─► Mostra novos eventos
```

## 📊 Exemplo de Dados

### **Prometheus Response**
```
service_up{service_id="1",service_name="API Principal",service_url="https://api.example.com",service_type="api"} 1
service_latency_milliseconds{service_id="1",service_name="API Principal",service_url="https://api.example.com"} 150
service_uptime_percentage{service_id="1",service_name="API Principal",service_url="https://api.example.com"} 99.5
service_alerts_active{service_id="1",service_name="API Principal",service_url="https://api.example.com"} 0
```

### **Query Response**
```json
[
  {
    "target": "API Principal - latency",
    "datapoints": [
      [150, 1704398400000],
      [145, 1704398460000],
      [160, 1704398520000]
    ]
  }
]
```

### **Annotations Response**
```json
[
  {
    "time": 1704398400000,
    "title": "Downtime: API Principal",
    "text": "Service went from up to down",
    "tags": ["downtime", "api"]
  }
]
```

## 🎯 Benefícios

✅ **Visualização Unificada** - Todos os serviços em um só lugar  
✅ **Tempo Real** - Atualização a cada 30s  
✅ **Histórico Completo** - Análise de tendências  
✅ **Alertas Visuais** - Identificação rápida de problemas  
✅ **Múltiplas Métricas** - 13 indicadores diferentes  
✅ **Anotações** - Eventos marcados no timeline  
✅ **Filtros** - Por serviço, tipo, período  
✅ **Exportação** - Dados em formato padrão (Prometheus)  

## 🚀 Performance

- **API Response Time**: < 100ms
- **Data Processing**: Assíncrono
- **Cache**: Dados em memória para métricas recentes
- **Batch Queries**: Múltiplos serviços em uma query
- **Otimização DB**: Índices em timestamps

## 🔒 Segurança

- **CORS Configurado** - Headers adequados
- **Validação de Input** - Sanitização de queries
- **Rate Limiting** - Proteção contra abuso (opcional)
- **Authentication** - Grafana API Key (opcional)
