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
              <canvas ref="adopcionesChart"></canvas>
            </div>
          </div>
        </div>
        
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <i class="bi bi-pie-chart me-2"></i>
              Animales por Especie
            </div>
            <div class="card-body">
              <canvas ref="especiesChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';
import Loading from '../../components/common/Loading.vue';
import usuarioService from '../../services/usuarioService';
import animalService from '../../services/animalService';
import adopcionService from '../../services/adopcionService';
import reporteService from '../../services/reporteService';
import { manejarErrorAPI } from '../../utils/alertas';

Chart.register(...registerables);

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
      totalReportes: 0
    });
    
    const adopcionesChart = ref(null);
    const especiesChart = ref(null);
    
    const cargarEstadisticas = async () => {
      try {
        const [usuarios, animales, adopciones, reportes] = await Promise.all([
          usuarioService.getAll(),
          animalService.getAll(),
          adopcionService.getAll(),
          reporteService.getAll()
        ]);
        
        estadisticas.value = {
          totalUsuarios: usuarios.data.length,
          totalAnimales: animales.data.length,
          totalAdopciones: adopciones.data.length,
          totalReportes: reportes.data.length
        };
        
        crearGraficoAdopciones(adopciones.data);
        crearGraficoEspecies(animales.data);
      } catch (error) {
        manejarErrorAPI(error);
      } finally {
        cargando.value = false;
      }
    };
    
    const crearGraficoAdopciones = (adopciones) => {
      const adopcionesPorMes = {};
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      
      // Inicializar meses
      meses.forEach(mes => adopcionesPorMes[mes] = 0);
      
      // Contar adopciones por mes
      adopciones.forEach(adopcion => {
        if (adopcion.fechaSolicitud) {
          const fecha = new Date(adopcion.fechaSolicitud);
          const mes = meses[fecha.getMonth()];
          adopcionesPorMes[mes]++;
        }
      });
      
      new Chart(adopcionesChart.value, {
        type: 'bar',
        data: {
          labels: meses,
          datasets: [{
            label: 'Adopciones',
            data: Object.values(adopcionesPorMes),
            backgroundColor: 'rgba(13, 110, 253, 0.7)',
            borderColor: 'rgba(13, 110, 253, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    };
    
    const crearGraficoEspecies = (animales) => {
      const especies = {};
      
      animales.forEach(animal => {
        especies[animal.especie] = (especies[animal.especie] || 0) + 1;
      });
      
      new Chart(especiesChart.value, {
        type: 'doughnut',
        data: {
          labels: Object.keys(especies),
          datasets: [{
            data: Object.values(especies),
            backgroundColor: [
              'rgba(25, 135, 84, 0.7)',
              'rgba(13, 110, 253, 0.7)',
              'rgba(255, 193, 7, 0.7)'
            ],
            borderColor: [
              'rgba(25, 135, 84, 1)',
              'rgba(13, 110, 253, 1)',
              'rgba(255, 193, 7, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    };
    
    onMounted(() => {
      cargarEstadisticas();
    });
    
    return {
      cargando,
      estadisticas,
      adopcionesChart,
      especiesChart
    };
  }
}
</script>
