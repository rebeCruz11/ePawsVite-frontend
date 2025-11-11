<template>
  <div class="fade-in">
    <ClientHero title="Mis Reportes" subtitle="Consulta y gestiona tus reportes enviados">
      <template #actions>
        <button class="btn btn-action primary" @click="$router.push('/cliente/crear-reporte')">
          <i class="bi bi-plus-circle me-1"></i>
          Nuevo Reporte
        </button>
      </template>
    </ClientHero>
    
    <!-- Toolbar de filtros -->
    <div class="mb-3 d-flex align-items-center gap-2 flex-wrap">
      <div class="input-group" style="min-width:260px;">
        <input type="text" class="form-control form-control-sm" placeholder="Buscar título, ubicación, organización..." v-model="busquedaTexto" />
        <button class="btn btn-sm btn-outline-secondary" type="button" @click="busquedaTexto = ''">Limpiar</button>
      </div>

      <select class="form-select form-select-sm" v-model="filtroAsignado" style="max-width:200px;">
        <option value="">Todos (Asignado)</option>
        <option value="organizacion">Asignado a Organización</option>
        <option value="veterinaria">Asignado a Veterinaria</option>
        <option value="sin">Sin asignar</option>
      </select>

      <select class="form-select form-select-sm" v-model="filtroEstadoReporte" style="max-width:180px;">
        <option value="">Todos los estados</option>
        <option v-for="e in estadosUnicos" :key="e" :value="e">{{ formatearEstado(e) }}</option>
      </select>

      <div class="d-flex gap-1" style="min-width:220px;">
        <input type="date" class="form-control form-control-sm" v-model="fechaDesde" />
        <input type="date" class="form-control form-control-sm" v-model="fechaHasta" />
      </div>

      <div class="ms-auto text-end small text-muted">
        Mostrando <strong>{{ reportesFiltrados.length }}</strong> de {{ reportes.length }}
      </div>
    </div>
    
    <Loading v-if="cargando" />
    
    <div v-else class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Título</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Asignado a</th>
                <th>Foto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reporte in reportesPaginados" :key="reporte.idReporte">
                <td>{{ formatearFechaHora(reporte.fechaReporte) }}</td>
                <td>{{ reporte.titulo }}</td>
                <td>{{ reporte.ubicacion || 'N/A' }}</td>
                <td>
                  <span 
                    v-if="reporte.estado === 'Cerrado' && !reporte.organizacion"
                    class="badge bg-danger"
                    title="Este reporte fue rechazado"
                  >
                    Rechazado
                  </span>
                  <span 
                    v-else
                    class="badge" 
                    :class="`bg-${colorPorEstado(reporte.estado)}`"
                  >
                    {{ formatearEstado(reporte.estado) }}
                  </span>
                </td>
                <td>
                  <div v-if="reporte.organizacion">
                    <i class="bi bi-building me-1"></i>
                    {{ reporte.organizacion.nombreOrganizacion }}
                  </div>
                  <div v-if="reporte.veterinaria">
                    <i class="bi bi-hospital me-1"></i>
                    {{ reporte.veterinaria.nombreClinica }}
                  </div>
                  <span v-if="!reporte.organizacion && !reporte.veterinaria" class="text-muted">
                    Sin asignar
                  </span>
                </td>
                <td>
                  <span v-if="reporte.fotoUrl" class="d-inline-block">
                    <img 
                      :src="reporte.fotoUrl" 
                      alt="Foto reporte"
                      style="width: 60px; height: 60px; object-fit: cover; cursor: pointer; border-radius: 8px;"
                      class="img-thumbnail"
                      @click="verFoto(reporte.fotoUrl)"
                    />
                  </span>
                  <span v-else class="text-muted">
                    <i class="bi bi-image"></i> Sin foto
                  </span>
                </td>
                <td>
                  <button 
                    class="btn btn-sm btn-warning me-2" 
                    @click="abrirModalEditar(reporte)"
                    v-if="reporte.estado === 'Pendiente'"
                  >
                    <i class="bi bi-pencil"></i> Editar
                  </button>
                  <button 
                    class="btn btn-sm btn-primary me-2" 
                    @click="abrirModalReasignar(reporte)"
                    v-if="reporte.estado === 'Cerrado' && !reporte.organizacion"
                    title="Este reporte fue rechazado, puedes reasignarlo"
                  >
                    <i class="bi bi-arrow-repeat"></i> Reasignar
                  </button>
                  <span 
                    v-if="reporte.estado === 'Cerrado' && reporte.organizacion"
                    class="badge bg-success"
                  >
                    <i class="bi bi-check-circle me-1"></i> Completado
                  </span>
                  <span 
                    v-if="reporte.estado === 'En_proceso'"
                    class="text-muted small"
                  >
                    En atención
                  </span>
                </td>
              </tr>
              <tr v-if="reportes.length === 0">
                <td colspan="7" class="text-center text-muted py-4">
                  <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                  No has creado reportes
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-3">
          <small class="text-muted">Resultados filtrados: {{ reportesFiltrados.length }}</small>
          <Pagination v-if="totalPaginas > 1" :pagina-actual="paginaActual" :total-paginas="totalPaginas" @cambiar-pagina="(p) => paginaActual = p" />
        </div>
      </div>
    </div>
  </div>

  <!-- Modal editar reporte -->
  <div class="modal fade" id="editarReporteModal" tabindex="-1">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Editar Reporte</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <form @submit.prevent="guardarEdicion">
          <div class="modal-body">
            <div class="row">
              <!-- Columna Izquierda: Imagen -->
              <div class="col-md-5">
                <h6 class="mb-3">
                  <i class="bi bi-camera me-2"></i>
                  Foto del Reporte
                </h6>
                <ImageUploader 
                  ref="imageUploaderEdit"
                  :multiple="false"
                  :max-files="1"
                  :model-value="editForm.fotoUrl"
                  placeholder="Arrastra una imagen aquí"
                  @files-selected="archivosEditSeleccionados"
                />
                <small class="text-muted mt-2 d-block">
                  <i class="bi bi-info-circle me-1"></i>
                  Puedes cambiar la foto del reporte
                </small>
              </div>

              <!-- Columna Derecha: Formulario -->
              <div class="col-md-7">
                <div class="mb-3">
                  <label class="form-label">Título *</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="editForm.titulo" 
                    :class="{'is-invalid': editErrores.titulo}" 
                    required
                    maxlength="150"
                  >
                  <div class="invalid-feedback">{{ editErrores.titulo }}</div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Descripción *</label>
                  <textarea 
                    class="form-control" 
                    v-model="editForm.descripcion" 
                    :class="{'is-invalid': editErrores.descripcion}" 
                    rows="4" 
                    required
                    maxlength="5000"
                  ></textarea>
                  <div class="invalid-feedback">{{ editErrores.descripcion }}</div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Ubicación</label>
                  <input 
                    class="form-control" 
                    v-model="editForm.ubicacion"
                    maxlength="200"
                  >
                </div>
                
                <div class="mb-3">
                  <label class="form-label">
                    <i class="bi bi-building me-1"></i>
                    Organización *
                  </label>
                  <div class="input-group">
                    <input 
                      type="text" 
                      class="form-control" 
                      :value="editOrganizacionSeleccionada?.nombreOrganizacion || 'Ninguna seleccionada'"
                      readonly
                    >
                    <button 
                      type="button" 
                      class="btn btn-outline-primary" 
                      @click="abrirModalOrganizacionEdit"
                    >
                      <i class="bi bi-search me-1"></i>
                      Cambiar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x-circle me-2"></i>
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="guardandoEdicion">
              <span v-if="guardandoEdicion">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Guardando...
              </span>
              <span v-else>
                <i class="bi bi-check-circle me-2"></i>
                Guardar cambios
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Modal para seleccionar organización (Edit/Reasignar) -->
  <div class="modal fade" id="organizacionModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            <i class="bi bi-building me-2"></i>
            Seleccionar Organización
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="cerrarModalOrganizacion"></button>
        </div>
        <div class="modal-body">
          <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            Selecciona la organización que atenderá el reporte.
          </div>

          <!-- Búsqueda -->
          <div class="mb-3">
            <label class="form-label fw-bold">
              <i class="bi bi-search me-2"></i>Buscar Organización
            </label>
            <input 
              type="text" 
              class="form-control" 
              v-model="busquedaOrg"
              placeholder="Buscar por nombre o ubicación..."
            />
          </div>

          <!-- Lista de organizaciones -->
          <div class="list-group" style="max-height: 400px; overflow-y: auto;">
            <button 
              type="button"
              v-for="org in organizacionesFiltradas" 
              :key="org.idOrganizacion"
              class="list-group-item list-group-item-action"
              :class="{ 'active': organizacionTempSeleccionada?.idOrganizacion === org.idOrganizacion }"
              @click="organizacionTempSeleccionada = org"
            >
              <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">
                  <i class="bi bi-building me-2"></i>
                  {{ org.nombreOrganizacion }}
                </h6>
                <small v-if="organizacionTempSeleccionada?.idOrganizacion === org.idOrganizacion">
                  <i class="bi bi-check-circle-fill text-success"></i>
                </small>
              </div>
              <p class="mb-1 small" v-if="org.ubicacion">
                <i class="bi bi-geo-alt me-1"></i>{{ org.ubicacion }}
              </p>
              <small class="text-muted" v-if="org.telefono">
                <i class="bi bi-telephone me-1"></i>{{ org.telefono }}
              </small>
            </button>
            <div v-if="organizacionesFiltradas.length === 0" class="text-center text-muted py-4">
              <i class="bi bi-inbox fs-1 d-block mb-2"></i>
              No se encontraron organizaciones
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="cerrarModalOrganizacion">
            Cancelar
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="confirmarSeleccionOrganizacion"
            :disabled="!organizacionTempSeleccionada"
          >
            <i class="bi bi-check-circle me-2"></i>
            Seleccionar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Reasignar Reporte -->
  <div class="modal fade" id="reasignarReporteModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-warning">
          <h5 class="modal-title">
            <i class="bi bi-arrow-repeat me-2"></i>
            Reasignar Reporte a Nueva Organización
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="alert alert-warning">
            <i class="bi bi-exclamation-triangle me-2"></i>
            Tu reporte fue rechazado. Selecciona una nueva organización para reasignarlo.
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold">Reporte:</label>
            <p class="mb-0">{{ reasignarForm.titulo }}</p>
          </div>

          <!-- Búsqueda de organizaciones -->
          <div class="mb-3">
            <label class="form-label fw-bold">
              <i class="bi bi-search me-2"></i>Buscar Organización
            </label>
            <input 
              type="text" 
              class="form-control" 
              v-model="busquedaOrgReasignar"
              placeholder="Buscar por nombre o ubicación..."
            />
          </div>

          <!-- Lista de organizaciones -->
          <div class="list-group" style="max-height: 350px; overflow-y: auto;">
            <button 
              type="button"
              v-for="org in organizacionesFiltradasReasignar" 
              :key="org.idOrganizacion"
              class="list-group-item list-group-item-action"
              :class="{ 'active': reasignarOrganizacionSeleccionada?.idOrganizacion === org.idOrganizacion }"
              @click="reasignarOrganizacionSeleccionada = org"
            >
              <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">
                  <i class="bi bi-building me-2"></i>
                  {{ org.nombreOrganizacion }}
                </h6>
                <small v-if="reasignarOrganizacionSeleccionada?.idOrganizacion === org.idOrganizacion">
                  <i class="bi bi-check-circle-fill text-success"></i>
                </small>
              </div>
              <p class="mb-1 small" v-if="org.ubicacion">
                <i class="bi bi-geo-alt me-1"></i>{{ org.ubicacion }}
              </p>
              <small class="text-muted" v-if="org.telefono">
                <i class="bi bi-telephone me-1"></i>{{ org.telefono }}
              </small>
            </button>
            <div v-if="organizacionesFiltradasReasignar.length === 0" class="text-center text-muted py-4">
              <i class="bi bi-inbox fs-1 d-block mb-2"></i>
              No se encontraron organizaciones
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Cancelar
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="confirmarReasignacion"
            :disabled="!reasignarOrganizacionSeleccionada || guardandoReasignacion"
          >
            <span v-if="guardandoReasignacion">
              <span class="spinner-border spinner-border-sm me-2"></span>
              Reasignando...
            </span>
            <span v-else>
              <i class="bi bi-check-circle me-2"></i>
              Confirmar Reasignación
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import { useAuthStore } from '../../stores/auth';
import Loading from '../../components/common/Loading.vue';
import ImageUploader from '../../components/common/ImageUploader.vue';
import ClientHero from '../../components/common/ClientHero.vue';
import reporteService from '../../services/reporteService';
import organizacionService from '../../services/organizacionService';
import veterinariaService from '../../services/veterinariaService';
import cloudinaryService from '../../services/cloudinaryService';
// dashboard styles are imported globally via ClienteLayout
import Pagination from '../../components/common/Pagination.vue';
import { alertaHTML, alertaError, manejarErrorAPI, toast } from '../../utils/alertas';
import { validarReporte } from '../../utils/validaciones';
import { colorPorEstado, formatearEstado, formatearFechaHora } from '../../utils/helpers';

export default {
  name: 'ClienteMisReportes',
  components: { 
    Loading,
    ImageUploader,
    ClientHero
  },
  setup() {
    const authStore = useAuthStore();
    const cargando = ref(true);
    const guardandoEdicion = ref(false);
    const guardandoReasignacion = ref(false);
  const reportes = ref([]);
  const paginaActual = ref(1);
  const itemsPorPagina = 8;
  // filtros
  const busquedaTexto = ref('');
  const filtroAsignado = ref(''); // 'organizacion' | 'veterinaria' | 'sin' | ''
  const filtroEstadoReporte = ref('');
  const fechaDesde = ref('');
  const fechaHasta = ref('');
    const organizaciones = ref([]);
    const veterinarias = ref([]);
    const imageUploaderEdit = ref(null);
    const archivoEditNuevo = ref(null);
    const busquedaOrg = ref('');
    const busquedaOrgReasignar = ref('');
    const organizacionTempSeleccionada = ref(null);
    const editOrganizacionSeleccionada = ref(null);
    const reasignarOrganizacionSeleccionada = ref(null);

    const editForm = ref({});
    const editErrores = ref({});
    const reasignarForm = ref({});
    let modal = null;
    let modalOrganizacion = null;
    let modalReasignar = null;
    let modoModal = ref(''); // 'edit' o 'reasignar'

    // Computed para filtrar organizaciones en edición
    const organizacionesFiltradas = computed(() => {
      if (!busquedaOrg.value) return organizaciones.value;
      const busqueda = busquedaOrg.value.toLowerCase();
      return organizaciones.value.filter(org => 
        org.nombreOrganizacion.toLowerCase().includes(busqueda) ||
        (org.ubicacion && org.ubicacion.toLowerCase().includes(busqueda))
      );
    });

    // Computed para filtrar organizaciones en reasignación
    const organizacionesFiltradasReasignar = computed(() => {
      if (!busquedaOrgReasignar.value) return organizaciones.value;
      const busqueda = busquedaOrgReasignar.value.toLowerCase();
      return organizaciones.value.filter(org => 
        org.nombreOrganizacion.toLowerCase().includes(busqueda) ||
        (org.ubicacion && org.ubicacion.toLowerCase().includes(busqueda))
      );
    });
    
    const cargarReportes = async () => {
      try {
        const response = await reporteService.getByUsuario(authStore.usuarioActual.idUsuario);
        reportes.value = response.data;
      } catch (error) {
        manejarErrorAPI(error);
      } finally {
        cargando.value = false;
      }
    };

    // filtros aplicados
    const reportesFiltrados = computed(() => {
      const q = (busquedaTexto.value || '').toString().toLowerCase().trim();
      const desde = fechaDesde.value ? new Date(fechaDesde.value) : null;
      const hasta = fechaHasta.value ? new Date(fechaHasta.value) : null;

      return (reportes.value || []).filter(r => {
        // asignado
        if (filtroAsignado.value) {
          if (filtroAsignado.value === 'organizacion' && !r.organizacion) return false;
          if (filtroAsignado.value === 'veterinaria' && !r.veterinaria) return false;
          if (filtroAsignado.value === 'sin' && (r.organizacion || r.veterinaria)) return false;
        }
        // estado
        if (filtroEstadoReporte.value && r.estado !== filtroEstadoReporte.value) return false;
        // rango fechas
        if ((desde || hasta) && r.fechaReporte) {
          const fecha = new Date(r.fechaReporte);
          if (desde && fecha < new Date(desde.setHours(0,0,0,0))) return false;
          if (hasta && fecha > new Date(hasta.setHours(23,59,59,999))) return false;
        }
        // texto
        if (q) {
          const titulo = (r.titulo || '').toString().toLowerCase();
          const ubic = (r.ubicacion || '').toString().toLowerCase();
          const org = (r.organizacion?.nombreOrganizacion || '').toString().toLowerCase();
          const vet = (r.veterinaria?.nombreClinica || '').toString().toLowerCase();
          if (!titulo.includes(q) && !ubic.includes(q) && !org.includes(q) && !vet.includes(q)) return false;
        }
        return true;
      });
    });

    const totalPaginas = computed(() => Math.max(1, Math.ceil(reportesFiltrados.value.length / itemsPorPagina)));
    const reportesPaginados = computed(() => {
      const start = (paginaActual.value - 1) * itemsPorPagina;
      return reportesFiltrados.value.slice(start, start + itemsPorPagina);
    });
    
    const verFoto = (url) => {
      alertaHTML(`<img src="${url}" class="img-fluid" alt="Foto del reporte">`, 'Foto del Reporte');
    };

    const archivosEditSeleccionados = (archivos) => {
      archivoEditNuevo.value = archivos.length > 0 ? archivos[0] : null;
    };

    const abrirModalEditar = (reporte) => {
      archivoEditNuevo.value = null;
      editForm.value = {
        idReporte: reporte.idReporte,
        titulo: reporte.titulo,
        descripcion: reporte.descripcion,
        ubicacion: reporte.ubicacion || '',
        fotoUrl: reporte.fotoUrl || '',
        idOrganizacion: reporte.organizacion?.idOrganizacion || '',
        idVeterinaria: reporte.veterinaria?.idVeterinaria || ''
      };
      editOrganizacionSeleccionada.value = reporte.organizacion || null;
      editErrores.value = {};
      
      // Limpiar el uploader
      if (imageUploaderEdit.value) {
        imageUploaderEdit.value.limpiar();
      }
      
      modal.show();
    };

    const abrirModalOrganizacionEdit = () => {
      modoModal.value = 'edit';
      busquedaOrg.value = '';
      organizacionTempSeleccionada.value = editOrganizacionSeleccionada.value;
      modalOrganizacion.show();
    };

    const abrirModalOrganizacionReasignar = () => {
      modoModal.value = 'reasignar';
      busquedaOrg.value = '';
      organizacionTempSeleccionada.value = reasignarOrganizacionSeleccionada.value;
      modalOrganizacion.show();
    };

    const confirmarSeleccionOrganizacion = () => {
      if (modoModal.value === 'edit') {
        editOrganizacionSeleccionada.value = organizacionTempSeleccionada.value;
        editForm.value.idOrganizacion = organizacionTempSeleccionada.value?.idOrganizacion || '';
      } else if (modoModal.value === 'reasignar') {
        reasignarOrganizacionSeleccionada.value = organizacionTempSeleccionada.value;
      }
      modalOrganizacion.hide();
    };

    const cerrarModalOrganizacion = () => {
      organizacionTempSeleccionada.value = null;
      busquedaOrg.value = '';
      modalOrganizacion.hide();
    };

    const abrirModalReasignar = (reporte) => {
      reasignarForm.value = {
        idReporte: reporte.idReporte,
        titulo: reporte.titulo
      };
      reasignarOrganizacionSeleccionada.value = null;
      busquedaOrgReasignar.value = '';
      modalReasignar.show();
    };

    const confirmarReasignacion = async () => {
      if (!reasignarOrganizacionSeleccionada.value) {
        alertaError('Debes seleccionar una organización');
        return;
      }

      try {
        guardandoReasignacion.value = true;
        
        const id = parseInt(reasignarForm.value.idReporte, 10);
        
        // Obtener datos actuales del reporte
        const { data: reporteActual } = await reporteService.getById(id);
        
        // Preparar payload completo manteniendo los datos del reporte
        const datos = {
          titulo: reporteActual.titulo || '',
          descripcion: reporteActual.descripcion || '',
          ubicacion: reporteActual.ubicacion || '',
          estado: 'Pendiente', // Resetear a Pendiente
          usuario: reporteActual.usuario ? { idUsuario: reporteActual.usuario.idUsuario } : null,
          organizacion: { idOrganizacion: reasignarOrganizacionSeleccionada.value.idOrganizacion },
          veterinaria: null // Limpiar veterinaria
        };

        // Solo agregar fotoUrl si existe
        if (reporteActual.fotoUrl) {
          datos.fotoUrl = reporteActual.fotoUrl;
        }

        console.log('Reasignando reporte:', datos);

        await reporteService.update(id, datos);
        toast('Reporte reasignado correctamente a ' + reasignarOrganizacionSeleccionada.value.nombreOrganizacion, 'success');
        modalReasignar.hide();
        await cargarReportes();
      } catch (error) {
        console.error('Error al reasignar:', error);
        manejarErrorAPI(error);
      } finally {
        guardandoReasignacion.value = false;
      }
    };

    const guardarEdicion = async () => {
      const reporteObj = {
        ...editForm.value,
        usuario: { idUsuario: authStore.usuarioActual.idUsuario }
      };

      const erroresVal = validarReporte(reporteObj);
      if (Object.keys(erroresVal).length > 0) {
        const mensajes = Object.values(erroresVal).join('\n');
        await alertaError(mensajes, 'Errores en el formulario');
        editErrores.value = erroresVal;
        return;
      }

      try {
        guardandoEdicion.value = true;
        
        let fotoUrl = editForm.value.fotoUrl; // Mantener la URL existente
        
        // Si hay una nueva imagen, subirla a Cloudinary
        if (archivoEditNuevo.value) {
          try {
            console.log('Subiendo nueva imagen a Cloudinary...');
            fotoUrl = await cloudinaryService.subirImagen(
              archivoEditNuevo.value, 
              'epaws/reportes'
            );
            console.log('Nueva imagen subida:', fotoUrl);
          } catch (error) {
            console.error('Error al subir imagen:', error);
            alertaError('No se pudo subir la nueva imagen. Se mantendrá la foto anterior.');
            // Continuar con la foto anterior
          }
        }

        const datos = {
          titulo: editForm.value.titulo,
          descripcion: editForm.value.descripcion,
          ubicacion: editForm.value.ubicacion || null,
          fotoUrl: fotoUrl,
          estado: 'Pendiente'
        };

        if (editForm.value.idOrganizacion) {
          datos.organizacion = { idOrganizacion: parseInt(editForm.value.idOrganizacion) };
        } else {
          datos.organizacion = null;
        }

        // No permitir que el usuario asigne veterinaria
        datos.veterinaria = null;

        await reporteService.update(editForm.value.idReporte, datos);
        toast('Reporte actualizado correctamente', 'success');
        modal.hide();
        await cargarReportes();
      } catch (error) {
        manejarErrorAPI(error);
      } finally {
        guardandoEdicion.value = false;
      }
    };
    
    onMounted(async () => {
      await cargarReportes();
      // cargar organizaciones y veterinarias para selects
      try {
        const [orgs, vets] = await Promise.all([
          organizacionService.getAll(),
          veterinariaService.getAll()
        ]);
        organizaciones.value = orgs.data;
        veterinarias.value = vets.data;
      } catch (e) {
        // no bloquear si falla
      }

      modal = new Modal(document.getElementById('editarReporteModal'));
      modalOrganizacion = new Modal(document.getElementById('organizacionModal'));
      modalReasignar = new Modal(document.getElementById('reasignarReporteModal'));
    });
    
    return {
      cargando,
      guardandoEdicion,
      guardandoReasignacion,
      reportes,
      verFoto,
      organizaciones,
      veterinarias,
      // filtros
      busquedaTexto,
      filtroAsignado,
      filtroEstadoReporte,
      fechaDesde,
      fechaHasta,
      reportesFiltrados,
      // paginación
      Pagination,
      paginaActual,
      itemsPorPagina,
      totalPaginas,
      reportesPaginados,
      // modales y helpers
      organizacionesFiltradas,
      organizacionesFiltradasReasignar,
      busquedaOrg,
      busquedaOrgReasignar,
      organizacionTempSeleccionada,
      editOrganizacionSeleccionada,
      reasignarOrganizacionSeleccionada,
      imageUploaderEdit,
      archivosEditSeleccionados,
      abrirModalEditar,
      abrirModalOrganizacionEdit,
      abrirModalOrganizacionReasignar,
      confirmarSeleccionOrganizacion,
      cerrarModalOrganizacion,
      abrirModalReasignar,
      confirmarReasignacion,
      reasignarForm,
      editForm,
      editErrores,
      guardarEdicion,
      colorPorEstado,
      formatearEstado,
      formatearFechaHora
    };
  }
}
</script>
