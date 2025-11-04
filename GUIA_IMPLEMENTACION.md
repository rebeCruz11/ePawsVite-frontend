# Guía de Implementación - Vistas Restantes

Este archivo contiene plantillas para las vistas restantes del proyecto. Puedes copiar y adaptar estos templates.

## VISTAS FALTANTES POR IMPLEMENTAR

### Admin (src/views/admin/)
- ✅ Dashboard.vue (completado con gráficos)
- ✅ Usuarios.vue (completado con CRUD completo)
- ⚠️ Organizaciones.vue (similar a Usuarios.vue)
- ⚠️ Veterinarias.vue (similar a Usuarios.vue)
- ⚠️ Animales.vue (similar a Usuarios.vue)
- ⚠️ Adopciones.vue (tabla con opciones para aprobar/rechazar)
- ⚠️ Reportes.vue (tabla con asignación y cambio de estado)

### Organización (src/views/organizacion/)
- ⚠️ Dashboard.vue (stats de sus animales y adopciones)
- ⚠️ Animales.vue (CRUD de animales de su organización)
- ⚠️ Adopciones.vue (gestionar adopciones de sus animales)
- ⚠️ Reportes.vue (ver reportes asignados a su organización)
- ⚠️ Perfil.vue (ver y editar datos de la organización)

### Veterinaria (src/views/veterinaria/)
- ⚠️ Dashboard.vue (stats de reportes y registros médicos)
- ⚠️ Reportes.vue (ver reportes asignados)
- ⚠️ RegistrosMedicos.vue (CRUD de registros médicos)
- ⚠️ Perfil.vue (ver y editar datos de la veterinaria)

### Cliente (src/views/cliente/)
- ⚠️ Dashboard.vue (resumen de sus adopciones y reportes)
- ✅ Animales.vue (completado)
- ⚠️ MisAdopciones.vue (tabla de solicitudes)
- ✅ CrearReporte.vue (completado)
- ⚠️ MisReportes.vue (tabla de reportes creados)

---

## TEMPLATE GENÉRICO PARA TABLA CON CRUD

```vue
<template>
  <div class="fade-in">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="bi bi-ICONO me-2"></i>TITULO</h2>
      <button class="btn btn-primary" @click="abrirModal()">
        <i class="bi bi-plus-circle me-2"></i>
        Nuevo ENTIDAD
      </button>
    </div>
    
    <Loading v-if="cargando" />
    
    <div v-else class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Columna 1</th>
                <th>Columna 2</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id">
                <td>{{ item.campo1 }}</td>
                <td>{{ item.campo2 }}</td>
                <td>
                  <button class="btn btn-sm btn-warning me-1" @click="abrirModal(item)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" @click="eliminar(item)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import Loading from '../../components/common/Loading.vue';
import service from '../../services/SERVICE';
import { alertaExito, confirmarEliminar, manejarErrorAPI, toast } from '../../utils/alertas';

export default {
  name: 'COMPONENTE',
  components: { Loading },
  setup() {
    const cargando = ref(true);
    const items = ref([]);
    const form = ref({});
    const errores = ref({});
    const modoEdicion = ref(false);
    let modal = null;
    
    const cargarDatos = async () => {
      try {
        const response = await service.getAll();
        items.value = response.data;
      } catch (error) {
        manejarErrorAPI(error);
      } finally {
        cargando.value = false;
      }
    };
    
    const abrirModal = (item = null) => {
      modoEdicion.value = !!item;
      form.value = item ? { ...item } : {};
      errores.value = {};
      modal.show();
    };
    
    const guardar = async () => {
      try {
        if (modoEdicion.value) {
          await service.update(form.value.id, form.value);
          toast('Actualizado correctamente', 'success');
        } else {
          await service.create(form.value);
          toast('Creado correctamente', 'success');
        }
        modal.hide();
        await cargarDatos();
      } catch (error) {
        manejarErrorAPI(error);
      }
    };
    
    const eliminar = async (item) => {
      const result = await confirmarEliminar();
      if (result.isConfirmed) {
        try {
          await service.delete(item.id);
          toast('Eliminado correctamente', 'success');
          await cargarDatos();
        } catch (error) {
          manejarErrorAPI(error);
        }
      }
    };
    
    onMounted(async () => {
      await cargarDatos();
      modal = new Modal(document.getElementById('modal'));
    });
    
    return { cargando, items, form, errores, modoEdicion, abrirModal, guardar, eliminar };
  }
}
</script>
```

---

## TEMPLATE PARA DASHBOARD

```vue
<template>
  <div class="fade-in">
    <h2 class="mb-4"><i class="bi bi-speedometer2 me-2"></i>Dashboard</h2>
    
    <Loading v-if="cargando" />
    
    <div v-else>
      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-3" v-for="stat in stats" :key="stat.label">
          <div class="card stat-card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-muted mb-2">{{ stat.label }}</h6>
                  <h2 class="mb-0">{{ stat.value }}</h2>
                </div>
                <div :class="`avatar-lg bg-${stat.color}`">
                  <i :class="`bi ${stat.icon} fs-3`"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Contenido adicional -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <i class="bi bi-list me-2"></i>
              Actividad Reciente
            </div>
            <div class="card-body">
              <!-- Tabla o lista de actividades -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Loading from '../../components/common/Loading.vue';

export default {
  name: 'Dashboard',
  components: { Loading },
  setup() {
    const cargando = ref(true);
    const stats = ref([
      { label: 'Stat 1', value: 0, icon: 'bi-icon', color: 'primary' },
      { label: 'Stat 2', value: 0, icon: 'bi-icon', color: 'success' },
    ]);
    
    const cargarDatos = async () => {
      // Cargar datos
      cargando.value = false;
    };
    
    onMounted(() => cargarDatos());
    
    return { cargando, stats };
  }
}
</script>
```

---

## NOTAS IMPORTANTES

### Servicios ya creados:
- ✅ usuarioService
- ✅ animalService
- ✅ organizacionService
- ✅ veterinariaService
- ✅ adopcionService
- ✅ reporteService
- ✅ registroMedicoService

### Utilidades disponibles:
- **Alertas**: alertaExito, alertaError, confirmar, confirmarEliminar, toast, manejarErrorAPI
- **Validaciones**: validarUsuario, validarAnimal, validarOrganizacion, etc.
- **Helpers**: formatearFecha, truncar, nombreRol, colorPorEstado, iconoPorEspecie, etc.

### Componentes reutilizables:
- Loading.vue
- Pagination.vue
- Navbar.vue
- Footer.vue

### Bootstrap classes útiles:
- Botones: btn-primary, btn-success, btn-warning, btn-danger
- Badges: badge bg-primary, badge bg-success, etc.
- Cards: card, card-header, card-body
- Tablas: table, table-hover, table-responsive
- Forms: form-control, form-select, form-label, is-invalid

---

## PARA EJECUTAR EL PROYECTO

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# El proyecto estará en: http://localhost:5173
```

---

## USUARIOS DE PRUEBA

Crear estos usuarios en la API para probar:

1. **Admin**: admin@epaws.com / admin123 (idRol: 1)
2. **Organización**: org@epaws.com / org123 (idRol: 2)
3. **Veterinaria**: vet@epaws.com / vet123 (idRol: 3)
4. **Cliente**: cliente@epaws.com / cliente123 (idRol: 4)

---

## CARACTERÍSTICAS IMPLEMENTADAS ✅

- ✅ Autenticación con roles
- ✅ Menús personalizados por rol
- ✅ CRUD completo (ejemplo en Usuarios)
- ✅ Validaciones de formularios
- ✅ SweetAlert2 para notificaciones
- ✅ Paginación de datos
- ✅ Búsqueda y filtros
- ✅ Dashboard con gráficos (Chart.js)
- ✅ Diseño responsivo (Bootstrap 5)
- ✅ Encriptación de contraseñas (CryptoJS)
- ✅ AJAX con Axios
- ✅ Guards de navegación
- ✅ Estado global (Pinia)
- ✅ Reportes con fotos

---

## PRÓXIMOS PASOS

1. Crear las vistas restantes basándote en los templates
2. Probar todas las funcionalidades
3. Ajustar estilos según preferencias
4. Agregar más validaciones si es necesario
5. Implementar carga de imágenes real (si se desea)
