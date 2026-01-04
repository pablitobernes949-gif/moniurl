# 📡 Service Monitoring System

> Sistema completo de monitoramento de serviços em tempo real com dashboard interativo, sistema de dependências, alertas inteligentes e integração com Grafana.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.2-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## 🌟 Destaques

✨ **Monitoramento em Tempo Real** - Verificações automáticas a cada minuto  
🎯 **Múltiplos Tipos** - HTTP/HTTPS, Ping ICMP, TCP  
🔔 **Alertas Inteligentes** - Notificações via Webhook (Slack, Discord, Teams)  
🔗 **Sistema de Dependências** - Grafo visual de relações entre serviços  
📊 **Integração Grafana** - Métricas em JSON e Prometheus  
📈 **Análise de Tendências** - ML para detecção de anomalias  
📝 **Relatórios** - Exportação em CSV/PDF  
🎨 **Design Responsivo** - Mobile → Desktop → 4K  
⚡ **Alta Performance** - Next.js com Turbopack  
🐳 **Docker Ready** - Deploy simplificado  

---

## 📸 Screenshots

```
┌─────────────────────────────────────────────────┐
│  📡 Service Monitoring System      [+] [≡] 🌙  │
├─────────────────────────────────────────────────┤
│  🟢 12 Online  🔴 1 Offline  🟡 0 Degraded     │
│  📊 Uptime Geral: 99.2%  ⏱️ Avg: 145ms         │
├─────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ API REST │  │ Database │  │ Cache    │      │
│  │ 🟢 120ms │  │ 🔴 ---   │  │ 🟢 5ms   │      │
│  │ 99.95%   │  │ 98.50%   │  │ 99.99%   │      │
│  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Início Rápido

### Instalação (2 minutos)

```bash
# 1. Clone o repositório
git clone <repository-url>
cd service-monitoring-system

# 2. Instale dependências
npm install

# 3. Configure banco de dados
npx prisma db push

# 4. Inicie o servidor
npm run dev
```

**Acesse:** http://localhost:3000

### Primeiro Uso

1. **Adicionar Serviço**: Clique no botão **"+"**
2. **Visualizar Status**: Cards mostram status em tempo real
3. **Ver Detalhes**: Clique no card para gráficos e histórico
4. **Configurar Alertas**: Menu → Configurar Webhooks

---

## 📦 Funcionalidades Completas

### 🔍 Monitoramento

| Tipo | Descrição | Métricas |
|------|-----------|----------|
| **HTTP/HTTPS** | Verifica endpoints REST/GraphQL | Status code, latência, conteúdo |
| **Ping ICMP** | Testa conectividade de rede | Latência, packet loss |
| **TCP** | Verifica portas abertas | Tempo de conexão |

### 🔔 Alertas Avançados

- ✅ Regras configuráveis (offline, latência, taxa de falhas)
- ✅ Notificações via Webhook (Slack, Discord, Teams, custom)
- ✅ Histórico completo de alertas
- ✅ Cascata automática (dependências offline)
- ✅ Severidade (critical, warning, info)

### 🔗 Sistema de Dependências

```
Load Balancer
├── Web Server 1
│   ├── API Backend (obrigatória)
│   │   ├── Database (obrigatória)
│   │   └── Redis Cache (opcional)
│   └── File Storage (obrigatória)
└── Web Server 2
    └── ... (espelhado)
```

**Funcionalidades:**
- Criar relações entre serviços (obrigatória/opcional)
- Visualização em grafo interativo (canvas)
- Detecção de dependências circulares
- Análise de impacto (quantos serviços afetados)
- Alertas em cascata

### 📊 Integração Grafana

Expõe métricas em múltiplos formatos:

**JSON Datasource:**
```bash
GET /api/metrics/json
```

**Prometheus Format:**
```bash
GET /api/metrics/prometheus
```

**Query Endpoint (Timeseries):**
```bash
POST /api/metrics/query
```

**Dashboard incluso:** `grafana-dashboard.json`

### 📈 Análise de Tendências

- Detecção automática de padrões
- Previsão de falhas (ML)
- Identificação de anomalias
- Análise de horários de pico

### 📝 Relatórios

Exportação em CSV/PDF com:
- Estatísticas agregadas (uptime, latência)
- Histórico de verificações
- Alertas disparados
- Incidentes (períodos offline)
- Compliance SLA

### 🎨 Interface

- **Dashboard responsivo** (mobile → 4K)
- **Cards de serviço** com métricas em tempo real
- **Gráficos interativos** (Recharts)
- **Tema claro/escuro**
- **Grid adaptativo** (1→2→3→4 colunas)

---

## 🏗️ Arquitetura

### Estrutura de Pastas

```
service-monitoring-system/
├── 📂 app/                      # Next.js App Router
│   ├── 📂 api/                  # API Routes
│   │   ├── 📂 services/         # CRUD de serviços
│   │   ├── 📂 metrics/          # Métricas (Grafana)
│   │   └── 📂 alerts/           # Sistema de alertas
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── 📂 components/               # React Components
│   ├── 📂 modals/              # Diálogos (9 componentes)
│   ├── 📂 panels/              # Painéis fixos (3)
│   ├── 📂 cards/               # Cards de info (3)
│   ├── 📂 charts/              # Gráficos (2)
│   ├── 📂 providers/           # Context Providers (2)
│   ├── 📂 ui/                  # shadcn/ui base
│   └── monitoring-dashboard.tsx
│
├── 📂 lib/                      # Business Logic
│   ├── monitoring.ts            # Motor de monitoramento
│   ├── realtime.ts              # Sincronização tempo real
│   ├── aws-realtime.ts          # Integração AWS
│   ├── types.ts                 # TypeScript types
│   └── utils.ts
│
├── 📂 prisma/                   # Database ORM
│   └── schema.prisma            # Modelos (Service, ServiceCheck, Alert, ServiceDependency)
│
├── 📂 docs/                     # Documentação
│   ├── 📂 guides/              # Guias do usuário
│   │   ├── GETTING_STARTED.md
│   │   ├── DEPENDENCIES_GUIDE.md
│   │   ├── GRAFANA_SETUP.md
│   │   └── RESPONSIVIDADE.md
│   ├── 📂 api/                 # Docs de API
│   │   ├── SERVICES_API.md
│   │   ├── METRICS_API.md
│   │   └── DEPENDENCIES_API.md
│   ├── PROJECT_STRUCTURE.md
│   ├── README_AWS.md
│   └── README_EC2_DEPLOY.md
│
├── 📂 public/                   # Assets estáticos
├── 📂 hooks/                    # React hooks
└── 📄 package.json
```

**Veja:** [Documentação Completa da Estrutura](./docs/PROJECT_STRUCTURE.md)

### Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Framework** | Next.js | 16.0.10 |
| **UI Library** | React | 19.2.0 |
| **Language** | TypeScript | 5.0+ |
| **ORM** | Prisma | 6.2.1 |
| **Database** | SQLite | 3.0 |
| **Styling** | Tailwind CSS | 4.1.9 |
| **Components** | shadcn/ui | Latest |
| **Charts** | Recharts | 2.15.4 |
| **Icons** | Lucide React | 0.454.0 |

---

## 📚 Documentação

### 📖 Guias do Usuário

- [🚀 Getting Started](./docs/guides/GETTING_STARTED.md) - Primeiros passos (5 min)
- [🔗 Dependencies Guide](./docs/guides/DEPENDENCIES_GUIDE.md) - Sistema de dependências
- [📊 Grafana Setup](./docs/guides/GRAFANA_SETUP.md) - Integração completa
- [📱 Responsividade](./docs/guides/RESPONSIVIDADE.md) - Design responsivo

### 🌐 API Reference

- [Services API](./docs/api/SERVICES_API.md) - CRUD de serviços
- [Metrics API](./docs/api/METRICS_API.md) - Integração Grafana
- [Dependencies API](./docs/api/DEPENDENCIES_API.md) - Gerenciamento de dependências

### 🚀 Deploy

- [Deploy AWS](./docs/README_AWS.md) - Deploy na AWS
- [Deploy EC2](./docs/README_EC2_DEPLOY.md) - Deploy manual no EC2
- [Docker Setup](#-docker) - Containerização

---

## 🔌 API Endpoints

### Serviços

```bash
# Listar todos
GET /api/services

# Criar novo
POST /api/services
Body: {"name": "API", "url": "https://...", "type": "http"}

# Detalhes
GET /api/services/:id

# Verificar agora
POST /api/services/:id/check

# Histórico
GET /api/services/:id/history?limit=100&period=24h

# Estatísticas
GET /api/services/:id/stats?period=7d

# Eventos
GET /api/services/:id/events
```

### Dependências

```bash
# Listar dependências
GET /api/services/:id/dependencies

# Adicionar
POST /api/services/:id/dependencies
Body: {"dependencyId": "xxx", "type": "required"}

# Remover
DELETE /api/services/:id/dependencies/:depId

# Grafo completo
GET /api/services/dependencies/graph
```

### Métricas

```bash
# JSON
GET /api/metrics/json

# Prometheus
GET /api/metrics/prometheus

# Por serviço
GET /api/metrics/services/:id?period=24h

# Comparar
GET /api/metrics/services/compare?ids=id1,id2,id3
```

**Veja:** [API Reference Completa](./docs/api/)

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

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./prisma:/app/prisma
    environment:
      - NODE_ENV=production
```

---

## ☁️ Deploy

### Vercel (Recomendado - 1 clique)

```bash
npm install -g vercel
vercel login
vercel --prod
```

### AWS EC2

```bash
# Veja guia completo
cat docs/README_EC2_DEPLOY.md
```

### Manual (VPS/Dedicated)

```bash
# 1. Build
npm run build

# 2. Start
npm run start

# 3. Process Manager (PM2)
npm install -g pm2
pm2 start npm --name "monitoring" -- start
pm2 save
```

---

## 🛠️ Desenvolvimento

### Scripts

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # Build produção
npm run start        # Start produção
npm run lint         # Lint código
npx prisma studio    # Database GUI
npx prisma db push   # Atualizar schema
npx prisma generate  # Regenerar Prisma Client
```

### Adicionar Componente shadcn/ui

```bash
npx shadcn@latest add <component-name>
```

### Estrutura de Componente

```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  title: string
}

export function MyComponent({ title }: Props) {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={() => setCount(count + 1)}>
        Clicks: {count}
      </Button>
    </div>
  )
}
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📋 Roadmap

- [x] Monitoramento básico (HTTP, Ping, TCP)
- [x] Dashboard responsivo
- [x] Sistema de alertas
- [x] Integração Grafana
- [x] Sistema de dependências
- [x] Análise de tendências
- [x] Relatórios CSV/PDF
- [ ] Autenticação e usuários
- [ ] Multi-tenancy
- [ ] Mobile app
- [ ] IA preditiva avançada
- [ ] Integração Slack nativa
- [ ] API pública com rate limiting

---

## 🐛 Problemas Comuns

### Porta 3000 em uso

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Prisma Client Error

```bash
npx prisma generate
npx prisma db push
```

### Build Error

```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](./LICENSE) para detalhes.

---

## 👨‍💻 Autor

**SEFA - Secretaria da Fazenda do Pará**

Desenvolvido com ❤️ usando Next.js, React e TypeScript.

---

## 📞 Suporte

- 📖 [Documentação Completa](./docs/)
- 🐛 [Reportar Bug](https://github.com/...)
- 💡 [Solicitar Feature](https://github.com/...)
- 📧 Email: suporte@sefa.pa.gov.br

---

**⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!**
