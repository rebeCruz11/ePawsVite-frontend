<template>
	<div class="fade-in">
		<div class="d-flex justify-content-between align-items-center mb-4">
			<h2><i class="bi bi-file-medical me-2"></i>Registros Médicos</h2>
			<button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#nuevoRegistroModal">Nuevo Registro</button>
		</div>

		<Loading v-if="cargando" />

		<div v-else class="card">
			<div class="card-body">
				<div class="table-responsive">
					<table class="table table-hover">
						<thead>
							<tr>
								<th>Fecha</th>
								<th>Animal</th>
								<th>Tipo</th>
								<th>Diagnóstico</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="r in registros" :key="r.idRegistroMedico">
								<td>{{ formatearFecha(r.fechaAtencion) }}</td>
								<td>{{ r.animal.nombre }}</td>
								<td><span class="badge bg-info">{{ r.tipoAtencion }}</span></td>
								<td>{{ truncar(r.diagnostico,50) }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- Modal nuevo registro -->
		<div class="modal fade" id="nuevoRegistroModal" tabindex="-1" aria-hidden="true">
			<div class="modal-dialog modal-lg">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">Nuevo Registro Médico</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
					</div>
					<div class="modal-body">
						<form @submit.prevent="crearRegistro">
							<div class="row">
								<div class="col-md-6 mb-3">
									<label class="form-label">Animal</label>
									<select class="form-select" v-model="form.idAnimal">
										<option value="">Seleccione animal</option>
										<option v-for="a in animales" :key="a.idAnimal" :value="a.idAnimal">{{ a.nombre }} ({{ a.especie }})</option>
									</select>
								</div>

								<div class="col-md-6 mb-3">
									<label class="form-label">Tipo de visita</label>
									<select class="form-select" v-model="form.tipoAtencion">
										<option value="Consulta">Consulta</option>
										<option value="Tratamiento">Tratamiento</option>
										<option value="Alta">Alta</option>
										<option value="Vacunacion">Vacunacion</option>
									</select>
								</div>

								<div class="col-12 mb-3">
									<label class="form-label">Diagnóstico</label>
									<textarea class="form-control" v-model="form.diagnostico"></textarea>
								</div>

								<div class="col-12 mb-3">
									<label class="form-label">Tratamiento / Medicamentos</label>
									<textarea class="form-control" v-model="form.tratamiento"></textarea>
								</div>

								<div class="col-12 mb-3">
									<label class="form-label">Notas</label>
									<textarea class="form-control" v-model="form.notas"></textarea>
								</div>
							</div>
						</form>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
						<button type="button" class="btn btn-primary" @click="crearRegistro">Guardar</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import {ref,onMounted} from 'vue';
import {useAuthStore} from '../../stores/auth';
import Loading from '../../components/common/Loading.vue';
import registroMedicoService from '../../services/registroMedicoService';
import veterinariaService from '../../services/veterinariaService';
import animalService from '../../services/animalService';
import {manejarErrorAPI, alertaExito, alertaError} from '../../utils/alertas';
import {formatearFecha,truncar} from '../../utils/helpers';

export default{
	name:'VeterinariaRegistrosMedicos',
	components:{Loading},
	setup(){
		const authStore=useAuthStore();
		const cargando=ref(true);
		const registros=ref([]);
		const animales=ref([]);
		let vetId=null;

		const form = ref({ idAnimal:'', tipoAtencion:'Consulta', diagnostico:'', tratamiento:'', notas:'' });

		const cargar=async()=>{
			try{
				const vet=await veterinariaService.getByUsuario(authStore.usuarioActual.idUsuario);
				vetId=vet.data.idVeterinaria;
				const r=await registroMedicoService.getByVeterinaria(vetId);
				registros.value=r.data;

				// cargar animales (para seleccionar)
				const a = await animalService.getAll();
				animales.value = a.data || [];
			}catch(e){manejarErrorAPI(e);}finally{cargando.value=false;}
		};

		const crearRegistro = async () => {
			if (!form.value.idAnimal) return alertaError('Seleccione un animal');
			try {
				await registroMedicoService.create({
					id_animal: form.value.idAnimal,
					id_veterinaria: vetId,
					tipo_atencion: form.value.tipoAtencion,
					diagnostico: form.value.diagnostico,
					tratamiento: form.value.tratamiento,
					notas: form.value.notas
				});
				alertaExito('Registro médico creado correctamente');
				// cerrar modal
				const modalEl = document.getElementById('nuevoRegistroModal');
				const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
				modal.hide();
				// limpiar formulario y recargar
				form.value = { idAnimal:'', tipoAtencion:'Consulta', diagnostico:'', tratamiento:'', notas:'' };
				await cargar();
			} catch (e) { manejarErrorAPI(e); }
		};

		onMounted(()=>cargar());
		return{cargando,registros,form,animales,crearRegistro,formatearFecha,truncar};
	}
}
</script>
