<template>
  <div>
    <Navbar />
    
    <div class="container mt-5 mb-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <i class="bi bi-person-plus text-primary" style="font-size: 3rem;"></i>
                <h3 class="mt-3">Crear Cuenta</h3>
                <p class="text-muted">Únete a la familia ePaws</p>
              </div>
              
              <form @submit.prevent="handleRegistro">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="nombre" class="form-label">Nombre *</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="nombre" 
                      v-model="form.nombre"
                      :class="{ 'is-invalid': errores.nombre }"
                      placeholder="Juan"
                      required
                    >
                    <div class="invalid-feedback">{{ errores.nombre }}</div>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label for="apellido" class="form-label">Apellido</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="apellido" 
                      v-model="form.apellido"
                      :class="{ 'is-invalid': errores.apellido }"
                      placeholder="Pérez"
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
                    placeholder="ejemplo@correo.com"
                    required
                  >
                  <div class="invalid-feedback">{{ errores.correo }}</div>
                </div>
                
                <div class="mb-3">
                  <label for="contrasena" class="form-label">Contraseña *</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="contrasena" 
                    v-model="form.contrasena"
                    :class="{ 'is-invalid': errores.contrasena }"
                    placeholder="Mínimo 5 caracteres"
                    required
                  >
                  <div class="invalid-feedback">{{ errores.contrasena }}</div>
                </div>
                
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="telefono" class="form-label">Teléfono</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="telefono" 
                      v-model="form.telefono"
                      :class="{ 'is-invalid': errores.telefono }"
                      placeholder="12345678 o 1234-5678"
                      maxlength="30"
                    >
                    <div class="invalid-feedback">{{ errores.telefono }}</div>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label for="rol" class="form-label">Tipo de Usuario *</label>
                    <select 
                      class="form-select" 
                      id="rol" 
                      v-model="form.idRol"
                      :class="{ 'is-invalid': errores.rol }"
                      required
                    >
                      <option value="">Seleccione...</option>
                      <option :value="1">Cliente</option>
                      <option :value="2">Organización</option>
                      <option :value="3">Veterinaria</option>
                    </select>
                    <div class="invalid-feedback">{{ errores.rol }}</div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="direccion" class="form-label">Dirección</label>
                  <textarea 
                    class="form-control" 
                    id="direccion" 
                    v-model="form.direccion"
                    :class="{ 'is-invalid': errores.direccion }"
                    rows="2"
                    placeholder="San Salvador, El Salvador (Máximo 150 caracteres)"
                    maxlength="150"
                  ></textarea>
                  <div class="invalid-feedback">{{ errores.direccion }}</div>
                </div>
                
                <!-- Campos adicionales para Organización -->
                <div v-if="form.idRol == 2" class="border-top pt-3 mt-3">
                  <h5 class="mb-3">Datos de la Organización</h5>
                  <div class="mb-3">
                    <label for="nombreOrganizacion" class="form-label">Nombre de la Organización *</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="nombreOrganizacion" 
                      v-model="form.nombreOrganizacion"
                      placeholder="Ej: Rescate de Animales ABC"
                      :required="form.idRol == 2"
                    >
                  </div>
                </div>
                
                <!-- Campos adicionales para Veterinaria -->
                <div v-if="form.idRol == 3" class="border-top pt-3 mt-3">
                  <h5 class="mb-3">Datos de la Clínica Veterinaria</h5>
                  <div class="mb-3">
                    <label for="nombreClinica" class="form-label">Nombre de la Clínica *</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="nombreClinica" 
                      v-model="form.nombreClinica"
                      placeholder="Ej: Clínica Veterinaria PetCare"
                      :required="form.idRol == 3"
                    >
                  </div>
                  <div class="mb-3">
                    <label for="especialidad" class="form-label">Especialidad</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="especialidad" 
                      v-model="form.especialidad"
                      placeholder="Ej: General, Cirugía, Emergencias"
                    >
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
                      Registrando...
                    </span>
                    <span v-else>
                      <i class="bi bi-person-plus me-2"></i>
                      Crear Cuenta
                    </span>
                  </button>
                </div>
              </form>
              
              <hr class="my-4">
              
              <div class="text-center">
                <p class="mb-0">¿Ya tienes cuenta? 
                  <router-link to="/login" class="text-decoration-none">
                    Inicia sesión aquí
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
    
    const form = ref({
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      telefono: '',
      direccion: '',
      idRol: '',
      // Campos adicionales para Organización
      nombreOrganizacion: '',
      // Campos adicionales para Veterinaria
      nombreClinica: '',
      especialidad: ''
    });
    
    const errores = ref({});
    const cargando = ref(false);
    
    const validarFormulario = () => {
      const usuario = {
        ...form.value,
        rol: { idRol: form.value.idRol }
      };
      errores.value = validarUsuario(usuario);
      return Object.keys(errores.value).length === 0;
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
        
        console.log('Enviando datos de registro:', datosUsuario);
        
        const result = await authStore.registro(datosUsuario);
        
        if (result && result.success) {
          const usuarioCreado = result.user;
          
          // Si es Organización, crear el registro en la tabla organizaciones
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
              alertaError('Usuario creado pero hubo un error al crear la organización. Contacta al administrador.');
              return;
            }
          }
          
          // Si es Veterinaria, crear el registro en la tabla veterinarias
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
              alertaError('Usuario creado pero hubo un error al crear la veterinaria. Contacta al administrador.');
              return;
            }
          }
          
          await alertaExito(
            'Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión.',
            '¡Registro exitoso!'
          );
          router.push('/login');
        } else {
          alertaError(result?.message || 'Error al crear la cuenta. Por favor, intenta de nuevo.');
        }
      } catch (error) {
        console.error('Error al registrar:', error);
        
        // Verificar si el error es por correo duplicado
        if (error.response?.status === 409 || error.response?.data?.message?.includes('correo')) {
          alertaError('Este correo electrónico ya está registrado. Por favor, usa otro correo.');
        } else if (error.response?.status === 400) {
          alertaError('Datos inválidos. Verifica que todos los campos estén correctos.');
        } else if (!error.response) {
          alertaError('No se pudo conectar con el servidor. Verifica que el API esté corriendo en http://localhost:8080');
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
      handleRegistro
    };
  }
}
</script>
