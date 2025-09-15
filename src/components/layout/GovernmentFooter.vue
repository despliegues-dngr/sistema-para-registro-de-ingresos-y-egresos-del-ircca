<template>
  <v-card-item
    class="bg-grey-lighten-5 pt-3 pb-5 px-6"
    style="border-top: 1px solid rgb(var(--v-theme-on-surface), 0.12)"
  >
    <v-row>
      <v-col cols="12" class="text-center">
        <!-- Link de registro para nuevos usuarios -->
        <v-btn
          variant="outlined"
          size="small"
          color="primary"
          class="mb-4"
          :prepend-icon="ICONS.NAVIGATION.REGISTER"
          @click="$emit('register')"
        >
          <span class="d-none d-sm-inline">Registrarse como nuevo usuario</span>
          <span class="d-inline d-sm-none">Registrarse</span>
        </v-btn>

        <!-- Acciones adicionales -->
        <div class="d-flex justify-center mt-1 mb-4">
          <slot name="actions">
            <v-btn
              variant="text"
              size="small"
              color="medium-emphasis"
              class="mx-2"
              @click="$emit('help')"
            >
              <v-icon size="small" class="mr-1">{{ ICONS.NAVIGATION.HELP }}</v-icon>
              Ayuda
            </v-btn>
          </slot>
        </div>

        <!-- Copyright ESMAPO -->
        <v-divider class="mx-auto mb-3" style="width: 80px"></v-divider>
        <p class="text-caption text-medium-emphasis mb-0">
          {{ SYSTEM_INFO.GOVERNMENT }}
        </p>
      </v-col>
    </v-row>
  </v-card-item>
</template>

<script setup lang="ts">
import { SYSTEM_INFO, ICONS } from '@/config/constants'

defineEmits<{
  help: []
  register: []
}>()
</script>
