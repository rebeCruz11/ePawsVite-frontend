<template>
  <div class="fade-in">
    <ClientHero title="Animales en Adopción" subtitle="Explora los animales disponibles y solicita la adopción">
      <template #actions>
        <button class="btn btn-action primary" @click="$router.push('/cliente/mis-adopciones')">
          <i class="bi bi-clipboard-check me-1"></i>
          Mis Solicitudes
        </button>
        <button class="btn btn-action secondary" @click="$router.push('/cliente/crear-reporte')">
          <i class="bi bi-flag me-1"></i>
          Reportar
        </button>
      </template>
    </ClientHero>

    <!-- Filtros -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <input
              type="text"
              class="form-control"
              v-model="busqueda"
              placeholder="Buscar por nombre..."
              @input="filtrarAnimales"
            />
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="filtroEspecie" @change="filtrarAnimales">
              <option value="">Todas las especies</option>
              <option value="Perro">Perros</option>
              <option value="Gato">Gatos</option>
              <option value="Otro">Otros</option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="filtroSexo" @change="filtrarAnimales">
              <option value="">Todos los sexos</option>
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-secondary w-100" @click="limpiarFiltros">
              <i class="bi bi-x-circle"></i> Limpiar
            </button>
          </div>
        </div>
      </div>
    </div>

    <Loading v-if="cargando" />

    <!-- Grid de animales -->
    <div v-else>
      <div class="row g-4" v-if="animalesFiltrados.length > 0">
        <div class="col-md-4" v-for="animal in animalesPaginados" :key="animal.idAnimal">
          <div class="card animal-card h-100">
            <div
              v-if="obtenerFotoAnimal(animal)"
              style="height: 250px; position: relative; overflow: hidden;"
            >
              <img
                :src="obtenerFotoAnimal(animal)"
                :alt="animal.nombre"
                style="width: 100%; height: 100%; object-fit: cover;"
                @error="e => e.target.style.display = 'none'"
              />
              <div class="position-absolute top-0 end-0 m-2">
                <span class="badge bg-success">{{ animal.estado }}</span>
              </div>
            </div>
            <div
              v-else
              style="height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); position: relative;"
            >
              <div class="position-absolute top-0 end-0 m-2">
                <span class="badge bg-success">{{ animal.estado }}</span>
              </div>
              <div class="d-flex align-items-center justify-content-center h-100">
                <i :class="`bi ${iconoPorEspecie(animal.especie)} text-white`" style="font-size: 4rem;"></i>
              </div>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="card-title mb-0">{{ animal.nombre }}</h5>
                <span class="badge bg-success">{{ animal.estado }}</span>
              </div>
              <p class="text-muted mb-2">
                <i class="bi bi-tag me-1"></i>{{ animal.especie }} • 
                <i class="bi bi-gender-ambiguous me-1"></i>{{ animal.sexo }}
              </p>
              <p class="text-muted mb-2">
                <i class="bi bi-calendar me-1"></i>{{ animal.edad }} {{ animal.unidadEdad }}
              </p>
              <p class="card-text">{{ truncar(animal.descripcion, 80) }}</p>
            </div>
            <div class="card-footer bg-transparent">
              <button
                v-if="puedeSolicitar(animal) && !excedeLimiteSemanal() && puedeEnviarConcurrente()"
                class="btn btn-primary w-100"
                @click="solicitarAdopcion(animal)"
              >
                <i class="bi bi-heart me-2"></i>Solicitar Adopción
              </button>
              <button
                v-else-if="!puedeEnviarConcurrente()"
                class="btn btn-outline-danger w-100"
                disabled
                title="Has alcanzado el máximo de 3 solicitudes activas. Cancela una para crear otra."
              >
                <i class="bi bi-x-circle me-2"></i>Máximo 3 solicitudes activas (restan {{ 3 - solicitudesActivas() }})
              </button>
              <button
                v-else-if="excedeLimiteSemanal()"
                class="btn btn-outline-danger w-100"
                disabled
                title="Has alcanzado el límite semanal de solicitudes aprobadas (3)"
              >
                <i class="bi bi-x-circle me-2"></i>Límite semanal alcanzado (restan {{ restantesSemanal() }})
              </button>
              <button
                v-else-if="ultimaSolicitudEstado(animal) === 'Pendiente'"
                class="btn btn-outline-secondary w-100"
                disabled
              >
                <i class="bi bi-clock-history me-2"></i>Pendiente
              </button>
              <button
                v-else-if="ultimaSolicitudEstado(animal) === 'Aprobada'"
                class="btn btn-outline-success w-100"
                disabled
              >
                <i class="bi bi-check-circle me-2"></i>¡Adopción Aprobada!
              </button>
              <button
                v-else-if="bloqueadoPorRechazos(animal)"
                class="btn btn-outline-danger w-100"
                disabled
              >
                <i class="bi bi-x-circle me-2"></i>No puedes solicitar más. Máximo 2 intentos permitidos.
              </button>
              <button
                v-else-if="ultimaSolicitudEstado(animal) === 'Rechazada'"
                class="btn btn-outline-warning w-100"
                disabled
              >
                <i class="bi bi-x-octagon me-2"></i>Solicitud rechazada, puedes intentar de nuevo.
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <i class="bi bi-inbox"></i>
        <p>No se encontraron animales disponibles</p>
      </div>

      <!-- Paginación -->
      <Pagination
        v-if="totalPaginas > 1"
        :pagina-actual="paginaActual"
        :total-paginas="totalPaginas"
        :total-items="animalesFiltrados.length"
        @cambiar-pagina="cambiarPagina"
        class="mt-4"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useAuthStore } from "../../stores/auth";
import Loading from '../../components/common/Loading.vue';
import Pagination from '../../components/common/Pagination.vue';
import ImageCarousel from '../../components/common/ImageCarousel.vue';
import ClientHero from '../../components/common/ClientHero.vue';
import animalService from '../../services/animalService';
import adopcionService from "../../services/adopcionService";
// dashboard styles are imported globally via ClienteLayout
import {
  alertaExito,
  confirmar,
  toast,
  manejarErrorAPI,
} from "../../utils/alertas";
import {
  iconoPorEspecie,
  truncar,
  filtrarPorBusqueda,
  paginar,
  calcularTotalPaginas,
  obtenerFotoAnimal,
} from "../../utils/helpers";

export default {
  name: 'ClienteAnimales',
  components: { Loading, Pagination, ImageCarousel, ClientHero },
  setup() {
    const authStore = useAuthStore();
    const cargando = ref(true);
    const animales = ref([]);
    const adopcionesUsuario = ref([]);
    const busqueda = ref("");
    const filtroEspecie = ref("");
    const filtroSexo = ref("");
    const paginaActual = ref(1);
    const itemsPorPagina = 9;

    const animalesFiltrados = computed(() => {
      let resultado = animales.value;

      if (busqueda.value) {
        resultado = filtrarPorBusqueda(
          resultado,
          busqueda.value,
          ["nombre", "descripcion"]
        );
      }

      if (filtroEspecie.value) {
        resultado = resultado.filter((a) => a.especie === filtroEspecie.value);
      }

      if (filtroSexo.value) {
        resultado = resultado.filter((a) => a.sexo === filtroSexo.value);
      }

      return resultado;
    });

    const totalPaginas = computed(() =>
      calcularTotalPaginas(animalesFiltrados.value.length, itemsPorPagina)
    );
    const animalesPaginados = computed(() =>
      paginar(animalesFiltrados.value, paginaActual.value, itemsPorPagina)
    );

    const obtenerImagenesAnimal = (animal) => {
      if (animal.imagenes && animal.imagenes.length > 0) {
        return animal.imagenes.map(img => img.url).filter(url => url);
      }
      return [];
    };

    const cargarAnimales = async () => {
      try {
        cargando.value = true;
        const [animalesResp, adopcionesResp] = await Promise.all([
          animalService.getDisponibles(),
          adopcionService.getByUsuario(authStore.usuarioActual.idUsuario),
        ]);
        animales.value = animalesResp.data;
        adopcionesUsuario.value = adopcionesResp.data;
      } catch (error) {
        manejarErrorAPI(error);
      } finally {
        cargando.value = false;
      }
    };

    // Retorna todas solicitudes del usuario para un animal
    const solicitudesPorAnimal = (animal) =>
      adopcionesUsuario.value.filter(
        (r) => r.animal.idAnimal === animal.idAnimal
      );

    // Retorna el estado dela última solicitud por fecha
    const ultimaSolicitudEstado = (animal) => {
      const solicitudes = solicitudesPorAnimal(animal);
      if (!solicitudes.length) return null;
      const ultima = solicitudes.reduce((a, b) =>
        new Date(a.fechaSolicitud) > new Date(b.fechaSolicitud) ? a : b
      );
      return ultima.estado;
    };

    // Verifica si puede solicitar (menos de 2 rechazos, y no tiene solicitudes pendientes o aprobadas)
    const puedeSolicitar = (animal) => {
      const solicitudes = solicitudesPorAnimal(animal);
      const rechazos = solicitudes.filter(
        (s) => s.estado === "Rechazada"
      ).length;
      if (rechazos >= 2) return false;
      if (solicitudes.some((s) => s.estado === "Pendiente" || s.estado === "Aprobada")) return false;
      return true;
    };

    const bloqueadoPorRechazos = (animal) => {
      const solicitudes = solicitudesPorAnimal(animal);
      const rechazos = solicitudes.filter(
        (s) => s.estado === "Rechazada"
      ).length;
      return rechazos >= 2;
    };

    // Conteo de adopciones aprobadas en los últimos 7 días
    const aceptadasUltimos7Dias = () => {
      try {
        const ahora = new Date();
        const desde = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
        const aceptadas = (adopcionesUsuario.value || []).filter(a => {
          if (!a.estado) return false;
          if (a.estado !== 'Aprobada') return false;
          const fecha = a.fechaAdopcion || a.fecha || a.fechaCreacion || a.updatedAt || a.fechaAprobacion || null;
          if (!fecha) return false;
          const d = new Date(fecha);
          if (isNaN(d)) return false;
          return d >= desde && d <= ahora;
        });
        return aceptadas.length;
      } catch (e) {
        return 0;
      }
    };

    const excedeLimiteSemanal = () => {
      return aceptadasUltimos7Dias() >= 3;
    };

    const restantesSemanal = () => {
      const r = 3 - aceptadasUltimos7Dias();
      return r >= 0 ? r : 0;
    };

    // Conteo de solicitudes activas (pendientes) del usuario
    const solicitudesActivas = () => {
      try {
        return (adopcionesUsuario.value || []).filter(a => (a.estado || '') === 'Pendiente').length;
      } catch (e) {
        return 0;
      }
    };

    // Permite enviar nuevas solicitudes si tiene menos de 3 pendientes
    const puedeEnviarConcurrente = () => {
      return solicitudesActivas() < 3;
    };

    const solicitarAdopcion = async (animal) => {
      if (excedeLimiteSemanal()) {
        toast(`Has alcanzado el límite semanal de 3 adopciones aprobadas. Intenta más tarde.`, 'error');
        return;
      }
      if (!puedeSolicitar(animal)) {
        toast(
          "No puedes adoptar este animal más de 2 veces. Si necesitas ayuda contáctanos.",
          "error"
        );
        return;
      }
      const result = await confirmar(
        `¿Deseas solicitar la adopción de ${animal.nombre}?`,
        "Solicitar Adopción"
      );
      if (result.isConfirmed) {
        try {
          const adopcion = {
            usuario: { idUsuario: authStore.usuarioActual.idUsuario },
            animal: { idAnimal: animal.idAnimal },
            estado: "Pendiente",
            comentarios: "Solicitud de adopción",
          };
          await adopcionService.create(adopcion);
          await alertaExito("Tu solicitud ha sido enviada exitosamente", "¡Solicitud enviada!");
          const resp = await adopcionService.getByUsuario(authStore.usuarioActual.idUsuario);
          adopcionesUsuario.value = resp.data;
          window.dispatchEvent(new CustomEvent("adopcionChanged"));
        } catch (error) {
          manejarErrorAPI(error);
        }
      }
    };

    const filtrarAnimales = () => {
      paginaActual.value = 1;
    };

    const limpiarFiltros = () => {
      busqueda.value = "";
      filtroEspecie.value = "";
      filtroSexo.value = "";
      paginaActual.value = 1;
    };

    const cambiarPagina = (pagina) => {
      paginaActual.value = pagina;
    };

    onMounted(() => cargarAnimales());

    const onAdopcionChanged = () => cargarAnimales();
    window.addEventListener("adopcionChanged", onAdopcionChanged);
    onBeforeUnmount(() => {
      window.removeEventListener("adopcionChanged", onAdopcionChanged);
    });

    return {
      cargando,
      animalesFiltrados,
      animalesPaginados,
      totalPaginas,
      busqueda,
      filtroEspecie,
      filtroSexo,
      paginaActual,
      solicitarAdopcion,
      filtrarAnimales,
      limpiarFiltros,
      cambiarPagina,
      obtenerImagenesAnimal,
      iconoPorEspecie,
      truncar,
      obtenerFotoAnimal,
      ultimaSolicitudEstado,
      puedeSolicitar,
      bloqueadoPorRechazos,
      excedeLimiteSemanal,
      aceptadasUltimos7Dias,
      restantesSemanal,
      solicitudesActivas,
      puedeEnviarConcurrente,
    };
  },
};
</script>
