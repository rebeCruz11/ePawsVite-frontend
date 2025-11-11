<template>
	<div class="fade-in">
		<div class="d-flex justify-content-between align-items-center mb-4">
			<h2><i class="bi bi-building me-2"></i>Gestión de Organizaciones</h2>
			<div style="min-width:240px">
				<input class="form-control form-control-sm" placeholder="Buscar organización..." v-model="busqueda" />
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
								<th>Teléfono</th>
								<th>Dirección</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="o in organizacionesPaginadas" :key="o.idOrganizacion">
								<td><i class="bi bi-building me-2"></i>{{ o.nombreOrganizacion }}</td>
								<td>{{ nombreCompleto(o.usuario) }}</td>
								<td>{{ o.telefono }}</td>
								<td>{{ truncar(o.direccion,40) }}</td>
							</tr>
							<tr v-if="organizacionesFiltradas.length === 0"><td colspan="4" class="text-center">No hay organizaciones</td></tr>
						</tbody>
					</table>
				</div>
				<div class="d-flex justify-content-between align-items-center mt-3">
					<small class="text-muted">Mostrando {{ organizacionesFiltradas.length }} resultados</small>
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
import organizacionService from '../../services/organizacionService';
import { manejarErrorAPI } from '../../utils/alertas';
import { nombreCompleto, truncar } from '../../utils/helpers';

export default {
	name: 'AdminOrganizaciones',
	components: { Loading, Pagination },
	setup() {
		const cargando = ref(true);
		const organizaciones = ref([]);
		const busqueda = ref('');
		const paginaActual = ref(1);
		const itemsPorPagina = 10;

		const cargar = async () => {
			try { const r = await organizacionService.getAll(); organizaciones.value = r.data || []; } catch (e) { manejarErrorAPI(e); } finally { cargando.value = false; }
		};

		const organizacionesFiltradas = computed(() => {
			const q = busqueda.value?.toLowerCase()?.trim();
			return organizaciones.value.filter(o => {
				if (!q) return true;
				return (o.nombreOrganizacion || '').toLowerCase().includes(q);
			});
		});

		const totalPaginas = computed(() => Math.max(1, Math.ceil(organizacionesFiltradas.value.length / itemsPorPagina)));
		const organizacionesPaginadas = computed(() => {
			const start = (paginaActual.value - 1) * itemsPorPagina;
			return organizacionesFiltradas.value.slice(start, start + itemsPorPagina);
		});

		onMounted(() => cargar());

		return { cargando, organizaciones, busqueda, paginaActual, itemsPorPagina, totalPaginas, organizacionesFiltradas, organizacionesPaginadas, nombreCompleto, truncar };
	}
}
</script>
