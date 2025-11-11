<template>
	<div class="fade-in">
		<div class="d-flex justify-content-between align-items-center mb-4">
			<h2><i class="bi bi-flag me-2"></i>Gestión de Reportes</h2>
			<small class="text-muted">Estadísticas y descargas</small>
		</div>

		<Loading v-if="cargando" />

		<div v-else>
					<div class="card mb-3">
						<div class="card-body">
							<div class="row g-2 align-items-end">
								<div class="col-md-2">
									<label class="form-label">Especie</label>
									<select class="form-select" v-model="filtros.especie">
										<option value="">Todas</option>
										<option v-for="s in especies" :key="s">{{ s }}</option>
									</select>
								</div>
								<div class="col-md-2">
									<label class="form-label">Estado</label>
									<select class="form-select" v-model="filtros.estado">
										<option value="">Todos</option>
										<option value="Pendiente">Pendiente</option>
										<option value="En_proceso">En proceso</option>
										<option value="Cerrado">Cerrado</option>
									</select>
								</div>
								<div class="col-md-3">
									<label class="form-label">Organización</label>
									<select class="form-select" v-model="filtros.organizacionId">
										<option value="">Todas</option>
										<option v-for="o in organizaciones" :key="(o && (o.idOrganizacion||o.id))" :value="o.idOrganizacion || o.id">{{ o?.nombreOrganizacion || o?.nombre }}</option>
									</select>
								</div>
								<div class="col-md-2">
									<label class="form-label">Tipo</label>
									<select class="form-select" v-model="filtros.tipo">
										<option value="">Todos</option>
										<option v-for="t in tipos" :key="t">{{ t }}</option>
									</select>
								</div>
								<div class="col-md-3 text-end">
									<div class="btn-group mt-2" role="group">
										<button class="btn btn-outline-primary" @click="exportarFiltradoCSV"><i class="bi bi-file-earmark-spreadsheet me-1"></i>CSV</button>
										<button class="btn btn-outline-secondary" @click="exportarFiltradoXML"><i class="bi bi-file-earmark-code me-1"></i>XML</button>
										<button class="btn btn-outline-dark" @click="exportarFiltradoPDF"><i class="bi bi-file-earmark-pdf me-1"></i>PDF</button>
									</div>
								</div>
							</div>
						</div>
					</div>

			<div class="card">
				<div class="card-body">
					<div class="table-responsive">
						<table class="table table-hover">
							<thead>
								<tr>
									<th>Fecha</th>
									<th>Usuario</th>
									<th>Título</th>
									<th>Estado</th>
									<th>Asignado</th>
									<th>Foto</th>
									<th>Acciones</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="r in reportesPaginados" :key="r.idReporte">
									<td>{{ formatearFecha(r.fechaReporte) }}</td>
									<td>{{ nombreCompleto(r.usuario) }}</td>
									<td>{{ r.titulo }}</td>
									<td>
										<span class="badge" :class="`bg-${colorPorEstado(r.estado)}`">{{ formatearEstado(r.estado) }}</span>
									</td>
									<td>
										<small v-if="r.organizacion">Org: {{ r.organizacion.nombreOrganizacion }}</small>
										<small v-if="r.veterinaria">Vet: {{ r.veterinaria.nombreClinica }}</small>
									</td>
									<td>
										<button v-if="r.fotoUrl" class="btn btn-sm btn-info" @click="verFoto(r.fotoUrl)"><i class="bi bi-image"></i></button>
									</td>
									<td>
										<select class="form-select form-select-sm" :value="r.estado" @change="cambiarEstado(r,$event.target.value)">
											<option value="Pendiente">Pendiente</option>
											<option value="En_proceso">En proceso</option>
											<option value="Cerrado">Cerrado</option>
										</select>
									</td>
								</tr>
								<tr v-if="reportesFiltrados.length === 0">
									<td colspan="7" class="text-center">No hay reportes</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="d-flex justify-content-between align-items-center mt-3">
						<small class="text-muted">Mostrando {{ reportesFiltrados.length }} reportes</small>
						<Pagination v-if="totalPaginas > 1" :pagina-actual="paginaActual" :total-paginas="totalPaginas" @cambiar-pagina="(p) => paginaActual = p" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import { ref, onMounted, computed } from 'vue';
import Loading from '../../components/common/Loading.vue';
import Pagination from '../../components/common/Pagination.vue';
import reporteService from '../../services/reporteService';
import organizacionService from '../../services/organizacionService';
import animalService from '../../services/animalService';
import { toast, manejarErrorAPI, alertaHTML } from '../../utils/alertas';
import { colorPorEstado, formatearEstado, formatearFecha, nombreCompleto } from '../../utils/helpers';
export default {
	name: 'AdminReportes',
	components: { Loading, Pagination },
	setup() {
		const cargando = ref(true);
		const reportes = ref([]);
		const organizaciones = ref([]);
		const animales = ref([]);

	const filtros = ref({ especie: '', estado: '', organizacionId: '' });
	const busqueda = ref('');
	const paginaActual = ref(1);
	const itemsPorPagina = 10;

		const especies = ref([]);

		const tipos = ref([]);

			const cargar = async () => {
			try {
				cargando.value = true;
				const [r, orgs, a] = await Promise.all([
					reporteService.getAll(),
					organizacionService.getAll(),
					animalService.getAll()
				]);
				reportes.value = r.data || [];
				organizaciones.value = orgs.data || [];
				animales.value = a.data || [];

				// extraer especies
				const setEspecies = new Set();
				animales.value.forEach(an => an.especie && setEspecies.add(an.especie));
				especies.value = Array.from(setEspecies).sort();
					// extraer tipos de reporte (seguro es campo tipo/tipoReporte/categoria)
					const setTipos = new Set();
					reportes.value.forEach(rr => {
						const t = rr.tipo || rr.tipoReporte || rr.categoria || rr.tipo_reporte;
						if (t) setTipos.add(t);
					});
					tipos.value = Array.from(setTipos).sort();
			} catch (e) {
				manejarErrorAPI(e);
			} finally {
				cargando.value = false;
			}
		};

		const cambiarEstado = async (r, estado) => {
			try {
				await reporteService.update(r.idReporte, { ...r, estado });
				toast('Estado actualizado', 'success');
				await cargar();
			} catch (e) {
				manejarErrorAPI(e);
			}
		};

		const verFoto = (u) => {
			alertaHTML(`<img src="${u}" class="img-fluid">`, 'Foto');
		};

			const reportesFiltrados = computed(() => {
			return reportes.value.filter(r => {
				// filtrar por estado
				if (filtros.value.estado && r.estado !== filtros.value.estado) return false;
				// filtrar por organizacion
				if (filtros.value.organizacionId) {
					const orgId = r.organizacion?.idOrganizacion || r.organizacion?.id || r.organizacionId || r.idOrganizacion;
					if (orgId != filtros.value.organizacionId) return false;
				}
				// filtrar por especie (buscar entre animales relacionados)
				if (filtros.value.especie) {
					if (!r.animal) return false;
					if (r.animal.especie !== filtros.value.especie) return false;
				}
					// filtrar por tipo
					if (filtros.value.tipo) {
						const t = r.tipo || r.tipoReporte || r.categoria || r.tipo_reporte || '';
						if (t !== filtros.value.tipo) return false;
					}
				return true;
			});
		});

		const totalPaginas = computed(() => Math.max(1, Math.ceil(reportesFiltrados.value.length / itemsPorPagina)));

		const reportesPaginados = computed(() => {
			const start = (paginaActual.value - 1) * itemsPorPagina;
			return reportesFiltrados.value.slice(start, start + itemsPorPagina);
		});

			const exportarFiltradoCSV = () => exportarFiltrado();

			const exportarFiltradoXML = () => {
				const rows = reportesFiltrados.value.map(r => ({
					idReporte: r.idReporte,
					fecha: formatearFecha(r.fechaReporte),
					titulo: r.titulo,
					descripcion: r.descripcion || '',
					estado: r.estado,
					organizacion: r.organizacion?.nombreOrganizacion || '',
					veterinaria: r.veterinaria?.nombreClinica || '',
					usuario: nombreCompleto(r.usuario) || '',
					especie: r.animal?.especie || '',
					tipo: r.tipo || r.tipoReporte || r.categoria || ''
				}));

				if (rows.length === 0) { toast('No hay datos para exportar', 'info'); return; }

				const xmlItems = rows.map(r => {
					const fields = Object.keys(r).map(k => `    <${k}>${String(r[k]).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</${k}>`).join('\n');
					return `<reporte>\n${fields}\n</reporte>`;
				}).join('\n');
				const xml = `<?xml version="1.0" encoding="utf-8"?>\n<reportes>\n${xmlItems}\n</reportes>`;
				const blob = new Blob([xml], { type: 'application/xml' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `reportes-${new Date().toISOString().slice(0,10)}.xml`;
				a.click();
				URL.revokeObjectURL(url);
			};

			const exportarFiltradoPDF = async () => {
					// Import dinámico de jsPDF para evitar fallo en build si la dependencia no está instalada
					const rows = reportesFiltrados.value.map(r => ({
						fecha: formatearFecha(r.fechaReporte),
						titulo: r.titulo,
						tipo: r.tipo || r.tipoReporte || r.categoria || '',
						especie: r.animal?.especie || '',
						organizacion: r.organizacion?.nombreOrganizacion || '',
						usuario: nombreCompleto(r.usuario) || '',
						estado: r.estado
					}));
					if (rows.length === 0) { toast('No hay datos para exportar', 'info'); return; }

					let jsPDFModule;
					try {
						jsPDFModule = await import('jspdf');
					} catch (err) {
						console.error('jsPDF import failed:', err);
						toast('jsPDF no está instalado. Ejecuta `npm install jspdf` y reinicia el dev server.', 'warning');
						return;
					}

					try {
						const { jsPDF } = jsPDFModule;
						// intentar cargar jspdf-autotable para tablas más bonitas
						let autoTableLoaded = false;
						try {
							await import('jspdf-autotable');
							autoTableLoaded = true;
						} catch (e) {
							// no está instalado, no es crítico — haremos fallback
							console.info('jspdf-autotable no disponible, usando layout básico');
						}

						const doc = new jsPDF({ unit: 'pt', format: 'a4' });
						const margin = 40;
						const pageWidth = doc.internal.pageSize.getWidth();

						doc.setFontSize(14);
						doc.text('Reportes - ePaws', margin, 60);
						doc.setFontSize(10);
						doc.text(`Fecha: ${new Date().toLocaleString()}`, pageWidth - margin - 150, 60);

						if (autoTableLoaded && typeof doc.autoTable === 'function') {
							// preparar columnas y filas
							const columns = [
								{ header: 'Fecha', dataKey: 'fecha' },
								{ header: 'Título', dataKey: 'titulo' },
								{ header: 'Tipo', dataKey: 'tipo' },
								{ header: 'Especie', dataKey: 'especie' },
								{ header: 'Organización', dataKey: 'organizacion' },
								{ header: 'Usuario', dataKey: 'usuario' },
								{ header: 'Estado', dataKey: 'estado' }
							];
							const data = rows.map(r => ({ fecha: r.fecha, titulo: r.titulo, tipo: r.tipo, especie: r.especie, organizacion: r.organizacion, usuario: r.usuario, estado: r.estado }));
							doc.autoTable({ startY: 80, head: [columns.map(c => c.header)], body: data.map(d => columns.map(c => d[c.dataKey])) , styles: { fontSize: 9 }, headStyles: { fillColor: [13,110,253] } });
						} else {
							// fallback: pintar filas manualmente como antes
							let y = 90;
							const headers = ['Fecha', 'Título', 'Tipo', 'Especie', 'Organización', 'Usuario', 'Estado'];
							const colWidths = [70, 160, 60, 50, 100, 90, 60];
							const startX = margin;

							const drawRow = (cells) => {
								let x = startX;
								const lineHeight = 14;
								const maxY = doc.internal.pageSize.getHeight() - margin;
								if (y + lineHeight > maxY) { doc.addPage(); y = margin; }
								cells.forEach((cell, i) => {
									const text = String(cell ?? '');
									const maxChars = Math.floor(colWidths[i] / 6);
									const out = text.length > maxChars ? text.slice(0, maxChars - 3) + '...' : text;
									doc.text(out, x, y);
									x += colWidths[i];
								});
								y += lineHeight;
							};

							doc.setFont(undefined, 'bold');
							drawRow(headers);
							doc.setFont(undefined, 'normal');

							rows.forEach(r => {
								drawRow([r.fecha, r.titulo, r.tipo, r.especie, r.organizacion, r.usuario, r.estado]);
							});
						}

						const filename = `reportes-${new Date().toISOString().slice(0,10)}.pdf`;
						doc.save(filename);
					} catch (err) {
						console.error('Error generando PDF:', err);
						toast('Error al generar PDF', 'error');
					}
			};

		const exportarFiltrado = () => {
			const rows = reportesFiltrados.value.map(r => ({
				idReporte: r.idReporte,
				fecha: formatearFecha(r.fechaReporte),
				titulo: r.titulo,
				descripcion: r.descripcion || '',
				estado: r.estado,
				organizacion: r.organizacion?.nombreOrganizacion || '',
				veterinaria: r.veterinaria?.nombreClinica || '',
				usuario: nombreCompleto(r.usuario) || '',
				especie: r.animal?.especie || '',
				fotoUrl: r.fotoUrl || ''
			}));

			if (rows.length === 0) {
				toast('No hay datos para exportar', 'info');
				return;
			}

			const keys = Object.keys(rows[0]);
			const csv = [keys.join(',')]
				.concat(rows.map(r => keys.map(k => `"${(r[k] ?? '').toString().replace(/"/g,'""')}"`).join(',')))
				.join('\n');
			const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `reportes-filtrados-${new Date().toISOString().slice(0,10)}.csv`;
			a.click();
			URL.revokeObjectURL(url);
		};

	onMounted(() => cargar());

		return {
			cargando,
			reportes,
			organizaciones,
			especies,
			tipos,
			filtros,
			busqueda,
			paginaActual,
			itemsPorPagina,
			totalPaginas,
			reportesPaginados,
			reportesFiltrados,
			cambiarEstado,
			verFoto,
			exportarFiltrado,
			exportarFiltradoCSV,
			exportarFiltradoXML,
			exportarFiltradoPDF,
			colorPorEstado,
			formatearEstado,
			formatearFecha,
			nombreCompleto
		};
	}
}
</script>
