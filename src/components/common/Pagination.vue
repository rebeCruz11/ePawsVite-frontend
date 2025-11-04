<template>
  <nav aria-label="Paginación">
    <ul class="pagination justify-content-center">
      <!-- Botón Anterior -->
      <li class="page-item" :class="{ disabled: paginaActual === 1 }">
        <a 
          class="page-link" 
          href="#" 
          @click.prevent="cambiarPagina(paginaActual - 1)"
          :aria-disabled="paginaActual === 1"
        >
          <i class="bi bi-chevron-left"></i>
          Anterior
        </a>
      </li>
      
      <!-- Primera página -->
      <li class="page-item" v-if="paginaActual > 3" :class="{ active: paginaActual === 1 }">
        <a class="page-link" href="#" @click.prevent="cambiarPagina(1)">1</a>
      </li>
      
      <!-- Puntos suspensivos -->
      <li class="page-item disabled" v-if="paginaActual > 4">
        <span class="page-link">...</span>
      </li>
      
      <!-- Páginas cercanas -->
      <li 
        class="page-item" 
        v-for="pagina in paginasCercanas" 
        :key="pagina"
        :class="{ active: pagina === paginaActual }"
      >
        <a class="page-link" href="#" @click.prevent="cambiarPagina(pagina)">
          {{ pagina }}
        </a>
      </li>
      
      <!-- Puntos suspensivos -->
      <li class="page-item disabled" v-if="paginaActual < totalPaginas - 3">
        <span class="page-link">...</span>
      </li>
      
      <!-- Última página -->
      <li class="page-item" v-if="paginaActual < totalPaginas - 2" :class="{ active: paginaActual === totalPaginas }">
        <a class="page-link" href="#" @click.prevent="cambiarPagina(totalPaginas)">
          {{ totalPaginas }}
        </a>
      </li>
      
      <!-- Botón Siguiente -->
      <li class="page-item" :class="{ disabled: paginaActual === totalPaginas }">
        <a 
          class="page-link" 
          href="#" 
          @click.prevent="cambiarPagina(paginaActual + 1)"
          :aria-disabled="paginaActual === totalPaginas"
        >
          Siguiente
          <i class="bi bi-chevron-right"></i>
        </a>
      </li>
    </ul>
    
    <!-- Información de página -->
    <div class="text-center text-muted small mt-2">
      Página {{ paginaActual }} de {{ totalPaginas }} | 
      Total: {{ totalItems }} {{ totalItems === 1 ? 'registro' : 'registros' }}
    </div>
  </nav>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'Pagination',
  props: {
    paginaActual: {
      type: Number,
      required: true
    },
    totalPaginas: {
      type: Number,
      required: true
    },
    totalItems: {
      type: Number,
      required: true
    }
  },
  emits: ['cambiar-pagina'],
  setup(props, { emit }) {
    const paginasCercanas = computed(() => {
      const paginas = [];
      const inicio = Math.max(1, props.paginaActual - 2);
      const fin = Math.min(props.totalPaginas, props.paginaActual + 2);
      
      for (let i = inicio; i <= fin; i++) {
        paginas.push(i);
      }
      
      return paginas;
    });

    const cambiarPagina = (pagina) => {
      if (pagina >= 1 && pagina <= props.totalPaginas && pagina !== props.paginaActual) {
        emit('cambiar-pagina', pagina);
      }
    };

    return {
      paginasCercanas,
      cambiarPagina
    };
  }
}
</script>
