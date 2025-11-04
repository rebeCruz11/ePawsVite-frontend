import api from './api';

export default {
  // Obtener todas las organizaciones
  getAll() {
    return api.get('/organizaciones');
  },

  // Obtener organización por ID
  getById(id) {
    return api.get(`/organizaciones/${id}`);
  },

  // Obtener organización por usuario
  getByUsuario(idUsuario) {
    return api.get(`/organizaciones/usuario/${idUsuario}`);
  },

  // Buscar organizaciones por nombre
  buscar(nombre) {
    return api.get(`/organizaciones/buscar?nombre=${nombre}`);
  },

  // Crear organización
  create(organizacion) {
    return api.post('/organizaciones', organizacion);
  },

  // Actualizar organización
  update(id, organizacion) {
    return api.put(`/organizaciones/${id}`, organizacion);
  },

  // Eliminar organización
  delete(id) {
    return api.delete(`/organizaciones/${id}`);
  }
};
