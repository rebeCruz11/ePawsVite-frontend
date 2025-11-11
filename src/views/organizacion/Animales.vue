<template>
  <div class="fade-in">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>
        <i class="bi bi-heart me-2"></i>Mis Animales
      </h2>
      <button class="btn btn-primary" @click="abrirModal()">
        <i class="bi bi-plus-circle me-2"></i>
        Nuevo Animal
      </button>
    </div>

    <Loading v-if="cargando" />

    <div v-else>
      <div class="row g-4" v-if="animales.length > 0">
        <div class="col-md-4" v-for="animal in animales" :key="animal.idAnimal">
          <div class="card animal-card h-100">
            <!-- Carrusel de imágenes -->
            <div style="height: 250px; overflow: hidden;">
              <ImageCarousel 
                :imagenes="obtenerImagenesAnimal(animal)"
                :alt="animal.nombre"
                :icono="iconoPorEspecie(animal.especie)"
                :id="`carousel-org-${animal.idAnimal}`"
              />
            </div>
            
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="card-title mb-0">{{ animal.nombre }}</h5>
                <span class="badge" :class="`bg-${colorPorEstado(animal.estado)}`">
                  {{ formatearEstado(animal.estado) }}
                </span>
              </div>
              <p class="text-muted mb-2">
                <i class="bi bi-tag me-1"></i>{{ animal.especie }} • 
                <i class="bi bi-gender-ambiguous me-1"></i>{{ animal.sexo }}
              </p>
              <p class="text-muted mb-2">
                <i class="bi bi-calendar me-1"></i>{{ animal.edad }} {{ animal.unidadEdad }}
              </p>
              <p class="card-text small">{{ truncar(animal.descripcion, 60) }}</p>
            </div>
            
            <div class="card-footer bg-transparent">
              <button
                class="btn btn-sm btn-warning me-2"
                @click="abrirModal(animal)"
                :disabled="tieneAdopcionAprobada(animal)"
                :title="tieneAdopcionAprobada(animal) ? 'Animal con adopción aprobada. No se puede editar.' : ''"
              >
                <i class="bi bi-pencil"></i> Editar
              </button>
              <button
                class="btn btn-sm btn-danger"
                @click="eliminarAnimal(animal)"
                :disabled="tieneAdopcionAprobada(animal)"
                :title="tieneAdopcionAprobada(animal) ? 'Animal con adopción aprobada. No se puede eliminar.' : ''"
              >
                <i class="bi bi-trash"></i> Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <i class="bi bi-inbox"></i>
        <p>No has registrado animales</p>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="animalModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-heart me-2"></i>
              {{ modoEdicion ? 'Editar Animal' : 'Nuevo Animal' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <form @submit.prevent="guardarAnimal">
            <div class="modal-body">
              <div class="row">
                <!-- Columna Izquierda: Imágenes -->
                <div class="col-md-5">
                  <h6 class="mb-3">
                    <i class="bi bi-images me-2"></i>
                    Fotos del Animal (Máximo 4)
                  </h6>
                  <ImageUploader 
                    ref="imageUploader"
                    :multiple="true"
                    :max-files="4"
                    :model-value="imagenesExistentes"
                    placeholder="Arrastra hasta 4 imágenes aquí"
                    @files-selected="archivosSeleccionados"
                  />
                  <small class="text-muted mt-2 d-block">
                    <i class="bi bi-info-circle me-1"></i>
                    Las imágenes se subirán a Cloudinary al guardar
                  </small>
                </div>

                <!-- Columna Derecha: Datos del Animal -->
                <div class="col-md-7">
                  <h6 class="mb-3">
                    <i class="bi bi-clipboard-data me-2"></i>
                    Información del Animal
                  </h6>
                  
                  <div class="mb-3">
                    <label class="form-label">Nombre *</label>
                    <input 
                      type="text" 
                      v-model="form.nombre" 
                      class="form-control" 
                      placeholder="Ej: Max, Luna, Rocky..."
                      required 
                    />
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Especie *</label>
                      <select v-model="form.especie" class="form-select" required>
                        <option value="">Seleccione...</option>
                        <option value="Perro">Perro</option>
                        <option value="Gato">Gato</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>

                    <div class="col-md-6 mb-3">
                      <label class="form-label">Sexo *</label>
                      <select v-model="form.sexo" class="form-select" required>
                        <option value="">Seleccione...</option>
                        <option value="Macho">Macho</option>
                        <option value="Hembra">Hembra</option>
                        <option value="No especificado">No especificado</option>
                      </select>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">Edad *</label>
                      <input 
                        type="number" 
                        v-model="form.edad" 
                        class="form-control" 
                        min="0"
                        max="50"
                        required 
                      />
                    </div>

                    <div class="col-md-6 mb-3">
                      <label class="form-label">Unidad *</label>
                      <select v-model="form.unidadEdad" class="form-select" required>
                        <option value="Años">Años</option>
                        <option value="Meses">Meses</option>
                      </select>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Estado *</label>
                    <select v-model="form.estado" class="form-select" required>
                      <option value="Disponible">Disponible</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Adoptado">Adoptado</option>
                      <option value="No_disponible">No disponible</option>
                    </select>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Descripción *</label>
                    <textarea 
                      v-model="form.descripcion" 
                      rows="4" 
                      class="form-control" 
                      placeholder="Describe las características, personalidad y necesidades del animal..."
                      required
                    ></textarea>
                    <small class="text-muted">{{ form.descripcion?.length || 0 }} caracteres</small>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" :disabled="guardando">
                <i class="bi bi-x-circle me-2"></i>
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="guardando">
                <span v-if="guardando">
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Guardando...
                </span>
                <span v-else>
                  <i class="bi bi-check-circle me-2"></i>
                  Guardar Animal
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
import { ref, onMounted } from 'vue';
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

        // Cargar adopciones para cada animal
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
        
        // Cargar imágenes existentes
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
      
      // Limpiar uploader
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
        
        // Validaciones básicas
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

        // Validación de edad - NUEVA
        const edadNumero = parseInt(form.value.edad, 10);
        if (isNaN(edadNumero) || edadNumero < 0) {
          alertaError('La edad debe ser un número válido mayor o igual a 0');
          guardando.value = false;
          return;
        }
        
        // Validar límites según unidad
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
        
        // Validar que si es 0, tenga sentido
        if (edadNumero === 0) {
          alertaError('La edad debe ser mayor a 0. Use la unidad apropiada (Meses para animales jóvenes)');
          guardando.value = false;
          return;
        }

        console.log('Iniciando guardado de animal...');
        console.log('Archivos nuevos:', archivosNuevos.value.length);
        console.log('Imágenes existentes:', imagenesExistentes.value.length);

        // Validar máximo 4 imágenes en total
        const totalImagenes = archivosNuevos.value.length + imagenesExistentes.value.length;
        if (totalImagenes > 4) {
          alertaError(`Solo puedes tener máximo 4 imágenes. Actualmente tienes ${imagenesExistentes.value.length} existentes y estás agregando ${archivosNuevos.value.length} nuevas.`);
          guardando.value = false;
          return;
        }

        // Subir imágenes nuevas a Cloudinary
        let urlsImagenes = [];
        if (archivosNuevos.value.length > 0) {
          try {
            console.log('Subiendo imágenes a Cloudinary...');
            urlsImagenes = await cloudinaryService.subirMultiplesImagenes(
              archivosNuevos.value,
              'epaws/animales',
              4
            );
            console.log('Imágenes subidas exitosamente:', urlsImagenes);
          } catch (error) {
            console.error('Error al subir imágenes:', error);
            alertaError('Error al subir las imágenes: ' + error.message);
            guardando.value = false;
            return;
          }
        }

        // Preparar datos del animal
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

        console.log('Datos a enviar:', animalData);

        let animalGuardado;
        
        if (modoEdicion.value) {
          // Actualizar animal
          console.log('Actualizando animal ID:', form.value.idAnimal);
          const response = await animalService.update(form.value.idAnimal, animalData);
          animalGuardado = response.data;
          
          // Si hay nuevas imágenes, agregarlas
          if (urlsImagenes.length > 0) {
            console.log('Guardando', urlsImagenes.length, 'imágenes nuevas en base de datos...');
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
                console.log(`✅ Imagen ${i + 1} agregada`);
              } catch (imgError) {
                console.error('❌ Error al guardar imagen:', imgError);
              }
            }
          }
          
          toast('Animal actualizado correctamente', 'success');
        } else {
          // Crear animal
          console.log('Creando nuevo animal...');
          try {
            const response = await animalService.create(animalData);
            animalGuardado = response.data;
            console.log('Animal creado con ID:', animalGuardado.idAnimal);
            
            // Guardar imágenes si hay
            if (urlsImagenes.length > 0) {
              console.log('Guardando', urlsImagenes.length, 'imágenes en base de datos...');
              for (let i = 0; i < urlsImagenes.length; i++) {
                const url = urlsImagenes[i];
                console.log(`Guardando imagen ${i + 1}/${urlsImagenes.length}:`, url);
                
                // Determinar el tipo MIME basado en la extensión de la URL
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
                  console.log('Datos de imagen a enviar:', imagenData);
                  
                  const response = await imagenAnimalService.create(imagenData);
                  console.log(`✅ Imagen ${i + 1} guardada correctamente:`, response.data);
                } catch (imgError) {
                  console.error('❌ Error al guardar imagen en BD:', imgError);
                  console.error('Response data:', imgError.response?.data);
                  console.error('Response status:', imgError.response?.status);
                  // Continuar con las demás imágenes aunque una falle
                }
              }
              console.log('Todas las imágenes guardadas');
            }
            
            toast('Animal registrado correctamente', 'success');
          } catch (backendError) {
            console.error('Error del backend al crear animal:', backendError);
            console.error('Response data:', backendError.response?.data);
            console.error('Response status:', backendError.response?.status);
            throw backendError; // Re-lanzar para que el catch exterior lo maneje
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
      const result = await confirmarEliminar(
        `¿Estás seguro de eliminar a ${animal.nombre}?`
      );
      
      if (result.isConfirmed) {
        try {
          await animalService.delete(animal.idAnimal);
          toast('Animal eliminado', 'success');
          await cargarDatos();
        } catch (error) {
          manejarErrorAPI(error);
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
.animal-card {
  transition: transform 0.2s, box-shadow 0.2s;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.animal-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 20px;
  display: block;
}

.modal-xl {
  max-width: 1200px;
}
</style>
