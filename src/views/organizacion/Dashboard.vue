<template>
  <div class="fade-in">
    <h2 class="mb-4"><i class="bi bi-speedometer2 me-2"></i>Dashboard</h2>

    <Loading v-if="cargando" />

    <div v-else>
      <!-- Hero: organization info + quick actions -->
      <div class="org-hero mb-4">
        <div class="left d-flex align-items-center">
          <div class="org-avatar">
            {{ (orgName || 'MO').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase() }}
          </div>
          <div>
            <h3 class="mb-0">{{ orgName }}</h3>
            <small class="text-muted">Panel de gestión de la organización</small>
          </div>
        </div>
        <div class="org-actions d-flex align-items-center">
          <button class="btn btn-sm btn-primary" @click="irAAnimales"><i class="bi bi-plus-lg me-1"></i>Agregar Animal</button>
          <button class="btn btn-sm btn-outline-secondary" @click="irAReportes"><i class="bi bi-flag-fill me-1"></i>Ver Reportes</button>
          <button class="btn btn-sm btn-outline-success" @click="exportRecentReportsCSV"><i class="bi bi-download me-1"></i>Exportar recientes</button>
        </div>
      </div>

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

      <!-- Main content: stats + recent reports -->
      <div class="row g-4">
        <div class="col-lg-8">
          <!-- existing charts area retained below the stats (keeps same layout) -->
          <!-- Charts -->
          <div class="row g-4">
            <div class="col-md-8">
              <div class="card">
                <div class="card-header">
                  <i class="bi bi-bar-chart me-2"></i>
                  Adopciones por Mes
                </div>
                <div class="card-body">
                  <div style="height:320px">
                    <canvas ref="adopcionesChart" style="width:100%;height:100%"></canvas>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-4">
              <div class="card">
                <div class="card-header ">
                  <i class="bi bi-pie-chart me-2"></i>
                  Animales por Especie
                </div>
                <div class="card-body">
                  <div style="height:320px">
                    <canvas ref="especiesChart" style="width:100%;height:100%"></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- other chart row: reportes + adopciones por org -->
          <div class="row g-4 mt-3">
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <i class="bi bi-exclamation-circle me-2"></i>
                  Reportes por Estado
                </div>
                <div class="card-body">
                  <div style="height:280px">
                    <canvas ref="reportesChart" style="width:100%;height:100%"></canvas>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <div><i class="bi bi-building-up me-2"></i>Adopciones por Organización</div>
                  <small class="text-muted">Top 10</small>
                </div>
                <div class="card-body">
                  <div style="height:280px">
                    <canvas ref="adopcionesOrgChart" style="width:100%;height:100%"></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <div><i class="bi bi-journal-text me-2"></i>Reportes recientes</div>
              <button class="btn btn-sm btn-outline-primary" @click="exportRecentReportsCSV"><i class="bi bi-download me-1"></i>CSV</button>
            </div>
            <div class="card-body">
              <ul class="list-unstyled recent-list mb-0">
                <li v-for="r in recientesReportes" :key="r.idReporte || r.id">
                  <div>
                    <div class="fw-semibold">{{ r.titulo || 'Sin título' }}</div>
                    <small class="text-muted">{{ r.ubicacion || '' }} • {{ r.fecha ? new Date(r.fecha).toLocaleString() : (r.fechaCreacion ? new Date(r.fechaCreacion).toLocaleString() : '') }}</small>
                  </div>
                  <div>
                    <span class="badge" :style="{ backgroundColor: colorPorEstado(r.estado), color: '#fff' }">{{ r.estado || 'Desconocido' }}</span>
                  </div>
                </li>
                <li v-if="(recientesReportes || []).length === 0" class="text-center text-muted py-3">Sin reportes recientes</li>
              </ul>
            </div>
          </div>
          
          <div class="card mt-3">
            <div class="card-body">
              <h6>Atajos rápidos</h6>
              <div class="d-grid gap-2">
                <button class="btn btn-outline-success" @click="irAAnimales"><i class="bi bi-heart me-1"></i> Ver Animales</button>
                <button class="btn btn-outline-secondary" @click="irAReportes"><i class="bi bi-flag-fill me-1"></i> Ver Reportes</button>
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

Chart.register(...registerables);

// Force chart text to black within this component
Chart.defaults.color = '#000000';
Chart.defaults.plugins = Chart.defaults.plugins || {};
Chart.defaults.plugins.legend = Chart.defaults.plugins.legend || {};
Chart.defaults.plugins.legend.labels = Chart.defaults.plugins.legend.labels || {};
Chart.defaults.plugins.legend.labels.color = '#000000';
Chart.defaults.plugins.tooltip = Chart.defaults.plugins.tooltip || {};
Chart.defaults.plugins.tooltip.titleColor = '#000000';
Chart.defaults.plugins.tooltip.bodyColor = '#000000';
import { useRouter } from 'vue-router';

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
        const orgResponse = await organizacionService.getByUsuario(authStore.usuarioActual.idUsuario);
        
        if (!orgResponse.data) {
          stats.value = { animales: 0, disponibles: 0, adopciones: 0, reportes: 0 };
          cargando.value = false;
          return;
        }
        
        // Guardar nombre de la organización para el header
        orgName.value = orgResponse.data.nombreOrganizacion || orgResponse.data.nombre || orgName.value;
        
        const [animales, reportes] = await Promise.all([
          animalService.getByOrganizacion(orgResponse.data.idOrganizacion),
          reporteService.getByOrganizacion(orgResponse.data.idOrganizacion)
        ]);
        
        animalesData.value = animales.data || [];
        reportesData.value = reportes.data || [];
        
        stats.value = {
          animales: animalesData.value.length,
          disponibles: animalesData.value.filter(a => a.estado === 'Disponible').length,
          adopciones: animalesData.value.filter(a => a.estado === 'Adoptado').length,
          reportes: reportesData.value.length
        };
        // Mostrar UI y esperar a que los <canvas> estén montados antes de crear gráficos
        cargando.value = false;
        await nextTick();
        crearGraficoEspecies(animalesData.value);
        crearGraficoAdopciones(animalesData.value);
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

    // Chart refs and instances
    const adopcionesChart = ref(null);
    const especiesChart = ref(null);
    const adopcionesChartInstance = ref(null);
    const especiesChartInstance = ref(null);

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

    onUnmounted(() => {
      try { adopcionesChartInstance.value?.destroy(); } catch(e){}
      try { especiesChartInstance.value?.destroy(); } catch(e){}
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

    return { cargando, stats, orgName, recientesReportes, colorPorEstado, exportRecentReportsCSV, irAAnimales, irAReportes, adopcionesChart, especiesChart };
  }
}
</script>

<style scoped>
/* Hero */
.org-hero { display:flex; align-items:center; justify-content:space-between; gap:1rem; }
.org-hero .left { display:flex; align-items:center; gap:0.75rem; }
.org-avatar { width:56px; height:56px; border-radius:50%; background: linear-gradient(135deg,#ff7a18,#ffb347); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:1.1rem; box-shadow:0 6px 14px rgba(0,0,0,0.12); }
.org-actions button { margin-left:0.5rem }

/* Stat card tweaks */
.stat-card { border-radius:0.6rem; box-shadow:0 6px 16px rgba(15,23,42,0.06); }
.stat-card.success .card-body { background: linear-gradient(135deg,#e6ffed,#d1f7e0); }
.stat-card.warning .card-body { background: linear-gradient(135deg,#fff7e6,#fff0d1); }
.stat-card.info .card-body { background: linear-gradient(135deg,#e6f8ff,#dff7ff); }
.stat-card .card-body h6 { color:#222; }

/* Recent list */
.recent-list li { display:flex; justify-content:space-between; align-items:center; padding:0.65rem 0; border-bottom:1px solid rgba(0,0,0,0.04); }
.recent-list .badge { min-width:96px; text-align:center; border-radius:0.5rem; padding:0.35rem 0.6rem; font-size:0.8rem; }

@media (max-width:767px) {
  .org-hero { flex-direction:column; align-items:flex-start }
  .org-actions { width:100%; display:flex; gap:0.5rem }
  .org-actions button { flex:1 }
}

/* Force card headers (chart titles) black */
.card .card-header { color: #000 !important; font-weight:600 }

</style>
