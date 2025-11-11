<template>
  <div class="image-uploader">
    <div class="upload-area" :class="{ 'drag-over': isDragOver }" @click="abrirSelector" @drop.prevent="soltar" @dragover.prevent="isDragOver = true" @dragleave.prevent="isDragOver = false">
      <input ref="fileInput" type="file" :accept="accept" :multiple="multiple" @change="seleccionarArchivos" hidden />
      
      <div v-if="previsualizaciones.length === 0" class="upload-placeholder">
        <i class="bi bi-cloud-upload" style="font-size: 3rem; color: #6c757d;"></i>
        <p class="mt-3 mb-1">{{ placeholder }}</p>
        <small class="text-muted">{{ multiple ? `Máximo ${maxFiles} imágenes` : 'Solo 1 imagen' }} • JPG, PNG, WEBP (máx. 5MB)</small>
      </div>

      <div v-else class="preview-grid" :class="{ 'single-preview': !multiple }">
        <div v-for="(preview, index) in previsualizaciones" :key="index" class="preview-item">
          <img :src="preview" :alt="`Preview ${index + 1}`" />
          <button type="button" class="btn-remove" @click.stop="eliminarPreview(index)" title="Eliminar">
            <i class="bi bi-x-circle-fill"></i>
          </button>
        </div>
        
        <div v-if="multiple && previsualizaciones.length < maxFiles" class="add-more" @click.stop="abrirSelector">
          <i class="bi bi-plus-circle"></i>
          <small>Agregar más</small>
        </div>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger mt-2 mb-0">
      <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
    </div>

    <div v-if="uploading" class="upload-progress mt-2">
      <div class="progress">
        <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 100%">
          Subiendo imágenes...
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'ImageUploader',
  props: {
    modelValue: {
      type: [String, Array],
      default: null
    },
    multiple: {
      type: Boolean,
      default: false
    },
    maxFiles: {
      type: Number,
      default: 4
    },
    placeholder: {
      type: String,
      default: 'Arrastra imágenes aquí o haz clic para seleccionar'
    },
    accept: {
      type: String,
      default: 'image/jpeg,image/jpg,image/png,image/webp,image/gif'
    }
  },
  emits: ['update:modelValue', 'files-selected'],
  setup(props, { emit }) {
    const fileInput = ref(null);
    const archivos = ref([]);
    const previsualizaciones = ref([]);
    const isDragOver = ref(false);
    const error = ref('');
    const uploading = ref(false);

    // Inicializar previsualizaciones si hay URLs existentes
    watch(() => props.modelValue, (newValue) => {
      if (newValue && !archivos.value.length) {
        if (Array.isArray(newValue)) {
          previsualizaciones.value = newValue.filter(url => url);
        } else if (typeof newValue === 'string' && newValue) {
          previsualizaciones.value = [newValue];
        }
      }
    }, { immediate: true });

    const validarArchivo = (file) => {
      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!tiposPermitidos.includes(file.type)) {
        return 'Tipo de archivo no permitido. Use JPG, PNG, WEBP o GIF';
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return 'El archivo es demasiado grande. Tamaño máximo: 5MB';
      }

      return null;
    };

    const crearPreview = (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    };

    const procesarArchivos = async (files) => {
      error.value = '';
      const nuevosArchivos = Array.from(files);

      // Validar cantidad
      const totalArchivos = archivos.value.length + nuevosArchivos.length;
      if (totalArchivos > props.maxFiles) {
        error.value = `Máximo ${props.maxFiles} imágenes permitidas`;
        return;
      }

      // Validar cada archivo
      for (const file of nuevosArchivos) {
        const errorValidacion = validarArchivo(file);
        if (errorValidacion) {
          error.value = errorValidacion;
          return;
        }
      }

      // Crear previews
      const nuevasPreviews = await Promise.all(nuevosArchivos.map(crearPreview));
      
      archivos.value = props.multiple 
        ? [...archivos.value, ...nuevosArchivos]
        : [nuevosArchivos[0]];
      
      previsualizaciones.value = props.multiple
        ? [...previsualizaciones.value, ...nuevasPreviews]
        : [nuevasPreviews[0]];

      // Emitir archivos seleccionados
      emit('files-selected', archivos.value);
    };

    const abrirSelector = () => {
      fileInput.value?.click();
    };

    const seleccionarArchivos = async (event) => {
      const files = event.target.files;
      if (files.length > 0) {
        await procesarArchivos(files);
      }
    };

    const soltar = async (event) => {
      isDragOver.value = false;
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        await procesarArchivos(files);
      }
    };

    const eliminarPreview = (index) => {
      archivos.value.splice(index, 1);
      previsualizaciones.value.splice(index, 1);
      
      // Emitir cambios
      emit('files-selected', archivos.value);
      
      // Si no hay archivos, limpiar el valor
      if (archivos.value.length === 0) {
        emit('update:modelValue', props.multiple ? [] : null);
      }
    };

    const limpiar = () => {
      archivos.value = [];
      previsualizaciones.value = [];
      error.value = '';
      if (fileInput.value) {
        fileInput.value.value = '';
      }
      emit('files-selected', []);
      emit('update:modelValue', props.multiple ? [] : null);
    };

    const getArchivos = () => archivos.value;

    return {
      fileInput,
      previsualizaciones,
      isDragOver,
      error,
      uploading,
      abrirSelector,
      seleccionarArchivos,
      soltar,
      eliminarPreview,
      limpiar,
      getArchivos
    };
  }
};
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

.upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #667eea;
  background: #f0f1ff;
}

.upload-area.drag-over {
  border-color: #667eea;
  background: #e8eaff;
  transform: scale(1.02);
}

.upload-placeholder {
  width: 100%;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  width: 100%;
}

.preview-grid.single-preview {
  grid-template-columns: 1fr;
  max-width: 400px;
  margin: 0 auto;
}

.preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(220, 53, 69, 0.9);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
  font-size: 1.2rem;
}

.btn-remove:hover {
  background: #dc3545;
  transform: scale(1.1);
}

.add-more {
  aspect-ratio: 1;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.add-more:hover {
  border-color: #667eea;
  background: #f0f1ff;
}

.add-more i {
  font-size: 2rem;
  color: #6c757d;
}

.add-more small {
  margin-top: 8px;
  color: #6c757d;
}

.upload-progress {
  margin-top: 10px;
}

@media (max-width: 576px) {
  .preview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
