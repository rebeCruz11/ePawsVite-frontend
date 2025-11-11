<template>
  <div class="carousel-container">
    <div v-if="imagenes.length === 0" class="no-images">
      <i :class="`bi ${icono}`" style="font-size: 4rem; color: #6c757d;"></i>
      <p class="mt-3 text-muted">Sin imágenes disponibles</p>
    </div>

    <div v-else-if="imagenes.length === 1" class="single-image">
      <img :src="imagenes[0]" :alt="alt" @error="onImageError" />
    </div>

    <div v-else :id="carouselId" class="carousel slide" data-bs-ride="carousel">
      <!-- Indicadores -->
      <div class="carousel-indicators">
        <button 
          v-for="(img, index) in imagenes" 
          :key="index"
          type="button" 
          :data-bs-target="`#${carouselId}`" 
          :data-bs-slide-to="index" 
          :class="{ active: index === 0 }"
          :aria-current="index === 0 ? 'true' : 'false'"
          :aria-label="`Imagen ${index + 1}`"
        ></button>
      </div>

      <!-- Imágenes -->
      <div class="carousel-inner">
        <div 
          v-for="(imagen, index) in imagenes" 
          :key="index" 
          class="carousel-item" 
          :class="{ active: index === 0 }"
        >
          <img 
            :src="imagen" 
            class="d-block w-100" 
            :alt="`${alt} - Imagen ${index + 1}`"
            @error="onImageError"
          />
        </div>
      </div>

      <!-- Controles -->
      <button class="carousel-control-prev" type="button" :data-bs-target="`#${carouselId}`" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Anterior</span>
      </button>
      <button class="carousel-control-next" type="button" :data-bs-target="`#${carouselId}`" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Siguiente</span>
      </button>

      <!-- Contador de imágenes -->
      <div class="image-counter">
        <i class="bi bi-images me-1"></i>
        {{ imagenes.length }}
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'ImageCarousel',
  props: {
    imagenes: {
      type: Array,
      required: true,
      default: () => []
    },
    alt: {
      type: String,
      default: 'Imagen'
    },
    icono: {
      type: String,
      default: 'bi-image'
    },
    id: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const carouselId = computed(() => {
      return props.id || `carousel-${Math.random().toString(36).substr(2, 9)}`;
    });

    const onImageError = (event) => {
      event.target.src = 'https://via.placeholder.com/400x300?text=Imagen+no+disponible';
    };

    return {
      carouselId,
      onImageError
    };
  }
};
</script>

<style scoped>
.carousel-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.no-images {
  width: 100%;
  height: 100%;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.single-image {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.single-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel {
  height: 100%;
}

.carousel-inner {
  height: 100%;
}

.carousel-item {
  height: 100%;
}

.carousel-item img {
  height: 100%;
  object-fit: cover;
}

.carousel-control-prev,
.carousel-control-next {
  width: 50px;
  opacity: 0.7;
}

.carousel-control-prev:hover,
.carousel-control-next:hover {
  opacity: 1;
}

.image-counter {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  z-index: 10;
}

@media (max-width: 768px) {
  .carousel-control-prev,
  .carousel-control-next {
    width: 40px;
  }

  .image-counter {
    bottom: 10px;
    right: 10px;
    font-size: 0.8rem;
  }
}
</style>
