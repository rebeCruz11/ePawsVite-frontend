<template>
  <div class="fade-in">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-people me-2"></i>Gestión de Usuarios</h2>
      <button class="btn btn-primary" @click="abrirModal()">
        <i class="bi bi-plus-circle me-2"></i>
        Nuevo Usuario
      </button>
    </div>
    
    <!-- Búsqueda y filtros -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input 
                type="text" 
                class="form-control" 
                v-model="busqueda"
                placeholder="Buscar por nombre, correo..."
                @input="filtrarUsuarios"
              >
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="filtroRol" @change="filtrarUsuarios">
              <option value="">Todos los roles</option>
              <option value="1">Cliente</option>
              <option value="2">Organización</option>
              <option value="3">Veterinaria</option>
              <option value="4">Administrador</option>
            </select>
          </div>
          <div class="col-md-3">
            <button class="btn btn-secondary w-100" @click="limpiarFiltros">
              <i class="bi bi-x-circle me-2"></i>
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <Loading v-if="cargando" />
    
    <!-- Tabla de usuarios -->
    <div v-else class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="usuario in usuariosPaginados" :key="usuario.idUsuario">
                <td>{{ usuario.idUsuario }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="avatar me-2">{{ obtenerIniciales(usuario) }}</div>
                    {{ usuario.nombre }} {{ usuario.apellido }}
                  </div>
                </td>
                <td>{{ usuario.correo }}</td>
                <td>{{ usuario.telefono }}</td>
                <td>
                  <span class="badge" :class="`bg-${colorRol(usuario.rol.idRol)}`">
                    {{ nombreRol(usuario.rol.idRol) }}
                  </span>
                </td>
                <td>{{ truncar(usuario.direccion, 30) }}</td>
                <td>
                  <button 
                    class="btn btn-sm btn-warning me-1" 
                    @click="abrirModal(usuario)"
                    title="Editar"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-danger" 
                    @click="eliminarUsuario(usuario)"
                    title="Eliminar"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="usuariosFiltrados.length === 0">
                <td colspan="7" class="text-center text-muted py-4">
                  <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                  No se encontraron usuarios
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Paginación -->
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
import { alertaExito, confirmarEliminar, manejarErrorAPI, toast } from '../../utils/alertas';
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
      
      if (Object.keys(errores.value).length > 0) {
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
      nombreRol,
      truncar,
      obtenerIniciales
    };
  }
}
</script>
