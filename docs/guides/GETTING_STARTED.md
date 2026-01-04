# 📘 Getting Started - Service Monitoring System

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ (recomendado: 20+)
- npm, pnpm ou yarn
- Porta 3000 disponível

### Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd service-monitoring-system

# Instale dependências
npm install
# ou
pnpm install

# Configure banco de dados
npx prisma db push

# Inicie em modo desenvolvimento
npm run dev
```

Acesse: **http://localhost:3000**

---

## 📖 O que é o Sistema?

Sistema completo de monitoramento de serviços com:

✅ **Monitoramento em tempo real** - Verificações automáticas a cada minuto  
✅ **Múltiplos tipos** - HTTP/HTTPS, Ping ICMP, TCP  
✅ **Alertas inteligentes** - Notificações por webhook  
✅ **Dependências** - Grafo visual de relações entre serviços  
✅ **Métricas** - Integração com Grafana (JSON + Prometheus)  
✅ **Relatórios** - Exportação CSV/PDF  
✅ **Histórico** - Últimas 24h, 7d, 30d  
✅ **Trends** - Análise de tendências com ML  
✅ **Comparação** - Compare múltiplos serviços  
✅ **Responsivo** - Mobile → Desktop → 4K  

---

## 🎯 Primeiro Acesso

### 1. Adicionar Serviço

Clique no botão **"+"** no canto superior direito:

```
Nome: Minha API
URL: https://api.example.com/health
Tipo: HTTP
Intervalo: 60 segundos
```

### 2. Visualizar Status

O card do serviço mostra:
- 🟢 **Status**: Online/Offline/Degraded
- ⏱️ **Tempo de resposta**: Latência em ms
- 📊 **Uptime**: Porcentagem de disponibilidade
- 🔔 **Alertas**: Notificações ativas

### 3. Ver Detalhes

Clique no card para abrir modal com:
- Gráfico de latência (últimas 24h)
- Histórico de verificações
- Estatísticas detalhadas
- Últimos eventos

---

## 🔧 Funcionalidades

### Monitoramento Básico

**Tipos de verificação:**
- **HTTP/HTTPS**: Status code, tempo de resposta, conteúdo
- **Ping ICMP**: Conectividade de rede, latência
- **TCP**: Porta aberta, tempo de conexão

**Métricas coletadas:**
- Response time (latência)
- Status code
- Uptime (%)
- Total de verificações
- Taxa de falhas

### Alertas

**Regras de alerta:**
1. Serviço offline por X verificações consecutivas
2. Tempo de resposta acima de X ms
3. Taxa de falhas acima de X%
4. Dependência crítica offline

**Notificações:**
- Webhook (Slack, Discord, Teams)
- Registro no histórico
- Badge visual no dashboard

**Configurar webhook:**
```
Menu do serviço → Configurar Webhooks
URL: https://hooks.slack.com/services/...
Eventos: [ ] Offline  [ ] Online  [ ] Degraded
```

### Dependências

**Criar relação:**
```
Menu do serviço → Dependências → Adicionar
Dependência: Banco de Dados
Tipo: Obrigatória
Descrição: Banco de dados principal
```

**Visualizar grafo:**
```
Botão "Diagrama" no header → Ver grafo completo
- Zoom: Botões + / -
- Detalhes: Clique em nó
- Cores: Verde (online), Vermelho (offline)
```

**Impacto de dependências:**
- Dependência obrigatória offline → Serviço marcado como "degraded"
- Alerta automático informando dependência problemática
- Cálculo de impacto downstream (quantos serviços afetados)

### Relatórios

**Gerar relatório:**
```
Botão "Relatórios" no header → Configurar
Período: Últimas 24 horas
Formato: CSV
Incluir: [ ] Histórico  [ ] Estatísticas  [ ] Alertas
```

**Conteúdo:**
- Estatísticas gerais (uptime, avg response time)
- Histórico de verificações
- Alertas disparados
- Incidentes (períodos offline)
- SLA compliance

### Comparação de Serviços

**Comparar múltiplos:**
```
Selecione serviços → Botão "Comparar"
Métricas: Response Time, Uptime, Falhas
Período: 7 dias
```

**Gráficos:**
- Linha do tempo comparativa
- Médias lado a lado
- Percentis (P50, P95, P99)

### Trends (Tendências)

**Análise preditiva:**
- Detecção de padrões
- Previsão de falhas
- Anomalias
- Horários de pico

**Dashboard de trends:**
```
Painel lateral → Trends
- 📈 Tendência de uptime
- ⚠️ Anomalias detectadas
- 🔮 Previsões próximas 24h
```

---

## 🎨 Interface

### Dashboard Principal

```
┌─────────────────────────────────────────────────┐
│  Service Monitoring System          [+ ] [≡]    │
├─────────────────────────────────────────────────┤
│  🟢 12 Online  🔴 1 Offline  🟡 0 Degraded      │
│  📊 Uptime Geral: 99.2%                         │
├─────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ API 1    │  │ Database │  │ Cache    │      │
│  │ 🟢 120ms │  │ 🔴 0ms   │  │ 🟢 5ms   │      │
│  │ 99.95%   │  │ 98.5%    │  │ 99.99%   │      │
│  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────┘
```

### Card de Serviço

```
┌──────────────────────────┐
│ API Principal       [⋮]  │
│ 🟢 Online               │
│                          │
│ ⏱️  120 ms               │
│ 📊 99.95% uptime         │
│ 🔔 0 alertas ativos      │
│                          │
│ [Verificar Agora]        │
└──────────────────────────┘
```

### Menu de Ações

```
⋮
├─ Ver Detalhes
├─ Verificar Agora
├─ Dependências
├─ Configurar Webhooks
├─ Histórico de Alertas
├─ Configurações
└─ Remover
```

---

## 📊 Integração Grafana

### Setup Rápido

**1. Instalar Grafana:**
```bash
# Docker
docker run -d -p 3001:3000 grafana/grafana

# Acesse: http://localhost:3001
# Login: admin/admin
```

**2. Adicionar Datasource:**

**Opção A - JSON Datasource:**
```
1. Plugins → Search → "SimpleJson"
2. Data Sources → Add → SimpleJson
3. URL: http://localhost:3000/api/metrics
4. Save & Test
```

**Opção B - Prometheus:**
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'monitoring'
    scrape_interval: 30s
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics/prometheus'
```

**3. Importar Dashboard:**
```
Dashboards → Import → Upload JSON
Arquivo: grafana-dashboard.json
Datasource: <selecione>
```

### Queries Úteis (PromQL)

```promql
# Taxa de sucesso
100 * (1 - (rate(system_checks_failed[5m]) / rate(system_checks_total[5m])))

# Tempo médio por serviço
avg by (service) (service_response_time)

# Serviços offline
count(service_status == 0)

# Uptime mínimo
min(service_uptime)
```

---

## 🔌 API Endpoints

### Serviços

```bash
# Listar
GET /api/services

# Criar
POST /api/services
{"name": "API", "url": "https://...", "type": "http"}

# Detalhes
GET /api/services/:id

# Verificar agora
POST /api/services/:id/check

# Histórico
GET /api/services/:id/history?limit=100

# Estatísticas
GET /api/services/:id/stats?period=24h
```

### Métricas

```bash
# JSON
GET /api/metrics/json

# Prometheus
GET /api/metrics/prometheus

# Por serviço
GET /api/metrics/services/:id
```

### Dependências

```bash
# Listar
GET /api/services/:id/dependencies

# Adicionar
POST /api/services/:id/dependencies
{"dependencyId": "xxx", "type": "required"}

# Remover
DELETE /api/services/:id/dependencies/:depId

# Grafo completo
GET /api/services/dependencies/graph
```

---

## 🐳 Docker

### Build

```bash
docker build -t monitoring-system .
```

### Run

```bash
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/prisma:/app/prisma \
  --name monitoring \
  monitoring-system
```

### Docker Compose

```bash
docker-compose up -d
```

---

## ☁️ Deploy

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel login
vercel --prod
```

### AWS EC2

Veja: [Deploy EC2 Guide](../DEPLOY_EC2.md)

### Manual

Veja: [Deploy Manual Guide](../DEPLOY_MANUAL.md)

---

## 🛠️ Desenvolvimento

### Estrutura

```
app/          # Next.js routes
components/   # React components
lib/          # Business logic
prisma/       # Database schema
docs/         # Documentation
```

### Scripts

```bash
npm run dev          # Development
npm run build        # Production build
npm run start        # Start production
npm run lint         # Lint code
npx prisma studio    # Database GUI
npx prisma db push   # Update database
```

### Adicionar Componente

```bash
# shadcn/ui component
npx shadcn@latest add <component>

# Custom component
touch components/my-component.tsx
```

---

## 📚 Próximos Passos

1. ✅ **Configurar primeiro serviço**
2. ✅ **Configurar webhooks** para notificações
3. ✅ **Criar dependências** para mapear arquitetura
4. ✅ **Integrar Grafana** para dashboards avançados
5. ✅ **Configurar alertas** personalizados
6. ✅ **Explorar relatórios** e exports
7. ✅ **Deploy em produção**

---

## 🆘 Problemas Comuns

### Erro "EADDRINUSE"
```bash
# Porta 3000 em uso
lsof -ti:3000 | xargs kill -9
```

### Prisma Client Error
```bash
# Regenerar Prisma Client
npx prisma generate
```

### Build Error
```bash
# Limpar cache
rm -rf .next node_modules
npm install
npm run build
```

---

## 📖 Documentação Completa

- [Project Structure](../PROJECT_STRUCTURE.md) - Estrutura de pastas
- [Dependencies Guide](./DEPENDENCIES_GUIDE.md) - Sistema de dependências
- [Grafana Setup](./GRAFANA_SETUP.md) - Integração completa
- [Services API](../api/SERVICES_API.md) - API de serviços
- [Metrics API](../api/METRICS_API.md) - API de métricas
- [Dependencies API](../api/DEPENDENCIES_API.md) - API de dependências

---

**Precisa de ajuda?** Abra uma issue no repositório ou consulte a documentação completa.
