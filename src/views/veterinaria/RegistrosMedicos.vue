<template>
	<div class="fade-in">
		<div class="d-flex justify-content-between align-items-center mb-4">
			<h2><i class="bi bi-file-medical me-2"></i>Registros Médicos</h2>
		</div>

		<Loading v-if="cargando" />

		<div v-else>
			<!-- Filtros -->
			<div class="card mb-3">
				<div class="card-body">
					<div class="row g-3">
						<div class="col-md-4">
							<label class="form-label">Buscar Animal</label>
							<input 
								type="text" 
								class="form-control" 
								v-model="filtros.busqueda"
								placeholder="Nombre del animal..."
							/>
						</div>
						<div class="col-md-3">
							<label class="form-label">Tipo de Atención</label>
							<select class="form-select" v-model="filtros.tipoAtencion">
								<option value="">Todos</option>
								<option value="Consulta">Examen Inicial</option>
								<option value="Tratamiento">Tratamiento</option>
								<option value="Alta">Alta Médica</option>
								<option value="Vacunacion">Vacunación</option>
							</select>
						</div>
						<div class="col-md-3">
							<label class="form-label">Desde</label>
							<input 
								type="date" 
								class="form-control" 
								v-model="filtros.fechaDesde"
							/>
						</div>
						<div class="col-md-2 d-flex align-items-end">
							<button class="btn btn-secondary w-100" @click="limpiarFiltros">
								<i class="bi bi-x-circle"></i> Limpiar
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Tabla -->
			<div class="card shadow-sm">
				<div class="card-body">
					<div class="table-responsive">
						<table class="table table-hover align-middle">
							<thead>
								<tr>
									<th>Fecha</th>
									<th>Animal</th>
									<th>Tipo</th>
									<th>Diagnóstico</th>
									<th>Tratamiento</th>
									<th>Notas</th>
									<th>Acciones</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="r in registrosFiltrados" :key="r.idRegistroMedico">
									<td>{{ formatearFecha(r.fechaAtencion) }}</td>
									<td>
										<strong>{{ r.animal?.nombre || 'N/A' }}</strong><br>
										<small class="text-muted">{{ r.animal?.especie }}</small>
									</td>
									<td>
										<span class="badge" :class="badgeTipo(r.tipoAtencion)">
											{{ formatearTipo(r.tipoAtencion) }}
										</span>
									</td>
									<td>{{ truncar(r.diagnostico, 40) }}</td>
									<td>{{ truncar(r.tratamiento, 40) }}</td>
									<td>{{ truncar(r.notas, 30) || '--' }}</td>
									<td>
										<button 
											class="btn btn-sm btn-info" 
											@click="verDetalle(r)"
										>
											<i class="bi bi-eye"></i> Ver
										</button>
									</td>
								</tr>
								<tr v-if="registrosFiltrados.length === 0">
									<td colspan="7" class="text-center py-3">
										No se encontraron registros médicos
									</td>
								</tr>
							</tbody>
						</table>
					</div>
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

  <!-- Modal ver detalle -->
  <div class="modal fade" id="detalleRegistroModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-clipboard-pulse me-2"></i>
            Detalle del Registro Médico
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" v-if="registroDetalle">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label fw-bold">Animal</label>
              <p>{{ registroDetalle.animal?.nombre }} ({{ registroDetalle.animal?.especie }})</p>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label fw-bold">Fecha de Atención</label>
              <p>{{ formatearFecha(registroDetalle.fechaAtencion) }}</p>
            </div>
            <div class="col-12 mb-3">
              <label class="form-label fw-bold">Tipo de Atención</label>
              <p>
                <span class="badge" :class="badgeTipo(registroDetalle.tipoAtencion)">
                  {{ formatearTipo(registroDetalle.tipoAtencion) }}
                </span>
              </p>
            </div>
            <div class="col-12 mb-3">
              <label class="form-label fw-bold">Diagnóstico</label>
              <p class="border p-2 bg-light rounded">{{ registroDetalle.diagnostico }}</p>
            </div>
            <div class="col-12 mb-3">
              <label class="form-label fw-bold">Tratamiento / Medicamentos</label>
              <p class="border p-2 bg-light rounded">{{ registroDetalle.tratamiento }}</p>
            </div>
            <div class="col-12 mb-3" v-if="registroDetalle.notas">
              <label class="form-label fw-bold">Notas Adicionales</label>
              <p class="border p-2 bg-light rounded">{{ registroDetalle.notas }}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ref, computed, onMounted} from 'vue';
import { useRouter } from 'vue-router';
import {useAuthStore} from '../../stores/auth';
import Loading from '../../components/common/Loading.vue';
import registroMedicoService from '../../services/registroMedicoService';
import veterinariaService from '../../services/veterinariaService';
import animalService from '../../services/animalService';
import {manejarErrorAPI, alertaExito, alertaError} from '../../utils/alertas';
import {formatearFecha,truncar} from '../../utils/helpers';
import { Modal } from 'bootstrap';

export default{
	name:'VeterinariaRegistrosMedicos',
	components:{Loading},
	setup(){
		const authStore=useAuthStore();
		const router = useRouter();
		const cargando=ref(true);
		const registros=ref([]);
		const animales=ref([]);
		const registroDetalle = ref(null);
		let vetId=null;
		let modalDetalle = null;

		const form = ref({ idAnimal:'', tipoAtencion:'Consulta', diagnostico:'', tratamiento:'', notas:'' });

		const filtros = ref({
			busqueda: '',
			tipoAtencion: '',
			fechaDesde: ''
		});

		const registrosFiltrados = computed(() => {
			let resultado = [...registros.value];
			
			// Filtrar por búsqueda
			if (filtros.value.busqueda) {
				const busq = filtros.value.busqueda.toLowerCase();
				resultado = resultado.filter(r => 
					r.animal?.nombre?.toLowerCase().includes(busq)
				);
			}
			
			// Filtrar por tipo
			if (filtros.value.tipoAtencion) {
				resultado = resultado.filter(r => r.tipoAtencion === filtros.value.tipoAtencion);
			}
			
			// Filtrar por fecha
			if (filtros.value.fechaDesde) {
				resultado = resultado.filter(r => {
					const fechaRegistro = new Date(r.fechaAtencion);
					const fechaFiltro = new Date(filtros.value.fechaDesde);
					return fechaRegistro >= fechaFiltro;
				});
			}
			
			return resultado;
		});

		const cargar=async()=>{
			try{
				// Obtener id de veterinaria desde user si existe
				vetId = authStore.user?.veterinaria?.idVeterinaria || null;

				if(!vetId && authStore.usuarioActual?.idUsuario){
					try {
						const vet = await veterinariaService.getByUsuario(authStore.usuarioActual.idUsuario);
						vetId = vet?.data?.idVeterinaria || null;
					} catch(e){
						console.warn('No se pudo obtener veterinaria por usuario', e);
					}
				}

				if(!vetId){
					alertaError('Debe completar los datos de su clínica antes de ver registros médicos');
					setTimeout(()=>{ router.push({ name:'VeterinariaPerfil'}); },800);
					registros.value = [];
					return;
				}

				let r;
				try {
					r = await registroMedicoService.obtenerPorVeterinaria(vetId);
					registros.value = Array.isArray(r) ? r : (r?.data || []);
				} catch(e){
					const legacy = await registroMedicoService.getByVeterinaria(vetId);
					registros.value = legacy?.data || [];
				}

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

		const verDetalle = (registro) => {
			registroDetalle.value = registro;
			if (!modalDetalle) {
				const modalEl = document.getElementById('detalleRegistroModal');
				modalDetalle = new Modal(modalEl);
			}
			modalDetalle.show();
		};

		const limpiarFiltros = () => {
			filtros.value = {
				busqueda: '',
				tipoAtencion: '',
				fechaDesde: ''
			};
		};

		const formatearTipo = (tipo) => {
			const tipos = {
				'Consulta': 'Examen Inicial',
				'Tratamiento': 'Tratamiento',
				'Alta': 'Alta Médica',
				'Vacunacion': 'Vacunación'
			};
			return tipos[tipo] || tipo;
		};

		const badgeTipo = (tipo) => {
			const badges = {
				'Consulta': 'bg-info',
				'Tratamiento': 'bg-warning',
				'Alta': 'bg-success',
				'Vacunacion': 'bg-primary'
			};
			return badges[tipo] || 'bg-secondary';
		};

			onMounted(() => cargar());
		
		return {
			cargando,
			registros,
			registrosFiltrados,
			registroDetalle,
			form,
			animales,
			filtros,
			crearRegistro,
			verDetalle,
			limpiarFiltros,
			formatearFecha,
			formatearTipo,
			badgeTipo,
			truncar
		};
	}
}
</script>
