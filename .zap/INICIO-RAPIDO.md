# 🚀 Inicio Rápido - OWASP ZAP

## ⏱️ Tu Primera Prueba en 10 Minutos

### ✅ Pre-requisitos

- [x] OWASP ZAP descargado e instalado
- [ ] Servidor de desarrollo corriendo (`pnpm run dev`)
- [ ] Navegador disponible

---

## 🎯 Opción 1: Scan Desde GUI (MÁS FÁCIL)

### Paso 1: Iniciar ZAP
1. Busca **"OWASP ZAP"** en el menú de Windows
2. Click en **"OWASP ZAP"**
3. Si pregunta por modo:
   - Selecciona **"Persist Session"**
   - Ubicación: `C:\Users\[TuUsuario]\OWASP ZAP\sessions\ircca`

### Paso 2: Configurar Proxy (Primera vez)
1. En ZAP: **Tools → Options → Local Proxies**
2. Verificar:
   - Address: `localhost`
   - Port: `8080`
3. Click **OK**

### Paso 3: Ejecutar Scan
1. Pestaña **"Quick Start"** (debería estar visible)
2. En **"Automated Scan"**:
   ```
   URL to attack: http://localhost:5173
   ```
3. ✅ Marcar: **"Use traditional spider"**
4. ✅ Marcar: **"Use ajax spider"** ← IMPORTANTE para PWA
5. Click botón **"Attack"**

### Paso 4: Esperar Resultados (5-10 min)
- 🕷️ Spider: Rastrea la aplicación
- 🔍 Passive Scan: Análisis sin modificar
- ⚡ Active Scan: Pruebas activas

### Paso 5: Ver Alertas
1. Panel inferior → Pestaña **"Alerts"**
2. Las alertas están categorizadas por riesgo:
   - 🔴 **High** (rojo) = Crítico
   - 🟠 **Medium** (naranja) = Importante
   - 🟡 **Low** (amarillo) = Mejora
   - ℹ️ **Informational** (azul) = Info

### Paso 6: Generar Reporte
1. **Report → Generate HTML Report**
2. Guardar en: `.zap\mi-primer-scan.html`
3. Abrir en navegador

---

## 🐳 Opción 2: Scan con Docker (AUTOMATIZADO)

### Pre-requisito
Instalar Docker Desktop: https://www.docker.com/products/docker-desktop

### Ejecutar
```bash
# Desde la raíz del proyecto
cd .zap
.\run-baseline-scan.bat
```

**¿Qué hace este script?**
1. ✅ Verifica que Docker esté corriendo
2. ✅ Verifica que `localhost:5173` esté activo
3. 🚀 Ejecuta ZAP Baseline Scan
4. 📊 Genera 3 reportes:
   - `baseline-report.html` (visual)
   - `baseline-report.md` (texto)
   - `baseline-report.json` (datos)
5. 🌐 Abre el reporte HTML automáticamente

**Tiempo:** ~5-10 minutos

---

## 📊 Qué Esperar en el Primer Scan

### ✅ Alertas NORMALES (No te preocupes)

| Alerta | Nivel | Es Normal? | Acción |
|--------|-------|------------|--------|
| CSP Header Not Set | 🟠 MEDIUM | ✅ SÍ | Agregar después |
| X-Frame-Options Missing | 🟠 MEDIUM | ✅ SÍ | Agregar después |
| Cookie Without Secure | 🟡 LOW | ✅ SÍ | Solo para HTTPS |
| Timestamp Disclosure | 🟡 LOW | ✅ SÍ | Ignorar |
| Modern Web Application | ℹ️ INFO | ✅ SÍ | Es tu PWA |

**Total esperado:** ~5-10 alertas MEDIUM/LOW

### ⚠️ Alertas PREOCUPANTES (Revisar)

| Alerta | Nivel | Qué Significa |
|--------|-------|---------------|
| Cross Site Scripting | 🔴 HIGH | Posible XSS - REVISAR |
| SQL Injection | 🔴 HIGH | Falso positivo (no hay DB) |
| Path Traversal | 🔴 HIGH | Acceso a archivos - REVISAR |
| Sensitive Data in URL | 🟠 MEDIUM | Cédulas en URL - CRÍTICO |

**Si ves HIGH:** Lee `INTERPRETAR-RESULTADOS.md`

---

## 🛠️ Soluciones Rápidas

### Fix 1: Agregar CSP Header
```html
<!-- En index.html dentro de <head> -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;">
```

### Fix 2: Agregar X-Frame-Options
```html
<!-- En index.html dentro de <head> -->
<meta http-equiv="X-Frame-Options" content="DENY">
```

### Fix 3: Agregar X-Content-Type-Options
```html
<!-- En index.html dentro de <head> -->
<meta http-equiv="X-Content-Type-Options" content="nosniff">
```

### Re-ejecutar Scan
```bash
# GUI: Quick Start → Automated Scan → Attack
# Docker: .\run-baseline-scan.bat
```

Deberías ver MENOS alertas 🎉

---

## 📅 Próximos Pasos

### Esta Semana
- [ ] Ejecutar primer scan
- [ ] Revisar alertas HIGH (si hay)
- [ ] Implementar fixes de headers (CSP, X-Frame-Options)
- [ ] Re-ejecutar scan para validar

### Este Mes
- [ ] Ejecutar Full Scan (más completo)
- [ ] Corregir alertas MEDIUM reales
- [ ] Documentar falsos positivos
- [ ] Crear baseline de seguridad

### Este Trimestre
- [ ] Automatizar en CI/CD
- [ ] Integrar con workflow de PRs
- [ ] Alcanzar 0 alertas HIGH
- [ ] Compliance AGESIC 100%

---

## 🆘 Troubleshooting

### Problema: "Cannot connect to localhost:5173"
**Solución:**
```bash
# Verifica que el servidor esté corriendo
pnpm run dev

# Debería mostrar:
#   ➜  Local:   http://localhost:5173/
```

### Problema: ZAP no encuentra nada
**Causas:**
1. La URL es incorrecta
2. El spider no está configurado para SPA

**Solución:**
- ✅ Marcar "Use ajax spider"
- Aumentar timeout: Options → Spider → Max Duration: 10 min

### Problema: Demasiadas alertas
**Normal en primer scan.** Prioriza:
1. 🔴 HIGH primero
2. 🟠 MEDIUM reales (ignora SQL injection)
3. 🟡 LOW después

### Problema: Docker no funciona
**Alternativa:**
Usar GUI (Opción 1) - funciona igual de bien

---

## 📚 Recursos

### Documentación
- **Interpretar Resultados**: `.zap/INTERPRETAR-RESULTADOS.md`
- **Config Completa**: `.zap/README.md`
- **Security Docs**: `docs/03-security/`

### Ayuda
- ZAP Docs: https://www.zaproxy.org/docs/
- ZAP Alerts: https://www.zaproxy.org/docs/alerts/
- OWASP Top 10: https://owasp.org/Top10/

---

## ✅ Checklist de Éxito

- [ ] ZAP instalado y abriendo correctamente
- [ ] Primer scan ejecutado (GUI o Docker)
- [ ] Reporte HTML generado y revisado
- [ ] Entiendo niveles de riesgo (HIGH/MEDIUM/LOW)
- [ ] Identifiqué alertas reales vs falsos positivos
- [ ] Implementé al menos 1 fix (CSP header)
- [ ] Re-ejecuté scan y vi mejora

**¿Completaste todo?** 🎉 ¡Excelente! Ya tienes testing de seguridad funcionando.

**Próximo nivel:** Ejecuta Full Scan con `.\run-full-scan.bat`
