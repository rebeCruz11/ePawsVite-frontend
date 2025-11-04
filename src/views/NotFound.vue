<template>
  <div>
    <Navbar />
    
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6 text-center">
          <i class="bi bi-exclamation-triangle text-warning" style="font-size: 5rem;"></i>
          <h1 class="display-4 mt-4">404</h1>
          <h2 class="mb-3">Página no encontrada</h2>
          <p class="text-muted mb-4">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
          <router-link to="/" class="btn btn-primary btn-lg">
            <i class="bi bi-house me-2"></i>
            Volver al Inicio
          </router-link>
        </div>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script>
import Navbar from '../components/common/Navbar.vue';
import Footer from '../components/common/Footer.vue';

export default {
  name: 'NotFound',
  components: {
    Navbar,
    Footer
  }
}
</script>
