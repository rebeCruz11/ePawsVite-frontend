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
          <div class="card h-100">
            <div
              style="height: 200px; position: relative; overflow: hidden; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            >
              <img
                v-if="obtenerFotoAnimal(animal)"
                :src="obtenerFotoAnimal(animal)"
                :alt="animal.nombre"
                style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;"
                @error="e => { e.target.style.display = 'none'; console.log('Error al cargar imagen:', obtenerFotoAnimal(animal)); }"
              />
              <div
                v-if="!obtenerFotoAnimal(animal)"
                class="d-flex align-items-center justify-content-center h-100"
                style="position: relative; z-index: 1"
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
              <p class="text-muted mb-2">{{ animal.especie }} • {{ animal.sexo }} • {{ animal.edad }} {{ animal.unidadEdad }}</p>
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

    <div class="modal fade" id="animalModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ modoEdicion ? 'Editar Animal' : 'Nuevo Animal' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <form @submit.prevent="guardarAnimal">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Nombre *</label>
                <input type="text" v-model="form.nombre" class="form-control" required />
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
                  <input type="number" v-model="form.edad" class="form-control" required />
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
                  <option value="Aprobada">Aprobada</option>
                  <option value="No disponible">No disponible</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Descripción *</label>
                <textarea v-model="form.descripcion" rows="3" class="form-control" required></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label">URL de la Foto</label>
                <input
                  type="url"
                  v-model="form.fotoUrl"
                  placeholder="https://ejemplo.com/foto.jpg"
                  class="form-control"
                  @input="verificarFoto"
                />
                <small class="text-muted">
                  Ingresa la URL de la foto del animal (puedes usar
                  <a href="https://imgur.com/upload" target="_blank">Imgur</a> para subir imágenes)
                </small>

                <div v-if="fotoValida && form.fotoUrl" class="mt-3">
                  <p class="text-muted mb-2">Vista previa:</p>
                  <img
                    :src="form.fotoUrl"
                    class="img-fluid rounded"
                    style="max-height: 200px; object-fit: cover"
                    @error="fotoValida = false"
                  />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cancelar
              </button>
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
import adopcionService from '../../services/adopcionService';
import imagenAnimalService from '../../services/imagenAnimalService';
import organizacionService from '../../services/organizacionService';
import { toast, confirmarEliminar, alertaError, manejarErrorAPI } from '../../utils/alertas';
import { validarAnimal } from '../../utils/validaciones';
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

    // Carga los animales y sus adopciones para validar estado de adopción aprobada
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

        // Para cada animal obtenemos sus adopciones
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

    const tieneAdopcionAprobada = (animal) => {
      if (!animal.adopciones || animal.adopciones.length === 0) return false;
      return animal.adopciones.some((adopcion) => adopcion.estado === 'Aprobada');
    };

    const abrirModal = (animal = null) => {
      modoEdicion.value = !!animal;
      form.value = animal
        ? { ...animal }
        : {
            nombre: '',
            especie: '',
            edad: '',
            unidadEdad: 'Años',
            sexo: '',
            estado: 'Disponible',
            descripcion: '',
            fotoUrl: '',
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
      const datosVal = {
        ...form.value,
        organizacion: { idOrganizacion: miOrganizacion.value.idOrganizacion },
      };

      const errores = validarAnimal(datosVal);
      if (Object.keys(errores).length > 0) {
        const mensajes = Object.values(errores).join('\n');
        await alertaError(mensajes, 'Errores en el formulario');
        return;
      }

      guardando.value = true;
      try {
        if (modoEdicion.value) {
          await animalService.update(form.value.idAnimal, datosVal);
          if (form.value.fotoUrl) {
            try {
              await imagenAnimalService.create({ idAnimal: form.value.idAnimal, url: form.value.fotoUrl });
            } catch (e) {
              console.warn('Error al crear imagen al actualizar animal:', e);
            }
          }
          toast('Animal actualizado', 'success');
        } else {
          const res = await animalService.create(datosVal);
          const nuevoId = res?.data?.idAnimal || res?.data?.id || null;
          if (nuevoId && form.value.fotoUrl) {
            try {
              await imagenAnimalService.create({ idAnimal: nuevoId, url: form.value.fotoUrl });
            } catch (e) {
              console.warn('Error al crear imagen en nuevo animal:', e);
            }
          }
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
      cargando,
      guardando,
      animales,
      form,
      modoEdicion,
      fotoValida,
      abrirModal,
      guardarAnimal,
      eliminarAnimal,
      verificarFoto,
      tieneAdopcionAprobada,
      iconoPorEspecie,
      colorPorEstado,
      formatearEstado,
      truncar,
      obtenerFotoAnimal,
    };
  },
};
</script>
