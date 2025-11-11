<template>
	<div class="adoptions-page fade-in">
		<Loading v-if="cargando" />

		<div v-else>
			<!-- Header -->
			<div class="page-header">
				<div class="header-content">
					<div class="header-title">
						<div class="title-icon">
							<i class="bi bi-clipboard-check-fill"></i>
						</div>
						<div>
							<h2>Gestion de Adopciones</h2>
							<p class="text-muted mb-0">Administra todas las solicitudes de adopcion</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Stats -->
			<div class="adoptions-stats mb-4">
				<div class="stat-badge">
					<i class="bi bi-clipboard-check-fill"></i>
					<span>{{ adopciones.length }} Solicitudes totales</span>
				</div>
				<div class="stat-badge warning">
					<i class="bi bi-clock-fill"></i>
					<span>{{ adopciones.filter(a => a.estado === 'Pendiente').length }} Pendientes</span>
				</div>
				<div class="stat-badge success">
					<i class="bi bi-check-circle-fill"></i>
					<span>{{ adopciones.filter(a => a.estado === 'Aprobada').length }} Aprobadas</span>
				</div>
				<div class="stat-badge danger">
					<i class="bi bi-x-circle-fill"></i>
					<span>{{ adopciones.filter(a => a.estado === 'Rechazada').length }} Rechazadas</span>
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
							placeholder="Solicitante, animal..."
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
								<th>Solicitante</th>
								<th>Animal</th>
								<th>Organizacion</th>
								<th>Fecha</th>
								<th>Estado</th>
								<th class="text-center">Acciones</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="adopcion in adopcionesPaginadas" :key="adopcion.idAdopcion" class="table-row-hover">
								<td>
									<div class="user-cell">
										<div class="user-avatar">
											{{ (nombreCompleto(adopcion.usuario) || 'U').charAt(0).toUpperCase() }}
										</div>
										<div class="user-info">
											<div class="user-name">{{ nombreCompleto(adopcion.usuario) }}</div>
											<div class="user-email">{{ adopcion.usuario?.correo || 'N/A' }}</div>
										</div>
									</div>
								</td>
								<td>
									<div class="animal-cell">
										<i :class="getAnimalIcon(adopcion.animal?.especie)"></i>
										<div>
											<div class="animal-name">{{ adopcion.animal?.nombre || 'N/A' }}</div>
											<div class="animal-species">{{ adopcion.animal?.especie || 'N/A' }}</div>
										</div>
									</div>
								</td>
								<td>
									<div class="org-cell">
										<i class="bi bi-building"></i>
										<span>{{ adopcion.animal?.organizacion?.nombreOrganizacion || 'N/A' }}</span>
									</div>
								</td>
								<td>
									<div class="date-cell">
										<i class="bi bi-calendar3"></i>
										<span>{{ formatearFecha(adopcion.fechaSolicitud) }}</span>
									</div>
								</td>
								<td>
									<span class="status-badge" :class="getStatusClass(adopcion.estado)">
										<i :class="getStatusIcon(adopcion.estado)"></i>
										{{ formatearEstado(adopcion.estado) }}
									</span>
								</td>
								<td>
									<div class="action-buttons" v-if="adopcion.estado === 'Pendiente'">
										<button 
											class="btn-action approve" 
											@click="cambiarEstado(adopcion, 'Aprobada')"
											title="Aprobar adopcion"
										>
											<i class="bi bi-check-circle-fill"></i>
										</button>
										<button 
											class="btn-action reject" 
											@click="cambiarEstado(adopcion, 'Rechazada')"
											title="Rechazar adopcion"
										>
											<i class="bi bi-x-circle-fill"></i>
										</button>
									</div>
									<div v-else class="action-buttons">
										<span class="text-muted small">Sin acciones</span>
									</div>
								</td>
							</tr>
							<tr v-if="adopcionesFiltradas.length === 0">
								<td colspan="6" class="empty-state">
									<div class="empty-content">
										<i class="bi bi-inbox"></i>
										<p>No se encontraron adopciones</p>
										<small>Intenta ajustar los filtros</small>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				
				<div class="table-footer">
					<small class="text-muted">Mostrando {{ adopcionesPaginadas.length }} de {{ adopcionesFiltradas.length }} resultados</small>
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
				toast(`Adopcion ${estado.toLowerCase()}`, 'success');
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

		const getAnimalIcon = (especie) => {
			const icons = {
				'Perro': 'bi bi-heart-fill',
				'Gato': 'bi bi-heart-fill',
				'Ave': 'bi bi-heart-fill',
				'Otro': 'bi bi-heart-fill'
			};
			return icons[especie] || 'bi bi-heart-fill';
		};

		const getStatusClass = (estado) => {
			const classes = {
				'Pendiente': 'status-pending',
				'Aprobada': 'status-approved',
				'Rechazada': 'status-rejected'
			};
			return classes[estado] || 'status-pending';
		};

		const getStatusIcon = (estado) => {
			const icons = {
				'Pendiente': 'bi bi-clock-fill',
				'Aprobada': 'bi bi-check-circle-fill',
				'Rechazada': 'bi bi-x-circle-fill'
			};
			return icons[estado] || 'bi bi-clock-fill';
		};

		onMounted(() => cargar());

		return { 
			cargando, adopciones, busqueda, paginaActual, itemsPorPagina, totalPaginas, 
			adopcionesFiltradas, adopcionesPaginadas, cambiarEstado, colorPorEstado, 
			formatearEstado, formatearFecha, nombreCompleto, getAnimalIcon, 
			getStatusClass, getStatusIcon 
		};
	}
}
</script>

<style scoped>
.adoptions-page {
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

.adoptions-stats {
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

.stat-badge.warning { color: #ffc107; }
.stat-badge.success { color: #28a745; }
.stat-badge.danger { color: #dc3545; }

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

.user-cell {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.user-avatar {
	width: 48px;
	height: 48px;
	border-radius: 12px;
	background: linear-gradient(135deg, #667eea, #764ba2);
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 700;
	font-size: 1.25rem;
	color: white;
	flex-shrink: 0;
}

.user-info {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.user-name {
	font-weight: 600;
	color: #1a1a1a;
	font-size: 0.95rem;
}

.user-email {
	font-size: 0.75rem;
	color: #6c757d;
}

.animal-cell {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.animal-cell i {
	font-size: 1.5rem;
	color: #667eea;
}

.animal-name {
	font-weight: 600;
	color: #1a1a1a;
	font-size: 0.9rem;
}

.animal-species {
	font-size: 0.75rem;
	color: #6c757d;
}

.org-cell,
.date-cell {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	color: #495057;
	font-size: 0.9rem;
}

.org-cell i,
.date-cell i {
	color: #6c757d;
}

.status-badge {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 1rem;
	border-radius: 10px;
	font-weight: 600;
	font-size: 0.85rem;
	white-space: nowrap;
}

.status-badge.status-pending {
	background: rgba(255, 193, 7, 0.1);
	color: #ffc107;
}

.status-badge.status-approved {
	background: rgba(40, 167, 69, 0.1);
	color: #28a745;
}

.status-badge.status-rejected {
	background: rgba(220, 53, 69, 0.1);
	color: #dc3545;
}

.action-buttons {
	display: flex;
	gap: 0.5rem;
	justify-content: center;
}

.btn-action {
	width: 36px;
	height: 36px;
	border-radius: 10px;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.3s ease;
	font-size: 1rem;
}

.btn-action.approve {
	background: rgba(40, 167, 69, 0.1);
	color: #28a745;
}

.btn-action.approve:hover {
	background: #28a745;
	color: white;
	transform: scale(1.1);
}

.btn-action.reject {
	background: rgba(220, 53, 69, 0.1);
	color: #dc3545;
}

.btn-action.reject:hover {
	background: #dc3545;
	color: white;
	transform: scale(1.1);
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
	
	.user-avatar {
		width: 40px;
		height: 40px;
		font-size: 1rem;
	}
	
	.table-footer {
		flex-direction: column;
		gap: 1rem;
		align-items: flex-start;
	}
}
</style>