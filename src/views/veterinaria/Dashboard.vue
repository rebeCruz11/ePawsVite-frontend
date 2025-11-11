<template>
  <div class="dashboard-page fade-in">
    <Loading v-if="cargando"/>

    <div v-else>
      <!-- Header -->
      <div class="dashboard-header">
        <div class="header-content">
          <div class="header-title">
            <i class="bi bi-activity"></i>
            <div>
              <h2>Dashboard Veterinaria</h2>
              <p class="subtitle">Resumen general de tu actividad</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-icon">
            <i class="bi bi-file-medical-fill"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Total Reportes</span>
            <span class="stat-value">{{ stats.reportes }}</span>
          </div>
          <div class="stat-decoration"></div>
        </div>

        <div class="stat-card success">
          <div class="stat-icon">
            <i class="bi bi-clipboard2-pulse-fill"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Registros Médicos</span>
            <span class="stat-value">{{ stats.registros }}</span>
          </div>
          <div class="stat-decoration"></div>
        </div>

        <div class="stat-card info">
          <div class="stat-icon">
            <i class="bi bi-clock-history"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Reportes Pendientes</span>
            <span class="stat-value">{{ stats.pendientes }}</span>
          </div>
          <div class="stat-decoration"></div>
        </div>

        <div class="stat-card warning">
          <div class="stat-icon">
            <i class="bi bi-check-circle-fill"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Casos Cerrados</span>
            <span class="stat-value">{{ stats.cerrados }}</span>
          </div>
          <div class="stat-decoration"></div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <!-- Status Distribution -->
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">
              <i class="bi bi-pie-chart-fill"></i>
              <h3>Distribución de Reportes</h3>
            </div>
          </div>
          <div class="chart-body">
            <div class="progress-list">
              <div class="progress-item">
                <div class="progress-info">
                  <span class="progress-label">
                    <span class="badge-dot pending"></span>
                    Pendientes
                  </span>
                  <span class="progress-value">{{ stats.pendientes }}</span>
                </div>
                <div class="progress-bar-wrapper">
                  <div class="progress-bar pending" :style="{ width: getPercentage(stats.pendientes) + '%' }">
                    <span class="progress-percentage">{{ getPercentage(stats.pendientes) }}%</span>
                  </div>
                </div>
              </div>

              <div class="progress-item">
                <div class="progress-info">
                  <span class="progress-label">
                    <span class="badge-dot process"></span>
                    En Proceso
                  </span>
                  <span class="progress-value">{{ stats.enProceso }}</span>
                </div>
                <div class="progress-bar-wrapper">
                  <div class="progress-bar process" :style="{ width: getPercentage(stats.enProceso) + '%' }">
                    <span class="progress-percentage">{{ getPercentage(stats.enProceso) }}%</span>
                  </div>
                </div>
              </div>

              <div class="progress-item">
                <div class="progress-info">
                  <span class="progress-label">
                    <span class="badge-dot closed"></span>
                    Cerrados
                  </span>
                  <span class="progress-value">{{ stats.cerrados }}</span>
                </div>
                <div class="progress-bar-wrapper">
                  <div class="progress-bar closed" :style="{ width: getPercentage(stats.cerrados) + '%' }">
                    <span class="progress-percentage">{{ getPercentage(stats.cerrados) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity Summary -->
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">
              <i class="bi bi-graph-up"></i>
              <h3>Resumen de Actividad</h3>
            </div>
          </div>
          <div class="chart-body">
            <div class="activity-stats">
              <div class="activity-item">
                <div class="activity-icon primary">
                  <i class="bi bi-calendar-check"></i>
                </div>
                <div class="activity-content">
                  <span class="activity-value">{{ stats.registrosHoy }}</span>
                  <span class="activity-label">Registros Hoy</span>
                </div>
              </div>

              <div class="activity-item">
                <div class="activity-icon success">
                  <i class="bi bi-calendar-week"></i>
                </div>
                <div class="activity-content">
                  <span class="activity-value">{{ stats.registrosSemana }}</span>
                  <span class="activity-label">Esta Semana</span>
                </div>
              </div>

              <div class="activity-item">
                <div class="activity-icon info">
                  <i class="bi bi-calendar-month"></i>
                </div>
                <div class="activity-content">
                  <span class="activity-value">{{ stats.registrosMes }}</span>
                  <span class="activity-label">Este Mes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h3 class="section-title">
          <i class="bi bi-lightning-fill"></i>
          Acciones Rápidas
        </h3>
        <div class="actions-grid">
          <router-link :to="{ name: 'VeterinariaReportes' }" class="action-card">
            <div class="action-icon">
              <i class="bi bi-file-medical"></i>
            </div>
            <div class="action-content">
              <h4>Ver Reportes</h4>
              <p>Gestiona todos los reportes asignados</p>
            </div>
            <i class="bi bi-arrow-right action-arrow"></i>
          </router-link>

          <router-link :to="{ name: 'VeterinariaPerfil' }" class="action-card">
            <div class="action-icon">
              <i class="bi bi-person-circle"></i>
            </div>
            <div class="action-content">
              <h4>Mi Perfil</h4>
              <p>Actualiza tu información</p>
            </div>
            <i class="bi bi-arrow-right action-arrow"></i>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import Loading from '../../components/common/Loading.vue';
import reporteService from '../../services/reporteService';
import registroMedicoService from '../../services/registroMedicoService';
import veterinariaService from '../../services/veterinariaService';
import { manejarErrorAPI } from '../../utils/alertas';

export default {
  name: 'VeterinariaDashboard',
  components: { Loading },
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const cargando = ref(true);
    const reportes = ref([]);
    const registros = ref([]);
    
    const stats = computed(() => {
      const pendientes = reportes.value.filter(r => r.estado === 'Pendiente').length;
      const enProceso = reportes.value.filter(r => r.estado === 'En_proceso').length;
      const cerrados = reportes.value.filter(r => r.estado === 'Cerrado').length;
      
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      const inicioDeSemana = new Date(hoy);
      inicioDeSemana.setDate(hoy.getDate() - hoy.getDay());
      
      const inicioDeMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      
      const registrosHoy = registros.value.filter(r => {
        const fecha = new Date(r.fechaAtencion);
        fecha.setHours(0, 0, 0, 0);
        return fecha.getTime() === hoy.getTime();
      }).length;
      
      const registrosSemana = registros.value.filter(r => {
        const fecha = new Date(r.fechaAtencion);
        return fecha >= inicioDeSemana;
      }).length;
      
      const registrosMes = registros.value.filter(r => {
        const fecha = new Date(r.fechaAtencion);
        return fecha >= inicioDeMes;
      }).length;
      
      return {
        reportes: reportes.value.length,
        registros: registros.value.length,
        pendientes,
        enProceso,
        cerrados,
        registrosHoy,
        registrosSemana,
        registrosMes
      };
    });
    
    const getPercentage = (value) => {
      if (stats.value.reportes === 0) return 0;
      return Math.round((value / stats.value.reportes) * 100);
    };
    
    const cargar = async () => {
      try {
        let vetId = authStore.user?.veterinaria?.idVeterinaria || null;
        
        if (!vetId && authStore.usuarioActual?.idUsuario) {
          try {
            const vet = await veterinariaService.getByUsuario(authStore.usuarioActual.idUsuario);
            vetId = vet?.data?.idVeterinaria || null;
          } catch (e) {
            console.warn('No se pudo obtener veterinaria', e);
          }
        }
        
        if (!vetId) {
          cargando.value = false;
          setTimeout(() => {
            router.push({ name: 'VeterinariaPerfil' });
          }, 600);
          return;
        }
        
        // Cargar reportes
        let reportesResp;
        try {
          reportesResp = await reporteService.obtenerReportesPorVeterinaria(vetId);
        } catch (e) {
          const legacy = await reporteService.getByVeterinaria(vetId);
          reportesResp = legacy?.data || [];
        }
        
        reportes.value = Array.isArray(reportesResp) ? reportesResp : (reportesResp?.data || []);
        
        // Cargar registros médicos
        let registrosResp;
        try {
          registrosResp = await registroMedicoService.obtenerPorVeterinaria(vetId);
        } catch (e) {
          const legacy = await registroMedicoService.getByVeterinaria(vetId);
          registrosResp = legacy?.data || [];
        }
        
        registros.value = Array.isArray(registrosResp) ? registrosResp : (registrosResp?.data || []);
        
      } catch (e) {
        manejarErrorAPI(e);
      } finally {
        cargando.value = false;
      }
    };
    
    onMounted(() => cargar());
    
    return {
      cargando,
      stats,
      getPercentage
    };
  }
}
</script>

<style scoped>
/* ============================================
   BASE & ANIMATIONS
   ============================================ */
.dashboard-page {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============================================
   HEADER
   ============================================ */
.dashboard-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-title > i {
  font-size: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.header-title h2 {
  margin: 0;
  font-weight: 700;
  color: #1a1a1a;
  font-size: 2rem;
}

.subtitle {
  margin: 0;
  color: #6c757d;
  font-size: 1rem;
}

/* ============================================
   STATS GRID
   ============================================ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  position: relative;
  background: white;
  border-radius: 20px;
  padding: 2rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-decoration {
  position: absolute;
  right: -20px;
  top: -20px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  opacity: 0.1;
}

.stat-card.primary .stat-decoration {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.success .stat-decoration {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.stat-card.info .stat-decoration {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
}

.stat-card.warning .stat-decoration {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.stat-card.primary .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.stat-card.success .stat-icon {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  box-shadow: 0 8px 20px rgba(40, 167, 69, 0.3);
}

.stat-card.info .stat-icon {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  box-shadow: 0 8px 20px rgba(23, 162, 184, 0.3);
}

.stat-card.warning .stat-icon {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  box-shadow: 0 8px 20px rgba(255, 193, 7, 0.3);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
}

/* ============================================
   CHARTS SECTION
   ============================================ */
.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.chart-header {
  margin-bottom: 1.5rem;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chart-title i {
  font-size: 1.5rem;
  color: #667eea;
}

.chart-title h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
}

.chart-body {
  padding: 1rem 0;
}

/* Progress List */
.progress-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #1a1a1a;
}

.badge-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.badge-dot.pending {
  background: #ffc107;
}

.badge-dot.process {
  background: #17a2b8;
}

.badge-dot.closed {
  background: #28a745;
}

.progress-value {
  font-weight: 700;
  font-size: 1.25rem;
  color: #1a1a1a;
}

.progress-bar-wrapper {
  height: 40px;
  background: #f8f9fa;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 1rem;
  border-radius: 10px;
  transition: width 1s ease;
  position: relative;
}

.progress-bar.pending {
  background: linear-gradient(90deg, #ffc107 0%, #ff9800 100%);
}

.progress-bar.process {
  background: linear-gradient(90deg, #17a2b8 0%, #138496 100%);
}

.progress-bar.closed {
  background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
}

.progress-percentage {
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
}

/* Activity Stats */
.activity-stats {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transform: translateX(5px);
}

.activity-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.activity-icon.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.activity-icon.success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.activity-icon.info {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
}

.activity-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.activity-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
}

.activity-label {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 600;
}

/* ============================================
   QUICK ACTIONS
   ============================================ */
.quick-actions {
  margin-bottom: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
}

.section-title i {
  color: #ffc107;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.action-card:hover::before {
  transform: scaleY(1);
}

.action-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  color: #667eea;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a1a1a;
}

.action-content p {
  margin: 0;
  color: #6c757d;
  font-size: 0.875rem;
}

.action-arrow {
  font-size: 1.5rem;
  color: #667eea;
  transition: transform 0.3s ease;
}

.action-card:hover .action-arrow {
  transform: translateX(5px);
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 768px) {
  .header-title {
    gap: 1rem;
  }
  
  .header-title > i {
    font-size: 2rem;
  }
  
  .header-title h2 {
    font-size: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 1.5rem;
  }
  
  .stat-icon {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
  
  .stat-value {
    font-size: 2rem;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
