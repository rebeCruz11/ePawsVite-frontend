<template>
  <div class="reports-page fade-in">
    <Loading v-if="cargando" />

    <div v-else>
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-title">
            <div class="title-icon">
              <i class="bi bi-flag-fill"></i>
            </div>
            <div>
              <h2>Reportes Asignados</h2>
              <p class="text-muted mb-0">Gestiona los reportes de animales</p>
            </div>
          </div>
          
          <button 
            class="btn-refresh" 
            @click="cargarReportes"
            :disabled="cargando"
          >
            <i class="bi bi-arrow-clockwise" :class="{ 'spinning': cargando }"></i>
            <span>{{ cargando ? 'Actualizando...' : 'Actualizar' }}</span>
          </button>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-card total">
          <div class="stat-icon">
            <i class="bi bi-clipboard-data"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ reportes.length }}</span>
            <span class="stat-label">Total</span>
          </div>
        </div>
        
        <div class="stat-card pending">
          <div class="stat-icon">
            <i class="bi bi-clock-history"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ reportes.filter(r => r.estado === 'Pendiente').length }}</span>
            <span class="stat-label">Pendientes</span>
          </div>
        </div>
        
        <div class="stat-card process">
          <div class="stat-icon">
            <i class="bi bi-gear-fill"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ reportes.filter(r => r.estado === 'En_proceso').length }}</span>
            <span class="stat-label">En Proceso</span>
          </div>
        </div>
        
        <div class="stat-card closed">
          <div class="stat-icon">
            <i class="bi bi-check-circle-fill"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ reportes.filter(r => r.estado === 'Cerrado').length }}</span>
            <span class="stat-label">Cerrados</span>
          </div>
        </div>
      </div>

      <!-- Filters Card -->
      <div class="filters-card">
        <div class="filters-header">
          <i class="bi bi-funnel-fill"></i>
          <span>Filtros</span>
        </div>
        <div class="filters-body">
          <div class="filter-group">
            <label class="filter-label">
              <i class="bi bi-search"></i>
              Buscar
            </label>
            <input
              type="text"
              v-model="filtroTitulo"
              @input="onFiltroChange"
              class="filter-input"
              placeholder="Buscar por título..."
            />
          </div>
          
          <div class="filter-group">
            <label class="filter-label">
              <i class="bi bi-flag"></i>
              Estado
            </label>
            <select
              v-model="filtroEstado"
              @change="onFiltroChange"
              class="filter-select"
            >
              <option value="">Todos</option>
              <option value="Pendiente">⏳ Pendiente</option>
              <option value="En_proceso">🔄 En proceso</option>
              <option value="Cerrado">✅ Cerrado</option>
            </select>
          </div>
          
          <div class="results-info">
            <i class="bi bi-check-circle"></i>
            <span>{{ reportesFiltrados.length }} resultado{{ reportesFiltrados.length !== 1 ? 's' : '' }}</span>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="table-card">
        <div class="table-wrapper">
          <table class="modern-table">
            <thead>
              <tr>
                <th style="min-width: 110px;"><i class="bi bi-calendar3"></i> Fecha</th>
                <th style="min-width: 150px;"><i class="bi bi-file-text"></i> Título</th>
                <th style="min-width: 150px;"><i class="bi bi-person"></i> Reportado por</th>
                <th style="min-width: 120px;"><i class="bi bi-geo-alt"></i> Ubicación</th>
                <th style="min-width: 110px;"><i class="bi bi-flag"></i> Estado</th>
                <th style="min-width: 130px;"><i class="bi bi-hospital"></i> Veterinaria</th>
                <th style="min-width: 70px;"><i class="bi bi-image"></i> Foto</th>
                <th style="min-width: 200px;"><i class="bi bi-gear"></i> Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reporte in reportesPaginados" :key="reporte.idReporte" class="table-row">
                <td>
                  <div class="date-cell">
                    {{ formatearFecha(reporte.fechaReporte) }}
                  </div>
                </td>
                <td>
                  <div class="title-cell">{{ reporte.titulo }}</div>
                </td>
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">
                      {{ nombreCompleto(reporte.usuario).split(' ').map(n => n[0]).join('').slice(0, 2) }}
                    </div>
                    <span class="user-name">{{ nombreCompleto(reporte.usuario) }}</span>
                  </div>
                </td>
                <td>
                  <div class="location-cell">
                    {{ reporte.ubicacion || 'N/A' }}
                  </div>
                </td>
                <td>
                  <span class="status-badge" :class="reporte.estado.toLowerCase().replace('_', '-')">
                    {{ formatearEstado(reporte.estado) }}
                  </span>
                </td>
                <td>
                  <div v-if="reporte.veterinaria && reporte.veterinaria.usuario" class="vet-name">
                    {{ reporte.veterinaria.nombreClinica || reporte.veterinaria.usuario.nombre }}
                  </div>
                  <span v-else class="no-vet">Sin asignar</span>
                </td>
                <td class="text-center">
                  <button
                    v-if="reporte.fotoUrl"
                    class="btn-icon"
                    @click="verFoto(reporte.fotoUrl)"
                    title="Ver foto"
                  >
                    <i class="bi bi-image-fill"></i>
                  </button>
                  <span v-else class="no-photo">--</span>
                </td>
                <td>
                  <div class="actions-cell">
                    <!-- Pendiente -->
                    <template v-if="reporte.estado === 'Pendiente'">
                      <button class="btn-action success" @click="aceptarReporte(reporte)" title="Aceptar">
                        <i class="bi bi-check-lg"></i>
                        <span>Aceptar</span>
                      </button>
                      <button class="btn-action danger" @click="rechazarReporte(reporte)" title="Rechazar">
                        <i class="bi bi-x-lg"></i>
                        <span>Rechazar</span>
                      </button>
                    </template>

                    <!-- En proceso sin veterinaria -->
                    <template v-else-if="reporte.estado === 'En_proceso' && !reporte.veterinaria">
                      <select 
                        class="select-vet" 
                        v-model="reporte._idVetSeleccionada"
                      >
                        <option value="">Seleccionar vet...</option>
                        <option 
                          v-for="v in veterinarias" 
                          :key="v.idVeterinaria" 
                          :value="v.idVeterinaria"
                        >
                          {{ v.nombreClinica || v.usuario?.nombre || `Vet ${v.idVeterinaria}` }}
                        </option>
                      </select>
                      <button 
                        class="btn-action primary" 
                        :disabled="!reporte._idVetSeleccionada" 
                        @click="asignarVeterinaria(reporte, reporte._idVetSeleccionada)"
                        title="Asignar"
                      >
                        <i class="bi bi-send-fill"></i>
                      </button>
                      <button 
                        class="btn-action success" 
                        @click="cerrarSinVeterinaria(reporte)"
                        title="Cerrar (Rescatado)"
                      >
                        <i class="bi bi-check-circle"></i>
                        <span>Rescatado</span>
                      </button>
                    </template>

                    <!-- En proceso con veterinaria y registros médicos -->
                    <template v-else-if="reporte.estado === 'En_proceso' && reporte.veterinaria && tieneRegistrosMedicos(reporte)">
                      <div class="status-info medical">
                        <i class="bi bi-clipboard-pulse"></i>
                        <span>En atención</span>
                      </div>
                    </template>

                    <!-- En proceso con veterinaria sin registros -->
                    <template v-else-if="reporte.estado === 'En_proceso' && reporte.veterinaria">
                      <div class="status-info assigned">
                        <i class="bi bi-hospital"></i>
                        <span>Asignado</span>
                      </div>
                      <button 
                        class="btn-action warning" 
                        @click="reasignarVeterinaria(reporte)"
                        title="Reasignar"
                      >
                        <i class="bi bi-arrow-repeat"></i>
                      </button>
                      <button 
                        class="btn-action success" 
                        @click="cerrarReporte(reporte)"
                        title="Cerrar"
                      >
                        <i class="bi bi-check-circle"></i>
                      </button>
                    </template>

                    <!-- Cerrado -->
                    <template v-else-if="reporte.estado === 'Cerrado'">
                      <div class="status-info closed">
                        <i class="bi bi-check-circle-fill"></i>
                        <span>Finalizado</span>
                      </div>
                    </template>

                    <template v-else>
                      <span class="no-actions">--</span>
                    </template>
                  </div>
                </td>
              </tr>
              <tr v-if="reportesFiltrados.length === 0">
                <td colspan="8" class="empty-cell">
                  <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <p>No hay reportes</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPaginas > 1" class="pagination-container">
          <button
            class="pagination-btn"
            :disabled="paginaActual === 1"
            @click="paginaActual > 1 && paginaActual--"
          >
            <i class="bi bi-chevron-left"></i>
            Anterior
          </button>
          
          <div class="pagination-numbers">
            <button
              v-for="page in paginas"
              :key="page"
              class="page-number"
              :class="{ active: page === paginaActual }"
              @click="paginaActual = page"
            >
              {{ page }}
            </button>
          </div>
          
          <button
            class="pagination-btn"
            :disabled="paginaActual === totalPaginas"
            @click="paginaActual < totalPaginas && paginaActual++"
          >
            Siguiente
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
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
        
        const reportesConDatos = await Promise.all(
          (response.data || []).map(async (r) => {
            r._idVetSeleccionada = '';
            
            if (r.veterinaria && r.estado === 'En_proceso') {
              try {
                const registros = await registroMedicoService.getByReporte(r.idReporte);
                r.registrosMedicos = Array.isArray(registros) ? registros : (registros.data || []);
              } catch (e) {
                r.registrosMedicos = [];
              }
            } else {
              r.registrosMedicos = [];
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
      const orgId = reporte?.organizacion?.idOrganizacion || idOrganizacionRef.value || null;
      const vetFinal = cambios.veterinaria !== undefined ? cambios.veterinaria : (reporte.veterinaria ? { idVeterinaria: reporte.veterinaria.idVeterinaria } : null);
      const usuFinal = reporte.usuario ? { idUsuario: reporte.usuario.idUsuario } : null;
      let estadoFinal = cambios.estado || reporte.estado || 'Pendiente';
      
      const payload = {
        titulo: reporte.titulo,
        descripcion: reporte.descripcion,
        ubicacion: reporte.ubicacion,
        estado: estadoFinal,
        usuario: usuFinal
      };

      if (reporte.fotoUrl) payload.fotoUrl = reporte.fotoUrl;
      if (orgId) payload.organizacion = { idOrganizacion: orgId };
      if (vetFinal) payload.veterinaria = vetFinal;

      return payload;
    };

    const aceptarReporte = async (reporte) => {
      try {
        const conf = await confirmar(`¿Aceptar el reporte "${reporte.titulo}"?`, 'Confirmar');
        if (!conf?.isConfirmed) return;

        const id = parseInt(reporte.idReporte, 10);
        const { data: actual } = await reporteService.getById(id);
        if (!actual?.idReporte) {
          alertaError('No se pudo cargar el reporte.');
          return;
        }

        const payload = prepararPayload(actual, { estado: 'En_proceso' });
        await reporteService.update(id, payload);
        alertaExito('Reporte aceptado');
        await cargarReportes();
      } catch (error) {
        manejarErrorAPI(error);
      }
    };

    const rechazarReporte = async (reporte) => {
      try {
        const conf = await confirmar(`¿Rechazar el reporte "${reporte.titulo}"?`, 'Confirmar');
        if (!conf?.isConfirmed) return;

        const id = parseInt(reporte.idReporte, 10);
        const { data: actual } = await reporteService.getById(id);
        const payload = prepararPayload(actual, { estado: 'Cerrado', veterinaria: null });
        payload.organizacion = null;
        
        await reporteService.update(id, payload);
        alertaExito('Reporte rechazado');
        await cargarReportes();
      } catch (error) {
        manejarErrorAPI(error);
      }
    };

    const asignarVeterinaria = async (reporte, idVeterinaria) => {
      if (!idVeterinaria) {
        alertaError('Seleccione una veterinaria');
        return;
      }

      try {
        const conf = await confirmar('¿Asignar esta veterinaria?', 'Confirmar');
        if (!conf?.isConfirmed) return;

        const id = parseInt(reporte.idReporte, 10);
        const payload = prepararPayload(reporte, { 
          veterinaria: { idVeterinaria: parseInt(idVeterinaria) }
        });
        
        await reporteService.update(id, payload);
        alertaExito('Veterinaria asignada');
        await cargarReportes();
      } catch (error) {
        manejarErrorAPI(error);
      }
    };

    const reasignarVeterinaria = async (reporte) => {
      try {
        const conf = await confirmar('¿Reasignar veterinaria?', 'Confirmar');
        if (!conf?.isConfirmed) return;

        const id = parseInt(reporte.idReporte, 10);
        const { data: actual } = await reporteService.getById(id);
        const payload = prepararPayload(actual, { veterinaria: null });
        
        await reporteService.update(id, payload);
        alertaExito('Veterinaria removida');
        await cargarReportes();
      } catch (error) {
        manejarErrorAPI(error);
      }
    };

    const cerrarSinVeterinaria = async (reporte) => {
      try {
        const conf = await confirmar(`¿Cerrar el reporte "${reporte.titulo}"?`, 'Cerrar');
        if (!conf?.isConfirmed) return;

        const id = parseInt(reporte.idReporte, 10);
        const { data: actual } = await reporteService.getById(id);
        const payload = prepararPayload(actual, { estado: 'Cerrado' });
        
        await reporteService.update(id, payload);
        alertaExito('Reporte cerrado');
        await cargarReportes();
      } catch (error) {
        manejarErrorAPI(error);
      }
    };

    const cerrarReporte = async (reporte) => {
      try {
        const conf = await confirmar(`¿Cerrar el reporte "${reporte.titulo}"?`, 'Cerrar');
        if (!conf?.isConfirmed) return;

        const id = parseInt(reporte.idReporte, 10);
        const { data: actual } = await reporteService.getById(id);
        const payload = prepararPayload(actual, { estado: 'Cerrado' });
        
        await reporteService.update(id, payload);
        alertaExito('Reporte cerrado');
        await cargarReportes();
      } catch (error) {
        manejarErrorAPI(error);
      }
    };

    const verFoto = (url) => {
      alertaHTML(`<img src="${url}" class="img-fluid rounded" alt="Foto">`, 'Foto del Reporte');
    };

    const tieneRegistrosMedicos = (reporte) => {
      return reporte.registrosMedicos && reporte.registrosMedicos.length > 0;
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
      cargarReportes,
      aceptarReporte,
      rechazarReporte,
      asignarVeterinaria,
      reasignarVeterinaria,
      cerrarSinVeterinaria,
      cerrarReporte,
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
/* BASE */
.reports-page {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* HEADER */
.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.75rem;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.header-title h2 {
  margin: 0;
  font-weight: 700;
  color: #1a1a1a;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-refresh:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* STATS */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-card.total .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.pending .stat-icon {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
}

.stat-card.process .stat-icon {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
}

.stat-card.closed .stat-icon {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

/* FILTERS */
.filters-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  overflow: hidden;
}

.filters-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
  font-weight: 700;
}

.filters-body {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1.5rem;
  padding: 1.5rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #6c757d;
}

.filter-input,
.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
}

.results-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
}

/* TABLE */
.table-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 1400px;
}

.modern-table thead {
  background: #f8f9fa;
}

.modern-table thead th {
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 700;
  color: #1a1a1a;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e9ecef;
  white-space: nowrap;
}

.modern-table thead th i {
  color: #667eea;
  margin-right: 0.5rem;
}

.modern-table tbody td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid #f8f9fa;
  vertical-align: middle;
}

.table-row {
  transition: all 0.3s ease;
}

.table-row:hover {
  background: #f8f9fa;
}

/* CELLS */
.date-cell,
.title-cell,
.location-cell {
  font-size: 0.9rem;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.user-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vet-name {
  font-size: 0.9rem;
  color: #17a2b8;
  font-weight: 600;
}

.no-vet,
.no-photo,
.no-actions {
  color: #6c757d;
  font-style: italic;
  font-size: 0.9rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-icon:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* STATUS BADGES */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.pendiente {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}

.status-badge.en-proceso {
  background: rgba(23, 162, 184, 0.15);
  color: #17a2b8;
}

.status-badge.cerrado {
  background: rgba(40, 167, 69, 0.15);
  color: #28a745;
}

/* ACTIONS CELL */
.actions-cell {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-action.success {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.btn-action.success:hover {
  background: #28a745;
  color: white;
}

.btn-action.danger {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.btn-action.danger:hover {
  background: #dc3545;
  color: white;
}

.btn-action.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-action.primary:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-action.warning {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.btn-action.warning:hover {
  background: #ffc107;
  color: white;
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.select-vet {
  padding: 0.5rem 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.8rem;
  max-width: 180px;
}

.status-info {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.8rem;
  white-space: nowrap;
}

.status-info.medical {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.status-info.assigned {
  background: rgba(23, 162, 184, 0.1);
  color: #17a2b8;
}

.status-info.closed {
  background: rgba(108, 117, 125, 0.1);
  color: #6c757d;
}

/* EMPTY STATE */
.empty-cell {
  padding: 4rem 2rem !important;
}

.empty-state {
  text-align: center;
  color: #6c757d;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* PAGINATION */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-top: 2px solid #f8f9fa;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: 2px solid #e9ecef;
  background: white;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.page-number {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid #e9ecef;
  background: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-number:hover {
  border-color: #667eea;
  color: #667eea;
}

.page-number.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

/* RESPONSIVE */
@media (max-width: 992px) {
  .filters-body {
    grid-template-columns: 1fr;
  }
  
  .btn-action span {
    display: none;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
