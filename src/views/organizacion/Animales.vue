<template>
  <div class="animals-page fade-in">
    <Loading v-if="cargando" />

    <div v-else>
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-title">
            <div class="title-icon">
              <i class="bi bi-heart-fill"></i>
            </div>
            <div>
              <h2>Mis Animales</h2>
              <p class="text-muted mb-0">Gestiona los animales de tu organización</p>
            </div>
          </div>
          <button class="btn-add-animal" @click="abrirModal()">
            <i class="bi bi-plus-circle"></i>
            <span>Agregar Animal</span>
          </button>
        </div>
      </div>

      <!-- Animals Grid -->
      <div v-if="animales.length > 0">
        <!-- Stats -->
        <div class="animals-stats mb-4">
          <div class="stat-badge">
            <i class="bi bi-heart-fill"></i>
            <span>{{ animales.length }} Animales registrados</span>
          </div>
          <div class="stat-badge success">
            <i class="bi bi-check-circle-fill"></i>
            <span>{{ animales.filter(a => a.estado === 'Disponible').length }} Disponibles</span>
          </div>
          <div class="stat-badge warning">
            <i class="bi bi-award-fill"></i>
            <span>{{ animales.filter(a => a.estado === 'Adoptado').length }} Adoptados</span>
          </div>
        </div>

        <!-- Filters & Search -->
        <div class="filters-section">
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input 
              type="text" 
              v-model="filtroBusqueda" 
              placeholder="Buscar por nombre..."
              class="search-input"
            />
          </div>

          <div class="filter-group">
            <div class="filter-item">
              <i class="bi bi-tag"></i>
              <select v-model="filtroEspecie" class="filter-select">
                <option value="">Todas las especies</option>
                <option value="Perro">🐕 Perro</option>
                <option value="Gato">🐈 Gato</option>
                <option value="Otro">🐾 Otro</option>
              </select>
            </div>

            <div class="filter-item">
              <i class="bi bi-flag"></i>
              <select v-model="filtroEstado" class="filter-select">
                <option value="">Todos los estados</option>
                <option value="Disponible">Disponible</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Adoptado">Adoptado</option>
                <option value="No_disponible">No disponible</option>
              </select>
            </div>

            <div class="filter-item">
              <i class="bi bi-gender-ambiguous"></i>
              <select v-model="filtroSexo" class="filter-select">
                <option value="">Todos los sexos</option>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
                <option value="No especificado">No especificado</option>
              </select>
            </div>

            <div class="filter-item">
              <i class="bi bi-sort-down"></i>
              <select v-model="ordenamiento" class="filter-select">
                <option value="reciente">Más recientes</option>
                <option value="antiguo">Más antiguos</option>
                <option value="nombre-asc">Nombre (A-Z)</option>
                <option value="nombre-desc">Nombre (Z-A)</option>
              </select>
            </div>
          </div>

          <button class="btn-clear-filters" @click="limpiarFiltros" v-if="hayFiltrosActivos">
            <i class="bi bi-x-circle"></i>
            <span>Limpiar Filtros</span>
          </button>
        </div>

        <!-- Results Info -->
        <div class="results-info">
          <p class="results-text">
            Mostrando {{ animalesPaginados.length }} de {{ animalesFiltrados.length }} animales
            <span v-if="hayFiltrosActivos" class="filter-indicator">(filtrado)</span>
          </p>
          <div class="pagination-size">
            <label>Mostrar:</label>
            <select v-model="itemsPorPagina" class="size-select">
              <option :value="6">6</option>
              <option :value="12">12</option>
              <option :value="24">24</option>
              <option :value="animales.length">Todos</option>
            </select>
          </div>
        </div>

        <!-- Animals Grid -->
        <div class="animals-grid">
          <div v-for="animal in animalesPaginados" :key="animal.idAnimal" class="animal-card-modern">
            <!-- Status Badge -->
            <div class="animal-status-badge" :class="animal.estado.toLowerCase()">
              <span>{{ formatearEstado(animal.estado) }}</span>
            </div>

            <!-- Adoption Lock Badge -->
            <div v-if="tieneAdopcionAprobada(animal)" class="animal-lock-badge" title="Animal con adopción aprobada">
              <i class="bi bi-lock-fill"></i>
            </div>

            <!-- Image -->
            <div class="animal-image-container">
              <ImageCarousel 
                :imagenes="obtenerImagenesAnimal(animal)"
                :alt="animal.nombre"
                :icono="iconoPorEspecie(animal.especie)"
                :id="`carousel-org-${animal.idAnimal}`"
              />
              <div class="image-overlay">
                <div class="overlay-info">
                  <i :class="iconoPorEspecie(animal.especie)"></i>
                </div>
              </div>
            </div>

            <!-- Content -->
            <div class="animal-card-content">
              <div class="animal-header">
                <h5 class="animal-name">{{ animal.nombre }}</h5>
                <div class="animal-species-icon">
                  <i :class="iconoPorEspecie(animal.especie)"></i>
                </div>
              </div>

              <div class="animal-meta">
                <div class="meta-item">
                  <i class="bi bi-tag-fill"></i>
                  <span>{{ animal.especie }}</span>
                </div>
                <div class="meta-item">
                  <i :class="animal.sexo === 'Macho' ? 'bi bi-gender-male' : 'bi bi-gender-female'"></i>
                  <span>{{ animal.sexo }}</span>
                </div>
                <div class="meta-item">
                  <i class="bi bi-calendar3"></i>
                  <span>{{ animal.edad }} {{ animal.unidadEdad }}</span>
                </div>
              </div>

              <p class="animal-description">{{ truncar(animal.descripcion, 80) }}</p>

              <!-- Actions -->
              <div class="animal-actions">
                <button
                  class="btn-action edit"
                  @click="abrirModal(animal)"
                  :disabled="tieneAdopcionAprobada(animal)"
                  :title="tieneAdopcionAprobada(animal) ? 'Animal con adopción aprobada' : 'Editar animal'"
                >
                  <i class="bi bi-pencil-fill"></i>
                  <span>Editar</span>
                </button>
                <button
                  class="btn-action delete"
                  @click="eliminarAnimal(animal)"
                  :disabled="tieneAdopcionAprobada(animal)"
                  :title="tieneAdopcionAprobada(animal) ? 'Animal con adopción aprobada' : 'Eliminar animal'"
                >
                  <i class="bi bi-trash-fill"></i>
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination-container" v-if="totalPaginas > 1">
          <button 
            class="pagination-btn" 
            @click="paginaActual--" 
            :disabled="paginaActual === 1"
          >
            <i class="bi bi-chevron-left"></i>
          </button>
          
          <div class="pagination-numbers">
            <button
              v-for="pagina in paginasVisibles"
              :key="pagina"
              class="pagination-number"
              :class="{ active: pagina === paginaActual }"
              @click="paginaActual = pagina"
            >
              {{ pagina }}
            </button>
          </div>
          
          <button 
            class="pagination-btn" 
            @click="paginaActual++" 
            :disabled="paginaActual === totalPaginas"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="empty-state-modern">
        <div class="empty-icon">
          <i class="bi bi-inbox"></i>
        </div>
        <h4>No hay animales registrados</h4>
        <p>Comienza agregando tu primer animal para adopción</p>
        <button class="btn-add-first" @click="abrirModal()">
          <i class="bi bi-plus-circle me-2"></i>
          Agregar Primer Animal
        </button>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="animalModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content modern-modal">
          <div class="modal-header-modern">
            <div class="modal-icon">
              <i class="bi bi-heart-fill"></i>
            </div>
            <div>
              <h5 class="modal-title">{{ modoEdicion ? 'Editar Animal' : 'Nuevo Animal' }}</h5>
              <p class="modal-subtitle">{{ modoEdicion ? 'Actualiza la información del animal' : 'Registra un nuevo animal para adopción' }}</p>
            </div>
            <button type="button" class="btn-close-modern" data-bs-dismiss="modal">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <form @submit.prevent="guardarAnimal">
            <div class="modal-body-modern">
              <div class="form-grid">
                <!-- Left Column: Images -->
                <div class="form-section">
                  <div class="section-header">
                    <i class="bi bi-images"></i>
                    <h6>Fotos del Animal</h6>
                    <span class="badge-limit">Máx. 4</span>
                  </div>
                  <ImageUploader 
                    ref="imageUploader"
                    :multiple="true"
                    :max-files="4"
                    :model-value="imagenesExistentes"
                    placeholder="Arrastra hasta 4 imágenes aquí"
                    @files-selected="archivosSeleccionados"
                  />
                  <div class="helper-text">
                    <i class="bi bi-info-circle"></i>
                    <span>Las imágenes se subirán a Cloudinary al guardar</span>
                  </div>
                </div>

                <!-- Right Column: Form -->
                <div class="form-section">
                  <div class="section-header">
                    <i class="bi bi-clipboard-data"></i>
                    <h6>Información del Animal</h6>
                  </div>
                  
                  <div class="form-fields">
                    <div class="field-wrapper full">
                      <label class="field-label">
                        <i class="bi bi-cursor-text"></i>
                        Nombre *
                      </label>
                      <input 
                        type="text" 
                        v-model="form.nombre" 
                        class="field-input" 
                        placeholder="Ej: Max, Luna, Rocky..."
                        required 
                      />
                    </div>

                    <div class="field-wrapper">
                      <label class="field-label">
                        <i class="bi bi-tag"></i>
                        Especie *
                      </label>
                      <select v-model="form.especie" class="field-select" required>
                        <option value="">Seleccione...</option>
                        <option value="Perro">🐕 Perro</option>
                        <option value="Gato">🐈 Gato</option>
                        <option value="Otro">🐾 Otro</option>
                      </select>
                    </div>

                    <div class="field-wrapper">
                      <label class="field-label">
                        <i class="bi bi-gender-ambiguous"></i>
                        Sexo *
                      </label>
                      <select v-model="form.sexo" class="field-select" required>
                        <option value="">Seleccione...</option>
                        <option value="Macho">Macho</option>
                        <option value="Hembra">Hembra</option>
                        <option value="No especificado">No especificado</option>
                      </select>
                    </div>

                    <div class="field-wrapper">
                      <label class="field-label">
                        <i class="bi bi-calendar3"></i>
                        Edad *
                      </label>
                      <input 
                        type="number" 
                        v-model="form.edad" 
                        class="field-input" 
                        min="0"
                        max="15"
                        required 
                      />
                    </div>

                    <div class="field-wrapper">
                      <label class="field-label">
                        <i class="bi bi-hourglass-split"></i>
                        Unidad *
                      </label>
                      <select v-model="form.unidadEdad" class="field-select" required>
                        <option value="Años">Años</option>
                        <option value="Meses">Meses</option>
                      </select>
                    </div>

                    <div class="field-wrapper full">
                      <label class="field-label">
                        <i class="bi bi-flag"></i>
                        Estado *
                      </label>
                      <select v-model="form.estado" class="field-select" required>
                        <option value="Disponible">Disponible</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Adoptado">Adoptado</option>
                        <option value="No_disponible">No disponible</option>
                      </select>
                    </div>

                    <div class="field-wrapper full">
                      <label class="field-label">
                        <i class="bi bi-journal-text"></i>
                        Descripción *
                      </label>
                      <textarea 
                        v-model="form.descripcion" 
                        rows="4" 
                        class="field-textarea" 
                        placeholder="Describe las características, personalidad y necesidades del animal..."
                        required
                      ></textarea>
                      <div class="char-count">{{ form.descripcion?.length || 0 }} caracteres</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer-modern">
              <button type="button" class="btn-modal cancel" data-bs-dismiss="modal" :disabled="guardando">
                <i class="bi bi-x-circle"></i>
                <span>Cancelar</span>
              </button>
              <button type="submit" class="btn-modal save" :disabled="guardando">
                <span v-if="guardando">
                  <span class="spinner-border spinner-border-sm"></span>
                  <span>Guardando...</span>
                </span>
                <span v-else>
                  <i class="bi bi-check-circle"></i>
                  <span>Guardar Animal</span>
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import { useAuthStore } from '../../stores/auth';
import Loading from '../../components/common/Loading.vue';
import ImageUploader from '../../components/common/ImageUploader.vue';
import ImageCarousel from '../../components/common/ImageCarousel.vue';
import animalService from '../../services/animalService';
import adopcionService from '../../services/adopcionService';
import imagenAnimalService from '../../services/imagenAnimalService';
import organizacionService from '../../services/organizacionService';
import cloudinaryService from '../../services/cloudinaryService';
import { toast, confirmarEliminar, alertaError, manejarErrorAPI } from '../../utils/alertas';
import { iconoPorEspecie, colorPorEstado, formatearEstado, truncar } from '../../utils/helpers';

export default {
  name: 'OrganizacionAnimales',
  components: { 
    Loading,
    ImageUploader,
    ImageCarousel
  },
  setup() {
    const authStore = useAuthStore();
    const cargando = ref(true);
    const guardando = ref(false);
    const animales = ref([]);
    const form = ref({});
    const modoEdicion = ref(false);
    const miOrganizacion = ref(null);
    const imageUploader = ref(null);
    const archivosNuevos = ref([]);
    const imagenesExistentes = ref([]);
    let modal = null;

    // Filtros y paginación
    const filtroBusqueda = ref('');
    const filtroEspecie = ref('');
    const filtroEstado = ref('');
    const filtroSexo = ref('');
    const ordenamiento = ref('reciente');
    const paginaActual = ref(1);
    const itemsPorPagina = ref(12);

    // Computed: Animales filtrados
    const animalesFiltrados = computed(() => {
      let resultado = [...animales.value];

      // Filtro de búsqueda por nombre
      if (filtroBusqueda.value.trim()) {
        const busqueda = filtroBusqueda.value.toLowerCase();
        resultado = resultado.filter(animal =>
          animal.nombre.toLowerCase().includes(busqueda)
        );
      }

      // Filtro por especie
      if (filtroEspecie.value) {
        resultado = resultado.filter(animal => animal.especie === filtroEspecie.value);
      }

      // Filtro por estado
      if (filtroEstado.value) {
        resultado = resultado.filter(animal => animal.estado === filtroEstado.value);
      }

      // Filtro por sexo
      if (filtroSexo.value) {
        resultado = resultado.filter(animal => animal.sexo === filtroSexo.value);
      }

      // Ordenamiento
      switch (ordenamiento.value) {
        case 'reciente':
          resultado.sort((a, b) => (b.idAnimal || 0) - (a.idAnimal || 0));
          break;
        case 'antiguo':
          resultado.sort((a, b) => (a.idAnimal || 0) - (b.idAnimal || 0));
          break;
        case 'nombre-asc':
          resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
          break;
        case 'nombre-desc':
          resultado.sort((a, b) => b.nombre.localeCompare(a.nombre));
          break;
      }

      return resultado;
    });

    // Computed: Total de páginas
    const totalPaginas = computed(() => {
      return Math.ceil(animalesFiltrados.value.length / itemsPorPagina.value);
    });

    // Computed: Animales paginados
    const animalesPaginados = computed(() => {
      const inicio = (paginaActual.value - 1) * itemsPorPagina.value;
      const fin = inicio + itemsPorPagina.value;
      return animalesFiltrados.value.slice(inicio, fin);
    });

    // Computed: Páginas visibles en paginación
    const paginasVisibles = computed(() => {
      const total = totalPaginas.value;
      const actual = paginaActual.value;
      const paginas = [];

      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          paginas.push(i);
        }
      } else {
        if (actual <= 4) {
          for (let i = 1; i <= 5; i++) paginas.push(i);
          paginas.push('...');
          paginas.push(total);
        } else if (actual >= total - 3) {
          paginas.push(1);
          paginas.push('...');
          for (let i = total - 4; i <= total; i++) paginas.push(i);
        } else {
          paginas.push(1);
          paginas.push('...');
          for (let i = actual - 1; i <= actual + 1; i++) paginas.push(i);
          paginas.push('...');
          paginas.push(total);
        }
      }

      return paginas.filter(p => p !== '...' || paginas.indexOf(p) === paginas.lastIndexOf(p));
    });

    // Computed: Verificar si hay filtros activos
    const hayFiltrosActivos = computed(() => {
      return filtroBusqueda.value !== '' ||
             filtroEspecie.value !== '' ||
             filtroEstado.value !== '' ||
             filtroSexo.value !== '';
    });

    // Función para limpiar filtros
    const limpiarFiltros = () => {
      filtroBusqueda.value = '';
      filtroEspecie.value = '';
      filtroEstado.value = '';
      filtroSexo.value = '';
      paginaActual.value = 1;
    };

    const cargarDatos = async () => {
      try {
        const orgResponse = await organizacionService.getByUsuario(authStore.usuarioActual.idUsuario);
        if (!orgResponse.data) {
          animales.value = [];
          cargando.value = false;
          return;
        }
        miOrganizacion.value = orgResponse.data;
        const response = await animalService.getByOrganizacion(miOrganizacion.value.idOrganizacion);
        const animalesData = response.data || [];

        const animalesConAdopciones = await Promise.all(
          animalesData.map(async (animal) => {
            const adopcionesResponse = await adopcionService.getByAnimal(animal.idAnimal);
            return {
              ...animal,
              adopciones: adopcionesResponse.data || []
            };
          })
        );

        animales.value = animalesConAdopciones;
      } catch (error) {
        animales.value = [];
        if (error.response?.status !== 404) {
          manejarErrorAPI(error);
        }
      } finally {
        cargando.value = false;
      }
    };

    const obtenerImagenesAnimal = (animal) => {
      if (animal.imagenes && animal.imagenes.length > 0) {
        return animal.imagenes.map(img => img.url).filter(url => url);
      }
      return [];
    };

    const tieneAdopcionAprobada = (animal) => {
      if (!animal.adopciones || animal.adopciones.length === 0) return false;
      return animal.adopciones.some((adopcion) => adopcion.estado === 'Aprobada');
    };

    const abrirModal = (animal = null) => {
      modoEdicion.value = !!animal;
      archivosNuevos.value = [];
      
      if (animal) {
        form.value = {
          idAnimal: animal.idAnimal,
          nombre: animal.nombre,
          especie: animal.especie,
          sexo: animal.sexo,
          edad: animal.edad,
          unidadEdad: animal.unidadEdad,
          estado: animal.estado,
          descripcion: animal.descripcion
        };
        imagenesExistentes.value = obtenerImagenesAnimal(animal);
      } else {
        form.value = {
          nombre: '',
          especie: '',
          sexo: '',
          edad: 1,
          unidadEdad: 'Años',
          estado: 'Disponible',
          descripcion: ''
        };
        imagenesExistentes.value = [];
      }
      
      if (imageUploader.value) {
        imageUploader.value.limpiar();
      }
      
      modal = new Modal(document.getElementById('animalModal'));
      modal.show();
    };

    const archivosSeleccionados = (archivos) => {
      archivosNuevos.value = archivos;
    };

    const guardarAnimal = async () => {
      try {
        guardando.value = true;
        
        if (!form.value.nombre || form.value.nombre.trim().length < 2) {
          alertaError('El nombre debe tener al menos 2 caracteres');
          guardando.value = false;
          return;
        }
        
        if (!form.value.descripcion || form.value.descripcion.trim().length < 10) {
          alertaError('La descripción debe tener al menos 10 caracteres');
          guardando.value = false;
          return;
        }

        const edadNumero = parseInt(form.value.edad, 10);
        if (isNaN(edadNumero) || edadNumero < 0) {
          alertaError('La edad debe ser un número válido mayor o igual a 0');
          guardando.value = false;
          return;
        }
        
        if (form.value.unidadEdad === 'Años' && edadNumero > 50) {
          alertaError('La edad no puede ser mayor a 50 años');
          guardando.value = false;
          return;
        }
        
        if (form.value.unidadEdad === 'Meses' && edadNumero > 600) {
          alertaError('La edad no puede ser mayor a 600 meses (50 años)');
          guardando.value = false;
          return;
        }
        
        if (edadNumero === 0) {
          alertaError('La edad debe ser mayor a 0. Use la unidad apropiada (Meses para animales jóvenes)');
          guardando.value = false;
          return;
        }

        const totalImagenes = archivosNuevos.value.length + imagenesExistentes.value.length;
        if (totalImagenes > 4) {
          alertaError(`Solo puedes tener máximo 4 imágenes. Actualmente tienes ${imagenesExistentes.value.length} existentes y estás agregando ${archivosNuevos.value.length} nuevas.`);
          guardando.value = false;
          return;
        }

        let urlsImagenes = [];
        if (archivosNuevos.value.length > 0) {
          try {
            urlsImagenes = await cloudinaryService.subirMultiplesImagenes(
              archivosNuevos.value,
              'epaws/animales',
              4
            );
          } catch (error) {
            alertaError('Error al subir las imágenes: ' + error.message);
            guardando.value = false;
            return;
          }
        }

        const animalData = {
          nombre: form.value.nombre.trim(),
          especie: form.value.especie,
          sexo: form.value.sexo,
          edad: parseInt(form.value.edad),
          unidadEdad: form.value.unidadEdad,
          estado: form.value.estado,
          descripcion: form.value.descripcion.trim(),
          organizacion: {
            idOrganizacion: miOrganizacion.value.idOrganizacion
          }
        };

        let animalGuardado;
        
        if (modoEdicion.value) {
          const response = await animalService.update(form.value.idAnimal, animalData);
          animalGuardado = response.data;
          
          if (urlsImagenes.length > 0) {
            for (let i = 0; i < urlsImagenes.length; i++) {
              const url = urlsImagenes[i];
              const extension = url.split('.').pop().toLowerCase();
              const mimeTypes = {
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'webp': 'image/webp',
                'gif': 'image/gif'
              };
              const mimeType = mimeTypes[extension] || 'image/jpeg';
              
              try {
                await imagenAnimalService.create({
                  animal: { idAnimal: form.value.idAnimal },
                  url: url,
                  nombreArchivo: `animal_${form.value.idAnimal}_${Date.now()}_${i}.${extension}`,
                  mime: mimeType
                });
              } catch (imgError) {
                console.error('Error al guardar imagen:', imgError);
              }
            }
          }
          
          toast('Animal actualizado correctamente', 'success');
        } else {
          try {
            const response = await animalService.create(animalData);
            animalGuardado = response.data;
            
            if (urlsImagenes.length > 0) {
              for (let i = 0; i < urlsImagenes.length; i++) {
                const url = urlsImagenes[i];
                const extension = url.split('.').pop().toLowerCase();
                const mimeTypes = {
                  'jpg': 'image/jpeg',
                  'jpeg': 'image/jpeg',
                  'png': 'image/png',
                  'webp': 'image/webp',
                  'gif': 'image/gif'
                };
                const mimeType = mimeTypes[extension] || 'image/jpeg';
                
                try {
                  const imagenData = {
                    animal: { idAnimal: animalGuardado.idAnimal },
                    url: url,
                    nombreArchivo: `animal_${animalGuardado.idAnimal}_${Date.now()}_${i}.${extension}`,
                    mime: mimeType
                  };
                  
                  await imagenAnimalService.create(imagenData);
                } catch (imgError) {
                  console.error('Error al guardar imagen en BD:', imgError);
                }
              }
            }
            
            toast('Animal registrado correctamente', 'success');
          } catch (backendError) {
            console.error('Error del backend al crear animal:', backendError);
            throw backendError;
          }
        }

        modal.hide();
        await cargarDatos();
      } catch (error) {
        console.error('Error general:', error);
        manejarErrorAPI(error);
      } finally {
        guardando.value = false;
      }
    };

    const eliminarAnimal = async (animal) => {
      // Verificar si tiene solicitudes de adopción
      if (animal.adopciones && animal.adopciones.length > 0) {
        await alertaError(
          `No puedes eliminar a ${animal.nombre}`,
          `Este animal tiene ${animal.adopciones.length} solicitud(es) de adopción asociada(s). Debes gestionar las solicitudes antes de eliminar el animal.`
        );
        return;
      }

      const result = await confirmarEliminar(
        `¿Estás seguro de eliminar a ${animal.nombre}?`,
        'Esta acción no se puede deshacer'
      );
      
      if (result.isConfirmed) {
        try {
          await animalService.delete(animal.idAnimal);
          toast('Animal eliminado correctamente', 'success');
          await cargarDatos();
        } catch (error) {
          console.error('Error al eliminar animal:', error);
          if (error.response?.status === 409 || error.response?.data?.message?.includes('adopcion')) {
            alertaError(
              'No se puede eliminar el animal',
              'Este animal tiene solicitudes de adopción asociadas'
            );
          } else {
            manejarErrorAPI(error);
          }
        }
      }
    };

    onMounted(() => cargarDatos());

    return {
      cargando,
      guardando,
      animales,
      form,
      modoEdicion,
      imageUploader,
      imagenesExistentes,
      filtroBusqueda,
      filtroEspecie,
      filtroEstado,
      filtroSexo,
      ordenamiento,
      paginaActual,
      itemsPorPagina,
      animalesFiltrados,
      animalesPaginados,
      totalPaginas,
      paginasVisibles,
      hayFiltrosActivos,
      limpiarFiltros,
      abrirModal,
      guardarAnimal,
      eliminarAnimal,
      archivosSeleccionados,
      obtenerImagenesAnimal,
      tieneAdopcionAprobada,
      iconoPorEspecie,
      colorPorEstado,
      formatearEstado,
      truncar
    };
  }
};
</script>

<style scoped>
/* ============================================
   BASE & ANIMATIONS
   ============================================ */
.animals-page {
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
  gap: 1.5rem;
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

.btn-add-animal {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-add-animal:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

/* ============================================
   STATS
   ============================================ */
.animals-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.95rem;
}

.stat-badge.success {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.stat-badge.warning {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

/* ============================================
   ANIMALS GRID
   ============================================ */
.animals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.animal-card-modern {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.animal-card-modern:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
}

.animal-status-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 10;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.animal-status-badge.disponible {
  background: rgba(40, 167, 69, 0.9);
  color: white;
}

.animal-status-badge.pendiente {
  background: rgba(255, 193, 7, 0.9);
  color: white;
}

.animal-status-badge.adoptado {
  background: rgba(13, 110, 253, 0.9);
  color: white;
}

.animal-status-badge.no_disponible {
  background: rgba(108, 117, 125, 0.9);
  color: white;
}

.animal-lock-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 10;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.animal-image-container {
  height: 280px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.animal-image-container :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.animal-card-modern:hover .animal-image-container :deep(img) {
  transform: scale(1.1);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1.5rem;
}

.animal-card-modern:hover .image-overlay {
  opacity: 1;
}

.overlay-info {
  color: white;
  font-size: 2rem;
  animation: bounceIn 0.6s ease-out;
}

@keyframes bounceIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.animal-card-content {
  padding: 1.5rem;
}

.animal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.animal-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.animal-species-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-size: 1.25rem;
}

.animal-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.meta-item i {
  color: #667eea;
}

.animal-description {
  color: #6c757d;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.animal-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-action.edit {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.btn-action.edit:hover:not(:disabled) {
  background: #ffc107;
  color: white;
}

.btn-action.delete {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.btn-action.delete:hover:not(:disabled) {
  background: #dc3545;
  color: white;
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ============================================
   EMPTY STATE
   ============================================ */
.empty-state-modern {
  text-align: center;
  padding: 5rem 2rem;
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 2rem;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #667eea;
}

.empty-state-modern h4 {
  color: #1a1a1a;
  margin-bottom: 1rem;
}

.empty-state-modern p {
  color: #6c757d;
  margin-bottom: 2rem;
}

.btn-add-first {
  display: inline-flex;
  align-items: center;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add-first:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

/* ============================================
   MODAL
   ============================================ */
.modern-modal {
  border: none;
  border-radius: 24px;
  overflow: hidden;
}

.modal-header-modern {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.modal-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.modal-subtitle {
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.9;
}

.btn-close-modern {
  margin-left: auto;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-close-modern:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body-modern {
  padding: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f8f9fa;
}

.section-header i {
  font-size: 1.25rem;
  color: #667eea;
}

.section-header h6 {
  margin: 0;
  font-weight: 700;
  color: #1a1a1a;
  flex: 1;
}

.badge-limit {
  padding: 0.25rem 0.75rem;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.helper-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.form-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.field-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-wrapper.full {
  grid-column: 1 / -1;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
}

.field-label i {
  color: #667eea;
  font-size: 1rem;
}

.field-input,
.field-select,
.field-textarea {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.field-input:focus,
.field-select:focus,
.field-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
}

.char-count {
  font-size: 0.8rem;
  color: #6c757d;
  text-align: right;
}

.modal-footer-modern {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 2px solid #f8f9fa;
}

.btn-modal {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-modal.cancel {
  background: #f8f9fa;
  color: #6c757d;
}

.btn-modal.cancel:hover:not(:disabled) {
  background: #e9ecef;
}

.btn-modal.save {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.btn-modal.save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(40, 167, 69, 0.4);
}

.btn-modal:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* ============================================
   FILTERS & SEARCH
   ============================================ */
.filters-section {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 1.1rem;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-item i {
  color: #667eea;
  font-size: 1.1rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
}

.btn-clear-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-clear-filters:hover {
  background: #dc3545;
  color: white;
}

/* ============================================
   RESULTS INFO
   ============================================ */
.results-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 12px;
}

.results-text {
  margin: 0;
  color: #1a1a1a;
  font-weight: 600;
}

.filter-indicator {
  color: #667eea;
  font-weight: 700;
}

.pagination-size {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pagination-size label {
  margin: 0;
  color: #6c757d;
  font-weight: 600;
}

.size-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.size-select:focus {
  outline: none;
  border-color: #667eea;
}

/* ============================================
   PAGINATION
   ============================================ */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-top: 3rem;
  padding: 2rem 0;
}

.pagination-btn {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  border: 2px solid #e9ecef;
  background: white;
  color: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
}

.pagination-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 0.5rem;
}

.pagination-number {
  min-width: 45px;
  height: 45px;
  padding: 0 0.75rem;
  border-radius: 12px;
  border: 2px solid #e9ecef;
  background: white;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.pagination-number:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-color: #667eea;
}

.pagination-number.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 1200px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .btn-add-animal {
    width: 100%;
    justify-content: center;
  }
  
  .animals-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: 100%;
  }
  
  .filter-group {
    flex-direction: column;
  }
  
  .filter-item {
    width: 100%;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .results-info {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .pagination-size {
    justify-content: space-between;
  }
  
  .pagination-container {
    flex-wrap: wrap;
  }
  
  .pagination-numbers {
    flex-wrap: wrap;
  }
  
  .form-fields {
    grid-template-columns: 1fr;
  }
  
  .modal-header-modern {
    padding: 1.5rem;
  }
  
  .modal-body-modern {
    padding: 1.5rem;
  }
}
</style>
