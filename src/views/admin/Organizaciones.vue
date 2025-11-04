<template><div class="fade-in"><h2 class="mb-4"><i class="bi bi-building me-2"></i>Gestión de Organizaciones</h2><Loading v-if="cargando"/><div v-else class="card"><div class="card-body"><div class="table-responsive"><table class="table table-hover"><thead><tr><th>Nombre</th><th>Usuario</th><th>Teléfono</th><th>Dirección</th></tr></thead><tbody><tr v-for="o in organizaciones" :key="o.idOrganizacion"><td><i class="bi bi-building me-2"></i>{{ o.nombreOrganizacion }}</td><td>{{ nombreCompleto(o.usuario) }}</td><td>{{ o.telefono }}</td><td>{{ truncar(o.direccion,40) }}</td></tr></tbody></table></div></div></div></div></template>
<script>
import {ref,onMounted} from 'vue';
import Loading from '../../components/common/Loading.vue';
import organizacionService from '../../services/organizacionService';
import {manejarErrorAPI} from '../../utils/alertas';
import {nombreCompleto,truncar} from '../../utils/helpers';
export default{name:'AdminOrganizaciones',components:{Loading},setup(){const cargando=ref(true);const organizaciones=ref([]);const cargar=async()=>{try{const r=await organizacionService.getAll();organizaciones.value=r.data;}catch(e){manejarErrorAPI(e);}finally{cargando.value=false;}};onMounted(()=>cargar());return{cargando,organizaciones,nombreCompleto,truncar};}}</script>
