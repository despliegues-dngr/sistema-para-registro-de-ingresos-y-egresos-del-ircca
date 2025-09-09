# 🎨 FRONTEND IRCCA - PANTALLAS Y UX
## Vuetify 3 + Material Design + Gobierno de Uruguay

### Versión: 2.0.0 | Fecha: 2025-01-08
### Framework: Vue 3 + Vuetify 3 + Tema Gubernamental

---

## 📋 ÍNDICE FRONTEND

1. [Flujo de Usuario](#flujo-de-usuario)
2. [Tema Gubernamental IRCCA](#tema-gubernamental-ircca)
3. [Pantallas del Sistema](#pantallas-del-sistema)
4. [Componentes UI](#componentes-ui)
5. [Formularios Específicos](#formularios-específicos)
6. [Validaciones](#validaciones)
7. [Responsive Design](#responsive-design)
8. [Iconografía](#iconografía)

---

## 🚶‍♂️ FLUJO DE USUARIO

### **Flujo Principal del Operador**
```
INICIO → LOGIN → DASHBOARD → [REGISTRAR INGRESO/SALIDA] → DASHBOARD
   ↓                ↓              ↓
TABLET    OPERADOR SE    VISITANTE LLEGA/SE VA
         AUTENTICA      OPERADOR LO REGISTRA
```

### **Casos de Uso**
1. **Operador inicia turno:** Login → Dashboard
2. **Visitante llega:** Dashboard → Modal Ingreso → Dashboard actualizado
3. **Visitante se va:** Dashboard → Modal Salida → Dashboard actualizado
4. **Ver quién está dentro:** Dashboard → Vista Personas Dentro
5. **Fin de turno:** Logout desde cualquier pantalla

---

## 🎨 TEMA GUBERNAMENTAL IRCCA

### **Paleta de Colores**
```scss
// Colores Institucionales
$primary: #1565C0;        // Azul institucional
$secondary: #424242;      // Gris carbón elegante
$accent: #00695C;         // Verde esmeralda gubernamental
$success: #2E7D32;        // Verde éxito
$warning: #F57C00;        // Naranja advertencia
$error: #C62828;          // Rojo error
$info: #1976D2;           // Azul información

// Específicos IRCCA
$government-gold: #FFB300;    // Dorado institucional
$official-navy: #0D47A1;     // Azul marino oficial
$surface: #FFFFFF;           // Superficie
$background: #F5F5F5;        // Fondo general
```

### **Tipografía**
```scss
// Fuentes del Sistema
font-family: 'Roboto', 'Arial', sans-serif;

// Jerarquía Tipográfica
.government-title { 
  font-size: 1.5rem; 
  font-weight: 500; 
  color: white; 
}
.government-subtitle { 
  font-size: 0.875rem; 
  opacity: 0.9; 
  color: white; 
}
```

---

## 📱 PANTALLAS DEL SISTEMA

### **1. Pantalla de Login**
```vue
<template>
  <v-app id="login-app">
    <v-main class="login-background">
      <v-container fluid class="fill-height">
        <v-row justify="center" align="center">
          <v-col cols="12" sm="8" md="6" lg="4">
            
            <!-- Header Gubernamental -->
            <v-card class="login-card" elevation="8">
              <v-card-title class="justify-center py-6 bg-primary">
                <div class="text-center text-white">
                  <v-icon size="48" class="mb-2">mdi-shield-account</v-icon>
                  <h1 class="text-h5 font-weight-bold">Sistema IRCCA</h1>
                  <p class="text-body-2 mb-0 opacity-90">
                    Instituto de Regulación y Control del Cannabis
                  </p>
                </div>
              </v-card-title>
              
              <!-- Formulario de Login -->  
              <v-card-text class="pa-8">
                <v-form @submit.prevent="login">
                  <v-text-field
                    v-model="credentials.username"
                    label="Usuario"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    density="comfortable"
                    :error-messages="errors.username"
                    class="mb-4"
                  />
                  
                  <v-text-field
                    v-model="credentials.password"
                    label="Contraseña"
                    type="password"
                    prepend-inner-icon="mdi-lock"
                    variant="outlined"
                    density="comfortable"
                    :error-messages="errors.password"
                    class="mb-6"
                  />
                  
                  <v-btn
                    type="submit"
                    block
                    size="large"
                    color="primary"
                    :loading="loading"
                    class="mb-4"
                  >
                    <v-icon left>mdi-login</v-icon>
                    Ingresar al Sistema
                  </v-btn>
                </v-form>
              </v-card-text>
              
              <!-- Footer -->
              <v-card-actions class="justify-center pb-4">
                <div class="text-caption text-medium-emphasis">
                  Gobierno de Uruguay - Sistema Oficial
                </div>
              </v-card-actions>
            </v-card>
            
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
```

### **2. Dashboard Principal**
```vue
<template>
  <div class="dashboard-view">
    
    <!-- Bienvenida con Tiempo Real -->
    <v-card class="welcome-card mb-6" color="primary">
      <v-card-text class="pa-6">
        <v-row align="center">
          <v-col cols="8">
            <h1 class="text-h4 text-white font-weight-bold mb-2">
              Bienvenido, {{ currentUser?.username }}
            </h1>
            <p class="text-white opacity-90 mb-0">
              Sistema de Control de Acceso IRCCA
            </p>
          </v-col>
          <v-col cols="4" class="text-right">
            <div class="text-h3 text-white font-weight-light">
              {{ currentTime }}
            </div>
            <div class="text-body-2 text-white opacity-80">
              {{ currentDate }}
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    
    <!-- Estadísticas en Tiempo Real -->
    <v-row class="mb-6">
      <v-col cols="6" sm="3">
        <stats-card
          title="Personas Dentro"
          :value="stats.personasDentro"
          icon="mdi-account-multiple"
          color="primary"
        />
      </v-col>
      <v-col cols="6" sm="3">
        <stats-card
          title="Vehículos"
          :value="stats.vehiculosDentro"
          icon="mdi-car-multiple"  
          color="success"
        />
      </v-col>
      <v-col cols="6" sm="3">
        <stats-card
          title="Ingresos Hoy"
          :value="stats.ingresosHoy"
          icon="mdi-login-variant"
          color="info"
        />
      </v-col>
      <v-col cols="6" sm="3">
        <stats-card
          title="Salidas Hoy" 
          :value="stats.salidasHoy"
          icon="mdi-logout-variant"
          color="warning"
        />
      </v-col>
    </v-row>
    
    <!-- Acciones Principales -->
    <v-card class="actions-card mb-6">
      <v-card-title>
        <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
        Acciones Rápidas
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-btn
              block
              size="x-large"
              color="primary"
              @click="abrirModalIngreso"
              prepend-icon="mdi-plus-circle"
            >
              Registrar Ingreso
            </v-btn>
          </v-col>
          <v-col cols="12" md="6">
            <v-btn
              block
              size="x-large"
              color="success"
              @click="abrirModalSalida"
              prepend-icon="mdi-minus-circle"
            >
              Registrar Salida
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    
    <!-- Lista Rápida de Personas Dentro -->
    <v-card v-if="personasDentro.length > 0">
      <v-card-title>
        <v-icon class="mr-2">mdi-account-group</v-icon>
        Personas Actualmente Dentro
      </v-card-title>
      <v-card-text>
        <v-list density="compact">
          <v-list-item 
            v-for="persona in personasDentro.slice(0, 5)" 
            :key="persona.cedula"
          >
            <template #prepend>
              <v-avatar color="primary" size="32">
                <v-icon color="white">mdi-account</v-icon>
              </v-avatar>
            </template>
            <v-list-item-title>{{ persona.nombre }} {{ persona.apellido }}</v-list-item-title>
            <v-list-item-subtitle>
              Cédula: {{ persona.cedula }} • Ingresó: {{ formatTime(persona.ingreso) }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
        
        <v-btn
          v-if="personasDentro.length > 5"
          text
          color="primary"
          @click="$router.push('/personas-dentro')"
        >
          Ver todas ({{ personasDentro.length }})
          <v-icon right>mdi-arrow-right</v-icon>
        </v-btn>
      </v-card-text>
    </v-card>
    
  </div>
</template>
```

### **3. Modal de Registro de Ingreso**
```vue
<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="bg-primary text-white">
        <v-icon left class="mr-2">mdi-plus-circle</v-icon>
        Registrar Nuevo Ingreso
      </v-card-title>
      
      <v-card-text class="pa-6">
        <v-form ref="form" v-model="valid">
          
          <!-- Datos Personales -->
          <h3 class="text-h6 mb-4">Datos Personales</h3>
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="form.cedula"
                label="Cédula *"
                placeholder="12345670"
                variant="outlined"
                :rules="[rules.required, rules.cedula]"
                maxlength="8"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="form.nombre"
                label="Nombre *"
                variant="outlined"
                :rules="[rules.required]"
              />
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="form.apellido"
                label="Apellido *"
                variant="outlined"
                :rules="[rules.required]"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="form.telefono"
                label="Teléfono"
                variant="outlined"
                placeholder="099 123 456"
              />
            </v-col>
          </v-row>
          
          <!-- Datos de Visita -->
          <h3 class="text-h6 mb-4 mt-4">Datos de Visita</h3>
          <v-row>
            <v-col cols="6">
              <v-select
                v-model="form.tipoVisitante"
                label="Tipo de Visitante *"
                :items="tiposVisitante"
                variant="outlined"
                :rules="[rules.required]"
              />
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="form.areaVisita"
                label="Área a Visitar *"
                :items="areasVisita"
                variant="outlined"
                :rules="[rules.required]"
              />
            </v-col>
          </v-row>
          
          <v-textarea
            v-model="form.motivo"
            label="Motivo de la Visita"
            variant="outlined"
            rows="2"
            placeholder="Describe brevemente el motivo de la visita..."
          />
          
          <!-- Datos de Vehículo (Opcional) -->
          <v-expansion-panels class="mt-4">
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon left class="mr-2">mdi-car</v-icon>
                Datos de Vehículo (Opcional)
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="4">
                    <v-text-field
                      v-model="form.vehiculo.placa"
                      label="Placa"
                      variant="outlined"
                      placeholder="ABC1234"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      v-model="form.vehiculo.modelo"
                      label="Modelo"
                      variant="outlined"
                      placeholder="Toyota Corolla"
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      v-model="form.vehiculo.color"
                      label="Color"
                      variant="outlined"
                      placeholder="Blanco"
                    />
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
          
        </v-form>
      </v-card-text>
      
      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn
          color="grey"
          variant="text"
          @click="cerrarModal"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          :disabled="!valid"
          @click="registrarIngreso"
        >
          <v-icon left>mdi-content-save</v-icon>
          Registrar Ingreso
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
```

### **4. Modal de Registro de Salida**
```vue
<template>
  <v-dialog v-model="dialog" max-width="500px" persistent>
    <v-card>
      <v-card-title class="bg-success text-white">
        <v-icon left class="mr-2">mdi-minus-circle</v-icon>
        Registrar Salida
      </v-card-title>
      
      <v-card-text class="pa-6">
        
        <!-- Búsqueda por Cédula -->
        <v-text-field
          v-model="busquedaCedula"
          label="Buscar por Cédula"
          placeholder="12345670"
          variant="outlined"
          prepend-inner-icon="mdi-magnify"
          @input="buscarPersona"
          class="mb-4"
        />
        
        <!-- Lista de Personas Dentro -->
        <div v-if="personasFiltradas.length > 0">
          <h4 class="text-subtitle-1 mb-3">Selecciona la persona:</h4>
          <v-list density="compact" class="border rounded">
            <v-list-item
              v-for="persona in personasFiltradas"
              :key="persona.cedula"
              @click="seleccionarPersona(persona)"
              :class="{ 'bg-blue-lighten-5': personaSeleccionada?.cedula === persona.cedula }"
            >
              <template #prepend>
                <v-avatar color="success" size="32">
                  <v-icon color="white">mdi-account</v-icon>
                </v-avatar>
              </template>
              
              <v-list-item-title>
                {{ persona.nombre }} {{ persona.apellido }}
              </v-list-item-title>
              <v-list-item-subtitle>
                Cédula: {{ persona.cedula }} • 
                Ingresó: {{ formatTime(persona.ingreso) }} •
                Tiempo: {{ calcularTiempoDentro(persona.ingreso) }}
              </v-list-item-subtitle>
              
              <template #append>
                <v-icon 
                  v-if="personaSeleccionada?.cedula === persona.cedula"
                  color="success"
                >
                  mdi-check-circle
                </v-icon>
              </template>
            </v-list-item>
          </v-list>
        </div>
        
        <!-- Sin Resultados -->
        <v-alert
          v-else-if="busquedaCedula && personasFiltradas.length === 0"
          type="info"
          variant="tonal"
          class="mt-4"
        >
          No se encontraron personas con esa cédula dentro del edificio.
        </v-alert>
        
        <!-- Observaciones -->
        <v-textarea
          v-if="personaSeleccionada"
          v-model="observaciones"
          label="Observaciones de Salida (Opcional)"
          variant="outlined"
          rows="2"
          class="mt-4"
        />
        
      </v-card-text>
      
      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn
          color="grey"
          variant="text"
          @click="cerrarModal"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="success"
          :loading="loading"
          :disabled="!personaSeleccionada"
          @click="registrarSalida"
        >
          <v-icon left>mdi-content-save</v-icon>
          Registrar Salida
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
```

---

## 🧩 COMPONENTES UI

### **StatsCard Component**
```vue
<template>
  <v-card class="stats-card" :color="color" variant="tonal">
    <v-card-text class="pa-4">
      <v-row align="center" no-gutters>
        <v-col cols="8">
          <div class="text-caption text-medium-emphasis mb-1">
            {{ title }}
          </div>
          <div class="text-h4 font-weight-bold" :class="`text-${color}`">
            {{ value }}
          </div>
        </v-col>
        <v-col cols="4" class="text-right">
          <v-icon :color="color" size="48">{{ icon }}</v-icon>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  icon: String,
  color: { type: String, default: 'primary' }
})
</script>
```

---

## ✅ VALIDACIONES

### **Reglas de Validación**
```javascript
// src/utils/validations.js
export const validationRules = {
  required: (value) => !!value || 'Campo obligatorio',
  
  cedula: (value) => {
    if (!value) return 'Cédula es obligatoria'
    if (!/^\d{8}$/.test(value)) return 'Cédula debe tener 8 dígitos'
    return true
  },
  
  telefono: (value) => {
    if (!value) return true // Opcional
    if (!/^0\d{8}$/.test(value.replace(/\s/g, ''))) {
      return 'Formato: 099 123 456'
    }
    return true
  },
  
  placa: (value) => {
    if (!value) return true // Opcional
    if (!/^[A-Z]{3}\d{4}$/.test(value)) {
      return 'Formato: ABC1234'
    }
    return true
  }
}

// Datos del sistema
export const TIPOS_VISITANTE = [
  'Funcionario Público',
  'Empresario/Representante',
  'Ciudadano',
  'Proveedor',
  'Consultor',
  'Otro'
]

export const AREAS_VISITA = [
  'Dirección General',
  'Área Técnica',
  'Área Legal',
  'Área Administrativa',
  'Sala de Reuniones',
  'Recepción'
]
```

---

## 📱 RESPONSIVE DESIGN

### **Breakpoints Vuetify**
```scss
// xs: 0-599px (móviles)
// sm: 600-959px (tablets pequeñas)  
// md: 960-1279px (tablets/laptops)
// lg: 1280-1919px (desktop)
// xl: 1920px+ (desktop grande)

// Optimizado para tablets 768px-1024px
@media (min-width: 768px) and (max-width: 1024px) {
  .dashboard-view {
    padding: 16px;
  }
  
  .stats-card {
    margin-bottom: 12px;
  }
  
  .welcome-card {
    .text-h4 { font-size: 1.75rem; }
  }
}
```

---

## 🎯 ICONOGRAFÍA

### **Iconos Material Design**
```javascript
// Iconos principales del sistema
const SYSTEM_ICONS = {
  // Navegación
  dashboard: 'mdi-view-dashboard',
  login: 'mdi-login',
  logout: 'mdi-logout',
  
  // Acciones
  ingreso: 'mdi-plus-circle', 
  salida: 'mdi-minus-circle',
  search: 'mdi-magnify',
  save: 'mdi-content-save',
  
  // Datos
  persona: 'mdi-account',
  vehiculo: 'mdi-car',
  tiempo: 'mdi-clock-outline',
  fecha: 'mdi-calendar',
  
  // Estados
  success: 'mdi-check-circle',
  error: 'mdi-alert-circle',
  warning: 'mdi-alert',
  info: 'mdi-information'
}
```

**🎨 Frontend completo con diseño gubernamental profesional listo para desarrollo.**
