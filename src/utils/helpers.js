// Formatear fecha
export const formatearFecha = (fecha) => {
  if (!fecha) return '';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Formatear fecha y hora
export const formatearFechaHora = (fecha) => {
  if (!fecha) return '';
  const date = new Date(fecha);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Capitalizar primera letra
export const capitalizar = (texto) => {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};

// Truncar texto
export const truncar = (texto, longitud = 100) => {
  if (!texto) return '';
  if (texto.length <= longitud) return texto;
  return texto.substring(0, longitud) + '...';
};

// Obtener nombre completo
export const nombreCompleto = (usuario) => {
  if (!usuario) return '';
  return `${usuario.nombre} ${usuario.apellido}`;
};

// Obtener iniciales
export const obtenerIniciales = (usuario) => {
  if (!usuario) return '';
  const nombre = usuario.nombre || '';
  const apellido = usuario.apellido || '';
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
};

// Formatear número de teléfono
export const formatearTelefono = (telefono) => {
  if (!telefono) return '';
  // Eliminar cualquier carácter no numérico
  const numeros = telefono.replace(/\D/g, '');
  // Formatear como XXXX-XXXX
  if (numeros.length === 8) {
    return `${numeros.substring(0, 4)}-${numeros.substring(4)}`;
  }
  return telefono;
};

// Obtener color por estado
export const colorPorEstado = (estado) => {
  const colores = {
    'Pendiente': 'warning',
    'Aprobada': 'success',
    'Rechazada': 'danger',
    'Cancelada': 'secondary',
    'Disponible': 'success',
    'Adoptado': 'primary',
    'No_disponible': 'secondary',
    'En_proceso': 'info',
    'Cerrado': 'secondary'
  };
  return colores[estado] || 'secondary';
};

// Obtener icono por especie
export const iconoPorEspecie = (especie) => {
  const iconos = {
    'Perro': 'bi-dog',
    'Gato': 'bi-cat',
    'Otro': 'bi-question-circle'
  };
  return iconos[especie] || 'bi-question-circle';
};

// Obtener nombre de rol
export const nombreRol = (idRol) => {
  const roles = {
    1: 'Cliente',
    2: 'Organización',
    3: 'Veterinaria',
    4: 'Administrador'
  };
  return roles[idRol] || 'Desconocido';
};

// Formatear estado para mostrar
export const formatearEstado = (estado) => {
  if (!estado) return '';
  return estado.replace(/_/g, ' ');
};

// Obtener URL de la foto del animal
export const obtenerFotoAnimal = (animal) => {
  // Si el animal tiene fotoUrl directamente
  if (animal.fotoUrl) return animal.fotoUrl;
  
  // Si el animal tiene un array de imagenes
  if (animal.imagenes && animal.imagenes.length > 0) {
    return animal.imagenes[0].url;
  }
  
  // Si el animal tiene imagenesAnimales (posible nombre en backend)
  if (animal.imagenesAnimales && animal.imagenesAnimales.length > 0) {
    return animal.imagenesAnimales[0].url;
  }
  
  // Si el animal tiene imagenAnimal (singular)
  if (animal.imagenAnimal && animal.imagenAnimal.url) {
    return animal.imagenAnimal.url;
  }
  
  return null;
};

// Ordenar array por fecha
export const ordenarPorFecha = (array, campo = 'fechaCreacion', orden = 'desc') => {
  return array.sort((a, b) => {
    const fechaA = new Date(a[campo]);
    const fechaB = new Date(b[campo]);
    return orden === 'desc' ? fechaB - fechaA : fechaA - fechaB;
  });
};

// Filtrar array por búsqueda
export const filtrarPorBusqueda = (array, busqueda, campos = []) => {
  if (!busqueda) return array;
  const busquedaLower = busqueda.toLowerCase();
  return array.filter(item => {
    return campos.some(campo => {
      const valor = item[campo];
      if (!valor) return false;
      return valor.toString().toLowerCase().includes(busquedaLower);
    });
  });
};

// Paginar array
export const paginar = (array, paginaActual, itemsPorPagina) => {
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  return array.slice(inicio, fin);
};

// Calcular total de páginas
export const calcularTotalPaginas = (totalItems, itemsPorPagina) => {
  return Math.ceil(totalItems / itemsPorPagina);
};
