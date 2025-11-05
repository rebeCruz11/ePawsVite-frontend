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
								<th>Usuario</th>
								<th>Estado</th>
								<th>Acciones</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="r in reportes" :key="r.idReporte">
								<td>{{ formatearFecha(r.fechaReporte) }}</td>
								<td>{{ r.titulo }}</td>
								<td>{{ nombreCompleto(r.usuario) }}</td>
								<td>
									<span class="badge" :class="`bg-${colorPorEstado(r.estado)}`">
										{{ r.estado === 'En proceso' ? 'Aceptada' : formatearEstado(r.estado) }}
									</span>
								</td>
								<td>
									<div class="d-flex">
										<button v-if="r.estado === 'Pendiente'" class="btn btn-sm btn-success me-2" @click="aceptarReporte(r)">
											<i class="bi bi-check"></i>
											<span class="ms-1">Aceptar</span>
										</button>

										<button v-if="r.estado === 'Pendiente'" class="btn btn-sm btn-danger" @click="rechazarReporte(r)">
											<i class="bi bi-x"></i>
											<span class="ms-1">Rechazar</span>
										</button>

										<button v-else-if="r.estado === 'En proceso'" class="btn btn-sm btn-secondary" disabled>
											<i class="bi bi-hourglass-split"></i>
											<span class="ms-1">Aceptada</span>
										</button>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>

	<!-- Adopciones pendientes -->
	<div class="fade-in mt-4">
		<h3 class="mb-3"><i class="bi bi-clipboard-check me-2"></i>Adopciones Pendientes</h3>

		<div class="card">
			<div class="card-body">
				<div class="table-responsive">
					<table class="table table-hover">
						<thead>
							<tr>
								<th>Fecha</th>
								<th>Animal</th>
								<th>Solicitante</th>
								<th>Estado</th>
								<th>Acciones</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="ad in adopciones" :key="ad.idAdopcion">
								<td>{{ formatearFecha(ad.fechaSolicitud) }}</td>
								<td>{{ ad.animal?.nombre || 'N/A' }}</td>
								<td>{{ nombreCompleto(ad.usuario) }}</td>
								<td><span class="badge" :class="`bg-${colorPorEstado(ad.estado)}`">{{ formatearEstado(ad.estado) }}</span></td>
								<td>
									<div class="d-flex">
										<button v-if="ad.estado === 'Pendiente'" class="btn btn-sm btn-success me-2" @click="aceptarAdopcion(ad)">Aceptar</button>
										<button v-if="ad.estado === 'Pendiente'" class="btn btn-sm btn-danger" @click="rechazarAdopcion(ad)">Rechazar</button>
										<button v-else class="btn btn-sm btn-secondary" disabled>Procesado</button>
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
import {ref,onMounted} from 'vue';
import {useAuthStore} from '../../stores/auth';
import Loading from '../../components/common/Loading.vue';
import reporteService from '../../services/reporteService';
import veterinariaService from '../../services/veterinariaService';
import adopcionService from '../../services/adopcionService';
import registroMedicoService from '../../services/registroMedicoService';
import animalService from '../../services/animalService';
import {manejarErrorAPI, alertaExito, alertaError, confirmar} from '../../utils/alertas';
import {colorPorEstado,formatearEstado,formatearFecha,nombreCompleto} from '../../utils/helpers';
export default{name:'VeterinariaReportes',components:{Loading},setup(){const authStore=useAuthStore();const cargando=ref(true);const reportes=ref([]);const adopciones=ref([]);let vetId=null;const cargar=async()=>{try{const vet=await veterinariaService.getByUsuario(authStore.usuarioActual.idUsuario);vetId=vet.data.idVeterinaria;const r=await reporteService.getByVeterinaria(vet.data.idVeterinaria);reportes.value=r.data;const a=await adopcionService.getByEstado('Pendiente');adopciones.value=a.data;}catch(e){manejarErrorAPI(e);}finally{cargando.value=false;}};

const aceptarReporte = async (reporte) => {
	try {
		await reporteService.update(reporte.idReporte, { estado: 'En proceso' });
		alertaExito('Reporte aceptado. Ahora está en proceso.');
		await cargar();
	} catch (e) { manejarErrorAPI(e); }
};

const rechazarReporte = async (reporte) => {
	try {
		const ok = await confirmar('¿Desea rechazar este reporte?');
		if (!ok) return;
		await reporteService.update(reporte.idReporte, { estado: 'Cerrado' });
		alertaExito('Reporte marcado como cerrado (rechazado).');
		await cargar();
	} catch (e) { manejarErrorAPI(e); }
};

// Aceptar adopcion: actualizar adopcion y crear registro medico inicial
const aceptarAdopcion = async (adopcion) => {
	try {
		// preparar objeto para actualizar - incluir procesadoPor con idUsuario
		const payload = {
			estado: 'Aprobada',
			procesadoPor: { idUsuario: authStore.usuarioActual.idUsuario }
		};
		await adopcionService.update(adopcion.idAdopcion, payload);

			// actualizar estado del animal a 'Adoptado' en backend (obtener objeto completo y actualizar)
			try {
				const animalResp = await animalService.getById(adopcion.animal.idAnimal);
				const animalData = animalResp.data || {};
				animalData.estado = 'Adoptado';
				await animalService.update(adopcion.animal.idAnimal, animalData);
			} catch (e) {
				// no detener el flujo por un fallo en actualizar el animal
				console.warn('No se pudo actualizar estado del animal a Adoptado:', e);
			}

			// crear registro médico inicial
			await registroMedicoService.create({
				id_animal: adopcion.animal.idAnimal,
				id_veterinaria: vetId,
				tipo_atencion: 'Consulta',
				diagnostico: 'Registro inicial tras aprobación de adopción',
				tratamiento: '',
				notas: ''
			});

		alertaExito('Adopción aprobada y registro médico inicial creado.');
		await cargar();
	} catch (e) { manejarErrorAPI(e); }
};

const rechazarAdopcion = async (adopcion) => {
	try {
		const ok = await confirmar('¿Desea rechazar esta adopción?');
		if (!ok) return;
		await adopcionService.update(adopcion.idAdopcion, { estado: 'Rechazada', procesadoPor: { idUsuario: authStore.usuarioActual.idUsuario } });
		alertaExito('Adopción rechazada.');
		await cargar();
	} catch (e) { manejarErrorAPI(e); }
};

onMounted(()=>cargar());
return{cargando,reportes,adopciones,aceptarReporte,rechazarReporte,aceptarAdopcion,rechazarAdopcion,colorPorEstado,formatearEstado,formatearFecha,nombreCompleto};}}
</script>
