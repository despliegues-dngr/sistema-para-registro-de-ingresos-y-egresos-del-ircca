@echo off
REM Script para ejecutar ZAP Baseline Scan con Docker
REM Sistema IRCCA - Security Testing

echo ========================================
echo   OWASP ZAP Baseline Scan - IRCCA
echo ========================================
echo.

REM Verificar que Docker esté corriendo
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no está instalado o no está corriendo
    echo Por favor, instala Docker Desktop desde: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Verificar que el servidor de desarrollo esté corriendo
echo Verificando servidor en http://localhost:5173...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: El servidor de desarrollo NO está corriendo en localhost:5173
    echo.
    echo Por favor, ejecuta en otra terminal:
    echo   pnpm run dev
    echo.
    pause
    exit /b 1
)

echo ✓ Servidor detectado
echo.
echo Iniciando scan baseline...
echo Este proceso tomará 5-10 minutos
echo.

REM Ejecutar ZAP Baseline Scan
docker run -v "%cd%":/zap/wrk/:rw -t ghcr.io/zaproxy/zaproxy:stable ^
  zap-baseline.py ^
  -t http://host.docker.internal:5173 ^
  -r baseline-report.html ^
  -w baseline-report.md ^
  -J baseline-report.json

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SCAN COMPLETADO EXITOSAMENTE
    echo ========================================
    echo.
    echo Reportes generados:
    echo   - baseline-report.html  ^(abrir en navegador^)
    echo   - baseline-report.md    ^(formato Markdown^)
    echo   - baseline-report.json  ^(para CI/CD^)
    echo.
) else (
    echo.
    echo ========================================
    echo   SCAN COMPLETADO CON ALERTAS
    echo ========================================
    echo.
    echo Esto es NORMAL en un primer scan.
    echo Revisa baseline-report.html para detalles.
    echo.
)

REM Abrir reporte automáticamente
if exist "baseline-report.html" (
    echo Abriendo reporte en navegador...
    start baseline-report.html
)

echo.
pause
