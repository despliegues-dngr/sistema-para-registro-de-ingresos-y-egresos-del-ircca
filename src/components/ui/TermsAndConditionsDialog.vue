<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="800" persistent scrollable transition="dialog-bottom-transition">
    <v-card class="terms-dialog-card">
      <!-- Header institucional -->
      <v-card-title class="bg-primary pa-4">
        <div class="d-flex align-center">
          <v-icon size="24" color="white" class="mr-3">mdi-file-document-outline</v-icon>
          <div>
            <h3 class="text-h6 text-white mb-0">Términos y Condiciones</h3>
            <p class="text-caption text-blue-lighten-4 mb-0">Sistema de Control de Accesos del IRCCA</p>
          </div>
        </div>
      </v-card-title>

      <!-- Contenido scrollable -->
      <v-card-text class="pa-6" style="height: 500px;">
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
                <strong>Email:</strong> gr-deptoinfoygc@minterior.gub.uy
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
          <v-divider class="my-4" />
          <p class="text-caption text-center text-grey">
            Sistema regido por la Ley N° 18.331 de Protección de Datos Personales de Uruguay
          </p>
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-4 pt-2 bg-grey-lighten-5">
        <v-spacer />
        <v-btn
          color="secondary"
          variant="text"
          @click="$emit('close')"
          prepend-icon="mdi-close"
        >
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
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
.terms-dialog-card {
  border-radius: 12px;
}

.terms-content {
  line-height: 1.6;
}

.terms-content h4 {
  border-bottom: 2px solid #E3F2FD;
  padding-bottom: 8px;
}

.terms-content section {
  scroll-margin-top: 20px;
}

/* Mejorar legibilidad del texto */
.terms-content p, .terms-content li {
  color: rgba(0, 0, 0, 0.87);
}

/* Estilo para listas */
.terms-content ul {
  list-style-type: disc;
}

.terms-content ul li {
  margin-bottom: 4px;
}
</style>
