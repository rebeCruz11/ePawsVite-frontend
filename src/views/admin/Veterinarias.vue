<template><div class="fade-in"><h2 class="mb-4"><i class="bi bi-hospital me-2"></i>Gestión de Veterinarias</h2><Loading v-if="cargando"/><div v-else class="card"><div class="card-body"><div class="table-responsive"><table class="table table-hover"><thead><tr><th>Nombre</th><th>Usuario</th><th>Especialidad</th><th>Teléfono</th><th>Dirección</th></tr></thead><tbody><tr v-for="v in veterinarias" :key="v.idVeterinaria"><td><i class="bi bi-hospital me-2"></i>{{ v.nombreClinica }}</td><td>{{ nombreCompleto(v.usuario) }}</td><td>{{ v.especialidad }}</td><td>{{ v.telefono }}</td><td>{{ truncar(v.direccion,40) }}</td></tr></tbody></table></div></div></div></div></template>
<script>
import {ref,onMounted} from 'vue';
import Loading from '../../components/common/Loading.vue';
import veterinariaService from '../../services/veterinariaService';
import {manejarErrorAPI} from '../../utils/alertas';
import {nombreCompleto,truncar} from '../../utils/helpers';
export default{name:'AdminVeterinarias',components:{Loading},setup(){const cargando=ref(true);const veterinarias=ref([]);const cargar=async()=>{try{const r=await veterinariaService.getAll();veterinarias.value=r.data;}catch(e){manejarErrorAPI(e);}finally{cargando.value=false;}};onMounted(()=>cargar());return{cargando,veterinarias,nombreCompleto,truncar};}}</script>
