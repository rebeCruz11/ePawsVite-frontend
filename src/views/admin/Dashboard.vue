<template>
  <div class="fade-in">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-speedometer2 me-2"></i>Dashboard Administrativo</h2>
      <small class="text-muted">Panel de Control</small>
    </div>
    
    <Loading v-if="cargando" />
    
    <div v-else>
      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-3">
          <div class="card stat-card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-muted mb-2">Total Usuarios</h6>
                  <h2 class="mb-0">{{ estadisticas.totalUsuarios }}</h2>
                </div>
                <div class="avatar-lg bg-primary">
                  <i class="bi bi-people fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="card stat-card success h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-muted mb-2">Animales</h6>
                  <h2 class="mb-0">{{ estadisticas.totalAnimales }}</h2>
                </div>
                <div class="avatar-lg bg-success">
                  <i class="bi bi-heart fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="card stat-card warning h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-muted mb-2">Adopciones</h6>
                  <h2 class="mb-0">{{ estadisticas.totalAdopciones }}</h2>
                </div>
                <div class="avatar-lg bg-warning">
                  <i class="bi bi-clipboard-check fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="card stat-card info h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-muted mb-2">Reportes</h6>
                  <h2 class="mb-0">{{ estadisticas.totalReportes }}</h2>
                </div>
                <div class="avatar-lg bg-info">
                  <i class="bi bi-flag fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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

      <!-- New charts row: Reportes por Estado + Adopciones por Organización -->
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

      <!-- Top organizaciones por animales adoptados + export -->
      <div class="row g-4 mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <div>
                <i class="bi bi-building me-2"></i>
                Top Organizaciones (animales adoptados)
              </div>
              <div>
                <button class="btn btn-sm btn-outline-primary me-2" @click="exportCSV(topOrganizaciones.map(o=>({Organizacion:o.nombre,Adoptados:o.adoptados})), 'top-organizaciones.csv')">
                  <i class="bi bi-download me-1"></i>Exportar CSV
                </button>
              </div>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>Organización</th>
                      <th class="text-end">Animales adoptados</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="org in topOrganizaciones" :key="org.id">
                      <td>{{ org.nombre }}</td>
                      <td class="text-end">{{ org.adoptados }}</td>
                    </tr>
                    <tr v-if="topOrganizaciones.length === 0">
                      <td colspan="2" class="text-center">Sin datos</td>
                    </tr>
                  </tbody>
                </table>
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

// Make chart text (labels, legends, tooltips, scales) appear in black to
// match design requirement: "el texto de las gráficas debe de ser negro".
// These defaults apply globally to all Chart.js instances created below.
Chart.defaults.color = '#000000';
Chart.defaults.plugins = Chart.defaults.plugins || {};
Chart.defaults.plugins.legend = Chart.defaults.plugins.legend || {};
Chart.defaults.plugins.legend.labels = Chart.defaults.plugins.legend.labels || {};
Chart.defaults.plugins.legend.labels.color = '#000000';
Chart.defaults.plugins.title = Chart.defaults.plugins.title || {};
Chart.defaults.plugins.title.color = '#000000';
// Tooltip text colors
Chart.defaults.plugins.tooltip = Chart.defaults.plugins.tooltip || {};
Chart.defaults.plugins.tooltip.titleColor = '#000000';
Chart.defaults.plugins.tooltip.bodyColor = '#000000';

export default {
  name: 'AdminDashboard',
  components: {
    Loading
  },
  setup() {
    const cargando = ref(true);
    const estadisticas = ref({
      totalUsuarios: 0,
      totalAnimales: 0,
      totalAdopciones: 0,
      totalReportes: 0,
      totalOrganizaciones: 0
    });
    
    const adopcionesChart = ref(null);
    const especiesChart = ref(null);
    const adopcionesChartInstance = ref(null);
    const especiesChartInstance = ref(null);
    const reportesChart = ref(null);
    const reportesChartInstance = ref(null);
    const adopcionesOrgChart = ref(null);
    const adopcionesOrgChartInstance = ref(null);
    
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
          totalReportes: reportes.data.length,
          totalOrganizaciones: organizaciones.data.length
        };

        // Mostrar la UI antes de crear los gráficos para asegurar que
        // los elementos <canvas> estén presentes y los refs estén ligados.
        cargando.value = false;

        // Esperar al siguiente tick para que el DOM se actualice y los
        // refs a los canvas existan, luego crear los gráficos.
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

    // Calcular top organizaciones por animales adoptados
    const topOrganizaciones = ref([]);
    const calcularTopOrganizaciones = async (animales, organizaciones) => {
      try {
        const mapa = {};
        animales.forEach(a => {
          const estadoAdoptado = a.estado === 'Adoptado' || a.estado === 'Adoptado';
          if (!estadoAdoptado) return;
          const orgObj = a.organizacion || a.organizacionId || a.idOrganizacion || a.organizacion?.idOrganizacion;
          const orgId = orgObj && (orgObj.idOrganizacion || orgObj);
          if (!orgId) return;
          mapa[orgId] = (mapa[orgId] || 0) + 1;
        });

        const listado = (organizaciones || []).map(o => ({
          id: o.idOrganizacion || o.id || null,
          nombre: o.nombreOrganizacion || o.nombre || 'Sin nombre',
          adoptados: mapa[o.idOrganizacion || o.id] || 0
        }));

        listado.sort((a,b) => b.adoptados - a.adoptados);
        topOrganizaciones.value = listado.slice(0,10);
      } catch (e) {
        console.warn('No se pudo calcular top organizaciones', e);
      }
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
      const adopcionesPorMes = {};
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      
      meses.forEach(mes => adopcionesPorMes[mes] = 0);
      
      adopciones.forEach(adopcion => {
        if (adopcion.fechaSolicitud) {
          const fecha = new Date(adopcion.fechaSolicitud);
          const mes = meses[fecha.getMonth()];
          adopcionesPorMes[mes]++;
        }
      });
      
      try {
        if (!adopcionesChart.value) return;

        const ctx = adopcionesChart.value.getContext('2d');
        
        if (adopcionesChartInstance.value?.destroy) adopcionesChartInstance.value.destroy();

        const grad = ctx.createLinearGradient(0, 0, 0, 320);
        grad.addColorStop(0, 'rgba(13,110,253,0.9)');
        grad.addColorStop(1, 'rgba(13,110,253,0.6)');

        adopcionesChartInstance.value = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: meses,
            datasets: [{
              label: 'Adopciones',
              data: Object.values(adopcionesPorMes),
              backgroundColor: grad,
              borderColor: 'rgba(0,123,255,1)',
              borderWidth: 2,
              hoverBackgroundColor: 'rgba(0,123,255,0.9)',
              hoverBorderColor: 'rgba(0,123,255,1)',
              borderRadius: 5
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 800, easing: 'easeOutQuart' },
            interaction: { mode: 'index', intersect: false },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: ctx => `Adopciones: ${ctx.parsed.y} mascotas`
                }
              }
            },
            scales: {
              x: { grid: { display: false } },
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1 }
              }
            }
          }
        });
      } catch (err) {
        console.warn('Error creando gráfico adopciones:', err);
        toast('No se pudo renderizar el gráfico de adopciones', 'warning');
      }
    };
    
    const crearGraficoEspecies = (animales) => {
      const especies = {};
      animales.forEach(animal => {
        especies[animal.especie] = (especies[animal.especie] || 0) + 1;
      });
      
      try {
        if (!especiesChart.value) return;

        const ctx = especiesChart.value.getContext('2d');
        
        if (especiesChartInstance.value?.destroy) especiesChartInstance.value.destroy();

        const palette = [
          'rgba(25,135,84,0.85)',
          'rgba(13,110,253,0.85)',
          'rgba(255,193,7,0.85)',
          'rgba(220,53,69,0.85)',
          'rgba(108,117,125,0.85)'
        ];

        especiesChartInstance.value = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: Object.keys(especies),
            datasets: [{
              data: Object.values(especies),
              backgroundColor: Object.keys(especies).map((_, i) => palette[i % palette.length]),
              borderColor: Object.keys(especies).map((_, i) => palette[i % palette.length].replace('0.85', '1')),
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 600, easing: 'easeOutCubic' },
            plugins: {
              legend: { position: 'right', labels: { font: { size: 14 } } },
              tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.formattedValue}` } }
            }
          }
        });
      } catch (err) {
        console.warn('Error creando gráfico especies:', err);
        toast('No se pudo renderizar el gráfico de especies', 'warning');
      }
    };

    const crearGraficoReportesEstado = (reportes) => {
      try {
        if (!reportesChart.value) return;

        const ctx = reportesChart.value.getContext('2d');

        if (reportesChartInstance.value?.destroy) reportesChartInstance.value.destroy();

        const counts = {};
        (reportes || []).forEach(r => { const e = r.estado || 'Desconocido'; counts[e] = (counts[e]||0) + 1; });
        const labels = Object.keys(counts);
        const data = labels.map(l => counts[l]);

        const palette = ['#0d6efd','#198754','#ffc107','#dc3545','#6c757d'];

        reportesChartInstance.value = new Chart(ctx, {
          type: 'doughnut',
          data: { labels, datasets: [{ data, backgroundColor: labels.map((_,i)=>palette[i%palette.length]) }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        });

      } catch (e) {
        console.warn('Error creando gráfico reportes estado', e);
        toast('No se pudo renderizar el gráfico de reportes por estado', 'warning');
      }
    };

    const crearGraficoAdopcionesPorOrganizacion = (adopciones, organizaciones) => {
      try {
        if (!adopcionesOrgChart.value) return;

        const ctx = adopcionesOrgChart.value.getContext('2d');

        if (adopcionesOrgChartInstance.value?.destroy) adopcionesOrgChartInstance.value.destroy();

        const mapa = {};
        (adopciones || []).forEach(a => {
          if (!a.animal) return;
          const estado = a.estado || a.estadoAdopcion || '';
          if (!(/adoptad|aprobad/i.test(estado))) return;
          const orgObj = a.animal.organizacion || a.animal.organizacionId || a.animal.idOrganizacion || (a.animal.organizacion && a.animal.organizacion.idOrganizacion);
          const orgId = orgObj && (orgObj.idOrganizacion || orgObj.id || orgObj) || 'sin-org';
          mapa[orgId] = (mapa[orgId]||0) + 1;
        });

        const listado = (organizaciones || []).map(o => ({
          id: o.idOrganizacion||o.id,
          nombre: o.nombreOrganizacion||o.nombre||'Sin nombre',
          adoptados: mapa[o.idOrganizacion||o.id]||0
        }));

        Object.keys(mapa).forEach(k => {
          if (!listado.find(x => String(x.id) === String(k))) listado.push({ id: k, nombre: k, adoptados: mapa[k] });
        });

        listado.sort((a,b) => b.adoptados - a.adoptados);
        const top = listado.slice(0,10);
        const labels = top.map(t => t.nombre);
        const data = top.map(t => t.adoptados);

        adopcionesOrgChartInstance.value = new Chart(ctx, {
          type: 'bar',
          data: { labels, datasets: [{ label: 'Adoptados', data, backgroundColor: 'rgba(13,110,253,0.85)' }] },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true } }
          }
        });
      } catch (e) {
        console.warn('Error creando gráfico adopciones por org', e);
        toast('No se pudo renderizar el gráfico de adopciones por organización', 'warning');
      }
    };
    
    // Debounce helper for resize
    const debounce = (fn, wait = 150) => {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
      };
    };

    // Resize handler to redraw charts
    const handleResize = debounce(() => {
      try {
        adopcionesChartInstance.value?.resize();
        especiesChartInstance.value?.resize();
        reportesChartInstance.value?.resize();
        adopcionesOrgChartInstance.value?.resize();
      } catch (e) {
        console.warn('Error resizing charts', e);
      }
    }, 200);

    onMounted(() => {
      cargarEstadisticas();
      window.addEventListener('resize', handleResize);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
      adopcionesChartInstance.value?.destroy();
      especiesChartInstance.value?.destroy();
      reportesChartInstance.value?.destroy();
      adopcionesOrgChartInstance.value?.destroy();
    });
    
    return {
      cargando,
      estadisticas,
      adopcionesChart,
      especiesChart,
      reportesChart,
      adopcionesOrgChart,
      topOrganizaciones,
      exportCSV
    };
  }
}
</script>

<style scoped>
.stat-card {
  border-radius: 0.375rem;
}

.avatar-lg {
  width: 3rem;
  height: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0.75rem;
}

.bg-primary {
  background-color: #0d6efd !important;
  color: white;
}

.bg-success {
  background-color: #198754 !important;
  color: white;
}

.bg-warning {
  background-color: #ffc107 !important;
  color: black;
}

.bg-info {
  background-color: #0dcaf0 !important;
  color: white;
}

/* Force chart card headers to be black and slightly bolder to match design */
.card .card-header {
  color: #000 !important;
  font-weight: 600;
}

/* Make small helper text in headers muted but readable */
.card .card-header .text-muted {
  color: rgba(0,0,0,0.6) !important;
}
</style>
