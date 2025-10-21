@echo off
REM Script para ejecutar ZAP Full Scan con Docker
REM Sistema IRCCA - Security Testing (Scan Completo)

echo ========================================
echo   OWASP ZAP Full Scan - IRCCA
echo ========================================
echo.
echo ADVERTENCIA: Este scan es MAS AGRESIVO y COMPLETO
echo Duracion estimada: 30-60 minutos
echo.

REM Verificar que Docker esté corriendo
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no está instalado o no está corriendo
    pause
    exit /b 1
)

REM Verificar que el servidor de desarrollo esté corriendo
echo Verificando servidor en http://localhost:5173...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: El servidor NO está corriendo en localhost:5173
    echo Por favor, ejecuta: pnpm run dev
    echo.
    pause
    exit /b 1
)

echo ✓ Servidor detectado
echo.

REM Confirmar ejecución
set /p confirm="¿Continuar con el Full Scan? (S/N): "
if /i not "%confirm%"=="S" (
    echo Scan cancelado por el usuario
    pause
    exit /b 0
)

echo.
echo Iniciando Full Scan...
echo.

REM Ejecutar ZAP Full Scan
docker run -v "%cd%":/zap/wrk/:rw -t ghcr.io/zaproxy/zaproxy:stable ^
  zap-full-scan.py ^
  -t http://host.docker.internal:5173 ^
  -r full-scan-report.html ^
  -w full-scan-report.md ^
  -J full-scan-report.json

echo.
echo ========================================
echo   FULL SCAN COMPLETADO
echo ========================================
echo.
echo Reportes generados en .zap/
echo.

if exist "full-scan-report.html" (
    start full-scan-report.html
)

pause
