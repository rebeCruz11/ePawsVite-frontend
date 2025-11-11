<template>
  <div class="fade-in">
    <h2 class="mb-4"><i class="bi bi-flag me-2"></i> Reportes Asignados</h2>

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
              <option value="En proceso">En proceso</option>
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
                  <template v-if="reporte.estado === 'Pendiente'">
                    <button class="btn btn-sm btn-success me-2" @click="aceptarReporte(reporte)">Aceptar</button>
                    <button class="btn btn-sm btn-danger" @click="rechazarReporte(reporte)">Rechazar</button>
                  </template>

                  <template v-else-if="reporte.estado === 'En proceso'">
                    <template v-if="!reporte.veterinaria">
                      <div class="d-flex justify-content-center gap-2">
                        <select class="form-select form-select-sm" v-model="reporte._idVetSeleccionada" aria-label="Seleccionar veterinaria">
                          <option value="">Seleccionar veterinaria</option>
                          <option v-for="v in veterinarias" :key="v.idVeterinaria" :value="v.idVeterinaria">{{ v.nombreClinica || (v.usuario && v.usuario.nombre) || `Vet ${v.idVeterinaria}` }}</option>
                        </select>
                        <button class="btn btn-sm btn-primary" :disabled="!reporte._idVetSeleccionada" @click="asignarVeterinaria(reporte, reporte._idVetSeleccionada)">Asignar</button>
                      </div>
                    </template>
                    <template v-else>
                      <button class="btn btn-sm btn-danger" @click="cambiarEstado(reporte, 'Cerrado')">Cerrar Reporte</button>
                    </template>
                  </template>

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
        (response.data || []).forEach(r => { 
          r._idVetSeleccionada = '';
        });
        reportes.value = response.data || [];
        
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
      const vetFinal = cambios.veterinaria || (reporte.veterinaria ? { idVeterinaria: reporte.veterinaria.idVeterinaria } : null);
      const usuFinal = reporte.usuario ? { idUsuario: reporte.usuario.idUsuario } : null;
      
      const payload = {
        titulo: reporte.titulo,
        descripcion: reporte.descripcion,
        ubicacion: reporte.ubicacion,
        fotoUrl: reporte.fotoUrl,
        estado: cambios.estado || reporte.estado,
        usuario: usuFinal,
        organizacion: orgId ? { idOrganizacion: orgId } : null,
        veterinaria: vetFinal
      };
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

        // Preparar payload limpio con estado En proceso
        const payload = prepararPayload(actual, { estado: 'En proceso' });
        
        console.debug('Aceptando reporte - Payload:', payload);
        
        await reporteService.update(id, payload);
        alertaExito('Reporte aceptado y puesto en proceso');
        await cargarReportes();
      } catch (error) {
        console.error('Error al aceptar reporte:', {
          id: reporte?.idReporte,
          error: error?.response?.data,
          status: error?.response?.status
        });
        
        if (error?.response?.data?.error) {
          alertaError(`Error: ${error.response.data.error}`);
        } else {
          manejarErrorAPI(error);
        }
      }
    };

    const rechazarReporte = async (reporte) => {
      try {
        const conf = await confirmar(
          `¿Deseas rechazar el reporte "${reporte.titulo}"?`,
          'Confirmar rechazo'
        );
        
        if (!conf || !conf.isConfirmed) return;

        const id = parseInt(reporte.idReporte, 10);
        const payload = prepararPayload(reporte, { estado: 'Cerrado' });
        await reporteService.update(id, payload);
        alertaExito('Reporte rechazado');
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
        alertaExito('Veterinaria asignada correctamente');
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
      irARegistrarAnimal,
      onFiltroChange,
      verFoto,
      colorPorEstado,
      formatearEstado,
      formatearFecha,
      nombreCompleto,
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
