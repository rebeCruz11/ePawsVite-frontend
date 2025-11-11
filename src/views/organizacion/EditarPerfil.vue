<template>
  <div class="edit-profile-page fade-in">
    <Loading v-if="cargando"/>

    <div v-else>
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-title">
            <i class="bi bi-pencil-square"></i>
            <h2>Editar Perfil</h2>
          </div>
        </div>
      </div>

      <!-- Form Card -->
      <div class="form-card">
        <form @submit.prevent="guardar" novalidate>
          <!-- Personal Information Section -->
          <div class="form-section">
            <div class="section-header">
              <i class="bi bi-person-circle"></i>
              <h3>Información Personal</h3>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Nombre</label>
                <div class="input-with-icon">
                  <i class="bi bi-person"></i>
                  <input 
                    v-model="form.nombre" 
                    type="text" 
                    class="form-control" 
                    :class="{ 'is-invalid': errors.nombre }"
                    @blur="validateNombre"
                    placeholder="Ingrese su nombre"
                    required
                  />
                </div>
                <div class="invalid-feedback" v-if="errors.nombre">{{ errors.nombre }}</div>
              </div>

              <div class="form-group">
                <label class="form-label required">Apellido</label>
                <div class="input-with-icon">
                  <i class="bi bi-person-badge"></i>
                  <input 
                    v-model="form.apellido" 
                    type="text" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.apellido }"
                    @blur="validateApellido"
                    placeholder="Ingrese su apellido"
                    required
                  />
                </div>
                <div class="invalid-feedback" v-if="errors.apellido">{{ errors.apellido }}</div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Correo Electrónico</label>
                <div class="input-with-icon">
                  <i class="bi bi-envelope"></i>
                  <input 
                    v-model="form.correo" 
                    type="email" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.correo }"
                    @blur="validateCorreo"
                    placeholder="ejemplo@correo.com"
                    required
                  />
                </div>
                <div class="invalid-feedback" v-if="errors.correo">{{ errors.correo }}</div>
              </div>

              <div class="form-group">
                <label class="form-label">Teléfono Personal</label>
                <div class="input-with-icon">
                  <i class="bi bi-telephone"></i>
                  <input 
                    v-model="form.telefono" 
                    type="tel" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.telefono }"
                    @blur="validateTelefono"
                    placeholder="0000-0000"
                    maxlength="9"
                  />
                </div>
                <div class="invalid-feedback" v-if="errors.telefono">{{ errors.telefono }}</div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Nueva Contraseña</label>
              <div class="input-with-icon">
                <i class="bi bi-lock"></i>
                <input 
                  v-model="form.contrasena" 
                  :type="showPassword ? 'text' : 'password'" 
                  class="form-control"
                  :class="{ 'is-invalid': errors.contrasena }"
                  @blur="validateContrasena"
                  placeholder="Dejar vacío para no cambiar"
                />
                <button 
                  type="button" 
                  class="password-toggle" 
                  @click="showPassword = !showPassword"
                  tabindex="-1"
                >
                  <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              <small class="form-hint">
                <i class="bi bi-info-circle"></i>
                Mínimo 6 caracteres. Deja vacío si no deseas cambiarla.
              </small>
              <div class="invalid-feedback" v-if="errors.contrasena">{{ errors.contrasena }}</div>
            </div>
          </div>

          <!-- Organization Information Section -->
          <div class="form-section">
            <div class="section-header">
              <i class="bi bi-building"></i>
              <h3>Información de la Organización</h3>
            </div>

            <div class="form-group">
              <label class="form-label required">Nombre de la Organización</label>
              <div class="input-with-icon">
                <i class="bi bi-building-fill"></i>
                <input 
                  v-model="org.nombreOrganizacion" 
                  type="text" 
                  class="form-control"
                  :class="{ 'is-invalid': errors.nombreOrganizacion }"
                  @blur="validateNombreOrganizacion"
                  placeholder="Nombre de tu organización"
                  required
                />
              </div>
              <div class="invalid-feedback" v-if="errors.nombreOrganizacion">{{ errors.nombreOrganizacion }}</div>
            </div>

            <div class="form-group">
              <label class="form-label">Descripción</label>
              <div class="input-with-icon">
                <i class="bi bi-file-text"></i>
                <textarea 
                  v-model="org.descripcion" 
                  class="form-control"
                  :class="{ 'is-invalid': errors.descripcion }"
                  @blur="validateDescripcion"
                  placeholder="Describe la misión y objetivos de tu organización..."
                  rows="4"
                ></textarea>
              </div>
              <small class="form-hint">
                <i class="bi bi-info-circle"></i>
                Comparte información sobre tu organización para que la comunidad te conozca mejor
              </small>
              <div class="char-count">{{ org.descripcion?.length || 0 }} caracteres</div>
              <div class="invalid-feedback" v-if="errors.descripcion">{{ errors.descripcion }}</div>
            </div>

            <div class="form-group">
              <label class="form-label">Dirección</label>
              <div class="input-with-icon">
                <i class="bi bi-geo-alt"></i>
                <textarea 
                  v-model="org.direccion" 
                  class="form-control"
                  :class="{ 'is-invalid': errors.direccion }"
                  @blur="validateDireccion"
                  placeholder="Dirección completa de la organización"
                  rows="3"
                ></textarea>
              </div>
              <div class="invalid-feedback" v-if="errors.direccion">{{ errors.direccion }}</div>
            </div>

            <div class="form-group">
              <label class="form-label">Teléfono de Contacto</label>
              <div class="input-with-icon">
                <i class="bi bi-telephone-fill"></i>
                <input 
                  v-model="org.telefono" 
                  type="tel" 
                  class="form-control"
                  :class="{ 'is-invalid': errors.telefonoOrg }"
                  @blur="validateTelefonoOrg"
                  placeholder="0000-0000"
                  maxlength="9"
                />
              </div>
              <small class="form-hint">
                <i class="bi bi-info-circle"></i>
                Teléfono principal de contacto para la organización
              </small>
              <div class="invalid-feedback" v-if="errors.telefonoOrg">{{ errors.telefonoOrg }}</div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="cancelar" :disabled="guardando">
              <i class="bi bi-x-circle"></i>
              Cancelar
            </button>
            <button type="submit" class="btn-save" :disabled="guardando || !isFormValid">
              <i class="bi bi-check-circle"></i>
              {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import Loading from '../../components/common/Loading.vue';
import usuarioService from '../../services/usuarioService';
import organizacionService from '../../services/organizacionService';
import { alertaExito, manejarErrorAPI } from '../../utils/alertas';
import { hashContrasena } from '../../utils/encriptacion';

export default {
  name: 'OrganizacionEditarPerfil',
  components: { Loading },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const cargando = ref(true);
    const guardando = ref(false);
    const showPassword = ref(false);

    const form = ref({
      idUsuario: null,
      nombre: '',
      apellido: '',
      correo: '',
      telefono: '',
      contrasena: ''
    });

    const org = ref({
      idOrganizacion: null,
      nombreOrganizacion: '',
      descripcion: '',
      direccion: '',
      telefono: ''
    });

    const errors = ref({});

    // Validaciones
    const validateNombre = () => {
      if (!form.value.nombre || form.value.nombre.trim() === '') {
        errors.value.nombre = 'El nombre es obligatorio';
        return false;
      }
      if (form.value.nombre.trim().length < 2) {
        errors.value.nombre = 'El nombre debe tener al menos 2 caracteres';
        return false;
      }
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.value.nombre)) {
        errors.value.nombre = 'El nombre solo puede contener letras';
        return false;
      }
      delete errors.value.nombre;
      return true;
    };

    const validateApellido = () => {
      if (!form.value.apellido || form.value.apellido.trim() === '') {
        errors.value.apellido = 'El apellido es obligatorio';
        return false;
      }
      if (form.value.apellido.trim().length < 2) {
        errors.value.apellido = 'El apellido debe tener al menos 2 caracteres';
        return false;
      }
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.value.apellido)) {
        errors.value.apellido = 'El apellido solo puede contener letras';
        return false;
      }
      delete errors.value.apellido;
      return true;
    };

    const validateCorreo = () => {
      if (!form.value.correo || form.value.correo.trim() === '') {
        errors.value.correo = 'El correo electrónico es obligatorio';
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.value.correo)) {
        errors.value.correo = 'Ingresa un correo electrónico válido';
        return false;
      }
      delete errors.value.correo;
      return true;
    };

    const validateTelefono = () => {
      if (form.value.telefono && form.value.telefono.trim() !== '') {
        const telefonoRegex = /^\d{4}-?\d{4}$/;
        if (!telefonoRegex.test(form.value.telefono)) {
          errors.value.telefono = 'Formato válido: 0000-0000';
          return false;
        }
      }
      delete errors.value.telefono;
      return true;
    };

    const validateContrasena = () => {
      if (form.value.contrasena && form.value.contrasena.trim() !== '') {
        if (form.value.contrasena.length < 6) {
          errors.value.contrasena = 'La contraseña debe tener al menos 6 caracteres';
          return false;
        }
      }
      delete errors.value.contrasena;
      return true;
    };

    const validateNombreOrganizacion = () => {
      if (!org.value.nombreOrganizacion || org.value.nombreOrganizacion.trim() === '') {
        errors.value.nombreOrganizacion = 'El nombre de la organización es obligatorio';
        return false;
      }
      if (org.value.nombreOrganizacion.trim().length < 3) {
        errors.value.nombreOrganizacion = 'El nombre debe tener al menos 3 caracteres';
        return false;
      }
      delete errors.value.nombreOrganizacion;
      return true;
    };

    const validateDescripcion = () => {
      if (org.value.descripcion && org.value.descripcion.trim().length > 0) {
        if (org.value.descripcion.trim().length < 10) {
          errors.value.descripcion = 'La descripción debe tener al menos 10 caracteres';
          return false;
        }
        if (org.value.descripcion.trim().length > 1000) {
          errors.value.descripcion = 'La descripción no puede exceder 1000 caracteres';
          return false;
        }
      }
      delete errors.value.descripcion;
      return true;
    };

    const validateDireccion = () => {
      if (org.value.direccion && org.value.direccion.trim().length > 0) {
        if (org.value.direccion.trim().length < 5) {
          errors.value.direccion = 'La dirección debe tener al menos 5 caracteres';
          return false;
        }
      }
      delete errors.value.direccion;
      return true;
    };

    const validateTelefonoOrg = () => {
      if (org.value.telefono && org.value.telefono.trim() !== '') {
        const telefonoRegex = /^\d{4}-?\d{4}$/;
        if (!telefonoRegex.test(org.value.telefono)) {
          errors.value.telefonoOrg = 'Formato válido: 0000-0000';
          return false;
        }
      }
      delete errors.value.telefonoOrg;
      return true;
    };

    const isFormValid = computed(() => {
      return (
        form.value.nombre.trim() !== '' &&
        form.value.apellido.trim() !== '' &&
        form.value.correo.trim() !== '' &&
        org.value.nombreOrganizacion.trim() !== '' &&
        Object.keys(errors.value).length === 0
      );
    });

    const cargar = async () => {
      try {
        const user = authStore.usuarioActual;
        if (!user) {
          router.push('/login');
          return;
        }

        form.value.idUsuario = user.idUsuario;
        form.value.nombre = user.nombre || '';
        form.value.apellido = user.apellido || '';
        form.value.correo = user.correo || '';
        form.value.telefono = user.telefono || '';

        console.log('📥 Cargando datos de organización para usuario:', user.idUsuario);
        const r = await organizacionService.getByUsuario(user.idUsuario);
        console.log('✅ Datos de organización recibidos:', r.data);
        
        if (r.data) {
          org.value = {
            idOrganizacion: r.data.idOrganizacion,
            nombreOrganizacion: r.data.nombreOrganizacion || '',
            descripcion: r.data.descripcion || '',
            direccion: r.data.direccion || '',
            telefono: r.data.telefono || ''
          };
          console.log('✅ Organización cargada:', org.value);
        }
      } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        manejarErrorAPI(error);
      } finally {
        cargando.value = false;
      }
    };

    const guardar = async () => {
      // Validar todos los campos
      const validaciones = [
        validateNombre(),
        validateApellido(),
        validateCorreo(),
        validateTelefono(),
        validateContrasena(),
        validateNombreOrganizacion(),
        validateDescripcion(),
        validateDireccion(),
        validateTelefonoOrg()
      ];

      if (!validaciones.every(v => v)) {
        return;
      }

      guardando.value = true;
      try {
        const payloadUsuario = {
          ...authStore.usuarioActual,
          nombre: form.value.nombre.trim(),
          apellido: form.value.apellido.trim(),
          correo: form.value.correo.trim(),
          telefono: form.value.telefono.trim()
        };

        // Si se proporcionó nueva contraseña
        if (form.value.contrasena && form.value.contrasena.trim() !== '') {
          payloadUsuario.contrasena = hashContrasena(form.value.contrasena);
        }

        console.log('📤 Actualizando usuario:', payloadUsuario);
        // Actualizar usuario
        await usuarioService.update(payloadUsuario.idUsuario, payloadUsuario);

        // Actualizar organización
        if (org.value.idOrganizacion) {
          const updateOrg = {
            idOrganizacion: org.value.idOrganizacion,
            nombreOrganizacion: org.value.nombreOrganizacion.trim(),
            descripcion: org.value.descripcion?.trim() || null,
            direccion: org.value.direccion?.trim() || null,
            telefono: org.value.telefono?.trim() || null,
            usuario: {
              idUsuario: payloadUsuario.idUsuario
            }
          };
          
          console.log('📤 Actualizando organización:', updateOrg);
          await organizacionService.update(org.value.idOrganizacion, updateOrg);
        }

        // Actualizar store
        authStore.actualizarUsuario(payloadUsuario);

        await alertaExito('Perfil actualizado correctamente', 'Cambios guardados');
        router.push({ name: 'OrganizacionPerfil' });
      } catch (error) {
        console.error('❌ Error al guardar perfil:', error);
        console.error('📋 Respuesta del servidor:', error.response?.data);
        manejarErrorAPI(error);
      } finally {
        guardando.value = false;
      }
    };

    const cancelar = () => {
      router.push({ name: 'OrganizacionPerfil' });
    };

    onMounted(() => cargar());

    return {
      cargando,
      guardando,
      showPassword,
      form,
      org,
      errors,
      isFormValid,
      validateNombre,
      validateApellido,
      validateCorreo,
      validateTelefono,
      validateContrasena,
      validateNombreOrganizacion,
      validateDescripcion,
      validateDireccion,
      validateTelefonoOrg,
      guardar,
      cancelar
    };
  }
};
</script>

<style scoped>
/* ============================================
   BASE & ANIMATIONS
   ============================================ */
.edit-profile-page {
  animation: fadeIn 0.6s ease-out;
}

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

/* ============================================
   HEADER
   ============================================ */
.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-title i {
  font-size: 2rem;
  color: #667eea;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.header-title h2 {
  margin: 0;
  font-weight: 700;
  color: #1a1a1a;
}

/* ============================================
   FORM CARD
   ============================================ */
.form-card {
  background: white;
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  margin: 0 auto;
}

/* ============================================
   FORM SECTIONS
   ============================================ */
.form-section {
  margin-bottom: 3rem;
}

.form-section:last-of-type {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f8f9fa;
}

.section-header i {
  font-size: 1.5rem;
  color: #667eea;
}

.section-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
}

/* ============================================
   FORM ELEMENTS
   ============================================ */
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.95rem;
}

.form-label.required::after {
  content: ' *';
  color: #dc3545;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon > i {
  position: absolute;
  left: 1rem;
  color: #6c757d;
  font-size: 1.1rem;
  z-index: 1;
}

.input-with-icon .form-control {
  padding-left: 3rem;
}

.form-control {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.form-control.is-invalid:focus {
  box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.1);
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1.1rem;
  transition: color 0.3s ease;
  z-index: 1;
}

.password-toggle:hover {
  color: #667eea;
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  color: #6c757d;
  font-size: 0.875rem;
}

.form-hint i {
  color: #17a2b8;
}

.char-count {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #6c757d;
  text-align: right;
}

.invalid-feedback {
  display: block;
  margin-top: 0.5rem;
  color: #dc3545;
  font-size: 0.875rem;
  font-weight: 500;
}

/* ============================================
   FORM ACTIONS
   ============================================ */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 2px solid #f8f9fa;
}

.btn-cancel,
.btn-save {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #f8f9fa;
  color: #6c757d;
}

.btn-cancel:hover:not(:disabled) {
  background: #e9ecef;
  color: #495057;
  transform: translateY(-2px);
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-save:disabled,
.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 768px) {
  .form-card {
    padding: 2rem 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .section-header {
    margin-bottom: 1.5rem;
  }
  
  .section-header h3 {
    font-size: 1.25rem;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn-cancel,
  .btn-save {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .header-title i {
    font-size: 1.5rem;
  }
  
  .header-title h2 {
    font-size: 1.5rem;
  }
}
</style>
