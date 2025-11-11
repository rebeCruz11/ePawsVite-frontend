<template>
  <div class="fade-in">
    <h2 class="mb-4"><i class="bi bi-flag me-2"></i>Reportar Animal</h2>
    
    <div class="row justify-content-center">
      <div class="col-md-10">
        <div class="card">
          <div class="card-body p-4">
            <form @submit.prevent="crearReporte">
              <div class="row">
                <!-- Columna Izquierda: Imagen -->
                <div class="col-md-5">
                  <h6 class="mb-3">
                    <i class="bi bi-camera me-2"></i>
                    Foto del Animal (Opcional)
                  </h6>
                  <ImageUploader 
                    ref="imageUploader"
                    :multiple="false"
                    :max-files="1"
                    placeholder="Arrastra una imagen aquí o haz clic para seleccionar"
                    @files-selected="archivosSeleccionados"
                  />
                  <small class="text-muted mt-2 d-block">
                    <i class="bi bi-info-circle me-1"></i>
                    Una imagen ayuda a identificar mejor al animal
                  </small>
                </div>

                <!-- Columna Derecha: Formulario -->
                <div class="col-md-7">
                  <h6 class="mb-3">
                    <i class="bi bi-clipboard-data me-2"></i>
                    Información del Reporte
                  </h6>
                  
                  <div class="mb-3">
                    <label for="titulo" class="form-label">Título del Reporte *</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="titulo" 
                      v-model="form.titulo"
                      :class="{ 'is-invalid': errores.titulo }"
                      placeholder="Ej: Perro herido encontrado en parque"
                      required
                      maxlength="150"
                    >
                    <div class="invalid-feedback">{{ errores.titulo }}</div>
                    <small class="text-muted">{{ form.titulo?.length || 0 }}/150 caracteres</small>
                  </div>
                  
                  <div class="mb-3">
                    <label for="descripcion" class="form-label">Descripción *</label>
                    <textarea 
                      class="form-control" 
                      id="descripcion" 
                      v-model="form.descripcion"
                      :class="{ 'is-invalid': errores.descripcion }"
                      rows="4"
                      placeholder="Describe la situación del animal: estado, comportamiento, necesidades..."
                      required
                      maxlength="5000"
                    ></textarea>
                    <div class="invalid-feedback">{{ errores.descripcion }}</div>
                    <small class="text-muted">{{ form.descripcion?.length || 0 }}/5000 caracteres</small>
                  </div>
                  
                  <div class="mb-3">
                    <label for="ubicacion" class="form-label">Ubicación</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="ubicacion" 
                      v-model="form.ubicacion"
                      placeholder="Ej: Parque Cuscatlán, San Salvador"
                      maxlength="200"
                    >
                    <small class="text-muted">Ayuda a localizar al animal más fácilmente</small>
                  </div>
                  
                  <div class="mb-3">
                    <label class="form-label">
                      <i class="bi bi-building me-1"></i>
                      Organización *
                    </label>
                    <div class="input-group">
                      <input 
                        type="text" 
                        class="form-control" 
                        :value="organizacionSeleccionada?.nombreOrganizacion || 'Ninguna seleccionada'"
                        readonly
                        :class="{ 'is-invalid': errores.idOrganizacion }"
                      >
                      <button 
                        type="button" 
                        class="btn btn-outline-primary" 
                        @click="abrirModalOrganizacion"
                      >
                        <i class="bi bi-search me-1"></i>
                        Buscar
                      </button>
                    </div>
                    <div class="invalid-feedback" v-if="errores.idOrganizacion">{{ errores.idOrganizacion }}</div>
                    <small class="text-muted">Selecciona la organización que atenderá el reporte</small>
                  </div>
                  
                  <div class="mb-3" style="display: none;">
                    <label class="form-label text-muted">
                      <i class="bi bi-hospital me-1"></i>
                      Veterinaria
                    </label>
                    <select class="form-select" id="veterinaria" v-model="form.idVeterinaria">
                      <option value="">Ninguna</option>
                      <option v-for="vet in veterinarias" :key="vet.idVeterinaria" :value="vet.idVeterinaria">
                        {{ vet.nombreClinica }}
                      </option>
                    </select>
                    <small class="text-muted">La organización asignará la veterinaria</small>
                  </div>
                </div>
              </div>

              <hr class="my-4">

              <div class="d-flex gap-2 justify-content-end">
                <router-link to="/cliente/mis-reportes" class="btn btn-secondary">
                  <i class="bi bi-x-circle me-2"></i>
                  Cancelar
                </router-link>
                <button type="submit" class="btn btn-primary btn-lg" :disabled="enviando">
                  <span v-if="enviando">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Enviando reporte...
                  </span>
                  <span v-else>
                    <i class="bi bi-flag-fill me-2"></i>
                    Enviar Reporte
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Instrucciones -->
        <div class="alert alert-info mt-4">
          <h6><i class="bi bi-info-circle me-2"></i>Consejos para un buen reporte:</h6>
          <ul class="mb-0">
            <li>Sé específico en la descripción del animal y su situación</li>
            <li>Incluye una foto clara si es posible</li>
            <li>Proporciona la ubicación exacta donde lo viste</li>
            <li>Si el animal necesita atención urgente, asígnalo a una veterinaria</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para seleccionar organización -->
  <div class="modal fade" id="organizacionModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            <i class="bi bi-building me-2"></i>
            Seleccionar Organización
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            Selecciona la organización que atenderá tu reporte. Ellos se encargarán de ayudar al animal.
          </div>

          <!-- Búsqueda -->
          <div class="mb-3">
            <label class="form-label fw-bold">
              <i class="bi bi-search me-2"></i>Buscar Organización
            </label>
            <input 
              type="text" 
              class="form-control" 
              v-model="busquedaOrg"
              placeholder="Buscar por nombre o ubicación..."
            />
          </div>

          <!-- Lista de organizaciones -->
          <div class="list-group" style="max-height: 400px; overflow-y: auto;">
            <button 
              type="button"
              v-for="org in organizacionesFiltradas" 
              :key="org.idOrganizacion"
              class="list-group-item list-group-item-action"
              :class="{ 'active': form.idOrganizacion === org.idOrganizacion }"
              @click="seleccionarOrganizacion(org)"
            >
              <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">
                  <i class="bi bi-building me-2"></i>
                  {{ org.nombreOrganizacion }}
                </h6>
                <small v-if="form.idOrganizacion === org.idOrganizacion">
                  <i class="bi bi-check-circle-fill text-success"></i>
                </small>
              </div>
              <p class="mb-1 small" v-if="org.ubicacion">
                <i class="bi bi-geo-alt me-1"></i>{{ org.ubicacion }}
              </p>
              <small class="text-muted" v-if="org.telefono">
                <i class="bi bi-telephone me-1"></i>{{ org.telefono }}
              </small>
            </button>
            <div v-if="organizacionesFiltradas.length === 0" class="text-center text-muted py-4">
              <i class="bi bi-inbox fs-1 d-block mb-2"></i>
              No se encontraron organizaciones
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import ImageUploader from '../../components/common/ImageUploader.vue';
import reporteService from '../../services/reporteService';
import organizacionService from '../../services/organizacionService';
import veterinariaService from '../../services/veterinariaService';
import cloudinaryService from '../../services/cloudinaryService';
import { alertaExito, alertaError, manejarErrorAPI } from '../../utils/alertas';

export default {
  name: 'CrearReporte',
  components: { ImageUploader },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const imageUploader = ref(null);
    const archivoImagen = ref(null);
    
    const form = ref({
      titulo: '',
      descripcion: '',
      ubicacion: '',
      idOrganizacion: '',
      idVeterinaria: ''
    });
    
    const errores = ref({});
    const enviando = ref(false);
    const organizaciones = ref([]);
    const veterinarias = ref([]);
    const busquedaOrg = ref('');
    const organizacionSeleccionada = ref(null);
    let modalOrganizacion = null;

    // Computed para filtrar organizaciones
    const organizacionesFiltradas = computed(() => {
      if (!busquedaOrg.value) return organizaciones.value;
      const busqueda = busquedaOrg.value.toLowerCase();
      return organizaciones.value.filter(org => 
        org.nombreOrganizacion.toLowerCase().includes(busqueda) ||
        (org.ubicacion && org.ubicacion.toLowerCase().includes(busqueda))
      );
    });
    
    const cargarDatos = async () => {
      try {
        const [orgsResp, vetsResp] = await Promise.all([
          organizacionService.getAll(),
          veterinariaService.getAll()
        ]);
        organizaciones.value = orgsResp.data;
        veterinarias.value = vetsResp.data;
      } catch (error) {
        console.error('Error al cargar organizaciones y veterinarias:', error);
      }
    };

    const archivosSeleccionados = (archivos) => {
      archivoImagen.value = archivos.length > 0 ? archivos[0] : null;
    };

    const validarFormulario = () => {
      errores.value = {};
      
      if (!form.value.titulo || form.value.titulo.trim().length < 5) {
        errores.value.titulo = 'El título debe tener al menos 5 caracteres';
      }
      
      if (form.value.titulo && form.value.titulo.length > 150) {
        errores.value.titulo = 'El título no puede exceder 150 caracteres';
      }
      
      if (!form.value.descripcion || form.value.descripcion.trim().length < 10) {
        errores.value.descripcion = 'La descripción debe tener al menos 10 caracteres';
      }
      
      if (form.value.descripcion && form.value.descripcion.length > 5000) {
        errores.value.descripcion = 'La descripción no puede exceder 5000 caracteres';
      }

      if (!form.value.idOrganizacion) {
        errores.value.idOrganizacion = 'Debes seleccionar una organización';
      }
      
      return Object.keys(errores.value).length === 0;
    };

    const abrirModalOrganizacion = () => {
      busquedaOrg.value = '';
      modalOrganizacion.show();
    };

    const seleccionarOrganizacion = (org) => {
      form.value.idOrganizacion = org.idOrganizacion;
      organizacionSeleccionada.value = org;
      modalOrganizacion.hide();
    };

    const crearReporte = async () => {
      if (!validarFormulario()) {
        return;
      }

      try {
        enviando.value = true;
        
        let fotoUrl = null;
        
        // Subir imagen a Cloudinary si existe
        if (archivoImagen.value) {
          try {
            fotoUrl = await cloudinaryService.subirImagen(archivoImagen.value, 'epaws/reportes');
            console.log('Imagen subida a Cloudinary:', fotoUrl);
          } catch (error) {
            console.error('Error al subir imagen:', error);
            alertaError('No se pudo subir la imagen, pero el reporte se creará sin foto');
          }
        }

        // Preparar datos del reporte
        const reporteData = {
          usuario: {
            idUsuario: authStore.usuarioActual.idUsuario
          },
          titulo: form.value.titulo.trim(),
          descripcion: form.value.descripcion.trim(),
          ubicacion: form.value.ubicacion?.trim() || null,
          fotoUrl: fotoUrl,
          estado: 'Pendiente'
        };

        // Agregar organización si fue seleccionada
        if (form.value.idOrganizacion) {
          reporteData.organizacion = {
            idOrganizacion: parseInt(form.value.idOrganizacion)
          };
        }

        // NO agregar veterinaria - solo la organización la asignará
        // if (form.value.idVeterinaria) {
        //   reporteData.veterinaria = {
        //     idVeterinaria: parseInt(form.value.idVeterinaria)
        //   };
        // }

        await reporteService.create(reporteData);
        
        await alertaExito(
          'Tu reporte ha sido enviado exitosamente. La organización seleccionada será notificada.',
          '¡Reporte creado!'
        );
        
        router.push('/cliente/mis-reportes');
      } catch (error) {
        console.error('Error al crear reporte:', error);
        manejarErrorAPI(error);
      } finally {
        enviando.value = false;
      }
    };

    onMounted(async () => {
      await cargarDatos();
      // Importar Modal de Bootstrap
      const { Modal } = await import('bootstrap');
      modalOrganizacion = new Modal(document.getElementById('organizacionModal'));
    });

    return {
      form,
      errores,
      enviando,
      organizaciones,
      organizacionesFiltradas,
      organizacionSeleccionada,
      veterinarias,
      busquedaOrg,
      imageUploader,
      archivosSeleccionados,
      abrirModalOrganizacion,
      seleccionarOrganizacion,
      crearReporte
    };
  }
};
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
