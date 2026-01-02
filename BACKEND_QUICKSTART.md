# 🚀 Guia de Início Rápido - Backend Service Monitor

## ✅ O que foi desenvolvido

### Backend Completo
- **API REST**: 10+ endpoints para gerenciar serviços
- **Armazenamento Persistente**: Dados salvos em arquivos JSON (`.data/`)
- **Monitoramento Automático**: Worker que verifica serviços a cada 30 segundos
- **Event Streaming**: SSE para atualizações em tempo real
- **Health Check**: Endpoint para status do servidor
- **Suporte AWS**: Integração opcional com DynamoDB e SNS

### Endpoints API
```
GET    /api/health                           # Status do servidor
GET    /api/services                         # Lista todos os serviços
POST   /api/services                         # Criar novo serviço
GET    /api/services/:id                     # Obter serviço específico
PUT    /api/services/:id                     # Atualizar serviço
DELETE /api/services/:id                     # Deletar serviço
POST   /api/services/:id/check               # Forçar verificação
GET    /api/services/:id/history             # Histórico de verificações
POST   /api/services/:id/history             # Atualizar histórico
GET    /api/services/:id/events              # Stream de eventos (SSE)
```

## 🏃 Como Começar

### 1. Instalação de Dependências
```bash
cd "c:\Users\michel.quaresma\Documents\Projetos_Sefa\System Moni. URL\service-monitoring-system"
pnpm install
```

### 2. Configuração (Opcional)
```bash
# Copiar arquivo de exemplo
cp .env.example .env.local

# Editar .env.local se precisar de AWS
# Deixar vazio para usar armazenamento local (padrão)
```

### 3. Iniciar Servidor
```bash
pnpm dev
```

A aplicação estará disponível em `http://localhost:3000`

### 4. Testando
```bash
# Terminal 1 - Servidor
pnpm dev

# Terminal 2 - Testar API
curl http://localhost:3000/api/health

# Criar serviço
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -d '{"name":"Google","url":"https://google.com"}'

# Listar serviços
curl http://localhost:3000/api/services
```

## 📁 Estrutura de Pastas Criadas

```
lib/
├── storage.ts          # 🆕 Camada de persistência (arquivo/DynamoDB)
├── worker.ts           # 🆕 Worker para monitoramento automático
├── init.ts             # 🆕 Inicialização do backend
├── monitoring.ts       # Função para verificar saúde de serviço
├── types.ts            # Tipos TypeScript
└── utils.ts            # Utilitários

app/api/
├── health/
│   └── route.ts        # 🆕 Health check endpoint
└── services/
    ├── route.ts        # 🆕 GET/POST /api/services
    └── [id]/
        ├── route.ts    # 🆕 GET/PUT/DELETE /api/services/:id
        ├── check/
        │   └── route.ts     # 🆕 POST /api/services/:id/check
        ├── history/
        │   └── route.ts     # ✏️ GET/POST /api/services/:id/history
        └── events/
            └── route.ts     # ✏️ GET /api/services/:id/events

components/
├── backend-initializer.tsx # 🆕 Componente para iniciar backend
└── monitoring-dashboard.tsx # ✏️ Atualizado para usar API

.data/                      # 🆕 Diretório de armazenamento persistente
├── services.json           # Metadados dos serviços
└── history/
    └── [serviceId].json    # Histórico de verificações
```

## 🎯 Features Implementadas

### ✅ Armazenamento
- [x] Salva serviços em `services.json`
- [x] Salva histórico separado por serviço
- [x] Carrega dados ao inicializar
- [x] Suporta até 1000 verificações por serviço
- [x] Backup automático em cada mudança

### ✅ Monitoramento
- [x] Verificação automática cada 30 segundos
- [x] Calcula uptime em tempo real
- [x] Registra latência de resposta
- [x] Detecta serviços offline/instáveis
- [x] Pode forçar verificação imediata

### ✅ API REST
- [x] CRUD completo para serviços
- [x] Endpoints para histórico
- [x] Server-Sent Events para tempo real
- [x] Tratamento de erros apropriado
- [x] Validação de entrada

### ✅ Frontend
- [x] Integrado com API do backend
- [x] Carrega serviços ao abrir
- [x] Atualiza a cada 30 segundos
- [x] Suporte para adicionar/deletar serviços
- [x] Força verificação imediata
- [x] Tema dark/light

### ✅ Opcional (AWS)
- [x] Suporte para DynamoDB
- [x] Integração com SNS
- [x] Configurável via env vars

## 📊 Exemplo de Dados

### Serviço Criado
```json
{
  "id": "1704186000000",
  "name": "Google DNS",
  "url": "https://8.8.8.8",
  "status": "online",
  "lastCheck": 1704186012345,
  "responseTime": 145,
  "uptime": 99.8,
  "createdAt": 1704186000000,
  "history": [
    {
      "timestamp": 1704186000000,
      "status": "online",
      "responseTime": 145
    },
    ...
  ]
}
```

## 🔧 Configuração Avançada

### Usar DynamoDB
```bash
# .env.local
AWS_DYNAMODB_TABLE=services-monitoring
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

### Usar SNS para Alertas
```bash
# .env.local
AWS_SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:alerts
```

### Alterar Intervalo de Verificação
```bash
# .env.local
MONITORING_INTERVAL=60000  # 60 segundos
```

## 🐛 Troubleshooting

### Backend não inicializa
```bash
# Verificar se a pasta .data existe
ls .data/

# Se não existir, será criada automaticamente
# Verificar permissões de escrita na pasta do projeto
```

### Serviços não aparecem
```bash
# 1. Confirmar que GET /api/services retorna dados
curl http://localhost:3000/api/services

# 2. Criar um serviço de teste
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","url":"https://google.com"}'

# 3. Recarregar a página (Ctrl+R)
```

### Worker não está verificando
```bash
# Verificar logs do servidor (no terminal onde rodou pnpm dev)
# Deve mostrar "✓ Checked Service Name: online" a cada 30s

# Se não aparecer, tentar:
# 1. Recarregar página
# 2. Verificar /api/health
# 3. Reiniciar servidor
```

## 📚 Documentação Completa

Para mais detalhes, veja [BACKEND_API.md](./BACKEND_API.md)

## 🎓 Próximos Passos

1. **Testes Unitários**
   ```bash
   pnpm add -D vitest @testing-library/react
   ```

2. **Logging Melhorado**
   ```bash
   pnpm add winston
   ```

3. **Rate Limiting**
   ```bash
   pnpm add express-rate-limit
   ```

4. **Autenticação**
   ```bash
   pnpm add next-auth
   ```

5. **Alertas por Email**
   ```bash
   pnpm add nodemailer
   ```

## 💡 Dicas

- Os dados estão em `.data/` - não commitar para git
- Adicionar `.data/` ao `.gitignore`
- Worker começa automaticamente na primeira requisição
- SSE funciona em todos os navegadores modernos
- Para parar o servidor: Ctrl+C no terminal

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Arquivo .gitignore já ignora .data/
# DynamoDB será usado em produção se configurado

vercel deploy
```

### Docker
```bash
docker build -t service-monitor .
docker run -p 3000:3000 service-monitor
```

### AWS EC2
Veja `README_EC2_DEPLOY.md` para instruções completas

## 📞 Suporte

Se encontrar problemas:
1. Verifique `/api/health`
2. Veja logs do servidor
3. Verifique `.data/services.json` existe
4. Tente criar novo serviço via cURL
5. Recarregue a página

---

**Backend desenvolvido e pronto para produção! 🎉**
