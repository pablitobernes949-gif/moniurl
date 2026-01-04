# 📁 Estrutura do Projeto - Service Monitoring System

## 🗂️ Organização de Pastas

```
service-monitoring-system/
├── 📂 app/                      # Next.js App Router
│   ├── 📂 api/                  # API Routes
│   │   ├── 📂 services/         # Endpoints de serviços
│   │   ├── 📂 metrics/          # Endpoints de métricas (Grafana)
│   │   ├── 📂 alerts/           # Endpoints de alertas
│   │   └── 📂 reports/          # Endpoints de relatórios
│   ├── globals.css              # Estilos globais
│   ├── layout.tsx               # Layout raiz
│   └── page.tsx                 # Página principal
│
├── 📂 components/               # Componentes React
│   ├── 📂 modals/              # Modais/Diálogos
│   │   ├── add-service-dialog.tsx
│   │   ├── service-details-modal.tsx
│   │   ├── service-dependencies-modal.tsx
│   │   ├── dependency-graph-modal.tsx
│   │   ├── comparison-chart-modal.tsx
│   │   ├── webhook-settings-dialog.tsx
│   │   ├── reports-settings-dialog.tsx
│   │   ├── service-settings-dialog.tsx
│   │   └── alert-history-dialog.tsx
│   │
│   ├── 📂 panels/              # Painéis laterais/fixos
│   │   ├── alerts-panel.tsx
│   │   ├── trends-dashboard.tsx
│   │   └── incident-history.tsx
│   │
│   ├── 📂 cards/               # Cards de visualização
│   │   ├── service-card.tsx
│   │   ├── service-stats.tsx
│   │   └── sla-metrics.tsx
│   │
│   ├── 📂 charts/              # Gráficos e visualizações
│   │   ├── service-chart.tsx
│   │   └── service-details-chart.tsx
│   │
│   ├── 📂 forms/               # Formulários e inputs
│   │   └── (componentes de formulário)
│   │
│   ├── 📂 providers/           # Context Providers
│   │   ├── theme-provider.tsx
│   │   └── theme-provider-enhanced.tsx
│   │
│   ├── 📂 ui/                  # Componentes UI base (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   │
│   ├── monitoring-dashboard.tsx  # Dashboard principal
│   ├── alert-indicator.tsx       # Indicadores
│   └── theme-toggle.tsx          # Toggle de tema
│
├── 📂 lib/                      # Bibliotecas e utilitários
│   ├── monitoring.ts            # Lógica de monitoramento
│   ├── realtime.ts              # Sistema tempo real
│   ├── aws-realtime.ts          # Integração AWS
│   ├── types.ts                 # TypeScript types
│   └── utils.ts                 # Funções utilitárias
│
├── 📂 prisma/                   # Prisma ORM
│   ├── schema.prisma            # Schema do banco
│   └── prisma/                  # Banco SQLite
│       └── monitoring.db
│
├── 📂 docs/                     # Documentação
│   ├── 📂 guides/              # Guias do usuário
│   │   ├── GETTING_STARTED.md
│   │   ├── DEPENDENCIES_GUIDE.md
│   │   ├── GRAFANA_SETUP.md
│   │   └── RESPONSIVIDADE.md
│   │
│   ├── 📂 api/                 # Documentação de API
│   │   ├── services-api.md
│   │   ├── metrics-api.md
│   │   └── alerts-api.md
│   │
│   ├── README_DEPLOY.md        # Guias de deploy
│   ├── DEPLOY_MANUAL.md
│   ├── DEPLOY_EC2.md
│   └── README_AWS.md
│
├── 📂 public/                   # Arquivos estáticos
│   └── logo-para.svg
│
├── 📂 hooks/                    # React hooks customizados
│   ├── use-mobile.ts
│   └── use-toast.ts
│
├── 📂 styles/                   # Estilos adicionais
│   └── globals.css
│
├── 📄 package.json              # Dependências npm
├── 📄 tsconfig.json             # Config TypeScript
├── 📄 next.config.mjs           # Config Next.js
├── 📄 tailwind.config.ts        # Config Tailwind
├── 📄 components.json           # Config shadcn/ui
├── 📄 .env                      # Variáveis de ambiente
├── 📄 Dockerfile                # Config Docker
├── 📄 docker-compose.yml        # Docker Compose
├── 📄 grafana-dashboard.json    # Dashboard Grafana
└── 📄 README.md                 # Documentação principal
```

## 📚 Descrição das Pastas

### `/app` - Aplicação Next.js
Estrutura do Next.js 14+ com App Router. Contém rotas, layouts e API endpoints.

**Subpastas:**
- `api/services/` - CRUD de serviços, verificações, histórico
- `api/metrics/` - Exposição de métricas para Grafana (JSON/Prometheus)
- `api/alerts/` - Sistema de alertas e notificações
- `api/reports/` - Geração de relatórios

### `/components` - Componentes React

#### `modals/` - Diálogos e Modais
Componentes que abrem sobre a interface principal:
- **add-service-dialog**: Adicionar novo serviço
- **service-details-modal**: Detalhes completos do serviço
- **service-dependencies-modal**: Gerenciar dependências
- **dependency-graph-modal**: Visualização em grafo
- **comparison-chart-modal**: Comparar múltiplos serviços
- **webhook-settings-dialog**: Configurar webhooks
- **reports-settings-dialog**: Configurar relatórios
- **service-settings-dialog**: Configurações avançadas
- **alert-history-dialog**: Histórico de alertas

#### `panels/` - Painéis Fixos
Componentes de visualização permanente:
- **alerts-panel**: Painel de alertas ativos
- **trends-dashboard**: Dashboard de tendências
- **incident-history**: Histórico de incidentes

#### `cards/` - Cards de Informação
Componentes de cartão/card:
- **service-card**: Card de serviço individual
- **service-stats**: Estatísticas gerais
- **sla-metrics**: Métricas de SLA

#### `charts/` - Gráficos
Visualizações de dados:
- **service-chart**: Gráfico de latência/histórico
- **service-details-chart**: Gráfico detalhado

#### `forms/` - Formulários
Componentes de entrada de dados

#### `providers/` - Context Providers
Provedores de contexto React:
- **theme-provider**: Tema claro/escuro
- **theme-provider-enhanced**: Tema avançado

#### `ui/` - Componentes Base
Componentes shadcn/ui (botões, cards, dialogs, etc.)

### `/lib` - Bibliotecas
Lógica de negócio e utilitários:
- **monitoring.ts**: Motor de monitoramento (ping, HTTP checks)
- **realtime.ts**: Sincronização em tempo real
- **aws-realtime.ts**: Integração com AWS (DynamoDB, SNS)
- **types.ts**: Definições TypeScript
- **utils.ts**: Funções auxiliares

### `/prisma` - Banco de Dados
ORM Prisma com SQLite:
- **schema.prisma**: Definição de tabelas
- **monitoring.db**: Banco de dados SQLite

Modelos:
- `Service` - Serviços monitorados
- `ServiceCheck` - Verificações realizadas
- `Alert` - Alertas gerados
- `AlertRule` - Regras de alerta
- `ServiceDependency` - Dependências entre serviços

### `/docs` - Documentação

#### `guides/` - Guias do Usuário
- **GETTING_STARTED.md**: Primeiros passos
- **DEPENDENCIES_GUIDE.md**: Sistema de dependências
- **GRAFANA_SETUP.md**: Integração Grafana
- **RESPONSIVIDADE.md**: Design responsivo

#### `api/` - Documentação de API
- **services-api.md**: Endpoints de serviços
- **metrics-api.md**: Endpoints de métricas
- **alerts-api.md**: Endpoints de alertas

### `/public` - Arquivos Estáticos
Assets públicos (imagens, ícones, etc.)

### `/hooks` - React Hooks
Hooks React customizados reutilizáveis

## 🔄 Fluxo de Dados

```
┌─────────────────┐
│  Browser/Client │
└────────┬────────┘
         │
         ↓
┌─────────────────────┐
│  monitoring-dashboard│ ← Componente principal
└────────┬────────────┘
         │
         ├─→ service-card ─→ modals/* (detalhes, config)
         │
         ├─→ panels/* (alertas, trends)
         │
         └─→ API Routes (/api/*)
                 │
                 ├─→ lib/monitoring.ts (lógica de ping/check)
                 │
                 ├─→ prisma (banco de dados)
                 │
                 └─→ lib/realtime.ts (sincronização)
```

## 📦 Dependências Principais

```json
{
  "next": "16.0.10",
  "react": "19.2.0",
  "prisma": "^6.2.1",
  "@prisma/client": "^6.2.1",
  "recharts": "2.15.4",
  "lucide-react": "^0.454.0",
  "tailwindcss": "^4.1.9"
}
```

## 🚀 Scripts Disponíveis

```bash
npm run dev        # Servidor de desenvolvimento
npm run build      # Build produção
npm run start      # Iniciar produção
npm run lint       # Linter
npx prisma db push # Atualizar banco de dados
npx prisma studio  # Interface gráfica do banco
```

## 🎨 Convenções de Código

### Nomenclatura
- **Componentes**: PascalCase (`ServiceCard.tsx`)
- **Utilitários**: camelCase (`monitoring.ts`)
- **Tipos**: PascalCase com sufixo (`ServiceType`, `AlertRule`)
- **Constantes**: UPPER_SNAKE_CASE

### Estrutura de Componente
```tsx
"use client" // Se necessário

import { ... } from "..." // Imports externos
import { ... } from "@/..." // Imports internos

interface ComponentProps {
  // Props tipadas
}

export function Component({ props }: ComponentProps) {
  // Hooks
  const [state, setState] = useState()
  
  // Funções
  const handleAction = () => {}
  
  // Render
  return (...)
}
```

### API Routes
```typescript
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

export async function GET(request: Request) {
  try {
    // Lógica
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}
```

## 📖 Mais Documentação

- [Getting Started](./guides/GETTING_STARTED.md)
- [Dependências](./guides/DEPENDENCIES_GUIDE.md)
- [Grafana Setup](./guides/GRAFANA_SETUP.md)
- [Deploy AWS](./DEPLOY_AWS.md)
- [Deploy Manual](./DEPLOY_MANUAL.md)

## 🔗 Links Úteis

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Última atualização**: 03/01/2026  
**Versão**: 2.0  
**Mantenedor**: GitHub Copilot
