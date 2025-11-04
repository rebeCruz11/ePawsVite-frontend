<template>
  <div class="fade-in">
    <h2 class="mb-4"><i class="bi bi-speedometer2 me-2"></i>Mi Dashboard</h2>
    
    <Loading v-if="cargando" />
    
    <div v-else>
      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-6">
          <div class="card stat-card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-muted mb-2">Mis Adopciones</h6>
                  <h2 class="mb-0">{{ stats.adopciones }}</h2>
                  <small class="text-muted">
                    {{ stats.adopcionesPendientes }} pendientes
                  </small>
                </div>
                <div class="avatar-lg bg-primary">
                  <i class="bi bi-clipboard-check fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="card stat-card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-muted mb-2">Mis Reportes</h6>
                  <h2 class="mb-0">{{ stats.reportes }}</h2>
                  <small class="text-muted">
                    {{ stats.reportesPendientes }} pendientes
                  </small>
                </div>
                <div class="avatar-lg bg-warning">
                  <i class="bi bi-flag fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Acciones rápidas -->
      <div class="row g-4">
        <div class="col-md-4">
          <router-link to="/cliente/animales" class="text-decoration-none">
            <div class="card text-center h-100 hover-shadow">
              <div class="card-body py-4">
                <i class="bi bi-heart text-primary" style="font-size: 3rem;"></i>
                <h5 class="mt-3">Ver Animales</h5>
                <p class="text-muted">Encuentra tu compañero perfecto</p>
              </div>
            </div>
          </router-link>
        </div>
        
        <div class="col-md-4">
          <router-link to="/cliente/crear-reporte" class="text-decoration-none">
            <div class="card text-center h-100 hover-shadow">
              <div class="card-body py-4">
                <i class="bi bi-flag text-warning" style="font-size: 3rem;"></i>
                <h5 class="mt-3">Reportar Animal</h5>
                <p class="text-muted">Ayuda a un animal en necesidad</p>
              </div>
            </div>
          </router-link>
        </div>
        
        <div class="col-md-4">
          <router-link to="/cliente/mis-adopciones" class="text-decoration-none">
            <div class="card text-center h-100 hover-shadow">
              <div class="card-body py-4">
                <i class="bi bi-clipboard-check text-success" style="font-size: 3rem;"></i>
                <h5 class="mt-3">Mis Solicitudes</h5>
                <p class="text-muted">Revisa tus adopciones</p>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import Loading from '../../components/common/Loading.vue';
import adopcionService from '../../services/adopcionService';
import reporteService from '../../services/reporteService';
import { manejarErrorAPI } from '../../utils/alertas';

export default {
  name: 'ClienteDashboard',
  components: { Loading },
  setup() {
    const authStore = useAuthStore();
    const cargando = ref(true);
    const stats = ref({
      adopciones: 0,
      adopcionesPendientes: 0,
      reportes: 0,
      reportesPendientes: 0
    });
    
    const cargarEstadisticas = async () => {
      try {
        const [adopciones, reportes] = await Promise.all([
          adopcionService.getByUsuario(authStore.usuarioActual.idUsuario),
          reporteService.getByUsuario(authStore.usuarioActual.idUsuario)
        ]);
        
        stats.value = {
          adopciones: adopciones.data.length,
          adopcionesPendientes: adopciones.data.filter(a => a.estado === 'Pendiente').length,
          reportes: reportes.data.length,
          reportesPendientes: reportes.data.filter(r => r.estado === 'Pendiente').length
        };
      } catch (error) {
        manejarErrorAPI(error);
      } finally {
        cargando.value = false;
      }
    };
    
    onMounted(() => cargarEstadisticas());
    
    return { cargando, stats };
  }
}
</script>
