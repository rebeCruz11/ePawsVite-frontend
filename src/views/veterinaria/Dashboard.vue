<template><div class="fade-in"><h2 class="mb-4"><i class="bi bi-speedometer2 me-2"></i>Dashboard</h2><Loading v-if="cargando"/><div v-else><div class="row g-4 mb-4"><div class="col-md-6"><div class="card stat-card h-100"><div class="card-body"><h6 class="text-muted mb-2">Reportes Asignados</h6><h2 class="mb-0">{{ stats.reportes }}</h2></div></div></div><div class="col-md-6"><div class="card stat-card success h-100"><div class="card-body"><h6 class="text-muted mb-2">Registros Médicos</h6><h2 class="mb-0">{{ stats.registros }}</h2></div></div></div></div></div></div></template>
<script>
import {ref,onMounted} from 'vue';
import {useAuthStore} from '../../stores/auth';
import Loading from '../../components/common/Loading.vue';
import reporteService from '../../services/reporteService';
import registroMedicoService from '../../services/registroMedicoService';
import veterinariaService from '../../services/veterinariaService';
import {manejarErrorAPI} from '../../utils/alertas';
export default{name:'VeterinariaDashboard',components:{Loading},setup(){const authStore=useAuthStore();const cargando=ref(true);const stats=ref({reportes:0,registros:0});const cargar=async()=>{try{const vet=await veterinariaService.getByUsuario(authStore.usuarioActual.idUsuario);const [reportes,registros]=await Promise.all([reporteService.getByVeterinaria(vet.data.idVeterinaria),registroMedicoService.getByVeterinaria(vet.data.idVeterinaria)]);stats.value={reportes:reportes.data.length,registros:registros.data.length};}catch(e){manejarErrorAPI(e);}finally{cargando.value=false;}};onMounted(()=>cargar());return{cargando,stats};}}</script>
