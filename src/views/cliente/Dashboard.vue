<template>
  <div class="fade-in">
    <h2 class="mb-4 d-flex align-items-center gap-2">
      <i class="bi bi-speedometer2"></i>Mi Dashboard
    </h2>
    <Loading v-if="cargando" />

    <div v-else>
      <div class="row g-4">
        <!-- Panel izquierdo: estadísticas y acciones -->
        <div class="col-lg-7">
          <!-- Estadísticas estilo limpio -->
          <div class="d-flex flex-wrap align-items-stretch gap-4 mb-4">
            <section class="stat-summary bg-light flex-fill px-4 py-3">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <div class="stat-heading">Adopciones</div>
                  <div class="stat-number text-primary">{{ stats.adopciones }}</div>
                </div>
                <span class="stat-icon stat-icon-primary">
                  <i class="bi bi-clipboard-check"></i>
                </span>
              </div>
              <div class="stat-footer mt-2">
                <span>{{ stats.adopcionesPendientes }} pendientes</span>
                <span class="ms-3 text-danger">{{ stats.adopcionesRechazadas }} rechazadas</span>
              </div>
            </section>
            <section class="stat-summary bg-light flex-fill px-4 py-3">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <div class="stat-heading">Reportes</div>
                  <div class="stat-number text-warning">{{ stats.reportes }}</div>
                </div>
                <span class="stat-icon stat-icon-yellow">
                  <i class="bi bi-flag"></i>
                </span>
              </div>
              <div class="stat-footer mt-2">
                <span>{{ stats.reportesPendientes }} pendientes</span>
              </div>
            </section>
          </div>
          <!-- Acciones principales -->
          <div class="d-flex flex-wrap gap-4 mb-0 mt-2">
            <router-link to="/cliente/animales" class="action-btn d-flex flex-column align-items-center text-decoration-none">
              <span class="action-img action-img-blue mb-2"><i class="bi bi-heart"></i></span>
              <span class="fw-semibold">Ver Animales</span>
              <span class="action-desc">Encuentra tu compañero</span>
            </router-link>
            <router-link to="/cliente/crear-reporte" class="action-btn d-flex flex-column align-items-center text-decoration-none">
              <span class="action-img action-img-yellow mb-2"><i class="bi bi-flag"></i></span>
              <span class="fw-semibold">Reportar Animal</span>
              <span class="action-desc">Ayuda a un animal</span>
            </router-link>
            <router-link to="/cliente/mis-adopciones" class="action-btn d-flex flex-column align-items-center text-decoration-none">
              <span class="action-img action-img-green mb-2"><i class="bi bi-clipboard-check"></i></span>
              <span class="fw-semibold">Mis Solicitudes</span>
              <span class="action-desc">Revisa tus adopciones</span>
            </router-link>
          </div>
        </div>
        <!-- Historial lateral derecho estilo lista -->
        <div class="col-lg-5">
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
                      <span class="badge badge-status" :class="`bg-${colorPorEstado(adopcion.estado)}`">{{ formatearEstado(adopcion.estado) }}</span>
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
        <!-- Fin Historial -->
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";
import Loading from "../../components/common/Loading.vue";
import adopcionService from "../../services/adopcionService";
import reporteService from "../../services/reporteService";
import { manejarErrorAPI } from "../../utils/alertas";
import { colorPorEstado, formatearEstado, formatearFecha } from "../../utils/helpers";

export default {
  name: "ClienteDashboard",
  components: { Loading },
  setup() {
    const authStore = useAuthStore();
    const cargando = ref(true);
    const historial = ref([]);
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
      } catch (error) {
        manejarErrorAPI(error);
      } finally {
        cargando.value = false;
      }
    };

    onMounted(() => cargarEstadisticas());

    return {
      cargando,
      stats,
      historial,
      colorPorEstado,
      formatearEstado,
      formatearFecha,
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
</style>
