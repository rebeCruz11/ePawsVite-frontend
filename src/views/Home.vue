<template>
  <div>
    <Navbar />
    
    <!-- Hero Section -->
    <section class="bg-primary text-white py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h1 class="display-4 fw-bold mb-3">
              <i class="bi bi-heart-fill"></i>
              Bienvenido a ePaws
            </h1>
            <p class="lead mb-4">
              El sistema que conecta corazones con patitas. Adopta, reporta y cuida de nuestros amigos peludos.
            </p>
            <div class="d-flex gap-3">
              <router-link to="/cliente/animales" class="btn btn-light btn-lg">
                <i class="bi bi-heart me-2"></i>
                Ver Animales
              </router-link>
              <router-link to="/registro" class="btn btn-outline-light btn-lg">
                <i class="bi bi-person-plus me-2"></i>
                Regístrate
              </router-link>
            </div>
          </div>
          <div class="col-md-6 text-center">
            <i class="bi bi-hearts display-1"></i>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Features -->
    <section class="py-5">
      <div class="container">
        <h2 class="text-center mb-5">¿Cómo funciona?</h2>
        
        <div class="row g-4">
          <div class="col-md-3">
            <div class="card h-100 text-center border-0 shadow-sm">
              <div class="card-body">
                <i class="bi bi-search text-primary" style="font-size: 3rem;"></i>
                <h5 class="mt-3">Busca</h5>
                <p class="text-muted">Encuentra al compañero perfecto entre nuestros animales disponibles</p>
              </div>
            </div>
          </div>
          
          <div class="col-md-3">
            <div class="card h-100 text-center border-0 shadow-sm">
              <div class="card-body">
                <i class="bi bi-clipboard-check text-success" style="font-size: 3rem;"></i>
                <h5 class="mt-3">Solicita</h5>
                <p class="text-muted">Completa tu solicitud de adopción de manera fácil y rápida</p>
              </div>
            </div>
          </div>
          
          <div class="col-md-3">
            <div class="card h-100 text-center border-0 shadow-sm">
              <div class="card-body">
                <i class="bi bi-flag text-warning" style="font-size: 3rem;"></i>
                <h5 class="mt-3">Reporta</h5>
                <p class="text-muted">Ayuda a animales en situación de calle reportándolos</p>
              </div>
            </div>
          </div>
          
          <div class="col-md-3">
            <div class="card h-100 text-center border-0 shadow-sm">
              <div class="card-body">
                <i class="bi bi-heart text-danger" style="font-size: 3rem;"></i>
                <h5 class="mt-3">Adopta</h5>
                <p class="text-muted">Dale un hogar lleno de amor a tu nuevo mejor amigo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Stats -->
    <section class="bg-light py-5">
      <div class="container">
        <div class="row text-center">
          <div class="col-md-4">
            <h2 class="display-4 text-primary fw-bold">150+</h2>
            <p class="text-muted">Animales rescatados</p>
          </div>
          <div class="col-md-4">
            <h2 class="display-4 text-success fw-bold">80+</h2>
            <p class="text-muted">Adopciones exitosas</p>
          </div>
          <div class="col-md-4">
            <h2 class="display-4 text-warning fw-bold">25+</h2>
            <p class="text-muted">Organizaciones aliadas</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- CTA -->
    <section class="py-5">
      <div class="container">
        <div class="card bg-primary text-white text-center shadow">
          <div class="card-body py-5">
            <h2 class="mb-3">¿Listo para cambiar una vida?</h2>
            <p class="lead mb-4">Únete a nuestra comunidad y ayuda a encontrar hogares para animales que lo necesitan</p>
            <router-link to="/registro" class="btn btn-light btn-lg">
              <i class="bi bi-person-plus me-2"></i>
              Comienza Ahora
            </router-link>
          </div>
        </div>
      </div>
    </section>
    
    <Footer />
  </div>
</template>

<script>
import Navbar from '../components/common/Navbar.vue';
import Footer from '../components/common/Footer.vue';

export default {
  name: 'Home',
  components: {
    Navbar,
    Footer
  }
}
</script>
