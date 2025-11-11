<template>
	<div class="vets-page fade-in">
		<Loading v-if="cargando" />

		<div v-else>
			<!-- Header -->
			<div class="page-header">
				<div class="header-content">
					<div class="header-title">
						<div class="title-icon">
							<i class="bi bi-heart-pulse-fill"></i>
						</div>
						<div>
							<h2>Gestion de Veterinarias</h2>
							<p class="text-muted mb-0">Administra todas las clinicas veterinarias del sistema</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Stats -->
			<div class="vets-stats mb-4">
				<div class="stat-badge">
					<i class="bi bi-hospital-fill"></i>
					<span>{{ veterinarias.length }} Veterinarias registradas</span>
				</div>
			</div>

			<!-- Filtros -->
			<div class="filters-card">
				<div class="filters-content">
					<div class="filter-group">
						<label class="filter-label">
							<i class="bi bi-search"></i>
							Buscar
						</label>
						<input 
							type="text" 
							class="filter-input" 
							v-model="busqueda"
							placeholder="Nombre, especialidad..."
						>
					</div>
					<button class="btn-clear-filters" @click="busqueda = ''" v-if="busqueda">
						<i class="bi bi-x-circle"></i>
						<span>Limpiar</span>
					</button>
				</div>
			</div>

			<!-- Tabla -->
			<div class="table-card">
				<div class="table-responsive">
					<table class="modern-table">
						<thead>
							<tr>
								<th>Clinica</th>
								<th>Responsable</th>
								<th>Especialidad</th>
								<th>Contacto</th>
								<th>Direccion</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="v in veterinariasPaginadas" :key="v.idVeterinaria" class="table-row-hover">
								<td>
									<div class="vet-cell">
										<div class="vet-icon">
											<i class="bi bi-hospital-fill"></i>
										</div>
										<div class="vet-info">
											<div class="vet-name">{{ v.nombreClinica }}</div>
											<div class="vet-id">ID: {{ v.idVeterinaria }}</div>
										</div>
									</div>
								</td>
								<td>
									<div class="user-cell">
										<i class="bi bi-person-circle"></i>
										<span>{{ nombreCompleto(v.usuario) }}</span>
									</div>
								</td>
								<td>
									<span class="specialty-badge">
										<i class="bi bi-heart-pulse"></i>
										{{ v.especialidad }}
									</span>
								</td>
								<td>
									<div class="contact-cell">
										<i class="bi bi-telephone-fill"></i>
										<span>{{ v.telefono }}</span>
									</div>
								</td>
								<td>
									<div class="address-cell" :title="v.direccion">
										<i class="bi bi-geo-alt-fill"></i>
										<span>{{ truncar(v.direccion, 40) }}</span>
									</div>
								</td>
							</tr>
							<tr v-if="veterinariasFiltradas.length === 0">
								<td colspan="5" class="empty-state">
									<div class="empty-content">
										<i class="bi bi-inbox"></i>
										<p>No se encontraron veterinarias</p>
										<small>Intenta ajustar los filtros</small>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div class="table-footer">
					<small class="text-muted">Mostrando {{ veterinariasPaginadas.length }} de {{ veterinariasFiltradas.length }} resultados</small>
					<Pagination 
						v-if="totalPaginas > 1" 
						:pagina-actual="paginaActual" 
						:total-paginas="totalPaginas" 
						@cambiar-pagina="(p) => paginaActual = p" 
					/>
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

<style scoped>
.vets-page {
	animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
	from { opacity: 0; transform: translateY(20px); }
	to { opacity: 1; transform: translateY(0); }
}

.page-header {
	background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
	border-radius: 20px;
	padding: 2rem;
	margin-bottom: 2rem;
	box-shadow: 0 10px 40px rgba(40, 167, 69, 0.25);
}

.header-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1.5rem;
	flex-wrap: wrap;
}

.header-title {
	display: flex;
	align-items: center;
	gap: 1.25rem;
}

.title-icon {
	width: 60px;
	height: 60px;
	border-radius: 16px;
	background: rgba(255, 255, 255, 0.2);
	backdrop-filter: blur(10px);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.75rem;
	color: white;
}

.header-title h2 {
	color: white;
	margin: 0;
	font-weight: 700;
}

.header-title p {
	color: rgba(255, 255, 255, 0.9);
}

.vets-stats {
	display: flex;
	gap: 1rem;
	flex-wrap: wrap;
}

.stat-badge {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.75rem 1.25rem;
	background: white;
	border-radius: 12px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
	font-weight: 600;
	color: #28a745;
	transition: all 0.3s ease;
}

.stat-badge:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.stat-badge i {
	font-size: 1.25rem;
}

.filters-card {
	background: white;
	border-radius: 20px;
	padding: 1.5rem;
	margin-bottom: 2rem;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.filters-content {
	display: flex;
	gap: 1.5rem;
	flex-wrap: wrap;
	align-items: flex-end;
}

.filter-group {
	flex: 1;
	min-width: 250px;
}

.filter-label {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-weight: 600;
	color: #1a1a1a;
	margin-bottom: 0.5rem;
	font-size: 0.9rem;
}

.filter-label i {
	color: #28a745;
}

.filter-input {
	width: 100%;
	padding: 0.75rem 1rem;
	border: 2px solid #e9ecef;
	border-radius: 12px;
	font-size: 0.95rem;
	transition: all 0.3s ease;
	background: #f8f9fa;
}

.filter-input:focus {
	outline: none;
	border-color: #28a745;
	background: white;
	box-shadow: 0 0 0 4px rgba(40, 167, 69, 0.1);
}

.btn-clear-filters {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.75rem 1.5rem;
	background: #f8f9fa;
	color: #6c757d;
	border: 2px solid #e9ecef;
	border-radius: 12px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s ease;
	white-space: nowrap;
}

.btn-clear-filters:hover {
	background: #e9ecef;
	border-color: #dee2e6;
	color: #495057;
}

.table-card {
	background: white;
	border-radius: 20px;
	padding: 1.5rem;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.modern-table {
	width: 100%;
	border-collapse: separate;
	border-spacing: 0;
}

.modern-table thead {
	background: linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(32, 201, 151, 0.1) 100%);
}

.modern-table thead th {
	padding: 1rem;
	font-weight: 700;
	color: #1a1a1a;
	text-transform: uppercase;
	font-size: 0.75rem;
	letter-spacing: 0.5px;
	border: none;
}

.modern-table thead th:first-child {
	border-top-left-radius: 12px;
}

.modern-table thead th:last-child {
	border-top-right-radius: 12px;
}

.modern-table tbody tr {
	border-bottom: 1px solid #f1f3f5;
	transition: all 0.3s ease;
}

.table-row-hover:hover {
	background: #f8f9fa;
	transform: scale(1.01);
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.modern-table tbody td {
	padding: 1.25rem 1rem;
	vertical-align: middle;
	border: none;
}

.vet-cell {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.vet-icon {
	width: 48px;
	height: 48px;
	border-radius: 12px;
	background: linear-gradient(135deg, rgba(40, 167, 69, 0.1), rgba(32, 201, 151, 0.1));
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.5rem;
	color: #28a745;
	flex-shrink: 0;
}

.vet-info {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.vet-name {
	font-weight: 600;
	color: #1a1a1a;
	font-size: 0.95rem;
}

.vet-id {
	font-size: 0.75rem;
	color: #6c757d;
}

.specialty-badge {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 1rem;
	background: rgba(40, 167, 69, 0.1);
	color: #28a745;
	border-radius: 10px;
	font-weight: 600;
	font-size: 0.85rem;
}

.user-cell,
.contact-cell,
.address-cell {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	color: #495057;
	font-size: 0.9rem;
}

.user-cell i,
.contact-cell i,
.address-cell i {
	color: #6c757d;
	font-size: 1rem;
}

.empty-state {
	padding: 4rem 2rem;
	text-align: center;
}

.empty-content {
	color: #6c757d;
}

.empty-content i {
	font-size: 4rem;
	opacity: 0.3;
	margin-bottom: 1rem;
}

.empty-content p {
	font-size: 1.1rem;
	font-weight: 600;
	margin-bottom: 0.5rem;
}

.empty-content small {
	font-size: 0.875rem;
	opacity: 0.7;
}

.table-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 1.5rem;
	padding-top: 1.5rem;
	border-top: 2px solid #f1f3f5;
}

@media (max-width: 768px) {
	.header-content {
		flex-direction: column;
		align-items: stretch;
	}
	
	.filters-content {
		flex-direction: column;
	}
	
	.filter-group {
		min-width: 100%;
	}
	
	.modern-table {
		font-size: 0.85rem;
	}
	
	.vet-icon {
		width: 40px;
		height: 40px;
		font-size: 1.25rem;
	}
	
	.table-footer {
		flex-direction: column;
		gap: 1rem;
		align-items: flex-start;
	}
}
</style>