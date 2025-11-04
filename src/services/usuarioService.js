import api from './api';

export default {
  // Obtener todos los usuarios
  getAll() {
    return api.get('/usuarios');
  },

  // Obtener usuario por ID
  getById(id) {
    return api.get(`/usuarios/${id}`);
  },

  // Obtener usuario por correo
  getByEmail(correo) {
    return api.get(`/usuarios/correo/${correo}`);
  },

  // Obtener usuarios por rol
  getByRol(idRol) {
    return api.get(`/usuarios/rol/${idRol}`);
  },

  // Crear usuario
  create(usuario) {
    return api.post('/usuarios', usuario);
  },

  // Actualizar usuario
  update(id, usuario) {
    return api.put(`/usuarios/${id}`, usuario);
  },

  // Eliminar usuario
  delete(id) {
    return api.delete(`/usuarios/${id}`);
  },

  // Login (simulado - ajustar según tu backend)
  async login(correo, contrasena) {
    try {
      // Primero obtenemos el usuario por correo
      const response = await this.getByEmail(correo);
      const usuario = response.data;
      
      // Validamos la contraseña (en producción esto debe hacerse en el backend)
      if (usuario && usuario.contrasena === contrasena) {
        return { data: usuario, success: true };
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (error) {
      throw error;
    }
  }
};
