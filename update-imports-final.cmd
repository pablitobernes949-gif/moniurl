@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo Executando atualização de imports...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0update-imports-final.ps1"

echo.
pause
