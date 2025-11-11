<template>
  <div class="fade-in">
    <h2 class="mb-4"><i class="bi bi-flag me-2"></i>Reportes Asignados</h2>

    <Loading v-if="cargando" />

    <div v-else>
      <!-- Filtros -->
      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Estado</label>
              <select v-model="filtroEstado" class="form-select">
                <option value="">Todos los estados</option>
                <option value="En_proceso">En proceso</option>
                <option value="Cerrado">Cerrado</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de reportes -->
      <div class="card shadow-sm">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Título</th>
                  <th>Descripción</th>
                  <th>Ubicación</th>
                  <th>Organización</th>
                  <th>Estado</th>
                  <th>Foto</th>
                  <th class="text-center" style="min-width: 200px;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in reportesFiltrados" :key="r.idReporte">
                  <td>{{ formatearFecha(r.fechaReporte) }}</td>
                  <td><strong>{{ r.titulo }}</strong></td>
                  <td>{{ truncar(r.descripcion, 50) }}</td>
                  <td>{{ r.ubicacion || 'N/A' }}</td>
                  <td>
                    <span v-if="r.organizacion" class="badge bg-info">
                      {{ r.organizacion.nombreOrganizacion }}
                    </span>
                    <span v-else>--</span>
                  </td>
                  <td>
                    <span class="badge" :class="`bg-${colorPorEstado(r.estado)}`">
                      {{ formatearEstado(r.estado) }}
                    </span>
                  </td>
                  <td>
                    <button v-if="r.fotoUrl" class="btn btn-sm btn-info" @click="verFoto(r.fotoUrl)">
                      <i class="bi bi-image"></i>
                    </button>
                    <span v-else>--</span>
                  </td>
                  <td class="text-center">
                    <!-- Estado: Pendiente de aceptación -->
                    <template v-if="r.estado === 'En_proceso' && !r.aceptadoPorVeterinaria">
                      <div class="d-flex gap-2 justify-content-center">
                        <button 
                          class="btn btn-sm btn-success" 
                          @click="aceptarReporte(r)"
                          title="Aceptar caso para atención"
                        >
                          <i class="bi bi-check-circle me-1"></i>Aceptar
                        </button>
                        <button 
                          class="btn btn-sm btn-danger" 
                          @click="rechazarReporte(r)"
                          title="Rechazar caso (vuelve a la organización)"
                        >
                          <i class="bi bi-x-circle me-1"></i>Rechazar
                        </button>
                      </div>
                    </template>

                    <!-- Estado: Aceptado, sin consulta médica -->
                    <template v-else-if="r.estado === 'En_proceso' && r.aceptadoPorVeterinaria && !tieneRegistrosMedicos(r)">
                      <div class="d-flex gap-2 justify-content-center">
                        <button 
                          class="btn btn-sm btn-primary" 
                          @click="abrirModalRegistro(r)"
                          title="Crear registro médico"
                        >
                          <i class="bi bi-clipboard-plus me-1"></i>Crear Consulta
                        </button>
                      </div>
                    </template>

                    <!-- Estado: Cerrado -->
                    <template v-else-if="r.estado === 'Cerrado'">
                      <span class="badge bg-secondary">
                        <i class="bi bi-check-circle me-1"></i>Completado
                      </span>
                    </template>

                    <!-- Otros estados -->
                    <template v-else>
                      <span class="text-muted small">Sin acciones</span>
                    </template>
                  </td>
                </tr>
                <tr v-if="reportesFiltrados.length === 0">
                  <td colspan="8" class="text-center py-4">
                    <i class="bi bi-inbox fs-1 text-muted"></i>
                    <p class="text-muted mt-2">No hay reportes asignados</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para crear registro médico -->
  <div class="modal fade" id="modalRegistroMedico" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            <i class="bi bi-clipboard-pulse me-2"></i>
            Registro Médico - {{ reporteSeleccionado?.titulo }}
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarRegistroMedico">
            <!-- Información del reporte -->
            <div class="alert alert-info mb-4">
              <div class="row">
                <div class="col-md-12">
                  <strong><i class="bi bi-file-text me-1"></i> Reporte:</strong> {{ reporteSeleccionado?.titulo }}
                </div>
                <div class="col-md-12 mt-2">
                  <strong><i class="bi bi-chat-text me-1"></i> Descripción:</strong> {{ reporteSeleccionado?.descripcion }}
                </div>
                <div class="col-md-12 mt-2">
                  <strong><i class="bi bi-geo-alt me-1"></i> Ubicación:</strong> {{ reporteSeleccionado?.ubicacion }}
                </div>
              </div>
            </div>

            <!-- Formulario de Registro Médico -->
            <div class="row">
              <div class="col-12 mb-3">
                <label class="form-label fw-bold">
                  <i class="bi bi-clipboard-check me-1"></i> Tipo de Atención *
                </label>
                <select class="form-select" v-model="registroMedico.tipoAtencion" required>
                  <option value="">Seleccione...</option>
                  <option value="Consulta">Consulta</option>
                  <option value="Tratamiento">Tratamiento</option>
                  <option value="Vacunacion">Vacunación</option>
                  <option value="Alta">Alta Médica</option>
                </select>
              </div>

              <div class="col-12 mb-3">
                <label class="form-label fw-bold">
                  <i class="bi bi-heart-pulse me-1"></i> Diagnóstico *
                </label>
                <textarea 
                  class="form-control" 
                  v-model="registroMedico.diagnostico"
                  rows="3"
                  placeholder="Describa el diagnóstico del animal..."
                  required
                  minlength="10"
                ></textarea>
                <small class="text-muted">Mínimo 10 caracteres</small>
              </div>

              <div class="col-12 mb-3">
                <label class="form-label fw-bold">
                  <i class="bi bi-prescription2 me-1"></i> Tratamiento *
                </label>
                <textarea 
                  class="form-control" 
                  v-model="registroMedico.tratamiento"
                  rows="3"
                  placeholder="Describa el tratamiento aplicado..."
                  required
                  minlength="10"
                ></textarea>
                <small class="text-muted">Mínimo 10 caracteres</small>
              </div>

              <div class="col-12 mb-3">
                <label class="form-label fw-bold">
                  <i class="bi bi-journal-text me-1"></i> Notas Adicionales
                </label>
                <textarea 
                  class="form-control" 
                  v-model="registroMedico.notas"
                  rows="2"
                  placeholder="Observaciones, recomendaciones o seguimiento..."
                ></textarea>
              </div>
            </div>

          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            <i class="bi bi-x-circle me-1"></i>Cancelar
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="guardarRegistroMedico"
            :disabled="guardando"
          >
            <span v-if="guardando" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-save me-1"></i>
            {{ guardando ? 'Guardando...' : 'Guardar Registro' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Modal } from 'bootstrap';
import Loading from '@/components/common/Loading.vue';
import reporteService from '@/services/reporteService';
import registroMedicoService from '@/services/registroMedicoService';
import veterinariaService from '@/services/veterinariaService';
import { alertaExito, alertaError, confirmar, manejarErrorAPI } from '@/utils/alertas';
import { formatearFecha, nombreCompleto } from '@/utils/helpers';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// Estado
const reportes = ref([]);
const cargando = ref(false);
const guardando = ref(false);
const filtroEstado = ref('');
const reportesAceptados = ref(new Set()); // Para trackear reportes aceptados localmente

// Modal
let modalInstancia = null;
const reporteSeleccionado = ref(null);

// Formulario de Registro Médico
const registroMedico = ref({
  tipoAtencion: '',
  diagnostico: '',
  tratamiento: '',
  notas: ''
});

// Computed
const reportesFiltrados = computed(() => {
  let result = reportes.value;
  if (filtroEstado.value) {
    result = result.filter(r => r.estado === filtroEstado.value);
  }
  // Agregar propiedad computada para saber si fue aceptado
  return result.map(r => ({
    ...r,
    aceptadoPorVeterinaria: reportesAceptados.value.has(r.idReporte) || tieneRegistrosMedicos(r)
  }));
});

// Helper: Verificar si un reporte tiene registros médicos
const tieneRegistrosMedicos = (reporte) => {
  // Verificar si el reporte tiene el array de registros médicos
  return reporte.registrosMedicos && reporte.registrosMedicos.length > 0;
};

// Inicializar
onMounted(async () => {
  // Cargar reportes aceptados desde localStorage
  const aceptadosGuardados = localStorage.getItem('reportesAceptadosVet');
  if (aceptadosGuardados) {
    try {
      const ids = JSON.parse(aceptadosGuardados);
      reportesAceptados.value = new Set(ids);
    } catch (e) {
      console.warn('Error al cargar reportes aceptados:', e);
    }
  }
  
  await cargarReportes();
  
  // Inicializar modal
  const modalEl = document.getElementById('modalRegistroMedico');
  if (modalEl) {
    modalInstancia = new Modal(modalEl);
  }
});

// Funciones principales
async function cargarReportes() {
  try {
    cargando.value = true;
    // Intentar obtener el id de veterinaria del usuario logueado
    let vetId = authStore.user?.veterinaria?.idVeterinaria || null;

    // Fallback: consultar la veterinaria por usuario si no está en el state
    if (!vetId && authStore.usuarioActual?.idUsuario) {
      try {
        const resp = await veterinariaService.getByUsuario(authStore.usuarioActual.idUsuario);
        vetId = resp?.data?.idVeterinaria || null;
      } catch (e) {
        console.warn('No se pudo obtener la veterinaria por usuario:', e);
      }
    }

    if (!vetId) {
      reportes.value = [];
      alertaError('Debe completar los datos de su clínica antes de gestionar reportes');
      // Redirigir a perfil veterinaria
      setTimeout(()=>{
        router.push({ name: 'VeterinariaPerfil' });
      },800);
      return;
    }

    // Cargar reportes por veterinaria usando el método nuevo; si falla, usar legacy
    let data = [];
    try {
      data = await reporteService.obtenerReportesPorVeterinaria(vetId);
    } catch (e) {
      const legacy = await reporteService.getByVeterinaria(vetId);
      data = legacy?.data || [];
    }

    reportes.value = Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error('Error al cargar reportes:', error);
    alertaError('Error al cargar reportes');
  } finally {
    cargando.value = false;
  }
}

async function aceptarReporte(reporte) {
  const confirmado = await confirmar(
    `¿Aceptar el caso "${reporte.titulo}"?`,
    'Podrás crear el registro médico después de aceptar'
  );
  if (!confirmado || !confirmado.isConfirmed) return;

  try {
    console.log('✅ Aceptando reporte:', reporte.idReporte);
    
    // Marcar como aceptado localmente
    reportesAceptados.value.add(reporte.idReporte);
    
    // Guardar en localStorage para persistencia
    localStorage.setItem(
      'reportesAceptadosVet', 
      JSON.stringify([...reportesAceptados.value])
    );
    
    console.log('📝 Reportes aceptados:', [...reportesAceptados.value]);
    
    alertaExito('Caso aceptado. Ahora puedes crear la consulta médica.');
  } catch (error) {
    console.error('❌ Error al aceptar reporte:', error);
    alertaError('Error al aceptar el reporte');
  }
}

async function rechazarReporte(reporte) {
  const confirmado = await confirmar(
    `¿Rechazar el caso "${reporte.titulo}"?`,
    'El reporte volverá a la organización para que asignen otra veterinaria'
  );
  if (!confirmado || !confirmado.isConfirmed) return;

  try {
    // Obtener datos actualizados del backend
    const { data: actual } = await reporteService.getById(reporte.idReporte);
    
    // Preparar payload quitando la veterinaria
    const payload = {
      titulo: actual.titulo,
      descripcion: actual.descripcion,
      ubicacion: actual.ubicacion,
      estado: 'En_proceso', // Sigue en proceso pero sin veterinaria
      usuario: actual.usuario ? { idUsuario: actual.usuario.idUsuario } : null,
      organizacion: actual.organizacion ? { idOrganizacion: actual.organizacion.idOrganizacion } : null,
      veterinaria: null // Quitar la veterinaria
    };

    // Solo agregar fotoUrl si existe
    if (actual.fotoUrl) {
      payload.fotoUrl = actual.fotoUrl;
    }

    await reporteService.update(reporte.idReporte, payload);
    alertaExito('Caso rechazado. La organización podrá asignar otra veterinaria.');
    await cargarReportes();
  } catch (error) {
    console.error('Error al rechazar reporte:', error);
    manejarErrorAPI(error);
  }
}

async function cerrarReporte(reporte) {
  const confirmado = await confirmar(
    `¿Finalizar el tratamiento de "${reporte.titulo}"?`,
    'El reporte se marcará como completado'
  );
  
  if (!confirmado || !confirmado.isConfirmed) return;
  
  await cerrarReporteAutomatico(reporte);
}

async function cerrarReporteAutomatico(reporte) {
  try {
    // Obtener datos actualizados del backend
    const { data: actual } = await reporteService.getById(reporte.idReporte);
    
    const payload = {
      titulo: actual.titulo,
      descripcion: actual.descripcion,
      ubicacion: actual.ubicacion,
      estado: 'Cerrado',
      usuario: actual.usuario ? { idUsuario: actual.usuario.idUsuario } : null,
      organizacion: actual.organizacion ? { idOrganizacion: actual.organizacion.idOrganizacion } : null,
      veterinaria: actual.veterinaria ? { idVeterinaria: actual.veterinaria.idVeterinaria } : null
    };

    // Solo agregar fotoUrl si existe
    if (actual.fotoUrl) {
      payload.fotoUrl = actual.fotoUrl;
    }
    
    await reporteService.update(reporte.idReporte, payload);
    
    // Limpiar del localStorage ya que el caso está cerrado
    reportesAceptados.value.delete(reporte.idReporte);
    localStorage.setItem(
      'reportesAceptadosVet', 
      JSON.stringify([...reportesAceptados.value])
    );
    
    alertaExito('Caso cerrado exitosamente.');
    await cargarReportes();
  } catch (error) {
    console.error('Error al cerrar reporte:', error);
    manejarErrorAPI(error);
  }
}

function abrirModalRegistro(reporte) {
  console.log('🔵 Abriendo modal para reporte:', reporte.idReporte);
  
  reporteSeleccionado.value = reporte;
  
  // Resetear formulario de registro médico
  registroMedico.value = {
    tipoAtencion: '',
    diagnostico: '',
    tratamiento: '',
    notas: ''
  };
  
  console.log('📋 Formulario reseteado');
  
  modalInstancia?.show();
}

async function guardarRegistroMedico() {
  try {
    guardando.value = true;
    
    console.log('💾 Iniciando guardado de registro médico...');
    console.log('📋 Datos del formulario:', registroMedico.value);
    
    // Validar campos obligatorios
    if (!registroMedico.value.tipoAtencion) {
      console.warn('⚠️ Falta tipo de atención');
      alertaError('Debe seleccionar un tipo de atención');
      return;
    }
    
    if (!registroMedico.value.diagnostico || registroMedico.value.diagnostico.trim() === '') {
      console.warn('⚠️ Falta diagnóstico');
      alertaError('Debe ingresar un diagnóstico');
      return;
    }
    
    if (registroMedico.value.diagnostico.trim().length < 10) {
      console.warn('⚠️ Diagnóstico muy corto');
      alertaError('El diagnóstico debe tener al menos 10 caracteres');
      return;
    }
    
    if (!registroMedico.value.tratamiento || registroMedico.value.tratamiento.trim() === '') {
      console.warn('⚠️ Falta tratamiento');
      alertaError('Debe ingresar un tratamiento');
      return;
    }
    
    if (registroMedico.value.tratamiento.trim().length < 10) {
      console.warn('⚠️ Tratamiento muy corto');
      alertaError('El tratamiento debe tener al menos 10 caracteres');
      return;
    }
    
    console.log('✅ Validaciones pasadas');
    
    // Obtener el ID de la veterinaria del usuario actual
    let vetId = authStore.user?.veterinaria?.idVeterinaria || null;

    if (!vetId && authStore.usuarioActual?.idUsuario) {
      try {
        const resp = await veterinariaService.getByUsuario(authStore.usuarioActual.idUsuario);
        vetId = resp?.data?.idVeterinaria || null;
      } catch (e) {
        console.warn('No se pudo obtener la veterinaria por usuario:', e);
      }
    }

    if (!vetId) {
      console.error('❌ No se pudo obtener el ID de veterinaria');
      alertaError('No se pudo obtener el ID de su veterinaria');
      return;
    }
    
    console.log('🏥 ID Veterinaria:', vetId);
    console.log('📄 ID Reporte:', reporteSeleccionado.value.idReporte);
    
    // Crear registro médico asociado al reporte
    // El backend espera exactamente esta estructura según el modelo JPA
    const payloadRegistro = {
      reporte: {
        idReporte: reporteSeleccionado.value.idReporte
      },
      veterinaria: {
        idVeterinaria: vetId
      },
      tipoAtencion: registroMedico.value.tipoAtencion,
      diagnostico: registroMedico.value.diagnostico.trim(),
      tratamiento: registroMedico.value.tratamiento.trim(),
      notas: registroMedico.value.notas ? registroMedico.value.notas.trim() : null
      // NO enviamos fechaAtencion, el backend la genera automáticamente con @PrePersist
    };

    console.log('📤 Payload a enviar:', JSON.stringify(payloadRegistro, null, 2));
    
    await registroMedicoService.create(payloadRegistro);
    
    console.log('✅ Registro médico creado exitosamente');
    
    alertaExito('Registro médico creado exitosamente.');
    
    // Cerrar el modal primero
    modalInstancia?.hide();
    
    // Ahora cerrar el reporte automáticamente
    console.log('🔒 Cerrando reporte automáticamente...');
    await cerrarReporteAutomatico(reporteSeleccionado.value);
    
    // Limpiar formulario
    registroMedico.value = {
      tipoAtencion: '',
      diagnostico: '',
      tratamiento: '',
      notas: ''
    };
    
    await cargarReportes();
    
  } catch (error) {
    console.error('❌ Error al guardar registro médico:', error);
    console.error('📋 Respuesta del servidor:', error.response?.data);
    console.error('📊 Status:', error.response?.status);
    console.error('🔍 Detalles completos:', error.response);
    
    // Mostrar error más específico
    if (error.response?.data?.message) {
      alertaError(`Error: ${error.response.data.message}`);
    } else if (error.response?.status === 400) {
      alertaError('Error de validación. Verifica que todos los campos estén correctos.');
    } else if (error.response?.status === 500) {
      alertaError('Error en el servidor. Contacta al administrador.');
    } else {
      manejarErrorAPI(error);
    }
  } finally {
    guardando.value = false;
  }
}

// Funciones de utilidad
function formatearEstado(estado) {
  const estados = {
    'Pendiente': 'Pendiente',
    'En_proceso': 'En Proceso',
    'Cerrado': 'Cerrado'
  };
  return estados[estado] || estado.replace(/_/g, ' ');
}

function colorPorEstado(estado) {
  const colores = {
    'Pendiente': 'warning',
    'En_proceso': 'info',
    'Cerrado': 'success'
  };
  return colores[estado] || 'secondary';
}

function truncar(texto, max) {
  if (!texto) return 'N/A';
  return texto.length > max ? texto.substring(0, max) + '...' : texto;
}

function verFoto(url) {
  window.open(url, '_blank');
}
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
