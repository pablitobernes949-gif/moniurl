@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ========================================
echo   REORGANIZAÇÃO COMPLETA DO PROJETO
echo ========================================
echo.

REM ============================================
REM ETAPA 1: Criar todas as pastas necessárias
REM ============================================
echo [1/5] Criando estrutura de pastas...

mkdir lib\database 2>nul
mkdir lib\monitoring 2>nul
mkdir lib\utils 2>nul
mkdir lib\initialization 2>nul
mkdir components\modals 2>nul
mkdir components\panels 2>nul
mkdir components\cards 2>nul
mkdir components\charts 2>nul
mkdir components\providers 2>nul
mkdir scripts 2>nul
mkdir docker 2>nul
mkdir config 2>nul
mkdir docs\architecture 2>nul
mkdir docs\deployment 2>nul

echo    ✓ Pastas criadas

REM ============================================
REM ETAPA 2: Mover arquivos lib/ (database)
REM ============================================
echo [2/5] Reorganizando lib/database...

git mv lib\db.ts lib\database\db.ts
git mv lib\db-operations.ts lib\database\db-operations.ts
git mv lib\storage.ts lib\database\storage.ts

echo    ✓ Database files movidos

REM ============================================
REM ETAPA 3: Mover arquivos lib/ (monitoring)
REM ============================================
echo [3/5] Reorganizando lib/monitoring...

git mv lib\monitoring.ts lib\monitoring\monitoring.ts
git mv lib\alerts.ts lib\monitoring\alerts.ts
git mv lib\realtime.ts lib\monitoring\realtime.ts
git mv lib\aws-realtime.ts lib\monitoring\aws-realtime.ts

echo    ✓ Monitoring files movidos

REM ============================================
REM ETAPA 4: Mover arquivos lib/ (utils e init)
REM ============================================
echo [4/5] Reorganizando lib/utils e initialization...

git mv lib\utils.ts lib\utils\utils.ts
git mv lib\types.ts lib\utils\types.ts

git mv lib\init.ts lib\initialization\init.ts
git mv lib\seed.ts lib\initialization\seed.ts
git mv lib\worker.ts lib\initialization\worker.ts

echo    ✓ Utils e Initialization movidos

REM ============================================
REM ETAPA 5: Mover componentes
REM ============================================
echo [5/5] Reorganizando components...

REM Modals
git mv components\add-service-dialog.tsx components\modals\add-service-dialog.tsx
git mv components\service-details-modal.tsx components\modals\service-details-modal.tsx
git mv components\alert-history-dialog.tsx components\modals\alert-history-dialog.tsx
git mv components\comparison-chart-modal.tsx components\modals\comparison-chart-modal.tsx
git mv components\service-settings-dialog.tsx components\modals\service-settings-dialog.tsx
git mv components\webhook-settings-dialog.tsx components\modals\webhook-settings-dialog.tsx
git mv components\reports-settings-dialog.tsx components\modals\reports-settings-dialog.tsx

REM Panels
git mv components\alerts-panel.tsx components\panels\alerts-panel.tsx
git mv components\trends-dashboard.tsx components\panels\trends-dashboard.tsx
git mv components\incident-history.tsx components\panels\incident-history.tsx

REM Cards
git mv components\service-card.tsx components\cards\service-card.tsx
git mv components\service-stats.tsx components\cards\service-stats.tsx
git mv components\sla-metrics.tsx components\cards\sla-metrics.tsx

REM Charts
git mv components\service-chart.tsx components\charts\service-chart.tsx
git mv components\service-details-chart.tsx components\charts\service-details-chart.tsx

REM Providers
git mv components\theme-provider.tsx components\providers\theme-provider.tsx
git mv components\theme-provider-enhanced.tsx components\providers\theme-provider-enhanced.tsx

echo    ✓ Components reorganizados

REM ============================================
REM ETAPA 6: Mover arquivos da raiz
REM ============================================
echo [6/6] Movendo arquivos da raiz...

REM Scripts
git mv check-db.js scripts\check-db.js
git mv migrate-services.js scripts\migrate-services.js
git mv test-server.js scripts\test-server.js
git mv test-api.ps1 scripts\test-api.ps1
git mv test-api.sh scripts\test-api.sh

REM Docker
git mv Dockerfile docker\Dockerfile
git mv docker-compose.yml docker\docker-compose.yml
git mv .dockerignore docker\.dockerignore

REM Config
git mv grafana-dashboard.json config\grafana-dashboard.json
if exist server.log git mv server.log config\server.log

echo    ✓ Arquivos da raiz movidos

echo.
echo ========================================
echo   ✓ REORGANIZAÇÃO CONCLUÍDA!
echo ========================================
echo.
echo Próximo passo: Execute update-imports-final.cmd
echo.

pause
