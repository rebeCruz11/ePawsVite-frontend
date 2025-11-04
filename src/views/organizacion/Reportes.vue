<template>
  <div class="fade-in">
    <h2 class="mb-4"><i class="bi bi-flag me-2"></i>Reportes Asignados</h2>
    
    <Loading v-if="cargando" />
    
    <div v-else class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Título</th>
                <th>Reportado por</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Foto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reporte in reportes" :key="reporte.idReporte">
                <td>{{ formatearFecha(reporte.fechaReporte) }}</td>
                <td>{{ reporte.titulo }}</td>
                <td>{{ nombreCompleto(reporte.usuario) }}</td>
                <td>{{ reporte.ubicacion || 'N/A' }}</td>
                <td>
                  <span class="badge" :class="`bg-${colorPorEstado(reporte.estado)}`">
                    {{ formatearEstado(reporte.estado) }}
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
import organizacionService from '../../services/organizacionService';
import { alertaHTML, manejarErrorAPI } from '../../utils/alertas';
import { colorPorEstado, formatearEstado, formatearFecha, nombreCompleto } from '../../utils/helpers';

export default {
  name: 'OrganizacionReportes',
  components: { Loading },
  setup() {
    const authStore = useAuthStore();
    const cargando = ref(true);
    const reportes = ref([]);
    
    const cargarReportes = async () => {
      try {
        const org = await organizacionService.getByUsuario(authStore.usuarioActual.idUsuario);
        const response = await reporteService.getByOrganizacion(org.data.idOrganizacion);
        reportes.value = response.data;
      } catch (error) {
        manejarErrorAPI(error);
      } finally {
        cargando.value = false;
      }
    };
    
    const verFoto = (url) => {
      alertaHTML(`<img src="${url}" class="img-fluid">`, 'Foto');
    };
    
    onMounted(() => cargarReportes());
    
    return {
      cargando, reportes, verFoto,
      colorPorEstado, formatearEstado, formatearFecha, nombreCompleto
    };
  }
}
</script>
