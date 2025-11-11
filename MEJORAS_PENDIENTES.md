# 🔧 Mejoras Pendientes - ePaws

## ✅ Completado

1. **Validación de máximo 4 imágenes en editar animales** - Se agregó validación que cuenta imágenes existentes + nuevas
2. **Cloudinary integrado en crear animales** - Funcionando correctamente
3. **Cloudinary integrado en crear reportes** - Funcionando correctamente

---

## ⚠️ Pendientes

### 1. Imágenes aparecen aunque se eliminaron de Cloudinary

**Problema:** Las URLs de imágenes están guardadas en la tabla `imagenes_animales` de la base de datos. Aunque elimines la imagen física de Cloudinary, la URL sigue apareciendo porque está en la BD.

**Solución A - Eliminar desde la interfaz (Recomendado):**
- Agregar botón "X" en cada imagen existente del carrusel en modo edición
- Al hacer clic, eliminar el registro de la tabla `imagenes_animales`
- Actualizar la vista

**Solución B - Limpiar manualmente la BD:**
```sql
-- Ver imágenes de un animal específico
SELECT * FROM imagenes_animales WHERE id_animal = 6;

-- Eliminar una imagen específica
DELETE FROM imagenes_animales WHERE id_imagen_animal = 4;

-- Eliminar todas las imágenes de un animal
DELETE FROM imagenes_animales WHERE id_animal = 6;
```

### 2. Editar Reportes con Cloudinary

**Problema:** El modal de editar reportes en `MisReportes.vue` usa un input de texto simple para `fotoUrl`, no el componente `ImageUploader`.

**Solución:** Actualizar `MisReportes.vue` para que use `ImageUploader` igual que `CrearReporte.vue`:

```vue
<!-- En el modal de editar, reemplazar: -->
<input v-model="editForm.fotoUrl" type="text" class="form-control" />

<!-- Por: -->
<ImageUploader 
  ref="imageUploaderEdit"
  :multiple="false"
  :max-files="1"
  :model-value="editForm.fotoUrl"
  placeholder="Arrastra 1 imagen aquí"
  @files-selected="archivosEditSeleccionados"
/>
```

Y en el script agregar:
```javascript
const archivosEdit = ref([]);
const imageUploaderEdit = ref(null);

const archivosEditSeleccionados = (archivos) => {
  archivosEdit.value = archivos;
};

// En guardarEdicion(), antes de actualizar:
if (archivosEdit.value.length > 0) {
  try {
    const url = await cloudinaryService.subirImagen(
      archivosEdit.value[0],
      'epaws/reportes'
    );
    editForm.value.fotoUrl = url;
  } catch (error) {
    alertaError('Error al subir la imagen: ' + error.message);
    return;
  }
}
```

### 3. Eliminar imágenes existentes de animales

**Agregar funcionalidad para eliminar imágenes existentes:**

En `Animales.vue`, agregar:

```javascript
// En el <script>
const imagenesAEliminar = ref([]);

const eliminarImagenExistente = async (urlImagen, idAnimal) => {
  try {
    // Buscar la imagen en la BD por URL
    const imagenesResponse = await imagenAnimalService.getByAnimal(idAnimal);
    const imagen = imagenesResponse.data.find(img => img.url === urlImagen);
    
    if (imagen) {
      await imagenAnimalService.delete(imagen.idImagenAnimal);
      
      // Remover de la lista de existentes
      imagenesExistentes.value = imagenesExistentes.value.filter(url => url !== urlImagen);
      
      toast('Imagen eliminada correctamente', 'success');
    }
  } catch (error) {
    alertaError('Error al eliminar la imagen');
  }
};
```

---

## 🎯 Prioridades

1. **Alta:** Solución B (limpiar BD manualmente) - Rápido para liberar espacio
2. **Media:** Implementar editar reportes con Cloudinary
3. **Baja:** Agregar botones para eliminar imágenes existentes en la interfaz

---

## 📝 Notas

- Las imágenes en Cloudinary consumen espacio de tu cuenta (gratuita tiene límite)
- Considera implementar un sistema para eliminar imágenes huérfanas de Cloudinary
- La tabla `imagenes_animales` puede crecer mucho si no se limpian registros eliminados
