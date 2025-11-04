<template>
  <div class="fade-in">
    <h2 class="mb-4"><i class="bi bi-heart me-2"></i>Animales en Adopción</h2>
    
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
            >
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
            <!-- Foto del animal o gradiente por defecto -->
            <div 
              v-if="obtenerFotoAnimal(animal)" 
              style="height: 250px; position: relative; overflow: hidden;"
            >
              <img 
                :src="obtenerFotoAnimal(animal)" 
                :alt="animal.nombre"
                style="width: 100%; height: 100%; object-fit: cover;"
                @error="e => e.target.style.display = 'none'"
              >
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
              <h5 class="card-title">{{ animal.nombre }}</h5>
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
                class="btn btn-primary w-100"
                @click="solicitarAdopcion(animal)"
              >
                <i class="bi bi-heart me-2"></i>
                Solicitar Adopción
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
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import Loading from '../../components/common/Loading.vue';
import Pagination from '../../components/common/Pagination.vue';
import animalService from '../../services/animalService';
import adopcionService from '../../services/adopcionService';
import { alertaExito, confirmar, manejarErrorAPI } from '../../utils/alertas';
import { iconoPorEspecie, truncar, filtrarPorBusqueda, paginar, calcularTotalPaginas, obtenerFotoAnimal } from '../../utils/helpers';

export default {
  name: 'ClienteAnimales',
  components: { Loading, Pagination },
  setup() {
    const authStore = useAuthStore();
    const cargando = ref(true);
    const animales = ref([]);
    const busqueda = ref('');
    const filtroEspecie = ref('');
    const filtroSexo = ref('');
    const paginaActual = ref(1);
    const itemsPorPagina = 9;
    
    const animalesFiltrados = computed(() => {
      let resultado = animales.value;
      
      if (busqueda.value) {
        resultado = filtrarPorBusqueda(resultado, busqueda.value, ['nombre', 'descripcion']);
      }
      
      if (filtroEspecie.value) {
        resultado = resultado.filter(a => a.especie === filtroEspecie.value);
      }
      
      if (filtroSexo.value) {
        resultado = resultado.filter(a => a.sexo === filtroSexo.value);
      }
      
      return resultado;
    });
    
    const totalPaginas = computed(() => 
      calcularTotalPaginas(animalesFiltrados.value.length, itemsPorPagina)
    );
    
    const animalesPaginados = computed(() => 
      paginar(animalesFiltrados.value, paginaActual.value, itemsPorPagina)
    );
    
    const cargarAnimales = async () => {
      try {
        const response = await animalService.getDisponibles();
        animales.value = response.data;
      } catch (error) {
        manejarErrorAPI(error);
      } finally {
        cargando.value = false;
      }
    };
    
    const solicitarAdopcion = async (animal) => {
      const result = await confirmar(
        `¿Deseas solicitar la adopción de ${animal.nombre}?`,
        'Solicitar Adopción'
      );
      
      if (result.isConfirmed) {
        try {
          const adopcion = {
            usuario: { idUsuario: authStore.usuarioActual.idUsuario },
            animal: { idAnimal: animal.idAnimal },
            estado: 'Pendiente',
            comentarios: 'Solicitud de adopción'
          };
          
          await adopcionService.create(adopcion);
          await alertaExito('Tu solicitud ha sido enviada exitosamente', '¡Solicitud enviada!');
        } catch (error) {
          manejarErrorAPI(error);
        }
      }
    };
    
    const filtrarAnimales = () => { paginaActual.value = 1; };
    const limpiarFiltros = () => {
      busqueda.value = '';
      filtroEspecie.value = '';
      filtroSexo.value = '';
      paginaActual.value = 1;
    };
    const cambiarPagina = (pagina) => { paginaActual.value = pagina; };
    
    onMounted(() => cargarAnimales());
    
    return {
      cargando, animalesFiltrados, animalesPaginados, totalPaginas,
      busqueda, filtroEspecie, filtroSexo, paginaActual,
      solicitarAdopcion, filtrarAnimales, limpiarFiltros, cambiarPagina,
      iconoPorEspecie, truncar, obtenerFotoAnimal
    };
  }
}
</script>
