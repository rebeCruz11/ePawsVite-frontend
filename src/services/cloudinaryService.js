/**
 * Servicio para subir imágenes a Cloudinary
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dnux3wmic';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'epaws_preset';

/**
 * Sube una imagen a Cloudinary
 * @param {File} file - Archivo de imagen a subir
 * @param {string} folder - Carpeta en Cloudinary (ej: 'reportes', 'animales')
 * @returns {Promise<string>} URL de la imagen subida
 */
export const subirImagen = async (file, folder = 'epaws') => {
  if (!file) {
    throw new Error('No se proporcionó ningún archivo');
  }

  // Validar tipo de archivo
  const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!tiposPermitidos.includes(file.type)) {
    throw new Error('Tipo de archivo no permitido. Use JPG, PNG, WEBP o GIF');
  }

  // Validar tamaño (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('El archivo es demasiado grande. Tamaño máximo: 5MB');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error al subir la imagen');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error en subirImagen:', error);
    throw new Error('No se pudo subir la imagen a Cloudinary: ' + error.message);
  }
};

/**
 * Sube múltiples imágenes a Cloudinary
 * @param {File[]} files - Array de archivos de imagen
 * @param {string} folder - Carpeta en Cloudinary
 * @param {number} maxFiles - Número máximo de archivos permitidos
 * @returns {Promise<string[]>} Array de URLs de las imágenes subidas
 */
export const subirMultiplesImagenes = async (files, folder = 'epaws', maxFiles = 4) => {
  if (!files || files.length === 0) {
    throw new Error('No se proporcionaron archivos');
  }

  if (files.length > maxFiles) {
    throw new Error(`Máximo ${maxFiles} imágenes permitidas`);
  }

  try {
    const promesas = Array.from(files).map(file => subirImagen(file, folder));
    return await Promise.all(promesas);
  } catch (error) {
    console.error('Error en subirMultiplesImagenes:', error);
    throw error;
  }
};

/**
 * Elimina una imagen de Cloudinary (opcional, requiere configuración adicional)
 * @param {string} publicId - ID público de la imagen en Cloudinary
 */
export const eliminarImagen = async (publicId) => {
  // Nota: Eliminar imágenes requiere autenticación del lado del servidor
  // Por seguridad, esto debería implementarse en el backend
  console.warn('Eliminar imágenes debe implementarse en el backend por seguridad');
};

export default {
  subirImagen,
  subirMultiplesImagenes,
  eliminarImagen
};
