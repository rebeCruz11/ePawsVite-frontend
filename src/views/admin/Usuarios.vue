<template>
  <div class="users-page fade-in">
    <Loading v-if="cargando" />
    
    <div v-else>
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-title">
            <div class="title-icon">
              <i class="bi bi-people-fill"></i>
            </div>
            <div>
              <h2>Gestion de Usuarios</h2>
              <p class="text-muted mb-0">Administra todos los usuarios del sistema</p>
            </div>
          </div>
          <button class="btn-add-modern" @click="abrirModal()">
            <i class="bi bi-plus-circle"></i>
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>
      
      <!-- Stats -->
      <div class="users-stats mb-4">
        <div class="stat-badge">
          <i class="bi bi-people-fill"></i>
          <span>{{ usuarios.length }} Usuarios totales</span>
        </div>
        <div class="stat-badge danger">
          <i class="bi bi-shield-check"></i>
          <span>{{ usuarios.filter(u => u.rol.idRol === 1).length }} Administradores</span>
        </div>
        <div class="stat-badge primary">
          <i class="bi bi-building"></i>
          <span>{{ usuarios.filter(u => u.rol.idRol === 2).length }} Organizaciones</span>
        </div>
        <div class="stat-badge success">
          <i class="bi bi-heart-pulse"></i>
          <span>{{ usuarios.filter(u => u.rol.idRol === 3).length }} Veterinarias</span>
        </div>
        <div class="stat-badge info">
          <i class="bi bi-person"></i>
          <span>{{ usuarios.filter(u => u.rol.idRol === 4).length }} Clientes</span>
        </div>
      </div>
      
      <!-- Filtros Modernos -->
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
              placeholder="Nombre, correo, telefono..."
              @input="filtrarUsuarios"
            >
          </div>
          
          <div class="filter-group">
            <label class="filter-label">
              <i class="bi bi-shield"></i>
              Rol
            </label>
            <select class="filter-select" v-model="filtroRol" @change="filtrarUsuarios">
              <option value="">Todos los roles</option>
              <option value="1">Administrador</option>
              <option value="2">Organizacion</option>
              <option value="3">Veterinaria</option>
              <option value="4">Cliente</option>
            </select>
          </div>
          
          <button class="btn-clear-filters" @click="limpiarFiltros" v-if="busqueda || filtroRol">
            <i class="bi bi-x-circle"></i>
            <span>Limpiar</span>
          </button>
        </div>
      </div>
      
      <!-- Tabla Moderna -->
      <div class="table-card">
        <div class="table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Telefono</th>
                <th>Rol</th>
                <th>Direccion</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="usuario in usuariosPaginados" :key="usuario.idUsuario" class="table-row-hover">
                <td>
                  <div class="user-cell">
                    <div class="user-avatar" :class="`avatar-${colorRol(usuario.rol.idRol)}`">
                      {{ obtenerIniciales(usuario) }}
                    </div>
                    <div class="user-info">
                      <div class="user-name">{{ usuario.nombre }} {{ usuario.apellido }}</div>
                      <div class="user-id">ID: {{ usuario.idUsuario }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="email-cell">
                    <i class="bi bi-envelope"></i>
                    <span>{{ usuario.correo }}</span>
                  </div>
                </td>
                <td>
                  <div class="phone-cell">
                    <i class="bi bi-telephone"></i>
                    <span>{{ usuario.telefono }}</span>
                  </div>
                </td>
                <td>
                  <span class="role-badge" :class="`role-${colorRol(usuario.rol.idRol)}`">
                    <i :class="iconoRol(usuario.rol.idRol)"></i>
                    {{ nombreRol(usuario.rol.idRol) }}
                  </span>
                </td>
                <td>
                  <div class="address-cell" :title="usuario.direccion">
                    <i class="bi bi-geo-alt"></i>
                    <span>{{ truncar(usuario.direccion, 30) }}</span>
                  </div>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      class="btn-action edit" 
                      @click="abrirModal(usuario)"
                      title="Editar usuario"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button 
                      class="btn-action delete" 
                      @click="eliminarUsuario(usuario)"
                      title="Eliminar usuario"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="usuariosFiltrados.length === 0">
                <td colspan="6" class="empty-state">
                  <div class="empty-content">
                    <i class="bi bi-inbox"></i>
                    <p>No se encontraron usuarios</p>
                    <small>Intenta ajustar los filtros</small>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Paginacion -->
        <Pagination 
          v-if="totalPaginas > 1"
          :pagina-actual="paginaActual"
          :total-paginas="totalPaginas"
          :total-items="usuariosFiltrados.length"
          @cambiar-pagina="cambiarPagina"
        />
      </div>
    </div>
    
    <!-- Modal para crear/editar -->
    <div class="modal fade" id="usuarioModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-person me-2"></i>
              {{ modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="guardarUsuario">
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="nombre" class="form-label">Nombre *</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="nombre" 
                    v-model="form.nombre"
                    :class="{ 'is-invalid': errores.nombre }"
                    required
                  >
                  <div class="invalid-feedback">{{ errores.nombre }}</div>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="apellido" class="form-label">Apellido *</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="apellido" 
                    v-model="form.apellido"
                    :class="{ 'is-invalid': errores.apellido }"
                    required
                  >
                  <div class="invalid-feedback">{{ errores.apellido }}</div>
                </div>
              </div>
              
              <div class="mb-3">
                <label for="correo" class="form-label">Correo Electrónico *</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="correo" 
                  v-model="form.correo"
                  :class="{ 'is-invalid': errores.correo }"
                  required
                >
                <div class="invalid-feedback">{{ errores.correo }}</div>
              </div>
              
              <div class="mb-3" v-if="!modoEdicion">
                <label for="contrasena" class="form-label">Contraseña *</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="contrasena" 
                  v-model="form.contrasena"
                  :class="{ 'is-invalid': errores.contrasena }"
                  :required="!modoEdicion"
                >
                <div class="invalid-feedback">{{ errores.contrasena }}</div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="telefono" class="form-label">Teléfono *</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="telefono" 
                    v-model="form.telefono"
                    :class="{ 'is-invalid': errores.telefono }"
                    placeholder="7777-7777"
                    maxlength="9"
                    required
                  >
                  <div class="invalid-feedback">{{ errores.telefono }}</div>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="rol" class="form-label">Rol *</label>
                  <select 
                    class="form-select" 
                    id="rol" 
                    v-model="form.idRol"
                    :class="{ 'is-invalid': errores.rol }"
                    required
                  >
                    <option value="">Seleccione...</option>
                    <option :value="1">Administrador</option>
                    <option :value="2">Organización</option>
                    <option :value="3">Veterinaria</option>
                    <option :value="4">Cliente</option>
                  </select>
                  <div class="invalid-feedback">{{ errores.rol }}</div>
                </div>
              </div>
              
              <div class="mb-3">
                <label for="direccion" class="form-label">Dirección *</label>
                <textarea 
                  class="form-control" 
                  id="direccion" 
                  v-model="form.direccion"
                  :class="{ 'is-invalid': errores.direccion }"
                  rows="2"
                  required
                ></textarea>
                <div class="invalid-feedback">{{ errores.direccion }}</div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="guardando">
                <span v-if="guardando">
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Guardando...
                </span>
                <span v-else>
                  <i class="bi bi-save me-2"></i>
                  Guardar
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import Loading from '../../components/common/Loading.vue';
import Pagination from '../../components/common/Pagination.vue';
import usuarioService from '../../services/usuarioService';
import { alertaExito, confirmarEliminar, manejarErrorAPI, toast, alertaError } from '../../utils/alertas';
import { validarUsuario } from '../../utils/validaciones';
import { nombreRol, truncar, obtenerIniciales, filtrarPorBusqueda, paginar, calcularTotalPaginas } from '../../utils/helpers';

export default {
  name: 'AdminUsuarios',
  components: {
    Loading,
    Pagination
  },
  setup() {
    const cargando = ref(true);
    const guardando = ref(false);
    const usuarios = ref([]);
    const busqueda = ref('');
    const filtroRol = ref('');
    const paginaActual = ref(1);
    const itemsPorPagina = 10;
    
    const form = ref({
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      telefono: '',
      direccion: '',
      idRol: ''
    });
    
    const errores = ref({});
    const modoEdicion = ref(false);
    const usuarioEditando = ref(null);
    let modal = null;
    
    const usuariosFiltrados = computed(() => {
      let resultado = usuarios.value;
      
      // Filtrar por búsqueda
      if (busqueda.value) {
        resultado = filtrarPorBusqueda(resultado, busqueda.value, ['nombre', 'apellido', 'correo', 'telefono']);
      }
      
      // Filtrar por rol
      if (filtroRol.value) {
        resultado = resultado.filter(u => u.rol.idRol === parseInt(filtroRol.value));
      }
      
      return resultado;
    });
    
    const totalPaginas = computed(() => {
      return calcularTotalPaginas(usuariosFiltrados.value.length, itemsPorPagina);
    });
    
    const usuariosPaginados = computed(() => {
      return paginar(usuariosFiltrados.value, paginaActual.value, itemsPorPagina);
    });
    
    const cargarUsuarios = async () => {
      try {
        const response = await usuarioService.getAll();
        usuarios.value = response.data;
      } catch (error) {
        manejarErrorAPI(error);
      } finally {
        cargando.value = false;
      }
    };
    
    const abrirModal = (usuario = null) => {
      if (usuario) {
        modoEdicion.value = true;
        usuarioEditando.value = usuario;
        form.value = {
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          contrasena: '',
          telefono: usuario.telefono,
          direccion: usuario.direccion,
          idRol: usuario.rol.idRol
        };
      } else {
        modoEdicion.value = false;
        usuarioEditando.value = null;
        form.value = {
          nombre: '',
          apellido: '',
          correo: '',
          contrasena: '',
          telefono: '',
          direccion: '',
          idRol: ''
        };
      }
      
      errores.value = {};
      modal.show();
    };
    
    const guardarUsuario = async () => {
      // Validar formulario
      const usuario = {
        ...form.value,
        rol: { idRol: form.value.idRol }
      };
      errores.value = validarUsuario(usuario);
      // Si estamos en edición, permitir contraseña vacía (no cambiar)
      if (modoEdicion.value && errores.value.contrasena) {
        delete errores.value.contrasena;
      }

      if (Object.keys(errores.value).length > 0) {
        const mensajes = Object.values(errores.value).join('\n');
        await alertaError(mensajes, 'Errores en el formulario');
        return;
      }
      
      guardando.value = true;
      
      try {
        const datos = {
          nombre: form.value.nombre,
          apellido: form.value.apellido,
          correo: form.value.correo,
          contrasena: form.value.contrasena || 'default123',
          telefono: form.value.telefono,
          direccion: form.value.direccion,
          rol: {
            idRol: parseInt(form.value.idRol)
          }
        };
        
        if (modoEdicion.value) {
          await usuarioService.update(usuarioEditando.value.idUsuario, datos);
          toast('Usuario actualizado correctamente', 'success');
        } else {
          await usuarioService.create(datos);
          toast('Usuario creado correctamente', 'success');
        }
        
        modal.hide();
        await cargarUsuarios();
      } catch (error) {
        manejarErrorAPI(error);
      } finally {
        guardando.value = false;
      }
    };
    
    const eliminarUsuario = async (usuario) => {
      const result = await confirmarEliminar(`¿Deseas eliminar al usuario ${usuario.nombre} ${usuario.apellido}?`);
      
      if (result.isConfirmed) {
        try {
          await usuarioService.delete(usuario.idUsuario);
          toast('Usuario eliminado correctamente', 'success');
          await cargarUsuarios();
        } catch (error) {
          manejarErrorAPI(error);
        }
      }
    };
    
    const filtrarUsuarios = () => {
      paginaActual.value = 1;
    };
    
    const limpiarFiltros = () => {
      busqueda.value = '';
      filtroRol.value = '';
      paginaActual.value = 1;
    };
    
    const cambiarPagina = (pagina) => {
      paginaActual.value = pagina;
    };
    
    const colorRol = (idRol) => {
      const colores = {
        1: 'danger',
        2: 'primary',
        3: 'success',
        4: 'info'
      };
      return colores[idRol] || 'secondary';
    };
    
    const iconoRol = (idRol) => {
      const iconos = {
        1: 'bi bi-shield-check',
        2: 'bi bi-building',
        3: 'bi bi-heart-pulse',
        4: 'bi bi-person'
      };
      return iconos[idRol] || 'bi bi-person';
    };
    
    onMounted(async () => {
      await cargarUsuarios();
      modal = new Modal(document.getElementById('usuarioModal'));
    });
    
    return {
      cargando,
      guardando,
      usuarios,
      busqueda,
      filtroRol,
      paginaActual,
      usuariosFiltrados,
      totalPaginas,
      usuariosPaginados,
      form,
      errores,
      modoEdicion,
      abrirModal,
      guardarUsuario,
      eliminarUsuario,
      filtrarUsuarios,
      limpiarFiltros,
      cambiarPagina,
      colorRol,
      iconoRol,
      nombreRol,
      truncar,
      obtenerIniciales
    };
  }
}
</script>

<style scoped>
.users-page {
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

.btn-add-modern {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-add-modern:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.users-stats {
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

.stat-badge.danger { color: #dc3545; }
.stat-badge.primary { color: #667eea; }
.stat-badge.success { color: #28a745; }
.stat-badge.info { color: #17a2b8; }

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

.filter-input,
.filter-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.filter-input:focus,
.filter-select:focus {
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
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  color: white;
  flex-shrink: 0;
}

.user-avatar.avatar-danger { background: linear-gradient(135deg, #dc3545, #c82333); }
.user-avatar.avatar-primary { background: linear-gradient(135deg, #667eea, #764ba2); }
.user-avatar.avatar-success { background: linear-gradient(135deg, #28a745, #20c997); }
.user-avatar.avatar-info { background: linear-gradient(135deg, #17a2b8, #138496); }

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

.user-id {
  font-size: 0.75rem;
  color: #6c757d;
}

.email-cell,
.phone-cell,
.address-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #495057;
  font-size: 0.9rem;
}

.email-cell i,
.phone-cell i,
.address-cell i {
  color: #6c757d;
  font-size: 1rem;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  white-space: nowrap;
}

.role-badge.role-danger { background: rgba(220, 53, 69, 0.1); color: #dc3545; }
.role-badge.role-primary { background: rgba(102, 126, 234, 0.1); color: #667eea; }
.role-badge.role-success { background: rgba(40, 167, 69, 0.1); color: #28a745; }
.role-badge.role-info { background: rgba(23, 162, 184, 0.1); color: #17a2b8; }

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

.btn-action.edit {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.btn-action.edit:hover {
  background: #ffc107;
  color: white;
  transform: scale(1.1);
}

.btn-action.delete {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.btn-action.delete:hover {
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

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn-add-modern {
    justify-content: center;
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
    font-size: 0.875rem;
  }
}
</style>