<template>
  <div class="dashboard-page fade-in">
    <Loading v-if="cargando" />

    <div v-else>
      <!-- Hero Banner -->
      <div class="dashboard-hero">
        <div class="hero-content">
          <div class="org-info">
            <div class="org-avatar-modern">
              <i class="bi bi-building"></i>
            </div>
            <div class="org-details">
              <h2 class="mb-1">{{ orgName }}</h2>
              <p class="text-muted mb-0">
                <i class="bi bi-calendar-check me-1"></i>
                Panel de gestión de la organización
              </p>
            </div>
          </div>
          <div class="hero-actions">
            <button class="btn-action primary" @click="irAAnimales">
              <i class="bi bi-plus-circle"></i>
              <span>Agregar Animal</span>
            </button>
            <button class="btn-action secondary" @click="irAReportes">
              <i class="bi bi-flag"></i>
              <span>Ver Reportes</span>
            </button>
            <button class="btn-action success" @click="exportRecentReportsCSV">
              <i class="bi bi-download"></i>
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card-modern primary">
          <div class="stat-icon">
            <i class="bi bi-heart-fill"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Mis Animales</span>
            <h3 class="stat-value">{{ stats.animales }}</h3>
            <div class="stat-trend positive">
              <i class="bi bi-arrow-up"></i>
              <span>Total registrados</span>
            </div>
          </div>
          <div class="stat-decoration"></div>
        </div>

        <div class="stat-card-modern success">
          <div class="stat-icon">
            <i class="bi bi-check-circle-fill"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Disponibles</span>
            <h3 class="stat-value">{{ stats.disponibles }}</h3>
            <div class="stat-trend positive">
              <i class="bi bi-arrow-up"></i>
              <span>Listos para adopción</span>
            </div>
          </div>
          <div class="stat-decoration"></div>
        </div>

        <div class="stat-card-modern warning">
          <div class="stat-icon">
            <i class="bi bi-award-fill"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Adopciones</span>
            <h3 class="stat-value">{{ stats.adopciones }}</h3>
            <div class="stat-trend positive">
              <i class="bi bi-heart"></i>
              <span>Hogares encontrados</span>
            </div>
          </div>
          <div class="stat-decoration"></div>
        </div>

        <div class="stat-card-modern info">
          <div class="stat-icon">
            <i class="bi bi-exclamation-circle-fill"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Reportes</span>
            <h3 class="stat-value">{{ stats.reportes }}</h3>
            <div class="stat-trend">
              <i class="bi bi-flag-fill"></i>
              <span>Casos activos</span>
            </div>
          </div>
          <div class="stat-decoration"></div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="dashboard-content">
        <div class="content-left">
          <!-- Charts Row 1 -->
          <div class="charts-row">
            <div class="chart-card large">
              <div class="chart-header">
                <div class="chart-title">
                  <i class="bi bi-bar-chart-fill"></i>
                  <span>Adopciones por Mes</span>
                </div>
                <div class="chart-badge">
                  <i class="bi bi-graph-up"></i>
                  Tendencia anual
                </div>
              </div>
              <div class="chart-body">
                <canvas ref="adopcionesChart"></canvas>
              </div>
            </div>
            
            <div class="chart-card small">
              <div class="chart-header">
                <div class="chart-title">
                  <i class="bi bi-pie-chart-fill"></i>
                  <span>Por Especie</span>
                </div>
              </div>
              <div class="chart-body">
                <canvas ref="especiesChart"></canvas>
              </div>
            </div>
          </div>

          <!-- Charts Row 2 -->
          <div class="charts-row">
            <div class="chart-card">
              <div class="chart-header">
                <div class="chart-title">
                  <i class="bi bi-exclamation-triangle-fill"></i>
                  <span>Reportes por Estado</span>
                </div>
              </div>
              <div class="chart-body">
                <canvas ref="reportesChart"></canvas>
              </div>
            </div>

          </div>
        </div>

        <!-- Sidebar -->
        <div class="content-right">
          <!-- Recent Reports -->
          <div class="sidebar-card">
            <div class="sidebar-header">
              <div class="sidebar-title">
                <i class="bi bi-clock-history"></i>
                <span>Reportes Recientes</span>
              </div>
              <button class="btn-icon-export" @click="exportRecentReportsCSV" title="Exportar CSV">
                <i class="bi bi-download"></i>
              </button>
            </div>
            <div class="sidebar-body">
              <div class="recent-reports-list">
                <div v-for="r in recientesReportes" :key="r.idReporte || r.id" class="report-item">
                  <div class="report-icon" :style="{ background: colorPorEstado(r.estado) }">
                    <i class="bi bi-flag-fill"></i>
                  </div>
                  <div class="report-details">
                    <div class="report-title">{{ r.titulo || 'Sin título' }}</div>
                    <div class="report-meta">
                      <i class="bi bi-geo-alt"></i>
                      {{ r.ubicacion || 'Sin ubicación' }}
                    </div>
                    <div class="report-date">
                      <i class="bi bi-calendar3"></i>
                      {{ r.fecha ? new Date(r.fecha).toLocaleDateString() : (r.fechaCreacion ? new Date(r.fechaCreacion).toLocaleDateString() : '') }}
                    </div>
                  </div>
                  <div class="report-status">
                    <span class="status-badge" :style="{ background: colorPorEstado(r.estado) }">
                      {{ r.estado || 'Desconocido' }}
                    </span>
                  </div>
                </div>
                <div v-if="(recientesReportes || []).length === 0" class="empty-state">
                  <i class="bi bi-inbox"></i>
                  <p>Sin reportes recientes</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div class="sidebar-card">
            <div class="sidebar-header">
              <div class="sidebar-title">
                <i class="bi bi-lightning-charge-fill"></i>
                <span>Acciones Rápidas</span>
              </div>
            </div>
            <div class="sidebar-body">
              <div class="quick-actions">
                <button class="quick-action-btn success" @click="irAAnimales">
                  <div class="action-icon">
                    <i class="bi bi-heart"></i>
                  </div>
                  <div class="action-text">
                    <span class="action-title">Ver Animales</span>
                    <span class="action-desc">Gestiona tus mascotas</span>
                  </div>
                  <i class="bi bi-chevron-right action-arrow"></i>
                </button>
                <button class="quick-action-btn info" @click="irAReportes">
                  <div class="action-icon">
                    <i class="bi bi-flag"></i>
                  </div>
                  <div class="action-text">
                    <span class="action-title">Ver Reportes</span>
                    <span class="action-desc">Revisa casos activos</span>
                  </div>
                  <i class="bi bi-chevron-right action-arrow"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, nextTick, onUnmounted } from 'vue';
import { Chart, registerables } from 'chart.js';
import { useAuthStore } from '../../stores/auth';
import Loading from '../../components/common/Loading.vue';
import animalService from '../../services/animalService';
import reporteService from '../../services/reporteService';
import organizacionService from '../../services/organizacionService';
import { manejarErrorAPI, toast } from '../../utils/alertas';
import { colorPorEstado } from '../../utils/helpers';
import { useRouter } from 'vue-router';

Chart.register(...registerables);
Chart.defaults.color = '#000000';
Chart.defaults.plugins = Chart.defaults.plugins || {};
Chart.defaults.plugins.legend = Chart.defaults.plugins.legend || {};
Chart.defaults.plugins.legend.labels = Chart.defaults.plugins.legend.labels || {};
Chart.defaults.plugins.legend.labels.color = '#000000';
Chart.defaults.plugins.tooltip = Chart.defaults.plugins.tooltip || {};
Chart.defaults.plugins.tooltip.titleColor = '#000000';
Chart.defaults.plugins.tooltip.bodyColor = '#000000';

export default {
  name: 'OrganizacionDashboard',
  components: { Loading },
  setup() {
    const authStore = useAuthStore();
    const cargando = ref(true);
    const stats = ref({ animales: 0, disponibles: 0, adopciones: 0, reportes: 0 });
    const orgName = ref('Mi Organización');
    const animalesData = ref([]);
    const reportesData = ref([]);
    const router = useRouter();
    
    const cargarDatos = async () => {
      try {
        cargando.value = true;
        
        // Obtener organización
        const orgResponse = await organizacionService.getByUsuario(authStore.usuarioActual.idUsuario);
        
        if (!orgResponse.data) {
          stats.value = { animales: 0, disponibles: 0, adopciones: 0, reportes: 0 };
          cargando.value = false;
          return;
        }
        
        const org = orgResponse.data;
        orgName.value = org.nombreOrganizacion || org.nombre || orgName.value;
        
        // Cargar animales y reportes en paralelo
        const [animales, reportes] = await Promise.all([
          animalService.getByOrganizacion(org.idOrganizacion).catch(() => ({ data: [] })),
          reporteService.getByOrganizacion(org.idOrganizacion).catch(() => ({ data: [] }))
        ]);
        
        animalesData.value = animales.data || [];
        reportesData.value = reportes.data || [];
        
        // Calcular estadísticas
        stats.value = {
          animales: animalesData.value.length,
          disponibles: animalesData.value.filter(a => a.estado === 'Disponible').length,
          adopciones: animalesData.value.filter(a => a.estado === 'Adoptado').length,
          reportes: reportesData.value.filter(r => r.estado !== 'Cerrado').length // Solo reportes activos
        };
        
        cargando.value = false;
        
        // Crear gráficos después de que los datos estén cargados
        await nextTick();
        crearGraficoEspecies(animalesData.value);
        crearGraficoAdopciones(animalesData.value);
        crearGraficoReportes(reportesData.value);
      } catch (error) {
        console.error('Error al cargar dashboard organización:', error);
        stats.value = { animales: 0, disponibles: 0, adopciones: 0, reportes: 0 };
        animalesData.value = [];
        reportesData.value = [];
        cargando.value = false;
        
        if (error.response?.status !== 404) {
          manejarErrorAPI(error);
        }
      }
    };
    
    onMounted(() => cargarDatos());

    const adopcionesChart = ref(null);
    const especiesChart = ref(null);
    const reportesChart = ref(null);
    const adopcionesOrgChart = ref(null);
    const adopcionesChartInstance = ref(null);
    const especiesChartInstance = ref(null);
    const reportesChartInstance = ref(null);

    const crearGraficoEspecies = (animales) => {
      try {
        if (!especiesChart.value) return;
        const ctx = especiesChart.value.getContext('2d');
        if (especiesChartInstance.value?.destroy) especiesChartInstance.value.destroy();
        const counts = {};
        (animales || []).forEach(a => { counts[a.especie || 'Desconocido'] = (counts[a.especie || 'Desconocido'] || 0) + 1; });
        const labels = Object.keys(counts);
        const data = labels.map(l => counts[l]);
        const palette = ['rgba(25,135,84,0.85)','rgba(13,110,253,0.85)','rgba(255,193,7,0.85)','rgba(220,53,69,0.85)','rgba(108,117,125,0.85)'];
        especiesChartInstance.value = new Chart(ctx, {
          type: 'doughnut',
          data: { labels, datasets: [{ data, backgroundColor: labels.map((_,i)=>palette[i%palette.length]), borderColor: labels.map((_,i)=>palette[i%palette.length].replace('0.85','1')), borderWidth: 1 }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#000' } }, tooltip: { bodyColor: '#000', titleColor: '#000' } } }
        });
      } catch (e) {
        console.warn('Error creando gráfico especies (org):', e);
      }
    };

    const crearGraficoAdopciones = (animales) => {
      try {
        if (!adopcionesChart.value) return;
        const ctx = adopcionesChart.value.getContext('2d');
        if (adopcionesChartInstance.value?.destroy) adopcionesChartInstance.value.destroy();
        const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
        const map = {};
        meses.forEach(m => map[m]=0);
        (animales || []).forEach(a => {
          const estado = (a.estado || '').toLowerCase();
          if (!(/adoptad|adopted|adopt/i.test(estado))) return;
          const fecha = a.fechaAdopcion || a.fecha || a.fechaCreacion || a.updatedAt || a.fechaAdoptada || null;
          if (!fecha) return;
          const d = new Date(fecha);
          if (isNaN(d)) return;
          const m = meses[d.getMonth()];
          map[m] = (map[m] || 0) + 1;
        });
        const data = meses.map(m => map[m] || 0);
        const grad = ctx.createLinearGradient(0,0,0,320); grad.addColorStop(0,'rgba(13,110,253,0.9)'); grad.addColorStop(1,'rgba(13,110,253,0.6)');
        adopcionesChartInstance.value = new Chart(ctx, { type: 'bar', data: { labels: meses, datasets:[{ label:'Adopciones', data, backgroundColor: grad, borderRadius:5 }] }, options:{ responsive:true, maintainAspectRatio:false, scales:{ x:{ grid:{display:false}, ticks:{ color:'#000' } }, y:{ beginAtZero:true, ticks:{ stepSize:1, color:'#000' } } }, plugins:{ legend:{ display:false }, tooltip:{ bodyColor:'#000', titleColor:'#000' } } } });
      } catch (e) {
        console.warn('Error creando gráfico adopciones (org):', e);
      }
    };

    const crearGraficoReportes = (reportes) => {
      try {
        if (!reportesChart.value) return;
        const ctx = reportesChart.value.getContext('2d');
        if (reportesChartInstance.value?.destroy) reportesChartInstance.value.destroy();
        
        // Contar reportes por estado
        const estados = {
          'Pendiente': 0,
          'En_proceso': 0,
          'Cerrado': 0
        };
        
        (reportes || []).forEach(r => {
          const estado = r.estado || 'Pendiente';
          if (estados.hasOwnProperty(estado)) {
            estados[estado]++;
          }
        });
        
        const labels = ['Pendiente', 'En Proceso', 'Cerrado'];
        const data = [estados.Pendiente, estados.En_proceso, estados.Cerrado];
        const colores = [
          'rgba(255, 193, 7, 0.85)',   // Amarillo - Pendiente
          'rgba(13, 110, 253, 0.85)',  // Azul - En proceso
          'rgba(25, 135, 84, 0.85)'    // Verde - Cerrado
        ];
        
        reportesChartInstance.value = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [{
              data,
              backgroundColor: colores,
              borderColor: colores.map(c => c.replace('0.85', '1')),
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: { color: '#000' }
              },
              tooltip: {
                bodyColor: '#000',
                titleColor: '#000'
              }
            }
          }
        });
      } catch (e) {
        console.warn('Error creando gráfico reportes:', e);
      }
    };

    onUnmounted(() => {
      try { adopcionesChartInstance.value?.destroy(); } catch(e){}
      try { especiesChartInstance.value?.destroy(); } catch(e){}
      try { reportesChartInstance.value?.destroy(); } catch(e){}
    });

    const recientesReportes = computed(() => {
      try {
        const copy = (reportesData.value || []).slice();
        const parseDate = d => d ? new Date(d) : new Date(0);
        copy.sort((a,b) => parseDate(b.fecha || b.fechaCreacion) - parseDate(a.fecha || a.fechaCreacion));
        return copy.slice(0,5);
      } catch (e) {
        return (reportesData.value || []).slice(0,5);
      }
    });

    const exportRecentReportsCSV = () => {
      const rows = recientesReportes.value.map(r => ({
        Titulo: r.titulo || '',
        Estado: r.estado || '',
        Fecha: r.fecha || r.fechaCreacion || ''
      }));
      if (!rows.length) {
        toast('No hay reportes recientes para exportar', 'info');
        return;
      }
      const keys = Object.keys(rows[0]);
      const csv = [keys.join(',')]
        .concat(rows.map(r => keys.map(k => `"${(r[k] ?? '').toString().replace(/"/g,'""')}"`).join(',')))
        .join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reportes-recientes.csv';
      a.click();
      URL.revokeObjectURL(url);
    };

    const irAAnimales = () => router.push({ path: '/organizacion/animales' });
    const irAReportes = () => router.push({ path: '/organizacion/reportes' });

    return { cargando, stats, orgName, recientesReportes, colorPorEstado, exportRecentReportsCSV, irAAnimales, irAReportes, adopcionesChart, especiesChart, reportesChart, adopcionesOrgChart };
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
   HERO BANNER
   ============================================ */
.dashboard-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.dashboard-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.3;
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  position: relative;
  z-index: 1;
}

.org-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.org-avatar-modern {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 6s ease-in-out infinite;
}

.org-avatar-modern i {
  font-size: 2.5rem;
  color: white;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.org-details h2 {
  color: white;
  font-weight: 700;
  margin: 0;
}

.org-details p {
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.btn-action.primary {
  background: white;
  color: #667eea;
}

.btn-action.secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-action.success {
  background: rgba(40, 167, 69, 0.3);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-action:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
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

.stat-card-modern {
  background: white;
  border-radius: 20px;
  padding: 1.75rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card-modern:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.stat-card-modern .stat-decoration {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  top: -30px;
  right: -30px;
  opacity: 0.1;
}

.stat-card-modern.primary .stat-decoration {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card-modern.success .stat-decoration {
  background: #28a745;
}

.stat-card-modern.warning .stat-decoration {
  background: #ffc107;
}

.stat-card-modern.info .stat-decoration {
  background: #17a2b8;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 1.75rem;
}

.stat-card-modern.primary .stat-icon {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  color: #667eea;
}

.stat-card-modern.success .stat-icon {
  background: rgba(40, 167, 69, 0.15);
  color: #28a745;
}

.stat-card-modern.warning .stat-icon {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}

.stat-card-modern.info .stat-icon {
  background: rgba(23, 162, 184, 0.15);
  color: #17a2b8;
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0.5rem 0;
  line-height: 1;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.75rem;
}

.stat-trend.positive {
  color: #28a745;
}

/* ============================================
   DASHBOARD CONTENT
   ============================================ */
.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
}

.content-left {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.charts-row:last-child {
  grid-template-columns: 1fr 1fr;
}

.chart-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.chart-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f8f9fa;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.1rem;
  color: #1a1a1a;
}

.chart-title i {
  font-size: 1.25rem;
  color: #667eea;
}

.chart-badge {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
  padding: 0.4rem 0.875rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-body {
  height: 320px;
  position: relative;
}

.charts-row:last-child .chart-body {
  height: 280px;
}

/* ============================================
   SIDEBAR
   ============================================ */
.content-right {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 2px solid #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.1rem;
  color: #1a1a1a;
}

.sidebar-title i {
  font-size: 1.25rem;
  color: #667eea;
}

.btn-icon-export {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-icon-export:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: scale(1.1);
}

.sidebar-body {
  padding: 1rem;
}

/* ============================================
   RECENT REPORTS
   ============================================ */
.recent-reports-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.report-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.report-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.report-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.report-details {
  flex: 1;
}

.report-title {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.report-meta,
.report-date {
  font-size: 0.75rem;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.report-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 0.4rem 0.875rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* ============================================
   QUICK ACTIONS
   ============================================ */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.quick-action-btn.success {
  background: rgba(40, 167, 69, 0.1);
}

.quick-action-btn.info {
  background: rgba(23, 162, 184, 0.1);
}

.quick-action-btn:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.quick-action-btn.success .action-icon {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
}

.quick-action-btn.info .action-icon {
  background: rgba(23, 162, 184, 0.2);
  color: #17a2b8;
}

.action-text {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.action-title {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.95rem;
}

.action-desc {
  font-size: 0.75rem;
  color: #6c757d;
}

.action-arrow {
  color: #6c757d;
  transition: transform 0.3s ease;
}

.quick-action-btn:hover .action-arrow {
  transform: translateX(5px);
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 1200px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
  
  .content-right {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    display: grid;
  }
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .hero-actions {
    width: 100%;
  }
  
  .btn-action {
    flex: 1;
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-row {
    grid-template-columns: 1fr;
  }
  
  .dashboard-hero {
    padding: 1.5rem;
  }
}
</style>
