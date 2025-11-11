<template>
  <div class="login-page">
    <Navbar />
    
    <!-- Hero background -->
    <div class="login-background">
      <div class="gradient-overlay"></div>
      <div class="pattern-overlay"></div>
    </div>
    
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100 py-5">
        <div class="col-md-10 col-lg-8">
          <div class="row g-0 login-wrapper">
            <!-- Left Side - Branding -->
            <div class="col-lg-6 login-brand-side">
              <div class="brand-content">
                <div class="brand-icon mb-4">
                  <i class="bi bi-heart-fill"></i>
                </div>
                <h2 class="text-white fw-bold mb-3">Bienvenido de vuelta a ePaws</h2>
                <p class="text-white-80 mb-4">
                  Inicia sesión para continuar ayudando a encontrar hogares para mascotas que lo necesitan
                </p>
                
                <div class="features-list">
                  <div class="feature-item">
                    <i class="bi bi-check-circle-fill"></i>
                    <span>Gestiona solicitudes de adopción</span>
                  </div>
                  <div class="feature-item">
                    <i class="bi bi-check-circle-fill"></i>
                    <span>Reporta animales en necesidad</span>
                  </div>
                  <div class="feature-item">
                    <i class="bi bi-check-circle-fill"></i>
                    <span>Conecta con organizaciones</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Right Side - Login Form -->
            <div class="col-lg-6 login-form-side">
              <div class="form-container">
                <div class="text-center mb-4">
                  <h3 class="fw-bold mb-2">Iniciar Sesión</h3>
                  <p class="text-muted">Accede a tu cuenta de ePaws</p>
                </div>
                
                <form @submit.prevent="handleLogin">
                  <div class="mb-4">
                    <label for="correo" class="form-label fw-semibold">Correo Electrónico</label>
                    <div class="input-group-custom">
                      <span class="input-icon">
                        <i class="bi bi-envelope"></i>
                      </span>
                      <input 
                        type="email" 
                        class="form-control form-control-lg" 
                        id="correo" 
                        v-model="form.correo"
                        :class="{ 'is-invalid': errores.correo }"
                        placeholder="ejemplo@correo.com"
                        required
                      >
                      <div class="invalid-feedback" v-if="errores.correo">
                        {{ errores.correo }}
                      </div>
                    </div>
                  </div>
                  
                  <div class="mb-4">
                    <label for="contrasena" class="form-label fw-semibold">Contraseña</label>
                    <div class="input-group-custom">
                      <span class="input-icon">
                        <i class="bi bi-lock"></i>
                      </span>
                      <input 
                        :type="mostrarContrasena ? 'text' : 'password'" 
                        class="form-control form-control-lg" 
                        id="contrasena" 
                        v-model="form.contrasena"
                        :class="{ 'is-invalid': errores.contrasena }"
                        placeholder="••••••••"
                        required
                      >
                      <button 
                        class="password-toggle" 
                        type="button"
                        @click="mostrarContrasena = !mostrarContrasena"
                        tabindex="-1"
                      >
                        <i :class="mostrarContrasena ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                      </button>
                      <div class="invalid-feedback" v-if="errores.contrasena">
                        {{ errores.contrasena }}
                      </div>
                    </div>
                  </div>
                  
                  <div class="d-grid gap-2 mb-4">
                    <button 
                      type="submit" 
                      class="btn btn-primary btn-lg btn-login"
                      :disabled="cargando"
                    >
                      <span v-if="cargando" class="d-flex align-items-center justify-content-center">
                        <span class="spinner-border spinner-border-sm me-2"></span>
                        Iniciando sesión...
                      </span>
                      <span v-else class="d-flex align-items-center justify-content-center">
                        <i class="bi bi-box-arrow-in-right me-2"></i>
                        Iniciar Sesión
                      </span>
                    </button>
                  </div>
                </form>
                
                <div class="divider">
                  <span>o</span>
                </div>
                
                <div class="text-center mt-4">
                  <p class="text-muted mb-0">
                    ¿No tienes cuenta? 
                    <router-link to="/registro" class="text-decoration-none fw-semibold link-primary">
                      Regístrate aquí
                    </router-link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import Navbar from '../../components/common/Navbar.vue';
import Footer from '../../components/common/Footer.vue';
import { alertaExito, alertaError } from '../../utils/alertas';
import { validarEmail, validarContrasena } from '../../utils/validaciones';

export default {
  name: 'Login',
  components: {
    Navbar,
    Footer
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    
    const form = ref({
      correo: '',
      contrasena: ''
    });
    
    const errores = ref({});
    const cargando = ref(false);
    const mostrarContrasena = ref(false);
    
    const validarFormulario = () => {
      errores.value = {};
      
      if (!validarEmail(form.value.correo)) {
        errores.value.correo = 'Ingrese un correo válido';
      }
      
      if (!validarContrasena(form.value.contrasena)) {
        errores.value.contrasena = 'La contraseña debe tener al menos 6 caracteres';
      }
      
      return Object.keys(errores.value).length === 0;
    };
    
    const handleLogin = async () => {
      if (!validarFormulario()) return;
      
      cargando.value = true;
      
      try {
        const result = await authStore.login(form.value.correo, form.value.contrasena);
        
        if (result.success) {
          await alertaExito('¡Bienvenido de nuevo!', 'Inicio de sesión exitoso');

          const redirectMap = {
            4: '/admin',
            2: '/organizacion',
            3: '/veterinaria',
            1: '/cliente'
          };

          const roleId = authStore.rolUsuario || result.user?.rol?.idRol || result.user?.rol?.id || result.user?.idRol || null;

          if (!roleId) {
            router.push('/');
          } else {
            router.push(redirectMap[roleId] || '/');
          }
        } else {
          alertaError('Credenciales incorrectas. Por favor, verifica tu correo y contraseña.');
        }
      } catch (error) {
        alertaError('Error al iniciar sesión. Por favor, intenta de nuevo.');
      } finally {
        cargando.value = false;
      }
    };
    
    return {
      form,
      errores,
      cargando,
      mostrarContrasena,
      handleLogin
    };
  }
}
</script>

<style scoped>
/* ============================================
   LAYOUT & BACKGROUND
   ============================================ */
.login-page {
  position: relative;
  min-height: 100vh;
}

.login-background {
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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
}

.pattern-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.4;
}

/* ============================================
   LOGIN WRAPPER
   ============================================ */
.login-wrapper {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
   BRAND SIDE (LEFT)
   ============================================ */
.login-brand-side {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-brand-side::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.5;
}

.brand-content {
  position: relative;
  z-index: 1;
}

.brand-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  animation: float 6s ease-in-out infinite;
}

.brand-icon i {
  font-size: 2.5rem;
  color: white;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.text-white-80 {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  font-size: 0.95rem;
}

.feature-item i {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
}

/* ============================================
   FORM SIDE (RIGHT)
   ============================================ */
.login-form-side {
  padding: 3rem;
  background: white;
}

.form-container {
  max-width: 400px;
  margin: 0 auto;
}

/* ============================================
   CUSTOM INPUTS
   ============================================ */
.input-group-custom {
  position: relative;
  display: flex;
  align-items: stretch;
}

.input-icon {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  z-index: 5;
  pointer-events: none;
}

.input-group-custom .form-control {
  padding-left: 50px;
  padding-right: 50px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.input-group-custom .form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
}

.input-group-custom .form-control.is-invalid {
  border-color: #dc3545;
  padding-right: 50px;
}

.password-toggle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #6c757d;
  cursor: pointer;
  transition: color 0.3s ease;
  z-index: 5;
}

.password-toggle:hover {
  color: #667eea;
}

/* ============================================
   BUTTON
   ============================================ */
.btn-login {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  padding: 0.875rem 2rem;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-login::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s ease;
}

.btn-login:hover::before {
  left: 100%;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* ============================================
   DIVIDER
   ============================================ */
.divider {
  position: relative;
  text-align: center;
  margin: 2rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e9ecef;
}

.divider span {
  position: relative;
  display: inline-block;
  padding: 0 1rem;
  background: white;
  color: #6c757d;
  font-size: 0.875rem;
}

/* ============================================
   LINK
   ============================================ */
.link-primary {
  color: #667eea;
  transition: all 0.3s ease;
}

.link-primary:hover {
  color: #764ba2;
  text-decoration: underline !important;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 991px) {
  .login-brand-side {
    padding: 2rem;
    min-height: 300px;
  }
  
  .brand-content h2 {
    font-size: 1.5rem;
  }
  
  .text-white-80 {
    font-size: 1rem;
  }
  
  .login-form-side {
    padding: 2rem;
  }
}

@media (max-width: 576px) {
  .login-wrapper {
    border-radius: 16px;
  }
  
  .login-brand-side,
  .login-form-side {
    padding: 1.5rem;
  }
  
  .brand-icon {
    width: 60px;
    height: 60px;
  }
  
  .brand-icon i {
    font-size: 2rem;
  }
  
  .form-container h3 {
    font-size: 1.5rem;
  }
}
</style>
