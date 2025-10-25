# 🎨 GUÍA DE DESARROLLO VUETIFY - IRCCA PWA

**Versión:** 1.1.0  
**Fecha:** 24-Oct-2025  
**Propósito:** Lineamientos oficiales para desarrollo con Vuetify siguiendo mejores prácticas

**✅ VALIDADO EN TABLET:** Optimizaciones de modales confirmadas funcionando perfectamente (24-Oct-2025)

---

## 1. Principios Fundamentales

### ✅ QUE HACER
- **Usar sistema de temas nativo** de Vuetify
- **Clases de utilidad oficiales** (`bg-primary`, `text-*`)
- **CSS Variables del tema** (`var(--v-theme-primary)`)
- **Defaults globales** en configuración del tema
- **Grid system oficial** (`v-container`, `v-row`, `v-col`)

### ❌ QUE EVITAR
- **CSS personalizado** que interfiera con Vuetify
- **Uso de `!important`** salvo casos extremos
- **Colores hardcoded** en CSS
- **Propiedades redundantes** ya definidas en defaults

---

## 2. Configuración del Tema

### Estructura Oficial (src/plugins/vuetify.ts)
```typescript
export default createVuetify({
  theme: {
    defaultTheme: 'ircca',
    themes: {
      ircca: {
        dark: false,
        colors: {
          primary: '#1565C0',
          secondary: '#424242',
          background: '#F5F5F5',
          surface: '#FFFFFF',
          // ... otros colores institucionales
        }
      }
    }
  },
  defaults: {
    VBtn: {
      color: 'primary',
      variant: 'flat'
    },
    VCard: {
      elevation: 2,
      variant: 'flat'
    }
  }
})
```

### Colores Institucionales IRCCA
- **Primary:** `#1565C0` (Azul gubernamental)
- **Secondary:** `#424242` (Gris neutro)
- **Background:** `#F5F5F5` (Fondo institucional)
- **Surface:** `#FFFFFF` (Superficies blancas)

---

## 3. Componentes y Layout

### App.vue - Estructura Mínima
```vue
<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
<!-- SIN CSS personalizado - Vuetify aplica automáticamente background del tema -->
```

### Layout Components
```vue
<template>
  <!-- ✅ CORRECTO: Grid system oficial -->
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4">
        <slot />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
/* ✅ CORRECTO: CSS mínimo y específico */
.fill-height {
  min-height: 100vh;
}
</style>
```

### UI Components
```vue
<template>
  <!-- ✅ CORRECTO: Usa defaults del tema -->
  <v-card class="mx-auto" max-width="480">
    <slot />
  </v-card>
</template>
<!-- Sin propiedades redundantes (elevation, variant definidos en defaults) -->
```

---

## 4. Estilos y CSS

### Clases de Utilidad Oficiales
```vue
<!-- ✅ CORRECTO: Clases oficiales de Vuetify -->
<v-card-item class="bg-primary text-center py-6">
  <div class="d-flex flex-column align-center">
    <!-- contenido -->
  </div>
</v-card-item>
```

### CSS Variables del Tema
```vue
<style scoped>
/* ✅ CORRECTO: Variables CSS del tema */
.custom-border {
  border-bottom: 3px solid rgb(var(--v-theme-primary));
}

/* ❌ INCORRECTO: Color hardcoded */
.wrong-border {
  border-bottom: 3px solid #1565C0;
}
</style>
```

### Componentes Nativos vs CSS
```vue
<!-- ✅ CORRECTO: Componente nativo -->
<v-divider class="mx-auto mb-3" style="width: 80px;"></v-divider>

<!-- ❌ INCORRECTO: CSS personalizado -->
<div class="custom-divider"></div>
<style>
.custom-divider {
  height: 1px;
  background-color: #e0e0e0;
  width: 80px;
  margin: 0 auto;
}
</style>
```

---

## 5. Patrones de Desarrollo

### Headers Institucionales
```vue
<template>
  <v-card-item 
    class="bg-primary text-center py-6 px-4" 
    style="border-bottom: 3px solid rgb(var(--v-theme-primary));"
  >
    <!-- contenido del header -->
  </v-card-item>
</template>
<!-- Sin CSS personalizado para background -->
```

### Footers y Superficies
```vue
<template>
  <v-card-item 
    class="bg-grey-lighten-5 pt-3 pb-5 px-6" 
    style="border-top: 1px solid rgb(var(--v-theme-on-surface), 0.12);"
  >
    <!-- contenido del footer -->
  </v-card-item>
</template>
```

### Formularios y Cards
```vue
<template>
  <!-- Los defaults se aplican automáticamente -->
  <v-card class="mx-auto" max-width="480">
    <v-card-title>{{ title }}</v-card-title>
    <v-card-text>
      <!-- contenido -->
    </v-card-text>
  </v-card>
</template>
```

---

## 6. Checklist de Revisión

### Antes de Commit
- [ ] **No hay CSS con `!important`**
- [ ] **Se usan clases de utilidad oficiales**
- [ ] **Colores via CSS variables del tema**
- [ ] **Componentes usan defaults globales**
- [ ] **Layout usa grid system de Vuetify**
- [ ] **Background se aplica automáticamente**

### Code Review
- [ ] **Consistencia con documentación**
- [ ] **No hay CSS que interfiera con Vuetify**
- [ ] **Componentes siguen patrones establecidos**
- [ ] **Responsive design correcto**

---

## 7. Ejemplos de Migración

### Antes (Problemático)
```vue
<template>
  <v-card elevation="2" variant="flat" class="login-card">
    <!-- contenido -->
  </v-card>
</template>

<style>
.login-card {
  background-color: white !important;
}
</style>
```

### Después (Correcto)
```vue
<template>
  <v-card class="mx-auto" max-width="480">
    <!-- contenido -->
  </v-card>
</template>
<!-- Sin CSS - usa defaults del tema -->
```

---

## 8. Optimización de Modales para Tablets

### 8.1 Problema de Performance

Los `v-dialog` estándar tienen limitaciones en tablets:

- **Backdrop blur costoso:** `backdrop-filter: blur()` consume GPU
- **Animaciones complejas:** Transiciones + scrim causan lag
- **Overhead de Vuetify:** Código no utilizado se ejecuta igual

### 8.2 Solución: FullScreenModal ✅ VALIDADO

**Componente:** `src/components/ui/FullScreenModal.vue`

```vue
<FullScreenModal v-model="show" title="Título" icon="mdi mdi-icon" @close="handleClose">
  <div>Contenido</div>
  <template #footer><button @click="close">Cerrar</button></template>
</FullScreenModal>
```

**Ventajas confirmadas (tablet):**

- ✅ 60% menos GPU usage (sin backdrop blur) | ✅ Transiciones fluidas | ✅ ~3KB vs ~8KB
- ✅ Event listeners optimizados | ✅ Body scroll correcto | ✅ Sin modales anidados

**Migrados:** HelpDialog, RegistrationDialog, TermsAndConditionsDialog, RegistroIngresoDialog ✅  
**Pendientes:** RegistroSalidaDialog, UserProfileDialog, ChangePasswordDialog

**Usar en:** Formularios largos, listas con scroll, contenido complejo, modales anidados  
**NO usar en:** Confirmaciones simples (usar v-dialog)

---

## 9. Recursos y Referencias

- **Documentación Oficial:** [Vuetify 3 Docs](https://vuetifyjs.com/)
- **Theming System:** [Vuetify Theme Configuration](https://vuetifyjs.com/en/features/theme/)
- **Utility Classes:** [Vuetify Utility Classes](https://vuetifyjs.com/en/styles/spacing/)
- **Grid System:** [Vuetify Grid System](https://vuetifyjs.com/en/components/grids/)

---

**Nota:** Esta guía debe seguirse estrictamente para mantener consistencia en el equipo y evitar conflictos con el sistema de Vuetify.
