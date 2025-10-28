<template>
  <div class="info-section">
    <div class="alert alert-info">
      <div class="alert-header">
        <i class="mdi mdi-information-outline"></i>
        <strong>Backup Completo Incluye:</strong>
      </div>
      <ul class="backup-items-list">
        <li v-for="item in backupItems" :key="item">
          <i class="mdi mdi-check-circle text-success"></i>
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const backupItems = [
  'Registros (ingresos/salidas)',
  'Usuarios (cuentas de operadores)',
  'Configuración (ajustes del sistema)',
  'Personas conocidas (recurrentes)',
  'Logs de auditoría (AGESIC)',
  'Encuestas de satisfacción'
]
</script>

<style scoped>
.info-section {
  margin-bottom: 2rem;
}

.alert {
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid;
}

.alert-info {
  background-color: rgba(33, 150, 243, 0.1);
  border-left-color: #2196F3;
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

.backup-items-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.backup-items-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  font-size: 0.95rem;
}

.backup-items-list li i {
  font-size: 1.1rem;
}

.text-success {
  color: #4CAF50;
}
</style>
