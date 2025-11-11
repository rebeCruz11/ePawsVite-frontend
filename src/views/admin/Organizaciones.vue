<template>
	<div class="orgs-page fade-in">
		<Loading v-if="cargando" />

		<div v-else>
			<!-- Header -->
			<div class="page-header">
				<div class="header-content">
					<div class="header-title">
						<div class="title-icon">
							<i class="bi bi-building-fill"></i>
						</div>
						<div>
							<h2>Gestion de Organizaciones</h2>
							<p class="text-muted mb-0">Administra todas las organizaciones de rescate</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Stats -->
			<div class="orgs-stats mb-4">
				<div class="stat-badge">
					<i class="bi bi-building-fill"></i>
					<span>{{ organizaciones.length }} Organizaciones registradas</span>
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
							placeholder="Nombre de organizacion..."
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
								<th>Organizacion</th>
								<th>Responsable</th>
								<th>Contacto</th>
								<th>Direccion</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="o in organizacionesPaginadas" :key="o.idOrganizacion" class="table-row-hover">
								<td>
									<div class="org-cell">
										<div class="org-icon">
											<i class="bi bi-building-fill"></i>
										</div>
										<div class="org-info">
											<div class="org-name">{{ o.nombreOrganizacion }}</div>
											<div class="org-id">ID: {{ o.idOrganizacion }}</div>
										</div>
									</div>
								</td>
								<td>
									<div class="user-cell">
										<i class="bi bi-person-circle"></i>
										<span>{{ nombreCompleto(o.usuario) }}</span>
									</div>
								</td>
								<td>
									<div class="contact-cell">
										<i class="bi bi-telephone-fill"></i>
										<span>{{ o.telefono }}</span>
									</div>
								</td>
								<td>
									<div class="address-cell" :title="o.direccion">
										<i class="bi bi-geo-alt-fill"></i>
										<span>{{ truncar(o.direccion, 40) }}</span>
									</div>
								</td>
							</tr>
							<tr v-if="organizacionesFiltradas.length === 0">
								<td colspan="4" class="empty-state">
									<div class="empty-content">
										<i class="bi bi-inbox"></i>
										<p>No se encontraron organizaciones</p>
										<small>Intenta ajustar los filtros</small>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				
				<div class="table-footer">
					<small class="text-muted">Mostrando {{ organizacionesPaginadas.length }} de {{ organizacionesFiltradas.length }} resultados</small>
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

<style scoped>
.orgs-page {
	animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
	from { opacity: 0; transform: translateY(20px); }
	to { opacity: 1; transform: translateY(0); }
}

.page-header {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 20px;
	padding: 2rem;
	margin-bottom: 2rem;
	box-shadow: 0 10px 40px rgba(102, 126, 234, 0.25);
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

.orgs-stats {
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
	color: #667eea;
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
	color: #667eea;
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
	border-color: #667eea;
	background: white;
	box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
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
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
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

.org-cell {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.org-icon {
	width: 48px;
	height: 48px;
	border-radius: 12px;
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.5rem;
	color: #667eea;
	flex-shrink: 0;
}

.org-info {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.org-name {
	font-weight: 600;
	color: #1a1a1a;
	font-size: 0.95rem;
}

.org-id {
	font-size: 0.75rem;
	color: #6c757d;
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
	
	.org-icon {
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