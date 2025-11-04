import api from './api';

export default {
  // Obtener todas las imágenes
  getAll() {
    return api.get('/imagenes-animales');
  },

  // Obtener imagen por ID
  getById(id) {
    return api.get(`/imagenes-animales/${id}`);
  },

  // Obtener imágenes por animal
  getByAnimal(idAnimal) {
    return api.get(`/imagenes-animales/animal/${idAnimal}`);
  },

  // Crear imagen
  create(imagen) {
    return api.post('/imagenes-animales', imagen);
  },

  // Actualizar imagen
  update(id, imagen) {
    return api.put(`/imagenes-animales/${id}`, imagen);
  },

  // Eliminar imagen
  delete(id) {
    return api.delete(`/imagenes-animales/${id}`);
  }
};
