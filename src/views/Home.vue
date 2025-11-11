<template>
  <div>
    <Navbar />
    
    <!-- Hero Section -->
    <section class="bg-primary text-white py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h1 class="display-4 fw-bold mb-3">
              <i class="bi bi-heart-fill"></i>
              Bienvenido a ePaws
            </h1>
            <p class="lead mb-4">
              El sistema que conecta corazones con patitas. Adopta, reporta y cuida de nuestros amigos peludos.
            </p>
            <div class="d-flex gap-3">
              <a href="#animales-disponibles" class="btn btn-light btn-lg">
                <i class="bi bi-heart me-2"></i>
                Ver Animales
              </a>
              <router-link to="/registro" class="btn btn-outline-light btn-lg">
                <i class="bi bi-person-plus me-2"></i>
                Regístrate
              </router-link>
            </div>
          </div>
          <div class="col-md-6 text-center">
            <i class="bi bi-hearts display-1"></i>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Animales Disponibles -->
    <section id="animales-disponibles" class="py-5 bg-light">
      <div class="container">
        <h2 class="text-center mb-4">
          <i class="bi bi-heart me-2"></i>
          Animales Disponibles para Adopción
        </h2>
        
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
        
        <div v-else>
          <div class="row g-4" v-if="animalesFiltrados.length > 0">
            <div class="col-md-4" v-for="animal in animalesPaginados" :key="animal.idAnimal">
              <div class="card animal-card h-100">
                <!-- Carrusel de imágenes -->
                <div style="height: 250px; overflow: hidden;">
                  <ImageCarousel 
                    :imagenes="obtenerImagenesAnimal(animal)"
                    :alt="animal.nombre"
                    :icono="iconoPorEspecie(animal.especie)"
                    :id="`carousel-home-${animal.idAnimal}`"
                  />
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
                  <p class="text-muted small mb-0">
                    <i class="bi bi-building me-1"></i>
                    {{ animal.organizacion?.nombreOrganizacion || 'Sin organización' }}
                  </p>
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
          
          <div v-else class="text-center py-5">
            <i class="bi bi-inbox" style="font-size: 4rem; color: #6c757d;"></i>
            <p class="mt-3 text-muted">No se encontraron animales disponibles</p>
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
    </section>
    
    <!-- Features -->
    <section class="py-5">
      <div class="container">
        <h2 class="text-center mb-5">¿Cómo funciona?</h2>
        
        <div class="row g-4">
          <div class="col-md-3">
            <div class="card h-100 text-center border-0 shadow-sm">
              <div class="card-body">
                <i class="bi bi-search text-primary" style="font-size: 3rem;"></i>
                <h5 class="mt-3">Busca</h5>
                <p class="text-muted">Encuentra al compañero perfecto entre nuestros animales disponibles</p>
              </div>
            </div>
          </div>
          
          <div class="col-md-3">
            <div class="card h-100 text-center border-0 shadow-sm">
              <div class="card-body">
                <i class="bi bi-clipboard-check text-success" style="font-size: 3rem;"></i>
                <h5 class="mt-3">Solicita</h5>
                <p class="text-muted">Completa tu solicitud de adopción de manera fácil y rápida</p>
              </div>
            </div>
          </div>
          
          <div class="col-md-3">
            <div class="card h-100 text-center border-0 shadow-sm">
              <div class="card-body">
                <i class="bi bi-flag text-warning" style="font-size: 3rem;"></i>
                <h5 class="mt-3">Reporta</h5>
                <p class="text-muted">Ayuda a animales en situación de calle reportándolos</p>
              </div>
            </div>
          </div>
          
          <div class="col-md-3">
            <div class="card h-100 text-center border-0 shadow-sm">
              <div class="card-body">
                <i class="bi bi-heart text-danger" style="font-size: 3rem;"></i>
                <h5 class="mt-3">Adopta</h5>
                <p class="text-muted">Dale un hogar lleno de amor a tu nuevo mejor amigo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- CTA -->
    <section class="py-5">
      <div class="container">
        <div class="card bg-primary text-white text-center shadow">
          <div class="card-body py-5">
            <h2 class="mb-3">¿Listo para cambiar una vida?</h2>
            <p class="lead mb-4">Únete a nuestra comunidad y ayuda a encontrar hogares para animales que lo necesitan</p>
            <router-link to="/registro" class="btn btn-light btn-lg">
              <i class="bi bi-person-plus me-2"></i>
              Comienza Ahora
            </router-link>
          </div>
        </div>
      </div>
    </section>
    
    <Footer />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Navbar from '../components/common/Navbar.vue';
import Footer from '../components/common/Footer.vue';
import Loading from '../components/common/Loading.vue';
import Pagination from '../components/common/Pagination.vue';
import ImageCarousel from '../components/common/ImageCarousel.vue';
import animalService from '../services/animalService';
import { confirmar, manejarErrorAPI } from '../utils/alertas';
import { iconoPorEspecie, truncar, filtrarPorBusqueda, paginar, calcularTotalPaginas } from '../utils/helpers';

export default {
  name: 'Home',
  components: {
    Navbar,
    Footer,
    Loading,
    Pagination,
    ImageCarousel
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const cargando = ref(true);
    const animales = ref([]);
    const busqueda = ref('');
    const filtroEspecie = ref('');
    const filtroSexo = ref('');
    const paginaActual = ref(1);
    const itemsPorPagina = 6;

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

    const obtenerImagenesAnimal = (animal) => {
      if (animal.imagenes && animal.imagenes.length > 0) {
        return animal.imagenes.map(img => img.url).filter(url => url);
      }
      return [];
    };

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
      if (!authStore.estaAutenticado) {
        const result = await confirmar(
          'Debes iniciar sesión para solicitar una adopción. ¿Deseas ir a iniciar sesión?',
          'Iniciar Sesión',
          'Sí, iniciar sesión',
          'Cancelar'
        );
        
        if (result.isConfirmed) {
          router.push('/login');
        }
        return;
      }

      // Si está autenticado, redirigir a la página de animales del cliente
      router.push('/cliente/animales');
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
      truncar
    };
  }
}
</script>

<style scoped>
.animal-card {
  transition: transform 0.2s, box-shadow 0.2s;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.animal-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
</style>
