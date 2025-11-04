# Documentación API ePaws

## Configuración Base
- **URL Base**: `http://localhost:8080/api`
- **Base de datos**: MySQL (localhost:3306/epaws)

---

## 1. USUARIOS - `/api/usuarios`

### 1.1 Obtener todos los usuarios
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/usuarios`
- **Headers**: Ninguno requerido
- **Body**: Ninguno
- **Respuesta exitosa**: 200 OK - Array de usuarios

### 1.2 Obtener usuario por ID
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/usuarios/{id}`
- **Ejemplo**: `http://localhost:8080/api/usuarios/1`
- **Respuesta exitosa**: 200 OK
- **Respuesta error**: 404 Not Found

### 1.3 Obtener usuario por correo
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/usuarios/correo/{correo}`
- **Ejemplo**: `http://localhost:8080/api/usuarios/correo/juan@email.com`
- **Respuesta exitosa**: 200 OK
- **Respuesta error**: 404 Not Found

### 1.4 Obtener usuarios por rol
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/usuarios/rol/{idRol}`
- **Ejemplo**: `http://localhost:8080/api/usuarios/rol/1`
- **Respuesta exitosa**: 200 OK - Array de usuarios

### 1.5 Crear usuario
- **Método**: `POST`
- **URL**: `http://localhost:8080/api/usuarios`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (JSON):
```json
{
  "rol": {
    "idRol": 1
  },
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan.perez@email.com",
  "contrasena": "password123",
  "telefono": "7777-7777",
  "direccion": "San Salvador, El Salvador"
}
```
- **Respuesta exitosa**: 201 Created

### 1.6 Actualizar usuario
- **Método**: `PUT`
- **URL**: `http://localhost:8080/api/usuarios/{id}`
- **Ejemplo**: `http://localhost:8080/api/usuarios/1`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (JSON): Mismo formato que crear
- **Respuesta exitosa**: 200 OK
- **Respuesta error**: 404 Not Found

### 1.7 Eliminar usuario
- **Método**: `DELETE`
- **URL**: `http://localhost:8080/api/usuarios/{id}`
- **Ejemplo**: `http://localhost:8080/api/usuarios/1`
- **Respuesta exitosa**: 204 No Content

---

## 2. ANIMALES - `/api/animales`

### 2.1 Obtener todos los animales
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/animales`
- **Respuesta exitosa**: 200 OK - Array de animales

### 2.2 Obtener animal por ID
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/animales/{id}`
- **Ejemplo**: `http://localhost:8080/api/animales/1`
- **Respuesta exitosa**: 200 OK
- **Respuesta error**: 404 Not Found

### 2.3 Obtener animales por organización
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/animales/organizacion/{idOrganizacion}`
- **Ejemplo**: `http://localhost:8080/api/animales/organizacion/1`
- **Respuesta exitosa**: 200 OK - Array de animales

### 2.4 Obtener animales por estado
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/animales/estado/{estado}`
- **Ejemplo**: `http://localhost:8080/api/animales/estado/Disponible`
- **Estados válidos**: `Disponible`, `Pendiente`, `Adoptado`, `No_disponible`
- **Respuesta exitosa**: 200 OK - Array de animales

### 2.5 Obtener animales por especie
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/animales/especie/{especie}`
- **Ejemplo**: `http://localhost:8080/api/animales/especie/Perro`
- **Especies válidas**: `Perro`, `Gato`, `Otro`
- **Respuesta exitosa**: 200 OK - Array de animales

### 2.6 Obtener animales disponibles
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/animales/disponibles`
- **Respuesta exitosa**: 200 OK - Array de animales disponibles

### 2.7 Buscar animales por nombre
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/animales/buscar?nombre={nombre}`
- **Ejemplo**: `http://localhost:8080/api/animales/buscar?nombre=Max`
- **Respuesta exitosa**: 200 OK - Array de animales

### 2.8 Crear animal
- **Método**: `POST`
- **URL**: `http://localhost:8080/api/animales`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (JSON):
```json
{
  "organizacion": {
    "idOrganizacion": 1
  },
  "nombre": "Max",
  "especie": "Perro",
  "edad": 3,
  "unidadEdad": "Años",
  "sexo": "Macho",
  "estado": "Disponible",
  "descripcion": "Perro muy amigable y juguetón"
}
```
- **Valores enum válidos**:
  - **especie**: `Perro`, `Gato`, `Otro`
  - **unidadEdad**: `Años`, `Meses`
  - **sexo**: `Macho`, `Hembra`, `No_especificado`
  - **estado**: `Disponible`, `Pendiente`, `Adoptado`, `No_disponible`
- **Respuesta exitosa**: 201 Created

### 2.9 Actualizar animal
- **Método**: `PUT`
- **URL**: `http://localhost:8080/api/animales/{id}`
- **Ejemplo**: `http://localhost:8080/api/animales/1`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (JSON): Mismo formato que crear
- **Respuesta exitosa**: 200 OK
- **Respuesta error**: 404 Not Found

### 2.10 Eliminar animal
- **Método**: `DELETE`
- **URL**: `http://localhost:8080/api/animales/{id}`
- **Ejemplo**: `http://localhost:8080/api/animales/1`
- **Respuesta exitosa**: 204 No Content

---

## 3. ORGANIZACIONES - `/api/organizaciones`

### 3.1 Obtener todas las organizaciones
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/organizaciones`
- **Respuesta exitosa**: 200 OK - Array de organizaciones

### 3.2 Obtener organización por ID
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/organizaciones/{id}`
- **Ejemplo**: `http://localhost:8080/api/organizaciones/1`
- **Respuesta exitosa**: 200 OK
- **Respuesta error**: 404 Not Found

### 3.3 Obtener organización por usuario
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/organizaciones/usuario/{idUsuario}`
- **Ejemplo**: `http://localhost:8080/api/organizaciones/usuario/1`
- **Respuesta exitosa**: 200 OK
- **Respuesta error**: 404 Not Found

### 3.4 Buscar organizaciones por nombre
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/organizaciones/buscar?nombre={nombre}`
- **Ejemplo**: `http://localhost:8080/api/organizaciones/buscar?nombre=Refugio`
- **Respuesta exitosa**: 200 OK - Array de organizaciones

### 3.5 Crear organización
- **Método**: `POST`
- **URL**: `http://localhost:8080/api/organizaciones`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (JSON):
```json
{
  "usuario": {
    "idUsuario": 1
  },
  "nombreOrganizacion": "Refugio de Animales San Salvador",
  "descripcion": "Organización dedicada al rescate y adopción de animales",
  "direccion": "San Salvador, El Salvador",
  "telefono": "2222-2222"
}
```
- **Respuesta exitosa**: 201 Created

### 3.6 Actualizar organización
- **Método**: `PUT`
- **URL**: `http://localhost:8080/api/organizaciones/{id}`
- **Ejemplo**: `http://localhost:8080/api/organizaciones/1`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (JSON): Mismo formato que crear
- **Respuesta exitosa**: 200 OK
- **Respuesta error**: 404 Not Found

### 3.7 Eliminar organización
- **Método**: `DELETE`
- **URL**: `http://localhost:8080/api/organizaciones/{id}`
- **Ejemplo**: `http://localhost:8080/api/organizaciones/1`
- **Respuesta exitosa**: 204 No Content

---

## 4. VETERINARIAS - `/api/veterinarias`

### 4.1 Obtener todas las veterinarias
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/veterinarias`
- **Respuesta exitosa**: 200 OK - Array de veterinarias

### 4.2 Obtener veterinaria por ID
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/veterinarias/{id}`
- **Ejemplo**: `http://localhost:8080/api/veterinarias/1`
- **Respuesta exitosa**: 200 OK
- **Respuesta error**: 404 Not Found

### 4.3 Obtener veterinaria por usuario
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/veterinarias/usuario/{idUsuario}`
- **Ejemplo**: `http://localhost:8080/api/veterinarias/usuario/1`
- **Respuesta exitosa**: 200 OK
- **Respuesta error**: 404 Not Found

### 4.4 Buscar veterinarias por nombre
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/veterinarias/buscar?nombre={nombre}`
- **Ejemplo**: `http://localhost:8080/api/veterinarias/buscar?nombre=Clinica`
- **Respuesta exitosa**: 200 OK - Array de veterinarias

### 4.5 Crear veterinaria
- **Método**: `POST`
- **URL**: `http://localhost:8080/api/veterinarias`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (JSON):
```json
{
  "usuario": {
    "idUsuario": 2
  },
  "nombreClinica": "Clínica Veterinaria San Salvador",
  "especialidad": "Medicina General y Cirugía",
  "direccion": "San Salvador, El Salvador",
  "telefono": "2333-3333"
}
```
- **Respuesta exitosa**: 201 Created

### 4.6 Actualizar veterinaria
- **Método**: `PUT`
- **URL**: `http://localhost:8080/api/veterinarias/{id}`
- **Ejemplo**: `http://localhost:8080/api/veterinarias/1`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (JSON): Mismo formato que crear
- **Respuesta exitosa**: 200 OK
- **Respuesta error**: 404 Not Found

### 4.7 Eliminar veterinaria
- **Método**: `DELETE`
- **URL**: `http://localhost:8080/api/veterinarias/{id}`
- **Ejemplo**: `http://localhost:8080/api/veterinarias/1`
- **Respuesta exitosa**: 204 No Content

---

## 5. ADOPCIONES - `/api/adopciones`

### 5.1 Obtener todas las adopciones
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/adopciones`
- **Respuesta exitosa**: 200 OK - Array de adopciones

### 5.2 Obtener adopción por ID
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/adopciones/{id}`
- **Ejemplo**: `http://localhost:8080/api/adopciones/1`
- **Respuesta exitosa**: 200 OK
- **Respuesta error**: 404 Not Found

### 5.3 Obtener adopciones por usuario
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/adopciones/usuario/{idUsuario}`
- **Ejemplo**: `http://localhost:8080/api/adopciones/usuario/1`
- **Respuesta exitosa**: 200 OK - Array de adopciones

### 5.4 Obtener adopciones por animal
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/adopciones/animal/{idAnimal}`
- **Ejemplo**: `http://localhost:8080/api/adopciones/animal/1`
- **Respuesta exitosa**: 200 OK - Array de adopciones

### 5.5 Obtener adopciones por estado
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/adopciones/estado/{estado}`
- **Ejemplo**: `http://localhost:8080/api/adopciones/estado/Pendiente`
- **Estados válidos**: `Pendiente`, `Aprobada`, `Rechazada`, `Cancelada`
- **Respuesta exitosa**: 200 OK - Array de adopciones

### 5.6 Crear adopción
- **Método**: `POST`
- **URL**: `http://localhost:8080/api/adopciones`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (JSON):
```json
{
  "usuario": {
    "idUsuario": 1
  },
  "animal": {
    "idAnimal": 1
  },
  "estado": "Pendiente",
  "comentarios": "Me gustaría adoptar este animalito"
}
```
- **Estados válidos**: `Pendiente`, `Aprobada`, `Rechazada`, `Cancelada`
- **Respuesta exitosa**: 201 Created

### 5.7 Actualizar adopción
- **Método**: `PUT`
- **URL**: `http://localhost:8080/api/adopciones/{id}`
- **Ejemplo**: `http://localhost:8080/api/adopciones/1`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (JSON):
```json
{
  "usuario": {
    "idUsuario": 1
  },
  "animal": {
    "idAnimal": 1
  },
  "estado": "Aprobada",
  "procesadoPor": {
    "idUsuario": 2
  },
  "comentarios": "Adopción aprobada"
}
```
- **Respuesta exitosa**: 200 OK
- **Respuesta error**: 404 Not Found

### 5.8 Eliminar adopción
- **Método**: `DELETE`
- **URL**: `http://localhost:8080/api/adopciones/{id}`
- **Ejemplo**: `http://localhost:8080/api/adopciones/1`
- **Respuesta exitosa**: 204 No Content

---
## 6. REPORTES - `/api/reportes` ✨ **MÓDULO ACTUALIZADO**

### 6.1 Obtener todos los reportes
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/reportes`
- **Respuesta exitosa**: 200 OK - Array de reportes

### 6.2 Obtener reporte por ID
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/reportes/{id}`
- **Ejemplo**: `http://localhost:8080/api/reportes/1`
- **Respuesta exitosa**: 200 OK
- **Respuesta error**: 404 Not Found

### 6.3 Obtener reportes por usuario
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/reportes/usuario/{idUsuario}`
- **Ejemplo**: `http://localhost:8080/api/reportes/usuario/1`
- **Respuesta exitosa**: 200 OK - Array de reportes

### 6.4 Obtener reportes por veterinaria
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/reportes/veterinaria/{idVeterinaria}`
- **Ejemplo**: `http://localhost:8080/api/reportes/veterinaria/1`
- **Respuesta exitosa**: 200 OK - Array de reportes

### 6.5 Obtener reportes por organización ✨ **NUEVO**
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/reportes/organizacion/{idOrganizacion}`
- **Ejemplo**: `http://localhost:8080/api/reportes/organizacion/1`
- **Descripción**: Obtiene todos los reportes asignados a una organización específica
- **Respuesta exitosa**: 200 OK - Array de reportes

### 6.6 Obtener reportes por estado
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/reportes/estado/{estado}`
- **Ejemplo**: `http://localhost:8080/api/reportes/estado/Pendiente`
- **Estados válidos**: `Pendiente`, `En_proceso`, `Cerrado`
- **Respuesta exitosa**: 200 OK - Array de reportes

### 6.7 Crear reporte ✨ **ACTUALIZADO**
- **Método**: `POST`
- **URL**: `http://localhost:8080/api/reportes`
- **Headers**:
    - `Content-Type: application/json`
- **Body** (JSON) - Ejemplo completo con todos los campos:
```json
{
  "usuario": {
    "idUsuario": 1
  },
  "veterinaria": {
    "idVeterinaria": 1
  },
  "organizacion": {
    "idOrganizacion": 1
  },
  "titulo": "Perro herido necesita atención urgente",
  "descripcion": "Se encontró un perro con herida en la pata derecha cerca del parque central",
  "ubicacion": "Parque Central, San Salvador",
  "fotoUrl": "https://ejemplo.com/fotos/perro-herido-123.jpg",
  "estado": "Pendiente"
}
```

- **Body** (JSON) - Ejemplo solo con organización y foto:
```json
{
  "usuario": {
    "idUsuario": 1
  },
  "organizacion": {
    "idOrganizacion": 1
  },
  "titulo": "Gato abandonado en calle",
  "descripcion": "Gato encontrado sin collar, aparenta estar abandonado",
  "ubicacion": "Colonia Escalón, San Salvador",
  "fotoUrl": "https://i.imgur.com/ejemplo-gato.jpg",
  "estado": "Pendiente"
}
```

- **Body** (JSON) - Ejemplo básico (sin foto ni asignaciones):
```json
{
  "usuario": {
    "idUsuario": 1
  },
  "titulo": "Animal necesita ayuda",
  "descripcion": "Se encontró un animal en situación de calle que necesita atención",
  "ubicacion": "Centro de San Salvador",
  "estado": "Pendiente"
}
```

- **Campos obligatorios**:
    - `usuario`: Usuario que reporta
    - `titulo`: Título del reporte (5-150 caracteres)
    - `descripcion`: Descripción detallada (10-5000 caracteres)

- **Campos opcionales**:
    - `veterinaria`: Asignar a una veterinaria
    - `organizacion`: Asignar a una organización de rescate ✨ **NUEVO**
    - `ubicacion`: Ubicación donde se encontró el animal
    - `fotoUrl`: URL de la foto del animal reportado (máximo 500 caracteres) ✨ **NUEVO**
    - `estado`: Estado del reporte (por defecto: "Pendiente")

- **Estados válidos**: `Pendiente`, `En_proceso`, `Cerrado`
- **Respuesta exitosa**: 201 Created

### 6.8 Actualizar reporte ✨ **ACTUALIZADO**
- **Método**: `PUT`
- **URL**: `http://localhost:8080/api/reportes/{id}`
- **Ejemplo**: `http://localhost:8080/api/reportes/1`
- **Headers**:
    - `Content-Type: application/json`
- **Body** (JSON):
```json
{
  "usuario": {
    "idUsuario": 1
  },
  "veterinaria": {
    "idVeterinaria": 1
  },
  "organizacion": {
    "idOrganizacion": 1
  },
  "titulo": "Perro herido - En tratamiento",
  "descripcion": "Se encontró un perro con herida en la pata derecha, ya está siendo atendido",
  "ubicacion": "Parque Central, San Salvador",
  "fotoUrl": "https://ejemplo.com/fotos/perro-actualizado.jpg",
  "estado": "En_proceso"
}
```
- **Nota**: Ahora puedes actualizar la asignación a organización y la foto
- **Respuesta exitosa**: 200 OK
- **Respuesta error**: 404 Not Found

### 6.9 Eliminar reporte
- **Método**: `DELETE`
- **URL**: `http://localhost:8080/api/reportes/{id}`
- **Ejemplo**: `http://localhost:8080/api/reportes/1`
- **Respuesta exitosa**: 204 No Content

---

### 📋 Flujo Típico del Módulo de Reportes

1. **Ciudadano reporta un animal**
    - `POST /api/reportes`
    - Incluye foto (fotoUrl) y ubicación
    - Estado inicial: "Pendiente"

2. **Se asigna a una organización de rescate**
    - `PUT /api/reportes/{id}`
    - Agregar campo `organizacion`

3. **Organización revisa sus reportes asignados**
    - `GET /api/reportes/organizacion/{idOrganizacion}`
    - Ve todos los reportes que le han sido asignados

4. **Se asigna a veterinaria (si necesita atención médica)**
    - `PUT /api/reportes/{id}`
    - Agregar campo `veterinaria`
    - Cambiar estado a "En_proceso"

5. **Se cierra el caso**
    - `PUT /api/reportes/{id}`
    - Cambiar estado a "Cerrado"

---

### ✨ RESUMEN DE CAMBIOS EN EL MÓDULO

| Característica | Antes | Ahora |
|----------------|-------|-------|
| Asignación a organizaciones | ❌ No disponible | ✅ Campo `organizacion` |
| Foto del animal | ❌ No disponible | ✅ Campo `fotoUrl` |
| Endpoint para organizaciones | ❌ No disponible | ✅ `GET /organizacion/{id}` |
| Total de endpoints | 8 | 9 |

---



## 7. REGISTROS MÉDICOS - `/api/registros-medicos`

### 7.1 Obtener todos los registros médicos
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/registros-medicos`
- **Respuesta exitosa**: 200 OK - Array de registros médicos

### 7.2 Obtener registro médico por ID
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/registros-medicos/{id}`
- **Ejemplo**: `http://localhost:8080/api/registros-medicos/1`
- **Respuesta exitosa**: 200 OK
- **Respuesta error**: 404 Not Found

### 7.3 Obtener registros médicos por animal
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/registros-medicos/animal/{idAnimal}`
- **Ejemplo**: `http://localhost:8080/api/registros-medicos/animal/1`
- **Respuesta exitosa**: 200 OK - Array de registros médicos

### 7.4 Obtener registros médicos por veterinaria
- **Método**: `GET`
- **URL**: `http://localhost:8080/api/registros-medicos/veterinaria/{idVeterinaria}`
- **Ejemplo**: `http://localhost:8080/api/registros-medicos/veterinaria/1`
- **Respuesta exitosa**: 200 OK - Array de registros médicos

### 7.5 Crear registro médico
- **Método**: `POST`
- **URL**: `http://localhost:8080/api/registros-medicos`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (JSON):
```json
{
  "animal": {
    "idAnimal": 1
  },
  "veterinaria": {
    "idVeterinaria": 1
  },
  "tipoAtencion": "Consulta",
  "diagnostico": "El animal presenta signos de desnutrición leve",
  "tratamiento": "Alimentación balanceada y suplementos vitamínicos",
  "notas": "Control en 15 días"
}
```
- **Tipos de atención válidos**: `Consulta`, `Tratamiento`, `Alta`, `Vacunacion`
- **Respuesta exitosa**: 201 Created

### 7.6 Actualizar registro médico
- **Método**: `PUT`
- **URL**: `http://localhost:8080/api/registros-medicos/{id}`
- **Ejemplo**: `http://localhost:8080/api/registros-medicos/1`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (JSON): Mismo formato que crear
- **Respuesta exitosa**: 200 OK
- **Respuesta error**: 404 Not Found

### 7.7 Eliminar registro médico
- **Método**: `DELETE`
- **URL**: `http://localhost:8080/api/registros-medicos/{id}`
- **Ejemplo**: `http://localhost:8080/api/registros-medicos/1`
- **Respuesta exitosa**: 204 No Content

---

## Códigos de Respuesta HTTP

- **200 OK**: Solicitud exitosa (GET, PUT)
- **201 Created**: Recurso creado exitosamente (POST)
- **204 No Content**: Recurso eliminado exitosamente (DELETE)
- **400 Bad Request**: Error en los datos enviados
- **404 Not Found**: Recurso no encontrado

---

## Notas Importantes para Postman

1. **Content-Type**: Para todos los POST y PUT, asegúrate de agregar el header `Content-Type: application/json`

2. **CORS**: La API tiene CORS habilitado para todos los orígenes (`@CrossOrigin(origins = "*")`)

3. **Validaciones**: La API valida los datos automáticamente según las anotaciones del modelo

4. **Relaciones**: Al crear/actualizar registros relacionados, solo necesitas enviar el ID del objeto relacionado:
   ```json
   {
     "usuario": {
       "idUsuario": 1
     }
   }
   ```

5. **Fechas**: Las fechas se generan automáticamente al crear registros (no necesitas enviarlas)

6. **IDs**: Los IDs se generan automáticamente (no incluyas `id` al crear nuevos registros)

---

## Ejemplo de Colección en Postman

Para crear una colección en Postman:

1. Abre Postman
2. Click en "Collections" → "Create Collection"
3. Nombra la colección "ePaws API"
4. Crea carpetas para cada controlador (Usuarios, Animales, etc.)
5. Agrega las peticiones según esta documentación
6. Guarda las variables de entorno:
   - `base_url`: `http://localhost:8080/api`

---

## Orden Recomendado para Pruebas

1. Crear un Usuario (POST /api/usuarios)
2. Crear una Organización (POST /api/organizaciones)
3. Crear un Animal (POST /api/animales)
4. Crear una Veterinaria (POST /api/veterinarias)
5. Crear una Adopción (POST /api/adopciones)
6. Crear un Reporte (POST /api/reportes)
7. Crear un Registro Médico (POST /api/registros-medicos)

---

**Fecha de creación**: 2025-11-03
**Versión API**: 1.0

