<template>
  <div class="editar-pedido-container">
    <h2 class="titulo">Administrar fotos</h2>

    <!-- Mensaje -->
    <div v-if="mensaje" :class="['mensaje', tipoMensaje]">{{ mensaje }}</div>

    <!-- Controles solo si está autenticado -->
    <div v-if="isAuthenticated" class="controls">
      <div class="form-group">
        <input
          type="file"
          multiple
          @change="seleccionarArchivos"
          accept="image/*"
          class="input"
        />
      </div>
      <button
        @click="subirFotos"
        :disabled="archivos.length === 0 || uploading"
        class="boton"
      >
        {{ uploading ? 'Subiendo...' : 'Subir todas' }}
      </button>
    </div>

    <!-- Galería -->
    <h3 style="margin-top:1rem;">Fotos cargadas</h3>
    <div v-if="loadingFotos" class="mensaje info">Cargando fotos...</div>
    <div v-else-if="fotosSubidas.length === 0" class="mensaje info">
      No hay fotos cargadas aún.
    </div>

    <div class="galeria">
      <div
        v-for="foto in fotosSubidas"
        :key="foto.id ?? foto.url"
        class="foto-item"
      >
        <img
          :src="foto.url"
          :alt="foto.nombre"
          class="foto-mini"
          @click="abrirPreview(foto.url)"
        />
        <p class="foto-nombre">{{ foto.nombre }}</p>

        <!-- Botón eliminar solo si está autenticado -->
        <div v-if="isAuthenticated" class="foto-actions">
          <button class="boton eliminar" @click="confirmarYEliminar(foto)">
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Preview -->
    <div v-if="previewUrl" class="modal" @click.self="previewUrl = null">
      <button class="cerrar" @click="previewUrl = null">✕</button>
      <img :src="previewUrl" class="foto-grande" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { uploadToCloudinary, eliminarDeCloudinary } from '@/services/cloudinaryService';
import { guardarFoto, getFotosDisponibles, eliminarFoto } from '@/services/fotoService';

interface FotoSubida {
  id?: string;
  url: string;
  publicId?: string;
  nombre: string;
}

// Estados
const mensaje = ref<string | null>(null);
const tipoMensaje = ref<'exito' | 'error' | 'info'>('info');
const archivos = ref<File[]>([]);
const fotosSubidas = ref<FotoSubida[]>([]);
const uploading = ref(false);
const loadingFotos = ref(true);
const previewUrl = ref<string | null>(null);

// Autenticación
const isAuthenticated = computed(() => localStorage.getItem('token') !== null);

// Mensajes
const mostrarMensaje = (msg: string, tipo: 'exito' | 'error' | 'info' = 'info') => {
  mensaje.value = msg;
  tipoMensaje.value = tipo;
  setTimeout(() => {
    mensaje.value = null;
    tipoMensaje.value = 'info';
  }, 3500);
};

// Seleccionar archivos
const seleccionarArchivos = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files) archivos.value = Array.from(target.files);
};

// Cargar fotos
const eventoId = 'evento123';
const cargarFotos = async () => {
  loadingFotos.value = true;
  try {
    const fotos = await getFotosDisponibles(eventoId);

    fotosSubidas.value = fotos.map(f => ({
      id: f.id,
      url: f.url,
      publicId: f.publicId,
      nombre: f.nombre
    }));
  } catch (err) {
    console.error('Error cargando fotos:', err);
    mostrarMensaje('Error cargando fotos', 'error');
  } finally {
    loadingFotos.value = false;
  }
};

// Montar
onMounted(() => {
  cargarFotos();
});

// Subir fotos
const subirFotos = async () => {
  if (!isAuthenticated.value) {
    mostrarMensaje('Debes estar logueado para subir fotos', 'error');
    return;
  }
  if (archivos.value.length === 0) return;

  uploading.value = true;

  for (const file of archivos.value) {
    try {
      const res = await uploadToCloudinary(file);
      const url = res.url;
      const publicId = res.publicId;

      const id = await guardarFoto({ url, publicId, nombre: file.name, eventoId });

      fotosSubidas.value.unshift({
        id,
        url,
        publicId,
        nombre: file.name
      });

      mostrarMensaje(`Foto "${file.name}" subida ✅`, 'exito');
    } catch (err) {
      console.error('Error subiendo', file.name, err);
      mostrarMensaje(`Error subiendo "${file.name}" ❌`, 'error');
    }
  }

  archivos.value = [];
  uploading.value = false;
};

// Eliminar foto
const confirmarYEliminar = async (foto: FotoSubida) => {
  if (!isAuthenticated.value) {
    mostrarMensaje('Debes estar logueado para eliminar fotos', 'error');
    return;
  }

  const ok = window.confirm(`¿Eliminar "${foto.nombre}"?`);
  if (!ok) return;

  try {
    if (foto.publicId) await eliminarDeCloudinary(foto.publicId);
    if (foto.id) {
      await eliminarFoto(foto.id);
      fotosSubidas.value = fotosSubidas.value.filter(f => f.id !== foto.id);
    }
    mostrarMensaje(`Foto "${foto.nombre}" eliminada ✅`, 'exito');
  } catch (err) {
    console.error('Error eliminando foto', err);
    mostrarMensaje('Error eliminando la foto', 'error');
  }
};

// Preview
const abrirPreview = (url: string) => {
  previewUrl.value = url;
};
</script>

<style scoped>
/* Contenedor general */
.editar-pedido-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}

/* Título */
.titulo {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1f2937;
}

/* Form group */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

/* Input */
.input {
  padding: 0.7rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  font-size: 1rem;
  background-color: #f9fafb;
  color: #111827;
  transition: border 0.2s, box-shadow 0.2s;
}

.input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74,144,226,0.2);
}

/* Botones */
.boton {
  background-color: #4a90e2;
  color: white;
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease;
  margin-top: 0.5rem;
}

.boton:hover {
  background-color: #3b7bd5;
}

.boton:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

/* Galería */
.galeria {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.foto-item {
  text-align: center;
  position: relative;
}

.foto-mini {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  cursor: pointer;
  transition: transform 0.2s;
}

.foto-mini:hover {
  transform: scale(1.05);
}

.foto-nombre {
  font-size: 0.9rem;
  margin-top: 0.3rem;
  color: #1f2937;
}

/* Acciones de cada foto */
.foto-actions {
  margin-top: 0.3rem;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.boton.eliminar {
  background: #ef4444;
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 0.8rem;
  color: white;
}

/* Mensajes */
.mensaje {
  text-align: center;
  margin-bottom: 1rem;
  padding: 0.7rem;
  border-radius: 0.5rem;
  font-weight: 600;
}

.mensaje.exito {
  background-color: #10b981;
  color: white;
}

.mensaje.error {
  background-color: #ef4444;
  color: white;
}

.mensaje.info {
  background-color: #f59e0b;
  color: white;
}

/* Modal preview */
.modal {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0,0,0,0.75);
  z-index: 1000;
}

.foto-grande {
  max-width: 90%;
  max-height: 85%;
  border-radius: 10px;
}

.cerrar {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 20px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 600px) {
  .editar-pedido-container {
    padding: 1rem;
  }
  .titulo {
    font-size: 1.6rem;
  }
}
</style>
