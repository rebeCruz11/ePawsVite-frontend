<template>
  <div class="profile-page fade-in">
    <Loading v-if="cargando"/>

    <div v-else>
      <!-- Header -->
      <div class="profile-header">
        <div class="header-content">
          <div class="header-title">
            <i class="bi bi-hospital-fill"></i>
            <h2>Mi Perfil Veterinaria</h2>
          </div>
          <router-link :to="{ name: 'VeterinariaEditarPerfil' }" class="btn-edit">
            <i class="bi bi-pencil-fill"></i>
            <span>Editar Perfil</span>
          </router-link>
        </div>
      </div>

      <!-- Profile Card -->
      <div class="profile-card">
        <!-- Cover Banner -->
        <div class="profile-cover">
          <div class="cover-gradient"></div>
          <div class="cover-pattern"></div>
        </div>

        <!-- Main Content -->
        <div class="profile-content">
          <!-- Avatar Section -->
          <div class="profile-avatar-section">
            <div class="avatar-wrapper">
              <div class="avatar-large">
                {{ iniciales }}
              </div>
              <div class="avatar-badge">
                <i class="bi bi-patch-check-fill"></i>
              </div>
            </div>
          </div>

          <!-- Info Section -->
          <div class="profile-info-section">
            <div class="veterinaria-header">
              <div class="vet-name-wrapper">
                <h3 class="vet-name">{{ veterinaria.nombreClinica }}</h3>
                <span class="vet-badge">
                  <i class="bi bi-shield-check"></i>
                  Clínica Veterinaria Verificada
                </span>
              </div>
              <p class="vet-specialty">
                <i class="bi bi-clipboard2-pulse"></i>
                {{ veterinaria.especialidad || 'Atención General' }}
              </p>
            </div>

            <!-- Details Grid -->
            <div class="details-grid">
              <div class="detail-card">
                <div class="detail-icon primary">
                  <i class="bi bi-person-fill"></i>
                </div>
                <div class="detail-content">
                  <span class="detail-label">Responsable</span>
                  <span class="detail-value">{{ nombreCompleto(veterinaria.usuario) }}</span>
                </div>
              </div>

              <div class="detail-card">
                <div class="detail-icon success">
                  <i class="bi bi-envelope-fill"></i>
                </div>
                <div class="detail-content">
                  <span class="detail-label">Correo Electrónico</span>
                  <span class="detail-value">{{ veterinaria.usuario?.correo || 'No especificado' }}</span>
                </div>
              </div>

              <div class="detail-card">
                <div class="detail-icon info">
                  <i class="bi bi-telephone-fill"></i>
                </div>
                <div class="detail-content">
                  <span class="detail-label">Teléfono</span>
                  <span class="detail-value">{{ veterinaria.telefono || 'No especificado' }}</span>
                </div>
              </div>

              <div class="detail-card">
                <div class="detail-icon warning">
                  <i class="bi bi-geo-alt-fill"></i>
                </div>
                <div class="detail-content">
                  <span class="detail-label">Dirección</span>
                  <span class="detail-value">{{ veterinaria.direccion || 'No especificada' }}</span>
                </div>
              </div>
            </div>

            <!-- Stats Section -->
            <div class="stats-section">
              <div class="stat-item">
                <div class="stat-icon">
                  <i class="bi bi-file-medical-fill"></i>
                </div>
                <div class="stat-content">
                  <span class="stat-value">{{ stats.reportes }}</span>
                  <span class="stat-label">Reportes Asignados</span>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon">
                  <i class="bi bi-clipboard2-pulse-fill"></i>
                </div>
                <div class="stat-content">
                  <span class="stat-value">{{ stats.registros }}</span>
                  <span class="stat-label">Registros Médicos</span>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon">
                  <i class="bi bi-check-circle-fill"></i>
                </div>
                <div class="stat-content">
                  <span class="stat-value">{{ stats.cerrados }}</span>
                  <span class="stat-label">Casos Cerrados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import Loading from '../../components/common/Loading.vue';
import veterinariaService from '../../services/veterinariaService';
import reporteService from '../../services/reporteService';
import registroMedicoService from '../../services/registroMedicoService';
import { manejarErrorAPI } from '../../utils/alertas';
import { nombreCompleto } from '../../utils/helpers';

export default {
  name: 'VeterinariaPerfil',
  components: { Loading },
  setup() {
    const authStore = useAuthStore();
    const cargando = ref(true);
    const veterinaria = ref(null);
    const stats = ref({
      reportes: 0,
      registros: 0,
      cerrados: 0
    });
    
    const iniciales = computed(() => {
      if (!veterinaria.value) return '';
      return veterinaria.value.nombreClinica
        .split(' ')
        .map(word => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    });
    
    const cargar = async () => {
      try {
        const r = await veterinariaService.getByUsuario(authStore.usuarioActual.idUsuario);
        veterinaria.value = r.data;
        
        // Cargar estadísticas
        const vetId = r.data.idVeterinaria;
        
        try {
          const reportesResp = await reporteService.obtenerReportesPorVeterinaria(vetId);
          const reportesArr = Array.isArray(reportesResp) ? reportesResp : (reportesResp?.data || []);
          stats.value.reportes = reportesArr.length;
          stats.value.cerrados = reportesArr.filter(r => r.estado === 'Cerrado').length;
        } catch (e) {
          console.warn('Error al cargar reportes', e);
        }
        
        try {
          const registrosResp = await registroMedicoService.obtenerPorVeterinaria(vetId);
          const registrosArr = Array.isArray(registrosResp) ? registrosResp : (registrosResp?.data || []);
          stats.value.registros = registrosArr.length;
        } catch (e) {
          console.warn('Error al cargar registros', e);
        }
        
      } catch (e) {
        manejarErrorAPI(e);
      } finally {
        cargando.value = false;
      }
    };
    
    onMounted(() => cargar());
    
    return {
      cargando,
      veterinaria,
      iniciales,
      stats,
      nombreCompleto
    };
  }
}
</script>

<style scoped>
/* ============================================
   BASE & ANIMATIONS
   ============================================ */
.profile-page {
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
.profile-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-title i {
  font-size: 2rem;
  color: #28a745;
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

.btn-edit {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.75rem;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.btn-edit:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(40, 167, 69, 0.4);
  color: white;
}

/* ============================================
   PROFILE CARD
   ============================================ */
.profile-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

/* ============================================
   COVER BANNER
   ============================================ */
.profile-cover {
  height: 200px;
  position: relative;
  overflow: hidden;
}

.cover-gradient {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.cover-pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.4;
}

/* ============================================
   MAIN CONTENT
   ============================================ */
.profile-content {
  padding: 0 2.5rem 2.5rem;
  position: relative;
}

/* ============================================
   AVATAR SECTION
   ============================================ */
.profile-avatar-section {
  display: flex;
  justify-content: center;
  margin-top: -80px;
  margin-bottom: 2rem;
}

.avatar-wrapper {
  position: relative;
}

.avatar-large {
  width: 160px;
  height: 160px;
  border-radius: 24px;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  font-weight: 700;
  border: 6px solid white;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  animation: scaleIn 0.6s ease-out 0.2s backwards;
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.avatar-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.avatar-badge i {
  font-size: 1.5rem;
  color: #28a745;
}

/* ============================================
   INFO SECTION
   ============================================ */
.profile-info-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.veterinaria-header {
  text-align: center;
}

.vet-name-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.vet-name {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.vet-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(32, 201, 151, 0.1) 100%);
  color: #28a745;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.vet-specialty {
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
}

.vet-specialty i {
  color: #28a745;
}

/* ============================================
   DETAILS GRID
   ============================================ */
.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.detail-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.detail-card:hover {
  background: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  transform: translateY(-3px);
}

.detail-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.detail-icon.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.detail-icon.success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.detail-icon.info {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
}

.detail-icon.warning {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.detail-label {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 1rem;
  color: #1a1a1a;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ============================================
   STATS SECTION
   ============================================ */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(40, 167, 69, 0.05) 0%, rgba(32, 201, 151, 0.05) 100%);
  border-radius: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #28a745;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .btn-edit {
    width: 100%;
    justify-content: center;
  }
  
  .profile-cover {
    height: 150px;
  }
  
  .profile-content {
    padding: 0 1.5rem 1.5rem;
  }
  
  .profile-avatar-section {
    margin-top: -60px;
    margin-bottom: 1.5rem;
  }
  
  .avatar-large {
    width: 120px;
    height: 120px;
    font-size: 2.5rem;
  }
  
  .avatar-badge {
    width: 32px;
    height: 32px;
  }
  
  .avatar-badge i {
    font-size: 1.25rem;
  }
  
  .vet-name {
    font-size: 1.5rem;
  }
  
  .vet-specialty {
    font-size: 1rem;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
    padding: 1.5rem;
  }
}

@media (max-width: 576px) {
  .header-title i {
    font-size: 1.5rem;
  }
  
  .header-title h2 {
    font-size: 1.5rem;
  }
  
  .detail-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
}
</style>
