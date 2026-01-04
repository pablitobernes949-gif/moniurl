@echo off
cd /d "%~dp0"

echo === Criando estrutura de pastas ===
mkdir scripts 2>nul
mkdir docker 2>nul
mkdir config 2>nul
mkdir "docs\architecture" 2>nul
mkdir "docs\deployment" 2>nul
mkdir "lib\database" 2>nul
mkdir "lib\monitoring" 2>nul
mkdir "lib\utils" 2>nul
mkdir "lib\initialization" 2>nul

echo.
echo === Movendo scripts ===
git mv check-db.js scripts/ 2>nul
git mv migrate-services.js scripts/ 2>nul
git mv test-server.js scripts/ 2>nul
git mv test-api.ps1 scripts/ 2>nul
git mv test-api.sh scripts/ 2>nul

echo.
echo === Movendo arquivos Docker ===
git mv Dockerfile docker/ 2>nul
git mv docker-compose.yml docker/ 2>nul
git mv .dockerignore docker/ 2>nul

echo.
echo === Movendo configs ===
git mv grafana-dashboard.json config/ 2>nul
if exist server.log git mv server.log config/ 2>nul

echo.
echo === Movendo docs de arquitetura ===
if exist ARCHITECTURE.md git mv ARCHITECTURE.md docs\architecture\ 2>nul
if exist BACKEND_API.md git mv BACKEND_API.md docs\architecture\ 2>nul
if exist BACKEND_QUICKSTART.md git mv BACKEND_QUICKSTART.md docs\architecture\ 2>nul
if exist IMPLEMENTATION_SUMMARY.md git mv IMPLEMENTATION_SUMMARY.md docs\architecture\ 2>nul
if exist DELIVERY_SUMMARY.md git mv DELIVERY_SUMMARY.md docs\architecture\ 2>nul
if exist START_HERE.md git mv START_HERE.md docs\architecture\ 2>nul

echo.
echo === Movendo docs de deployment ===
if exist DEPLOY_EC2.md git mv DEPLOY_EC2.md docs\deployment\ 2>nul
if exist DEPLOY_MANUAL.md git mv DEPLOY_MANUAL.md docs\deployment\ 2>nul

echo.
echo === Movendo arquivos lib ===
move /Y lib\db-operations.ts lib\database\ 2>nul
move /Y lib\db.ts lib\database\ 2>nul
move /Y lib\storage.ts lib\database\ 2>nul

move /Y lib\monitoring.ts lib\monitoring\ 2>nul
move /Y lib\alerts.ts lib\monitoring\ 2>nul
move /Y lib\realtime.ts lib\monitoring\ 2>nul
move /Y lib\aws-realtime.ts lib\monitoring\ 2>nul

move /Y lib\utils.ts lib\utils\ 2>nul
move /Y lib\types.ts lib\utils\ 2>nul

move /Y lib\init.ts lib\initialization\ 2>nul
move /Y lib\seed.ts lib\initialization\ 2>nul
move /Y lib\worker.ts lib\initialization\ 2>nul

echo.
echo ===================================================
echo REORGANIZACAO CONCLUIDA!
echo ===================================================
echo.
echo Proximos passos:
echo 1. Verificar arquivos movidos: git status
echo 2. Atualizar imports nos arquivos
echo 3. Testar build: npm run build
echo.
pause
