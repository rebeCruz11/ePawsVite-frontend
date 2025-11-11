<template>
  <div class="dashboard-page fade-in">
    <Loading v-if="cargando" />

    <div v-else>
      <!-- Hero Banner -->
      <div class="dashboard-hero">
        <div class="hero-content">
          <div class="org-info">
            <div class="org-avatar-modern">
              <i class="bi bi-shield-check"></i>
            </div>
            <div class="org-details">
              <h2 class="mb-1">Panel de Administracion</h2>
              <p class="text-muted mb-0">
                <i class="bi bi-speedometer2 me-1"></i>
                Control total del sistema ePaws
              </p>
            </div>
          </div>
          <div class="hero-actions">
            <button class="btn-action primary" @click="() => $router.push('/admin/usuarios')">
              <i class="bi bi-person-plus"></i>
              <span>Usuarios</span>
            </button>
            <button class="btn-action secondary" @click="() => $router.push('/admin/animales')">
              <i class="bi bi-heart"></i>
              <span>Animales</span>
            </button>
            <button class="btn-action success" @click="exportarDatos">
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
            <i class="bi bi-people-fill"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Usuarios</span>
            <h3 class="stat-value">{{ estadisticas.totalUsuarios }}</h3>
            <div class="stat-trend positive">
              <i class="bi bi-arrow-up"></i>
              <span>Total registrados</span>
            </div>
          </div>
          <div class="stat-decoration"></div>
        </div>

        <div class="stat-card-modern success">
          <div class="stat-icon">
            <i class="bi bi-heart-fill"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Animales</span>
            <h3 class="stat-value">{{ estadisticas.totalAnimales }}</h3>
            <div class="stat-trend positive">
              <i class="bi bi-arrow-up"></i>
              <span>En el sistema</span>
            </div>
          </div>
          <div class="stat-decoration"></div>
        </div>

        <div class="stat-card-modern warning">
          <div class="stat-icon">
            <i class="bi bi-clipboard-check-fill"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Adopciones</span>
            <h3 class="stat-value">{{ estadisticas.totalAdopciones }}</h3>
            <div class="stat-trend positive">
              <i class="bi bi-heart"></i>
              <span>Hogares encontrados</span>
            </div>
          </div>
          <div class="stat-decoration"></div>
        </div>

        <div class="stat-card-modern info">
          <div class="stat-icon">
            <i class="bi bi-flag-fill"></i>
          </div>
          <div class="stat-content">
            <span class="stat-label">Reportes</span>
            <h3 class="stat-value">{{ estadisticas.totalReportes }}</h3>
            <div class="stat-trend">
              <i class="bi bi-exclamation-circle"></i>
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

            <div class="chart-card">
              <div class="chart-header">
                <div class="chart-title">
                  <i class="bi bi-building"></i>
                  <span>Top Organizaciones</span>
                </div>
                <div class="chart-badge">
                  Top 10
                </div>
              </div>
              <div class="chart-body">
                <canvas ref="adopcionesOrgChart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="content-right">
          <!-- Top Organizaciones -->
          <div class="sidebar-card">
            <div class="sidebar-header">
              <div class="sidebar-title">
                <i class="bi bi-trophy"></i>
                <span>Top Organizaciones</span>
              </div>
              <button class="btn-icon-export" @click="exportarTopOrg" title="Exportar CSV">
                <i class="bi bi-download"></i>
              </button>
            </div>
            <div class="sidebar-body">
              <div class="org-list">
                <div v-for="(org, index) in topOrganizaciones" :key="org.id" class="org-item">
                  <div class="org-rank" :class="`rank-${index + 1}`">
                    {{ index + 1 }}
                  </div>
                  <div class="org-details">
                    <div class="org-name">{{ org.nombre }}</div>
                    <div class="org-count">
                      <i class="bi bi-heart-fill"></i>
                      {{ org.adoptados }} adoptados
                    </div>
                  </div>
                </div>
                <div v-if="topOrganizaciones.length === 0" class="empty-state">
                  <i class="bi bi-inbox"></i>
                  <p>Sin datos</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div class="sidebar-card">
            <div class="sidebar-header">
              <div class="sidebar-title">
                <i class="bi bi-lightning-charge-fill"></i>
                <span>Acciones Rapidas</span>
              </div>
            </div>
            <div class="sidebar-body">
              <div class="quick-actions">
                <button class="quick-action-btn success" @click="() => $router.push('/admin/usuarios')">
                  <div class="action-icon">
                    <i class="bi bi-people"></i>
                  </div>
                  <div class="action-text">
                    <span class="action-title">Gestionar Usuarios</span>
                    <span class="action-desc">Ver y editar usuarios</span>
                  </div>
                  <i class="bi bi-chevron-right action-arrow"></i>
                </button>
                <button class="quick-action-btn info" @click="() => $router.push('/admin/reportes')">
                  <div class="action-icon">
                    <i class="bi bi-flag"></i>
                  </div>
                  <div class="action-text">
                    <span class="action-title">Ver Reportes</span>
                    <span class="action-desc">Revisar casos activos</span>
                  </div>
                  <i class="bi bi-chevron-right action-arrow"></i>
                </button>
                <button class="quick-action-btn warning" @click="() => $router.push('/admin/organizaciones')">
                  <div class="action-icon">
                    <i class="bi bi-building"></i>
                  </div>
                  <div class="action-text">
                    <span class="action-title">Organizaciones</span>
                    <span class="action-desc">Gestionar orgs</span>
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
import { ref, onMounted, nextTick, onUnmounted } from 'vue';
import { Chart, registerables } from 'chart.js';
import Loading from '../../components/common/Loading.vue';
import usuarioService from '../../services/usuarioService';
import animalService from '../../services/animalService';
import adopcionService from '../../services/adopcionService';
import reporteService from '../../services/reporteService';
import organizacionService from '../../services/organizacionService';
import { manejarErrorAPI, toast } from '../../utils/alertas';

Chart.register(...registerables);
Chart.defaults.color = '#000000';
Chart.defaults.plugins = Chart.defaults.plugins || {};
Chart.defaults.plugins.legend = Chart.defaults.plugins || {};
Chart.defaults.plugins.legend.labels = Chart.defaults.plugins.legend.labels || {};
Chart.defaults.plugins.legend.labels.color = '#000000';
Chart.defaults.plugins.tooltip = Chart.defaults.plugins.tooltip || {};
Chart.defaults.plugins.tooltip.titleColor = '#000000';
Chart.defaults.plugins.tooltip.bodyColor = '#000000';

export default {
  name: 'AdminDashboard',
  components: { Loading },
  setup() {
    const cargando = ref(true);
    const estadisticas = ref({
      totalUsuarios: 0,
      totalAnimales: 0,
      totalAdopciones: 0,
      totalReportes: 0
    });
    
    const adopcionesChart = ref(null);
    const especiesChart = ref(null);
    const reportesChart = ref(null);
    const adopcionesOrgChart = ref(null);
    const adopcionesChartInstance = ref(null);
    const especiesChartInstance = ref(null);
    const reportesChartInstance = ref(null);
    const adopcionesOrgChartInstance = ref(null);
    const topOrganizaciones = ref([]);
    
    const cargarEstadisticas = async () => {
      try {
        const [usuarios, animales, adopciones, reportes, organizaciones] = await Promise.all([
          usuarioService.getAll(),
          animalService.getAll(),
          adopcionService.getAll(),
          reporteService.getAll(),
          organizacionService.getAll()
        ]);

        estadisticas.value = {
          totalUsuarios: usuarios.data.length,
          totalAnimales: animales.data.length,
          totalAdopciones: adopciones.data.length,
          totalReportes: reportes.data.length
        };

        cargando.value = false;
        await nextTick();

        crearGraficoAdopciones(adopciones.data);
        crearGraficoEspecies(animales.data);
        crearGraficoReportesEstado(reportes.data);
        crearGraficoAdopcionesPorOrganizacion(adopciones.data, organizaciones.data);
        calcularTopOrganizaciones(animales.data, organizaciones.data);
      } catch (error) {
        manejarErrorAPI(error);
      } finally {
        cargando.value = false;
      }
    };

    const calcularTopOrganizaciones = async (animales, organizaciones) => {
      try {
        const mapa = {};
        animales.forEach(a => {
          if (a.estado !== 'Adoptado') return;
          const orgId = a.organizacion?.idOrganizacion || a.organizacionId;
          if (!orgId) return;
          mapa[orgId] = (mapa[orgId] || 0) + 1;
        });

        const listado = (organizaciones || []).map(o => ({
          id: o.idOrganizacion || o.id,
          nombre: o.nombreOrganizacion || o.nombre || 'Sin nombre',
          adoptados: mapa[o.idOrganizacion || o.id] || 0
        }));

        listado.sort((a,b) => b.adoptados - a.adoptados);
        topOrganizaciones.value = listado.slice(0,10);
      } catch (e) {
        console.warn('No se pudo calcular top organizaciones', e);
      }
    };

    const exportarDatos = () => {
      const rows = [{
        Usuarios: estadisticas.value.totalUsuarios,
        Animales: estadisticas.value.totalAnimales,
        Adopciones: estadisticas.value.totalAdopciones,
        Reportes: estadisticas.value.totalReportes
      }];
      exportCSV(rows, 'estadisticas-admin.csv');
    };

    const exportarTopOrg = () => {
      const rows = topOrganizaciones.value.map(o => ({
        Organizacion: o.nombre,
        Adoptados: o.adoptados
      }));
      exportCSV(rows, 'top-organizaciones.csv');
    };

    const exportCSV = (rows, filename = 'export.csv') => {
      if (!rows || rows.length === 0) {
        toast('No hay datos para exportar', 'info');
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
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    };
    
    const crearGraficoAdopciones = (adopciones) => {
      try {
        if (!adopcionesChart.value) return;
        const ctx = adopcionesChart.value.getContext('2d');
        if (adopcionesChartInstance.value?.destroy) adopcionesChartInstance.value.destroy();
        
        const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
        const map = {};
        meses.forEach(m => map[m] = 0);
        
        adopciones.forEach(a => {
          const fecha = a.fechaSolicitud || a.fecha;
          if (!fecha) return;
          const d = new Date(fecha);
          if (isNaN(d)) return;
          map[meses[d.getMonth()]]++;
        });
        
        const grad = ctx.createLinearGradient(0,0,0,320);
        grad.addColorStop(0,'rgba(102,126,234,0.9)');
        grad.addColorStop(1,'rgba(102,126,234,0.6)');
        
        adopcionesChartInstance.value = new Chart(ctx, {
          type: 'bar',
          data: { labels: meses, datasets:[{ label:'Adopciones', data: meses.map(m => map[m]), backgroundColor: grad, borderRadius:5 }] },
          options:{ responsive:true, maintainAspectRatio:false, scales:{ x:{ grid:{display:false}, ticks:{color:'#000'} }, y:{ beginAtZero:true, ticks:{ stepSize:1, color:'#000' } } }, plugins:{ legend:{display:false}, tooltip:{bodyColor:'#000', titleColor:'#000'} } }
        });
      } catch (e) {
        console.warn('Error creando grafico adopciones', e);
      }
    };
    
    const crearGraficoEspecies = (animales) => {
      try {
        if (!especiesChart.value) return;
        const ctx = especiesChart.value.getContext('2d');
        if (especiesChartInstance.value?.destroy) especiesChartInstance.value.destroy();
        
        const counts = {};
        animales.forEach(a => { counts[a.especie || 'Desconocido'] = (counts[a.especie || 'Desconocido'] || 0) + 1; });
        const labels = Object.keys(counts);
        const data = labels.map(l => counts[l]);
        const palette = ['rgba(25,135,84,0.85)','rgba(102,126,234,0.85)','rgba(255,193,7,0.85)','rgba(220,53,69,0.85)','rgba(108,117,125,0.85)'];
        
        especiesChartInstance.value = new Chart(ctx, {
          type: 'doughnut',
          data: { labels, datasets: [{ data, backgroundColor: labels.map((_,i)=>palette[i%palette.length]), borderColor: labels.map((_,i)=>palette[i%palette.length].replace('0.85','1')), borderWidth: 1 }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#000' } }, tooltip: { bodyColor: '#000', titleColor: '#000' } } }
        });
      } catch (e) {
        console.warn('Error creando grafico especies', e);
      }
    };

    const crearGraficoReportesEstado = (reportes) => {
      try {
        if (!reportesChart.value) return;
        const ctx = reportesChart.value.getContext('2d');
        if (reportesChartInstance.value?.destroy) reportesChartInstance.value.destroy();
        
        const counts = {};
        reportes.forEach(r => { const e = r.estado || 'Desconocido'; counts[e] = (counts[e]||0) + 1; });
        const labels = Object.keys(counts);
        const data = labels.map(l => counts[l]);
        const palette = ['#667eea','#28a745','#ffc107','#dc3545','#6c757d'];
        
        reportesChartInstance.value = new Chart(ctx, {
          type: 'doughnut',
          data: { labels, datasets: [{ data, backgroundColor: labels.map((_,i)=>palette[i%palette.length]) }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels:{color:'#000'} }, tooltip:{bodyColor:'#000',titleColor:'#000'} } }
        });
      } catch (e) {
        console.warn('Error creando grafico reportes', e);
      }
    };

    const crearGraficoAdopcionesPorOrganizacion = (adopciones, organizaciones) => {
      try {
        if (!adopcionesOrgChart.value) return;
        const ctx = adopcionesOrgChart.value.getContext('2d');
        if (adopcionesOrgChartInstance.value?.destroy) adopcionesOrgChartInstance.value.destroy();
        
        const mapa = {};
        adopciones.forEach(a => {
          if (!a.animal) return;
          const estado = a.estado || a.estadoAdopcion || '';
          if (!(/adoptad|aprobad/i.test(estado))) return;
          const orgId = a.animal.organizacion?.idOrganizacion || a.animal.organizacionId || 'sin-org';
          mapa[orgId] = (mapa[orgId]||0) + 1;
        });

        const listado = (organizaciones || []).map(o => ({
          id: o.idOrganizacion||o.id,
          nombre: o.nombreOrganizacion||o.nombre||'Sin nombre',
          adoptados: mapa[o.idOrganizacion||o.id]||0
        }));

        listado.sort((a,b) => b.adoptados - a.adoptados);
        const top = listado.slice(0,10);
        const labels = top.map(t => t.nombre);
        const data = top.map(t => t.adoptados);

        adopcionesOrgChartInstance.value = new Chart(ctx, {
          type: 'bar',
          data: { labels, datasets: [{ label: 'Adoptados', data, backgroundColor: 'rgba(102,126,234,0.85)', borderRadius:5 }] },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip:{bodyColor:'#000',titleColor:'#000'} },
            scales: { x: { beginAtZero: true, ticks:{color:'#000'} }, y:{ticks:{color:'#000'}} }
          }
        });
      } catch (e) {
        console.warn('Error creando grafico adopciones por org', e);
      }
    };
    
    onMounted(() => cargarEstadisticas());

    onUnmounted(() => {
      try { adopcionesChartInstance.value?.destroy(); } catch(e){}
      try { especiesChartInstance.value?.destroy(); } catch(e){}
      try { reportesChartInstance.value?.destroy(); } catch(e){}
      try { adopcionesOrgChartInstance.value?.destroy(); } catch(e){}
    });
    
    return {
      cargando,
      estadisticas,
      adopcionesChart,
      especiesChart,
      reportesChart,
      adopcionesOrgChart,
      topOrganizaciones,
      exportarDatos,
      exportarTopOrg
    };
  }
}
</script>

<style scoped>
.dashboard-page {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

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

.stat-card-modern.primary .stat-decoration { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-card-modern.success .stat-decoration { background: #28a745; }
.stat-card-modern.warning .stat-decoration { background: #ffc107; }
.stat-card-modern.info .stat-decoration { background: #17a2b8; }

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

.stat-card-modern.primary .stat-icon { background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%); color: #667eea; }
.stat-card-modern.success .stat-icon { background: rgba(40, 167, 69, 0.15); color: #28a745; }
.stat-card-modern.warning .stat-icon { background: rgba(255, 193, 7, 0.15); color: #ffc107; }
.stat-card-modern.info .stat-icon { background: rgba(23, 162, 184, 0.15); color: #17a2b8; }

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

.stat-trend.positive { color: #28a745; }

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

.org-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.org-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.org-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.org-rank {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.org-rank.rank-1 { background: linear-gradient(135deg, #ffd700, #ffed4e); color: #8b6914; }
.org-rank.rank-2 { background: linear-gradient(135deg, #c0c0c0, #e8e8e8); color: #5a5a5a; }
.org-rank.rank-3 { background: linear-gradient(135deg, #cd7f32, #f4a460); color: #5e3a1a; }
.org-rank:not(.rank-1):not(.rank-2):not(.rank-3) { background: #e9ecef; color: #6c757d; }

.org-details {
  flex: 1;
}

.org-name {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.org-count {
  font-size: 0.75rem;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.org-count i {
  color: #dc3545;
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

.quick-action-btn.success { background: rgba(40, 167, 69, 0.1); }
.quick-action-btn.info { background: rgba(23, 162, 184, 0.1); }
.quick-action-btn.warning { background: rgba(255, 193, 7, 0.1); }

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

.quick-action-btn.success .action-icon { background: rgba(40, 167, 69, 0.2); color: #28a745; }
.quick-action-btn.info .action-icon { background: rgba(23, 162, 184, 0.2); color: #17a2b8; }
.quick-action-btn.warning .action-icon { background: rgba(255, 193, 7, 0.2); color: #ffc107; }

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
