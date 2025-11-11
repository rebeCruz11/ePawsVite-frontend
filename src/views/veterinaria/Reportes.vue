<template>
  <div class="veterinaria-reportes">
    <!-- Header con gradiente -->
    <div class="page-header">
      <div class="container-fluid">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h2 class="header-title">
              <i class="bi bi-clipboard2-pulse-fill me-3"></i>
              Gestión de Reportes Médicos
            </h2>
            <p class="header-subtitle mb-0">
              <i class="bi bi-calendar-check me-2"></i>
              Administra los casos asignados a tu clínica veterinaria
            </p>
          </div>
          <div class="col-md-4 text-end">
            <button class="btn btn-light btn-sm" @click="cargarReportes">
              <i class="bi bi-arrow-clockwise me-2"></i>
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </div>

    <Loading v-if="cargando" />

    <div v-else class="container-fluid py-4">
      <!-- Estadísticas Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-3 col-sm-6">
          <div class="stats-card bg-gradient-primary">
            <div class="stats-icon">
              <i class="bi bi-hourglass-split"></i>
            </div>
            <div class="stats-content">
              <h3 class="stats-number">{{ estadisticas.pendientes }}</h3>
              <p class="stats-label">Pendientes de Aceptar</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 col-sm-6">
          <div class="stats-card bg-gradient-info">
            <div class="stats-icon">
              <i class="bi bi-heart-pulse"></i>
            </div>
            <div class="stats-content">
              <h3 class="stats-number">{{ estadisticas.enProceso }}</h3>
              <p class="stats-label">En Atención</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 col-sm-6">
          <div class="stats-card bg-gradient-success">
            <div class="stats-icon">
              <i class="bi bi-check-circle"></i>
            </div>
            <div class="stats-content">
              <h3 class="stats-number">{{ estadisticas.cerrados }}</h3>
              <p class="stats-label">Casos Completados</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 col-sm-6">
          <div class="stats-card bg-gradient-warning">
            <div class="stats-icon">
              <i class="bi bi-clipboard-data"></i>
            </div>
            <div class="stats-content">
              <h3 class="stats-number">{{ estadisticas.totalRegistros }}</h3>
              <p class="stats-label">Registros Médicos</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="card filter-card shadow-sm mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label fw-semibold">
                <i class="bi bi-search me-2"></i>Buscar
              </label>
              <input
                type="text"
                class="form-control"
                v-model="filtroBusqueda"
                @input="onFiltroChange"
                placeholder="Buscar por título, descripción o ubicación..."
              />
            </div>
            
            <div class="col-md-3">
              <label class="form-label fw-semibold">
                <i class="bi bi-flag me-2"></i>Estado
              </label>
              <select v-model="filtroEstado" @change="onFiltroChange" class="form-select">
                <option value="">Todos los estados</option>
                <option value="pendiente_aceptar">⏳ Pendientes de aceptar</option>
                <option value="En_proceso">🔄 En proceso</option>
                <option value="Cerrado">✅ Cerrados</option>
              </select>
            </div>

            <div class="col-md-3">
              <label class="form-label fw-semibold">
                <i class="bi bi-calendar-range me-2"></i>Periodo
              </label>
              <select v-model="filtroPeriodo" @change="onFiltroChange" class="form-select">
                <option value="">Todos</option>
                <option value="hoy">Hoy</option>
                <option value="semana">Esta semana</option>
                <option value="mes">Este mes</option>
              </select>
            </div>

            <div class="col-md-2">
              <label class="form-label fw-semibold">
                <i class="bi bi-sort-down me-2"></i>Ordenar
              </label>
              <select v-model="ordenamiento" @change="onFiltroChange" class="form-select">
                <option value="reciente">Más reciente</option>
                <option value="antiguo">Más antiguo</option>
                <option value="titulo">Por título</option>
              </select>
            </div>
          </div>

          <!-- Contador de resultados -->
          <div v-if="reportesFiltrados.length !== reportes.length" class="mt-3">
            <div class="alert alert-info mb-0 d-inline-flex align-items-center">
              <i class="bi bi-funnel me-2"></i>
              Mostrando <strong class="mx-1">{{ reportesFiltrados.length }}</strong> de 
              <strong class="mx-1">{{ reportes.length }}</strong> reportes
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de reportes -->
      <div class="card table-card shadow-sm">
        <div class="card-header bg-white border-0 pt-4">
          <h5 class="mb-0">
            <i class="bi bi-table me-2"></i>
            Lista de Reportes
          </h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="border-0"><i class="bi bi-calendar3 me-2"></i>Fecha</th>
                  <th class="border-0"><i class="bi bi-card-heading me-2"></i>Título</th>
                  <th class="border-0"><i class="bi bi-chat-text me-2"></i>Descripción</th>
                  <th class="border-0"><i class="bi bi-geo-alt me-2"></i>Ubicación</th>
                  <th class="border-0"><i class="bi bi-building me-2"></i>Organización</th>
                  <th class="border-0 text-center"><i class="bi bi-flag me-2"></i>Estado</th>
                  <th class="border-0 text-center"><i class="bi bi-image me-2"></i>Foto</th>
                  <th class="border-0 text-center" style="min-width: 220px;">
                    <i class="bi bi-gear me-2"></i>Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in reportesPaginados" :key="r.idReporte" class="table-row">
                  <td>
                    <span class="text-muted small">
                      <i class="bi bi-clock me-1"></i>
                      {{ formatearFecha(r.fechaReporte) }}
                    </span>
                  </td>
                  <td>
                    <strong class="text-primary">{{ r.titulo }}</strong>
                  </td>
                  <td>
                    <span class="text-truncate d-inline-block" style="max-width: 200px;" :title="r.descripcion">
                      {{ truncar(r.descripcion, 50) }}
                    </span>
                  </td>
                  <td>
                    <i class="bi bi-pin-map text-muted me-1"></i>
                    {{ r.ubicacion || 'N/A' }}
                  </td>
                  <td>
                    <span v-if="r.organizacion" class="badge badge-org">
                      <i class="bi bi-building me-1"></i>
                      {{ r.organizacion.nombreOrganizacion }}
                    </span>
                    <span v-else class="text-muted">--</span>
                  </td>
                  <td class="text-center">
                    <span class="badge badge-status" :class="`badge-${colorPorEstado(r.estado)}`">
                      <i :class="`bi ${iconoPorEstado(r.estado)} me-1`"></i>
                      {{ formatearEstado(r.estado) }}
                    </span>
                  </td>
                  <td class="text-center">
                    <button 
                      v-if="r.fotoUrl" 
                      class="btn btn-sm btn-outline-info" 
                      @click="verFoto(r.fotoUrl)"
                    >
                      <i class="bi bi-image"></i>
                    </button>
                    <span v-else class="text-muted">--</span>
                  </td>
                  <td class="text-center">
                    <!-- Estado: Pendiente de aceptación -->
                    <template v-if="r.estado === 'En_proceso' && !r.aceptadoPorVeterinaria">
                      <div class="btn-group" role="group">
                        <button 
                          class="btn btn-sm btn-success" 
                          @click="aceptarReporte(r)"
                          title="Aceptar caso para atención"
                        >
                          <i class="bi bi-check-circle me-1"></i>Aceptar
                        </button>
                        <button 
                          class="btn btn-sm btn-danger" 
                          @click="rechazarReporte(r)"
                          title="Rechazar caso"
                        >
                          <i class="bi bi-x-circle me-1"></i>Rechazar
                        </button>
                      </div>
                    </template>

                    <!-- Estado: Aceptado -->
                    <template v-else-if="r.aceptadoPorVeterinaria">
                      <div class="btn-group" role="group">
                        <button 
                          class="btn btn-sm btn-primary" 
                          @click="abrirModalRegistro(r)"
                          title="Crear registro médico"
                        >
                          <i class="bi bi-clipboard-plus me-1"></i>Nuevo Registro
                        </button>
                        <button 
                          v-if="tieneRegistrosMedicos(r)"
                          class="btn btn-sm btn-info" 
                          @click="verRegistrosMedicos(r)"
                          title="Ver historial médico"
                        >
                          <i class="bi bi-file-medical me-1"></i>Historial
                        </button>
                      </div>
                    </template>

                    <!-- Otros estados -->
                    <template v-else>
                      <span class="badge bg-secondary">Sin acciones</span>
                    </template>
                  </td>
                </tr>
                <tr v-if="reportesPaginados.length === 0">
                  <td colspan="8" class="text-center py-5">
                    <div class="empty-state">
                      <i class="bi bi-inbox display-1 text-muted mb-3"></i>
                      <h5 class="text-muted">No hay reportes para mostrar</h5>
                      <p class="text-muted small">Los reportes asignados aparecerán aquí</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          <div v-if="reportesFiltrados.length > 0" class="card-footer bg-white border-top">
            <div class="row align-items-center">
              <div class="col-md-6">
                <div class="d-flex align-items-center gap-2">
                  <span class="text-muted small">Mostrar:</span>
                  <select v-model="itemsPorPagina" @change="onFiltroChange" class="form-select form-select-sm" style="width: auto;">
                    <option :value="5">5</option>
                    <option :value="10">10</option>
                    <option :value="20">20</option>
                    <option :value="50">50</option>
                  </select>
                  <span class="text-muted small">
                    Mostrando {{ (paginaActual - 1) * itemsPorPagina + 1 }} 
                    - {{ Math.min(paginaActual * itemsPorPagina, reportesFiltrados.length) }} 
                    de {{ reportesFiltrados.length }} registros
                  </span>
                </div>
              </div>
              
              <div class="col-md-6">
                <nav v-if="totalPaginas > 1">
                  <ul class="pagination pagination-sm justify-content-end mb-0">
                    <li class="page-item" :class="{ disabled: paginaActual === 1 }">
                      <button class="page-link" @click="paginaActual = 1" :disabled="paginaActual === 1">
                        <i class="bi bi-chevron-double-left"></i>
                      </button>
                    </li>
                    <li class="page-item" :class="{ disabled: paginaActual === 1 }">
                      <button class="page-link" @click="paginaActual--" :disabled="paginaActual === 1">
                        <i class="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    
                    <li 
                      v-for="pagina in paginas" 
                      :key="pagina"
                      class="page-item" 
                      :class="{ active: pagina === paginaActual, disabled: pagina === '...' }"
                    >
                      <button 
                        class="page-link" 
                        @click="typeof pagina === 'number' && (paginaActual = pagina)"
                        :disabled="pagina === '...'"
                      >
                        {{ pagina }}
                      </button>
                    </li>
                    
                    <li class="page-item" :class="{ disabled: paginaActual === totalPaginas }">
                      <button class="page-link" @click="paginaActual++" :disabled="paginaActual === totalPaginas">
                        <i class="bi bi-chevron-right"></i>
                      </button>
                    </li>
                    <li class="page-item" :class="{ disabled: paginaActual === totalPaginas }">
                      <button class="page-link" @click="paginaActual = totalPaginas" :disabled="paginaActual === totalPaginas">
                        <i class="bi bi-chevron-double-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para crear registro médico -->
  <div class="modal fade" id="modalRegistroMedico" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            <i class="bi bi-clipboard-pulse me-2"></i>
            Registro Médico - {{ reporteSeleccionado?.titulo }}
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarRegistroMedico">
            <!-- Información del reporte -->
            <div class="alert alert-info mb-4">
              <div class="row">
                <div class="col-md-12">
                  <strong><i class="bi bi-file-text me-1"></i> Reporte:</strong> {{ reporteSeleccionado?.titulo }}
                </div>
                <div class="col-md-12 mt-2">
                  <strong><i class="bi bi-chat-text me-1"></i> Descripción:</strong> {{ reporteSeleccionado?.descripcion }}
                </div>
                <div class="col-md-12 mt-2">
                  <strong><i class="bi bi-geo-alt me-1"></i> Ubicación:</strong> {{ reporteSeleccionado?.ubicacion }}
                </div>
              </div>
            </div>

            <!-- Formulario de Registro Médico -->
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">
                  <i class="bi bi-clipboard-check me-1"></i> Tipo de Atención *
                </label>
                <select class="form-select" v-model="registroMedico.tipoAtencion" required>
                  <option value="">Seleccione...</option>
                  <option value="Consulta">Consulta</option>
                  <option value="Tratamiento">Tratamiento</option>
                  <option value="Vacunacion">Vacunación</option>
                  <option value="Alta">Alta Médica</option>
                </select>
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">
                  <i class="bi bi-flag me-1"></i> Estado del Reporte *
                </label>
                <select class="form-select" v-model="estadoReporte" required>
                  <option value="En_proceso">En Proceso</option>
                  <option value="Cerrado">Cerrado (Finalizar Caso)</option>
                </select>
                <small class="text-muted">Selecciona "Cerrado" si el caso está completo</small>
              </div>

              <div class="col-12 mb-3">
                <label class="form-label fw-bold">
                  <i class="bi bi-heart-pulse me-1"></i> Diagnóstico *
                </label>
                <textarea 
                  class="form-control" 
                  v-model="registroMedico.diagnostico"
                  rows="3"
                  placeholder="Describa el diagnóstico del animal..."
                  required
                  minlength="10"
                ></textarea>
                <small class="text-muted">Mínimo 10 caracteres</small>
              </div>

              <div class="col-12 mb-3">
                <label class="form-label fw-bold">
                  <i class="bi bi-prescription2 me-1"></i> Tratamiento *
                </label>
                <textarea 
                  class="form-control" 
                  v-model="registroMedico.tratamiento"
                  rows="3"
                  placeholder="Describa el tratamiento aplicado..."
                  required
                  minlength="10"
                ></textarea>
                <small class="text-muted">Mínimo 10 caracteres</small>
              </div>

              <div class="col-12 mb-3">
                <label class="form-label fw-bold">
                  <i class="bi bi-journal-text me-1"></i> Notas Adicionales
                </label>
                <textarea 
                  class="form-control" 
                  v-model="registroMedico.notas"
                  rows="2"
                  placeholder="Observaciones, recomendaciones o seguimiento..."
                ></textarea>
              </div>
            </div>

          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            <i class="bi bi-x-circle me-1"></i>Cancelar
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="guardarRegistroMedico"
            :disabled="guardando"
          >
            <span v-if="guardando" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-save me-1"></i>
            {{ guardando ? 'Guardando...' : 'Guardar Registro' }}
          </button>
        </div>

      </div>
    </div>
  </div>

  <!-- Modal para ver historial de registros médicos -->
  <div class="modal fade" id="modalHistorial" tabindex="-1">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header bg-info text-white">
          <h5 class="modal-title">
            <i class="bi bi-file-medical me-2"></i>
            Historial Médico - {{ reporteSeleccionado?.titulo }}
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <!-- Información del reporte -->
          <div class="alert alert-light border mb-4">
            <div class="row">
              <div class="col-md-6">
                <strong><i class="bi bi-file-text me-1"></i> Reporte:</strong> {{ reporteSeleccionado?.titulo }}
              </div>
              <div class="col-md-6">
                <strong><i class="bi bi-flag me-1"></i> Estado:</strong>
                <span class="badge ms-2" :class="`bg-${colorPorEstado(reporteSeleccionado?.estado)}`">
                  {{ formatearEstado(reporteSeleccionado?.estado) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Listado de registros médicos -->
          <div v-if="reporteSeleccionado?.registrosMedicos?.length > 0">
            <h6 class="mb-3">
              <i class="bi bi-journal-medical me-2"></i>
              Registros Médicos ({{ reporteSeleccionado.registrosMedicos.length }})
            </h6>
            <div class="accordion" id="accordionHistorial">
              <div 
                v-for="(registro, index) in reporteSeleccionado.registrosMedicos" 
                :key="registro.idRegistroMedico"
                class="accordion-item"
              >
                <h2 class="accordion-header">
                  <button 
                    class="accordion-button" 
                    :class="{ collapsed: index !== 0 }"
                    type="button" 
                    data-bs-toggle="collapse" 
                    :data-bs-target="`#collapse${index}`"
                  >
                    <div class="d-flex justify-content-between w-100 pe-3">
                      <span>
                        <i class="bi bi-calendar-event me-2"></i>
                        {{ formatearFecha(registro.fechaAtencion) }}
                      </span>
                      <span class="badge bg-primary">{{ registro.tipoAtencion }}</span>
                    </div>
                  </button>
                </h2>
                <div 
                  :id="`collapse${index}`" 
                  class="accordion-collapse collapse"
                  :class="{ show: index === 0 }"
                  data-bs-parent="#accordionHistorial"
                >
                  <div class="accordion-body">
                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label class="fw-bold text-primary">
                          <i class="bi bi-heart-pulse me-1"></i> Diagnóstico:
                        </label>
                        <p class="mb-0">{{ registro.diagnostico }}</p>
                      </div>
                      <div class="col-md-6 mb-3">
                        <label class="fw-bold text-success">
                          <i class="bi bi-prescription2 me-1"></i> Tratamiento:
                        </label>
                        <p class="mb-0">{{ registro.tratamiento }}</p>
                      </div>
                      <div class="col-12 mb-3" v-if="registro.notas">
                        <label class="fw-bold text-info">
                          <i class="bi bi-journal-text me-1"></i> Notas:
                        </label>
                        <p class="mb-0">{{ registro.notas }}</p>
                      </div>
                      <div class="col-12">
                        <div class="btn-group" role="group">
                          <button 
                            class="btn btn-sm btn-outline-primary" 
                            @click="abrirModalEditarRegistro(registro)"
                          >
                            <i class="bi bi-pencil me-1"></i>Editar
                          </button>
                          <button 
                            class="btn btn-sm btn-outline-danger" 
                            @click="eliminarRegistroMedico(registro)"
                          >
                            <i class="bi bi-trash me-1"></i>Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4 text-muted">
            <i class="bi bi-inbox fs-1 d-block mb-2"></i>
            No hay registros médicos para este reporte
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            <i class="bi bi-x-circle me-1"></i>Cerrar
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="abrirModalRegistroDesdeHistorial"
          >
            <i class="bi bi-clipboard-plus me-1"></i>Nuevo Registro
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para editar registro médico -->
  <div class="modal fade" id="modalEditarRegistro" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-warning text-dark">
          <h5 class="modal-title">
            <i class="bi bi-pencil-square me-2"></i>
            Editar Registro Médico
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="actualizarRegistroMedico">
            <!-- Fecha de atención (solo lectura) -->
            <div class="alert alert-info mb-4">
              <div class="row">
                <div class="col-md-12">
                  <strong><i class="bi bi-calendar-event me-1"></i> Fecha de Atención:</strong> 
                  {{ formatearFecha(registroEditando?.fechaAtencion) }}
                </div>
              </div>
            </div>

            <!-- Formulario de Edición -->
            <div class="row">
              <div class="col-12 mb-3">
                <label class="form-label fw-bold">
                  <i class="bi bi-clipboard-check me-1"></i> Tipo de Atención *
                </label>
                <select class="form-select" v-model="registroEditForm.tipoAtencion" required>
                  <option value="">Seleccione...</option>
                  <option value="Consulta">Consulta</option>
                  <option value="Tratamiento">Tratamiento</option>
                  <option value="Vacunacion">Vacunación</option>
                  <option value="Alta">Alta Médica</option>
                </select>
              </div>

              <div class="col-12 mb-3">
                <label class="form-label fw-bold">
                  <i class="bi bi-heart-pulse me-1"></i> Diagnóstico *
                </label>
                <textarea 
                  class="form-control" 
                  v-model="registroEditForm.diagnostico"
                  rows="3"
                  placeholder="Describa el diagnóstico del animal..."
                  required
                  minlength="10"
                ></textarea>
                <small class="text-muted">Mínimo 10 caracteres</small>
              </div>

              <div class="col-12 mb-3">
                <label class="form-label fw-bold">
                  <i class="bi bi-prescription2 me-1"></i> Tratamiento *
                </label>
                <textarea 
                  class="form-control" 
                  v-model="registroEditForm.tratamiento"
                  rows="3"
                  placeholder="Describa el tratamiento aplicado..."
                  required
                  minlength="10"
                ></textarea>
                <small class="text-muted">Mínimo 10 caracteres</small>
              </div>

              <div class="col-12 mb-3">
                <label class="form-label fw-bold">
                  <i class="bi bi-journal-text me-1"></i> Notas Adicionales
                </label>
                <textarea 
                  class="form-control" 
                  v-model="registroEditForm.notas"
                  rows="2"
                  placeholder="Observaciones, recomendaciones o seguimiento..."
                ></textarea>
              </div>
            </div>

          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            <i class="bi bi-x-circle me-1"></i>Cancelar
          </button>
          <button 
            type="button" 
            class="btn btn-warning" 
            @click="actualizarRegistroMedico"
            :disabled="guardando"
          >
            <span v-if="guardando" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-save me-1"></i>
            {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Modal } from 'bootstrap';
import Loading from '@/components/common/Loading.vue';
import reporteService from '@/services/reporteService';
import registroMedicoService from '@/services/registroMedicoService';
import veterinariaService from '@/services/veterinariaService';
import { alertaExito, alertaError, confirmar, manejarErrorAPI } from '@/utils/alertas';
import { formatearFecha, nombreCompleto } from '@/utils/helpers';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// Estado
const reportes = ref([]);
const cargando = ref(false);
const guardando = ref(false);
const filtroEstado = ref('');
const filtroBusqueda = ref('');
const filtroPeriodo = ref('');
const ordenamiento = ref('reciente');
const reportesAceptados = ref(new Set()); // Para trackear reportes aceptados localmente

// Paginación
const paginaActual = ref(1);
const itemsPorPagina = ref(10);

// Modal
let modalInstancia = null;
let modalHistorialInstancia = null;
let modalEditarRegistroInstancia = null;
const reporteSeleccionado = ref(null);
const estadoReporte = ref('En_proceso');
const registroEditando = ref(null);

// Formulario de Registro Médico
const registroMedico = ref({
  tipoAtencion: '',
  diagnostico: '',
  tratamiento: '',
  notas: ''
});

// Formulario de Edición de Registro Médico
const registroEditForm = ref({
  tipoAtencion: '',
  diagnostico: '',
  tratamiento: '',
  notas: ''
});

// Computed
const reportesFiltrados = computed(() => {
  let result = reportes.value.map(r => ({
    ...r,
    aceptadoPorVeterinaria: reportesAceptados.value.has(r.idReporte) || tieneRegistrosMedicos(r)
  }));

  // Filtro por búsqueda
  if (filtroBusqueda.value) {
    const busqueda = filtroBusqueda.value.toLowerCase();
    result = result.filter(r =>
      r.titulo.toLowerCase().includes(busqueda) ||
      r.descripcion.toLowerCase().includes(busqueda) ||
      (r.ubicacion && r.ubicacion.toLowerCase().includes(busqueda))
    );
  }

  // Filtro por estado
  if (filtroEstado.value) {
    if (filtroEstado.value === 'pendiente_aceptar') {
      result = result.filter(r => r.estado === 'En_proceso' && !r.aceptadoPorVeterinaria);
    } else {
      result = result.filter(r => r.estado === filtroEstado.value);
    }
  }

  // Filtro por periodo
  if (filtroPeriodo.value) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    result = result.filter(r => {
      const fechaReporte = new Date(r.fechaReporte);
      fechaReporte.setHours(0, 0, 0, 0);
      
      if (filtroPeriodo.value === 'hoy') {
        return fechaReporte.getTime() === hoy.getTime();
      } else if (filtroPeriodo.value === 'semana') {
        const semanaAtras = new Date(hoy);
        semanaAtras.setDate(semanaAtras.getDate() - 7);
        return fechaReporte >= semanaAtras;
      } else if (filtroPeriodo.value === 'mes') {
        const mesAtras = new Date(hoy);
        mesAtras.setMonth(mesAtras.getMonth() - 1);
        return fechaReporte >= mesAtras;
      }
      return true;
    });
  }

  // Ordenamiento
  if (ordenamiento.value === 'reciente') {
    result.sort((a, b) => new Date(b.fechaReporte) - new Date(a.fechaReporte));
  } else if (ordenamiento.value === 'antiguo') {
    result.sort((a, b) => new Date(a.fechaReporte) - new Date(b.fechaReporte));
  } else if (ordenamiento.value === 'titulo') {
    result.sort((a, b) => a.titulo.localeCompare(b.titulo));
  }

  return result;
});

// Estadísticas
const estadisticas = computed(() => {
  const todos = reportes.value.map(r => ({
    ...r,
    aceptadoPorVeterinaria: reportesAceptados.value.has(r.idReporte) || tieneRegistrosMedicos(r)
  }));

  return {
    pendientes: todos.filter(r => r.estado === 'En_proceso' && !r.aceptadoPorVeterinaria).length,
    enProceso: todos.filter(r => r.estado === 'En_proceso' && r.aceptadoPorVeterinaria).length,
    cerrados: todos.filter(r => r.estado === 'Cerrado').length,
    totalRegistros: todos.reduce((sum, r) => sum + (r.registrosMedicos?.length || 0), 0)
  };
});

// Paginación
const totalPaginas = computed(() => Math.ceil(reportesFiltrados.value.length / itemsPorPagina.value));

const reportesPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina.value;
  const fin = inicio + itemsPorPagina.value;
  return reportesFiltrados.value.slice(inicio, fin);
});

const paginas = computed(() => {
  const total = totalPaginas.value;
  const actual = paginaActual.value;
  const pages = [];
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (actual <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    } else if (actual >= total - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = actual - 1; i <= actual + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    }
  }
  
  return pages.filter(p => p !== '...' || pages.indexOf(p) === pages.lastIndexOf(p));
});

const onFiltroChange = () => {
  paginaActual.value = 1;
};

// Helper: Verificar si un reporte tiene registros médicos
const tieneRegistrosMedicos = (reporte) => {
  // Verificar si el reporte tiene el array de registros médicos
  return reporte.registrosMedicos && reporte.registrosMedicos.length > 0;
};

// Inicializar
onMounted(async () => {
  // Cargar reportes aceptados desde localStorage
  const aceptadosGuardados = localStorage.getItem('reportesAceptadosVet');
  if (aceptadosGuardados) {
    try {
      const ids = JSON.parse(aceptadosGuardados);
      reportesAceptados.value = new Set(ids);
    } catch (e) {
      console.warn('Error al cargar reportes aceptados:', e);
    }
  }
  
  await cargarReportes();
  
  // Inicializar modales
  const modalEl = document.getElementById('modalRegistroMedico');
  if (modalEl) {
    modalInstancia = new Modal(modalEl);
  }

  const modalHistorialEl = document.getElementById('modalHistorial');
  if (modalHistorialEl) {
    modalHistorialInstancia = new Modal(modalHistorialEl);
  }

  const modalEditarRegistroEl = document.getElementById('modalEditarRegistro');
  if (modalEditarRegistroEl) {
    modalEditarRegistroInstancia = new Modal(modalEditarRegistroEl);
  }
});

// Funciones principales
async function cargarReportes() {
  try {
    cargando.value = true;
    // Intentar obtener el id de veterinaria del usuario logueado
    let vetId = authStore.user?.veterinaria?.idVeterinaria || null;

    // Fallback: consultar la veterinaria por usuario si no está en el state
    if (!vetId && authStore.usuarioActual?.idUsuario) {
      try {
        const resp = await veterinariaService.getByUsuario(authStore.usuarioActual.idUsuario);
        vetId = resp?.data?.idVeterinaria || null;
      } catch (e) {
        console.warn('No se pudo obtener la veterinaria por usuario:', e);
      }
    }

    if (!vetId) {
      reportes.value = [];
      alertaError('Debe completar los datos de su clínica antes de gestionar reportes');
      // Redirigir a perfil veterinaria
      setTimeout(()=>{
        router.push({ name: 'VeterinariaPerfil' });
      },800);
      return;
    }

    // Cargar reportes por veterinaria usando el método nuevo; si falla, usar legacy
    let data = [];
    try {
      data = await reporteService.obtenerReportesPorVeterinaria(vetId);
    } catch (e) {
      const legacy = await reporteService.getByVeterinaria(vetId);
      data = legacy?.data || [];
    }

    reportes.value = Array.isArray(data) ? data : (data?.data || []);

    // Cargar registros médicos para cada reporte
    for (const reporte of reportes.value) {
      try {
        const registrosResponse = await registroMedicoService.getByReporte(reporte.idReporte);
        reporte.registrosMedicos = registrosResponse.data || [];
      } catch (e) {
        console.warn(`No se pudieron cargar registros médicos para reporte ${reporte.idReporte}:`, e);
        reporte.registrosMedicos = [];
      }
    }
  } catch (error) {
    console.error('Error al cargar reportes:', error);
    alertaError('Error al cargar reportes');
  } finally {
    cargando.value = false;
  }
}

async function aceptarReporte(reporte) {
  const confirmado = await confirmar(
    `¿Aceptar el caso "${reporte.titulo}"?`,
    'Podrás crear el registro médico después de aceptar'
  );
  if (!confirmado || !confirmado.isConfirmed) return;

  try {
    console.log('✅ Aceptando reporte:', reporte.idReporte);
    
    // Marcar como aceptado localmente
    reportesAceptados.value.add(reporte.idReporte);
    
    // Guardar en localStorage para persistencia
    localStorage.setItem(
      'reportesAceptadosVet', 
      JSON.stringify([...reportesAceptados.value])
    );
    
    console.log('📝 Reportes aceptados:', [...reportesAceptados.value]);
    
    alertaExito('Caso aceptado. Ahora puedes crear la consulta médica.');
  } catch (error) {
    console.error('❌ Error al aceptar reporte:', error);
    alertaError('Error al aceptar el reporte');
  }
}

async function rechazarReporte(reporte) {
  const confirmado = await confirmar(
    `¿Rechazar el caso "${reporte.titulo}"?`,
    'El reporte volverá a la organización para que asignen otra veterinaria'
  );
  if (!confirmado || !confirmado.isConfirmed) return;

  try {
    // Obtener datos actualizados del backend
    const { data: actual } = await reporteService.getById(reporte.idReporte);
    
    // Preparar payload quitando la veterinaria
    const payload = {
      titulo: actual.titulo,
      descripcion: actual.descripcion,
      ubicacion: actual.ubicacion,
      estado: 'En_proceso', // Sigue en proceso pero sin veterinaria
      usuario: actual.usuario ? { idUsuario: actual.usuario.idUsuario } : null,
      organizacion: actual.organizacion ? { idOrganizacion: actual.organizacion.idOrganizacion } : null,
      veterinaria: null // Quitar la veterinaria
    };

    // Solo agregar fotoUrl si existe
    if (actual.fotoUrl) {
      payload.fotoUrl = actual.fotoUrl;
    }

    await reporteService.update(reporte.idReporte, payload);
    alertaExito('Caso rechazado. La organización podrá asignar otra veterinaria.');
    await cargarReportes();
  } catch (error) {
    console.error('Error al rechazar reporte:', error);
    manejarErrorAPI(error);
  }
}

async function cerrarReporte(reporte) {
  const confirmado = await confirmar(
    `¿Finalizar el tratamiento de "${reporte.titulo}"?`,
    'El reporte se marcará como completado'
  );
  
  if (!confirmado || !confirmado.isConfirmed) return;
  
  await cerrarReporteAutomatico(reporte);
}

async function cerrarReporteAutomatico(reporte) {
  await actualizarEstadoReporte(reporte, 'Cerrado');
}

async function actualizarEstadoReporte(reporte, nuevoEstado) {
  try {
    // Obtener datos actualizados del backend
    const { data: actual } = await reporteService.getById(reporte.idReporte);
    
    const payload = {
      titulo: actual.titulo,
      descripcion: actual.descripcion,
      ubicacion: actual.ubicacion,
      estado: nuevoEstado,
      usuario: actual.usuario ? { idUsuario: actual.usuario.idUsuario } : null,
      organizacion: actual.organizacion ? { idOrganizacion: actual.organizacion.idOrganizacion } : null,
      veterinaria: actual.veterinaria ? { idVeterinaria: actual.veterinaria.idVeterinaria } : null
    };

    // Solo agregar fotoUrl si existe
    if (actual.fotoUrl) {
      payload.fotoUrl = actual.fotoUrl;
    }
    
    await reporteService.update(reporte.idReporte, payload);
    
    console.log(`✅ Reporte actualizado a estado: ${nuevoEstado}`);
  } catch (error) {
    console.error('Error al actualizar estado del reporte:', error);
    throw error;
  }
}

function abrirModalRegistro(reporte) {
  console.log('🔵 Abriendo modal para reporte:', reporte.idReporte);
  
  reporteSeleccionado.value = reporte;
  estadoReporte.value = reporte.estado || 'En_proceso';
  
  // Resetear formulario de registro médico
  registroMedico.value = {
    tipoAtencion: '',
    diagnostico: '',
    tratamiento: '',
    notas: ''
  };
  
  console.log('📋 Formulario reseteado');
  
  modalInstancia?.show();
}

function verRegistrosMedicos(reporte) {
  console.log('📋 Abriendo historial para reporte:', reporte.idReporte);
  reporteSeleccionado.value = reporte;
  modalHistorialInstancia?.show();
}

function abrirModalRegistroDesdeHistorial() {
  modalHistorialInstancia?.hide();
  setTimeout(() => {
    abrirModalRegistro(reporteSeleccionado.value);
  }, 300);
}

function abrirModalEditarRegistro(registro) {
  console.log('📝 Abriendo modal para editar registro:', registro.idRegistroMedico || registro.idRegistro);
  console.log('📋 Registro completo:', registro);
  
  registroEditando.value = registro;
  
  // Cargar datos del registro en el formulario
  registroEditForm.value = {
    tipoAtencion: registro.tipoAtencion,
    diagnostico: registro.diagnostico,
    tratamiento: registro.tratamiento,
    notas: registro.notas || ''
  };
  
  console.log('📝 Formulario cargado:', registroEditForm.value);
  
  // Cerrar modal de historial
  modalHistorialInstancia?.hide();
  
  // Abrir modal de edición
  setTimeout(() => {
    modalEditarRegistroInstancia?.show();
  }, 300);
}

async function actualizarRegistroMedico() {
  try {
    guardando.value = true;
    
    console.log('💾 Iniciando actualización de registro médico...');
    console.log('📋 Datos del formulario:', registroEditForm.value);
    
    // Validar campos obligatorios
    if (!registroEditForm.value.tipoAtencion) {
      console.warn('⚠️ Falta tipo de atención');
      alertaError('Debe seleccionar un tipo de atención');
      return;
    }
    
    if (!registroEditForm.value.diagnostico || registroEditForm.value.diagnostico.trim() === '') {
      console.warn('⚠️ Falta diagnóstico');
      alertaError('Debe ingresar un diagnóstico');
      return;
    }
    
    if (registroEditForm.value.diagnostico.trim().length < 10) {
      console.warn('⚠️ Diagnóstico muy corto');
      alertaError('El diagnóstico debe tener al menos 10 caracteres');
      return;
    }
    
    if (!registroEditForm.value.tratamiento || registroEditForm.value.tratamiento.trim() === '') {
      console.warn('⚠️ Falta tratamiento');
      alertaError('Debe ingresar un tratamiento');
      return;
    }
    
    if (registroEditForm.value.tratamiento.trim().length < 10) {
      console.warn('⚠️ Tratamiento muy corto');
      alertaError('El tratamiento debe tener al menos 10 caracteres');
      return;
    }
    
    console.log('✅ Validaciones pasadas');
    
    // Obtener el ID de la veterinaria del usuario actual
    let vetId = authStore.user?.veterinaria?.idVeterinaria || null;

    if (!vetId && authStore.usuarioActual?.idUsuario) {
      try {
        const resp = await veterinariaService.getByUsuario(authStore.usuarioActual.idUsuario);
        vetId = resp?.data?.idVeterinaria || null;
      } catch (e) {
        console.warn('No se pudo obtener la veterinaria por usuario:', e);
      }
    }

    if (!vetId) {
      console.error('❌ No se pudo obtener el ID de veterinaria');
      alertaError('No se pudo obtener el ID de su veterinaria');
      return;
    }
    
    console.log('🏥 ID Veterinaria:', vetId);
    
    // Obtener el ID correcto del registro (puede ser idRegistroMedico o idRegistro)
    const idRegistro = registroEditando.value.idRegistroMedico || registroEditando.value.idRegistro;
    
    console.log('📄 ID Registro:', idRegistro);
    console.log('📄 ID Reporte:', registroEditando.value.reporte?.idReporte);
    console.log('📋 Registro editando completo:', JSON.stringify(registroEditando.value, null, 2));
    
    if (!idRegistro) {
      console.error('❌ No se pudo obtener el ID del registro médico');
      alertaError('Error: No se pudo identificar el registro médico');
      return;
    }
    
    // Preparar payload para actualización con la estructura exacta que espera el backend
    const payloadRegistro = {
      reporte: {
        idReporte: registroEditando.value.reporte.idReporte
      },
      veterinaria: {
        idVeterinaria: vetId
      },
      tipoAtencion: registroEditForm.value.tipoAtencion,
      diagnostico: registroEditForm.value.diagnostico.trim(),
      tratamiento: registroEditForm.value.tratamiento.trim(),
      notas: registroEditForm.value.notas ? registroEditForm.value.notas.trim() : null
    };

    console.log('📤 Payload a enviar:', JSON.stringify(payloadRegistro, null, 2));
    
    const response = await registroMedicoService.update(idRegistro, payloadRegistro);
    
    console.log('✅ Registro médico actualizado exitosamente');
    console.log('📥 Respuesta del servidor:', response);
    
    alertaExito('Registro médico actualizado exitosamente.');
    
    // Cerrar el modal
    modalEditarRegistroInstancia?.hide();
    
    // Recargar reportes para mostrar cambios
    await cargarReportes();
    
    // Volver a abrir el historial
    setTimeout(() => {
      const reporteActualizado = reportes.value.find(r => r.idReporte === registroEditando.value.reporte.idReporte);
      if (reporteActualizado) {
        verRegistrosMedicos(reporteActualizado);
      }
    }, 500);
    
  } catch (error) {
    console.error('❌ Error al actualizar registro médico:', error);
    console.error('📋 Respuesta del servidor:', error.response?.data);
    console.error('📊 Status:', error.response?.status);
    
    // Mostrar error más específico
    if (error.response?.data?.message) {
      alertaError(`Error: ${error.response.data.message}`);
    } else if (error.response?.status === 400) {
      alertaError('Error de validación. Verifica que todos los campos estén correctos.');
    } else if (error.response?.status === 500) {
      alertaError('Error en el servidor. Contacta al administrador.');
    } else {
      manejarErrorAPI(error);
    }
  } finally {
    guardando.value = false;
  }
}

async function guardarRegistroMedico() {
  try {
    guardando.value = true;
    
    console.log('💾 Iniciando guardado de registro médico...');
    console.log('📋 Datos del formulario:', registroMedico.value);
    
    // Validar campos obligatorios
    if (!registroMedico.value.tipoAtencion) {
      console.warn('⚠️ Falta tipo de atención');
      alertaError('Debe seleccionar un tipo de atención');
      return;
    }
    
    if (!registroMedico.value.diagnostico || registroMedico.value.diagnostico.trim() === '') {
      console.warn('⚠️ Falta diagnóstico');
      alertaError('Debe ingresar un diagnóstico');
      return;
    }
    
    if (registroMedico.value.diagnostico.trim().length < 10) {
      console.warn('⚠️ Diagnóstico muy corto');
      alertaError('El diagnóstico debe tener al menos 10 caracteres');
      return;
    }
    
    if (!registroMedico.value.tratamiento || registroMedico.value.tratamiento.trim() === '') {
      console.warn('⚠️ Falta tratamiento');
      alertaError('Debe ingresar un tratamiento');
      return;
    }
    
    if (registroMedico.value.tratamiento.trim().length < 10) {
      console.warn('⚠️ Tratamiento muy corto');
      alertaError('El tratamiento debe tener al menos 10 caracteres');
      return;
    }
    
    console.log('✅ Validaciones pasadas');
    
    // Obtener el ID de la veterinaria del usuario actual
    let vetId = authStore.user?.veterinaria?.idVeterinaria || null;

    if (!vetId && authStore.usuarioActual?.idUsuario) {
      try {
        const resp = await veterinariaService.getByUsuario(authStore.usuarioActual.idUsuario);
        vetId = resp?.data?.idVeterinaria || null;
      } catch (e) {
        console.warn('No se pudo obtener la veterinaria por usuario:', e);
      }
    }

    if (!vetId) {
      console.error('❌ No se pudo obtener el ID de veterinaria');
      alertaError('No se pudo obtener el ID de su veterinaria');
      return;
    }
    
    console.log('🏥 ID Veterinaria:', vetId);
    console.log('📄 ID Reporte:', reporteSeleccionado.value.idReporte);
    
    // Crear registro médico asociado al reporte
    // El backend espera exactamente esta estructura según el modelo JPA
    const payloadRegistro = {
      reporte: {
        idReporte: reporteSeleccionado.value.idReporte
      },
      veterinaria: {
        idVeterinaria: vetId
      },
      tipoAtencion: registroMedico.value.tipoAtencion,
      diagnostico: registroMedico.value.diagnostico.trim(),
      tratamiento: registroMedico.value.tratamiento.trim(),
      notas: registroMedico.value.notas ? registroMedico.value.notas.trim() : null
      // NO enviamos fechaAtencion, el backend la genera automáticamente con @PrePersist
    };

    console.log('📤 Payload a enviar:', JSON.stringify(payloadRegistro, null, 2));
    
    await registroMedicoService.create(payloadRegistro);
    
    console.log('✅ Registro médico creado exitosamente');
    
    // Actualizar el estado del reporte según lo seleccionado
    if (estadoReporte.value === 'Cerrado') {
      console.log('🔒 Actualizando reporte a estado Cerrado...');
      await actualizarEstadoReporte(reporteSeleccionado.value, 'Cerrado');
      alertaExito('Registro médico creado y caso cerrado exitosamente.');
      
      // Limpiar del localStorage ya que el caso está cerrado
      reportesAceptados.value.delete(reporteSeleccionado.value.idReporte);
      localStorage.setItem(
        'reportesAceptadosVet', 
        JSON.stringify([...reportesAceptados.value])
      );
    } else {
      alertaExito('Registro médico creado exitosamente.');
    }
    
    // Cerrar el modal
    modalInstancia?.hide();
    
    // Limpiar formulario
    registroMedico.value = {
      tipoAtencion: '',
      diagnostico: '',
      tratamiento: '',
      notas: ''
    };
    estadoReporte.value = 'En_proceso';
    
    await cargarReportes();
    
  } catch (error) {
    console.error('❌ Error al guardar registro médico:', error);
    console.error('📋 Respuesta del servidor:', error.response?.data);
    console.error('📊 Status:', error.response?.status);
    console.error('🔍 Detalles completos:', error.response);
    
    // Mostrar error más específico
    if (error.response?.data?.message) {
      alertaError(`Error: ${error.response.data.message}`);
    } else if (error.response?.status === 400) {
      alertaError('Error de validación. Verifica que todos los campos estén correctos.');
    } else if (error.response?.status === 500) {
      alertaError('Error en el servidor. Contacta al administrador.');
    } else {
      manejarErrorAPI(error);
    }
  } finally {
    guardando.value = false;
  }
}

async function eliminarRegistroMedico(registro) {
  const confirmado = await confirmar(
    `¿Eliminar este registro médico?`,
    `Se eliminará permanentemente el registro del ${formatearFecha(registro.fechaAtencion)}`
  );
  
  if (!confirmado || !confirmado.isConfirmed) return;

  try {
    // Obtener el ID correcto del registro (puede ser idRegistroMedico o idRegistro)
    const idRegistro = registro.idRegistroMedico || registro.idRegistro;
    
    console.log('🗑️ Eliminando registro médico con ID:', idRegistro);
    console.log('📋 Registro completo:', JSON.stringify(registro, null, 2));
    
    if (!idRegistro) {
      console.error('❌ No se pudo obtener el ID del registro médico');
      alertaError('Error: No se pudo identificar el registro médico');
      return;
    }
    
    // Usar el método correcto del servicio
    await registroMedicoService.eliminar(idRegistro);
    
    console.log('✅ Registro médico eliminado exitosamente');
    
    alertaExito('Registro médico eliminado exitosamente.');
    
    // Recargar reportes para actualizar la lista
    await cargarReportes();
    
    // Volver a abrir el historial actualizado
    const reporteActualizado = reportes.value.find(r => r.idReporte === registro.reporte.idReporte);
    if (reporteActualizado) {
      // Si ya no tiene registros médicos, cerrar el modal
      if (!reporteActualizado.registrosMedicos || reporteActualizado.registrosMedicos.length === 0) {
        modalHistorialInstancia?.hide();
      } else {
        verRegistrosMedicos(reporteActualizado);
      }
    }
    
  } catch (error) {
    console.error('❌ Error al eliminar registro médico:', error);
    manejarErrorAPI(error);
  }
}

// Funciones de utilidad
function formatearEstado(estado) {
  if (!estado) return 'N/A';
  const estados = {
    'Pendiente': 'Pendiente',
    'En_proceso': 'En Proceso',
    'Cerrado': 'Cerrado'
  };
  return estados[estado] || estado.replace(/_/g, ' ');
}

function colorPorEstado(estado) {
  if (!estado) return 'secondary';
  const colores = {
    'Pendiente': 'warning',
    'En_proceso': 'info',
    'Cerrado': 'success'
  };
  return colores[estado] || 'secondary';
}

function iconoPorEstado(estado) {
  const iconos = {
    'Pendiente': 'bi-hourglass-split',
    'En_proceso': 'bi-arrow-repeat',
    'Cerrado': 'bi-check-circle-fill'
  };
  return iconos[estado] || 'bi-flag';
}

function truncar(texto, max) {
  if (!texto) return 'N/A';
  return texto.length > max ? texto.substring(0, max) + '...' : texto;
}

function verFoto(url) {
  window.open(url, '_blank');
}
</script>

<style scoped>
/* Veterinaria Reportes - Diseño Profesional */
.veterinaria-reportes {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* Header */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  margin-bottom: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: white;
}

.header-subtitle {
  font-size: 0.95rem;
  opacity: 0.95;
  color: rgba(255, 255, 255, 0.9);
}

/* Stats Cards */
.stats-card {
  border-radius: 15px;
  padding: 1.5rem;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bg-gradient-info {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.bg-gradient-success {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.bg-gradient-warning {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stats-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

.stats-content {
  flex: 1;
}

.stats-number {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  line-height: 1;
}

.stats-label {
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
  opacity: 0.9;
}

/* Filter Card */
.filter-card {
  border: none;
  border-radius: 15px;
  overflow: hidden;
}

.filter-card .card-body {
  padding: 1.5rem;
}

.form-label {
  font-size: 0.875rem;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.form-control, .form-select {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 0.625rem 0.875rem;
  transition: all 0.3s ease;
}

.form-control:focus, .form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Table Card */
.table-card {
  border: none;
  border-radius: 15px;
  overflow: hidden;
}

.table-card .card-header {
  padding: 1.25rem 1.5rem;
}

.table-card .card-header h5 {
  color: #2d3748;
  font-weight: 600;
  font-size: 1.125rem;
}

.table {
  margin-bottom: 0;
}

.table thead th {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 1rem 0.75rem;
}

.table tbody td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
  font-size: 0.9rem;
  color: #2d3748;
}

.table-row {
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: rgba(102, 126, 234, 0.05);
}

/* Badges */
.badge-status {
  padding: 0.5rem 0.875rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.8125rem;
}

.badge-warning {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  color: #fff;
}

.badge-info {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
}

.badge-success {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #fff;
}

.badge-org {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #2d3748;
  padding: 0.5rem 0.875rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.8125rem;
}

/* Buttons */
.btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-success {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  border: none;
}

.btn-success:hover {
  background: linear-gradient(135deg, #38f9d7 0%, #43e97b 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(67, 233, 123, 0.3);
}

.btn-danger {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  border: none;
}

.btn-danger:hover {
  background: linear-gradient(135deg, #fee140 0%, #fa709a 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(250, 112, 154, 0.3);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

.btn-info {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  color: white;
}

.btn-info:hover {
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(79, 172, 254, 0.3);
  color: white;
}

.btn-outline-info {
  border: 2px solid #4facfe;
  color: #4facfe;
}

.btn-outline-info:hover {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-color: transparent;
  color: white;
}

.btn-group .btn {
  border-radius: 0;
}

.btn-group .btn:first-child {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

.btn-group .btn:last-child {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

/* Empty State */
.empty-state {
  padding: 3rem 1rem;
}

.empty-state i {
  opacity: 0.3;
}

/* Pagination */
.pagination {
  gap: 0.25rem;
}

.page-link {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  color: #4a5568;
  padding: 0.5rem 0.875rem;
  margin: 0 0.125rem;
  transition: all 0.3s ease;
}

.page-link:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
}

.page-item.active .page-link {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
}

.page-item.disabled .page-link {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Card Footer */
.card-footer {
  padding: 1rem 1.5rem;
}

/* Accordion customization */
.accordion-button:not(.collapsed) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.accordion-button:focus {
  box-shadow: 0 0 0 0.25rem rgba(79, 172, 254, 0.25);
}

.btn-outline-danger:hover {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  border-color: transparent;
  color: white;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .header-title {
    font-size: 1.5rem;
  }
  
  .stats-card {
    margin-bottom: 1rem;
  }
  
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .btn-group {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  
  .btn-group .btn {
    border-radius: 8px !important;
    margin-bottom: 0.25rem;
  }
}
</style>
