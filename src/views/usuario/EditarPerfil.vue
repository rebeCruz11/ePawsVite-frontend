<template>
  <div class="fade-in">
    <h2 class="mb-4"><i class="bi bi-person-circle me-2"></i>Editar Perfil</h2>

    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-body p-4">
            <form @submit.prevent="guardar">
              <div class="mb-3">
                <label class="form-label">Nombre</label>
                <input v-model="form.nombre" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label">Apellido</label>
                <input v-model="form.apellido" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label">Correo</label>
                <input v-model="form.correo" type="email" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label">Teléfono</label>
                <input v-model="form.telefono" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label">Nueva contraseña (opcional)</label>
                <input v-model="form.contrasena" type="password" class="form-control" placeholder="Dejar vacío para no cambiar" />
              </div>

              <!-- Campos específicos según rol -->
              <div v-if="rol === 2" class="mt-3">
                <h5>Datos de Organización</h5>
                <div class="mb-3">
                  <label class="form-label">Nombre de Organización</label>
                  <input v-model="org.nombreOrganizacion" class="form-control" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Dirección</label>
                  <input v-model="org.direccion" class="form-control" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Descripción</label>
                  <textarea v-model="org.descripcion" class="form-control"></textarea>
                </div>
              </div>

              <div v-if="rol === 3" class="mt-3">
                <h5>Datos de Veterinaria</h5>
                <div class="mb-3">
                  <label class="form-label">Nombre de Clínica</label>
                  <input v-model="vet.nombreClinica" class="form-control" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Especialidad</label>
                  <input v-model="vet.especialidad" class="form-control" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Dirección</label>
                  <input v-model="vet.direccion" class="form-control" />
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-secondary" type="button" @click="cancelar">Cancelar</button>
                <button class="btn btn-primary" :disabled="guardando">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import usuarioService from '../../services/usuarioService';
import organizacionService from '../../services/organizacionService';
import veterinariaService from '../../services/veterinariaService';
import { alertaExito, manejarErrorAPI } from '../../utils/alertas';
import { hashContrasena } from '../../utils/encriptacion';

export default {
  name: 'EditarPerfil',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const guardando = ref(false);

    const form = ref({
      idUsuario: null,
      nombre: '',
      apellido: '',
      correo: '',
      telefono: '',
      contrasena: '' // nueva contraseña opcional
    });

    const org = ref({});
    const vet = ref({});
    const rol = authStore.rolUsuario;

    const cargar = async () => {
      try {
        const user = authStore.usuarioActual;
        if (!user) return router.push('/login');

        form.value.idUsuario = user.idUsuario;
        form.value.nombre = user.nombre || '';
        form.value.apellido = user.apellido || '';
        form.value.correo = user.correo || '';
        form.value.telefono = user.telefono || '';

        // Cargar datos adicionales según rol
        if (rol === 2) {
          const r = await organizacionService.getByUsuario(user.idUsuario);
          org.value = r.data || {};
        }

        if (rol === 3) {
          const r = await veterinariaService.getByUsuario(user.idUsuario);
          vet.value = r.data || {};
        }
      } catch (error) {
        manejarErrorAPI(error);
      }
    };

    const guardar = async () => {
      guardando.value = true;
      try {
        const payloadUsuario = {
          ...authStore.usuarioActual,
          nombre: form.value.nombre,
          apellido: form.value.apellido,
          correo: form.value.correo,
          telefono: form.value.telefono
        };

        // Si se proporcionó nueva contraseña, guardamos el hash
        if (form.value.contrasena && form.value.contrasena.trim() !== '') {
          payloadUsuario.contrasena = hashContrasena(form.value.contrasena);
        }

        // Actualizar usuario
        await usuarioService.update(payloadUsuario.idUsuario, payloadUsuario);

        // Actualizar entidad específica si aplica
        if (rol === 2 && org.value && org.value.idOrganizacion) {
          const updateOrg = { ...org.value };
          await organizacionService.update(updateOrg.idOrganizacion, updateOrg);
        }

        if (rol === 3 && vet.value && vet.value.idVeterinaria) {
          const updateVet = { ...vet.value };
          await veterinariaService.update(updateVet.idVeterinaria, updateVet);
        }

        // Actualizar store y localStorage
        authStore.actualizarUsuario(payloadUsuario);

        await alertaExito('Perfil actualizado correctamente', 'Datos guardados');
        router.back();
      } catch (error) {
        manejarErrorAPI(error);
      } finally {
        guardando.value = false;
      }
    };

    const cancelar = () => router.back();

    onMounted(() => cargar());

    return { form, org, vet, rol, guardar, cancelar, guardando };
  }
};
</script>
