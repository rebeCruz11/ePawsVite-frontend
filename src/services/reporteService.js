import api from './api';

export default {
  // Obtener todos los reportes
  getAll() {
    return api.get('/reportes');
  },

  // Obtener reporte por ID
  getById(id) {
    return api.get(`/reportes/${id}`);
  },

  // Obtener reportes por usuario
  getByUsuario(idUsuario) {
    return api.get(`/reportes/usuario/${idUsuario}`);
  },

  // Obtener reportes por veterinaria
  getByVeterinaria(idVeterinaria) {
    return api.get(`/reportes/veterinaria/${idVeterinaria}`);
  },

  // Obtener reportes por organización
  getByOrganizacion(idOrganizacion) {
    return api.get(`/reportes/organizacion/${idOrganizacion}`);
  },

  // Obtener reportes por estado
  getByEstado(estado) {
    return api.get(`/reportes/estado/${estado}`);
  },

  // Crear reporte
  create(reporte) {
    return api.post('/reportes', reporte);
  },

  // Actualizar reporte
  update(id, reporte) {
    return api.put(`/reportes/${id}`, reporte);
  },

  // Eliminar reporte
  delete(id) {
    return api.delete(`/reportes/${id}`);
  }
};
