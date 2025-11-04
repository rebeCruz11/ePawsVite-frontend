<template><div class="fade-in"><h2 class="mb-4"><i class="bi bi-flag me-2"></i>Reportes Asignados</h2><Loading v-if="cargando"/><div v-else class="card"><div class="card-body"><div class="table-responsive"><table class="table table-hover"><thead><tr><th>Fecha</th><th>Título</th><th>Usuario</th><th>Estado</th></tr></thead><tbody><tr v-for="r in reportes" :key="r.idReporte"><td>{{ formatearFecha(r.fechaReporte) }}</td><td>{{ r.titulo }}</td><td>{{ nombreCompleto(r.usuario) }}</td><td><span class="badge" :class="`bg-${colorPorEstado(r.estado)}`">{{ formatearEstado(r.estado) }}</span></td></tr></tbody></table></div></div></div></div></template>
<script>
import {ref,onMounted} from 'vue';
import {useAuthStore} from '../../stores/auth';
import Loading from '../../components/common/Loading.vue';
import reporteService from '../../services/reporteService';
import veterinariaService from '../../services/veterinariaService';
import {manejarErrorAPI} from '../../utils/alertas';
import {colorPorEstado,formatearEstado,formatearFecha,nombreCompleto} from '../../utils/helpers';
export default{name:'VeterinariaReportes',components:{Loading},setup(){const authStore=useAuthStore();const cargando=ref(true);const reportes=ref([]);const cargar=async()=>{try{const vet=await veterinariaService.getByUsuario(authStore.usuarioActual.idUsuario);const r=await reporteService.getByVeterinaria(vet.data.idVeterinaria);reportes.value=r.data;}catch(e){manejarErrorAPI(e);}finally{cargando.value=false;}};onMounted(()=>cargar());return{cargando,reportes,colorPorEstado,formatearEstado,formatearFecha,nombreCompleto};}}</script>
