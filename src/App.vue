<script setup lang="ts"></script>

<template>
  <v-app>
    <v-app-bar title="Sistema IRCCA - Prueba Vuetify" color="primary">
      <template #append>
        <v-btn icon="mdi-cog" variant="text" />
      </template>
    </v-app-bar>
    
    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-card elevation="3" class="pa-6">
              <v-card-title class="text-h4 text-primary mb-4">
                🎉 ¡Vuetify + Tema IRCCA Funcionando!
              </v-card-title>
              
              <v-card-text>
                <p class="mb-4">El setup está completo. Estos son los colores del tema gubernamental:</p>
                
                <v-row>
                  <v-col cols="12" md="6">
                    <v-btn color="primary" class="me-2 mb-2" prepend-icon="mdi-check">
                      Primario
                    </v-btn>
                    <v-btn color="secondary" class="me-2 mb-2" prepend-icon="mdi-account">
                      Secundario  
                    </v-btn>
                    <v-btn color="success" class="me-2 mb-2" prepend-icon="mdi-check-circle">
                      Éxito
                    </v-btn>
                    <v-btn color="warning" class="me-2 mb-2" prepend-icon="mdi-alert">
                      Advertencia
                    </v-btn>
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-alert type="info" class="mb-3">
                      Tema gubernamental IRCCA activado
                    </v-alert>
                    <v-alert type="success" class="mb-3">
                      Configuración Vuetify 3.9.7 exitosa
                    </v-alert>
                  </v-col>
                </v-row>
              </v-card-text>
              
              <v-card-actions>
                <v-btn color="accent" variant="outlined" prepend-icon="mdi-rocket">
                  Listo para desarrollo
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped></style>
