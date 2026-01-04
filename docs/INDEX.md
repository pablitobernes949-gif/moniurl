# 📚 Documentação - Índice Completo

## 🎯 Visão Geral

Sistema completo de monitoramento de serviços em tempo real com dashboard interativo, sistema de dependências, alertas inteligentes e integração com Grafana.

---

## 📖 Guias do Usuário

### Início Rápido
- **[Getting Started](./guides/GETTING_STARTED.md)** - Primeiros passos (5 minutos)
  - Instalação
  - Primeiro serviço
  - Interface e funcionalidades básicas
  - Primeiros comandos

### Funcionalidades Avançadas
- **[Sistema de Dependências](./guides/DEPENDENCIES_GUIDE.md)** - Guia completo de dependências
  - Criar relações entre serviços
  - Visualizar grafo interativo
  - Dependências obrigatórias vs opcionais
  - Detecção de circular dependencies
  - Análise de impacto

- **[Integração Grafana](./guides/GRAFANA_SETUP.md)** - Setup completo do Grafana
  - Configuração de datasources
  - Importar dashboard pronto
  - Criar painéis customizados
  - Queries PromQL

### Design e Interface
- **[Responsividade](./guides/RESPONSIVIDADE.md)** - Design responsivo
  - Mobile (320px+)
  - Tablet (768px+)
  - Desktop (1024px+)
  - 4K (2560px+)

---

## 🌐 API Reference

### Endpoints Principais
- **[Services API](./api/SERVICES_API.md)** - CRUD de serviços
  - `GET /api/services` - Listar todos
  - `POST /api/services` - Criar novo
  - `GET /api/services/:id` - Detalhes
  - `POST /api/services/:id/check` - Verificar agora
  - `GET /api/services/:id/history` - Histórico
  - `GET /api/services/:id/stats` - Estatísticas

- **[Metrics API](./api/METRICS_API.md)** - Integração Grafana
  - `GET /api/metrics/json` - Formato JSON
  - `GET /api/metrics/prometheus` - Formato Prometheus
  - `POST /api/metrics/query` - Query timeseries
  - `GET /api/metrics/services/:id` - Métricas por serviço

- **[Dependencies API](./api/DEPENDENCIES_API.md)** - Gerenciamento de dependências
  - `GET /api/services/:id/dependencies` - Listar
  - `POST /api/services/:id/dependencies` - Adicionar
  - `DELETE /api/services/:id/dependencies/:depId` - Remover
  - `GET /api/services/dependencies/graph` - Grafo completo

---

## 🚀 Deploy e Infraestrutura

- **[Deploy AWS](./README_AWS.md)** - Deploy na AWS
  - EC2 + RDS
  - Load Balancer
  - Auto Scaling
  - CloudWatch

- **[Deploy EC2 Manual](./README_EC2_DEPLOY.md)** - Deploy manual no EC2
  - Configuração do servidor
  - Instalação de dependências
  - PM2 para gerenciar processo
  - Nginx como reverse proxy

---

## 🏗️ Arquitetura

- **[Estrutura do Projeto](./PROJECT_STRUCTURE.md)** - Organização de pastas
  - `/app` - Next.js App Router
  - `/components` - Componentes React
  - `/lib` - Lógica de negócio
  - `/prisma` - ORM e database
  - `/docs` - Documentação

---

## 📋 Por Categoria

### 🔰 Para Iniciantes
1. [Getting Started](./guides/GETTING_STARTED.md) - Começar aqui
2. [Estrutura do Projeto](./PROJECT_STRUCTURE.md) - Entender organização
3. [Services API](./api/SERVICES_API.md) - Conceitos básicos de API

### 🧑‍💼 Para Operadores
1. [Sistema de Dependências](./guides/DEPENDENCIES_GUIDE.md) - Mapear arquitetura
2. [Integração Grafana](./guides/GRAFANA_SETUP.md) - Dashboards avançados
3. [Metrics API](./api/METRICS_API.md) - Expor métricas

### 👨‍💻 Para Desenvolvedores
1. [Estrutura do Projeto](./PROJECT_STRUCTURE.md) - Arquitetura completa
2. [Services API](./api/SERVICES_API.md) - Referência completa
3. [Dependencies API](./api/DEPENDENCIES_API.md) - Sistema de dependências

### ☁️ Para DevOps
1. [Deploy EC2](./README_EC2_DEPLOY.md) - Deploy manual
2. [Deploy AWS](./README_AWS.md) - Deploy escalável
3. [Metrics API](./api/METRICS_API.md) - Prometheus + Grafana

---

## 🔍 Busca Rápida

### Comandos
```bash
# Instalação
npm install
npx prisma db push
npm run dev

# Build
npm run build
npm run start

# Database
npx prisma studio
npx prisma generate

# Docker
docker build -t monitoring .
docker run -d -p 3000:3000 monitoring
```

### Endpoints Comuns
```bash
# Listar serviços
GET /api/services

# Criar serviço
POST /api/services
{"name": "API", "url": "https://...", "type": "http"}

# Métricas Prometheus
GET /api/metrics/prometheus

# Grafo de dependências
GET /api/services/dependencies/graph
```

### Conceitos
- **Service**: Serviço monitorado (HTTP, Ping, TCP)
- **Check**: Verificação individual
- **Alert**: Notificação de problema
- **Dependency**: Relação entre serviços
- **Uptime**: Porcentagem de disponibilidade
- **Response Time**: Latência em milissegundos

---

## 🆘 Resolução de Problemas

| Problema | Solução | Documentação |
|----------|---------|--------------|
| Porta 3000 em uso | `lsof -ti:3000 \| xargs kill -9` | [Getting Started](./guides/GETTING_STARTED.md) |
| Prisma Client Error | `npx prisma generate` | [Getting Started](./guides/GETTING_STARTED.md) |
| Build Error | `rm -rf .next && npm install` | [Getting Started](./guides/GETTING_STARTED.md) |
| Grafana não conecta | Verificar URL do datasource | [Grafana Setup](./guides/GRAFANA_SETUP.md) |
| Dependência circular | Não permitido pelo sistema | [Dependencies Guide](./guides/DEPENDENCIES_GUIDE.md) |

---

## 📱 Acesso Rápido por Tópico

### Monitoramento
- Como adicionar serviço: [Getting Started](./guides/GETTING_STARTED.md#primeiro-uso)
- Tipos de verificação: [Services API](./api/SERVICES_API.md#tipos-de-verificação)
- Ver histórico: [Services API](./api/SERVICES_API.md#7-histórico-de-verificações)

### Alertas
- Configurar webhook: [Getting Started](./guides/GETTING_STARTED.md#alertas)
- Regras de alerta: [Services API](./api/SERVICES_API.md#8-estatísticas-do-serviço)
- Histórico de alertas: [Services API](./api/SERVICES_API.md#9-eventos-do-serviço)

### Dependências
- Criar dependência: [Dependencies Guide](./guides/DEPENDENCIES_GUIDE.md#como-criar-dependências)
- Visualizar grafo: [Dependencies Guide](./guides/DEPENDENCIES_GUIDE.md#visualização-em-grafo)
- API de dependências: [Dependencies API](./api/DEPENDENCIES_API.md)

### Grafana
- Instalar Grafana: [Grafana Setup](./guides/GRAFANA_SETUP.md#instalação-do-grafana)
- Configurar datasource: [Grafana Setup](./guides/GRAFANA_SETUP.md#configuração-do-datasource)
- Importar dashboard: [Grafana Setup](./guides/GRAFANA_SETUP.md#importar-dashboard)

### Deploy
- Deploy Vercel: [README.md](../README.md#vercel)
- Deploy EC2: [Deploy EC2](./README_EC2_DEPLOY.md)
- Docker: [README.md](../README.md#docker)

---

## 🔄 Fluxo de Leitura Recomendado

### Novos Usuários
```
1. Getting Started → 2. Services API → 3. Grafana Setup
```

### Desenvolvedores
```
1. Estrutura do Projeto → 2. Services API → 3. Dependencies API
```

### DevOps
```
1. Deploy EC2 → 2. Metrics API → 3. Grafana Setup
```

---

## 📚 Recursos Externos

### Tecnologias Utilizadas
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Recharts](https://recharts.org)

### Integrações
- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Slack Webhooks](https://api.slack.com/messaging/webhooks)
- [Discord Webhooks](https://discord.com/developers/docs/resources/webhook)

---

## 📞 Suporte

- 📖 **Documentação**: Você está aqui!
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/...)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/...)
- 📧 **Email**: suporte@sefa.pa.gov.br

---

## 📝 Contribuir com a Documentação

Encontrou erro ou quer melhorar a documentação?

1. Edite o arquivo relevante em `/docs`
2. Siga o template existente
3. Abra Pull Request
4. Aguarde review

**Convenções:**
- Use Markdown
- Adicione exemplos práticos
- Inclua capturas de tela quando possível
- Mantenha linguagem clara e objetiva

---

**Última atualização:** 03/01/2026  
**Versão da documentação:** 2.0
