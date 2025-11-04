import api from './api';
import imagenAnimalService from './imagenAnimalService';

// Helper para cargar imágenes de un animal
const cargarImagenesAnimal = async (animal) => {
  try {
    const response = await imagenAnimalService.getByAnimal(animal.idAnimal);
    return { ...animal, imagenes: response.data };
  } catch (error) {
    console.warn(`No se pudieron cargar imágenes para animal ${animal.idAnimal}:`, error);
    return { ...animal, imagenes: [] };
  }
};

// Helper para cargar imágenes de múltiples animales
const cargarImagenesAnimales = async (animales) => {
  return Promise.all(animales.map(cargarImagenesAnimal));
};

export default {
  // Obtener todos los animales
  async getAll() {
    const response = await api.get('/animales');
    response.data = await cargarImagenesAnimales(response.data);
    return response;
  },

  // Obtener animal por ID
  async getById(id) {
    const response = await api.get(`/animales/${id}`);
    response.data = await cargarImagenesAnimal(response.data);
    return response;
  },

  // Obtener animales por organización
  async getByOrganizacion(idOrganizacion) {
    const response = await api.get(`/animales/organizacion/${idOrganizacion}`);
    response.data = await cargarImagenesAnimales(response.data);
    return response;
  },

  // Obtener animales por estado
  async getByEstado(estado) {
    const response = await api.get(`/animales/estado/${estado}`);
    response.data = await cargarImagenesAnimales(response.data);
    return response;
  },

  // Obtener animales por especie
  async getByEspecie(especie) {
    const response = await api.get(`/animales/especie/${especie}`);
    response.data = await cargarImagenesAnimales(response.data);
    return response;
  },

  // Obtener animales disponibles
  async getDisponibles() {
    const response = await api.get('/animales/disponibles');
    response.data = await cargarImagenesAnimales(response.data);
    return response;
  },

  // Buscar animales por nombre
  async buscar(nombre) {
    const response = await api.get(`/animales/buscar?nombre=${nombre}`);
    response.data = await cargarImagenesAnimales(response.data);
    return response;
  },

  // Crear animal
  create(animal) {
    return api.post('/animales', animal);
  },

  // Actualizar animal
  update(id, animal) {
    return api.put(`/animales/${id}`, animal);
  },

  // Eliminar animal
  delete(id) {
    return api.delete(`/animales/${id}`);
  }
};
