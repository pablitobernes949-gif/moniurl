@echo off
echo ======================================
echo  ATUALIZANDO IMPORTS AUTOMATICAMENTE
echo ======================================
echo.

powershell.exe -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "%~dp0update-imports.ps1"

echo.
echo Script finalizado!
pause
