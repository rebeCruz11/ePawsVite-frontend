<template>
  <div class="fade-in">
    <h2 class="mb-4"><i class="bi bi-clipboard-check me-2"></i>Mis Adopciones</h2>
    
    <Loading v-if="cargando" />
    
    <div v-else>
      <div class="row g-4" v-if="adopciones.length > 0">
        <div class="col-md-6" v-for="adopcion in adopciones" :key="adopcion.idAdopcion">
          <div class="card">
            <div class="row g-0">
              <!-- Foto del animal -->
              <div class="col-md-5">
                <div 
                  v-if="obtenerFotoAnimal(adopcion.animal)" 
                  style="height: 100%; min-height: 250px; position: relative; overflow: hidden;"
                >
                  <img 
                    :src="obtenerFotoAnimal(adopcion.animal)" 
                    :alt="adopcion.animal.nombre"
                    style="width: 100%; height: 100%; object-fit: cover;"
                    @error="e => e.target.src = ''"
                  >
                </div>
                <div 
                  v-else
                  style="height: 100%; min-height: 250px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;"
                >
                  <i :class="`bi ${iconoPorEspecie(adopcion.animal.especie)} text-white`" style="font-size: 4rem;"></i>
                </div>
              </div>
              
              <!-- Información del animal -->
              <div class="col-md-7">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <h5 class="card-title">
                      <i :class="`bi ${iconoPorEspecie(adopcion.animal.especie)} me-2`"></i>
                      {{ adopcion.animal.nombre }}
                    </h5>
                    <span class="badge" :class="`bg-${colorPorEstado(adopcion.estado)}`">
                      {{ formatearEstado(adopcion.estado) }}
                    </span>
                  </div>
                  
                  <p class="text-muted mb-2">
                    <i class="bi bi-calendar me-1"></i>
                    Solicitud: {{ formatearFecha(adopcion.fechaSolicitud) }}
                  </p>
                  
                  <p class="mb-2">
                    <strong>Animal:</strong> {{ adopcion.animal.especie }} • {{ adopcion.animal.sexo }} • 
                    {{ adopcion.animal.edad }} {{ adopcion.animal.unidadEdad }}
                  </p>
                  
                  <p class="mb-2">
                    <strong>Organización:</strong> {{ adopcion.animal.organizacion?.nombreOrganizacion || 'N/A' }}
                  </p>
                  
                  <p v-if="adopcion.comentarios" class="mb-2">
                    <strong>Comentarios:</strong> {{ adopcion.comentarios }}
                  </p>
                  
                  <div v-if="adopcion.estado === 'Pendiente'" class="mt-3">
                    <button class="btn btn-sm btn-danger" @click="cancelarAdopcion(adopcion)">
                      <i class="bi bi-x-circle me-1"></i>
                      Cancelar Solicitud
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <i class="bi bi-inbox"></i>
        <p>No tienes solicitudes de adopción</p>
        <router-link to="/cliente/animales" class="btn btn-primary mt-3">
          <i class="bi bi-heart me-2"></i>
          Ver Animales Disponibles
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import Loading from '../../components/common/Loading.vue';
import adopcionService from '../../services/adopcionService';
import { confirmar, toast, manejarErrorAPI } from '../../utils/alertas';
import { iconoPorEspecie, colorPorEstado, formatearEstado, formatearFecha, obtenerFotoAnimal } from '../../utils/helpers';

export default {
  name: 'ClienteMisAdopciones',
  components: { Loading },
  setup() {
    const authStore = useAuthStore();
    const cargando = ref(true);
    const adopciones = ref([]);
    
    const cargarAdopciones = async () => {
      try {
        const response = await adopcionService.getByUsuario(authStore.usuarioActual.idUsuario);
        adopciones.value = response.data;
      } catch (error) {
        manejarErrorAPI(error);
      } finally {
        cargando.value = false;
      }
    };
    
    const cancelarAdopcion = async (adopcion) => {
      const result = await confirmar('¿Deseas cancelar esta solicitud de adopción?');
      if (result.isConfirmed) {
        try {
          await adopcionService.update(adopcion.idAdopcion, { ...adopcion, estado: 'Cancelada' });
          toast('Solicitud cancelada', 'success');
          await cargarAdopciones();
        } catch (error) {
          manejarErrorAPI(error);
        }
      }
    };
    
    onMounted(() => cargarAdopciones());
    
    return {
      cargando, adopciones, cancelarAdopcion,
      iconoPorEspecie, colorPorEstado, formatearEstado, formatearFecha, obtenerFotoAnimal
    };
  }
}
</script>
