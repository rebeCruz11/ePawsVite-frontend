<template>
  <div class="spinner-container">
    <div class="spinner-border text-primary" role="status" :style="{ width: size, height: size }">
      <span class="visually-hidden">{{ mensaje }}</span>
    </div>
    <p class="mt-3 text-muted" v-if="mostrarMensaje">{{ mensaje }}</p>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  props: {
    mensaje: {
      type: String,
      default: 'Cargando...'
    },
    size: {
      type: String,
      default: '3rem'
    },
    mostrarMensaje: {
      type: Boolean,
      default: true
    }
  }
}
</script>
