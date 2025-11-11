<template>
	<div class="fade-in">
		<div class="d-flex justify-content-between align-items-center mb-4">
			<h2><i class="bi bi-hospital me-2"></i>Gestión de Veterinarias</h2>
			<div style="min-width:240px">
				<input class="form-control form-control-sm" placeholder="Buscar nombre o especialidad..." v-model="busqueda" />
			</div>
		</div>

		<Loading v-if="cargando" />

		<div v-else class="card">
			<div class="card-body">
				<div class="table-responsive">
					<table class="table table-hover">
						<thead>
							<tr>
								<th>Nombre</th>
								<th>Usuario</th>
								<th>Especialidad</th>
								<th>Teléfono</th>
								<th>Dirección</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="v in veterinariasPaginadas" :key="v.idVeterinaria">
								<td><i class="bi bi-hospital me-2"></i>{{ v.nombreClinica }}</td>
								<td>{{ nombreCompleto(v.usuario) }}</td>
								<td>{{ v.especialidad }}</td>
								<td>{{ v.telefono }}</td>
								<td>{{ truncar(v.direccion,40) }}</td>
							</tr>
							<tr v-if="veterinariasFiltradas.length === 0"><td colspan="5" class="text-center">No hay veterinarias</td></tr>
						</tbody>
					</table>
				</div>

				<div class="d-flex justify-content-between align-items-center mt-3">
					<small class="text-muted">Mostrando {{ veterinariasFiltradas.length }} resultados</small>
					<Pagination v-if="totalPaginas > 1" :pagina-actual="paginaActual" :total-paginas="totalPaginas" @cambiar-pagina="(p) => paginaActual = p" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import Loading from '../../components/common/Loading.vue';
import Pagination from '../../components/common/Pagination.vue';
import veterinariaService from '../../services/veterinariaService';
import { manejarErrorAPI } from '../../utils/alertas';
import { nombreCompleto, truncar } from '../../utils/helpers';

export default {
	name: 'AdminVeterinarias',
	components: { Loading, Pagination },
	setup() {
		const cargando = ref(true);
		const veterinarias = ref([]);
		const busqueda = ref('');
		const paginaActual = ref(1);
		const itemsPorPagina = 10;

		const cargar = async () => {
			try {
				const r = await veterinariaService.getAll();
				veterinarias.value = r.data || [];
			} catch (e) { manejarErrorAPI(e); } finally { cargando.value = false; }
		};

		const veterinariasFiltradas = computed(() => {
			const q = busqueda.value?.toLowerCase()?.trim();
			return veterinarias.value.filter(v => {
				if (!q) return true;
				return (v.nombreClinica || '').toLowerCase().includes(q) || (v.especialidad || '').toLowerCase().includes(q);
			});
		});

		const totalPaginas = computed(() => Math.max(1, Math.ceil(veterinariasFiltradas.value.length / itemsPorPagina)));
		const veterinariasPaginadas = computed(() => {
			const start = (paginaActual.value - 1) * itemsPorPagina;
			return veterinariasFiltradas.value.slice(start, start + itemsPorPagina);
		});

		onMounted(() => cargar());

		return { cargando, veterinarias, busqueda, paginaActual, itemsPorPagina, totalPaginas, veterinariasFiltradas, veterinariasPaginadas, nombreCompleto, truncar };
	}
}
</script>
