import Swal from 'sweetalert2';

// Alerta de éxito
export const alertaExito = (mensaje, titulo = '¡Éxito!') => {
  return Swal.fire({
    icon: 'success',
    title: titulo,
    text: mensaje,
    confirmButtonColor: '#198754',
    confirmButtonText: 'Aceptar'
  });
};

// Alerta de error
export const alertaError = (mensaje, titulo = 'Error') => {
  return Swal.fire({
    icon: 'error',
    title: titulo,
    text: mensaje,
    confirmButtonColor: '#dc3545',
    confirmButtonText: 'Aceptar'
  });
};

// Alerta de advertencia
export const alertaAdvertencia = (mensaje, titulo = 'Advertencia') => {
  return Swal.fire({
    icon: 'warning',
    title: titulo,
    text: mensaje,
    confirmButtonColor: '#ffc107',
    confirmButtonText: 'Aceptar'
  });
};

// Alerta de información
export const alertaInfo = (mensaje, titulo = 'Información') => {
  return Swal.fire({
    icon: 'info',
    title: titulo,
    text: mensaje,
    confirmButtonColor: '#0dcaf0',
    confirmButtonText: 'Aceptar'
  });
};

// Confirmación
export const confirmar = (mensaje, titulo = '¿Estás seguro?') => {
  return Swal.fire({
    icon: 'question',
    title: titulo,
    text: mensaje,
    showCancelButton: true,
    confirmButtonColor: '#198754',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar'
  });
};

// Confirmación de eliminación
export const confirmarEliminar = (mensaje = '¿Deseas eliminar este registro?') => {
  return Swal.fire({
    icon: 'warning',
    title: '¿Eliminar?',
    text: mensaje,
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  });
};

// Loading
export const mostrarLoading = (mensaje = 'Cargando...') => {
  Swal.fire({
    title: mensaje,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// Cerrar loading
export const cerrarLoading = () => {
  Swal.close();
};

// Toast (notificación pequeña)
export const toast = (mensaje, tipo = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  return Toast.fire({
    icon: tipo,
    title: mensaje
  });
};

// Alerta con HTML personalizado
export const alertaHTML = (html, titulo = '') => {
  return Swal.fire({
    title: titulo,
    html: html,
    confirmButtonColor: '#198754',
    confirmButtonText: 'Aceptar'
  });
};

// Input de texto
export const inputTexto = (titulo, label = '', valorPorDefecto = '') => {
  return Swal.fire({
    title: titulo,
    input: 'text',
    inputLabel: label,
    inputValue: valorPorDefecto,
    showCancelButton: true,
    confirmButtonColor: '#198754',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value) {
        return 'Debes ingresar un valor';
      }
    }
  });
};

// Input de textarea
export const inputTextarea = (titulo, label = '', valorPorDefecto = '') => {
  return Swal.fire({
    title: titulo,
    input: 'textarea',
    inputLabel: label,
    inputValue: valorPorDefecto,
    showCancelButton: true,
    confirmButtonColor: '#198754',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value) {
        return 'Debes ingresar un valor';
      }
    }
  });
};

// Select
export const inputSelect = (titulo, opciones, label = '') => {
  return Swal.fire({
    title: titulo,
    input: 'select',
    inputLabel: label,
    inputOptions: opciones,
    showCancelButton: true,
    confirmButtonColor: '#198754',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value) {
        return 'Debes seleccionar una opción';
      }
    }
  });
};

// Manejo de errores de API
export const manejarErrorAPI = (error) => {
  console.error('Error API:', error);
  
  if (error.response) {
    // El servidor respondió con un código de error
    const status = error.response.status;
    const mensaje = error.response.data?.message || error.response.data?.error || 'Error en la solicitud';
    
    if (status === 404) {
      alertaError('El recurso solicitado no fue encontrado', 'No encontrado');
    } else if (status === 400) {
      alertaError(mensaje, 'Datos inválidos');
    } else if (status === 401) {
      alertaError('No tienes autorización para realizar esta acción', 'No autorizado');
    } else if (status === 500) {
      alertaError('Error en el servidor. Por favor, intenta más tarde', 'Error del servidor');
    } else {
      alertaError(mensaje, 'Error');
    }
  } else if (error.request) {
    // La solicitud se hizo pero no hubo respuesta
    alertaError('No se pudo conectar con el servidor. Verifica tu conexión', 'Error de conexión');
  } else {
    // Error al configurar la solicitud
    alertaError('Error inesperado: ' + error.message, 'Error');
  }
};
