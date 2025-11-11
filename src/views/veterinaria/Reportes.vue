<template>
  <div class="fade-in">
    <h2 class="mb-4"><i class="bi bi-flag me-2"></i>Reportes Asignados</h2>

    <Loading v-if="cargando" />

    <div v-else class="card shadow-sm">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Título</th>
                <th>Descripción</th>
                <th>Ubicación</th>
                <th>Reportado por</th>
                <th>Estado</th>
                <th>Foto</th>
                <th class="text-center" style="min-width: 200px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in reportes" :key="r.idReporte">
                <td>{{ formatearFecha(r.fechaReporte) }}</td>
                <td>{{ r.titulo }}</td>
                <td>{{ truncar(r.descripcion, 50) }}</td>
                <td>{{ r.ubicacion || 'N/A' }}</td>
                <td>{{ nombreCompleto(r.usuario) }}</td>
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
                  <div class="d-flex gap-2 justify-content-center flex-wrap">
                    <button 
                      v-if="r.estado === 'Pendiente'" 
                      class="btn btn-sm btn-success" 
                      @click="aceptarReporte(r)"
                    >
                      <i class="bi bi-check"></i> Aceptar
                    </button>
                    <button 
                      v-if="r.estado === 'Pendiente'" 
                      class="btn btn-sm btn-danger" 
                      @click="rechazarReporte(r)"
                    >
                      <i class="bi bi-x"></i> Rechazar
                    </button>
                    <button 
                      v-if="r.estado === 'En proceso'" 
                      class="btn btn-sm btn-primary" 
                      @click="abrirModalRegistro(r)"
                    >
                      <i class="bi bi-clipboard-plus"></i> Atender
                    </button>
                    <button 
                      v-if="r.estado === 'En proceso' && r.animal" 
                      class="btn btn-sm btn-success" 
                      @click="cerrarReporte(r)"
                    >
                      <i class="bi bi-check-circle"></i> Cerrar
                    </button>
                    <span v-if="r.estado === 'Cerrado'" class="text-muted">Finalizado</span>
                  </div>
                </td>
              </tr>
              <tr v-if="reportes.length === 0">
                <td colspan="8" class="text-center py-3">No hay reportes asignados</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para crear registro médico -->
  <div class="modal fade" id="modalRegistroMedico" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-clipboard-pulse me-2"></i>
            {{ modalTitulo }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarRegistroMedico">
            <!-- Información del reporte -->
            <div class="alert alert-info" v-if="reporteSeleccionado">
              <strong>Reporte:</strong> {{ reporteSeleccionado.titulo }}<br>
              <strong>Descripción:</strong> {{ reporteSeleccionado.descripcion }}<br>
              <strong>Ubicación:</strong> {{ reporteSeleccionado.ubicacion }}
            </div>

            <!-- Animal (si ya existe) o crear nuevo -->
            <div class="mb-3" v-if="!reporteSeleccionado?.animal">
              <label class="form-label fw-bold">Primero debe registrar al animal encontrado</label>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Nombre del Animal *</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="nuevoAnimal.nombre"
                    required
                  />
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Especie *</label>
                  <select class="form-select" v-model="nuevoAnimal.especie" required>
                    <option value="">Seleccione...</option>
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div class="col-md-4 mb-3">
                  <label class="form-label">Edad *</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    v-model.number="nuevoAnimal.edad"
                    min="0"
                    required
                  />
                </div>

                <div class="col-md-4 mb-3">
                  <label class="form-label">Unidad *</label>
                  <select class="form-select" v-model="nuevoAnimal.unidadEdad" required>
                    <option value="Años">Años</option>
                    <option value="Meses">Meses</option>
                  </select>
                </div>

                <div class="col-md-4 mb-3">
                  <label class="form-label">Sexo *</label>
                  <select class="form-select" v-model="nuevoAnimal.sexo" required>
                    <option value="">Seleccione...</option>
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                    <option value="No_especificado">No especificado</option>
                  </select>
                </div>

                <div class="col-12 mb-3">
                  <label class="form-label">Descripción</label>
                  <textarea 
                    class="form-control" 
                    v-model="nuevoAnimal.descripcion"
                    rows="2"
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="alert alert-success" v-else>
              <strong>Animal:</strong> {{ reporteSeleccionado.animal.nombre }} 
              ({{ reporteSeleccionado.animal.especie }})
            </div>

            <hr>

            <!-- Registro Médico -->
            <h6 class="mb-3"><i class="bi bi-heart-pulse me-2"></i>Registro Médico</h6>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Tipo de Atención *</label>
                <select class="form-select" v-model="registroMedico.tipoAtencion" required>
                  <option value="">Seleccione...</option>
                  <option value="Consulta">Examen Inicial</option>
                  <option value="Tratamiento">Tratamiento</option>
                  <option value="Alta">Alta Médica</option>
                  <option value="Vacunacion">Vacunación</option>
                </select>
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label">Fecha de Atención</label>
                <input 
                  type="date" 
                  class="form-control" 
                  v-model="registroMedico.fechaAtencion"
                />
              </div>

              <div class="col-12 mb-3">
                <label class="form-label">Diagnóstico *</label>
                <textarea 
                  class="form-control" 
                  v-model="registroMedico.diagnostico"
                  rows="3"
                  placeholder="Describa el diagnóstico del animal"
                  required
                ></textarea>
              </div>

              <div class="col-12 mb-3">
                <label class="form-label">Tratamiento *</label>
                <textarea 
                  class="form-control" 
                  v-model="registroMedico.tratamiento"
                  rows="3"
                  placeholder="Medicamentos, dosis, procedimientos..."
                  required
                ></textarea>
              </div>

              <div class="col-12 mb-3">
                <label class="form-label">Notas Adicionales</label>
                <textarea 
                  class="form-control" 
                  v-model="registroMedico.notas"
                  rows="2"
                  placeholder="Observaciones, recomendaciones..."
                ></textarea>
              </div>
            </div>

            <div class="d-flex gap-2 justify-content-end">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="guardando">
                <span v-if="guardando" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-save me-2"></i>
                Guardar Registro
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import Loading from '@/components/common/Loading.vue';
import reporteService from '@/services/reporteService';
import registroMedicoService from '@/services/registroMedicoService';
import animalService from '@/services/animalService';
import veterinariaService from '@/services/veterinariaService';
import { alertaExito, alertaError, confirmar } from '@/utils/alertas';
import { formatearFecha } from '@/utils/helpers';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// Estado
const reportes = ref([]);
const cargando = ref(false);
const guardando = ref(false);

// Modal
let modalInstancia = null;
const reporteSeleccionado = ref(null);
const modalTitulo = ref('Crear Registro Médico');

// Formularios
const nuevoAnimal = ref({
  nombre: '',
  especie: '',
  edad: 0,
  unidadEdad: 'Años',
  sexo: '',
  descripcion: '',
  estado: 'Rescatado',
  organizacion: null
});

const registroMedico = ref({
  tipoAtencion: '',
  diagnostico: '',
  tratamiento: '',
  notas: '',
  fechaAtencion: new Date().toISOString().split('T')[0]
});

// Inicializar
onMounted(async () => {
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
  const confirmado = await confirmar('¿Aceptar este reporte?', 'El reporte pasará a estado En proceso');
  if (!confirmado) return;

  try {
    const reporteActualizado = await reporteService.obtenerPorId(reporte.idReporte);
    
    const payload = {
      titulo: reporteActualizado.titulo,
      descripcion: reporteActualizado.descripcion,
      ubicacion: reporteActualizado.ubicacion,
      estado: 'En proceso',
      fotoUrl: reporteActualizado.fotoUrl,
      fechaReporte: reporteActualizado.fechaReporte,
      idUsuario: reporteActualizado.usuario?.idUsuario || null,
      idOrganizacion: reporteActualizado.organizacion?.idOrganizacion || null,
      idVeterinaria: reporteActualizado.veterinaria?.idVeterinaria || null,
      idAnimal: reporteActualizado.animal?.idAnimal || null
    };
    
    await reporteService.actualizar(reporte.idReporte, payload);
    alertaExito('Reporte aceptado exitosamente');
    await cargarReportes();
  } catch (error) {
    console.error('Error al aceptar reporte:', error);
    alertaError('Error al aceptar el reporte');
  }
}

async function rechazarReporte(reporte) {
  const confirmado = await confirmar('¿Rechazar este reporte?', 'Esta acción no se puede deshacer');
  if (!confirmado) return;

  try {
    await reporteService.eliminar(reporte.idReporte);
    alertaExito('Reporte rechazado');
    await cargarReportes();
  } catch (error) {
    console.error('Error al rechazar reporte:', error);
    alertaError('Error al rechazar el reporte');
  }
}

async function cerrarReporte(reporte) {
  const confirmado = await confirmar(
    '¿Cerrar este reporte?',
    'El reporte se marcará como finalizado'
  );
  
  if (!confirmado) return;
  
  try {
    const reporteActualizado = await reporteService.obtenerPorId(reporte.idReporte);
    
    const payload = {
      titulo: reporteActualizado.titulo,
      descripcion: reporteActualizado.descripcion,
      ubicacion: reporteActualizado.ubicacion,
      estado: 'Cerrado',
      fotoUrl: reporteActualizado.fotoUrl,
      fechaReporte: reporteActualizado.fechaReporte,
      idUsuario: reporteActualizado.usuario?.idUsuario || null,
      idOrganizacion: reporteActualizado.organizacion?.idOrganizacion || null,
      idVeterinaria: reporteActualizado.veterinaria?.idVeterinaria || null,
      idAnimal: reporteActualizado.animal?.idAnimal || null
    };
    
    await reporteService.actualizar(reporte.idReporte, payload);
    alertaExito('Reporte cerrado exitosamente');
    await cargarReportes();
  } catch (error) {
    console.error('Error al cerrar reporte:', error);
    alertaError('Error al cerrar el reporte');
  }
}

function abrirModalRegistro(reporte) {
  reporteSeleccionado.value = reporte;
  
  // Si el reporte tiene animal, cargar sus datos
  if (reporte.animal) {
    modalTitulo.value = `Atender a ${reporte.animal.nombre}`;
  } else {
    modalTitulo.value = 'Registrar Animal y Crear Expediente';
    // Resetear formulario de animal
    nuevoAnimal.value = {
      nombre: '',
      especie: '',
      edad: 0,
      unidadEdad: 'Años',
      sexo: '',
      descripcion: reporte.descripcion || '',
      estado: 'Rescatado',
      organizacion: reporte.organizacion || null
    };
  }
  
  // Resetear formulario de registro médico
  registroMedico.value = {
    tipoAtencion: '',
    diagnostico: '',
    tratamiento: '',
    notas: `Atención por reporte: ${reporte.titulo}`,
    fechaAtencion: new Date().toISOString().split('T')[0]
  };
  
  modalInstancia?.show();
}

async function guardarRegistroMedico() {
  try {
    guardando.value = true;
    
    let idAnimal = reporteSeleccionado.value.animal?.idAnimal;
    
    // Si no existe el animal, crearlo primero
    if (!idAnimal) {
      const payloadAnimal = {
        nombre: nuevoAnimal.value.nombre,
        especie: nuevoAnimal.value.especie,
        edad: nuevoAnimal.value.edad,
        unidadEdad: nuevoAnimal.value.unidadEdad,
        sexo: nuevoAnimal.value.sexo,
        descripcion: nuevoAnimal.value.descripcion,
        estado: 'Rescatado',
        idOrganizacion: reporteSeleccionado.value.organizacion?.idOrganizacion || null
      };
      
      const animalCreado = await animalService.crear(payloadAnimal);
      idAnimal = animalCreado.idAnimal;
      
      // Vincular animal al reporte
      const reporteActualizado = await reporteService.obtenerPorId(reporteSeleccionado.value.idReporte);
      const payloadReporte = {
        titulo: reporteActualizado.titulo,
        descripcion: reporteActualizado.descripcion,
        ubicacion: reporteActualizado.ubicacion,
        estado: reporteActualizado.estado,
        fotoUrl: reporteActualizado.fotoUrl,
        fechaReporte: reporteActualizado.fechaReporte,
        idUsuario: reporteActualizado.usuario?.idUsuario || null,
        idOrganizacion: reporteActualizado.organizacion?.idOrganizacion || null,
        idVeterinaria: reporteActualizado.veterinaria?.idVeterinaria || null,
        idAnimal: idAnimal
      };
      
      await reporteService.actualizar(reporteSeleccionado.value.idReporte, payloadReporte);
    }
    
    // Crear registro médico
    const payloadRegistro = {
      tipo_atencion: registroMedico.value.tipoAtencion,
      diagnostico: registroMedico.value.diagnostico,
      tratamiento: registroMedico.value.tratamiento,
      notas: registroMedico.value.notas,
      fecha_atencion: registroMedico.value.fechaAtencion,
      idAnimal: idAnimal,
      idVeterinaria: authStore.user.veterinaria.idVeterinaria
    };
    
    await registroMedicoService.crear(payloadRegistro);
    
    alertaExito('Registro médico creado exitosamente');
    modalInstancia?.hide();
    await cargarReportes();
    
  } catch (error) {
    console.error('Error al guardar registro médico:', error);
    alertaError('Error al guardar el registro médico');
  } finally {
    guardando.value = false;
  }
}

// Funciones de utilidad
function nombreCompleto(usuario) {
  if (!usuario) return 'N/A';
  return `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || 'Sin nombre';
}

function formatearEstado(estado) {
  const estados = {
    'Pendiente': 'Pendiente',
    'En proceso': 'En Proceso',
    'Cerrado': 'Cerrado'
  };
  return estados[estado] || estado;
}

function colorPorEstado(estado) {
  const colores = {
    'Pendiente': 'warning',
    'En proceso': 'info',
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
