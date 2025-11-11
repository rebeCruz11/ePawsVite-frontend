<template><div class="fade-in"><h2 class="mb-4"><i class="bi bi-speedometer2 me-2"></i>Dashboard</h2><Loading v-if="cargando"/><div v-else><div class="row g-4 mb-4"><div class="col-md-6"><div class="card stat-card h-100"><div class="card-body"><h6 class="text-muted mb-2">Reportes Asignados</h6><h2 class="mb-0">{{ stats.reportes }}</h2></div></div></div><div class="col-md-6"><div class="card stat-card success h-100"><div class="card-body"><h6 class="text-muted mb-2">Registros Médicos</h6><h2 class="mb-0">{{ stats.registros }}</h2></div></div></div></div></div></div></template>
<script>
import {ref,onMounted} from 'vue';
import { useRouter } from 'vue-router';
import {useAuthStore} from '../../stores/auth';
import Loading from '../../components/common/Loading.vue';
import reporteService from '../../services/reporteService';
import registroMedicoService from '../../services/registroMedicoService';
import veterinariaService from '../../services/veterinariaService';
import {manejarErrorAPI} from '../../utils/alertas';

export default{
	name:'VeterinariaDashboard',
	components:{Loading},
	setup(){
		const authStore=useAuthStore();
		const router = useRouter();
		const cargando=ref(true);
		const stats=ref({reportes:0,registros:0});

		const cargar=async()=>{
			try{
				let vetId = authStore.user?.veterinaria?.idVeterinaria || null;
				if(!vetId && authStore.usuarioActual?.idUsuario){
					try{
						const vet=await veterinariaService.getByUsuario(authStore.usuarioActual.idUsuario);
						vetId = vet?.data?.idVeterinaria || null;
					}catch(e){ console.warn('No se pudo obtener veterinaria', e); }
				}
				if(!vetId){
					cargando.value=false;
					setTimeout(()=>{ router.push({ name:'VeterinariaPerfil'}); },600);
					return;
				}
				let reportesResp, registrosResp;
				try{ reportesResp = await reporteService.obtenerReportesPorVeterinaria(vetId); }
				catch(e){ const legacy = await reporteService.getByVeterinaria(vetId); reportesResp = legacy?.data || []; }
				try{ registrosResp = await registroMedicoService.obtenerPorVeterinaria(vetId); }
				catch(e){ const legacy = await registroMedicoService.getByVeterinaria(vetId); registrosResp = legacy?.data || []; }

				const reportesArr = Array.isArray(reportesResp)?reportesResp:(reportesResp?.data||[]);
				const registrosArr = Array.isArray(registrosResp)?registrosResp:(registrosResp?.data||[]);
				stats.value={reportes:reportesArr.length,registros:registrosArr.length};
			}catch(e){
				manejarErrorAPI(e);
			}finally{
				cargando.value=false;
			}
		};
		onMounted(()=>cargar());
		return{cargando,stats};
	}
}
</script>
