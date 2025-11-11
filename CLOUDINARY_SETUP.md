# Configuración de Cloudinary para ePaws

## Pasos para configurar Cloudinary

### 1. Crear cuenta en Cloudinary (si no tienes una)
1. Ve a [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Regístrate con tu correo electrónico
3. Verifica tu email

### 2. Obtener credenciales
1. Inicia sesión en [https://cloudinary.com/console](https://cloudinary.com/console)
2. En el Dashboard verás:
   - **Cloud Name**: Tu nombre único de cloud
   - **API Key**: Tu clave API
   - **API Secret**: Tu secreto API (haz clic en "Reveal" para verlo)

### 3. Crear Upload Preset
1. Ve a **Settings** > **Upload** en el menú lateral
2. Scroll hasta **Upload presets**
3. Haz clic en **Add upload preset**
4. Configura:
   - **Preset name**: `epaws_preset` (o el nombre que prefieras)
   - **Signing Mode**: **Unsigned** (importante para subir desde el frontend)
   - **Folder**: `epaws` (opcional, organiza tus imágenes)
   - **Access Mode**: **Public**
5. Haz clic en **Save**

### 4. Configurar variables de entorno
1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita `.env` y reemplaza con tus credenciales:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=dnux3wmic
   VITE_CLOUDINARY_UPLOAD_PRESET=epaws_preset
   VITE_CLOUDINARY_API_KEY=798437698984247
   VITE_CLOUDINARY_API_SECRET=I5xgfkI5RGnSo8I_e82mjtwOy4E
   ```

### 5. Reiniciar el servidor de desarrollo
```bash
npm run dev
```

## Estructura de carpetas en Cloudinary

Las imágenes se organizarán así:
```
epaws/
  ├── animales/     # Fotos de animales (máximo 4 por animal)
  └── reportes/     # Fotos de reportes (máximo 1 por reporte)
```

## Características implementadas

### Para Animales
- ✅ Subida de hasta **4 imágenes** por animal
- ✅ Carrusel de imágenes en todas las vistas
- ✅ Edición de animales con gestión de imágenes
- ✅ Vista previa antes de subir
- ✅ Validación de formato (JPG, PNG, WEBP, GIF)
- ✅ Validación de tamaño (máximo 5MB)

### Para Reportes
- ✅ Subida de **1 imagen** por reporte
- ✅ Vista previa de la imagen
- ✅ Visualización en tabla de reportes
- ✅ Modal para ver imagen completa

### Seguridad
- ✅ Validación de tipo de archivo
- ✅ Validación de tamaño de archivo
- ✅ URLs seguras (HTTPS)
- ✅ Unsigned uploads para frontend

## Notas importantes

1. **Límites gratuitos de Cloudinary**:
   - 25 créditos/mes
   - 25GB de almacenamiento
   - 25GB de ancho de banda

2. **Recomendaciones**:
   - Optimiza las imágenes antes de subirlas
   - No subas imágenes innecesariamente grandes
   - Borra imágenes antiguas que no uses

3. **Troubleshooting**:
   - Si las imágenes no se suben, verifica que el Upload Preset sea **Unsigned**
   - Asegúrate de tener el archivo `.env` en la raíz del proyecto
   - Revisa la consola del navegador para errores específicos

## Soporte

Si tienes problemas:
1. Verifica que todas las variables de entorno estén correctamente configuradas
2. Asegúrate de que el Upload Preset esté en modo **Unsigned**
3. Revisa la consola del navegador y del servidor para mensajes de error
4. Consulta la [documentación oficial de Cloudinary](https://cloudinary.com/documentation)
