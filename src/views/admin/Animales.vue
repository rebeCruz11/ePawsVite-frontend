<template><div class="fade-in"><h2 class="mb-4"><i class="bi bi-heart me-2"></i>Gestión de Animales</h2><Loading v-if="cargando"/><div v-else class="card"><div class="card-body"><div class="table-responsive"><table class="table table-hover"><thead><tr><th>Nombre</th><th>Especie</th><th>Edad</th><th>Sexo</th><th>Estado</th><th>Organización</th></tr></thead><tbody><tr v-for="a in animales" :key="a.idAnimal"><td><i :class="`bi ${iconoPorEspecie(a.especie)} me-2`"></i>{{ a.nombre }}</td><td>{{ a.especie }}</td><td>{{ a.edad }} {{ a.unidadEdad }}</td><td>{{ a.sexo }}</td><td><span class="badge" :class="`bg-${colorPorEstado(a.estado)}`">{{ formatearEstado(a.estado) }}</span></td><td>{{ a.organizacion?.nombreOrganizacion || 'N/A' }}</td></tr></tbody></table></div></div></div></div></template>
<script>
import {ref,onMounted} from 'vue';
import Loading from '../../components/common/Loading.vue';
import animalService from '../../services/animalService';
import {manejarErrorAPI} from '../../utils/alertas';
import {iconoPorEspecie,colorPorEstado,formatearEstado} from '../../utils/helpers';
export default{name:'AdminAnimales',components:{Loading},setup(){const cargando=ref(true);const animales=ref([]);const cargar=async()=>{try{const r=await animalService.getAll();animales.value=r.data;}catch(e){manejarErrorAPI(e);}finally{cargando.value=false;}};onMounted(()=>cargar());return{cargando,animales,iconoPorEspecie,colorPorEstado,formatearEstado};}}</script>
