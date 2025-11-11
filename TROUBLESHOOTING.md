## 🐛 GUÍA DE TROUBLESHOOTING - Error al Guardar Animal

### Error Común: "No se pudo guardar el animal"

Este error puede ocurrir por varias razones. Sigue estos pasos:

---

## ✅ PASO 1: Verificar la Consola del Navegador

1. Abre las **DevTools** (F12)
2. Ve a la pestaña **Console**
3. Intenta crear un animal
4. Busca mensajes en rojo que empiecen con:
   - `Error al subir imágenes:`
   - `Error:` 
   - `POST http://localhost:8080/api/animales`

**Copia el mensaje de error completo**

---

## ✅ PASO 2: Verificar el Backend

### Opción A: Backend NO está corriendo
**Error típico**: `Network Error` o `ERR_CONNECTION_REFUSED`

**Solución**:
```bash
# Inicia tu backend Spring Boot
cd ruta/a/tu/backend
./mvnw spring-boot:run
# O en Windows:
mvnw.cmd spring-boot:run
```

### Opción B: Backend en puerto diferente
**Error típico**: `404 Not Found`

**Verifica** en `.env`:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Si tu backend está en otro puerto (ej: 8081), cámbialo:
```env
VITE_API_BASE_URL=http://localhost:8081/api
```

**Después de cambiar `.env`**:
- Detén el servidor frontend (Ctrl+C)
- Reinicia: `npm run dev`

---

## ✅ PASO 3: Probar SIN Imágenes Primero

Para verificar si el problema es Cloudinary o el backend:

1. Crea un animal **SIN seleccionar imágenes**
2. Solo completa el formulario:
   - Nombre
   - Especie
   - Sexo
   - Edad
   - Descripción

**Si funciona**: El problema es Cloudinary
**Si NO funciona**: El problema es el backend

---

## ✅ PASO 4: Errores Específicos de Cloudinary

### Error: "Upload preset not found"
```
Error al subir las imágenes: Upload preset not found
```

**Causa**: No creaste el Upload Preset en Cloudinary

**Solución**: 
1. Ve a https://cloudinary.com/console
2. Settings → Upload → Upload presets
3. Crea `epaws_preset` en modo **Unsigned**

### Error: "Invalid upload preset"
```
Error al subir las imágenes: Invalid upload preset
```

**Causa**: El preset NO está en modo "Unsigned"

**Solución**:
1. Edita `epaws_preset` en Cloudinary
2. Cambia **Signing Mode** a **Unsigned**
3. Guarda

### Error: "File too large"
```
Error al subir las imágenes: File size too large
```

**Causa**: La imagen supera 5MB

**Solución**: Comprime la imagen antes de subirla

---

## ✅ PASO 5: Errores del Backend

### Error 400: Bad Request
```json
{
  "error": "Validation failed",
  "message": "..."
}
```

**Causa**: Los datos no cumplen las validaciones del backend

**Campos requeridos en el backend**:
- `nombre` (String, no vacío)
- `especie` (Enum: Perro, Gato, Otro)
- `sexo` (Enum: Macho, Hembra, No_especificado)
- `edad` (Integer, mayor a 0)
- `unidadEdad` (Enum: Años, Meses)
- `estado` (Enum: Disponible, Pendiente, Adoptado, No_disponible)
- `descripcion` (String, no vacío)
- `organizacion.idOrganizacion` (Integer)

### Error 404: Not Found
```
POST http://localhost:8080/api/animales 404
```

**Causa**: La ruta del backend no existe

**Verifica**:
1. Backend está corriendo
2. El controlador `AnimalController` existe
3. La ruta es `/api/animales` (no `/animales`)

### Error 500: Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

**Causa**: Error en el backend (base de datos, lógica, etc.)

**Revisa los logs del backend** en la consola donde corriste Spring Boot

---

## ✅ PASO 6: Verificar la Base de Datos

### Tabla `imagen_animal` debe existir

```sql
-- Verifica que la tabla exista
SHOW TABLES LIKE 'imagen_animal';

-- Si no existe, créala:
CREATE TABLE imagen_animal (
  id_imagen_animal INT PRIMARY KEY AUTO_INCREMENT,
  id_animal INT NOT NULL,
  url VARCHAR(500) NOT NULL,
  nombre_archivo VARCHAR(255),
  mime VARCHAR(50),
  subido_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_animal) REFERENCES animales(id_animal) ON DELETE CASCADE
);
```

### Verificar que la organización existe

```sql
-- Revisa tu ID de organización
SELECT * FROM organizaciones WHERE id_usuario = TU_ID_USUARIO;
```

---

## ✅ PASO 7: Modo Debug - Ver Logs Completos

He agregado logs detallados en el código. Abre la consola y verás:

```
Iniciando guardado de animal...
Archivos nuevos: 2
Subiendo imágenes a Cloudinary...
Imágenes subidas exitosamente: ["https://...", "https://..."]
Datos a enviar: {...}
Creando nuevo animal...
Animal creado con ID: 123
Guardando 2 imágenes en base de datos...
```

**Identifica dónde se detiene el flujo** y comparte ese log.

---

## 🚑 SOLUCIÓN RÁPIDA: Crear Animal Sin Cloudinary

Si necesitas que funcione **YA**, puedo crear una versión que:
1. Primero guarda el animal SIN imágenes
2. Después subes las imágenes manualmente

¿Quieres esa versión temporal?

---

## 📝 Checklist de Verificación

- [ ] Backend está corriendo en puerto 8080
- [ ] `.env` tiene `VITE_API_BASE_URL=http://localhost:8080/api`
- [ ] Upload Preset `epaws_preset` existe en Cloudinary
- [ ] Upload Preset está en modo **Unsigned**
- [ ] Tabla `imagen_animal` existe en la base de datos
- [ ] Mi usuario tiene una organización asignada
- [ ] Abrí la consola del navegador (F12)
- [ ] Leí los mensajes de error completos

---

## 🆘 Cómo Reportar el Error

Si sigues teniendo problemas, comparte:

1. **Mensaje de error de la consola** (F12 → Console)
2. **Logs del backend** (consola de Spring Boot)
3. **¿Funciona SIN imágenes?** (Sí/No)
4. **¿El Upload Preset está creado?** (Sí/No)
5. **¿Qué puerto usa tu backend?** (8080 u otro)

Con esa información puedo ayudarte mejor. 🐾
