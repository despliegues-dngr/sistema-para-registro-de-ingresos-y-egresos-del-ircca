<template>
  <FullScreenModal
    v-model="modelValue"
    title="Centro de Ayuda"
    subtitle="Sistema de Control de Accesos del IRCCA"
    icon="mdi mdi-help-circle"
    header-color="primary"
    @close="handleClose"
  >
    <!-- Información de soporte técnico -->
    <div class="text-center mb-6">
      <i class="mdi mdi-headset support-icon"></i>
      <h4 class="support-title">Soporte Técnico</h4>
    </div>

    <!-- Contactos de soporte -->
    <div class="contact-buttons">
      <button class="contact-btn email-btn" @click="copyToClipboard(supportEmail)">
        <i class="mdi mdi-email"></i>
        <span>{{ supportEmail }}</span>
      </button>

      <button class="contact-btn whatsapp-btn">
        <i class="mdi mdi-whatsapp"></i>
        <span>WhatsApp: {{ whatsappNumber }}</span>
      </button>
    </div>

    <!-- Card: Credenciales -->
    <div class="info-card info-card--info">
      <div class="info-card-header">
        <i class="mdi mdi-account-question"></i>
        <strong>¿No tiene credenciales?</strong>
      </div>
      <p class="info-card-text">
        Si es la primera vez que ingresa y aún no tiene usuario, seleccione
        <strong>"REGISTRARSE COMO NUEVO USUARIO"</strong>.
      </p>
      <p class="info-card-text">Para otros casos, contacte al soporte técnico.</p>
    </div>

    <!-- Card: Responsabilidad -->
    <div class="info-card info-card--warning">
      <div class="info-card-header">
        <i class="mdi mdi-shield-account"></i>
        <strong>Responsabilidad</strong>
      </div>
      <p class="info-card-text">Mantenga sus credenciales seguras y personales.</p>
    </div>

    <!-- Footer con botón -->
    <template #footer>
      <div class="footer-actions">
        <button class="btn-primary" @click="closeDialog">
          <i class="mdi mdi-check"></i>
          Entendido
        </button>
      </div>
    </template>
  </FullScreenModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FullScreenModal from './FullScreenModal.vue'

interface Props {
  modelValue: boolean
  supportEmail?: string
  whatsappNumber?: string
}

interface Emits {
  'update:modelValue': [value: boolean]
  close: []
}

const props = withDefaults(defineProps<Props>(), {
  supportEmail: 'gr-depto.infoygc@minterior.gub.uy',
  whatsappNumber: '092 703 856',
})

const emit = defineEmits<Emits>()

const modelValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const closeDialog = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleClose = () => {
  closeDialog()
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // TODO: Mostrar toast de confirmación
  } catch (error) {
    console.error('Error al copiar:', error)
  }
}
</script>

<style scoped>
/* ========================================
   🎨 SOPORTE TÉCNICO
   ======================================== */

.support-icon {
  font-size: 3rem;
  color: #1565c0;
  margin-bottom: 0.5rem;
}

.support-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #212121;
  margin: 0;
}

/* ========================================
   🎨 BOTONES DE CONTACTO
   ======================================== */

.contact-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.contact-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 2px solid;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;

  /* ⚡ GPU ACCELERATION */
  transform: translateZ(0);
  backface-visibility: hidden;
}

.contact-btn i {
  font-size: 1.25rem;
}

.email-btn {
  border-color: #1565c0;
  color: #1565c0;
}

.email-btn:hover {
  background: #e3f2fd;
  transform: translateY(-2px) translateZ(0);
}

.whatsapp-btn {
  border-color: #25d366;
  color: #25d366;
}

.whatsapp-btn:hover {
  background: #e8f5e9;
  transform: translateY(-2px) translateZ(0);
}

.contact-btn:active {
  transform: scale(0.98) translateZ(0);
}

/* ========================================
   🎨 INFO CARDS
   ======================================== */

.info-card {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;

  /* ⚡ GPU ACCELERATION */
  transform: translateZ(0);
}

.info-card--info {
  background: #e3f2fd;
  border-left: 4px solid #1976d2;
}

.info-card--warning {
  background: #fff3e0;
  border-left: 4px solid #f57c00;
}

.info-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.info-card--info .info-card-header {
  color: #1976d2;
}

.info-card--warning .info-card-header {
  color: #f57c00;
}

.info-card-header i {
  font-size: 1.25rem;
}

.info-card-text {
  font-size: 0.875rem;
  color: #424242;
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.info-card-text:last-child {
  margin-bottom: 0;
}

/* ========================================
   🎨 FOOTER ACTIONS
   ======================================== */

.footer-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #1565c0;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  /* ⚡ GPU ACCELERATION */
  transform: translateZ(0);
  backface-visibility: hidden;
}

.btn-primary:hover {
  background: #0d47a1;
  transform: translateY(-2px) translateZ(0);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-primary:active {
  transform: scale(0.98) translateZ(0);
}

.btn-primary i {
  font-size: 1.125rem;
}

/* ========================================
   📱 RESPONSIVE
   ======================================== */

@media (max-width: 600px) {
  .support-icon {
    font-size: 2.5rem;
  }

  .support-title {
    font-size: 1.125rem;
  }
}
</style>
