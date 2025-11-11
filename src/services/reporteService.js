import api from './api';

export default {
  // Obtener todos los reportes
  async listar() {
    const response = await api.get('/reportes');
    return response.data;
  },

  async obtenerPorId(id) {
    const response = await api.get(`/reportes/${id}`);
    return response.data;
  },

  async obtenerReportesPorVeterinaria(idVeterinaria) {
    const response = await api.get(`/reportes/veterinaria/${idVeterinaria}`);
    return response.data;
  },

  async obtenerReportesPorOrganizacion(idOrganizacion) {
    const response = await api.get(`/reportes/organizacion/${idOrganizacion}`);
    return response.data;
  },

  async crear(reporte) {
    const response = await api.post('/reportes', reporte);
    return response.data;
  },

  async actualizar(id, reporte) {
    const response = await api.put(`/reportes/${id}`, reporte);
    return response.data;
  },

  async eliminar(id) {
    const response = await api.delete(`/reportes/${id}`);
    return response.data;
  },

  // Métodos legacy para compatibilidad
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
