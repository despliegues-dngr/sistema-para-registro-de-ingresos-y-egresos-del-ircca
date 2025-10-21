@echo off
REM Script para ejecutar ZAP Baseline Scan sobre PREVIEW (dist/)
REM Sistema IRCCA - Security Testing - Production Build

echo ========================================
echo   OWASP ZAP Preview Scan - IRCCA
echo   (Escaneando Build de Produccion)
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

REM Verificar que el servidor preview esté corriendo
echo Verificando servidor preview en http://localhost:4173...
curl -s http://localhost:4173 >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: El servidor preview NO está corriendo en localhost:4173
    echo.
    echo Por favor, ejecuta en otra terminal:
    echo   pnpm run preview
    echo.
    echo Luego ejecuta este script nuevamente.
    echo.
    pause
    exit /b 1
)

echo ✓ Servidor preview detectado
echo.
echo Iniciando scan sobre BUILD DE PRODUCCION...
echo Este proceso tomará 5-10 minutos
echo.

REM Ejecutar ZAP Baseline Scan sobre preview
docker run -v "%cd%":/zap/wrk/:rw -t ghcr.io/zaproxy/zaproxy:stable ^
  zap-baseline.py ^
  -t http://host.docker.internal:4173 ^
  -r preview-scan-report.html ^
  -w preview-scan-report.md ^
  -J preview-scan-report.json

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SCAN PREVIEW COMPLETADO EXITOSAMENTE
    echo ========================================
    echo.
    echo Reportes generados:
    echo   - preview-scan-report.html  ^(abrir en navegador^)
    echo   - preview-scan-report.md    ^(formato Markdown^)
    echo   - preview-scan-report.json  ^(para CI/CD^)
    echo.
) else (
    echo.
    echo ========================================
    echo   SCAN COMPLETADO CON ALERTAS
    echo ========================================
    echo.
    echo Revisa preview-scan-report.html para detalles.
    echo Compara con scan de desarrollo para validar mejoras.
    echo.
)

REM Abrir reporte automáticamente
if exist "preview-scan-report.html" (
    echo Abriendo reporte en navegador...
    start preview-scan-report.html
)

echo.
echo ========================================
echo   RESULTADOS ESPERADOS:
echo ========================================
echo.
echo ✅ CSP: unsafe-inline debe DESAPARECER
echo ✅ Headers de seguridad: PRESENTES
echo ✅ Alertas MEDIUM: 0-1 (solo falsos positivos)
echo ✅ Total alertas: ~3-5 (vs 6 en desarrollo)
echo.
pause
