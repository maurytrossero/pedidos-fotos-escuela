<template>
  <div class="formulario-container">
    <h2 class="titulo">Carga los datos de tu pedido de fotos</h2>

    <form @submit.prevent="handleSubmit" class="formulario">
      <!-- Nombre -->
      <div class="form-group">
        <label for="nombre">Nombre y apellido del niño/a</label>
        <input type="text" id="nombre" v-model="nombre" required />
      </div>

      <!-- WhatsApp -->
      <div class="form-group">
        <label for="whatsapp">WhatsApp del contacto, característica sin el 0 y número sin el 15</label>
        <input
          type="tel"
          id="whatsapp"
          v-model="whatsapp"
          required
          placeholder="Ej: 3511234567"
          pattern="[0-9]*"
          inputmode="numeric"
          @blur="checkWhatsappExistence"
        />
      </div>

      <!-- Paquete de fotos -->
      <div class="form-group">
        <label for="paquete">Paquete de fotos</label>
        <select id="paquete" v-model.number="paquete" required>
          <option disabled value="">Seleccionar</option>
          <option :value="1">1 foto - $5000</option>
          <option :value="2">2 fotos - $10000</option>
          <option :value="3">3 fotos - $15000</option>
        </select>
      </div>

      <!-- Fotos extra -->
      <div class="form-group">
        <label for="extras">Fotos extra</label>
        <input
          type="number"
          id="extras"
          v-model.number="extras"
          min="0"
          placeholder="Cantidad"
        />
      </div>

      <!-- Total calculado -->
      <div class="form-group total">
        <label>Total a pagar</label>
        <p class="total-pago">${{ total }}</p>
      </div>

      <!-- Alias -->
      <div class="form-group">
        <label>Transferencia a alias</label>
        <p class="alias"></p><!-- Escribir alias aqui Meli.barale.foto -->
        <small class="alias-tip">
          Transferí el total a este alias y luego subí una captura del/los comprobante/s. También podes cargarlos más tarde en la opción Editar pedido.
        </small>
      </div>

      <!-- Comprobante -->
      <div class="form-group">
        <label for="comprobante">Comprobante de pago</label><br />
        <label class="custom-file-upload">
          <input type="file" @change="handleFileUpload" accept="image/*" />
          <span>📎 Seleccionar archivo</span>
        </label>
        <p v-if="comprobanteFile" class="archivo-cargado">
          Archivo: {{ comprobanteFile.name }}
        </p>
      </div>

      <!-- Mostrar comprobantes cargados -->
      <div v-if="comprobantesCargados.length > 0" class="form-group">
        <h4>Comprobantes cargados:</h4>
        <ul>
          <li v-for="c in comprobantesCargados" :key="c.nombreArchivo">
            <a :href="c.url" target="_blank">{{ c.nombreArchivo }}</a>
          </li>
        </ul>
      </div>

      <!-- Botón -->
      <button type="submit" class="btn-enviar" :disabled="loading">
        {{ loading ? "Procesando..." : (isEditing ? "Guardar cambios" : "Enviar pedido") }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Swal from 'sweetalert2';
import { guardarPedido, getPedidoPorWhatsapp, actualizarPedido, agregarComprobante  // 👈 Faltaba este import
 } from '@/services/fotoConfirmacionService';

interface Comprobante {
  url: string;
  nombreArchivo: string;
}

const nombre = ref('');
const whatsapp = ref('');
const paquete = ref<number | ''>('');
const extras = ref(0);
const comprobanteFile = ref<File | null>(null);
const comprobantesCargados = ref<Comprobante[]>([]);
const loading = ref(false);
const isEditing = ref(false);
const editingPedidoId = ref<string | null>(null);

const total = computed(() => {
  if (!paquete.value) return 0;
  return (paquete.value + extras.value) * 5000;
});

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files?.length) {
    comprobanteFile.value = target.files[0];
  }
};

const checkWhatsappExistence = async () => {
  if (!/^\d{10,15}$/.test(whatsapp.value.trim())) return;

  const existingPedido = await getPedidoPorWhatsapp(whatsapp.value.trim());
  if (existingPedido) {
    Swal.fire({
      icon: 'info',
      title: 'Pedido existente',
      text: 'Ya existe un pedido con este número de WhatsApp. Podes editar tu pedido ingresando el número de whatsapp.',
    });

    isEditing.value = true;
    editingPedidoId.value = existingPedido.id;

    nombre.value = existingPedido.nombre || '';
    paquete.value = existingPedido.paquete || '';
    extras.value = existingPedido.fotosExtra || 0;

    comprobantesCargados.value = existingPedido.comprobantes || [];
  } else {
    isEditing.value = false;
    editingPedidoId.value = null;
    comprobantesCargados.value = [];
  }
};

const handleSubmit = async () => {
  if (!paquete.value) {
    Swal.fire("Seleccioná un paquete", "", "warning");
    return;
  }

  if (!/^\d{10,15}$/.test(whatsapp.value.trim())) {
    Swal.fire("WhatsApp inválido", "Ingresá un número válido sin espacios, característica sin 0 y número sin 15.", "warning");
    return;
  }

  loading.value = true;

  try {
    if (isEditing.value && editingPedidoId.value) {
      // Actualizar datos básicos
      await actualizarPedido(editingPedidoId.value, {
        nombre: nombre.value.trim(),
        paquete: paquete.value,
        fotosExtra: extras.value,
        total: total.value,
      });

      // Agregar comprobante nuevo si lo hay
      if (comprobanteFile.value) {
        await agregarComprobante(editingPedidoId.value, comprobanteFile.value);
      }

      Swal.fire("Pedido actualizado 🎉", "Tu pedido fue actualizado correctamente.", "success");
    } else {
      // Crear pedido nuevo y delegar comprobante al service
      await guardarPedido({
        nombre: nombre.value.trim(),
        whatsapp: whatsapp.value.trim(),
        paquete: paquete.value,
        fotosExtra: extras.value,
        total: total.value,
        comprobanteFile: comprobanteFile.value || undefined,
      });

      Swal.fire("Pedido enviado 🎉", "Tu pedido fue registrado correctamente.", "success");
    }

    // Resetear formulario
    nombre.value = '';
    whatsapp.value = '';
    paquete.value = '';
    extras.value = 0;
    comprobanteFile.value = null;
    comprobantesCargados.value = [];
    isEditing.value = false;
    editingPedidoId.value = null;

  } catch (error) {
    Swal.fire("Error", "No se pudo guardar el pedido.", "error");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

</script>

<style scoped>
/* Fuente base */
* {
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}

/* Contenedor principal */
.formulario-container {
  max-width: 500px;
  margin: auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

/* Título */
.titulo {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1f2937;
}

/* Estilo de formulario */
.formulario {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Etiquetas */
.form-group label {
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: #374151;
  font-size: 0.95rem;
}

/* Inputs y select */
input,
select {
  width: 100%;
  padding: 0.7rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  font-size: 1rem;
  background-color: #f9fafb;
  color: #111827;
  transition: border 0.2s, box-shadow 0.2s;
}

input:focus,
select:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

/* Alias */
.alias {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2563eb;
}

.alias-tip {
  font-size: 0.85rem;
  color: #6b7280;
}

/* Total */
.total-pago {
  font-size: 1.5rem;
  font-weight: 700;
  color: #10b981;
}

/* Archivo cargado */
.archivo-cargado {
  font-size: 0.9rem;
  color: #374151;
  margin-top: 0.3rem;
}

/* Botón */
.btn-enviar {
  background-color: #4a90e2;
  color: white;
  font-size: 1.1rem;
  padding: 0.9rem;
  border: none;
  border-radius: 0.6rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.btn-enviar:hover {
  background-color: #3b7ec4;
}

/* Custom file upload */
.custom-file-upload {
  display: inline-block;
  padding: 0.6rem 1.2rem;
  color: white;
  background-color: #4a90e2;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease;
  text-align: center;
  font-size: 1rem;
}

.custom-file-upload:hover {
  background-color: #3b7ec4;
}

.custom-file-upload input[type="file"] {
  display: none;
}

.custom-file-upload span {
  color: white;
}

/* Responsive */
@media (max-width: 600px) {
  .formulario-container {
    padding: 1rem;
  }

  .titulo {
    font-size: 1.6rem;
  }

  .btn-enviar {
    font-size: 1rem;
    padding: 0.8rem;
  }
}
</style>

