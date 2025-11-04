<template>
  <footer class="bg-dark text-white mt-5 py-4">
    <div class="container">
      <div class="row">
        <div class="col-md-4">
          <h5><i class="bi bi-heart-fill text-primary"></i> ePaws</h5>
          <p class="text-muted">Sistema de Adopción de Animales</p>
          <p class="text-muted small">
            Conectando corazones con patitas desde 2025
          </p>
        </div>
        
        <div class="col-md-4">
          <h6>Enlaces Rápidos</h6>
          <ul class="list-unstyled">
            <li><router-link to="/" class="text-decoration-none text-muted">Inicio</router-link></li>
            <li><router-link to="/cliente/animales" class="text-decoration-none text-muted">Adoptar</router-link></li>
            <li><router-link to="/cliente/crear-reporte" class="text-decoration-none text-muted">Reportar</router-link></li>
          </ul>
        </div>
        
        <div class="col-md-4">
          <h6>Contacto</h6>
          <p class="text-muted small">
            <i class="bi bi-envelope"></i> info@epaws.com<br>
            <i class="bi bi-telephone"></i> 2222-2222<br>
            <i class="bi bi-geo-alt"></i> San Salvador, El Salvador
          </p>
        </div>
      </div>
      
      <hr class="bg-secondary">
      
      <div class="row">
        <div class="col-12 text-center">
          <p class="text-muted small mb-0">
            &copy; {{ new Date().getFullYear() }} ePaws. Todos los derechos reservados. | UNICAES
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>
