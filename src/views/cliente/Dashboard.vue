<template>
  <div class="dashboard-page">
    <Loading v-if="cargando" />

    <div v-else>
      <!-- Hero Banner (cliente) -->
      <ClientHero :title="clientName" subtitle="Panel personal de cliente">
        <template #actions>
          <button class="btn btn-action primary" @click="irAAnimales">
            <i class="bi bi-heart me-1"></i>
            Ver Animales
          </button>
          <button class="btn btn-action secondary" @click="irACrearReporte">
            <i class="bi bi-flag me-1"></i>
            Reportar
          </button>
          <button class="btn btn-action success" @click="irAMisAdopciones">
            <i class="bi bi-clipboard-check me-1"></i>
            Mis Solicitudes
          </button>
        </template>
      </ClientHero>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <StatCard icon="bi bi-clipboard-check" label="Adopciones" :value="stats.adopciones" :trend="`${stats.adopcionesPendientes} pendientes`" variant="primary" />
        <StatCard icon="bi bi-flag" label="Reportes" :value="stats.reportes" :trend="`${stats.reportesPendientes} pendientes`" variant="warning" />
        <StatCard icon="bi bi-people-fill" label="Solicitudes recientes" :value="historial.length" :trend="'Últimas 3 mostradas abajo'" variant="info" />
      </div>

      <div class="dashboard-content">
        <div class="content-left">
          <!-- Recent Adopt Requests (only 3) -->
          <div class="chart-card">
            <div class="chart-header">
              <div class="chart-title"><i class="bi bi-clipboard-check"></i><span>Mis Solicitudes Recientes</span></div>
            </div>
            <div class="chart-body" style="height:auto;">
              <div v-if="recientesAdopciones.length === 0" class="empty-state">
                <i class="bi bi-inbox"></i>
                <p>No tienes solicitudes recientes.</p>
              </div>
              <div v-else>
                <div v-for="a in recientesAdopciones" :key="a.idAdopcion">
                  <ReportItem
                    :title="a.animal?.nombre || 'Sin nombre'"
                    :meta="(a.organizacion?.nombre || a.animal?.organizacion?.nombre || '—') + (a.animal?.especie ? (' • ' + a.animal.especie) : '')"
                    :date="formatearFecha(a.fechaSolicitud)"
                    :status="formatearEstado(a.estado)"
                    icon="bi bi-heart"
                    :statusClass="estadoToBadgeClass(a.estado)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="content-right">
          <div class="historial-container p-0">
            <div class="px-4 pt-4 pb-0 d-flex align-items-center">
              <h5 class="historial-titulo mb-0">Historial de Adopciones</h5>
            </div>
            <div class="px-3 pt-3 pb-4 historial-list">
              <template v-if="historial.length === 0">
                <div class="text-center py-5 text-muted">No tienes historial de adopciones.</div>
              </template>
              <template v-else>
                <div
                  v-for="adopcion in historial"
                  :key="adopcion.idAdopcion"
                  class="historial-item d-flex align-items-center gap-3 mb-4 bg-white shadow-sm"
                >
                  <div>
                    <img
                      v-if="adopcion.animal.imagenes && adopcion.animal.imagenes[0]"
                      :src="adopcion.animal.imagenes[0].url"
                      alt="foto animal"
                      class="historial-thumb"
                    />
                    <div v-else class="historial-thumb historial-thumb-placeholder d-flex align-items-center justify-content-center">
                      <i class="bi bi-image fs-4 text-secondary"></i>
                    </div>
                  </div>
                  <div class="flex-fill">
                    <div class="fw-bold text-primary historial-nombre">{{ adopcion.animal.nombre }}</div>
                    <div class="small text-muted">{{ adopcion.animal.descripcion?.slice(0, 50) }}...</div>
                    <div class="d-flex align-items-center gap-2 mt-1">
                      <span class="badge badge-status" :style="{ background: colorPorEstado(adopcion.estado) }">{{ formatearEstado(adopcion.estado) }}</span>
                      <span class="small">{{ formatearFecha(adopcion.fechaSolicitud) }}</span>
                    </div>
                    <div class="small text-secondary">{{ adopcion.comentarios }}</div>
                  </div>
                  <router-link :to="'/cliente/mis-adopciones'" class="ms-2 historial-link">
                    <i class="bi bi-arrow-right fs-5"></i>
                  </router-link>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useRouter } from 'vue-router';
import { useAuthStore } from "../../stores/auth";
import Loading from "../../components/common/Loading.vue";
import ClientHero from '../../components/common/ClientHero.vue';
import StatCard from '../../components/common/StatCard.vue';
import ReportItem from '../../components/common/ReportItem.vue';
import adopcionService from "../../services/adopcionService";
import reporteService from "../../services/reporteService";
import { manejarErrorAPI } from "../../utils/alertas";
import { colorPorEstado, formatearEstado, formatearFecha } from "../../utils/helpers";

export default {
  name: "ClienteDashboard",
  components: { Loading, ClientHero, StatCard, ReportItem },
  setup() {
    const authStore = useAuthStore();
  const cargando = ref(true);
  const router = useRouter();
    const historial = ref([]);
    const reportesData = ref([]);
    const stats = ref({
      adopciones: 0,
      adopcionesPendientes: 0,
      adopcionesRechazadas: 0,
      reportes: 0,
      reportesPendientes: 0,
    });

    const cargarEstadisticas = async () => {
      try {
        const [adopciones, reportes] = await Promise.all([
          adopcionService.getByUsuario(authStore.usuarioActual.idUsuario),
          reporteService.getByUsuario(authStore.usuarioActual.idUsuario),
        ]);

        stats.value = {
          adopciones: adopciones.data.length,
          adopcionesPendientes: adopciones.data.filter((a) => a.estado === "Pendiente").length,
          adopcionesRechazadas: adopciones.data.filter((a) => a.estado === "Rechazada").length,
          reportes: reportes.data.length,
          reportesPendientes: reportes.data.filter((r) => r.estado === "Pendiente").length,
        };

        historial.value = adopciones.data.sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud));
        reportesData.value = reportes.data || [];
      } catch (error) {
        manejarErrorAPI(error);
      } finally {
        cargando.value = false;
      }
    };

    onMounted(() => cargarEstadisticas());

    const clientName = computed(() => authStore.usuarioActual?.nombre || authStore.usuarioActual?.nombreUsuario || 'Mi Cuenta');
    const recientesAdopciones = computed(() => (historial.value || []).slice(0,3));
    const recientesReportes = computed(() => (reportesData.value || []).slice(0,3));

    const estadoToBadgeClass = (estado) => {
      if (!estado) return 'bg-secondary';
      const e = String(estado).toLowerCase();
      if (e.includes('aprob')) return 'bg-success';
      if (e.includes('pend')) return 'bg-warning text-dark';
      if (e.includes('rech') || e.includes('cancel')) return 'bg-danger';
      return 'bg-secondary';
    };

    const irAAnimales = () => { router.push({ path: '/cliente/animales' }); };
    const irACrearReporte = () => { router.push({ path: '/cliente/crear-reporte' }); };
    const irAMisAdopciones = () => { router.push({ path: '/cliente/mis-adopciones' }); };

    return {
      cargando,
      stats,
      historial,
      colorPorEstado,
      formatearEstado,
      formatearFecha,
      clientName,
      recientesAdopciones,
      recientesReportes,
      irAAnimales,
      irACrearReporte,
      irAMisAdopciones,
      estadoToBadgeClass
    };
  },
};
</script>

<style scoped>
.fade-in { animation: fadeIn 0.8s;}
@keyframes fadeIn { from {opacity: 0;} to {opacity: 1;} }

.stat-summary {
  border-radius: 18px;
  background: #eaf4fc;
  box-shadow: 0 3px 18px #b4d3fa2c;
  min-width: 210px;
  border: none;
}
.stat-heading {
  font-weight: 600;
  text-transform: uppercase;
  font-size: .99em;
  color: #114477;
  letter-spacing: .03em;
}
.stat-number {
  font-size: 2.5em;
  font-weight: 700;
  margin-top: 2px;
  color: #1766bc;
}
.stat-footer {
  color: #5d7ea6;
  font-size: .99em;
  font-weight: 500;
}
.stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px; height: 42px;
  border-radius: 50%;
  font-size: 1.85em;
  background: #d0e7fc;
  color: #1766bc;
}
.stat-icon-primary { background: #d3eafd; color: #114477; }
.stat-icon-yellow { background: #eaeafe; color: #1766bc;}

.action-btn {
  background: #f7fbff;
  border-radius: 1.3em;
  box-shadow: 0 7px 24px #b3cef41f;
  min-width: 145px;
  transition: box-shadow .13s;
  padding: 1.2em 1em;
  font-size: 1em;
  color: inherit;
}
.action-btn:hover { box-shadow: 0 4px 20px #1766bc70; color: #1766bc;}
.action-img {
  border-radius: 16px;
  width: 52px;
  height: 52px;
  font-size: 2em;
  display: flex;
  align-items: center; justify-content: center;
  background: #e3f1fa;
}
.action-img-blue { background:#e3f1fa; color: #1766bc;}
.action-img-yellow {background: #e3f1fa; color: #1766bc;}
.action-img-green {background: #e3f1fa; color: #1766bc;}
.action-desc { color: #5d7ea6; font-size: .97em; }

.historial-container {
  border-radius: 1.35em;
  background: #e9f4fa;
  box-shadow: 0 4px 32px #b4d3fa17;
  min-height: 480px;
}
.historial-titulo {
  color: #1766bc;
  font-weight: 700;
  letter-spacing: .02em;
}
.historial-list {
  max-height: 510px;
  overflow-y: auto;
  scrollbar-width: thin; scrollbar-color: #1766bc #fff;
}
.historial-list::-webkit-scrollbar { width: 7px; }
.historial-list::-webkit-scrollbar-thumb {background:#1766bc; border-radius:6px;}
.historial-item {
  min-height: 80px;
  border-radius: 18px;
  padding:15px 13px 12px 11px;
  background: #f5fbff;
  border-left: 5px solid #1766bc;
  transition: box-shadow .16s;
  box-shadow: 0 2px 16px #bbdafb80;
}
.historial-item:hover { box-shadow: 0 7px 24px #1766bc50; border-left: 5px solid #114477;}
.historial-thumb {
  width:62px; height:62px;
  object-fit:cover; border-radius: 13px;
  box-shadow: 0 2px 8px #b2cced88;
  border: 2px solid #fff;
}
.historial-thumb-placeholder {
  width:62px; height:62px;
  background:#d3eafd;
}
.historial-nombre {font-size:1.10em; letter-spacing:0.01em; color:#1766bc;}
.badge-status {
  font-size:0.89em;
  font-weight: 600;
  letter-spacing: .01em;
  background: #1766bc !important;
  color: #fff !important;
}
.historial-link {
  color: #1766bc;
  transition: color .13s;
}
.historial-link:hover { color: #114477;}
@media (max-width: 991px) {
  .col-lg-5, .col-lg-7 { flex: 0 0 100%; max-width: 100%;}
  .historial-container {margin-top: 22px;}
}

/* Mejoras visuales para "Mis Solicitudes" (recientes) */
.report-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  background: linear-gradient(180deg,#ffffff 0%, #f4fbff 100%);
  border-left: 6px solid rgba(102,126,234,0.14);
  box-shadow: 0 6px 18px rgba(102,126,234,0.06);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.report-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(102,126,234,0.12);
}
.report-icon {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  display:flex; align-items:center; justify-content:center;
  font-size: 1.25rem;
  flex-shrink:0;
}
.report-details {
  flex: 1;
}
.report-title {
  font-weight: 800;
  color: #0f3b66;
  margin-bottom: 0.15rem;
  font-size: 1.05rem; /* más grande y legible */
  line-height: 1.1;
}
.report-meta, .report-date {
  font-size: 0.9rem;
  color: #4f7396;
}
.report-status { margin-left: 0.5rem; display:flex; align-items:center; }
.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 18px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #fff !important;
  box-shadow: 0 3px 10px rgba(0,0,0,0.06);
}

</style>
