<template><div class="fade-in"><h2 class="mb-4"><i class="bi bi-file-medical me-2"></i>Registros Médicos</h2><Loading v-if="cargando"/><div v-else class="card"><div class="card-body"><div class="table-responsive"><table class="table table-hover"><thead><tr><th>Fecha</th><th>Animal</th><th>Tipo</th><th>Diagnóstico</th></tr></thead><tbody><tr v-for="r in registros" :key="r.idRegistroMedico"><td>{{ formatearFecha(r.fechaAtencion) }}</td><td>{{ r.animal.nombre }}</td><td><span class="badge bg-info">{{ r.tipoAtencion }}</span></td><td>{{ truncar(r.diagnostico,50) }}</td></tr></tbody></table></div></div></div></div></template>
<script>
import {ref,onMounted} from 'vue';
import {useAuthStore} from '../../stores/auth';
import Loading from '../../components/common/Loading.vue';
import registroMedicoService from '../../services/registroMedicoService';
import veterinariaService from '../../services/veterinariaService';
import {manejarErrorAPI} from '../../utils/alertas';
import {formatearFecha,truncar} from '../../utils/helpers';
export default{name:'VeterinariaRegistrosMedicos',components:{Loading},setup(){const authStore=useAuthStore();const cargando=ref(true);const registros=ref([]);const cargar=async()=>{try{const vet=await veterinariaService.getByUsuario(authStore.usuarioActual.idUsuario);const r=await registroMedicoService.getByVeterinaria(vet.data.idVeterinaria);registros.value=r.data;}catch(e){manejarErrorAPI(e);}finally{cargando.value=false;}};onMounted(()=>cargar());return{cargando,registros,formatearFecha,truncar};}}</script>
