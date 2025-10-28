<template>
  <div v-if="backupsList.length > 0" class="backups-list-section">
    <div class="section-header" @click="toggleList">
      <div class="section-title">
        <i class="mdi mdi-history"></i>
        Ver backups disponibles ({{ backupsList.length }})
      </div>
      <i :class="['mdi', showList ? 'mdi-chevron-up' : 'mdi-chevron-down']"></i>
    </div>
    
    <transition name="expand">
      <div v-if="showList" class="backups-list">
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
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.section-header:hover {
  background: #eeeeee;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.backups-list {
  margin-top: 1rem;
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
