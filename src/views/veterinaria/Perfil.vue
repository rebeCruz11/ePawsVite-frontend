<template><div class="fade-in"><h2 class="mb-4"><i class="bi bi-hospital me-2"></i>Mi Perfil</h2><Loading v-if="cargando"/><div v-else class="card"><div class="card-body p-4"><div class="row"><div class="col-md-3 text-center"><div class="avatar-lg bg-success mx-auto mb-3" style="width:120px;height:120px;font-size:3rem;">{{ iniciales }}</div></div><div class="col-md-9"><h3>{{ veterinaria.nombreClinica }}</h3><p class="text-muted mb-3">{{ veterinaria.especialidad }}</p><div class="row"><div class="col-md-6 mb-3"><strong>Responsable:</strong><p>{{ nombreCompleto(veterinaria.usuario) }}</p></div><div class="col-md-6 mb-3"><strong>Teléfono:</strong><p>{{ veterinaria.telefono }}</p></div><div class="col-12 mb-3"><strong>Dirección:</strong><p>{{ veterinaria.direccion }}</p></div></div></div></div></div></div></div></template>
<script>
import {ref,computed,onMounted} from 'vue';
import {useAuthStore} from '../../stores/auth';
import Loading from '../../components/common/Loading.vue';
import veterinariaService from '../../services/veterinariaService';
import {manejarErrorAPI} from '../../utils/alertas';
import {nombreCompleto} from '../../utils/helpers';
export default{name:'VeterinariaPerfil',components:{Loading},setup(){const authStore=useAuthStore();const cargando=ref(true);const veterinaria=ref(null);const iniciales=computed(()=>veterinaria.value?veterinaria.value.nombreClinica.substring(0,2).toUpperCase():'');const cargar=async()=>{try{const r=await veterinariaService.getByUsuario(authStore.usuarioActual.idUsuario);veterinaria.value=r.data;}catch(e){manejarErrorAPI(e);}finally{cargando.value=false;}};onMounted(()=>cargar());return{cargando,veterinaria,iniciales,nombreCompleto};}}</script>
