<template>
  <div class="warning-section">
    <div class="alert alert-warning">
      <div class="alert-header">
        <i class="mdi mdi-alert"></i>
        <strong>Importante:</strong>
      </div>
      <ul class="warning-list">
        <li v-for="warning in warnings" :key="warning">
          {{ warning }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const warnings = [
  'Guarda el archivo .ircca en un lugar seguro (pendrive, nube)',
  'Lo necesitarás para recuperar datos si se pierde la tablet',
  'El archivo está cifrado con tu clave de sesión'
]
</script>

<style scoped>
.warning-section {
  margin-bottom: 2rem;
}

.alert {
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid;
}

.alert-warning {
  background-color: rgba(255, 152, 0, 0.1);
  border-left-color: #FF9800;
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.alert-header i {
  font-size: 1.25rem;
}

.warning-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.warning-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  font-size: 0.95rem;
}

.warning-list li::before {
  content: '•';
  font-size: 1.2rem;
  color: #FF9800;
}
</style>
