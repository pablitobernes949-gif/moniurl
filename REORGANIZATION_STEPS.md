# Passos para Reorganização da Estrutura do Projeto

## Status Atual
O projeto tem arquivos soltos que precisam ser organizados em pastas e subpastas apropriadas.

## Estrutura Necessária

### 1. Organizar pasta `lib/`
Criar subpastas para categorizar os arquivos de utilidades:

```bash
# Criar subpastas
mkdir lib\database
mkdir lib\monitoring
mkdir lib\utils
mkdir lib\initialization

# Mover arquivos de database
Move-Item lib\db-operations.ts lib\database\
Move-Item lib\db.ts lib\database\
Move-Item lib\storage.ts lib\database\

# Mover arquivos de monitoring
Move-Item lib\monitoring.ts lib\monitoring\
Move-Item lib\alerts.ts lib\monitoring\
Move-Item lib\realtime.ts lib\monitoring\
Move-Item lib\aws-realtime.ts lib\monitoring\

# Mover arquivos de utils
Move-Item lib\utils.ts lib\utils\
Move-Item lib\types.ts lib\utils\

# Mover arquivos de initialization
Move-Item lib\init.ts lib\initialization\
Move-Item lib\seed.ts lib\initialization\
Move-Item lib\worker.ts lib\initialization\
```

### 2. Organizar arquivos da raiz
Mover scripts, arquivos docker e configurações:

```bash
# Criar pastas se não existirem
mkdir scripts -Force
mkdir docker -Force
mkdir config -Force
mkdir docs\architecture -Force
mkdir docs\deployment -Force

# Mover scripts
Move-Item check-db.js scripts\
Move-Item migrate-services.js scripts\
Move-Item test-server.js scripts\
Move-Item test-api.ps1 scripts\
Move-Item test-api.sh scripts\

# Mover docker files
Move-Item Dockerfile docker\
Move-Item docker-compose.yml docker\
Move-Item .dockerignore docker\

# Mover config files
Move-Item grafana-dashboard.json config\
if (Test-Path "server.log") { Move-Item server.log config\ }

# Mover docs de arquitetura
if (Test-Path "ARCHITECTURE.md") { Move-Item ARCHITECTURE.md docs\architecture\ }
if (Test-Path "BACKEND_API.md") { Move-Item BACKEND_API.md docs\architecture\ }
if (Test-Path "BACKEND_QUICKSTART.md") { Move-Item BACKEND_QUICKSTART.md docs\architecture\ }
if (Test-Path "IMPLEMENTATION_SUMMARY.md") { Move-Item IMPLEMENTATION_SUMMARY.md docs\architecture\ }
if (Test-Path "DELIVERY_SUMMARY.md") { Move-Item DELIVERY_SUMMARY.md docs\architecture\ }
if (Test-Path "START_HERE.md") { Move-Item START_HERE.md docs\architecture\ }

# Mover docs de deployment
if (Test-Path "DEPLOY_EC2.md") { Move-Item DEPLOY_EC2.md docs\deployment\ }
if (Test-Path "DEPLOY_MANUAL.md") { Move-Item DEPLOY_MANUAL.md docs\deployment\ }
```

### 3. Atualizar Imports
Após mover os arquivos da pasta `lib/`, será necessário atualizar os imports em todos os arquivos que os utilizam:

**Mudanças de Import:**
- `@/lib/db` → `@/lib/database/db`
- `@/lib/db-operations` → `@/lib/database/db-operations`
- `@/lib/storage` → `@/lib/database/storage`
- `@/lib/monitoring` → `@/lib/monitoring/monitoring`
- `@/lib/alerts` → `@/lib/monitoring/alerts`
- `@/lib/realtime` → `@/lib/monitoring/realtime`
- `@/lib/aws-realtime` → `@/lib/monitoring/aws-realtime`
- `@/lib/utils` → `@/lib/utils/utils`
- `@/lib/types` → `@/lib/utils/types`
- `@/lib/init` → `@/lib/initialization/init`
- `@/lib/seed` → `@/lib/initialization/seed`
- `@/lib/worker` → `@/lib/initialization/worker`

**Arquivos que provavelmente precisam ser atualizados:**
- `app/api/**/*.ts` (todas as rotas de API)
- `components/**/*.tsx` (componentes que usam utilities)
- `lib/**/*.ts` (arquivos da própria lib que se importam entre si)

### 4. Atualizar Referências Docker
Após mover os arquivos docker, atualizar referências:

- Em `package.json`, comandos docker devem apontar para `docker/docker-compose.yml`
- Scripts que referenciam Dockerfile devem ser atualizados

### 5. Estrutura Final Esperada

```
service-monitoring-system/
├── app/                    # Páginas e rotas Next.js
│   ├── api/               # API routes (já organizado)
│   ├── status/            # Página de status
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/            # Componentes React (já organizado)
│   ├── modals/
│   ├── panels/
│   ├── cards/
│   ├── charts/
│   ├── providers/
│   └── ui/
├── lib/                   # Utilitários (REORGANIZAR)
│   ├── database/          # Operações de banco de dados
│   │   ├── db.ts
│   │   ├── db-operations.ts
│   │   └── storage.ts
│   ├── monitoring/        # Sistema de monitoramento
│   │   ├── monitoring.ts
│   │   ├── alerts.ts
│   │   ├── realtime.ts
│   │   └── aws-realtime.ts
│   ├── utils/             # Utilitários gerais
│   │   ├── utils.ts
│   │   └── types.ts
│   └── initialization/    # Inicialização e setup
│       ├── init.ts
│       ├── seed.ts
│       └── worker.ts
├── scripts/               # Scripts utilitários
│   ├── check-db.js
│   ├── migrate-services.js
│   ├── test-server.js
│   ├── test-api.ps1
│   └── test-api.sh
├── docker/                # Arquivos Docker
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .dockerignore
├── config/                # Configurações
│   ├── grafana-dashboard.json
│   └── server.log
├── docs/                  # Documentação
│   ├── api/              # Documentação de APIs
│   ├── guides/           # Guias e tutoriais
│   ├── architecture/     # Arquitetura do sistema
│   └── deployment/       # Deployment e infra
├── public/                # Arquivos estáticos
├── prisma/                # Schema do banco
├── package.json
├── tsconfig.json
├── next.config.mjs
└── README.md
```

## Como Executar

1. Abrir PowerShell na raiz do projeto
2. Executar os comandos da seção 1 (organizar lib/)
3. Executar os comandos da seção 2 (organizar raiz)
4. Executar busca e substituição nos imports (seção 3)
5. Testar a compilação: `npm run build`
6. Verificar se não há erros de import

## Nota
Alguns comandos anteriores falharam silenciosamente. Este documento garante que você possa executar manualmente todas as reorganizações necessárias.
