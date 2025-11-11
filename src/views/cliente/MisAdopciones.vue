<template>
  <div class="fade-in">
  <ClientHero title="Mis Solicitudes de Adopción" subtitle="Aquí gestionas tus solicitudes y ves el estado de cada una">
    <template #actions>
      <button class="btn btn-action primary" @click="$router.push('/cliente/animales')">
        <i class="bi bi-heart me-1"></i>
        Ver Animales
      </button>
    </template>
  </ClientHero>
  <p class="mis-adopciones-subtitle">Usa los filtros para encontrar rápidamente a tu nuevo compañero.</p>
    
    <Loading v-if="cargando" />
    
    <div v-else>
      <div class="mb-3 mis-adopciones-toolbar d-flex align-items-center gap-2 flex-wrap">
        <div class="input-group" style="min-width:260px;">
          <input ref="searchInput" class="form-control form-control-sm" placeholder="Busca nombre, organización o nota..." v-model="busqueda" />
          <button ref="pawBtn" type="button" class="paw-search-btn" @click="doSearch" aria-label="Buscar" title="Pulsar para buscar">
            <i class="bi bi-paw"></i>
          </button>
        </div>

        <select class="form-select form-select-sm" v-model="filtroEstado" style="max-width:180px;">
          <option value="">Todos los estados</option>
          <option v-for="e in estadosUnicos" :key="e" :value="e">{{ formatearEstado(e) }}</option>
        </select>

        <select class="form-select form-select-sm" v-model="filtroEspecie" style="max-width:160px;">
          <option value="">Todas las especies</option>
          <option v-for="s in especiesUnicas" :key="s" :value="s">{{ s }}</option>
        </select>

        <select class="form-select form-select-sm" v-model="filtroOrganizacion" style="max-width:220px;">
          <option value="">Todas las organizaciones</option>
          <option v-for="o in organizacionesUnicas" :key="o" :value="o">{{ o }}</option>
        </select>

        <div class="d-flex gap-1" style="min-width:220px;">
          <input type="date" class="form-control form-control-sm" v-model="fechaDesde" title="Fecha desde" />
          <input type="date" class="form-control form-control-sm" v-model="fechaHasta" title="Fecha hasta" />
        </div>

        <div class="ms-auto text-end">
          <div class="mis-adopciones-count">Mostrando <strong>{{ totalMostradas }}</strong> de {{ adopciones.length }} solicitudes</div>
          <button class="btn btn-sm btn-link p-0" @click="limpiarFiltros">Limpiar filtros</button>
          <small class="d-block text-muted" style="font-size:0.78rem">Pista: pulsa la huellita para enfocar la búsqueda</small>
        </div>
      </div>

      <div class="row g-4" v-if="adopciones.length > 0">
        <div class="col-md-6" v-for="adopcion in adopcionesFiltradas" :key="adopcion.idAdopcion">
          <div class="card mis-adopicion-card">
            <div class="row g-0">
              <!-- Foto del animal con carrusel -->
              <div class="col-md-5">
                <div style="height: 100%; min-height: 250px; overflow: hidden;">
                  <ImageCarousel 
                    :imagenes="obtenerImagenesAnimal(adopcion.animal)"
                    :alt="adopcion.animal.nombre"
                    :icono="iconoPorEspecie(adopcion.animal.especie)"
                    :id="`carousel-adopcion-${adopcion.idAdopcion}`"
                  />
                </div>
              </div>
              
              <!-- Información del animal -->
              <div class="col-md-7">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <h5 class="card-title">
                      <i :class="`bi ${iconoPorEspecie(adopcion.animal.especie)} me-2`"></i>
                      {{ adopcion.animal.nombre }}
                    </h5>
                    <span class="badge" :class="`bg-${colorPorEstado(adopcion.estado)}`">
                      {{ formatearEstado(adopcion.estado) }}
                    </span>
                  </div>
                  
                  <p class="text-muted mb-2">
                    <i class="bi bi-calendar me-1"></i>
                    Solicitud: {{ formatearFecha(adopcion.fechaSolicitud) }}
                  </p>
                  
                  <p class="mb-2">
                    <strong>Animal:</strong> {{ adopcion.animal.especie }} • {{ adopcion.animal.sexo }} • 
                    {{ adopcion.animal.edad }} {{ adopcion.animal.unidadEdad }}
                  </p>
                  
                  <p class="mb-2">
                    <strong>Organización:</strong> {{ adopcion.animal.organizacion?.nombreOrganizacion || 'N/A' }}
                  </p>
                  
                  <p v-if="adopcion.comentarios" class="mb-2">
                    <strong>Comentarios:</strong> {{ adopcion.comentarios }}
                  </p>
                  
                  <div v-if="adopcion.estado === 'Pendiente'" class="mt-3">
                    <button class="btn btn-sm btn-danger" @click="cancelarAdopcion(adopcion)">
                      <i class="bi bi-x-circle me-1"></i>
                      Anular solicitud
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <i class="bi bi-inbox"></i>
        <h4 class="mb-2">Aún no tienes solicitudes</h4>
        <p class="mb-3">¡Es el momento perfecto para encontrar un nuevo amiguito! Explora animales disponibles y solicita la adopción cuando estés listo.</p>
        <router-link to="/cliente/animales" class="btn btn-primary mt-3">
          <i class="bi bi-heart me-2"></i>
          Buscar amigos peludos
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../../stores/auth';
import Loading from '../../components/common/Loading.vue';
import ImageCarousel from '../../components/common/ImageCarousel.vue';
import ClientHero from '../../components/common/ClientHero.vue';
import adopcionService from '../../services/adopcionService';
import { confirmar, toast, manejarErrorAPI } from '../../utils/alertas';
import { iconoPorEspecie, colorPorEstado, formatearEstado, formatearFecha, obtenerFotoAnimal } from '../../utils/helpers';
import '../../assets/pages/mis-adopciones.css';
// dashboard styles are imported globally via ClienteLayout

export default {
  name: 'ClienteMisAdopciones',
  components: { Loading, ImageCarousel, ClientHero },
  setup() {
    const authStore = useAuthStore();
  const cargando = ref(true);
  const adopciones = ref([]);
  // filtros
  const busqueda = ref('');
  const filtroEstado = ref('');
  const filtroEspecie = ref('');
  const filtroOrganizacion = ref('');
  const fechaDesde = ref('');
  const fechaHasta = ref('');
    
    const searchInput = ref(null);
    const pawBtn = ref(null);

    const doSearch = () => {
      try {
        // small pulse animation
        if (pawBtn.value) {
          pawBtn.value.classList.add('pulse');
          setTimeout(() => pawBtn.value && pawBtn.value.classList.remove('pulse'), 750);
        }
        // focus input
        searchInput.value && searchInput.value.focus();
      } catch (e) {}
    };

    const cargarAdopciones = async () => {
      try {
        const response = await adopcionService.getByUsuario(authStore.usuarioActual.idUsuario);
        adopciones.value = response.data;
      } catch (error) {
        manejarErrorAPI(error);
      } finally {
        cargando.value = false;
      }
    };

    const estadosUnicos = computed(() => {
      const s = new Set((adopciones.value || []).map(a => a.estado).filter(Boolean));
      return Array.from(s);
    });

    const especiesUnicas = computed(() => {
      const s = new Set((adopciones.value || []).map(a => a.animal?.especie).filter(Boolean));
      return Array.from(s).sort();
    });

    const organizacionesUnicas = computed(() => {
      const s = new Set((adopciones.value || []).map(a => a.animal?.organizacion?.nombreOrganizacion).filter(Boolean));
      return Array.from(s).sort();
    });

    const adopcionesFiltradas = computed(() => {
      const q = (busqueda.value || '').toString().toLowerCase().trim();
      const desde = fechaDesde.value ? new Date(fechaDesde.value) : null;
      const hasta = fechaHasta.value ? new Date(fechaHasta.value) : null;

      return (adopciones.value || []).filter(a => {
        // estado
        if (filtroEstado.value && a.estado !== filtroEstado.value) return false;
        // especie
        if (filtroEspecie.value && a.animal?.especie !== filtroEspecie.value) return false;
        // organizacion
        const orgName = a.animal?.organizacion?.nombreOrganizacion || '';
        if (filtroOrganizacion.value && orgName !== filtroOrganizacion.value) return false;
        // rango de fechas
        if ((desde || hasta) && a.fechaSolicitud) {
          const fecha = new Date(a.fechaSolicitud);
          if (desde && fecha < new Date(desde.setHours(0,0,0,0))) return false;
          if (hasta && fecha > new Date(hasta.setHours(23,59,59,999))) return false;
        }
        // texto
        if (q) {
          const nombre = (a.animal?.nombre || '').toString().toLowerCase();
          const org = (orgName || '').toString().toLowerCase();
          if (!nombre.includes(q) && !org.includes(q) && !(a.comentarios || '').toString().toLowerCase().includes(q)) return false;
        }
        return true;
      });
    });

    const limpiarFiltros = () => { 
      busqueda.value=''; 
      filtroEstado.value=''; 
      filtroEspecie.value='';
      filtroOrganizacion.value='';
      fechaDesde.value='';
      fechaHasta.value='';
    };

    const obtenerImagenesAnimal = (animal) => {
      if (animal.imagenes && animal.imagenes.length > 0) {
        return animal.imagenes.map(img => img.url).filter(url => url);
      }
      return [];
    };
    
    const cancelarAdopcion = async (adopcion) => {
      const result = await confirmar('¿Seguro que deseas anular esta solicitud?');
      if (result.isConfirmed) {
        try {
          await adopcionService.update(adopcion.idAdopcion, { ...adopcion, estado: 'Cancelada' });
          toast('Solicitud anulada', 'success');
          await cargarAdopciones();
          // Notificar a otras vistas (por ejemplo: listado de animales) que las adopciones cambiaron
          window.dispatchEvent(new CustomEvent('adopcionChanged'));
        } catch (error) {
          manejarErrorAPI(error);
        }
      }
    };

    // Utilidades para la UI
    const totalMostradas = computed(() => (adopcionesFiltradas.value || []).length);
    
    onMounted(() => cargarAdopciones());
    
    return {
      cargando, adopciones, cancelarAdopcion, obtenerImagenesAnimal,
      iconoPorEspecie, colorPorEstado, formatearEstado, formatearFecha, obtenerFotoAnimal,
      // filtros
      busqueda, filtroEstado, estadosUnicos, adopcionesFiltradas, limpiarFiltros, totalMostradas,
      // nuevos filtros
      filtroEspecie, filtroOrganizacion, especiesUnicas, organizacionesUnicas, fechaDesde, fechaHasta,
      searchInput, pawBtn, doSearch
    };
  }
}
</script>
