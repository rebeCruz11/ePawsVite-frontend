<template>
  <div class="fade-in">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-heart me-2"></i>Mis Animales</h2>
      <button class="btn btn-primary" @click="abrirModal()">
        <i class="bi bi-plus-circle me-2"></i>
        Nuevo Animal
      </button>
    </div>
    
    <Loading v-if="cargando" />
    
    <div v-else>
      <div class="row g-4" v-if="animales.length > 0">
        <div class="col-md-4" v-for="animal in animales" :key="animal.idAnimal">
          <div class="card h-100">
            <!-- Foto del animal o gradiente por defecto -->
            <!-- Foto del animal -->
            <div style="height: 200px; position: relative; overflow: hidden; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <img 
                v-if="obtenerFotoAnimal(animal)"
                :src="obtenerFotoAnimal(animal)" 
                :alt="animal.nombre"
                style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;"
                @error="e => { e.target.style.display = 'none'; console.log('Error al cargar imagen:', obtenerFotoAnimal(animal)); }"
              >
              <div 
                v-if="!obtenerFotoAnimal(animal)" 
                class="d-flex align-items-center justify-content-center h-100"
                style="position: relative; z-index: 1;"
              >
                <i :class="`bi ${iconoPorEspecie(animal.especie)} text-white`" style="font-size: 3rem;"></i>
              </div>
              <div class="position-absolute top-0 end-0 m-2" style="z-index: 2;">
                <span class="badge" :class="`bg-${colorPorEstado(animal.estado)}`">
                  {{ formatearEstado(animal.estado) }}
                </span>
              </div>
            </div>
            <div class="card-body">
              <h5 class="card-title">{{ animal.nombre }}</h5>
              <p class="text-muted mb-2">
                {{ animal.especie }} • {{ animal.sexo }} • {{ animal.edad }} {{ animal.unidadEdad }}
              </p>
              <p class="card-text small">{{ truncar(animal.descripcion, 60) }}</p>
            </div>
            <div class="card-footer bg-transparent">
              <button class="btn btn-sm btn-warning me-2" @click="abrirModal(animal)">
                <i class="bi bi-pencil"></i> Editar
              </button>
              <button class="btn btn-sm btn-danger" @click="eliminarAnimal(animal)">
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
    
    <!-- Modal (similar al de Usuarios.vue, adaptado para animales) -->
    <div class="modal fade" id="animalModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ modoEdicion ? 'Editar Animal' : 'Nuevo Animal' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="guardarAnimal">
            <div class="modal-body">
              <!-- Campos del formulario -->
              <div class="mb-3">
                <label class="form-label">Nombre *</label>
                <input type="text" class="form-control" v-model="form.nombre" required>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Especie *</label>
                  <select class="form-select" v-model="form.especie" required>
                    <option value="">Seleccione...</option>
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label class="form-label">Sexo *</label>
                  <select class="form-select" v-model="form.sexo" required>
                    <option value="">Seleccione...</option>
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                    <option value="No_especificado">No especificado</option>
                  </select>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Edad *</label>
                  <input type="number" class="form-control" v-model="form.edad" required>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label class="form-label">Unidad *</label>
                  <select class="form-select" v-model="form.unidadEdad" required>
                    <option value="Años">Años</option>
                    <option value="Meses">Meses</option>
                  </select>
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Estado *</label>
                <select class="form-select" v-model="form.estado" required>
                  <option value="Disponible">Disponible</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Adoptado">Adoptado</option>
                  <option value="No_disponible">No disponible</option>
                </select>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Descripción *</label>
                <textarea class="form-control" v-model="form.descripcion" rows="3" required></textarea>
              </div>
              
              <div class="mb-3">
                <label class="form-label">URL de la Foto</label>
                <input 
                  type="url" 
                  class="form-control" 
                  v-model="form.fotoUrl"
                  placeholder="https://ejemplo.com/foto.jpg"
                  @input="verificarFoto"
                >
                <small class="text-muted">
                  Ingresa la URL de la foto del animal (puedes usar 
                  <a href="https://imgur.com/upload" target="_blank">Imgur</a> para subir imágenes)
                </small>
                
                <!-- Vista previa de la foto -->
                <div v-if="fotoValida && form.fotoUrl" class="mt-3">
                  <p class="text-muted mb-2">Vista previa:</p>
                  <img 
                    :src="form.fotoUrl" 
                    class="img-fluid rounded" 
                    style="max-height: 200px; object-fit: cover;"
                    @error="fotoValida = false"
                  >
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" class="btn btn-primary" :disabled="guardando">
                <span v-if="guardando">Guardando...</span>
                <span v-else>Guardar</span>
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
import animalService from '../../services/animalService';
import organizacionService from '../../services/organizacionService';
import { toast, confirmarEliminar, manejarErrorAPI } from '../../utils/alertas';
import { iconoPorEspecie, colorPorEstado, formatearEstado, truncar, obtenerFotoAnimal } from '../../utils/helpers';

export default {
  name: 'OrganizacionAnimales',
  components: { Loading },
  setup() {
    const authStore = useAuthStore();
    const cargando = ref(true);
    const guardando = ref(false);
    const animales = ref([]);
    const form = ref({});
    const modoEdicion = ref(false);
    const miOrganizacion = ref(null);
    const fotoValida = ref(false);
    let modal = null;
    
    const cargarDatos = async () => {
      try {
        const orgResponse = await organizacionService.getByUsuario(authStore.usuarioActual.idUsuario);
        
        if (!orgResponse.data) {
          console.warn('Usuario de organización no tiene organización asociada');
          animales.value = [];
          cargando.value = false;
          return;
        }
        
        miOrganizacion.value = orgResponse.data;
        const response = await animalService.getByOrganizacion(miOrganizacion.value.idOrganizacion);
        animales.value = response.data;
      } catch (error) {
        console.error('Error al cargar animales:', error);
        animales.value = [];
        if (error.response?.status !== 404) {
          manejarErrorAPI(error);
        }
      } finally {
        cargando.value = false;
      }
    };
    
    const abrirModal = (animal = null) => {
      modoEdicion.value = !!animal;
      form.value = animal ? { ...animal } : {
        nombre: '', especie: '', edad: '', unidadEdad: 'Años',
        sexo: '', estado: 'Disponible', descripcion: '', fotoUrl: ''
      };
      fotoValida.value = !!animal?.fotoUrl;
      modal.show();
    };
    
    const verificarFoto = () => {
      if (!form.value.fotoUrl) {
        fotoValida.value = false;
        return;
      }
      try {
        new URL(form.value.fotoUrl);
        fotoValida.value = true;
      } catch {
        fotoValida.value = false;
      }
    };
    
    const guardarAnimal = async () => {
      guardando.value = true;
      try {
        const datos = {
          ...form.value,
          organizacion: { idOrganizacion: miOrganizacion.value.idOrganizacion }
        };
        
        if (modoEdicion.value) {
          await animalService.update(form.value.idAnimal, datos);
          toast('Animal actualizado', 'success');
        } else {
          await animalService.create(datos);
          toast('Animal creado', 'success');
        }
        modal.hide();
        await cargarDatos();
      } catch (error) {
        manejarErrorAPI(error);
      } finally {
        guardando.value = false;
      }
    };
    
    const eliminarAnimal = async (animal) => {
      const result = await confirmarEliminar(`¿Eliminar a ${animal.nombre}?`);
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
    
    onMounted(async () => {
      await cargarDatos();
      modal = new Modal(document.getElementById('animalModal'));
    });
    
    return {
      cargando, guardando, animales, form, modoEdicion, fotoValida,
      abrirModal, guardarAnimal, eliminarAnimal, verificarFoto,
      iconoPorEspecie, colorPorEstado, formatearEstado, truncar, obtenerFotoAnimal
    };
  }
}
</script>
