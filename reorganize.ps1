# Script para reorganizar a estrutura de pastas do projeto
Set-Location $PSScriptRoot

Write-Host "Iniciando reorganizacao..." -ForegroundColor Green

# Criar subpastas em lib
Write-Host "`n1. Criando subpastas em lib..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path "lib\database" -Force | Out-Null
New-Item -ItemType Directory -Path "lib\monitoring" -Force | Out-Null
New-Item -ItemType Directory -Path "lib\utils" -Force | Out-Null
New-Item -ItemType Directory -Path "lib\initialization" -Force | Out-Null

# Mover arquivos de database
Write-Host "2. Movendo arquivos de database..." -ForegroundColor Cyan
if (Test-Path "lib\db-operations.ts") { Move-Item "lib\db-operations.ts" "lib\database\" -Force }
if (Test-Path "lib\db.ts") { Move-Item "lib\db.ts" "lib\database\" -Force }
if (Test-Path "lib\storage.ts") { Move-Item "lib\storage.ts" "lib\database\" -Force }

# Mover arquivos de monitoring
Write-Host "3. Movendo arquivos de monitoring..." -ForegroundColor Cyan
if (Test-Path "lib\monitoring.ts") { Move-Item "lib\monitoring.ts" "lib\monitoring\" -Force }
if (Test-Path "lib\alerts.ts") { Move-Item "lib\alerts.ts" "lib\monitoring\" -Force }
if (Test-Path "lib\realtime.ts") { Move-Item "lib\realtime.ts" "lib\monitoring\" -Force }
if (Test-Path "lib\aws-realtime.ts") { Move-Item "lib\aws-realtime.ts" "lib\monitoring\" -Force }

# Mover arquivos de utils
Write-Host "4. Movendo arquivos de utils..." -ForegroundColor Cyan
if (Test-Path "lib\utils.ts") { Move-Item "lib\utils.ts" "lib\utils\" -Force }
if (Test-Path "lib\types.ts") { Move-Item "lib\types.ts" "lib\utils\" -Force }

# Mover arquivos de initialization
Write-Host "5. Movendo arquivos de initialization..." -ForegroundColor Cyan
if (Test-Path "lib\init.ts") { Move-Item "lib\init.ts" "lib\initialization\" -Force }
if (Test-Path "lib\seed.ts") { Move-Item "lib\seed.ts" "lib\initialization\" -Force }
if (Test-Path "lib\worker.ts") { Move-Item "lib\worker.ts" "lib\initialization\" -Force }

# Criar pastas para arquivos da raiz
Write-Host "`n6. Criando pastas para organizacao da raiz..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path "scripts" -Force | Out-Null
New-Item -ItemType Directory -Path "docker" -Force | Out-Null
New-Item -ItemType Directory -Path "config" -Force | Out-Null
New-Item -ItemType Directory -Path "docs\architecture" -Force | Out-Null
New-Item -ItemType Directory -Path "docs\deployment" -Force | Out-Null

# Mover scripts
Write-Host "7. Movendo scripts..." -ForegroundColor Cyan
if (Test-Path "check-db.js") { Move-Item "check-db.js" "scripts\" -Force }
if (Test-Path "migrate-services.js") { Move-Item "migrate-services.js" "scripts\" -Force }
if (Test-Path "test-server.js") { Move-Item "test-server.js" "scripts\" -Force }
if (Test-Path "test-api.ps1") { Move-Item "test-api.ps1" "scripts\" -Force }
if (Test-Path "test-api.sh") { Move-Item "test-api.sh" "scripts\" -Force }

# Mover docker files
Write-Host "8. Movendo docker files..." -ForegroundColor Cyan
if (Test-Path "Dockerfile") { Move-Item "Dockerfile" "docker\" -Force }
if (Test-Path "docker-compose.yml") { Move-Item "docker-compose.yml" "docker\" -Force }
if (Test-Path ".dockerignore") { Move-Item ".dockerignore" "docker\" -Force }

# Mover config files
Write-Host "9. Movendo config files..." -ForegroundColor Cyan
if (Test-Path "grafana-dashboard.json") { Move-Item "grafana-dashboard.json" "config\" -Force }
if (Test-Path "server.log") { Move-Item "server.log" "config\" -Force }

# Mover docs de arquitetura
Write-Host "10. Movendo docs de arquitetura..." -ForegroundColor Cyan
if (Test-Path "ARCHITECTURE.md") { Move-Item "ARCHITECTURE.md" "docs\architecture\" -Force }
if (Test-Path "BACKEND_API.md") { Move-Item "BACKEND_API.md" "docs\architecture\" -Force }
if (Test-Path "BACKEND_QUICKSTART.md") { Move-Item "BACKEND_QUICKSTART.md" "docs\architecture\" -Force }
if (Test-Path "IMPLEMENTATION_SUMMARY.md") { Move-Item "IMPLEMENTATION_SUMMARY.md" "docs\architecture\" -Force }
if (Test-Path "DELIVERY_SUMMARY.md") { Move-Item "DELIVERY_SUMMARY.md" "docs\architecture\" -Force }
if (Test-Path "START_HERE.md") { Move-Item "START_HERE.md" "docs\architecture\" -Force }

# Mover docs de deployment
Write-Host "11. Movendo docs de deployment..." -ForegroundColor Cyan
if (Test-Path "DEPLOY_EC2.md") { Move-Item "DEPLOY_EC2.md" "docs\deployment\" -Force }
if (Test-Path "DEPLOY_MANUAL.md") { Move-Item "DEPLOY_MANUAL.md" "docs\deployment\" -Force }

Write-Host "`nReorganizacao concluida com sucesso!" -ForegroundColor Green
Write-Host "`nProximos passos:" -ForegroundColor Yellow
Write-Host "1. Atualizar imports nos arquivos (consulte REORGANIZATION_STEPS.md)"
Write-Host "2. Executar: npm run build"
Write-Host "3. Verificar se nao ha erros de import"
