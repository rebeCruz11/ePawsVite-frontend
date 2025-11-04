<template>
  <div>
    <Navbar />
    
    <div class="container-fluid">
      <div class="row">
        <!-- Sidebar -->
        <nav class="col-md-2 d-md-block sidebar p-3">
          <div class="position-sticky">
            <h6 class="text-uppercase text-muted mb-3">Organización</h6>
            
            <ul class="nav flex-column">
              <li class="nav-item">
                <router-link to="/organizacion" class="nav-link" exact-active-class="active">
                  <i class="bi bi-speedometer2"></i>
                  Dashboard
                </router-link>
              </li>
              
              <li class="nav-item">
                <router-link to="/organizacion/animales" class="nav-link" active-class="active">
                  <i class="bi bi-heart"></i>
                  Mis Animales
                </router-link>
              </li>
              
              <li class="nav-item">
                <router-link to="/organizacion/adopciones" class="nav-link" active-class="active">
                  <i class="bi bi-clipboard-check"></i>
                  Adopciones
                </router-link>
              </li>
              
              <li class="nav-item">
                <router-link to="/organizacion/reportes" class="nav-link" active-class="active">
                  <i class="bi bi-flag"></i>
                  Reportes Asignados
                </router-link>
              </li>
              
              <li class="nav-item">
                <router-link to="/organizacion/perfil" class="nav-link" active-class="active">
                  <i class="bi bi-building"></i>
                  Mi Perfil
                </router-link>
              </li>
            </ul>
          </div>
        </nav>
        
        <!-- Contenido principal -->
        <main class="col-md-10 ms-sm-auto px-md-4 py-4">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '../components/common/Navbar.vue';

export default {
  name: 'OrganizacionLayout',
  components: {
    Navbar
  }
}
</script>
