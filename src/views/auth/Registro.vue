<template>
  <div class="registro-page">
    <Navbar />
    
    <!-- Background -->
    <div class="registro-background">
      <div class="gradient-overlay"></div>
      <div class="pattern-overlay"></div>
    </div>
    
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-10 col-xl-9">
          <div class="registro-card">
            <!-- Header -->
            <div class="registro-header">
              <div class="header-icon">
                <i class="bi bi-person-plus"></i>
              </div>
              <h2 class="fw-bold mb-2">Crear Cuenta</h2>
              <p class="text-muted mb-0">Únete a la familia ePaws y ayuda a cambiar vidas</p>
            </div>
            
            <!-- Progress Steps -->
            <div class="progress-steps mb-4">
              <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
                <div class="step-circle">
                  <i class="bi bi-person-fill"></i>
                </div>
                <span class="step-label">Información Personal</span>
              </div>
              <div class="step-line" :class="{ active: currentStep > 1 }"></div>
              <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
                <div class="step-circle">
                  <i class="bi bi-shield-lock-fill"></i>
                </div>
                <span class="step-label">Seguridad</span>
              </div>
              <div class="step-line" :class="{ active: currentStep > 2 }"></div>
              <div class="step" :class="{ active: currentStep >= 3 }">
                <div class="step-circle">
                  <i class="bi bi-check-circle-fill"></i>
                </div>
                <span class="step-label">Confirmar</span>
              </div>
            </div>
            
            <form @submit.prevent="handleRegistro">
              <!-- Step 1: Información Personal -->
              <div v-show="currentStep === 1" class="form-step">
                <h5 class="step-title mb-4">
                  <i class="bi bi-person-badge me-2"></i>
                  Información Personal
                </h5>
                
                <div class="row g-3">
                  <div class="col-md-6">
                    <label for="nombre" class="form-label fw-semibold">Nombre *</label>
                    <div class="input-wrapper">
                      <i class="bi bi-person input-icon"></i>
                      <input 
                        type="text" 
                        class="form-control form-control-lg" 
                        id="nombre" 
                        v-model="form.nombre"
                        :class="{ 'is-invalid': errores.nombre }"
                        placeholder="Juan"
                        required
                      >
                      <div class="invalid-feedback">{{ errores.nombre }}</div>
                    </div>
                  </div>
                  
                  <div class="col-md-6">
                    <label for="apellido" class="form-label fw-semibold">Apellido</label>
                    <div class="input-wrapper">
                      <i class="bi bi-person input-icon"></i>
                      <input 
                        type="text" 
                        class="form-control form-control-lg" 
                        id="apellido" 
                        v-model="form.apellido"
                        :class="{ 'is-invalid': errores.apellido }"
                        placeholder="Pérez"
                      >
                      <div class="invalid-feedback">{{ errores.apellido }}</div>
                    </div>
                  </div>
                  
                  <div class="col-md-6">
                    <label for="telefono" class="form-label fw-semibold">Teléfono</label>
                    <div class="input-wrapper">
                      <i class="bi bi-telephone input-icon"></i>
                      <input 
                        type="text" 
                        class="form-control form-control-lg" 
                        id="telefono" 
                        v-model="form.telefono"
                        :class="{ 'is-invalid': errores.telefono }"
                        placeholder="1234-5678"
                        maxlength="30"
                      >
                      <div class="invalid-feedback">{{ errores.telefono }}</div>
                    </div>
                  </div>
                  
                  <div class="col-md-6">
                    <label for="rol" class="form-label fw-semibold">Tipo de Usuario *</label>
                    <div class="input-wrapper">
                      <i class="bi bi-person-badge input-icon"></i>
                      <select 
                        class="form-select form-select-lg" 
                        id="rol" 
                        v-model="form.idRol"
                        :class="{ 'is-invalid': errores.rol }"
                        required
                      >
                        <option value="">Seleccione...</option>
                        <option :value="1">👤 Cliente</option>
                        <option :value="2">🏢 Organización</option>
                        <option :value="3">🏥 Veterinaria</option>
                      </select>
                      <div class="invalid-feedback">{{ errores.rol }}</div>
                    </div>
                  </div>
                  
                  <div class="col-12">
                    <label for="direccion" class="form-label fw-semibold">Dirección</label>
                    <div class="input-wrapper">
                      <i class="bi bi-geo-alt input-icon"></i>
                      <textarea 
                        class="form-control form-control-lg" 
                        id="direccion" 
                        v-model="form.direccion"
                        :class="{ 'is-invalid': errores.direccion }"
                        rows="2"
                        placeholder="San Salvador, El Salvador"
                        maxlength="150"
                      ></textarea>
                      <div class="invalid-feedback">{{ errores.direccion }}</div>
                    </div>
                  </div>
                </div>
                
                <div class="d-flex justify-content-end mt-4">
                  <button type="button" class="btn btn-primary btn-lg px-5" @click="nextStep">
                    Siguiente <i class="bi bi-arrow-right ms-2"></i>
                  </button>
                </div>
              </div>
              
              <!-- Step 2: Seguridad y Credenciales -->
              <div v-show="currentStep === 2" class="form-step">
                <h5 class="step-title mb-4">
                  <i class="bi bi-shield-lock me-2"></i>
                  Información de Seguridad
                </h5>
                
                <div class="row g-3">
                  <div class="col-12">
                    <label for="correo" class="form-label fw-semibold">Correo Electrónico *</label>
                    <div class="input-wrapper">
                      <i class="bi bi-envelope input-icon"></i>
                      <input 
                        type="email" 
                        class="form-control form-control-lg" 
                        id="correo" 
                        v-model="form.correo"
                        :class="{ 'is-invalid': errores.correo }"
                        placeholder="ejemplo@correo.com"
                        required
                      >
                      <div class="invalid-feedback">{{ errores.correo }}</div>
                    </div>
                  </div>
                  
                  <div class="col-12">
                    <label for="contrasena" class="form-label fw-semibold">Contraseña *</label>
                    <div class="input-wrapper">
                      <i class="bi bi-lock input-icon"></i>
                      <input 
                        :type="mostrarContrasena ? 'text' : 'password'" 
                        class="form-control form-control-lg" 
                        id="contrasena" 
                        v-model="form.contrasena"
                        :class="{ 'is-invalid': errores.contrasena }"
                        placeholder="Mínimo 5 caracteres"
                        required
                      >
                      <button 
                        type="button"
                        class="password-toggle"
                        @click="mostrarContrasena = !mostrarContrasena"
                        tabindex="-1"
                      >
                        <i :class="mostrarContrasena ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                      </button>
                      <div class="invalid-feedback">{{ errores.contrasena }}</div>
                    </div>
                    
                    <!-- Password strength indicator -->
                    <div class="password-strength mt-2" v-if="form.contrasena">
                      <div class="strength-bar">
                        <div class="strength-fill" :class="passwordStrength.class" :style="{ width: passwordStrength.width }"></div>
                      </div>
                      <small :class="'text-' + passwordStrength.class">{{ passwordStrength.text }}</small>
                    </div>
                  </div>
                </div>
                
                <div class="d-flex justify-content-between mt-4">
                  <button type="button" class="btn btn-outline-secondary btn-lg px-5" @click="prevStep">
                    <i class="bi bi-arrow-left me-2"></i> Atrás
                  </button>
                  <button type="button" class="btn btn-primary btn-lg px-5" @click="nextStep">
                    Siguiente <i class="bi bi-arrow-right ms-2"></i>
                  </button>
                </div>
              </div>
              
              <!-- Step 3: Datos Específicos -->
              <div v-show="currentStep === 3" class="form-step">
                <h5 class="step-title mb-4">
                  <i class="bi bi-check-circle me-2"></i>
                  Información Adicional
                </h5>
                
                <!-- Campos para Organización -->
                <div v-if="form.idRol == 2" class="additional-fields">
                  <div class="info-banner mb-4">
                    <i class="bi bi-building"></i>
                    <div>
                      <strong>Datos de Organización</strong>
                      <p class="mb-0">Proporciona información sobre tu organización</p>
                    </div>
                  </div>
                  
                  <div class="mb-3">
                    <label for="nombreOrganizacion" class="form-label fw-semibold">Nombre de la Organización *</label>
                    <div class="input-wrapper">
                      <i class="bi bi-building input-icon"></i>
                      <input 
                        type="text" 
                        class="form-control form-control-lg" 
                        id="nombreOrganizacion" 
                        v-model="form.nombreOrganizacion"
                        placeholder="Ej: Rescate de Animales ABC"
                        :required="form.idRol == 2"
                      >
                    </div>
                  </div>
                </div>
                
                <!-- Campos para Veterinaria -->
                <div v-if="form.idRol == 3" class="additional-fields">
                  <div class="info-banner mb-4">
                    <i class="bi bi-hospital"></i>
                    <div>
                      <strong>Datos de Clínica Veterinaria</strong>
                      <p class="mb-0">Proporciona información sobre tu clínica</p>
                    </div>
                  </div>
                  
                  <div class="row g-3">
                    <div class="col-12">
                      <label for="nombreClinica" class="form-label fw-semibold">Nombre de la Clínica *</label>
                      <div class="input-wrapper">
                        <i class="bi bi-hospital input-icon"></i>
                        <input 
                          type="text" 
                          class="form-control form-control-lg" 
                          id="nombreClinica" 
                          v-model="form.nombreClinica"
                          placeholder="Ej: Clínica Veterinaria PetCare"
                          :required="form.idRol == 3"
                        >
                      </div>
                    </div>
                    
                    <div class="col-12">
                      <label for="especialidad" class="form-label fw-semibold">Especialidad</label>
                      <div class="input-wrapper">
                        <i class="bi bi-star input-icon"></i>
                        <input 
                          type="text" 
                          class="form-control form-control-lg" 
                          id="especialidad" 
                          v-model="form.especialidad"
                          placeholder="Ej: General, Cirugía, Emergencias"
                        >
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Para Cliente -->
                <div v-if="form.idRol == 1" class="text-center py-5">
                  <div class="success-icon mb-3">
                    <i class="bi bi-check-circle"></i>
                  </div>
                  <h5 class="mb-2">¡Todo listo!</h5>
                  <p class="text-muted">Revisa tu información y confirma tu registro</p>
                </div>
                
                <div class="d-flex justify-content-between mt-4">
                  <button type="button" class="btn btn-outline-secondary btn-lg px-5" @click="prevStep">
                    <i class="bi bi-arrow-left me-2"></i> Atrás
                  </button>
                  <button 
                    type="submit" 
                    class="btn btn-success btn-lg px-5"
                    :disabled="cargando"
                  >
                    <span v-if="cargando" class="d-flex align-items-center">
                      <span class="spinner-border spinner-border-sm me-2"></span>
                      Registrando...
                    </span>
                    <span v-else class="d-flex align-items-center">
                      <i class="bi bi-check-circle me-2"></i>
                      Crear Cuenta
                    </span>
                  </button>
                </div>
              </div>
            </form>
            
            <div class="registro-footer">
              <p class="mb-0 text-center">
                ¿Ya tienes cuenta? 
                <router-link to="/login" class="text-decoration-none fw-semibold">
                  Inicia sesión aquí
                </router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import Navbar from '../../components/common/Navbar.vue';
import Footer from '../../components/common/Footer.vue';
import { alertaExito, alertaError, manejarErrorAPI } from '../../utils/alertas';
import { validarUsuario } from '../../utils/validaciones';
import organizacionService from '../../services/organizacionService';
import veterinariaService from '../../services/veterinariaService';

export default {
  name: 'Registro',
  components: {
    Navbar,
    Footer
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    
    const currentStep = ref(1);
    const mostrarContrasena = ref(false);
    
    const form = ref({
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      telefono: '',
      direccion: '',
      idRol: '',
      nombreOrganizacion: '',
      nombreClinica: '',
      especialidad: ''
    });
    
    const errores = ref({});
    const cargando = ref(false);
    
    const passwordStrength = computed(() => {
      const password = form.value.contrasena;
      if (!password) return { width: '0%', class: '', text: '' };
      
      let strength = 0;
      if (password.length >= 5) strength++;
      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      
      if (strength <= 2) return { width: '33%', class: 'danger', text: 'Débil' };
      if (strength <= 3) return { width: '66%', class: 'warning', text: 'Media' };
      return { width: '100%', class: 'success', text: 'Fuerte' };
    });
    
    const validarFormulario = () => {
      const usuario = {
        ...form.value,
        rol: { idRol: form.value.idRol }
      };
      errores.value = validarUsuario(usuario);
      return Object.keys(errores.value).length === 0;
    };
    
    const nextStep = () => {
      if (currentStep.value < 3) {
        currentStep.value++;
      }
    };
    
    const prevStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--;
      }
    };
    
    const handleRegistro = async () => {
      if (!validarFormulario()) {
        alertaError('Por favor, corrige los errores en el formulario.');
        return;
      }
      
      cargando.value = true;
      
      try {
        const datosUsuario = {
          nombre: form.value.nombre,
          apellido: form.value.apellido,
          correo: form.value.correo,
          contrasena: form.value.contrasena,
          telefono: form.value.telefono,
          direccion: form.value.direccion,
          rol: {
            idRol: parseInt(form.value.idRol)
          }
        };
        
        const result = await authStore.registro(datosUsuario);
        
        if (result && result.success) {
          const usuarioCreado = result.user;
          
          if (parseInt(form.value.idRol) === 2 && form.value.nombreOrganizacion) {
            try {
              await organizacionService.create({
                usuario: { idUsuario: usuarioCreado.idUsuario },
                nombreOrganizacion: form.value.nombreOrganizacion,
                telefono: form.value.telefono || '',
                direccion: form.value.direccion || ''
              });
            } catch (orgError) {
              console.error('Error al crear organización:', orgError);
              alertaError('Usuario creado pero hubo un error al crear la organización.');
              return;
            }
          }
          
          if (parseInt(form.value.idRol) === 3 && form.value.nombreClinica) {
            try {
              await veterinariaService.create({
                usuario: { idUsuario: usuarioCreado.idUsuario },
                nombreClinica: form.value.nombreClinica,
                especialidad: form.value.especialidad || 'General',
                telefono: form.value.telefono || '',
                direccion: form.value.direccion || ''
              });
            } catch (vetError) {
              console.error('Error al crear veterinaria:', vetError);
              alertaError('Usuario creado pero hubo un error al crear la veterinaria.');
              return;
            }
          }
          
          await alertaExito(
            'Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión.',
            '¡Registro exitoso!'
          );
          router.push('/login');
        } else {
          alertaError(result?.message || 'Error al crear la cuenta.');
        }
      } catch (error) {
        console.error('Error al registrar:', error);
        
        if (error.response?.status === 409 || error.response?.data?.message?.includes('correo')) {
          alertaError('Este correo electrónico ya está registrado.');
        } else if (error.response?.status === 400) {
          alertaError('Datos inválidos. Verifica que todos los campos estén correctos.');
        } else {
          manejarErrorAPI(error);
        }
      } finally {
        cargando.value = false;
      }
    };
    
    return {
      form,
      errores,
      cargando,
      currentStep,
      mostrarContrasena,
      passwordStrength,
      nextStep,
      prevStep,
      handleRegistro
    };
  }
}
</script>

<style scoped>
/* ============================================
   LAYOUT & BACKGROUND
   ============================================ */
.registro-page {
  position: relative;
  min-height: 100vh;
}

.registro-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: -1;
}

.gradient-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.85) 0%, rgba(118, 75, 162, 0.85) 100%);
}

.pattern-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.3;
}

/* ============================================
   CARD
   ============================================ */
.registro-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 3rem;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============================================
   HEADER
   ============================================ */
.registro-header {
  text-align: center;
  margin-bottom: 2rem;
}

.header-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 6s ease-in-out infinite;
}

.header-icon i {
  font-size: 2.5rem;
  color: white;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* ============================================
   PROGRESS STEPS
   ============================================ */
.progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  position: relative;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  z-index: 1;
}

.step-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: all 0.3s ease;
}

.step.active .step-circle {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.step.completed .step-circle {
  background: #28a745;
  color: white;
}

.step-label {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
  white-space: nowrap;
}

.step.active .step-label {
  color: #667eea;
  font-weight: 600;
}

.step-line {
  width: 100px;
  height: 3px;
  background: #e9ecef;
  transition: all 0.3s ease;
}

.step-line.active {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

/* ============================================
   FORM STEPS
   ============================================ */
.form-step {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.step-title {
  color: #333;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f8f9fa;
}

/* ============================================
   INPUTS
   ============================================ */
.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 5;
  pointer-events: none;
}

.input-wrapper .form-control,
.input-wrapper .form-select {
  padding-left: 45px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.input-wrapper textarea.form-control {
  padding-top: 0.75rem;
}

.input-wrapper .form-control:focus,
.input-wrapper .form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
}

.password-toggle {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #6c757d;
  cursor: pointer;
  z-index: 5;
}

.password-toggle:hover {
  color: #667eea;
}

/* ============================================
   PASSWORD STRENGTH
   ============================================ */
.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-fill.danger {
  background: #dc3545;
}

.strength-fill.warning {
  background: #ffc107;
}

.strength-fill.success {
  background: #28a745;
}

/* ============================================
   INFO BANNER
   ============================================ */
.info-banner {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-left: 4px solid #667eea;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-banner i {
  font-size: 2rem;
  color: #667eea;
}

.info-banner strong {
  display: block;
  color: #333;
  margin-bottom: 0.25rem;
}

.info-banner p {
  color: #6c757d;
  font-size: 0.875rem;
}

/* ============================================
   SUCCESS ICON
   ============================================ */
.success-icon i {
  font-size: 4rem;
  color: #28a745;
}

/* ============================================
   BUTTONS
   ============================================ */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(40, 167, 69, 0.4);
}

.btn-outline-secondary {
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-outline-secondary:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
}

/* ============================================
   FOOTER
   ============================================ */
.registro-footer {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #f8f9fa;
}

.registro-footer a {
  color: #667eea;
  transition: color 0.3s ease;
}

.registro-footer a:hover {
  color: #764ba2;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 768px) {
  .registro-card {
    padding: 2rem 1.5rem;
  }
  
  .progress-steps {
    padding: 1rem 0;
  }
  
  .step-label {
    font-size: 0.75rem;
  }
  
  .step-circle {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .step-line {
    width: 50px;
  }
  
  .header-icon {
    width: 60px;
    height: 60px;
  }
  
  .header-icon i {
    font-size: 2rem;
  }
}
</style>
