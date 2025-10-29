<template>
  <div v-if="backupsList.length > 0" class="backups-list-section">
    <div class="section-header" @click="toggleList">
      <div class="section-title">
        <i class="mdi mdi-history"></i>
        Copias automáticas guardadas ({{ backupsList.length }})
      </div>
      <i :class="['mdi', showList ? 'mdi-chevron-up' : 'mdi-chevron-down']"></i>
    </div>
    
    <transition name="expand">
      <div v-if="showList" class="backups-list-container">
        <div class="section-description">
          <i class="mdi mdi-information-outline"></i>
          <p>El sistema guarda copias automáticamente cada 2 horas. Puedes descargar cualquiera de ellas.</p>
        </div>
        <div class="backups-list">
        <div
          v-for="backup in backupsList"
          :key="backup.id"
          class="backup-item"
        >
          <div class="backup-item-icon">
            <i class="mdi mdi-database"></i>
          </div>
          <div class="backup-item-info">
            <div class="backup-item-title">{{ backup.fileName }}</div>
            <div class="backup-item-subtitle">
              {{ formatDate(backup.timestamp) }} - 
              {{ formatSize(backup.size) }}
            </div>
          </div>
          <button
            class="btn-icon"
            @click="$emit('export-backup', backup.id)"
            :disabled="exportingId === backup.id"
          >
            <i v-if="exportingId !== backup.id" class="mdi mdi-download"></i>
            <i v-else class="mdi mdi-loading mdi-spin"></i>
          </button>
        </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface BackupInfo {
  id: string
  timestamp: Date
  size: number
  fileName: string
}

interface Props {
  backupsList: BackupInfo[]
  exportingId: string | null
}

interface Emits {
  'export-backup': [backupId: string]
}

defineProps<Props>()
defineEmits<Emits>()

const showList = ref(false)

function toggleList() {
  showList.value = !showList.value
}

function formatDate(timestamp: Date): string {
  return new Date(timestamp).toLocaleString()
}

function formatSize(size: number): string {
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}
</script>

<style scoped>
.backups-list-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.section-header:hover {
  background: #f0f0f0;
  border-color: #1565C0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: #424242;
  font-size: 0.95rem;
}

.backups-list-container {
  margin-top: 1rem;
}

.section-description {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(33, 150, 243, 0.05);
  border: 1px solid rgba(33, 150, 243, 0.2);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.section-description i {
  font-size: 1.25rem;
  color: #2196F3;
  margin-top: 0.1rem;
}

.section-description p {
  margin: 0;
  font-size: 0.9rem;
  color: #424242;
  line-height: 1.5;
}

.backups-list {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.backup-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  transition: background 0.2s;
}

.backup-item:last-child {
  border-bottom: none;
}

.backup-item:hover {
  background: #f9f9f9;
}

.backup-item-icon {
  font-size: 1.5rem;
  color: #1976D2;
}

.backup-item-info {
  flex: 1;
}

.backup-item-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.backup-item-subtitle {
  font-size: 0.85rem;
  color: #757575;
}

.btn-icon {
  padding: 0.5rem;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #1976D2;
}

.btn-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon i {
  font-size: 1.25rem;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.mdi-spin {
  animation: spin 1s linear infinite;
}
</style>
