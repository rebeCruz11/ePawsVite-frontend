import api from './api';

export default {
  // Métodos nuevos con async/await
  async listar() {
    const response = await api.get('/registros-medicos');
    return response.data;
  },

  async obtenerPorId(id) {
    const response = await api.get(`/registros-medicos/${id}`);
    return response.data;
  },

  async obtenerPorReporte(idReporte) {
    const response = await api.get(`/registros-medicos/reporte/${idReporte}`);
    return response.data;
  },

  async obtenerPorVeterinaria(idVeterinaria) {
    const response = await api.get(`/registros-medicos/veterinaria/${idVeterinaria}`);
    return response.data;
  },

  async crear(registroMedico) {
    const response = await api.post('/registros-medicos', registroMedico);
    return response.data;
  },

  async actualizar(id, registroMedico) {
    const response = await api.put(`/registros-medicos/${id}`, registroMedico);
    return response.data;
  },

  async eliminar(id) {
    const response = await api.delete(`/registros-medicos/${id}`);
    return response.data;
  },

  // Obtener todos los registros médicos
  getAll() {
    return api.get('/registros-medicos');
  },

  // Obtener registro médico por ID
  getById(id) {
    return api.get(`/registros-medicos/${id}`);
  },

  // Obtener registros médicos por reporte (ACTUALIZADO)
  getByReporte(idReporte) {
    return api.get(`/registros-medicos/reporte/${idReporte}`);
  },

  // Obtener registros médicos por veterinaria
  getByVeterinaria(idVeterinaria) {
    return api.get(`/registros-medicos/veterinaria/${idVeterinaria}`);
  },

  // Crear registro médico
  create(registroMedico) {
    return api.post('/registros-medicos', registroMedico);
  },

  // Actualizar registro médico
  update(id, registroMedico) {
    return api.put(`/registros-medicos/${id}`, registroMedico);
  },

  // Eliminar registro médico
  delete(id) {
    return api.delete(`/registros-medicos/${id}`);
  }
};
