<template>
  <div>
    <Navbar />
    
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-5">
          <div class="card shadow">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <i class="bi bi-heart-fill text-primary" style="font-size: 3rem;"></i>
                <h3 class="mt-3">Iniciar Sesión</h3>
                <p class="text-muted">Accede a tu cuenta de ePaws</p>
              </div>
              
              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label for="correo" class="form-label">Correo Electrónico</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-envelope"></i>
                    </span>
                    <input 
                      type="email" 
                      class="form-control" 
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
                
                <div class="mb-3">
                  <label for="contrasena" class="form-label">Contraseña</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-lock"></i>
                    </span>
                    <input 
                      :type="mostrarContrasena ? 'text' : 'password'" 
                      class="form-control" 
                      id="contrasena" 
                      v-model="form.contrasena"
                      :class="{ 'is-invalid': errores.contrasena }"
                      placeholder="••••••••"
                      required
                    >
                    <button 
                      class="btn btn-outline-secondary" 
                      type="button"
                      @click="mostrarContrasena = !mostrarContrasena"
                    >
                      <i :class="mostrarContrasena ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                    </button>
                    <div class="invalid-feedback" v-if="errores.contrasena">
                      {{ errores.contrasena }}
                    </div>
                  </div>
                </div>
                
                <div class="d-grid gap-2">
                  <button 
                    type="submit" 
                    class="btn btn-primary btn-lg"
                    :disabled="cargando"
                  >
                    <span v-if="cargando">
                      <span class="spinner-border spinner-border-sm me-2"></span>
                      Iniciando sesión...
                    </span>
                    <span v-else>
                      <i class="bi bi-box-arrow-in-right me-2"></i>
                      Iniciar Sesión
                    </span>
                  </button>
                </div>
              </form>
              
              <hr class="my-4">
              
              <div class="text-center">
                <p class="mb-0">¿No tienes cuenta? 
                  <router-link to="/registro" class="text-decoration-none">
                    Regístrate aquí
                  </router-link>
                </p>
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
          
          // Redirigir según el rol
          const redirectMap = {
            4: '/admin',
            2: '/organizacion',
            3: '/veterinaria',
            1: '/cliente'
          };
          
          router.push(redirectMap[result.user.rol.idRol] || '/');
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
