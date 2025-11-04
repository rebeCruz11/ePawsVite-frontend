<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand">
        <i class="bi bi-heart-fill"></i>
        ePaws
      </router-link>
      
      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item" v-if="!authStore.estaAutenticado">
            <router-link to="/login" class="nav-link">
              <i class="bi bi-box-arrow-in-right"></i>
              Iniciar Sesión
            </router-link>
          </li>
          
          <li class="nav-item" v-if="!authStore.estaAutenticado">
            <router-link to="/registro" class="nav-link">
              <i class="bi bi-person-plus"></i>
              Registrarse
            </router-link>
          </li>
          
          <li class="nav-item dropdown" v-if="authStore.estaAutenticado">
            <a 
              class="nav-link dropdown-toggle d-flex align-items-center" 
              href="#" 
              id="navbarDropdown" 
              role="button" 
              data-bs-toggle="dropdown"
            >
              <div class="avatar me-2">
                {{ authStore.iniciales }}
              </div>
              <span class="d-none d-md-inline">{{ authStore.nombreCompleto }}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <span class="dropdown-item-text">
                  <strong>{{ authStore.nombreCompleto }}</strong><br>
                  <small class="text-muted">{{ nombreRol(authStore.rolUsuario) }}</small>
                </span>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <router-link :to="dashboardLink" class="dropdown-item">
                  <i class="bi bi-speedometer2 me-2"></i>
                  Dashboard
                </router-link>
              </li>
              <li>
                <a href="#" @click.prevent="logout" class="dropdown-item text-danger">
                  <i class="bi bi-box-arrow-right me-2"></i>
                  Cerrar Sesión
                </a>
              </li>
            </ul>
          </li>
          
          <li class="nav-item" v-if="authStore.estaAutenticado">
            <a href="#" @click.prevent="logout" class="nav-link">
              <i class="bi bi-box-arrow-right"></i>
              <span class="d-none d-md-inline ms-1">Cerrar Sesión</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { useAuthStore } from '../../stores/auth';
import { nombreRol } from '../../utils/helpers';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { alertaExito } from '../../utils/alertas';

export default {
  name: 'Navbar',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const dashboardLink = computed(() => {
      const dashboardMap = {
        4: '/admin',
        2: '/organizacion',
        3: '/veterinaria',
        1: '/cliente'
      };
      return dashboardMap[authStore.rolUsuario] || '/';
    });

    const logout = async () => {
      authStore.logout();
      await alertaExito('Sesión cerrada correctamente', '¡Hasta pronto!');
      router.push('/');
    };

    return {
      authStore,
      nombreRol,
      dashboardLink,
      logout
    };
  }
}
</script>
