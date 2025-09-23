<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="800" persistent scrollable transition="dialog-bottom-transition">
    <v-card class="terms-dialog-card">
      <!-- Header institucional -->
      <v-card-title class="bg-primary pa-4">
        <div class="d-flex align-center">
          <v-icon size="24" color="white" class="mr-3">mdi-file-document-outline</v-icon>
          <div>
            <h3 class="text-h6 text-white mb-0">Términos y Condiciones</h3>
            <p class="text-caption text-blue-lighten-4 mb-0">Sistema para registros del IRCCA</p>
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
              y se compromete a cumplir con la normativa nacional vigente en materia de protección de datos personales.
            </p>
          </section>

          <!-- Definiciones -->
          <section class="mb-6">
            <h4 class="text-h6 text-primary mb-3">2. DEFINICIONES BÁSICAS</h4>
            <div class="ml-4">
              <p class="text-body-2 mb-2">
                <strong>Datos Personales:</strong> Información de cualquier tipo referida a personas físicas identificadas o identificables.
              </p>
              <p class="text-body-2 mb-2">
                <strong>Usuario/Operador:</strong> Funcionario autorizado para operar el sistema de registro de accesos.
              </p>
              <p class="text-body-2 mb-2">
                <strong>Responsable del Tratamiento:</strong> Dirección Nacional de la Guardia Republicana (DNGR), como organismo responsable de determinar los fines y medios del tratamiento de datos en el sistema.
              </p>
              <p class="text-body-2">
                <strong>Titular de Datos:</strong> Persona física cuyos datos personales son objeto de tratamiento.
              </p>
            </div>
          </section>

          <!-- Protección de Datos -->
          <section class="mb-6">
            <h4 class="text-h6 text-primary mb-3">3. PROTECCIÓN DE DATOS PERSONALES</h4>
            
            <h5 class="text-subtitle-1 font-weight-medium mb-2">3.1 Finalidad del Tratamiento</h5>
            <p class="text-body-2 mb-3">
              Los datos personales recolectados tienen como única finalidad el control de accesos a las instalaciones del IRCCA 
              por razones de seguridad institucional y cumplimiento de los protocolos de seguridad establecidos por la DNGR 
              en el marco del Servicio Art. 222.
            </p>

            <h5 class="text-subtitle-1 font-weight-medium mb-2">3.2 Base Legal</h5>
            <p class="text-body-2 mb-3 ml-4">
              El tratamiento se fundamenta en el cumplimiento de obligaciones legales (Ley N° 18.331 y Decreto N° 64/020) 
              y el interés público en la seguridad de instalaciones gubernamentales.
            </p>

            <h5 class="text-subtitle-1 font-weight-medium mb-2">3.3 Derechos de los Titulares</h5>
            <div class="ml-4">
              <p class="text-body-2 mb-2">Los titulares de datos tienen derecho a:</p>
              <ul class="text-body-2 ml-4 mb-3">
                <li>Acceso: Conocer qué datos se procesan</li>
                <li>Rectificación: Solicitar corrección de datos inexactos</li>
                <li>Actualización: Mantener los datos vigentes</li>
                <li>Supresión: Eliminar datos cuando sea legalmente procedente</li>
                <li>Inclusión: Agregar datos faltantes relevantes</li>
                <li>Oposición: Objetar el tratamiento en casos específicos</li>
              </ul>
            </div>
          </section>

          <!-- Seguridad -->
          <section class="mb-6">
            <h4 class="text-h6 text-primary mb-3">4. MEDIDAS DE SEGURIDAD</h4>
            <p class="text-body-2 mb-3">
              El sistema implementa medidas técnicas y organizativas apropiadas para garantizar un nivel de seguridad adecuado:
            </p>
            <ul class="text-body-2 ml-4 mb-3">
              <li>Cifrado AES-256 de todos los datos almacenados</li>
              <li>Autenticación robusta de operadores</li>
              <li>Control de acceso basado en roles (RBAC)</li>
              <li>Registro de auditoría inmutable</li>
              <li>Estrategia de respaldo 3-2-1</li>
              <li>Gestión segura de sesiones de usuario</li>
            </ul>
          </section>

          <!-- Obligaciones del Operador -->
          <section class="mb-6">
            <h4 class="text-h6 text-primary mb-3">5. OBLIGACIONES DEL OPERADOR</h4>
            <div class="ml-4">
              <p class="text-body-2 mb-2">Como operador del sistema, usted se compromete a:</p>
              <ul class="text-body-2 ml-4 mb-3">
                <li>Usar el sistema exclusivamente para fines institucionales autorizados</li>
                <li>Mantener la confidencialidad de sus credenciales de acceso</li>
                <li>Registrar información veraz y completa</li>
                <li>Reportar inmediatamente cualquier incidente de seguridad</li>
                <li>Cumplir con los procedimientos establecidos para el tratamiento de datos</li>
                <li>No acceder a datos sin autorización expresa</li>
              </ul>
            </div>
          </section>

          <!-- Retención de Datos -->
          <section class="mb-6">
            <h4 class="text-h6 text-primary mb-3">6. POLÍTICA DE RETENCIÓN</h4>
            <p class="text-body-2 mb-3">
              Los datos operativos se conservan en el sistema durante 12 meses para fines de seguridad activa. 
              Los respaldos se mantienen por 5 años para propósitos de auditoría institucional, después de los 
              cuales son eliminados de forma segura.
            </p>
          </section>

          <!-- Contacto -->
          <section class="mb-6">
            <h4 class="text-h6 text-primary mb-3">7. CONTACTO</h4>
            <p class="text-body-2 mb-3">
              Para ejercer sus derechos o realizar consultas sobre el tratamiento de datos personales, 
              puede contactar a la Dirección Nacional de la Guardia Republicana a través de:
            </p>
            <div class="ml-4">
              <p class="text-body-2 mb-2">
                <strong>Email:</strong> gr-deptoinfoygc@minterior.gub.uy
              </p>
              <p class="text-body-2 mb-2">
                <strong>Dirección:</strong> Av. José Pedro Varela S/N, Montevideo, Uruguay
              </p>
              <p class="text-body-2 mb-2">
                <strong>Teléfono:</strong> 099 505 227
              </p>
              <p class="text-body-2">
                <strong>Institución:</strong> Dirección Nacional Guardia Republicana - Departamento de Información y Gestión de Calidad
              </p>
            </div>
          </section>

          <!-- Ley Aplicable -->
          <section class="mb-6">
            <h4 class="text-h6 text-primary mb-3">8. LEY APLICABLE Y JURISDICCIÓN</h4>
            <p class="text-body-2 mb-3">
              Los presentes términos se rigen por la legislación de la República Oriental del Uruguay, 
              especialmente la Ley N° 18.331 de Protección de Datos Personales y sus decretos reglamentarios.
            </p>
            <p class="text-body-2">
              Cualquier controversia será sometida a la competencia de los Tribunales de Montevideo, Uruguay.
            </p>
          </section>

          <!-- Modificaciones -->
          <section class="mb-4">
            <h4 class="text-h6 text-primary mb-3">9. MODIFICACIONES</h4>
            <p class="text-body-2">
              La DNGR se reserva el derecho de modificar estos términos y condiciones cuando lo considere necesario 
              para mejorar la seguridad o el funcionamiento del sistema, informando a los usuarios registrados con 
              una antelación mínima de 30 días.
            </p>
          </section>
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
  border-radius: 12px !important;
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
