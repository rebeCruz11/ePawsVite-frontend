<template>
  <div class="fade-in">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0"><i class="bi bi-flag me-2"></i> Reportes Asignados</h2>
      <button 
        class="btn btn-primary btn-sm" 
        @click="cargarReportes"
        :disabled="cargando"
      >
        <i class="bi bi-arrow-clockwise me-1"></i>
        {{ cargando ? 'Cargando...' : 'Actualizar' }}
      </button>
    </div>

    <Loading v-if="cargando" />

    <div v-else class="card shadow-sm">
      <div class="card-body p-3 p-md-4">
        <!-- Filtros -->
        <div class="row g-3 mb-3">
          <div class="col-md-6 col-lg-4">
            <input
              type="text"
              v-model="filtroTitulo"
              @input="onFiltroChange"
              class="form-control form-control-sm"
              placeholder="Filtrar por título"
              aria-label="Filtro por título"
            />
          </div>
          <div class="col-md-6 col-lg-4">
            <select
              v-model="filtroEstado"
              @change="onFiltroChange"
              class="form-select form-select-sm"
              aria-label="Filtro por estado"
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En_proceso">En proceso</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </div>
        </div>

        <!-- Tabla -->
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Título</th>
                <th>Reportado por</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Veterinaria</th>
                <th>Foto</th>
                <th class="text-center" style="min-width: 270px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reporte in reportesPaginados" :key="reporte.idReporte">
                <td>{{ formatearFecha(reporte.fechaReporte) }}</td>
                <td>{{ reporte.titulo }}</td>
                <td>{{ nombreCompleto(reporte.usuario) }}</td>
                <td>{{ reporte.ubicacion || 'N/A' }}</td>
                <td><span :class="`badge bg-${colorPorEstado(reporte.estado)}`">{{ formatearEstado(reporte.estado) }}</span></td>
                <td>
                  <span v-if="reporte.veterinaria && reporte.veterinaria.usuario">
                    {{ reporte.veterinaria.nombreClinica || reporte.veterinaria.usuario.nombre }}
                  </span>
                  <span v-else class="text-muted fst-italic">No asignada</span>
                </td>
                <td>
                  <button
                    v-if="reporte.fotoUrl"
                    class="btn btn-sm btn-info me-2"
                    @click="verFoto(reporte.fotoUrl)"
                  >
                    <i class="bi bi-image"></i>
                  </button>
                  <span v-else>--</span>
                </td>
                <td class="text-center">
                  <!-- Estado: Pendiente -->
                  <template v-if="reporte.estado === 'Pendiente'">
                    <button class="btn btn-sm btn-success me-2" @click="aceptarReporte(reporte)">
                      <i class="bi bi-check-circle me-1"></i>Aceptar
                    </button>
                    <button class="btn btn-sm btn-danger" @click="rechazarReporte(reporte)">
                      <i class="bi bi-x-circle me-1"></i>Rechazar
                    </button>
                  </template>

                  <!-- Estado: En proceso -->
                  <template v-else-if="reporte.estado === 'En_proceso'">
                    <template v-if="!reporte.veterinaria">
                      <!-- Sin veterinaria asignada: puede asignar o cerrar directamente -->
                      <div class="d-flex flex-column gap-2 align-items-center">
                        <div class="d-flex gap-2">
                          <select 
                            class="form-select form-select-sm" 
                            v-model="reporte._idVetSeleccionada" 
                            aria-label="Seleccionar veterinaria"
                            style="min-width: 180px;"
                          >
                            <option value="">Seleccionar veterinaria</option>
                            <option 
                              v-for="v in veterinarias" 
                              :key="v.idVeterinaria" 
                              :value="v.idVeterinaria"
                            >
                              {{ v.nombreClinica || (v.usuario && v.usuario.nombre) || `Vet ${v.idVeterinaria}` }}
                            </option>
                          </select>
                          <button 
                            class="btn btn-sm btn-primary" 
                            :disabled="!reporte._idVetSeleccionada" 
                            @click="asignarVeterinaria(reporte, reporte._idVetSeleccionada)"
                          >
                            <i class="bi bi-send me-1"></i>Asignar
                          </button>
                        </div>
                        <button 
                          class="btn btn-sm btn-success" 
                          @click="cerrarSinVeterinaria(reporte)"
                          title="Cerrar reporte (animal ya rescatado, no necesita atención médica)"
                        >
                          <i class="bi bi-check-circle me-1"></i>Cerrar (Rescatado)
                        </button>
                      </div>
                    </template>
                    <template v-else>
                      <!-- Con veterinaria asignada -->
                      <template v-if="tieneRegistrosMedicos(reporte)">
                        <!-- La veterinaria YA ACEPTÓ y creó registros médicos: solo mostrar estado -->
                        <div class="d-flex flex-column gap-2 align-items-center">
                          <span class="badge bg-success">
                            <i class="bi bi-clipboard-check me-1"></i>
                            En atención médica
                          </span>
                          <small class="text-muted">
                            La veterinaria está atendiendo el caso
                          </small>
                        </div>
                      </template>
                      <template v-else>
                        <!-- Veterinaria asignada pero NO ha aceptado: puede reasignar o cerrar -->
                        <div class="d-flex flex-column gap-2 align-items-center">
                          <span class="badge bg-info">
                            <i class="bi bi-hospital me-1"></i>
                            Asignado a: {{ reporte.veterinaria.nombreClinica || 'Veterinaria' }}
                          </span>
                          <div class="d-flex gap-2">
                            <button 
                              class="btn btn-sm btn-warning" 
                              @click="reasignarVeterinaria(reporte)"
                              title="La veterinaria rechazó, asignar otra"
                            >
                              <i class="bi bi-arrow-repeat me-1"></i>Reasignar
                            </button>
                            <button 
                              class="btn btn-sm btn-success" 
                              @click="cerrarReporte(reporte)"
                              title="Cerrar reporte (tratamiento completado)"
                            >
                              <i class="bi bi-check-circle me-1"></i>Cerrar
                            </button>
                          </div>
                        </div>
                      </template>
                    </template>
                  </template>

                  <!-- Estado: Cerrado -->
                  <template v-else-if="reporte.estado === 'Cerrado'">
                    <span class="badge bg-secondary">
                      <i class="bi bi-check-circle me-1"></i>Cerrado
                    </span>
                  </template>

                  <!-- Otros estados -->
                  <template v-else>
                    <span class="text-muted">No hay acciones disponibles</span>
                  </template>
                </td>
              </tr>
              <tr v-if="reportesFiltrados.length === 0">
                <td colspan="8" class="text-center py-3">No hay reportes</td>
              </tr>
            </tbody>
          </table>
        </div>

        <nav v-if="totalPaginas > 1" aria-label="pagination" class="mt-3">
          <ul class="pagination justify-content-center mb-0">
            <li class="page-item" :class="{ disabled: paginaActual === 1 }">
              <button class="page-link" @click="paginaActual = paginaActual -1" :disabled="paginaActual===1">Anterior</button>
            </li>
            <li v-for="page in paginas" :key="page" class="page-item" :class="{ active: paginaActual===page }">
              <button class="page-link" @click="paginaActual=page">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: paginaActual===totalPaginas }">
              <button class="page-link" @click="paginaActual=paginaActual+1" :disabled="paginaActual===totalPaginas">Siguiente</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import Loading from '../../components/common/Loading.vue';
import reporteService from '../../services/reporteService';
import organizacionService from '../../services/organizacionService';
import veterinariaService from '../../services/veterinariaService';
import registroMedicoService from '../../services/registroMedicoService';
import { alertaHTML, manejarErrorAPI, alertaExito, alertaError, confirmar } from '../../utils/alertas';
import { colorPorEstado, formatearEstado, formatearFecha, nombreCompleto } from '../../utils/helpers';

export default {
  name: 'OrganizacionReportes',
  components: { Loading },
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
  const cargando = ref(true);
    const reportes = ref([]);
    const veterinarias = ref([]);
  const idOrganizacionRef = ref(null);
    const filtroEstado = ref('');
    const filtroTitulo = ref('');
    const paginaActual = ref(1);
    const itemsPorPagina = 7;

    const cargarReportes = async () => {
      try {
        cargando.value = true;
        if (!authStore.usuarioActual?.idUsuario) {
          alertaError('Usuario no autenticado');
          return;
        }

  const org = await organizacionService.getByUsuario(authStore.usuarioActual.idUsuario);
  idOrganizacionRef.value = org?.data?.idOrganizacion || null;
  const response = await reporteService.getByOrganizacion(idOrganizacionRef.value);
        
        // Procesar cada reporte
        const reportesConDatos = await Promise.all(
          (response.data || []).map(async (r) => {
            r._idVetSeleccionada = '';
            
            // Consultar registros médicos si tiene veterinaria asignada
            if (r.veterinaria && r.estado === 'En_proceso') {
              try {
                console.log(`🔍 Consultando registros médicos para reporte ${r.idReporte}...`);
                console.log(`📍 URL: /registros-medicos/reporte/${r.idReporte}`);
                
                const registros = await registroMedicoService.getByReporte(r.idReporte);
                console.log(`📋 Respuesta completa:`, registros);
                console.log(`📋 Tipo de respuesta:`, typeof registros);
                console.log(`📋 Es array:`, Array.isArray(registros));
                
                // La respuesta puede ser: {data: [...]} o directamente [...]
                if (Array.isArray(registros)) {
                  r.registrosMedicos = registros;
                  console.log(`✅ Caso 1: Array directo, ${registros.length} registros`);
                } else if (registros.data && Array.isArray(registros.data)) {
                  r.registrosMedicos = registros.data;
                  console.log(`✅ Caso 2: Objeto con data, ${registros.data.length} registros`);
                } else {
                  r.registrosMedicos = [];
                  console.warn(`⚠️ Formato inesperado de respuesta`);
                }
                
                console.log(`📊 Total registros médicos para reporte ${r.idReporte}: ${r.registrosMedicos.length}`);
              } catch (e) {
                console.error(`❌ Error al cargar registros médicos para reporte ${r.idReporte}:`, e);
                console.error(`❌ Detalles del error:`, e.response?.data);
                console.error(`❌ Status:`, e.response?.status);
                r.registrosMedicos = [];
              }
            } else {
              r.registrosMedicos = [];
              console.log(`⏭️ Reporte ${r.idReporte} sin veterinaria o no en proceso`);
            }
            
            return r;
          })
        );
        
        reportes.value = reportesConDatos;
        
        const vets = await veterinariaService.getAll();
        veterinarias.value = vets.data || [];
      } catch (error) {
        manejarErrorAPI(error);
      } finally {
        cargando.value = false;
      }
    };

    const prepararPayload = (reporte, cambios = {}) => {
      // Crear payload limpio solo con los campos que el backend espera
      const orgId = reporte?.organizacion?.idOrganizacion || idOrganizacionRef.value || null;
      const vetFinal = cambios.veterinaria !== undefined ? cambios.veterinaria : (reporte.veterinaria ? { idVeterinaria: reporte.veterinaria.idVeterinaria } : null);
      const usuFinal = reporte.usuario ? { idUsuario: reporte.usuario.idUsuario } : null;
      
      // Asegurar que el estado sea uno de los valores válidos del ENUM
      let estadoFinal = cambios.estado || reporte.estado || 'Pendiente';
      
      const payload = {
        titulo: reporte.titulo,
        descripcion: reporte.descripcion,
        ubicacion: reporte.ubicacion,
        estado: estadoFinal,
        usuario: usuFinal
      };

      // Agregar campos opcionales solo si tienen valor
      if (reporte.fotoUrl) {
        payload.fotoUrl = reporte.fotoUrl;
      }
      
      if (orgId) {
        payload.organizacion = { idOrganizacion: orgId };
      }
      
      if (vetFinal) {
        payload.veterinaria = vetFinal;
      }

      console.log('Payload preparado:', payload);
      console.log('Estado enviado:', estadoFinal);
      return payload;
    };

    const aceptarReporte = async (reporte) => {
      try {
        const conf = await confirmar(
          `¿Deseas aceptar el reporte "${reporte.titulo}"?`,
          'Confirmar aceptación'
        );
        if (!conf || !conf.isConfirmed) return;

        const id = parseInt(reporte.idReporte, 10);
        
        // Obtener datos actualizados del backend
        const { data: actual } = await reporteService.getById(id);
        if (!actual || !actual.idReporte) {
          alertaError('No se pudo cargar el reporte para actualizar.');
          return;
        }

        // Preparar payload limpio con estado "En_proceso" (con guión bajo según la API)
        const payload = prepararPayload(actual, { estado: 'En_proceso' });
        
        console.debug('Aceptando reporte - Payload:', payload);
        console.log('Estado enviado:', payload.estado);
        
        await reporteService.update(id, payload);
        alertaExito('Reporte aceptado y puesto en proceso');
        await cargarReportes();
      } catch (error) {
        console.error('Error al aceptar reporte:', {
          id: reporte?.idReporte,
          error: error?.response?.data,
          status: error?.response?.status,
          fullError: error
        });
        
        // Mostrar el error específico del backend
        if (error?.response?.data) {
          const errorData = error.response.data;
          let mensajeError = 'Error al aceptar el reporte:\n';
          
          if (typeof errorData === 'string') {
            mensajeError += errorData;
          } else if (errorData.message) {
            mensajeError += errorData.message;
          } else if (errorData.error) {
            mensajeError += errorData.error;
          } else {
            mensajeError += JSON.stringify(errorData);
          }
          
          alertaError(mensajeError);
        } else {
          manejarErrorAPI(error);
        }
      }
    };

    const rechazarReporte = async (reporte) => {
      try {
        const conf = await confirmar(
          `¿Deseas rechazar el reporte "${reporte.titulo}"? El usuario podrá reasignarlo a otra organización.`,
          'Confirmar rechazo'
        );
        
        if (!conf || !conf.isConfirmed) return;

        const id = parseInt(reporte.idReporte, 10);
        
        // Obtener datos actualizados del backend
        const { data: actual } = await reporteService.getById(id);
        if (!actual || !actual.idReporte) {
          alertaError('No se pudo cargar el reporte para actualizar.');
          return;
        }

        // Preparar payload con estado Cerrado y sin organización
        // Esto permite que el usuario lo reasigne
        const payload = prepararPayload(actual, { 
          estado: 'Cerrado',
          veterinaria: null // Limpiar veterinaria al rechazar
        });
        
        // Importante: Remover organización para que el usuario pueda reasignar
        payload.organizacion = null;
        
        console.debug('Rechazando reporte - Payload:', payload);
        
        await reporteService.update(id, payload);
        alertaExito('Reporte rechazado. El usuario podrá reasignarlo a otra organización.');
        await cargarReportes();
      } catch (error) {
        console.error('Error al rechazar reporte:', {
          id: reporte?.idReporte,
          respuesta: error?.response?.data,
          status: error?.response?.status
        });
        manejarErrorAPI(error);
      }
    };

    const cambiarEstado = async (reporte, nuevoEstado) => {
      try {
        const conf = await confirmar(
          `¿Cambiar estado a ${formatearEstado(nuevoEstado)}?`,
          'Confirmar cambio'
        );
        
        if (!conf || !conf.isConfirmed) return;

        const id = parseInt(reporte.idReporte, 10);
        const payload = prepararPayload(reporte, { estado: nuevoEstado });
        await reporteService.update(id, payload);
        alertaExito(`Estado cambiado a ${formatearEstado(nuevoEstado)}`);
        await cargarReportes();
      } catch (error) {
        console.error('Error al cambiar estado del reporte:', {
          id: reporte?.idReporte,
          nuevoEstado,
          respuesta: error?.response?.data,
          status: error?.response?.status
        });
        manejarErrorAPI(error);
      }
    };

    const asignarVeterinaria = async (reporte, idVeterinaria) => {
      if (!idVeterinaria) {
        alertaError('Seleccione una veterinaria antes de asignar');
        return;
      }

      try {
        const conf = await confirmar(
          '¿Asignar esta veterinaria al reporte?',
          'Confirmar asignación'
        );
        
        if (!conf || !conf.isConfirmed) return;

        const id = parseInt(reporte.idReporte, 10);
        const payload = prepararPayload(reporte, { 
          veterinaria: { idVeterinaria: parseInt(idVeterinaria) }
        });
        
        await reporteService.update(id, payload);
        alertaExito('Veterinaria asignada correctamente. Esperando aceptación de la veterinaria.');
        await cargarReportes();
      } catch (error) {
        console.error('Error al asignar veterinaria al reporte:', {
          id: reporte?.idReporte,
          idVeterinaria,
          respuesta: error?.response?.data,
          status: error?.response?.status
        });
        manejarErrorAPI(error);
      }
    };

    const reasignarVeterinaria = async (reporte) => {
      try {
        const conf = await confirmar(
          '¿La veterinaria rechazó el caso? Puedes asignar otra veterinaria.',
          'Reasignar veterinaria'
        );
        
        if (!conf || !conf.isConfirmed) return;

        const id = parseInt(reporte.idReporte, 10);
        
        // Obtener datos actualizados
        const { data: actual } = await reporteService.getById(id);
        
        // Quitar la veterinaria actual
        const payload = prepararPayload(actual, { 
          veterinaria: null
        });
        
        await reporteService.update(id, payload);
        alertaExito('Veterinaria removida. Ahora puedes asignar otra.');
        await cargarReportes();
      } catch (error) {
        console.error('Error al reasignar veterinaria:', error);
        manejarErrorAPI(error);
      }
    };

    const cerrarSinVeterinaria = async (reporte) => {
      try {
        const conf = await confirmar(
          `¿Cerrar el reporte "${reporte.titulo}"? Esto indica que el animal fue rescatado y no necesita atención médica.`,
          'Cerrar reporte'
        );
        
        if (!conf || !conf.isConfirmed) return;

        const id = parseInt(reporte.idReporte, 10);
        const { data: actual } = await reporteService.getById(id);
        
        const payload = prepararPayload(actual, { 
          estado: 'Cerrado'
        });
        
        await reporteService.update(id, payload);
        alertaExito('Reporte cerrado exitosamente. El animal ha sido rescatado.');
        await cargarReportes();
      } catch (error) {
        console.error('Error al cerrar reporte:', error);
        manejarErrorAPI(error);
      }
    };

    const cerrarReporte = async (reporte) => {
      try {
        const conf = await confirmar(
          `¿Cerrar el reporte "${reporte.titulo}"? Esto indica que el tratamiento médico ha sido completado.`,
          'Cerrar reporte'
        );
        
        if (!conf || !conf.isConfirmed) return;

        const id = parseInt(reporte.idReporte, 10);
        const { data: actual } = await reporteService.getById(id);
        
        const payload = prepararPayload(actual, { 
          estado: 'Cerrado'
        });
        
        await reporteService.update(id, payload);
        alertaExito('Reporte cerrado exitosamente. Tratamiento completado.');
        await cargarReportes();
      } catch (error) {
        console.error('Error al cerrar reporte:', error);
        manejarErrorAPI(error);
      }
    };

    const irARegistrarAnimal = (reporte) => {
      router.push({ name: 'OrganizacionAnimales' });
    };

    watch([filtroEstado, filtroTitulo], () => { paginaActual.value = 1; });

    const reportesFiltrados = computed(() => {
      let result = reportes.value;
      if (filtroEstado.value) {
        result = result.filter(r => r.estado === filtroEstado.value);
      }
      if (filtroTitulo.value) {
        result = result.filter(r => r.titulo.toLowerCase().includes(filtroTitulo.value.toLowerCase()));
      }
      return result;
    });

    const totalPaginas = computed(() =>
      Math.ceil(reportesFiltrados.value.length / itemsPorPagina)
    );

    const paginas = computed(() => {
      const pages = [];
      for (let i = 1; i <= totalPaginas.value; i++) {
        pages.push(i);
      }
      return pages;
    });

    const reportesPaginados = computed(() => {
      const start = (paginaActual.value - 1) * itemsPorPagina;
      return reportesFiltrados.value.slice(start, start + itemsPorPagina);
    });

    const onFiltroChange = () => {
      paginaActual.value = 1;
    };

    const verFoto = (url) => {
      alertaHTML(`<img src="${url}" class="img-fluid rounded" alt="Foto del reporte">`, 'Foto del Reporte');
    };

    // Helper: Verificar si un reporte tiene registros médicos
    const tieneRegistrosMedicos = (reporte) => {
      // Verificar si el reporte tiene el array de registros médicos
      const tiene = reporte.registrosMedicos && reporte.registrosMedicos.length > 0;
      console.log(`🔎 Verificando registros médicos para reporte ${reporte.idReporte}:`, {
        tieneArray: !!reporte.registrosMedicos,
        cantidad: reporte.registrosMedicos?.length || 0,
        resultado: tiene
      });
      return tiene;
    };

    onMounted(() => cargarReportes());

    return {
      cargando,
      reportes,
      veterinarias,
      filtroEstado,
      filtroTitulo,
      paginaActual,
      totalPaginas,
      paginas,
      reportesFiltrados,
      reportesPaginados,
      aceptarReporte,
      rechazarReporte,
      cambiarEstado,
      asignarVeterinaria,
      reasignarVeterinaria,
      cerrarSinVeterinaria,
      cerrarReporte,
      irARegistrarAnimal,
      onFiltroChange,
      verFoto,
      colorPorEstado,
      formatearEstado,
      formatearFecha,
      nombreCompleto,
      tieneRegistrosMedicos,
    };
  }
};
</script>

<style scoped>
.badge {
  font-size: 1em;
}
.table th,
.table td {
  vertical-align: middle;
}
.table-hover tbody tr:hover {
  background-color: #f7f7f7;
}
.fade-in {
  animation: fadeIn 0.5s ease-in;
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
