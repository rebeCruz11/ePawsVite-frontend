<template>
  <div class="fade-in">
    <h2 class="mb-4"><i class="bi bi-speedometer2 me-2"></i>Dashboard</h2>
    
    <Loading v-if="cargando" />
    
    <div v-else>
      <div class="row g-4 mb-4">
        <div class="col-md-3">
          <div class="card stat-card h-100">
            <div class="card-body">
              <h6 class="text-muted mb-2">Mis Animales</h6>
              <h2 class="mb-0">{{ stats.animales }}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card stat-card success h-100">
            <div class="card-body">
              <h6 class="text-muted mb-2">Disponibles</h6>
              <h2 class="mb-0">{{ stats.disponibles }}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card stat-card warning h-100">
            <div class="card-body">
              <h6 class="text-muted mb-2">Adopciones</h6>
              <h2 class="mb-0">{{ stats.adopciones }}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card stat-card info h-100">
            <div class="card-body">
              <h6 class="text-muted mb-2">Reportes</h6>
              <h2 class="mb-0">{{ stats.reportes }}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import Loading from '../../components/common/Loading.vue';
import animalService from '../../services/animalService';
import reporteService from '../../services/reporteService';
import organizacionService from '../../services/organizacionService';
import { manejarErrorAPI } from '../../utils/alertas';

export default {
  name: 'OrganizacionDashboard',
  components: { Loading },
  setup() {
    const authStore = useAuthStore();
    const cargando = ref(true);
    const stats = ref({ animales: 0, disponibles: 0, adopciones: 0, reportes: 0 });
    
    const cargarDatos = async () => {
      try {
        const orgResponse = await organizacionService.getByUsuario(authStore.usuarioActual.idUsuario);
        
        if (!orgResponse.data) {
          stats.value = { animales: 0, disponibles: 0, adopciones: 0, reportes: 0 };
          cargando.value = false;
          return;
        }
        
        const [animales, reportes] = await Promise.all([
          animalService.getByOrganizacion(orgResponse.data.idOrganizacion),
          reporteService.getByOrganizacion(orgResponse.data.idOrganizacion)
        ]);
        
        stats.value = {
          animales: animales.data.length,
          disponibles: animales.data.filter(a => a.estado === 'Disponible').length,
          adopciones: animales.data.filter(a => a.estado === 'Adoptado').length,
          reportes: reportes.data.length
        };
      } catch (error) {
        console.error('Error al cargar dashboard organización:', error);
        stats.value = { animales: 0, disponibles: 0, adopciones: 0, reportes: 0 };
        // Solo mostrar error si no es un 404 (organización no existe aún)
        if (error.response?.status !== 404) {
          manejarErrorAPI(error);
        }
      } finally {
        cargando.value = false;
      }
    };
    
    onMounted(() => cargarDatos());
    
    return { cargando, stats };
  }
}
</script>
