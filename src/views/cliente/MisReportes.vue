<template>
  <div class="fade-in">
    <h2 class="mb-4"><i class="bi bi-flag-fill me-2"></i>Mis Reportes</h2>
    
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
              </tr>
            </thead>
            <tbody>
              <tr v-for="reporte in reportes" :key="reporte.idReporte">
                <td>{{ formatearFechaHora(reporte.fechaReporte) }}</td>
                <td>{{ reporte.titulo }}</td>
                <td>{{ reporte.ubicacion || 'N/A' }}</td>
                <td>
                  <span class="badge" :class="`bg-${colorPorEstado(reporte.estado)}`">
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
                  <button 
                    v-if="reporte.fotoUrl" 
                    class="btn btn-sm btn-info"
                    @click="verFoto(reporte.fotoUrl)"
                  >
                    <i class="bi bi-image"></i>
                  </button>
                  <span v-else class="text-muted">Sin foto</span>
                </td>
              </tr>
              <tr v-if="reportes.length === 0">
                <td colspan="6" class="text-center text-muted py-4">
                  <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                  No has creado reportes
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import Loading from '../../components/common/Loading.vue';
import reporteService from '../../services/reporteService';
import { alertaHTML, manejarErrorAPI } from '../../utils/alertas';
import { colorPorEstado, formatearEstado, formatearFechaHora } from '../../utils/helpers';

export default {
  name: 'ClienteMisReportes',
  components: { Loading },
  setup() {
    const authStore = useAuthStore();
    const cargando = ref(true);
    const reportes = ref([]);
    
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
    
    const verFoto = (url) => {
      alertaHTML(`<img src="${url}" class="img-fluid" alt="Foto del reporte">`, 'Foto del Reporte');
    };
    
    onMounted(() => cargarReportes());
    
    return {
      cargando, reportes, verFoto,
      colorPorEstado, formatearEstado, formatearFechaHora
    };
  }
}
</script>
