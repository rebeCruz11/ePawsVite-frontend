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
					// Exportar PDF HORIZONTAL con grafica mejorada y tabla completa
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
						toast('jsPDF no está instalado. Ejecuta `npm install jspdf jspdf-autotable chart.js` y reinicia el dev server.', 'warning');
						return;
					}

					try {
						const { jsPDF } = jsPDFModule;
						let autoTableLoaded = false;
						try { await import('jspdf-autotable'); autoTableLoaded = true; } catch (e) { console.info('jspdf-autotable no disponible, usando fallback manual'); }

						// Generar grafica mejorada con Chart.js
						let chartImg = null;
						try {
							const ChartModule = await import('chart.js/auto');
							const canvas = document.createElement('canvas');
							canvas.width = 1000;
							canvas.height = 450;
							const ctx = canvas.getContext('2d');

							// Datos para grafica: conteo por estado
							const estados = ['Pendiente', 'En_proceso', 'Cerrado'];
							const counts = estados.map(e => rows.filter(r => r.estado === e).length);
							
							// Colores vibrantes y profesionales
							const colores = {
								'Pendiente': { bg: 'rgba(255, 193, 7, 0.85)', border: 'rgba(255, 193, 7, 1)' },
								'En_proceso': { bg: 'rgba(102, 126, 234, 0.85)', border: 'rgba(102, 126, 234, 1)' },
								'Cerrado': { bg: 'rgba(40, 167, 69, 0.85)', border: 'rgba(40, 167, 69, 1)' }
							};

							const chart = new ChartModule.default(ctx, {
								type: 'bar',
								data: {
									labels: ['Pendiente', 'En Proceso', 'Cerrado'],
									datasets: [{
										label: 'Cantidad de Reportes',
										data: counts,
										backgroundColor: estados.map(e => colores[e].bg),
										borderColor: estados.map(e => colores[e].border),
										borderWidth: 3,
										borderRadius: 10
									}]
								},
								options: {
									responsive: false,
									plugins: {
										legend: {
											display: true,
											position: 'top',
											labels: {
												font: { size: 16, weight: 'bold', family: 'Arial' },
												color: '#2c3e50',
												padding: 20,
												usePointStyle: true,
												pointStyle: 'circle'
											}
										},
										title: {
											display: true,
											text: 'Distribucion de Reportes por Estado',
											font: { size: 22, weight: 'bold', family: 'Arial' },
											color: '#667eea',
											padding: { top: 10, bottom: 25 }
										}
									},
									scales: {
										y: {
											beginAtZero: true,
											ticks: {
												precision: 0,
												font: { size: 14, weight: '600' },
												color: '#555',
												padding: 8
											},
											grid: {
												color: 'rgba(0,0,0,0.08)',
												lineWidth: 1
											}
										},
										x: {
											ticks: {
												font: { size: 14, weight: 'bold' },
												color: '#2c3e50',
												padding: 8
											},
											grid: {
												display: false
											}
										}
									},
									layout: {
										padding: {
											top: 20,
											bottom: 20,
											left: 20,
											right: 20
										}
									}
								}
							});
							
							chart.update();
							await new Promise(resolve => setTimeout(resolve, 150));
							chartImg = canvas.toDataURL('image/png', 1.0);
							chart.destroy();
						} catch (e) {
							console.error('Chart.js error:', e);
							chartImg = null;
						}

						// CREAR PDF EN HORIZONTAL (landscape)
						const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
						const pageW = doc.internal.pageSize.getWidth();
						const pageH = doc.internal.pageSize.getHeight();
						const margin = 40;

						// Colores tema profesionales
						const primary = [102, 126, 234];
						const accent = [118, 75, 162];
						const darkBlue = [44, 62, 80];

						// Header con gradiente simulado mejorado
						doc.setFillColor(...primary);
						doc.rect(0, 0, pageW, 80, 'F');
						doc.setFillColor(...accent);
						doc.rect(0, 55, pageW, 25, 'F');

						// Titulo principal
						doc.setTextColor(255, 255, 255);
						doc.setFontSize(28);
						doc.setFont(undefined, 'bold');
						doc.text('Reportes ePaws', margin, 45);
						
						// Subtitulo
						doc.setFontSize(12);
						doc.setFont(undefined, 'normal');
						doc.text(`Generado: ${new Date().toLocaleString('es-ES', { 
							year: 'numeric', 
							month: 'long', 
							day: 'numeric', 
							hour: '2-digit', 
							minute: '2-digit' 
						})}`, pageW - margin - 210, 45);
						
						// Estadisticas rapidas en el header
						doc.setFontSize(11);
						doc.setFont(undefined, 'bold');
						doc.text(`Total: ${rows.length} reportes`, pageW - margin - 210, 65);

						let currentY = 100;

						// Filtros aplicados con mejor diseño
						let filtroLine = [];
						if (filtros.value.especie) filtroLine.push(`Especie: ${filtros.value.especie}`);
						if (filtros.value.estado) filtroLine.push(`Estado: ${formatearEstado(filtros.value.estado)}`);
						if (filtros.value.tipo) filtroLine.push(`Tipo: ${filtros.value.tipo}`);
						if (filtros.value.organizacionId) {
							const org = organizaciones.value.find(o => (o.idOrganizacion || o.id) == filtros.value.organizacionId);
							if (org) filtroLine.push(`Organizacion: ${org.nombreOrganizacion || org.nombre}`);
						}
						
						if (filtroLine.length > 0) {
							const filtrosTxt = `Filtros aplicados: ${filtroLine.join(' • ')}`;
							doc.setFillColor(248, 249, 250);
							doc.roundedRect(margin, currentY - 5, pageW - 2 * margin, 25, 3, 3, 'F');
							doc.setTextColor(60, 60, 60);
							doc.setFontSize(10);
							doc.setFont(undefined, 'italic');
							doc.text(filtrosTxt, margin + 10, currentY + 10);
							currentY += 35;
						} else {
							doc.setTextColor(100, 100, 100);
							doc.setFontSize(10);
							doc.setFont(undefined, 'italic');
							doc.text('Mostrando todos los reportes', margin, currentY);
							currentY += 25;
						}

						// Insertar grafica con marco profesional
						if (chartImg) {
							const imgW = 550;
							const imgH = 250;
							const imgX = (pageW - imgW) / 2;
							
							// Sombra suave
							doc.setFillColor(220, 220, 220);
							doc.roundedRect(imgX - 8, currentY - 6, imgW + 16, imgH + 16, 8, 8, 'F');
							
							// Fondo blanco para la grafica
							doc.setFillColor(255, 255, 255);
							doc.roundedRect(imgX - 12, currentY - 10, imgW + 24, imgH + 24, 8, 8, 'F');
							
							// Borde decorativo
							doc.setDrawColor(102, 126, 234);
							doc.setLineWidth(2);
							doc.roundedRect(imgX - 12, currentY - 10, imgW + 24, imgH + 24, 8, 8, 'S');
							
							doc.addImage(chartImg, 'PNG', imgX, currentY, imgW, imgH);
							currentY += imgH + 45;
						}

						// TABLA PROFESIONAL con autoTable
						if (autoTableLoaded && typeof doc.autoTable === 'function') {
							const columns = [
								{ header: 'Fecha', dataKey: 'fecha' },
								{ header: 'Titulo', dataKey: 'titulo' },
								{ header: 'Tipo', dataKey: 'tipo' },
								{ header: 'Especie', dataKey: 'especie' },
								{ header: 'Organizacion', dataKey: 'organizacion' },
								{ header: 'Usuario', dataKey: 'usuario' },
								{ header: 'Estado', dataKey: 'estado' }
							];
							
							const data = rows.map(r => ({
								fecha: r.fecha,
								titulo: r.titulo,
								tipo: r.tipo || 'N/A',
								especie: r.especie || 'N/A',
								organizacion: r.organizacion || 'N/A',
								usuario: r.usuario || 'N/A',
								estado: formatearEstado(r.estado)
							}));

							doc.autoTable({
								startY: currentY,
								head: [columns.map(c => c.header)],
								body: data.map(d => columns.map(c => d[c.dataKey])),
								theme: 'striped',
								styles: {
									fontSize: 10,
									cellPadding: 10,
									overflow: 'linebreak',
									halign: 'left',
									valign: 'middle',
									lineColor: [220, 220, 220],
									lineWidth: 0.5
								},
								headStyles: {
									fillColor: [102, 126, 234],
									textColor: [255, 255, 255],
									fontSize: 11,
									fontStyle: 'bold',
									halign: 'center',
									cellPadding: 12
								},
								alternateRowStyles: {
									fillColor: [248, 249, 251]
								},
								columnStyles: {
									0: { cellWidth: 80, halign: 'center' },
									1: { cellWidth: 180, fontStyle: 'bold' },
									2: { cellWidth: 90, halign: 'center' },
									3: { cellWidth: 75, halign: 'center' },
									4: { cellWidth: 130 },
									5: { cellWidth: 120 },
									6: { 
										cellWidth: 95, 
										halign: 'center', 
										fontStyle: 'bold',
										textColor: [44, 62, 80]
									}
								},
								margin: { left: margin, right: margin },
								didDrawPage: (data) => {
									// Footer elegante con numero de pagina
									const pageNum = data.pageNumber;
									const totalPages = doc.internal.getNumberOfPages();
									
									// Linea decorativa
									doc.setDrawColor(102, 126, 234);
									doc.setLineWidth(1);
									doc.line(margin, pageH - 35, pageW - margin, pageH - 35);
									
									// Texto del footer
									doc.setFontSize(9);
									doc.setTextColor(100, 100, 100);
									doc.setFont(undefined, 'normal');
									doc.text('ePaws - Sistema de Gestion de Reportes', margin, pageH - 18);
									
									doc.setFont(undefined, 'bold');
									doc.text(`Pagina ${pageNum} de ${totalPages}`, pageW / 2, pageH - 18, { align: 'center' });
									
									doc.setFont(undefined, 'normal');
									doc.text(`${rows.length} registros`, pageW - margin, pageH - 18, { align: 'right' });
								},
								didDrawCell: (data) => {
									// Resaltar estados con colores
									if (data.column.dataKey === 'estado' && data.section === 'body') {
										const estado = data.cell.raw;
										let color = [108, 117, 125];
										if (estado.includes('Pendiente')) color = [255, 193, 7];
										else if (estado.includes('Proceso')) color = [102, 126, 234];
										else if (estado.includes('Cerrado')) color = [40, 167, 69];
										
										doc.setFillColor(...color);
										doc.setDrawColor(...color);
										const cellX = data.cell.x;
										const cellY = data.cell.y;
										const cellW = data.cell.width;
										const cellH = data.cell.height;
										doc.roundedRect(cellX + 15, cellY + cellH / 2 - 3, 8, 8, 2, 2, 'F');
									}
								}
							});
						} else {
							// Fallback tabla manual mejorada
							let y = currentY;
							const lineH = 18;
							const headers = ['Fecha', 'Titulo', 'Tipo', 'Especie', 'Organizacion', 'Usuario', 'Estado'];
							const colW = [80, 180, 90, 75, 130, 120, 95];

							// Header tabla con diseño mejorado
							doc.setFillColor(102, 126, 234);
							doc.rect(margin, y - 14, pageW - 2 * margin, lineH, 'F');
							doc.setTextColor(255, 255, 255);
							doc.setFontSize(11);
							doc.setFont(undefined, 'bold');
							let x = margin;
							for (let i = 0; i < headers.length; i++) {
								doc.text(headers[i], x + colW[i] / 2, y - 2, { align: 'center' });
								x += colW[i];
							}
							y += lineH;

							// Filas con diseño alternado
							doc.setFont(undefined, 'normal');
							doc.setFontSize(10);
							rows.forEach((r, idx) => {
								if (idx % 2 === 0) {
									doc.setFillColor(248, 249, 251);
									doc.rect(margin, y - 14, pageW - 2 * margin, lineH, 'F');
								}
								
								doc.setTextColor(30, 30, 30);
								x = margin;
								const cells = [
									r.fecha, 
									r.titulo, 
									r.tipo || 'N/A', 
									r.especie || 'N/A', 
									r.organizacion || 'N/A', 
									r.usuario || 'N/A', 
									formatearEstado(r.estado)
								];
								
								for (let i = 0; i < cells.length; i++) {
									let txt = String(cells[i] ?? '');
									const maxChars = Math.floor(colW[i] / 5.2);
									if (txt.length > maxChars) txt = txt.slice(0, maxChars - 3) + '...';
									
									if (i === 6) doc.setFont(undefined, 'bold');
									doc.text(txt, x + (i === 0 || i === 2 || i === 3 || i === 6 ? colW[i] / 2 : 6), y - 2, { 
										align: (i === 0 || i === 2 || i === 3 || i === 6 ? 'center' : 'left')
									});
									if (i === 6) doc.setFont(undefined, 'normal');
									
									x += colW[i];
								}
								y += lineH;
								
								if (y + lineH > pageH - 50) {
									doc.addPage();
									y = margin + 30;
								}
							});
						}

						// Footer final elegante en todas las paginas
						const totalPages = doc.internal.getNumberOfPages();
						for (let i = 1; i <= totalPages; i++) {
							doc.setPage(i);
							
							// Linea decorativa
							doc.setDrawColor(102, 126, 234);
							doc.setLineWidth(1);
							doc.line(margin, pageH - 35, pageW - margin, pageH - 35);
							
							// Texto del footer
							doc.setFontSize(9);
							doc.setTextColor(100, 100, 100);
							doc.setFont(undefined, 'normal');
							doc.text('ePaws - Sistema de Gestion de Reportes', margin, pageH - 18);
							
							doc.setFont(undefined, 'bold');
							doc.text(`Pagina ${i} de ${totalPages}`, pageW / 2, pageH - 18, { align: 'center' });
							
							doc.setFont(undefined, 'normal');
							doc.text(`${rows.length} registros`, pageW - margin, pageH - 18, { align: 'right' });
						}

						const filename = `reportes-epaws-${new Date().toISOString().slice(0, 10)}.pdf`;
						doc.save(filename);
						toast('PDF generado exitosamente con diseño profesional!', 'success');
					} catch (err) {
						console.error('Error generando PDF:', err);
						toast('Error al generar PDF: ' + err.message, 'error');
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
