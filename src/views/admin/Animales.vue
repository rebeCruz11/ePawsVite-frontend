<template>
	<div class="fade-in">
		<div class="d-flex justify-content-between align-items-center mb-4">
			<h2><i class="bi bi-heart me-2"></i>Gestión de Animales</h2>
			<div style="min-width:240px">
				<input class="form-control form-control-sm" placeholder="Buscar nombre o especie..." v-model="busqueda" />
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
								<th>Especie</th>
								<th>Edad</th>
								<th>Sexo</th>
								<th>Estado</th>
								<th>Organización</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="a in animalesPaginados" :key="a.idAnimal">
								<td><i :class="`bi ${iconoPorEspecie(a.especie)} me-2`"></i>{{ a.nombre }}</td>
								<td>{{ a.especie }}</td>
								<td>{{ a.edad }} {{ a.unidadEdad }}</td>
								<td>{{ a.sexo }}</td>
								<td><span class="badge" :class="`bg-${colorPorEstado(a.estado)}`">{{ formatearEstado(a.estado) }}</span></td>
								<td>{{ a.organizacion?.nombreOrganizacion || 'N/A' }}</td>
							</tr>
							<tr v-if="animalesFiltrados.length === 0"><td colspan="6" class="text-center">No hay animales</td></tr>
						</tbody>
					</table>
				</div>
				<div class="d-flex justify-content-between align-items-center mt-3">
					<small class="text-muted">Mostrando {{ animalesFiltrados.length }} resultados</small>
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
import animalService from '../../services/animalService';
import { manejarErrorAPI } from '../../utils/alertas';
import { iconoPorEspecie, colorPorEstado, formatearEstado } from '../../utils/helpers';

export default {
	name: 'AdminAnimales',
	components: { Loading, Pagination },
	setup() {
		const cargando = ref(true);
		const animales = ref([]);
		const busqueda = ref('');
		const paginaActual = ref(1);
		const itemsPorPagina = 10;

		const cargar = async () => {
			try {
				const r = await animalService.getAll();
				animales.value = r.data || [];
			} catch (e) { manejarErrorAPI(e); } finally { cargando.value = false; }
		};

		const animalesFiltrados = computed(() => {
			const q = busqueda.value?.toLowerCase()?.trim();
			return animales.value.filter(a => {
				if (!q) return true;
				return (a.nombre || '').toLowerCase().includes(q) || (a.especie || '').toLowerCase().includes(q);
			});
		});

		const totalPaginas = computed(() => Math.max(1, Math.ceil(animalesFiltrados.value.length / itemsPorPagina)));
		const animalesPaginados = computed(() => {
			const start = (paginaActual.value - 1) * itemsPorPagina;
			return animalesFiltrados.value.slice(start, start + itemsPorPagina);
		});

		onMounted(() => cargar());

		return { cargando, animales, busqueda, paginaActual, itemsPorPagina, totalPaginas, animalesFiltrados, animalesPaginados, iconoPorEspecie, colorPorEstado, formatearEstado };
	}
}
</script>
