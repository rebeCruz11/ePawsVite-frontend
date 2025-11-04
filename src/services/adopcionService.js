import api from './api';
import imagenAnimalService from './imagenAnimalService';

// Helper para cargar imágenes de un animal dentro de una adopción
const cargarImagenesAdopcion = async (adopcion) => {
  if (adopcion.animal && adopcion.animal.idAnimal) {
    try {
      const response = await imagenAnimalService.getByAnimal(adopcion.animal.idAnimal);
      return { 
        ...adopcion, 
        animal: { ...adopcion.animal, imagenes: response.data }
      };
    } catch (error) {
      console.warn(`No se pudieron cargar imágenes para adopción ${adopcion.idAdopcion}:`, error);
      return { 
        ...adopcion, 
        animal: { ...adopcion.animal, imagenes: [] }
      };
    }
  }
  return adopcion;
};

// Helper para cargar imágenes de múltiples adopciones
const cargarImagenesAdopciones = async (adopciones) => {
  return Promise.all(adopciones.map(cargarImagenesAdopcion));
};

export default {
  // Obtener todas las adopciones
  async getAll() {
    const response = await api.get('/adopciones');
    response.data = await cargarImagenesAdopciones(response.data);
    return response;
  },

  // Obtener adopción por ID
  async getById(id) {
    const response = await api.get(`/adopciones/${id}`);
    response.data = await cargarImagenesAdopcion(response.data);
    return response;
  },

  // Obtener adopciones por usuario
  async getByUsuario(idUsuario) {
    const response = await api.get(`/adopciones/usuario/${idUsuario}`);
    response.data = await cargarImagenesAdopciones(response.data);
    return response;
  },

  // Obtener adopciones por animal
  async getByAnimal(idAnimal) {
    const response = await api.get(`/adopciones/animal/${idAnimal}`);
    response.data = await cargarImagenesAdopciones(response.data);
    return response;
  },

  // Obtener adopciones por estado
  async getByEstado(estado) {
    const response = await api.get(`/adopciones/estado/${estado}`);
    response.data = await cargarImagenesAdopciones(response.data);
    return response;
  },

  // Crear adopción
  create(adopcion) {
    return api.post('/adopciones', adopcion);
  },

  // Actualizar adopción
  update(id, adopcion) {
    return api.put(`/adopciones/${id}`, adopcion);
  },

  // Eliminar adopción
  delete(id) {
    return api.delete(`/adopciones/${id}`);
  }
};
