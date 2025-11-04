import { defineStore } from 'pinia';
import usuarioService from '../services/usuarioService';
import { encriptarContrasena, desencriptarContrasena } from '../utils/encriptacion';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
  }),

  getters: {
    // Verificar si el usuario está autenticado
    estaAutenticado: (state) => state.isAuthenticated,

    // Obtener usuario actual
    usuarioActual: (state) => state.user,

    // Obtener rol del usuario
    rolUsuario: (state) => state.user?.rol?.idRol || null,

    // Verificar si es administrador
    esAdmin: (state) => state.user?.rol?.idRol === 4,

    // Verificar si es organización
    esOrganizacion: (state) => state.user?.rol?.idRol === 2,

    // Verificar si es veterinaria
    esVeterinaria: (state) => state.user?.rol?.idRol === 3,

    // Verificar si es cliente/usuario
    esCliente: (state) => state.user?.rol?.idRol === 1,

    // Obtener nombre completo del usuario
    nombreCompleto: (state) => {
      if (!state.user) return '';
      return `${state.user.nombre} ${state.user.apellido}`;
    },

    // Obtener iniciales del usuario
    iniciales: (state) => {
      if (!state.user || !state.user.nombre) return '';
      const inicial1 = state.user.nombre.charAt(0);
      const inicial2 = state.user.apellido ? state.user.apellido.charAt(0) : '';
      return `${inicial1}${inicial2}`.toUpperCase();
    }
  },

  actions: {
    // Login
    async login(correo, contrasena) {
      try {
        const response = await usuarioService.login(correo, contrasena);
        
        if (response.success) {
          const user = response.data;
          
          // Guardar usuario y token
          this.user = user;
          this.token = 'token_' + user.idUsuario; // Simulado
          this.isAuthenticated = true;

          // Guardar en localStorage
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('token', this.token);

          return { success: true, user };
        }
      } catch (error) {
        return { success: false, message: 'Credenciales inválidas' };
      }
    },

    // Registro
    async registro(datosUsuario) {
      try {
        // Encriptar contraseña
        const usuarioConContrasenaEncriptada = {
          ...datosUsuario,
          contrasena: datosUsuario.contrasena // En producción, encriptar aquí
        };

        const response = await usuarioService.create(usuarioConContrasenaEncriptada);
        
        if (response && response.data) {
          return { success: true, user: response.data };
        } else {
          return { success: false, message: 'Error al registrar usuario' };
        }
      } catch (error) {
        console.error('Error en registro:', error);
        throw error; // Propagar el error para que sea capturado por el componente
      }
    },

    // Logout
    logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;

      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },

    // Actualizar usuario actual
    actualizarUsuario(usuario) {
      this.user = usuario;
      localStorage.setItem('user', JSON.stringify(usuario));
    },

    // Verificar autenticación
    verificarAuth() {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (user && token) {
        this.user = JSON.parse(user);
        this.token = token;
        this.isAuthenticated = true;
        return true;
      }

      return false;
    }
  }
});
