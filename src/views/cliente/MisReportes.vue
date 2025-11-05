<template>
  <div class="fade-in">
    <h2 class="mb-4"><i class="bi bi-flag-fill me-2"></i>Mis Reportes</h2>
    
    <Loading v-if="cargando" />
    
    <div v-else class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Título</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Asignado a</th>
                <th>Foto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reporte in reportes" :key="reporte.idReporte">
                <td>{{ formatearFechaHora(reporte.fechaReporte) }}</td>
                <td>{{ reporte.titulo }}</td>
                <td>{{ reporte.ubicacion || 'N/A' }}</td>
                <td>
                  <span class="badge" :class="`bg-${colorPorEstado(reporte.estado)}`">
                    {{ formatearEstado(reporte.estado) }}
                  </span>
                </td>
                <td>
                  <div v-if="reporte.organizacion">
                    <i class="bi bi-building me-1"></i>
                    {{ reporte.organizacion.nombreOrganizacion }}
                  </div>
                  <div v-if="reporte.veterinaria">
                    <i class="bi bi-hospital me-1"></i>
                    {{ reporte.veterinaria.nombreClinica }}
                  </div>
                  <span v-if="!reporte.organizacion && !reporte.veterinaria" class="text-muted">
                    Sin asignar
                  </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" @click="abrirModalEditar(reporte)">Editar</button>
                    <button class="btn btn-sm btn-primary" @click="verFoto(reporte.fotoUrl)">Ver</button>
                </td>
              </tr>
              <tr v-if="reportes.length === 0">
                <td colspan="6" class="text-center text-muted py-4">
                  <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                  No has creado reportes
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal editar reporte -->
  <div class="modal fade" id="editarReporteModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Editar Reporte</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <form @submit.prevent="guardarEdicion">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Título *</label>
              <input type="text" class="form-control" v-model="editForm.titulo" :class="{'is-invalid': editErrores.titulo}" required>
              <div class="invalid-feedback">{{ editErrores.titulo }}</div>
            </div>
            <div class="mb-3">
              <label class="form-label">Descripción *</label>
              <textarea class="form-control" v-model="editForm.descripcion" :class="{'is-invalid': editErrores.descripcion}" rows="4" required></textarea>
              <div class="invalid-feedback">{{ editErrores.descripcion }}</div>
            </div>
            <div class="mb-3">
              <label class="form-label">Ubicación</label>
              <input class="form-control" v-model="editForm.ubicacion">
            </div>
            <div class="mb-3">
              <label class="form-label">URL de Foto</label>
              <input class="form-control" v-model="editForm.fotoUrl" :class="{'is-invalid': editErrores.fotoUrl}">
              <div class="invalid-feedback">{{ editErrores.fotoUrl }}</div>
            </div>
            <div class="mb-3">
              <label class="form-label">Asignado a Organización</label>
              <select class="form-select" v-model="editForm.idOrganizacion">
                <option value="">Seleccione...</option>
                <option v-for="o in organizaciones" :key="o.idOrganizacion" :value="o.idOrganizacion">{{ o.nombreOrganizacion }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Asignado a Veterinaria</label>
              <select class="form-select" v-model="editForm.idVeterinaria">
                <option value="">Seleccione...</option>
                <option v-for="v in veterinarias" :key="v.idVeterinaria" :value="v.idVeterinaria">{{ v.nombreClinica }}</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn btn-primary">Guardar cambios</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import { useAuthStore } from '../../stores/auth';
import Loading from '../../components/common/Loading.vue';
import reporteService from '../../services/reporteService';
import organizacionService from '../../services/organizacionService';
import veterinariaService from '../../services/veterinariaService';
import { alertaHTML, alertaError, manejarErrorAPI, toast } from '../../utils/alertas';
import { validarReporte } from '../../utils/validaciones';
import { colorPorEstado, formatearEstado, formatearFechaHora } from '../../utils/helpers';

export default {
  name: 'ClienteMisReportes',
  components: { Loading },
  setup() {
    const authStore = useAuthStore();
    const cargando = ref(true);
    const reportes = ref([]);
    const organizaciones = ref([]);
    const veterinarias = ref([]);

    const editForm = ref({});
    const editErrores = ref({});
    let modal = null;
    
    const cargarReportes = async () => {
      try {
        const response = await reporteService.getByUsuario(authStore.usuarioActual.idUsuario);
        reportes.value = response.data;
      } catch (error) {
        manejarErrorAPI(error);
      } finally {
        cargando.value = false;
      }
    };
    
    const verFoto = (url) => {
      alertaHTML(`<img src="${url}" class="img-fluid" alt="Foto del reporte">`, 'Foto del Reporte');
    };

    const abrirModalEditar = (reporte) => {
      editForm.value = {
        idReporte: reporte.idReporte,
        titulo: reporte.titulo,
        descripcion: reporte.descripcion,
        ubicacion: reporte.ubicacion || '',
        fotoUrl: reporte.fotoUrl || '',
        idOrganizacion: reporte.organizacion?.idOrganizacion || '',
        idVeterinaria: reporte.veterinaria?.idVeterinaria || ''
      };
      editErrores.value = {};
      modal.show();
    };

    const guardarEdicion = async () => {
      const reporteObj = {
        ...editForm.value,
        usuario: { idUsuario: authStore.usuarioActual.idUsuario }
      };

      const erroresVal = validarReporte(reporteObj);
      if (Object.keys(erroresVal).length > 0) {
        const mensajes = Object.values(erroresVal).join('\n');
        await alertaError(mensajes, 'Errores en el formulario');
        editErrores.value = erroresVal;
        return;
      }

      try {
        const datos = {
          titulo: editForm.value.titulo,
          descripcion: editForm.value.descripcion,
          ubicacion: editForm.value.ubicacion || null,
          fotoUrl: editForm.value.fotoUrl || null,
          estado: 'Pendiente'
        };

        if (editForm.value.idOrganizacion) {
          datos.organizacion = { idOrganizacion: parseInt(editForm.value.idOrganizacion) };
        } else {
          datos.organizacion = null;
        }

        if (editForm.value.idVeterinaria) {
          datos.veterinaria = { idVeterinaria: parseInt(editForm.value.idVeterinaria) };
        } else {
          datos.veterinaria = null;
        }

        await reporteService.update(editForm.value.idReporte, datos);
        toast('Reporte actualizado', 'success');
        modal.hide();
        await cargarReportes();
      } catch (error) {
        manejarErrorAPI(error);
      }
    };
    
    onMounted(async () => {
      await cargarReportes();
      // cargar organizaciones y veterinarias para selects
      try {
        const [orgs, vets] = await Promise.all([
          organizacionService.getAll(),
          veterinariaService.getAll()
        ]);
        organizaciones.value = orgs.data;
        veterinarias.value = vets.data;
      } catch (e) {
        // no bloquear si falla
      }

      modal = new Modal(document.getElementById('editarReporteModal'));
    });
    
    return {
      cargando, reportes, verFoto,
      organizaciones, veterinarias,
      abrirModalEditar, editForm, editar: null, editErrores, guardarEdicion,
      colorPorEstado, formatearEstado, formatearFechaHora
    };
  }
}
</script>
