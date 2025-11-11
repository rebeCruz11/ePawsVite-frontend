<template>
  <div class="fade-in">
    <h2 class="mb-4">
      <i class="bi bi-clipboard-check me-2"></i>
      Solicitudes de Adopción
    </h2>

    <div class="mb-3 d-flex align-items-center gap-3">
      <label for="filtroEstado" class="form-label mb-0">Filtrar por estado:</label>
      <select id="filtroEstado" v-model="estadoFiltro" class="form-select" @change="cargar">
        <option value="">Todos</option>
        <option value="Pendiente">Pendiente</option>
        <option value="Aprobada">Aprobada</option>
        <option value="Rechazada">Rechazada</option>
        <option value="Cancelada">Cancelada</option>
      </select>
    </div>

    <Loading v-if="cargando" />

    <div v-else class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Solicitante</th>
                <th>Animal</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in adopcionesPaginadas" :key="a.idAdopcion">
                <td>{{ nombreCompleto(a.usuario) }}</td>
                <td>
                  {{ a.animal.nombre }}
                  <br />
                  <small
                    v-if="a.animal.estado === 'Adoptado'"
                    class="text-danger fst-italic"
                  >
                    (Adoptado - no editable)
                  </small>
                </td>
                <td>{{ formatearFecha(a.fechaSolicitud) }}</td>
                <td>
                  <span :class="`badge bg-${colorPorEstado(a.estado)}`">
                    {{ formatearEstado(a.estado) }}
                  </span>
                </td>
                <td>
                  <button
                    v-if="a.estado === 'Pendiente'"
                    class="btn btn-sm btn-success me-2"
                    @click="aprobar(a)"
                  >
                    <i class="bi bi-check"></i>
                  </button>
                  <button
                    v-if="a.estado === 'Pendiente'"
                    class="btn btn-sm btn-danger"
                    @click="rechazar(a)"
                  >
                    <i class="bi bi-x-lg"></i>
                  </button>
                  <button
                    v-else
                    class="btn btn-sm btn-secondary"
                    disabled
                    title="No puedes modificar esta adopción"
                  >
                    <i class="bi bi-check-lg"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="adopcionesPaginadas.length === 0">
                <td colspan="5" class="text-center">No hay solicitudes</td>
              </tr>
            </tbody>
          </table>
        </div>

        <nav aria-label="Paginacion">
          <ul class="pagination justify-content-center">
            <li
              class="page-item"
              :class="{ disabled: paginaActual === 1 }"
              @click="paginaActual > 1 && paginaActual--"
            >
              <a class="page-link" href="#">Anterior</a>
            </li>
            <li
              class="page-item"
              v-for="page in paginas"
              :key="page"
              :class="{ active: page === paginaActual }"
              @click="paginaActual = page"
            >
              <a class="page-link" href="#">{{ page }}</a>
            </li>
            <li
              class="page-item"
              :class="{ disabled: paginaActual === paginas.length }"
              @click="paginaActual < paginas.length && paginaActual++"
            >
              <a class="page-link" href="#">Siguiente</a>
            </li>
          </ul>
        </nav>
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
      paginaActual.value = 1; // Reset page on filter change
    });

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
        await adopcionService.update(a.idAdopcion, {
          ...a,
          estado: "Aprobada",
        });
        if (a.animal && a.animal.idAnimal) {
          await animalService.update(a.animal.idAnimal, {
            ...a.animal,
            estado: "Adoptado",
          });
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
      adopcionesPaginadas,
      paginas,
      paginaActual,
      estadoFiltro,
      aprobar,
      rechazar,
      colorPorEstado,
      formatearEstado,
      formatearFecha,
      nombreCompleto,
    };
  },
};
</script>

<style scoped>
.badge {
  font-size: 1em;
}
</style>
