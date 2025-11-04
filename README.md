# ePaws Frontend - Sistema de Adopción de Animales

Sistema completo de gestión de adopciones de animales desarrollado con Vue 3, JavaScript, Bootstrap 5 y SweetAlert2.

## 🚀 Características

- ✅ **Autenticación y Autorización**: Login con encriptación de contraseñas y menús personalizados por rol
- ✅ **CRUD Completo**: Gestión de usuarios, animales, organizaciones, veterinarias, adopciones, reportes y registros médicos
- ✅ **Validaciones**: Formularios con validación en tiempo real
- ✅ **Reportes Administrativos**: Dashboard con gráficos estadísticos (Chart.js)
- ✅ **Paginación**: Listados con paginación de datos
- ✅ **AJAX/Fetch**: Comunicación con API REST usando Axios
- ✅ **Roles de Usuario**: Admin, Organización, Veterinaria, Cliente
- ✅ **Diseño Responsivo**: Bootstrap 5 + Bootstrap Icons
- ✅ **Alertas Elegantes**: SweetAlert2 para notificaciones

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- API Backend corriendo en `http://localhost:8080`

## 🔧 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview
```

## 👥 Roles y Funcionalidades

### 🔴 Administrador (idRol: 1)
- CRUD de usuarios
- CRUD de organizaciones
- CRUD de veterinarias
- Dashboard con estadísticas
- Gestión de adopciones
- Reportes administrativos

### 🟢 Organización (idRol: 2)
- CRUD de animales
- Ver reportes asignados
- Gestionar adopciones de sus animales
- Perfil de organización

### 🔵 Veterinaria (idRol: 3)
- Ver reportes asignados
- Crear registros médicos
- Gestionar historiales médicos
- Perfil de veterinaria

### 🟡 Cliente/Usuario (idRol: 4)
- Ver animales disponibles
- Solicitar adopciones
- Crear reportes de animales
- Ver mis adopciones
- Ver mis reportes

## 📁 Estructura del Proyecto

```
src/
├── assets/          # Archivos estáticos (CSS, imágenes)
├── components/      # Componentes reutilizables
│   ├── common/      # Componentes comunes (Navbar, Footer, Pagination)
│   └── charts/      # Gráficos con Chart.js
├── layouts/         # Layouts por rol
│   ├── AdminLayout.vue
│   ├── OrganizacionLayout.vue
│   ├── VeterinariaLayout.vue
│   └── ClienteLayout.vue
├── views/           # Vistas/Páginas
│   ├── auth/        # Login, Registro
│   ├── admin/       # Vistas de administrador
│   ├── organizacion/# Vistas de organización
│   ├── veterinaria/ # Vistas de veterinaria
│   └── cliente/     # Vistas de cliente
├── services/        # Servicios API (Axios)
├── stores/          # Estado global (Pinia)
├── router/          # Configuración de rutas
├── utils/           # Utilidades (validaciones, helpers)
├── App.vue          # Componente principal
└── main.js          # Punto de entrada
```

## 🔐 Usuarios de Prueba

Puedes crear usuarios con estos roles en la API:

```json
// Administrador
{
  "rol": {"idRol": 1},
  "correo": "admin@epaws.com",
  "contrasena": "admin123"
}

// Organización
{
  "rol": {"idRol": 2},
  "correo": "org@epaws.com",
  "contrasena": "org123"
}

// Veterinaria
{
  "rol": {"idRol": 3},
  "correo": "vet@epaws.com",
  "contrasena": "vet123"
}

// Cliente
{
  "rol": {"idRol": 4},
  "correo": "cliente@epaws.com",
  "contrasena": "cliente123"
}
```

## 🎨 Tecnologías Utilizadas

- **Vue 3**: Framework progresivo de JavaScript
- **Vite**: Build tool ultrarrápido
- **Vue Router**: Enrutamiento
- **Pinia**: Gestión de estado
- **Axios**: Cliente HTTP (AJAX/Fetch)
- **Bootstrap 5**: Framework CSS
- **SweetAlert2**: Alertas elegantes
- **Chart.js**: Gráficos estadísticos
- **CryptoJS**: Encriptación de contraseñas

## 📊 Funcionalidades Especiales

### Validaciones de Formularios
- Validación en tiempo real
- Mensajes de error descriptivos
- Prevención de envíos duplicados

### Paginación
- Listados con paginación configurable
- Búsqueda y filtros integrados

### Reportes con Fotos
- Subida de URLs de imágenes
- Visualización de fotos en tarjetas

### Dashboard Administrativo
- Gráficos de adopciones por mes
- Estadísticas de animales por especie
- Reportes por estado

## 🌐 API Backend

El sistema se conecta a la API REST en `http://localhost:8080/api`

Ver documentación completa en `DOCUMENTACION_API.md`

## 📄 Licencia

Proyecto académico - UNICAES 2025
