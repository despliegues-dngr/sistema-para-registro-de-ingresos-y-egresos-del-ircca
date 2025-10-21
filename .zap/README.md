# 🔒 Configuración de OWASP ZAP - Sistema IRCCA

Este directorio contiene la configuración de seguridad y testing con OWASP ZAP.

## 📁 Archivos

- **automation.yaml**: Configuración de scans automatizados
- **run-baseline-scan.bat**: Script para scan de desarrollo (puerto 5173)
- **run-preview-scan.bat**: Script para scan de preview/build (puerto 4173)
- **run-full-scan.bat**: Script para scan completo (30-60 min)
- **GUIA-OWASP-OFICIAL.md**: Documentación oficial OWASP sobre alertas
- **INICIO-RAPIDO.md**: Guía rápida para primer scan

## 🎯 Tipos de Scan

### 1. Baseline Scan (Rápido - 5-10 min)
```bash
# Desde Docker
docker run -v %cd%:/zap/wrk/:rw -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://host.docker.internal:5173 -r baseline-report.html

# Desde ZAP GUI
# Quick Start > Automated Scan > URL: http://localhost:5173
```

### 2. Full Scan (Completo - 30-60 min)
```bash
docker run -v %cd%:/zap/wrk/:rw -t ghcr.io/zaproxy/zaproxy:stable zap-full-scan.py -t http://host.docker.internal:5173 -r full-scan-report.html
```

### 3. API Scan (Si aplica en futuro)
Para cuando implementen backend API.

## 📊 Reportes

Los reportes HTML se generan en este directorio:
- `baseline-report.html` - Scan baseline más reciente
- `full-scan-report.html` - Scan completo más reciente

## 🔍 Áreas de Testing Prioritarias

Basado en `docs/03-security/`:

1. **Cifrado Client-Side**
   - Verificar que datos sensibles en IndexedDB estén cifrados
   - No exposición en localStorage sin cifrar

2. **RBAC (Control de Acceso)**
   - Rutas `/admin` solo accesibles con rol Admin
   - Rutas `/supervisor` solo accesibles con rol Supervisor/Admin
   - Validar redirección a login si no autenticado

3. **Headers de Seguridad (✅ CONFIGURADOS - 21-Oct-2025)**
   - Content-Security-Policy (CSP) con 8 directivas
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Referrer-Policy: strict-origin-when-cross-origin
   - Permissions-Policy: geolocation=(), microphone=(), camera=()
   - **Config:** `vite.config.ts` (líneas 14-35)

4. **Session Management**
   - Timeout de sesión: 3 horas
   - Bloqueo tras 3 intentos fallidos
   - Logout efectivo (limpieza de storage)

5. **Input Validation**
   - XSS en campos de texto
   - Validación de formato de cédula (8 dígitos)
   - Sanitización de nombres

6. **Service Worker / PWA**
   - Cache seguro (sin exponer datos sensibles)
   - Offline fallback sin datos críticos

## ⚠️ IMPORTANTE

- **NUNCA** ejecutar scans contra producción sin autorización
- **SIEMPRE** usar datos de prueba (cédulas ficticias)
- **VERIFICAR** que el servidor de desarrollo esté corriendo antes de escanear

## 📅 Frecuencia Recomendada

- **Baseline Scan**: Antes de cada PR importante
- **Full Scan**: Mensual o antes de release
- **Manual Testing**: Ante cambios en autenticación/autorización
