<template>
  <FullScreenModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="Términos y Condiciones"
    subtitle="Sistema de Control de Accesos del IRCCA"
    icon="mdi mdi-file-document-outline"
    header-color="primary"
    @close="$emit('close')"
  >
    <div class="terms-content">
          <!-- Introducción -->
          <section class="mb-6">
            <h4 class="text-h6 text-primary mb-3">1. INTRODUCCIÓN Y ACEPTACIÓN</h4>
            <p class="text-body-2 mb-3">
              El presente documento establece los términos y condiciones para el uso del Sistema de Registro de Accesos
              desarrollado por la <strong>Dirección Nacional de la Guardia Republicana (DNGR)</strong> para el control de
              accesos en las instalaciones del <strong>Instituto de Regulación y Control del Cannabis (IRCCA)</strong>.
            </p>
            <p class="text-body-2">
              Al registrarse como operador del sistema, usted acepta expresamente todos los términos contenidos en este documento
              y se compromete a cumplir con la normativa nacional vigente en materia de protección de datos personales
              (Ley N° 18.331).
            </p>
          </section>

          <!-- Protección de Datos -->
          <section class="mb-6">
            <h4 class="text-h6 text-primary mb-3">2. PROTECCIÓN DE DATOS PERSONALES</h4>

            <h5 class="text-subtitle-1 font-weight-medium mb-2">¿Qué datos se recolectan?</h5>
            <p class="text-body-2 mb-3">
              El sistema registra: nombre completo, cédula de identidad, destino de la visita,
              fecha y hora de ingreso/egreso, y opcionalmente datos de vehículo (tipo y matrícula).
            </p>

            <h5 class="text-subtitle-1 font-weight-medium mb-2">¿Para qué se usan los datos?</h5>
            <p class="text-body-2 mb-3">
              Los datos se utilizan exclusivamente para el control de accesos a las instalaciones
              del IRCCA por razones de seguridad institucional. No se utilizarán para otros fines.
            </p>

            <h5 class="text-subtitle-1 font-weight-medium mb-2">Derechos de las personas</h5>
            <p class="text-body-2 mb-2">
              Toda persona cuyos datos sean registrados tiene derecho a:
            </p>
            <ul class="text-body-2 ml-4 mb-3">
              <li><strong>Acceso:</strong> Conocer qué datos se registraron</li>
              <li><strong>Rectificación:</strong> Solicitar corrección de datos incorrectos</li>
              <li><strong>Actualización:</strong> Mantener los datos vigentes</li>
              <li><strong>Supresión:</strong> Solicitar eliminación cuando sea legalmente procedente</li>
            </ul>
            <p class="text-body-2 text-grey-darken-1">
              El ejercicio de estos derechos es gratuito y debe ser respondido en un plazo máximo de 5 días hábiles.
            </p>
          </section>

          <!-- Obligaciones del Operador -->
          <section class="mb-6">
            <h4 class="text-h6 text-primary mb-3">3. SUS OBLIGACIONES COMO OPERADOR</h4>
            <p class="text-body-2 mb-2">Al usar este sistema, usted debe:</p>
            <ul class="text-body-2 ml-4 mb-3">
              <li>Usar el sistema solo para fines institucionales autorizados</li>
              <li>Mantener en secreto su usuario y contraseña</li>
              <li>Registrar información verdadera y completa</li>
              <li>Reportar inmediatamente cualquier problema de seguridad</li>
              <li>No acceder a datos sin autorización</li>
            </ul>
          </section>

          <!-- Retención de Datos -->
          <section class="mb-6">
            <h4 class="text-h6 text-primary mb-3">4. CONSERVACIÓN Y SEGURIDAD DE DATOS</h4>
            <p class="text-body-2 mb-3">
              Los registros se conservan en el sistema durante <strong>12 meses</strong>.
              Los respaldos se mantienen por <strong>5 años</strong> para auditorías institucionales,
              luego son eliminados de forma segura.
            </p>
            <p class="text-body-2">
              Se han adoptado medidas técnicas y organizativas para garantizar la seguridad,
              integridad y confidencialidad de los datos personales, evitando su alteración,
              pérdida o acceso no autorizado.
            </p>
          </section>

          <!-- Contacto -->
          <section class="mb-4">
            <h4 class="text-h6 text-primary mb-3">5. CONTACTO</h4>
            <p class="text-body-2 mb-3">
              Para ejercer sus derechos o realizar consultas sobre datos personales, contacte a:
            </p>
            <div class="ml-4">
              <p class="text-body-2 mb-2">
                <strong>Email:</strong> gr-depto.infoygc@minterior.gub.uy
              </p>
              <p class="text-body-2 mb-2">
                <strong>Teléfono:</strong> 099 505 227
              </p>
              <p class="text-body-2">
                <strong>Dirección:</strong> Av. José Pedro Varela S/N, Montevideo
              </p>
            </div>
          </section>

      <!-- Nota legal al pie -->
      <hr class="divider" />
      <p class="legal-note">
        Sistema regido por la Ley N° 18.331 de Protección de Datos Personales de Uruguay
      </p>
    </div>

    <!-- Footer con botón cerrar -->
    <template #footer>
      <div class="footer-actions">
        <button class="btn-secondary" @click="$emit('close')">
          <i class="mdi mdi-close"></i>
          Cerrar
        </button>
      </div>
    </template>
  </FullScreenModal>
</template>

<script setup lang="ts">
import FullScreenModal from './FullScreenModal.vue'

interface Props {
  modelValue: boolean
}

interface Emits {
  'update:modelValue': [value: boolean]
  close: []
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
/* ========================================
   🎨 CONTENIDO DE TÉRMINOS
   ======================================== */

.terms-content {
  line-height: 1.6;
  padding: 0;
}

.terms-content h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1565C0;
  border-bottom: 2px solid #E3F2FD;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.terms-content h5 {
  font-size: 1rem;
  font-weight: 600;
  color: #424242;
  margin-bottom: 0.5rem;
}

.terms-content section {
  margin-bottom: 1.5rem;
}

.terms-content p {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 0.75rem;
}

.terms-content ul {
  list-style-type: disc;
  margin-left: 1.5rem;
  margin-bottom: 0.75rem;
}

.terms-content ul li {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 0.25rem;
}

.divider {
  border: none;
  border-top: 1px solid #E0E0E0;
  margin: 1.5rem 0;
}

.legal-note {
  font-size: 0.75rem;
  text-align: center;
  color: #757575;
  margin: 0;
}

/* ========================================
   🎨 FOOTER ACTIONS
   ======================================== */

.footer-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: #424242;
  border: 1px solid #BDBDBD;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  /* ⚡ GPU ACCELERATION */
  transform: translateZ(0);
  backface-visibility: hidden;
}

.btn-secondary:hover {
  background: #F5F5F5;
  border-color: #757575;
  transform: translateY(-2px) translateZ(0);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-secondary:active {
  transform: scale(0.98) translateZ(0);
}

.btn-secondary i {
  font-size: 1.125rem;
}

/* ========================================
   🎨 UTILIDADES VUETIFY-LIKE
   ======================================== */

.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.ml-4 { margin-left: 1rem; }

.text-h6 { font-size: 1.25rem; }
.text-subtitle-1 { font-size: 1rem; }
.text-body-2 { font-size: 0.875rem; }
.text-caption { font-size: 0.75rem; }

.text-primary { color: #1565C0; }
.text-grey-darken-1 { color: #757575; }

.font-weight-medium { font-weight: 500; }
</style>
