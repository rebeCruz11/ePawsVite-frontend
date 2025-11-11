# Implementación de Cloudinary - Resumen Completo

## 📋 Cambios Realizados

### 1. ✅ Configuración de Cloudinary

**Archivos creados:**
- `.env` - Variables de entorno con credenciales de Cloudinary
- `.env.example` - Template de variables de entorno
- `CLOUDINARY_SETUP.md` - Guía completa de configuración

**Credenciales configuradas:**
```
Cloud Name: dnux3wmic
API Key: 798437698984247
Upload Preset: epaws_preset
```

### 2. ✅ Servicios Nuevos

#### `src/services/cloudinaryService.js`
Funciones implementadas:
- `subirImagen(file, folder)` - Sube una imagen individual
- `subirMultiplesImagenes(files, folder, maxFiles)` - Sube múltiples imágenes
- `eliminarImagen(publicId)` - Placeholder para eliminación (requiere backend)

**Validaciones:**
- Tipos permitidos: JPG, PNG, WEBP, GIF
- Tamaño máximo: 5MB por imagen
- Validación de cantidad (1 para reportes, 4 para animales)

### 3. ✅ Componentes Nuevos

#### `src/components/common/ImageUploader.vue`
Componente reutilizable para subir imágenes:
- ✨ Drag & drop de imágenes
- 📷 Vista previa instantánea
- 🔢 Soporte para múltiples archivos
- ✅ Validación de formato y tamaño
- 🎨 Diseño responsivo y elegante
- ❌ Botón para eliminar imágenes
- ➕ Botón "Agregar más" cuando hay espacio

Props:
- `modelValue` - URLs existentes
- `multiple` - Permitir múltiples archivos
- `maxFiles` - Cantidad máxima (default: 4)
- `placeholder` - Texto personalizado
- `accept` - Tipos de archivo permitidos

#### `src/components/common/ImageCarousel.vue`
Carrusel de imágenes con Bootstrap:
- 🎠 Navegación entre imágenes
- 🔢 Indicadores de posición
- 📊 Contador de imágenes
- 🎯 Fallback con ícono si no hay imágenes
- 📱 Responsivo y táctil

Props:
- `imagenes` - Array de URLs
- `alt` - Texto alternativo
- `icono` - Ícono a mostrar si no hay imágenes
- `id` - ID único para múltiples carruseles

### 4. ✅ Vistas Actualizadas

#### Vista Pública - `src/views/Home.vue`
**NUEVO**: Vista pública con animales disponibles
- 🌐 Accesible sin login
- 🔍 Filtros por especie y sexo
- 🔎 Búsqueda por nombre
- 🎠 Carrusel de imágenes para cada animal
- 📄 Paginación (6 animales por página)
- 🔐 Redirige a login al solicitar adopción

#### Organización - `src/views/organizacion/Animales.vue`
**COMPLETAMENTE REDISEÑADO**:
- 📸 Subida de hasta 4 imágenes a Cloudinary
- 🎠 Carrusel en cards de animales
- ✏️ Edición con manejo de imágenes existentes y nuevas
- 📤 Las imágenes se suben automáticamente al guardar
- 💾 Se guardan en tabla `imagen_animal` del backend
- 🚫 Validación: no editar animales con adopción aprobada

Flujo de guardado:
1. Usuario selecciona imágenes (hasta 4)
2. Al hacer clic en "Guardar", se suben a Cloudinary
3. Se obtienen las URLs de Cloudinary
4. Se crea/actualiza el animal
5. Se guardan las URLs en `imagen_animal` table

#### Cliente - `src/views/cliente/Animales.vue`
- 🎠 Carrusel reemplaza imagen única
- 🖼️ Muestra todas las imágenes del animal
- ♻️ Carga automática de imágenes desde backend

#### Cliente - `src/views/cliente/MisAdopciones.vue`
- 🎠 Carrusel en lugar de imagen única
- 🖼️ Visualización de todas las fotos del animal adoptado

#### Cliente - `src/views/cliente/CrearReporte.vue`
**COMPLETAMENTE REDISEÑADO**:
- 📸 Subida de 1 imagen a Cloudinary
- 📤 Diseño en dos columnas (imagen | formulario)
- ✅ Validaciones mejoradas con contadores de caracteres
- 🎯 Límites: título 150 chars, descripción 5000 chars
- 💾 Guarda `fotoUrl` en lugar de `imagenBase64`

#### Cliente - `src/views/cliente/MisReportes.vue`
- 🖼️ Miniatura de foto en tabla (60x60px)
- 👆 Click en miniatura para ver completa
- ✏️ Columna "Acciones" separada

### 5. ✅ Servicios Actualizados

#### `src/services/animalService.js`
**MODIFICADO** para cargar imágenes automáticamente:
- Todos los métodos GET ahora cargan imágenes
- Usa `imagenAnimalService.getByAnimal()` en paralelo
- Los objetos animal ahora incluyen `animal.imagenes[]`

Ejemplo de estructura retornada:
```javascript
{
  idAnimal: 1,
  nombre: "Max",
  especie: "Perro",
  // ... otros campos
  imagenes: [
    { idImagenAnimal: 1, url: "https://...", nombreArchivo: "..." },
    { idImagenAnimal: 2, url: "https://...", nombreArchivo: "..." }
  ]
}
```

#### `src/services/adopcionService.js`
**MODIFICADO** para cargar imágenes de animales:
- Carga imágenes para `adopcion.animal.imagenes[]`
- Funciona con todos los endpoints

### 6. ✅ Helpers Actualizados

#### `src/utils/helpers.js`
Nueva función:
```javascript
obtenerFotoAnimal(animal) {
  // Busca foto en varias estructuras posibles:
  // 1. animal.fotoUrl
  // 2. animal.imagenes[0].url
  // 3. animal.imagenesAnimales[0].url
  // 4. animal.imagenAnimal.url
  return url || null;
}
```

Esta función hace el sistema compatible con múltiples estructuras de datos del backend.

## 📊 Flujo de Datos

### Crear Animal con Imágenes

```
1. Usuario selecciona imágenes (ImageUploader)
   ↓
2. Vista previa local con FileReader
   ↓
3. Usuario completa formulario y hace clic en "Guardar"
   ↓
4. cloudinaryService.subirMultiplesImagenes()
   ↓
5. Cloudinary recibe archivos y retorna URLs
   ↓
6. animalService.create(animalData)
   ↓
7. Backend crea animal, retorna ID
   ↓
8. Para cada URL: imagenAnimalService.create({
     animal: { idAnimal },
     url,
     nombreArchivo,
     mime
   })
   ↓
9. Backend guarda en tabla imagen_animal
   ↓
10. Vista recarga datos con imágenes
```

### Mostrar Animal con Imágenes

```
1. Vista llama animalService.getDisponibles()
   ↓
2. Servicio llama API: GET /api/animales/disponibles
   ↓
3. Backend retorna animales (sin imágenes)
   ↓
4. Servicio carga imágenes en paralelo:
     Para cada animal:
       imagenAnimalService.getByAnimal(idAnimal)
   ↓
5. Agrega animal.imagenes = [URLs...]
   ↓
6. Vista recibe animales con imágenes
   ↓
7. ImageCarousel muestra las imágenes
```

### Crear Reporte con Foto

```
1. Usuario selecciona 1 imagen
   ↓
2. Vista previa local
   ↓
3. Usuario completa formulario y envía
   ↓
4. cloudinaryService.subirImagen(archivo, 'epaws/reportes')
   ↓
5. Cloudinary retorna URL
   ↓
6. reporteService.create({
     ...datos,
     fotoUrl: url
   })
   ↓
7. Backend guarda con fotoUrl
```

## 🎯 Validaciones Implementadas

### ImageUploader
- ✅ Tipo de archivo (JPG, PNG, WEBP, GIF)
- ✅ Tamaño máximo: 5MB
- ✅ Cantidad máxima configurable
- ✅ Mensajes de error descriptivos

### CloudinaryService
- ✅ Validación antes de subir
- ✅ Manejo de errores de red
- ✅ Timeout y retry (built-in Cloudinary)

### Formularios
- ✅ Animales: nombre ≥ 2 chars, descripción ≥ 10 chars
- ✅ Reportes: título 5-150 chars, descripción 10-5000 chars
- ✅ Contadores de caracteres en tiempo real

## 📁 Estructura de Archivos Nuevos/Modificados

```
ePaws-frontend/
├── .env                                    [NUEVO] Credenciales
├── .env.example                            [NUEVO] Template
├── CLOUDINARY_SETUP.md                     [NUEVO] Guía setup
├── src/
│   ├── components/common/
│   │   ├── ImageUploader.vue              [NUEVO] Componente drag&drop
│   │   └── ImageCarousel.vue              [NUEVO] Carrusel Bootstrap
│   ├── services/
│   │   ├── cloudinaryService.js           [NUEVO] Subida imágenes
│   │   ├── animalService.js               [MODIFICADO] Auto-carga imágenes
│   │   └── adopcionService.js             [MODIFICADO] Auto-carga imágenes
│   ├── utils/
│   │   └── helpers.js                     [MODIFICADO] +obtenerFotoAnimal()
│   └── views/
│       ├── Home.vue                       [MODIFICADO] Vista pública
│       ├── organizacion/
│       │   └── Animales.vue               [REDISEÑADO] Con ImageUploader
│       └── cliente/
│           ├── Animales.vue               [MODIFICADO] Con ImageCarousel
│           ├── MisAdopciones.vue          [MODIFICADO] Con ImageCarousel
│           ├── CrearReporte.vue           [REDISEÑADO] Con ImageUploader
│           └── MisReportes.vue            [MODIFICADO] Muestra miniaturas
```

## 🚀 Características Destacadas

1. **Vista Pública Interactiva**
   - Los visitantes pueden ver animales SIN login
   - Filtros y búsqueda funcionan sin autenticación
   - Al solicitar adopción, redirige a login/registro

2. **Carruseles Dinámicos**
   - Automáticos con transiciones suaves
   - Indicadores visuales
   - Controles de navegación
   - Contador de imágenes
   - Responsive y táctil

3. **Experiencia de Usuario Mejorada**
   - Drag & drop intuitivo
   - Vista previa instantánea
   - Feedback visual durante subida
   - Mensajes de error claros
   - Loading states

4. **Optimización**
   - Carga paralela de imágenes
   - Lazy loading de componentes
   - Caché de datos cuando posible

5. **Mantenibilidad**
   - Componentes reutilizables
   - Servicios separados por responsabilidad
   - Código documentado
   - Configuración por variables de entorno

## ⚙️ Configuración Requerida en Cloudinary

### Paso 1: Upload Preset
1. Settings > Upload
2. Add upload preset
3. Nombre: `epaws_preset`
4. **Signing Mode: Unsigned** ⚠️ IMPORTANTE
5. Folder: `epaws` (opcional)
6. Access Mode: Public

### Paso 2: Opcional - Transformaciones
Puedes configurar transformaciones automáticas:
- Resize a ancho máximo 1920px
- Calidad 80%
- Formato auto (WebP si el navegador lo soporta)

## 🔒 Seguridad

- ✅ Upload Preset en modo **Unsigned** (seguro para frontend)
- ✅ Validación de tipo de archivo en cliente
- ✅ Validación de tamaño en cliente
- ✅ URLs HTTPS
- ⚠️ La validación del servidor también es recomendable

## 📝 Notas para el Backend

El backend debe estar preparado para:
1. Recibir campo `fotoUrl` en reportes (en lugar de `imagenBase64`)
2. La tabla `imagen_animal` ya debe existir con:
   - `id_imagen_animal` (PK)
   - `id_animal` (FK)
   - `url` VARCHAR(500)
   - `nombre_archivo` VARCHAR(255)
   - `mime` VARCHAR(50)
   - `subido_en` TIMESTAMP

## ✅ Testing Checklist

- [ ] Subir 1 imagen en reporte
- [ ] Subir 4 imágenes en animal
- [ ] Editar animal manteniendo imágenes existentes
- [ ] Editar animal agregando nuevas imágenes
- [ ] Ver carrusel en Home (sin login)
- [ ] Ver carrusel en cliente/Animales
- [ ] Ver carrusel en MisAdopciones
- [ ] Filtros funcionan en Home
- [ ] Solicitar adopción redirige a login
- [ ] Validación de tamaño archivo (>5MB)
- [ ] Validación de tipo archivo (.pdf, .doc)
- [ ] Drag & drop funciona
- [ ] Click para seleccionar funciona
- [ ] Vista previa se muestra correctamente

## 🎉 Resultado Final

El sistema ahora tiene:
- ✅ Vista pública atractiva con animales
- ✅ Carruseles de imágenes en todas las vistas
- ✅ Subida de imágenes a Cloudinary
- ✅ Máximo 4 imágenes por animal
- ✅ Máximo 1 imagen por reporte
- ✅ Validaciones completas
- ✅ Experiencia de usuario mejorada
- ✅ Código mantenible y escalable

¡Todo listo para usar! 🚀
