import api from './api';

export default {
  // Obtener todos los registros médicos
  getAll() {
    return api.get('/registros-medicos');
  },

  // Obtener registro médico por ID
  getById(id) {
    return api.get(`/registros-medicos/${id}`);
  },

  // Obtener registros médicos por animal
  getByAnimal(idAnimal) {
    return api.get(`/registros-medicos/animal/${idAnimal}`);
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
