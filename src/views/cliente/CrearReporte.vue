<template>
  <div class="fade-in">
    <h2 class="mb-4"><i class="bi bi-flag me-2"></i>Reportar Animal</h2>
    
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-body p-4">
            <form @submit.prevent="crearReporte">
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
                >
                <div class="invalid-feedback">{{ errores.titulo }}</div>
              </div>
              
              <div class="mb-3">
                <label for="descripcion" class="form-label">Descripción *</label>
                <textarea 
                  class="form-control" 
                  id="descripcion" 
                  v-model="form.descripcion"
                  :class="{ 'is-invalid': errores.descripcion }"
                  rows="4"
                  placeholder="Describe la situación del animal..."
                  required
                ></textarea>
                <div class="invalid-feedback">{{ errores.descripcion }}</div>
              </div>
              
              <div class="mb-3">
                <label for="ubicacion" class="form-label">Ubicación</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="ubicacion" 
                  v-model="form.ubicacion"
                  placeholder="Ej: Parque Cuscatlán, San Salvador"
                >
              </div>
              
              <div class="mb-3">
                <label for="fotoUrl" class="form-label">URL de Foto</label>
                <input 
                  type="url" 
                  class="form-control" 
                  id="fotoUrl" 
                  v-model="form.fotoUrl"
                  :class="{ 'is-invalid': errores.fotoUrl }"
                  placeholder="https://ejemplo.com/foto.jpg"
                >
                <small class="text-muted">Puedes usar servicios como Imgur para subir fotos</small>
                <div class="invalid-feedback">{{ errores.fotoUrl }}</div>
              </div>
              
              <!-- Preview de foto -->
              <div v-if="form.fotoUrl && !errores.fotoUrl" class="mb-3">
                <label class="form-label">Vista Previa:</label>
                <img :src="form.fotoUrl" class="img-fluid rounded" alt="Preview" style="max-height: 300px;">
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="organizacion" class="form-label">Asignar a Organización (Opcional)</label>
                  <select class="form-select" id="organizacion" v-model="form.idOrganizacion">
                    <option value="">Seleccione...</option>
                    <option v-for="org in organizaciones" :key="org.idOrganizacion" :value="org.idOrganizacion">
                      {{ org.nombreOrganizacion }}
                    </option>
                  </select>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="veterinaria" class="form-label">Asignar a Veterinaria (Opcional)</label>
                  <select class="form-select" id="veterinaria" v-model="form.idVeterinaria">
                    <option value="">Seleccione...</option>
                    <option v-for="vet in veterinarias" :key="vet.idVeterinaria" :value="vet.idVeterinaria">
                      {{ vet.nombreClinica }}
                    </option>
                  </select>
                </div>
              </div>
              
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary btn-lg" :disabled="enviando">
                  <span v-if="enviando">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Enviando reporte...
                  </span>
                  <span v-else>
                    <i class="bi bi-flag me-2"></i>
                    Enviar Reporte
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import reporteService from '../../services/reporteService';
import organizacionService from '../../services/organizacionService';
import veterinariaService from '../../services/veterinariaService';
import { alertaExito, alertaError, manejarErrorAPI } from '../../utils/alertas';
import { validarReporte } from '../../utils/validaciones';

export default {
  name: 'ClienteCrearReporte',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const enviando = ref(false);
    const organizaciones = ref([]);
    const veterinarias = ref([]);
    
    const form = ref({
      titulo: '',
      descripcion: '',
      ubicacion: '',
      fotoUrl: '',
      idOrganizacion: '',
      idVeterinaria: ''
    });
    
    const errores = ref({});
    
    const cargarDatos = async () => {
      try {
        const [orgs, vets] = await Promise.all([
          organizacionService.getAll(),
          veterinariaService.getAll()
        ]);
        organizaciones.value = orgs.data;
        veterinarias.value = vets.data;
      } catch (error) {
        manejarErrorAPI(error);
      }
    };
    
    const crearReporte = async () => {
      // Validar
      const reporte = {
        ...form.value,
        usuario: { idUsuario: authStore.usuarioActual.idUsuario }
      };
      errores.value = validarReporte(reporte);

      if (Object.keys(errores.value).length > 0) {
        // Mostrar errores con SweetAlert
        const mensajes = Object.values(errores.value).join('\n');
        await alertaError(mensajes, 'Errores en el formulario');
        return;
      }
      
      enviando.value = true;
      
      try {
        const datos = {
          usuario: { idUsuario: authStore.usuarioActual.idUsuario },
          titulo: form.value.titulo,
          descripcion: form.value.descripcion,
          ubicacion: form.value.ubicacion || null,
          fotoUrl: form.value.fotoUrl || null,
          estado: 'Pendiente'
        };
        
        if (form.value.idOrganizacion) {
          datos.organizacion = { idOrganizacion: parseInt(form.value.idOrganizacion) };
        }
        
        if (form.value.idVeterinaria) {
          datos.veterinaria = { idVeterinaria: parseInt(form.value.idVeterinaria) };
        }
        
        await reporteService.create(datos);
        await alertaExito('Tu reporte ha sido enviado exitosamente', '¡Gracias por reportar!');
        router.push('/cliente/mis-reportes');
      } catch (error) {
        manejarErrorAPI(error);
      } finally {
        enviando.value = false;
      }
    };
    
    onMounted(() => cargarDatos());
    
    return {
      form,
      errores,
      enviando,
      organizaciones,
      veterinarias,
      crearReporte
    };
  }
}
</script>
