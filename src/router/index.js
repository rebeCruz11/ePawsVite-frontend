import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  // Rutas públicas
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/registro',
    name: 'Registro',
    component: () => import('../views/auth/Registro.vue'),
    meta: { requiresAuth: false }
  },

  // Rutas de Administrador (idRol: 4)
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, rol: 4 },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue')
      },
      {
        path: 'usuarios',
        name: 'AdminUsuarios',
        component: () => import('../views/admin/Usuarios.vue')
      },
      {
        path: 'organizaciones',
        name: 'AdminOrganizaciones',
        component: () => import('../views/admin/Organizaciones.vue')
      },
      {
        path: 'veterinarias',
        name: 'AdminVeterinarias',
        component: () => import('../views/admin/Veterinarias.vue')
      },
      {
        path: 'animales',
        name: 'AdminAnimales',
        component: () => import('../views/admin/Animales.vue')
      },
      {
        path: 'adopciones',
        name: 'AdminAdopciones',
        component: () => import('../views/admin/Adopciones.vue')
      },
      {
        path: 'reportes',
        name: 'AdminReportes',
        component: () => import('../views/admin/Reportes.vue')
      }
    ]
  },

  // Rutas de Organización (idRol: 2)
  {
    path: '/organizacion',
    component: () => import('../layouts/OrganizacionLayout.vue'),
    meta: { requiresAuth: true, rol: 2 },
    children: [
      {
        path: '',
        name: 'OrganizacionDashboard',
        component: () => import('../views/organizacion/Dashboard.vue')
      },
      {
        path: 'animales',
        name: 'OrganizacionAnimales',
        component: () => import('../views/organizacion/Animales.vue')
      },
      {
        path: 'adopciones',
        name: 'OrganizacionAdopciones',
        component: () => import('../views/organizacion/Adopciones.vue')
      },
      {
        path: 'reportes',
        name: 'OrganizacionReportes',
        component: () => import('../views/organizacion/Reportes.vue')
      },
      {
        path: 'perfil',
        name: 'OrganizacionPerfil',
        component: () => import('../views/organizacion/Perfil.vue')
      }
    ]
  },

  // Rutas de Veterinaria (idRol: 3)
  {
    path: '/veterinaria',
    component: () => import('../layouts/VeterinariaLayout.vue'),
    meta: { requiresAuth: true, rol: 3 },
    children: [
      {
        path: '',
        name: 'VeterinariaDashboard',
        component: () => import('../views/veterinaria/Dashboard.vue')
      },
      {
        path: 'reportes',
        name: 'VeterinariaReportes',
        component: () => import('../views/veterinaria/Reportes.vue')
      },
      {
        path: 'registros-medicos',
        name: 'VeterinariaRegistrosMedicos',
        component: () => import('../views/veterinaria/RegistrosMedicos.vue')
      },
      {
        path: 'perfil',
        name: 'VeterinariaPerfil',
        component: () => import('../views/veterinaria/Perfil.vue')
      }
    ]
  },

  // Rutas de Cliente/Usuario (idRol: 1)
  {
    path: '/cliente',
    component: () => import('../layouts/ClienteLayout.vue'),
    meta: { requiresAuth: true, rol: 1 },
    children: [
      {
        path: '',
        name: 'ClienteDashboard',
        component: () => import('../views/cliente/Dashboard.vue')
      },
      {
        path: 'animales',
        name: 'ClienteAnimales',
        component: () => import('../views/cliente/Animales.vue')
      },
      {
        path: 'mis-adopciones',
        name: 'ClienteMisAdopciones',
        component: () => import('../views/cliente/MisAdopciones.vue')
      },
      {
        path: 'crear-reporte',
        name: 'ClienteCrearReporte',
        component: () => import('../views/cliente/CrearReporte.vue')
      },
      {
        path: 'mis-reportes',
        name: 'ClienteMisReportes',
        component: () => import('../views/cliente/MisReportes.vue')
      }
    ]
  },

  // Ruta 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guard de navegación
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiredRol = to.meta.rol;

  // Si la ruta requiere autenticación
  if (requiresAuth) {
    if (!authStore.estaAutenticado) {
      // No está autenticado, redirigir a login
      next({ name: 'Login', query: { redirect: to.fullPath } });
    } else if (requiredRol && authStore.rolUsuario !== requiredRol) {
      // No tiene el rol necesario, redirigir según su rol
      const redirectMap = {
        4: '/admin',
        2: '/organizacion',
        3: '/veterinaria',
        1: '/cliente'
      };
      next(redirectMap[authStore.rolUsuario] || '/');
    } else {
      // Todo correcto, continuar
      next();
    }
  } else {
    // Ruta pública
    if (to.name === 'Login' && authStore.estaAutenticado) {
      // Ya está autenticado, redirigir según su rol
      const redirectMap = {
        4: '/admin',
        2: '/organizacion',
        3: '/veterinaria',
        1: '/cliente'
      };
      next(redirectMap[authStore.rolUsuario] || '/');
    } else {
      next();
    }
  }
});

export default router;
