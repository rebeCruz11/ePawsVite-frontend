<template>
	<div class="fade-in">
		<div class="d-flex justify-content-between align-items-center mb-4">
			<h2><i class="bi bi-clipboard-check me-2"></i>Gestión de Adopciones</h2>
			<div style="min-width:240px">
				<input class="form-control form-control-sm" placeholder="Buscar solicitante o animal..." v-model="busqueda" />
			</div>
		</div>

		<Loading v-if="cargando" />

		<div v-else class="card">
			<div class="card-body">
				<div class="table-responsive">
					<table class="table table-hover">
						<thead>
							<tr>
								<th>Solicitante</th>
								<th>Animal</th>
								<th>Organización</th>
								<th>Fecha</th>
								<th>Estado</th>
								<th>Acciones</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="adopcion in adopcionesPaginadas" :key="adopcion.idAdopcion">
								<td>{{ nombreCompleto(adopcion.usuario) }}</td>
								<td>{{ adopcion.animal.nombre }} ({{ adopcion.animal.especie }})</td>
								<td>{{ adopcion.animal.organizacion?.nombreOrganizacion }}</td>
								<td>{{ formatearFecha(adopcion.fechaSolicitud) }}</td>
								<td><span class="badge" :class="`bg-${colorPorEstado(adopcion.estado)}`">{{ formatearEstado(adopcion.estado) }}</span></td>
								<td>
									<button v-if="adopcion.estado==='Pendiente'" class="btn btn-sm btn-success me-1" @click="cambiarEstado(adopcion,'Aprobada')"><i class="bi bi-check-circle"></i></button>
									<button v-if="adopcion.estado==='Pendiente'" class="btn btn-sm btn-danger" @click="cambiarEstado(adopcion,'Rechazada')"><i class="bi bi-x-circle"></i></button>
								</td>
							</tr>
							<tr v-if="adopcionesFiltradas.length === 0"><td colspan="6" class="text-center">No hay adopciones</td></tr>
						</tbody>
					</table>
				</div>
				<div class="d-flex justify-content-between align-items-center mt-3">
					<small class="text-muted">Mostrando {{ adopcionesFiltradas.length }} resultados</small>
					<Pagination v-if="totalPaginas > 1" :pagina-actual="paginaActual" :total-paginas="totalPaginas" @cambiar-pagina="(p) => paginaActual = p" />
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import {ref,onMounted,computed} from 'vue';
import Loading from '../../components/common/Loading.vue';
import Pagination from '../../components/common/Pagination.vue';
import adopcionService from '../../services/adopcionService';
import {toast,manejarErrorAPI} from '../../utils/alertas';
import {colorPorEstado,formatearEstado,formatearFecha,nombreCompleto} from '../../utils/helpers';
export default {
	name: 'AdminAdopciones',
	components: { Loading, Pagination },
	setup() {
		const cargando = ref(true);
		const adopciones = ref([]);
		const busqueda = ref('');
		const paginaActual = ref(1);
		const itemsPorPagina = 8;

		const cargar = async () => {
			try {
				const r = await adopcionService.getAll();
				adopciones.value = r.data || [];
			} catch (e) { manejarErrorAPI(e); } finally { cargando.value = false; }
		};

		const cambiarEstado = async (a, estado) => {
			try {
				await adopcionService.update(a.idAdopcion, { ...a, estado });
				toast(`Adopción ${estado.toLowerCase()}`, 'success');
				await cargar();
			} catch (e) { manejarErrorAPI(e); }
		};

		const adopcionesFiltradas = computed(() => {
			const q = busqueda.value?.toLowerCase()?.trim();
			return adopciones.value.filter(a => {
				if (!q) return true;
				const usuario = (a.usuario?.nombre + ' ' + a.usuario?.apellido).toLowerCase();
				const animal = (a.animal?.nombre + ' ' + (a.animal?.especie||'')).toLowerCase();
				return usuario.includes(q) || animal.includes(q);
			});
		});

		const totalPaginas = computed(() => Math.max(1, Math.ceil(adopcionesFiltradas.value.length / itemsPorPagina)));
		const adopcionesPaginadas = computed(() => {
			const start = (paginaActual.value - 1) * itemsPorPagina;
			return adopcionesFiltradas.value.slice(start, start + itemsPorPagina);
		});

		onMounted(() => cargar());

		return { cargando, adopciones, busqueda, paginaActual, itemsPorPagina, totalPaginas, adopcionesFiltradas, adopcionesPaginadas, cambiarEstado, colorPorEstado, formatearEstado, formatearFecha, nombreCompleto };
	}
}
</script>
