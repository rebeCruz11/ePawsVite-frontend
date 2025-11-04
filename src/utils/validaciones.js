// Validaciones para formularios

export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validarTelefono = (telefono) => {
  // Acepta números, guiones y espacios (máximo 30 caracteres)
  if (!telefono) return false;
  const regex = /^[0-9\-\s]{8,30}$/;
  return regex.test(telefono);
};

export const validarContrasena = (contrasena) => {
  // Mínimo 5 caracteres (según backend)
  return contrasena && contrasena.length >= 5;
};

export const validarNombre = (nombre) => {
  // Mínimo 2 caracteres, solo letras y espacios
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/;
  return regex.test(nombre);
};

export const validarURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validarEdad = (edad) => {
  return edad > 0 && edad < 100;
};

// Validar formulario de usuario
export const validarUsuario = (usuario) => {
  const errores = {};

  if (!usuario.nombre || !validarNombre(usuario.nombre)) {
    errores.nombre = 'El nombre debe contener al menos 2 caracteres y solo letras';
  }

  if (usuario.apellido && !validarNombre(usuario.apellido)) {
    errores.apellido = 'El apellido debe contener al menos 2 caracteres y solo letras';
  }

  if (!usuario.correo || !validarEmail(usuario.correo)) {
    errores.correo = 'Ingrese un correo electrónico válido';
  }

  if (!usuario.contrasena || !validarContrasena(usuario.contrasena)) {
    errores.contrasena = 'La contraseña debe tener al menos 5 caracteres';
  }

  if (usuario.telefono && !validarTelefono(usuario.telefono)) {
    errores.telefono = 'El teléfono debe contener entre 8-30 caracteres (números, guiones o espacios)';
  }

  if (usuario.direccion && usuario.direccion.length > 150) {
    errores.direccion = 'La dirección no puede exceder 150 caracteres';
  }

  if (!usuario.rol || !usuario.rol.idRol) {
    errores.rol = 'Debe seleccionar un rol';
  }

  return errores;
};

// Validar formulario de animal
export const validarAnimal = (animal) => {
  const errores = {};

  if (!animal.nombre || animal.nombre.length < 2) {
    errores.nombre = 'El nombre debe tener al menos 2 caracteres';
  }

  if (!animal.especie) {
    errores.especie = 'Debe seleccionar una especie';
  }

  if (!animal.edad || !validarEdad(animal.edad)) {
    errores.edad = 'Ingrese una edad válida';
  }

  if (!animal.unidadEdad) {
    errores.unidadEdad = 'Debe seleccionar una unidad de edad';
  }

  if (!animal.sexo) {
    errores.sexo = 'Debe seleccionar el sexo';
  }

  if (!animal.estado) {
    errores.estado = 'Debe seleccionar un estado';
  }

  if (!animal.descripcion || animal.descripcion.length < 10) {
    errores.descripcion = 'La descripción debe tener al menos 10 caracteres';
  }

  if (!animal.organizacion || !animal.organizacion.idOrganizacion) {
    errores.organizacion = 'Debe seleccionar una organización';
  }

  return errores;
};

// Validar formulario de organización
export const validarOrganizacion = (organizacion) => {
  const errores = {};

  if (!organizacion.nombreOrganizacion || organizacion.nombreOrganizacion.length < 3) {
    errores.nombreOrganizacion = 'El nombre debe tener al menos 3 caracteres';
  }

  if (!organizacion.descripcion || organizacion.descripcion.length < 10) {
    errores.descripcion = 'La descripción debe tener al menos 10 caracteres';
  }

  if (!organizacion.direccion || organizacion.direccion.length < 10) {
    errores.direccion = 'La dirección debe tener al menos 10 caracteres';
  }

  if (!organizacion.telefono || !validarTelefono(organizacion.telefono)) {
    errores.telefono = 'El teléfono debe tener el formato XXXX-XXXX';
  }

  if (!organizacion.usuario || !organizacion.usuario.idUsuario) {
    errores.usuario = 'Debe seleccionar un usuario';
  }

  return errores;
};

// Validar formulario de veterinaria
export const validarVeterinaria = (veterinaria) => {
  const errores = {};

  if (!veterinaria.nombreClinica || veterinaria.nombreClinica.length < 3) {
    errores.nombreClinica = 'El nombre debe tener al menos 3 caracteres';
  }

  if (!veterinaria.especialidad || veterinaria.especialidad.length < 5) {
    errores.especialidad = 'La especialidad debe tener al menos 5 caracteres';
  }

  if (!veterinaria.direccion || veterinaria.direccion.length < 10) {
    errores.direccion = 'La dirección debe tener al menos 10 caracteres';
  }

  if (!veterinaria.telefono || !validarTelefono(veterinaria.telefono)) {
    errores.telefono = 'El teléfono debe tener el formato XXXX-XXXX';
  }

  if (!veterinaria.usuario || !veterinaria.usuario.idUsuario) {
    errores.usuario = 'Debe seleccionar un usuario';
  }

  return errores;
};

// Validar formulario de reporte
export const validarReporte = (reporte) => {
  const errores = {};

  if (!reporte.titulo || reporte.titulo.length < 5 || reporte.titulo.length > 150) {
    errores.titulo = 'El título debe tener entre 5 y 150 caracteres';
  }

  if (!reporte.descripcion || reporte.descripcion.length < 10 || reporte.descripcion.length > 5000) {
    errores.descripcion = 'La descripción debe tener entre 10 y 5000 caracteres';
  }

  if (reporte.fotoUrl && reporte.fotoUrl.length > 0 && !validarURL(reporte.fotoUrl)) {
    errores.fotoUrl = 'Ingrese una URL válida';
  }

  if (!reporte.usuario || !reporte.usuario.idUsuario) {
    errores.usuario = 'Debe seleccionar un usuario';
  }

  return errores;
};

// Validar formulario de adopción
export const validarAdopcion = (adopcion) => {
  const errores = {};

  if (!adopcion.usuario || !adopcion.usuario.idUsuario) {
    errores.usuario = 'Debe seleccionar un usuario';
  }

  if (!adopcion.animal || !adopcion.animal.idAnimal) {
    errores.animal = 'Debe seleccionar un animal';
  }

  if (!adopcion.estado) {
    errores.estado = 'Debe seleccionar un estado';
  }

  return errores;
};

// Validar formulario de registro médico
export const validarRegistroMedico = (registro) => {
  const errores = {};

  if (!registro.animal || !registro.animal.idAnimal) {
    errores.animal = 'Debe seleccionar un animal';
  }

  if (!registro.veterinaria || !registro.veterinaria.idVeterinaria) {
    errores.veterinaria = 'Debe seleccionar una veterinaria';
  }

  if (!registro.tipoAtencion) {
    errores.tipoAtencion = 'Debe seleccionar un tipo de atención';
  }

  if (!registro.diagnostico || registro.diagnostico.length < 10) {
    errores.diagnostico = 'El diagnóstico debe tener al menos 10 caracteres';
  }

  if (!registro.tratamiento || registro.tratamiento.length < 10) {
    errores.tratamiento = 'El tratamiento debe tener al menos 10 caracteres';
  }

  return errores;
};
