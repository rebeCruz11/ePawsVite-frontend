# ePaws Frontend - Instrucciones de Instalación y Ejecución

## 📋 Prerrequisitos

- **Node.js** versión 18 o superior
- **npm** o **yarn**
- **Backend API** corriendo en `http://localhost:8080`

## 🚀 Instalación

### Paso 1: Abrir terminal en la carpeta del proyecto

```powershell
cd "c:\Users\rebec\OneDrive\Documentos\UNICAESRebeca\Ciclo_8\multiplataforma\ProyectoFinalApi\ePaws-frontend\ePaws-frontend"
```

### Paso 2: Instalar dependencias

```powershell
npm install
```

Este comando instalará todas las dependencias listadas en `package.json`:
- Vue 3
- Vue Router
- Pinia
- Axios
- Bootstrap 5
- SweetAlert2
- Chart.js
- CryptoJS

### Paso 3: Ejecutar en modo desarrollo

```powershell
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173**

## 🎯 Cómo Probar el Sistema

### 1. Crear Usuarios en la API

Primero necesitas crear usuarios en tu backend. Usa Postman para crear estos usuarios:

**Crear Administrador:**
```json
POST http://localhost:8080/api/usuarios
Content-Type: application/json

{
  "rol": {"idRol": 1},
  "nombre": "Admin",
  "apellido": "Sistema",
  "correo": "admin@epaws.com",
  "contrasena": "admin123",
  "telefono": "7777-7777",
  "direccion": "San Salvador, El Salvador"
}
```

**Crear Organización:**
```json
POST http://localhost:8080/api/usuarios
{
  "rol": {"idRol": 2},
  "nombre": "Refugio",
  "apellido": "Animales",
  "correo": "org@epaws.com",
  "contrasena": "org123",
  "telefono": "7777-7777",
  "direccion": "San Salvador"
}
```

**Crear Veterinaria:**
```json
POST http://localhost:8080/api/usuarios
{
  "rol": {"idRol": 3},
  "nombre": "Clínica",
  "apellido": "Veterinaria",
  "correo": "vet@epaws.com",
  "contrasena": "vet123",
  "telefono": "7777-7777",
  "direccion": "San Salvador"
}
```

**Crear Cliente:**
```json
POST http://localhost:8080/api/usuarios
{
  "rol": {"idRol": 4},
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "cliente@epaws.com",
  "contrasena": "cliente123",
  "telefono": "7777-7777",
  "direccion": "San Salvador"
}
```

### 2. Crear Datos de Prueba

**Crear Organización (usando usuario con idRol: 2):**
```json
POST http://localhost:8080/api/organizaciones
{
  "usuario": {"idUsuario": 2},
  "nombreOrganizacion": "Refugio San Salvador",
  "descripcion": "Organización dedicada al rescate de animales",
  "direccion": "San Salvador, El Salvador",
  "telefono": "2222-2222"
}
```

**Crear Veterinaria (usando usuario con idRol: 3):**
```json
POST http://localhost:8080/api/veterinarias
{
  "usuario": {"idUsuario": 3},
  "nombreClinica": "Clínica Veterinaria Central",
  "especialidad": "Medicina General",
  "direccion": "San Salvador, El Salvador",
  "telefono": "2333-3333"
}
```

**Crear Animales (usando la organización creada):**
```json
POST http://localhost:8080/api/animales
{
  "organizacion": {"idOrganizacion": 1},
  "nombre": "Max",
  "especie": "Perro",
  "edad": 3,
  "unidadEdad": "Años",
  "sexo": "Macho",
  "estado": "Disponible",
  "descripcion": "Perro muy amigable y juguetón"
}
```

### 3. Iniciar Sesión

1. Abre el navegador en `http://localhost:5173`
2. Haz clic en "Iniciar Sesión"
3. Usa las credenciales según el rol que quieras probar:

**Administrador:**
- Correo: `admin@epaws.com`
- Contraseña: `admin123`

**Organización:**
- Correo: `org@epaws.com`
- Contraseña: `org123`

**Veterinaria:**
- Correo: `vet@epaws.com`
- Contraseña: `vet123`

**Cliente:**
- Correo: `cliente@epaws.com`
- Contraseña: `cliente123`

## 📱 Funcionalidades por Rol

### Administrador
- ✅ Dashboard con gráficos estadísticos
- ✅ CRUD de Usuarios
- ✅ CRUD de Organizaciones
- ✅ CRUD de Veterinarias
- ✅ Gestión de Animales
- ✅ Gestión de Adopciones
- ✅ Gestión de Reportes

### Organización
- ✅ Dashboard con estadísticas
- ✅ CRUD de sus animales
- ✅ Gestión de adopciones de sus animales
- ✅ Ver reportes asignados
- ✅ Gestión de perfil

### Veterinaria
- ✅ Dashboard con estadísticas
- ✅ Ver reportes asignados
- ✅ CRUD de registros médicos
- ✅ Gestión de perfil

### Cliente
- ✅ Ver animales disponibles
- ✅ Solicitar adopciones
- ✅ Ver mis adopciones
- ✅ Crear reportes con fotos
- ✅ Ver mis reportes

## 🛠️ Comandos Útiles

```powershell
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview
```

## 🔧 Solución de Problemas

### Error: "Cannot find module"
```powershell
# Eliminar node_modules y reinstalar
Remove-Item -Recurse -Force node_modules
npm install
```

### Error: Puerto 5173 ya en uso
```powershell
# Cambiar el puerto en vite.config.js
# O cerrar la aplicación que usa el puerto
```

### Error de conexión con la API
- Verifica que el backend esté corriendo en `http://localhost:8080`
- Revisa la consola del navegador para ver errores específicos
- Verifica que CORS esté habilitado en el backend

## 📦 Estructura del Proyecto

```
src/
├── assets/          # CSS y recursos estáticos
├── components/      # Componentes reutilizables
│   └── common/      # Navbar, Footer, Loading, Pagination
├── layouts/         # Layouts por rol
├── views/           # Vistas/Páginas por módulo
│   ├── auth/        # Login, Registro
│   ├── admin/       # Vistas de administrador
│   ├── organizacion/# Vistas de organización
│   ├── veterinaria/ # Vistas de veterinaria
│   └── cliente/     # Vistas de cliente
├── services/        # Servicios API (Axios)
├── stores/          # Estado global (Pinia)
├── router/          # Configuración de rutas
├── utils/           # Utilidades y helpers
├── App.vue          # Componente raíz
└── main.js          # Punto de entrada
```

## 🌐 URLs del Sistema

- Home: `http://localhost:5173/`
- Login: `http://localhost:5173/login`
- Registro: `http://localhost:5173/registro`
- Admin: `http://localhost:5173/admin`
- Organización: `http://localhost:5173/organizacion`
- Veterinaria: `http://localhost:5173/veterinaria`
- Cliente: `http://localhost:5173/cliente`

## ⚠️ Notas Importantes

1. **Autenticación**: El sistema usa localStorage para mantener la sesión
2. **Encriptación**: Las contraseñas se envían en texto plano. En producción deberían encriptarse
3. **Fotos**: Se usan URLs externas. Puedes usar servicios como Imgur para subir imágenes
4. **CORS**: Asegúrate de que el backend tenga CORS habilitado
5. **Validaciones**: Todas las validaciones están implementadas en el frontend y backend

## 📧 Soporte

Para dudas o problemas:
1. Revisa `GUIA_IMPLEMENTACION.md` para templates de vistas
2. Revisa `DOCUMENTACION_API.md` para endpoints de la API
3. Revisa la consola del navegador para errores
4. Verifica que la API esté funcionando correctamente

## ✅ Checklist de Verificación

- [ ] Node.js 18+ instalado
- [ ] Backend API corriendo en puerto 8080
- [ ] Base de datos MySQL conectada
- [ ] Usuarios de prueba creados
- [ ] Dependencias instaladas (`npm install`)
- [ ] Frontend corriendo (`npm run dev`)
- [ ] Puedes iniciar sesión con cada rol
- [ ] Puedes crear, editar y eliminar registros

¡Listo! Tu sistema ePaws está funcionando. 🐾
