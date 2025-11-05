<template>
  <div class="fade-in">
    <h2 class="mb-4"><i class="bi bi-flag me-2"></i>Reportes Asignados</h2>
    
    <Loading v-if="cargando" />
    
    <div v-else class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Título</th>
                <th>Reportado por</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Foto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reporte in reportes" :key="reporte.idReporte">
                <td>{{ formatearFecha(reporte.fechaReporte) }}</td>
                <td>{{ reporte.titulo }}</td>
                <td>{{ nombreCompleto(reporte.usuario) }}</td>
                <td>{{ reporte.ubicacion || 'N/A' }}</td>
                <td>
                  <span class="badge" :class="`bg-${colorPorEstado(reporte.estado)}`">
                    {{ formatearEstado(reporte.estado) }}
                  </span>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <button 
                      v-if="reporte.fotoUrl" 
                      class="btn btn-sm btn-info me-2"
                      @click="verFoto(reporte.fotoUrl)"
                    >
                      <i class="bi bi-image"></i>
                    </button>

                    <!-- Asignar veterinaria (solo si está pendiente) -->
                    <div v-if="reporte.estado === 'Pendiente'" class="d-flex">
                      <select class="form-select form-select-sm me-2" v-model="reporte._idVetSeleccionada">
                        <option value="">Seleccionar vet</option>
                        <option v-for="v in veterinarias" :key="v.idVeterinaria" :value="v.idVeterinaria">
                          {{ v.nombreClinica || (v.usuario && v.usuario.nombre) || ('Vet ' + v.idVeterinaria) }}
                        </option>
                      </select>
                      <button class="btn btn-sm btn-primary" @click="asignarVeterinaria(reporte, reporte._idVetSeleccionada)">Asignar</button>
                    </div>

                    <div v-else class="text-muted small">--</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import Loading from '../../components/common/Loading.vue';
import reporteService from '../../services/reporteService';
import organizacionService from '../../services/organizacionService';
import veterinariaService from '../../services/veterinariaService';
import { alertaHTML, manejarErrorAPI, alertaExito } from '../../utils/alertas';
import { colorPorEstado, formatearEstado, formatearFecha, nombreCompleto } from '../../utils/helpers';

export default {
  name: 'OrganizacionReportes',
  components: { Loading },
  setup() {
    const authStore = useAuthStore();
  const cargando = ref(true);
  const reportes = ref([]);
  const veterinarias = ref([]);
    
    const cargarReportes = async () => {
      try {
        const org = await organizacionService.getByUsuario(authStore.usuarioActual.idUsuario);
        const response = await reporteService.getByOrganizacion(org.data.idOrganizacion);
        reportes.value = response.data;

        // Cargar veterinarias para asignar
        const vets = await veterinariaService.getAll();
        veterinarias.value = vets.data || [];
      } catch (error) {
        manejarErrorAPI(error);
      } finally {
        cargando.value = false;
      }
    };

    const asignarVeterinaria = async (reporte, idVeterinaria) => {
      if (!idVeterinaria) return alertaHTML('Seleccione una veterinaria antes de asignar.', 'Error');
      try {
        // En el backend la relación es ManyToOne -> veterinaria, enviamos el objeto esperado
        await reporteService.update(reporte.idReporte, { veterinaria: { idVeterinaria: idVeterinaria } });
        alertaExito('Reporte asignado a la veterinaria. Quedará en estado Pendiente hasta que la veterinaria lo acepte.');
        // recargar
        await cargarReportes();
      } catch (error) {
        manejarErrorAPI(error);
      }
    };
    
    const verFoto = (url) => {
      alertaHTML(`<img src="${url}" class="img-fluid">`, 'Foto');
    };
    
    onMounted(() => cargarReportes());
    
    return {
      cargando, reportes, verFoto, veterinarias, asignarVeterinaria,
      colorPorEstado, formatearEstado, formatearFecha, nombreCompleto
    };
  }
}
</script>
