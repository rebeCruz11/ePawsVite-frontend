<template>
  <div>
    <Navbar />
    
    <!-- Hero Section Mejorado -->
    <section class="hero-section position-relative overflow-hidden">
      <div class="hero-background"></div>
      <div class="container position-relative">
        <div class="row align-items-center min-vh-75">
          <div class="col-lg-6 py-5">
            <span class="badge bg-white text-primary mb-3 px-3 py-2 shadow-sm">
              <i class="bi bi-heart-fill me-1"></i>
              Salvando Vidas
            </span>
            <h1 class="display-3 fw-bold text-white mb-4">
              Encuentra tu mejor amigo en 
              <span class="text-gradient">ePaws</span>
            </h1>
            <p class="lead text-white-80 mb-4 fs-5">
              Conectamos corazones con patitas. Miles de animales esperan 
              por un hogar lleno de amor como el tuyo.
            </p>
            <div class="d-flex flex-wrap gap-3">
              <a href="#animales-disponibles" class="btn btn-light btn-lg shadow-lg rounded-pill px-4">
                <i class="bi bi-search me-2"></i>
                Explorar Mascotas
              </a>
              <router-link to="/registro" class="btn btn-outline-light btn-lg rounded-pill px-4">
                <i class="bi bi-person-plus me-2"></i>
                Únete Ahora
              </router-link>
            </div>
            
            <!-- Stats badges -->
            <div class="d-flex gap-4 mt-5 flex-wrap">
              <div class="text-white">
                <div class="fs-2 fw-bold">500+</div>
                <small class="text-white-80">Adopciones exitosas</small>
              </div>
              <div class="text-white">
                <div class="fs-2 fw-bold">{{ animales.length }}+</div>
                <small class="text-white-80">Mascotas disponibles</small>
              </div>
            </div>
          </div>
          
          <div class="col-lg-6 d-none d-lg-block text-center">
            <div class="hero-image-container">
              <i class="bi bi-hearts display-1 hero-icon animate-float"></i>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Animales Disponibles -->
    <section id="animales-disponibles" class="py-5 bg-light">
      <div class="container">
        <div class="text-center mb-5">
          <span class="badge bg-primary-soft text-primary mb-3 px-3 py-2">ADOPCIÓN</span>
          <h2 class="display-5 fw-bold mb-3">
            Animales Disponibles para Adopción
          </h2>
          <p class="lead text-muted">Encuentra a tu compañero perfecto</p>
        </div>
        
        <!-- Filtros Mejorados -->
        <div class="filters-container mb-5">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <div class="row g-3 align-items-end">
                <div class="col-lg-4">
                  <label class="form-label small text-muted fw-semibold mb-2">
                    <i class="bi bi-search me-1"></i> Buscar mascota
                  </label>
                  <input 
                    type="text" 
                    class="form-control form-control-lg" 
                    v-model="busqueda"
                    placeholder="Buscar por nombre..."
                    @input="filtrarAnimales"
                  >
                </div>
                <div class="col-lg-3">
                  <label class="form-label small text-muted fw-semibold mb-2">
                    <i class="bi bi-filter me-1"></i> Especie
                  </label>
                  <select class="form-select form-select-lg" v-model="filtroEspecie" @change="filtrarAnimales">
                    <option value="">Todas las especies</option>
                    <option value="Perro">🐕 Perros</option>
                    <option value="Gato">🐈 Gatos</option>
                    <option value="Otro">🐾 Otros</option>
                  </select>
                </div>
                <div class="col-lg-3">
                  <label class="form-label small text-muted fw-semibold mb-2">
                    <i class="bi bi-gender-ambiguous me-1"></i> Sexo
                  </label>
                  <select class="form-select form-select-lg" v-model="filtroSexo" @change="filtrarAnimales">
                    <option value="">Todos</option>
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </div>
                <div class="col-lg-2">
                  <button class="btn btn-outline-secondary btn-lg w-100" @click="limpiarFiltros">
                    <i class="bi bi-arrow-clockwise"></i> Reset
                  </button>
                </div>
              </div>
              
              <!-- Results count -->
              <div class="mt-3 pt-3 border-top">
                <small class="text-muted">
                  <i class="bi bi-check-circle-fill text-success me-1"></i>
                  Encontramos <strong>{{ animalesFiltrados.length }}</strong> mascotas disponibles
                </small>
              </div>
            </div>
          </div>
        </div>
        
        <Loading v-if="cargando" />
        
        <div v-else>
          <div class="row g-4" v-if="animalesFiltrados.length > 0">
            <div class="col-md-6 col-lg-4" v-for="animal in animalesPaginados" :key="animal.idAnimal">
              <div class="animal-card-modern">
                <!-- Badge de estado flotante -->
                <div class="animal-badge">
                  <span class="badge rounded-pill">
                    <i class="bi bi-heart-pulse me-1"></i>{{ animal.estado }}
                  </span>
                </div>
                
                <!-- Imagen con overlay gradient -->
                <div class="animal-image-wrapper">
                  <ImageCarousel 
                    :imagenes="obtenerImagenesAnimal(animal)"
                    :alt="animal.nombre"
                    :icono="iconoPorEspecie(animal.especie)"
                    :id="`carousel-home-${animal.idAnimal}`"
                  />
                  
                </div>
                
                <div class="card-body p-4">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 class="card-title mb-1 fw-bold">{{ animal.nombre }}</h5>
                      <div class="animal-meta">
                        <span class="meta-item">
                          <i class="bi bi-tag-fill"></i> {{ animal.especie }}
                        </span>
                        <span class="meta-item">
                          <i class="bi bi-calendar3"></i> {{ animal.edad }} {{ animal.unidadEdad }}
                        </span>
                      </div>
                    </div>
                    <div class="animal-gender">
                      <i :class="animal.sexo === 'Macho' ? 'bi bi-gender-male text-primary' : 'bi bi-gender-female text-danger'" style="font-size: 1.5rem;"></i>
                    </div>
                  </div>
                  
                  <p class="card-text text-muted mb-3">{{ truncar(animal.descripcion, 80) }}</p>
                  
                  <div class="d-flex align-items-center mb-3 text-muted small">
                    <i class="bi bi-geo-alt-fill me-1"></i>
                    <span>{{ animal.organizacion?.nombreOrganizacion || 'Sin organización' }}</span>
                  </div>
                  
                  <button 
                    class="btn btn-primary w-100 btn-adopt"
                    @click="solicitarAdopcion(animal)"
                  >
                    <i class="bi bi-heart-fill me-2"></i>
                    Quiero Adoptarlo
                    <i class="bi bi-arrow-right ms-2"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-5">
            <i class="bi bi-inbox" style="font-size: 4rem; color: #6c757d;"></i>
            <p class="mt-3 text-muted fs-5">No se encontraron animales disponibles</p>
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
    
    <!-- Features Mejorado -->
    <section class="features-section py-5 bg-white">
      <div class="container">
        <div class="text-center mb-5">
          <span class="badge bg-primary-soft text-primary mb-3 px-3 py-2">PROCESO SIMPLE</span>
          <h2 class="display-5 fw-bold mb-3">¿Cómo funciona ePaws?</h2>
          <p class="lead text-muted">4 pasos sencillos para cambiar una vida</p>
        </div>
        
        <div class="row g-4">
          <div class="col-md-6 col-lg-3">
            <div class="feature-card text-center h-100">
              <div class="feature-icon-wrapper mb-4">
                <div class="feature-number">1</div>
                <i class="bi bi-search text-primary feature-icon"></i>
              </div>
              <h5 class="fw-bold mb-3">Busca</h5>
              <p class="text-muted mb-0">Encuentra al compañero perfecto entre nuestros animales disponibles</p>
            </div>
          </div>
          
          <div class="col-md-6 col-lg-3">
            <div class="feature-card text-center h-100">
              <div class="feature-icon-wrapper mb-4">
                <div class="feature-number">2</div>
                <i class="bi bi-clipboard-check text-success feature-icon"></i>
              </div>
              <h5 class="fw-bold mb-3">Solicita</h5>
              <p class="text-muted mb-0">Completa tu solicitud de adopción de manera fácil y rápida</p>
            </div>
          </div>
          
          <div class="col-md-6 col-lg-3">
            <div class="feature-card text-center h-100">
              <div class="feature-icon-wrapper mb-4">
                <div class="feature-number">3</div>
                <i class="bi bi-flag text-warning feature-icon"></i>
              </div>
              <h5 class="fw-bold mb-3">Reporta</h5>
              <p class="text-muted mb-0">Ayuda a animales en situación de calle reportándolos</p>
            </div>
          </div>
          
          <div class="col-md-6 col-lg-3">
            <div class="feature-card text-center h-100">
              <div class="feature-icon-wrapper mb-4">
                <div class="feature-number">4</div>
                <i class="bi bi-heart text-danger feature-icon"></i>
              </div>
              <h5 class="fw-bold mb-3">Adopta</h5>
              <p class="text-muted mb-0">Dale un hogar lleno de amor a tu nuevo mejor amigo</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- CTA Mejorado -->
    <section class="cta-section py-5">
      <div class="container">
        <div class="card cta-card border-0 shadow-lg text-center">
          <div class="card-body py-5 px-4">
            <div class="cta-icon mb-4">
              <i class="bi bi-heart-fill"></i>
            </div>
            <h2 class="display-5 fw-bold text-white mb-3">¿Listo para cambiar una vida?</h2>
            <p class="lead text-white-80 mb-4">
              Únete a nuestra comunidad y ayuda a encontrar hogares para animales que lo necesitan
            </p>
            <router-link to="/registro" class="btn btn-light btn-lg rounded-pill px-5 shadow">
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
      animales,
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
/* ============================================
   HERO SECTION
   ============================================ */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 90vh;
  padding-top: 80px;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.4;
}

.min-vh-75 {
  min-height: 75vh;
}

.text-gradient {
  background: linear-gradient(to right, #fff, #ffd89b);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-white-80 {
  color: rgba(255, 255, 255, 0.9);
}

.hero-icon {
  font-size: 10rem;
  color: rgba(255, 255, 255, 0.9);
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* ============================================
   CARDS DE ANIMALES
   ============================================ */
.animal-card-modern {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  height: 100%;
}

.animal-card-modern:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.animal-image-wrapper {
  position: relative;
  height: 280px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.animal-image-wrapper :deep(img) {
  transition: transform 0.6s ease;
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.animal-card-modern:hover .animal-image-wrapper :deep(img) {
  transform: scale(1.1);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.animal-card-modern:hover .image-overlay {
  opacity: 1;
}

.quick-view-btn {
  transform: translateY(20px);
  transition: transform 0.3s ease;
}

.animal-card-modern:hover .quick-view-btn {
  transform: translateY(0);
}

.animal-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 10;
}

.animal-badge .badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0.5rem 1rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.animal-meta {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 0.875rem;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-adopt {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  color: white;
}

.btn-adopt::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s ease;
}

.btn-adopt:hover::before {
  left: 100%;
}

.btn-adopt:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
  color: white;
}

/* ============================================
   FILTERS
   ============================================ */
.filters-container .card {
  border-radius: 16px;
}

.form-control-lg, .form-select-lg {
  border-radius: 10px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.form-control-lg:focus, .form-select-lg:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

/* ============================================
   FEATURES SECTION
   ============================================ */
.bg-primary-soft {
  background-color: rgba(102, 126, 234, 0.1);
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-weight: 600;
}

.feature-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  height: 100%;
}

.feature-card:hover {
  border-color: #667eea;
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
}

.feature-icon-wrapper {
  position: relative;
  display: inline-block;
}

.feature-number {
  position: absolute;
  top: -10px;
  right: -10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.feature-icon {
  font-size: 3rem;
}

/* ============================================
   CTA SECTION
   ============================================ */
.cta-section {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.cta-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  overflow: hidden;
  position: relative;
}

.cta-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.3;
}

.cta-icon {
  font-size: 4rem;
  color: rgba(255, 255, 255, 0.9);
}

.cta-icon i {
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  10%, 30% { transform: scale(0.9); }
  20%, 40% { transform: scale(1.1); }
}

/* ============================================
   UTILITIES
   ============================================ */
.shadow-lg {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-section {
    min-height: auto;
    padding-top: 60px;
  }
  
  .display-3 {
    font-size: 2.5rem;
  }
  
  .display-5 {
    font-size: 2rem;
  }
  
  .animal-image-wrapper {
    height: 220px;
  }
}
</style>
