import api from './api';

export default {
  // Obtener todas las veterinarias
  getAll() {
    return api.get('/veterinarias');
  },

  // Obtener veterinaria por ID
  getById(id) {
    return api.get(`/veterinarias/${id}`);
  },

  // Obtener veterinaria por usuario
  getByUsuario(idUsuario) {
    return api.get(`/veterinarias/usuario/${idUsuario}`);
  },

  // Buscar veterinarias por nombre
  buscar(nombre) {
    return api.get(`/veterinarias/buscar?nombre=${nombre}`);
  },

  // Crear veterinaria
  create(veterinaria) {
    return api.post('/veterinarias', veterinaria);
  },

  // Actualizar veterinaria
  update(id, veterinaria) {
    return api.put(`/veterinarias/${id}`, veterinaria);
  },

  // Eliminar veterinaria
  delete(id) {
    return api.delete(`/veterinarias/${id}`);
  }
};
