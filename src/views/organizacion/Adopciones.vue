<template>
  <div class="adoptions-page fade-in">
    <Loading v-if="cargando" />

    <div v-else>
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-title">
            <div class="title-icon">
              <i class="bi bi-clipboard-check-fill"></i>
            </div>
            <div>
              <h2>Solicitudes de Adopción</h2>
              <p class="text-muted mb-0">Gestiona las solicitudes de tus animales</p>
            </div>
          </div>
          
          <!-- Filter -->
          <div class="filter-section">
            <label class="filter-label">
              <i class="bi bi-funnel-fill"></i>
              Filtrar por estado
            </label>
            <select v-model="estadoFiltro" class="filter-select" @change="cargar">
              <option value="">Todos los estados</option>
              <option value="Pendiente">⏳ Pendientes</option>
              <option value="Aprobada">✅ Aprobadas</option>
              <option value="Rechazada">❌ Rechazadas</option>
              <option value="Cancelada">🚫 Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-row">
        <div class="stat-card total">
          <div class="stat-icon">
            <i class="bi bi-clipboard-data"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ adopciones.length }}</span>
            <span class="stat-label">Total Solicitudes</span>
          </div>
        </div>
        
        <div class="stat-card pending">
          <div class="stat-icon">
            <i class="bi bi-clock-history"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ adopciones.filter(a => a.estado === 'Pendiente').length }}</span>
            <span class="stat-label">Pendientes</span>
          </div>
        </div>
        
        <div class="stat-card approved">
          <div class="stat-icon">
            <i class="bi bi-check-circle-fill"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ adopciones.filter(a => a.estado === 'Aprobada').length }}</span>
            <span class="stat-label">Aprobadas</span>
          </div>
        </div>
        
        <div class="stat-card rejected">
          <div class="stat-icon">
            <i class="bi bi-x-circle-fill"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ adopciones.filter(a => a.estado === 'Rechazada').length }}</span>
            <span class="stat-label">Rechazadas</span>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="table-card">
        <div class="table-header">
          <h5>
            <i class="bi bi-list-ul me-2"></i>
            Listado de Solicitudes
          </h5>
          <div class="results-badge">
            {{ adopcionesFiltradas.length }} resultado{{ adopcionesFiltradas.length !== 1 ? 's' : '' }}
          </div>
        </div>

        <div class="table-container">
          <table class="modern-table">
            <thead>
              <tr>
                <th>
                  <div class="th-content">
                    <i class="bi bi-person"></i>
                    Solicitante
                  </div>
                </th>
                <th>
                  <div class="th-content">
                    <i class="bi bi-heart"></i>
                    Animal
                  </div>
                </th>
                <th>
                  <div class="th-content">
                    <i class="bi bi-calendar3"></i>
                    Fecha
                  </div>
                </th>
                <th>
                  <div class="th-content">
                    <i class="bi bi-flag"></i>
                    Estado
                  </div>
                </th>
                <th>
                  <div class="th-content">
                    <i class="bi bi-gear"></i>
                    Acciones
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in adopcionesPaginadas" :key="a.idAdopcion" class="table-row">
                <td>
                  <div class="user-info">
                    <div class="user-avatar">
                      {{ nombreCompleto(a.usuario).split(' ').map(n => n[0]).join('').slice(0, 2) }}
                    </div>
                    <div class="user-details">
                      <span class="user-name">{{ nombreCompleto(a.usuario) }}</span>
                      <span class="user-email">{{ a.usuario.correo }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="animal-info">
                    <div class="animal-name">{{ a.animal.nombre }}</div>
                    <div v-if="a.animal.estado === 'Adoptado'" class="animal-status adopted">
                      <i class="bi bi-lock-fill"></i>
                      Adoptado - no editable
                    </div>
                  </div>
                </td>
                <td>
                  <div class="date-info">
                    <i class="bi bi-calendar-event"></i>
                    {{ formatearFecha(a.fechaSolicitud) }}
                  </div>
                </td>
                <td>
                  <span class="status-badge" :class="a.estado.toLowerCase()">
                    <i :class="getStatusIcon(a.estado)"></i>
                    {{ formatearEstado(a.estado) }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <!-- Aprobar/Rechazar disponibles -->
                    <template v-if="a.estado === 'Pendiente' && !(a.animal && a.animal.estado === 'Adoptado')">
                      <button
                        class="action-btn approve"
                        @click="aprobar(a)"
                        title="Aprobar solicitud"
                      >
                        <i class="bi bi-check-lg"></i>
                        <span>Aprobar</span>
                      </button>
                      <button
                        class="action-btn reject"
                        @click="rechazar(a)"
                        title="Rechazar solicitud"
                      >
                        <i class="bi bi-x-lg"></i>
                        <span>Rechazar</span>
                      </button>
                    </template>
                    
                    <!-- No editable -->
                    <button
                      v-else
                      class="action-btn disabled"
                      disabled
                      :title="(a.animal && a.animal.estado === 'Adoptado') ? 'Animal adoptado: no se pueden aprobar otras solicitudes' : 'No puedes modificar esta adopción'"
                    >
                      <i class="bi bi-lock-fill"></i>
                      <span>Finalizada</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="adopcionesPaginadas.length === 0">
                <td colspan="5" class="empty-row">
                  <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <p>No hay solicitudes {{ estadoFiltro ? `con estado "${formatearEstado(estadoFiltro)}"` : '' }}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="paginas.length > 1" class="pagination-container">
          <button
            class="pagination-btn"
            :class="{ disabled: paginaActual === 1 }"
            :disabled="paginaActual === 1"
            @click="paginaActual > 1 && paginaActual--"
          >
            <i class="bi bi-chevron-left"></i>
            Anterior
          </button>
          
          <div class="pagination-numbers">
            <button
              v-for="page in paginas"
              :key="page"
              class="page-number"
              :class="{ active: page === paginaActual }"
              @click="paginaActual = page"
            >
              {{ page }}
            </button>
          </div>
          
          <button
            class="pagination-btn"
            :class="{ disabled: paginaActual === paginas.length }"
            :disabled="paginaActual === paginas.length"
            @click="paginaActual < paginas.length && paginaActual++"
          >
            Siguiente
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from "vue";
import { useAuthStore } from "../../stores/auth";
import Loading from "../../components/common/Loading.vue";
import adopcionService from "../../services/adopcionService";
import animalService from "../../services/animalService";
import organizacionService from "../../services/organizacionService";
import { toast, manejarErrorAPI } from "../../utils/alertas";
import {
  colorPorEstado,
  formatearEstado,
  formatearFecha,
  nombreCompleto,
} from "../../utils/helpers";

export default {
  name: "OrganizacionAdopciones",
  components: { Loading },
  setup() {
    const authStore = useAuthStore();
    const cargando = ref(true);
    const paginaActual = ref(1);
    const itemsPorPagina = 5;
    const estadoFiltro = ref("");
    const adopciones = ref([]);

    const paginas = computed(() => {
      return Array.from(
        { length: Math.ceil(adopcionesFiltradas.value.length / itemsPorPagina) },
        (_, i) => i + 1
      );
    });

    const adopcionesFiltradas = computed(() => {
      if (!estadoFiltro.value) return adopciones.value;
      return adopciones.value.filter((a) => a.estado === estadoFiltro.value);
    });

    const adopcionesPaginadas = computed(() => {
      const start = (paginaActual.value - 1) * itemsPorPagina;
      const end = start + itemsPorPagina;
      return adopcionesFiltradas.value.slice(start, end);
    });

    watch(estadoFiltro, () => {
      paginaActual.value = 1;
    });

    const getStatusIcon = (estado) => {
      const icons = {
        Pendiente: 'bi bi-clock-history',
        Aprobada: 'bi bi-check-circle-fill',
        Rechazada: 'bi bi-x-circle-fill',
        Cancelada: 'bi bi-slash-circle-fill'
      };
      return icons[estado] || 'bi bi-circle';
    };

    const cargar = async () => {
      try {
        cargando.value = true;
        const org = await organizacionService.getByUsuario(
          authStore.usuarioActual.idUsuario
        );
        const animales = await animalService.getByOrganizacion(
          org.data.idOrganizacion
        );
        const todasAdopciones = await Promise.all(
          animales.data.map((a) => adopcionService.getByAnimal(a.idAnimal))
        );
        adopciones.value = todasAdopciones.flatMap((r) => r.data);
      } catch (e) {
        manejarErrorAPI(e);
      } finally {
        cargando.value = false;
      }
    };

    const aprobar = async (a) => {
      try {
        if (a.animal && a.animal.idAnimal) {
          const respAnimal = await animalService.getById(a.animal.idAnimal);
          const animalActual = respAnimal.data;
          if (animalActual && animalActual.estado === "Adoptado") {
            toast(
              "El animal ya fue adoptado — no puedes aprobar otra solicitud",
              "error"
            );
            await cargar();
            return;
          }
        }

        await adopcionService.update(a.idAdopcion, {
          ...a,
          estado: "Aprobada",
        });

        if (a.animal && a.animal.idAnimal) {
          await animalService.update(a.animal.idAnimal, {
            ...a.animal,
            estado: "Adoptado",
          });

          try {
            const otrasResp = await adopcionService.getByAnimal(a.animal.idAnimal);
            const otras = otrasResp.data || [];
            const pendientes = otras.filter(
              (o) => o.idAdopcion !== a.idAdopcion && o.estado === "Pendiente"
            );
            await Promise.all(
              pendientes.map((o) =>
                adopcionService.update(o.idAdopcion, { ...o, estado: "Rechazada" })
              )
            );
          } catch (e) {
            console.warn("No se pudieron actualizar otras solicitudes:", e);
          }
        }

        toast("Adopción aprobada y animal marcado como adoptado", "success");
        await cargar();
      } catch (e) {
        manejarErrorAPI(e);
      }
    };

    const rechazar = async (a) => {
      try {
        await adopcionService.update(a.idAdopcion, {
          ...a,
          estado: "Rechazada",
        });
        toast("Adopción rechazada", "success");
        await cargar();
      } catch (e) {
        manejarErrorAPI(e);
      }
    };

    onMounted(() => cargar());

    return {
      cargando,
      adopciones,
      adopcionesPaginadas,
      adopcionesFiltradas,
      paginas,
      paginaActual,
      estadoFiltro,
      aprobar,
      rechazar,
      getStatusIcon,
      colorPorEstado,
      formatearEstado,
      formatearFecha,
      nombreCompleto,
    };
  },
};
</script>

<style scoped>
/* ============================================
   BASE & ANIMATIONS
   ============================================ */
.adoptions-page {
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
.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.75rem;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.header-title h2 {
  margin: 0;
  font-weight: 700;
  color: #1a1a1a;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #6c757d;
  margin: 0;
}

.filter-select {
  padding: 0.75rem 1.25rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  min-width: 200px;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
}

/* ============================================
   STATS ROW
   ============================================ */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-card.total .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.pending .stat-icon {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
}

.stat-card.approved .stat-icon {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.stat-card.rejected .stat-icon {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

/* ============================================
   TABLE CARD
   ============================================ */
.table-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #f8f9fa;
}

.table-header h5 {
  margin: 0;
  font-weight: 700;
  color: #1a1a1a;
  display: flex;
  align-items: center;
}

.results-badge {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.table-container {
  overflow-x: auto;
}

/* ============================================
   MODERN TABLE
   ============================================ */
.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.modern-table thead {
  background: #f8f9fa;
}

.modern-table thead th {
  padding: 1.25rem 1.5rem;
  text-align: left;
  font-weight: 700;
  color: #1a1a1a;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e9ecef;
}

.th-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.th-content i {
  color: #667eea;
}

.modern-table tbody td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f8f9fa;
}

.table-row {
  transition: all 0.3s ease;
}

.table-row:hover {
  background: #f8f9fa;
}

/* ============================================
   USER INFO
   ============================================ */
.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.95rem;
}

.user-email {
  font-size: 0.8rem;
  color: #6c757d;
}

/* ============================================
   ANIMAL INFO
   ============================================ */
.animal-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.animal-name {
  font-weight: 600;
  color: #1a1a1a;
}

.animal-status.adopted {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #dc3545;
  font-style: italic;
}

/* ============================================
   DATE INFO
   ============================================ */
.date-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
}

/* ============================================
   STATUS BADGES
   ============================================ */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.pendiente {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}

.status-badge.aprobada {
  background: rgba(40, 167, 69, 0.15);
  color: #28a745;
}

.status-badge.rechazada {
  background: rgba(220, 53, 69, 0.15);
  color: #dc3545;
}

.status-badge.cancelada {
  background: rgba(108, 117, 125, 0.15);
  color: #6c757d;
}

/* ============================================
   ACTION BUTTONS
   ============================================ */
.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.approve {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.action-btn.approve:hover {
  background: #28a745;
  color: white;
  transform: translateY(-2px);
}

.action-btn.reject {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.action-btn.reject:hover {
  background: #dc3545;
  color: white;
  transform: translateY(-2px);
}

.action-btn.disabled {
  background: rgba(108, 117, 125, 0.1);
  color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

/* ============================================
   EMPTY STATE
   ============================================ */
.empty-row {
  padding: 4rem 2rem !important;
}

.empty-state {
  text-align: center;
  color: #6c757d;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}

/* ============================================
   PAGINATION
   ============================================ */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-top: 2px solid #f8f9fa;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: 2px solid #e9ecef;
  background: white;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(.disabled) {
  border-color: #667eea;
  color: #667eea;
}

.pagination-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-number {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid #e9ecef;
  background: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-number:hover {
  border-color: #667eea;
  color: #667eea;
}

.page-number.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-section {
    width: 100%;
  }
  
  .filter-select {
    flex: 1;
  }
  
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-btn span {
    display: none;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
