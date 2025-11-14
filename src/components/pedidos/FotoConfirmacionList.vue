<template>
  <!-- (idéntico al tuyo, sin cambios) -->
  <div class="contenedor-pedidos">
    <h2 class="titulo-pedidos">Pedidos de Fotos</h2>

    <!-- 🔒 Bloque mensaje masivo -->
    <div v-if="isAuthenticated" class="bloque-mensaje">
      <label for="mensaje" class="label-mensaje">Mensaje para enviar a todos:</label>
      <textarea
        id="mensaje"
        v-model="mensajeMasivo"
        class="textarea-mensaje"
        rows="4"
        placeholder="Escribí el mensaje que querés enviar a todos por WhatsApp..."
      ></textarea>
    </div>

    <!-- 🔍 Bloque de filtros -->
    <div class="filtros-wrapper">
      <div class="barra-filtros" @click="mostrarFiltros = !mostrarFiltros">
        <span>Filtros</span>
        <span class="icono-flecha" :class="{ abierto: mostrarFiltros }">▼</span>
      </div>

      <transition name="deslizar">
        <div v-if="mostrarFiltros" class="contenedor-filtros">
          <div class="filtro-item">
            <label class="label-filtro">Estado</label>
            <select v-model="filtroEstado" class="select-filtro">
              <option value="">Todos</option>
              <option value="aprobado">Aprobado</option>
              <option value="pendiente">Pendiente</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>

          <div class="filtro-item">
            <label class="label-filtro">Nombre</label>
            <input v-model="filtroNombre" class="input-filtro" placeholder="Buscar..." />
          </div>

          <div class="filtro-item">
            <label class="label-filtro">WhatsApp</label>
            <input v-model="filtroWhatsapp" class="input-filtro" placeholder="Ej: 3564..." />
          </div>

          <div class="filtro-item">
            <label class="label-filtro">Orden</label>
            <select v-model="orden" class="select-filtro">
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>
        </div>
      </transition>
    </div>

    <div v-if="loading" class="mensaje-cargando">Cargando pedidos...</div>
    <div v-else-if="pedidosFiltrados.length === 0" class="mensaje-vacio">
      No hay pedidos registrados.
    </div>

    <!-- 🧾 Listado -->
    <div v-else class="lista-pedidos">
      <div
        v-for="(pedido, index) in pedidosFiltrados"
        :key="pedido.id"
        class="tarjeta-pedido"
      >
        <div class="info-pedido">
          <p><strong>#{{ index + 1 }}.</strong> <strong>Nombre:</strong> {{ pedido.nombre }}</p>

          <template v-if="isAuthenticated">
            <p>
              <strong>WhatsApp:</strong> {{ pedido.whatsapp }}
              <a
                href="#"
                @click.prevent="enviarMensajeIndividual(pedido)"
                class="link-whatsapp"
                title="Enviar mensaje con el texto redactado"
              >
                📲 Enviar mensaje
              </a>
            </p>
          </template>

          <p>
            <strong>Paquete:</strong> {{ pedido.paquete }} foto(s) oficiales + {{ pedido.fotosExtra }} extra(s)
          </p>
          <p><strong>Total:</strong> ${{ pedido.total }}</p>

          <div class="comprobantes-section" v-if="isAuthenticated">
            <p><strong>Comprobantes:</strong></p>
            <div v-if="pedido.comprobantes?.length > 0">
              <ul class="comprobantes-lista">
                <li v-for="c in pedido.comprobantes" :key="c.nombreArchivo">
                  <a :href="c.url" target="_blank" class="link-comprobante">{{ c.nombreArchivo }}</a>
                    <div class="comprobante-preview">
                      <img
                        :src="c.url"
                        alt="Comprobante"
                        class="comprobante-img"
                        @click="verImagen(c.url)"
                      />
                    </div>

                </li>
              </ul>
            </div>
            <p v-else>No cargados</p>
          </div>

          <p>
            <strong>Estado:</strong>
            <span :class="estadoColor(pedido.estado)">{{ pedido.estado }}</span>
          </p>
          <p class="fecha-pedido">
            Fecha: {{ pedido.createdAt?.toDate().toLocaleString() || 'sin fecha' }}
          </p>
        </div>

        <div class="acciones">
          <button
            v-if="pedido.estado === 'pendiente' && isAuthenticated"
            @click="aprobarPedido(pedido.id)"
            class="boton-aprobar"
            type="button"
          >
            Aprobar
          </button>

          <button
            v-if="isAuthenticated"
            @click="eliminarPedido(pedido.id)"
            class="boton-eliminar"
            type="button"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- 🔒 Totales -->
    <div v-if="pedidos.length > 0 && isAuthenticated" class="total-recaudado">
      💰 <strong>Total recaudado (según filtro):</strong> ${{ totalRecaudado }}
      <br />
      📦 <strong>Mostrando:</strong> {{ cantidadPedidos }} pedidos de {{ totalPedidos }}
    </div>

    <!-- 🖼️ Modal de imagen ampliada -->
    <div
      v-if="imagenAmpliada"
      class="modal-overlay"
      @click.self="cerrarImagen"
    >
      <div class="modal-contenido">
        <img :src="imagenAmpliada" alt="Imagen ampliada" class="modal-img" />
        <button @click="cerrarImagen" class="boton-cerrar">✖</button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { aprobarEstadoPedido, escucharPedidos, eliminarPedidoPorId } from '@/services/fotoConfirmacionService';
import Swal from 'sweetalert2';

const mostrarFiltros = ref(false);
const filtroNombre = ref('');
const filtroWhatsapp = ref('');
const filtroEstado = ref('');
const orden = ref('asc');
const mensajeMasivo = ref('Hola, te confirmamos que recibimos tu pedido de fotos de confirmación. Muchas gracias 🙌');
const pedidos = ref<any[]>([]);
const loading = ref(true);
const imagenAmpliada = ref<string | null>(null)

function verImagen(url: string) {
  imagenAmpliada.value = url
}

function cerrarImagen() {
  imagenAmpliada.value = null
}

const isAuthenticated = computed(() => localStorage.getItem('token') !== null);

function estadoColor(estado: string) {
  return estado === 'aprobado' ? 'estado-aprobado' : 'estado-pendiente';
}

// ✅ Reemplazo completo de confirm/alert por SweetAlert2
async function aprobarPedido(id: string) {
  const result = await Swal.fire({
    title: '¿Aprobar pedido?',
    text: 'Confirmá que el pago fue acreditado correctamente.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, aprobar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#6b7280',
  });
  if (!result.isConfirmed) return;

  await aprobarEstadoPedido(id);
  Swal.fire({
    icon: 'success',
    title: 'Pedido aprobado',
    text: 'El pedido fue marcado como confirmado.',
    confirmButtonColor: '#2563eb',
  });
}

async function eliminarPedido(id: string) {
  const result = await Swal.fire({
    title: '¿Eliminar pedido?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
  });
  if (!result.isConfirmed) return;

  await eliminarPedidoPorId(id);
  Swal.fire({
    icon: 'success',
    title: 'Eliminado',
    text: 'El pedido fue eliminado correctamente.',
    confirmButtonColor: '#2563eb',
  });
}

function enviarMensajeIndividual(pedido: any) {
  if (!mensajeMasivo.value.trim()) {
    Swal.fire({
      icon: 'info',
      title: 'Mensaje requerido',
      text: 'Primero escribí un mensaje en el cuadro superior.',
      confirmButtonColor: '#2563eb',
    });
    return;
  }

  const telefono = (pedido.whatsapp || '').replace(/[^0-9]/g, '');
  if (!telefono) return;

  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensajeMasivo.value)}`;
  window.open(url, '_blank');
}


async function enviarMensajesMasivos() {
  if (!mensajeMasivo.value.trim()) {
    Swal.fire({
      icon: 'info',
      title: 'Mensaje requerido',
      text: 'Primero escribí un mensaje para enviar.',
      confirmButtonColor: '#2563eb',
    });
    return;
  }

  if (pedidosFiltrados.value.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Sin destinatarios',
      text: 'No hay pedidos en la lista filtrada.',
      confirmButtonColor: '#2563eb',
    });
    return;
  }

  const result = await Swal.fire({
    title: '¿Enviar mensajes masivos?',
    text: `Se enviará el mensaje a ${pedidosFiltrados.value.length} pedidos visibles.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, enviar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
  });
  if (!result.isConfirmed) return;

  pedidosFiltrados.value.forEach((pedido, i) => {
    const telefono = (pedido.whatsapp || '').replace(/[^0-9]/g, '');
    if (telefono) {
      const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensajeMasivo.value)}`;
      setTimeout(() => window.open(url, '_blank'), i * 500);
    }
  });

  Swal.fire({
    icon: 'success',
    title: 'Mensajes enviados',
    text: 'Los mensajes fueron abiertos en WhatsApp.',
    confirmButtonColor: '#10b981',
  });
}

// 🔹 Filtros
const pedidosFiltrados = computed(() => {
  let lista = pedidos.value;
  if (isAuthenticated.value && filtroEstado.value) {
    lista = lista.filter(p => p.estado === filtroEstado.value);
  }
  if (filtroNombre.value.trim()) {
    const texto = filtroNombre.value.toLowerCase();
    lista = lista.filter(p => p.nombre?.toLowerCase().includes(texto));
  }
  if (isAuthenticated.value && filtroWhatsapp.value.trim()) {
    const tel = filtroWhatsapp.value.replace(/[^0-9]/g, '');
    lista = lista.filter(p => (p.whatsapp || '').replace(/[^0-9]/g, '').includes(tel));
  }
  if (orden.value === 'asc') {
    lista = [...lista].sort((a, b) => a.createdAt?.toMillis() - b.createdAt?.toMillis());
  } else {
    lista = [...lista].sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
  }
  return lista;
});

const totalRecaudado = computed(() =>
  pedidosFiltrados.value.reduce((acc, p) => acc + (p.total || 0), 0)
);
const cantidadPedidos = computed(() => pedidosFiltrados.value.length);
const totalPedidos = computed(() => pedidos.value.length);

// 🔹 Escucha en tiempo real
let unsubscribe: (() => void) | null = null;
onMounted(() => {
  unsubscribe = escucharPedidos((data) => {
    pedidos.value = data;
    loading.value = false;
  });
});
onUnmounted(() => unsubscribe && unsubscribe());
</script>

<style scoped>
.contenedor-pedidos {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1.5rem 2rem;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #1f2937;
}

/* 🟦 Título principal */
.titulo-pedidos {
  font-size: 2rem;
  font-weight: 700;
  color: #2563eb;
  text-align: center;
  margin-bottom: 1.8rem;
  letter-spacing: 0.03em;
}

/* 🕐 Mensajes de estado */
.mensaje-cargando,
.mensaje-vacio {
  font-size: 1.1rem;
  font-weight: 500;
  color: #6b7280;
  text-align: center;
  padding: 2rem 0;
}

/* 📋 Lista de pedidos */
.lista-pedidos {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 🧾 Tarjeta de pedido */
.tarjeta-pedido {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem 1.75rem;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: box-shadow 0.3s ease;
}

.tarjeta-pedido:hover {
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.2);
}

@media (min-width: 640px) {
  .tarjeta-pedido {
    flex-direction: row;
    align-items: flex-start;
  }
}

.info-pedido {
  flex: 1;
  line-height: 1.5;
}

.info-pedido p {
  margin: 0.3rem 0;
  font-size: 1rem;
}

.fecha-pedido {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 0.6rem;
  font-style: italic;
}

/* 🟩 Estados */
.estado-aprobado {
  color: #16a34a;
  font-weight: 700;
  text-transform: capitalize;
}

.estado-pendiente {
  color: #ca8a04;
  font-weight: 700;
  text-transform: capitalize;
}

/* ⚙️ Acciones */
.acciones {
  margin-top: 1rem;
  display: flex;
  gap: 0.6rem;
  justify-content: flex-start;
}

@media (min-width: 640px) {
  .acciones {
    margin-top: 0;
    margin-left: 1.5rem;
  }
}

.boton-aprobar {
  background-color: #2563eb;
  color: #fff;
  padding: 0.55rem 1.2rem;
  font-size: 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.boton-aprobar:hover {
  background-color: #1d4ed8;
  box-shadow: 0 6px 14px rgba(29, 78, 216, 0.5);
}

.boton-eliminar {
  background-color: #dc2626;
  color: white;
  padding: 0.55rem 1.2rem;
  font-size: 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.boton-eliminar:hover {
  background-color: #b91c1c;
  box-shadow: 0 6px 14px rgba(185, 28, 28, 0.5);
}

/* 📱 Enlaces */
.link-whatsapp {
  margin-left: 0.4rem;
  font-size: 0.9rem;
  color: #25d366;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.link-whatsapp:hover {
  color: #128c7e;
  text-decoration: underline;
}

.link-comprobante {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

.link-comprobante:hover {
  text-decoration: underline;
}

/* 🧾 Comprobantes */
.comprobantes-section {
  margin-top: 0.5rem;
}

.comprobantes-lista {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
}

.comprobantes-lista li {
  margin-bottom: 0.8rem;
}

.comprobante-preview {
  margin-top: 5px;
}

.comprobante-img {
  max-width: 180px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* 💬 Bloque de mensaje masivo */
.bloque-mensaje {
  margin: 1rem auto 1.5rem;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.label-mensaje {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.textarea-mensaje {
  width: 90%;
  max-width: 600px;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 1rem;
  resize: vertical;
  background-color: #f9fafb;
  color: #111827;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s ease;
}

.textarea-mensaje:focus {
  outline: none;
  border-color: #2563eb;
  background-color: #fff;
}

.boton-masivo {
  background-color: #10b981;
  color: white;
  padding: 0.6rem 1.4rem;
  font-size: 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  margin-top: 1rem;
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.boton-masivo:hover {
  background-color: #059669;
  box-shadow: 0 6px 14px rgba(5, 150, 105, 0.5);
}

/* 🧮 Totales */
.total-recaudado {
  font-size: 1.25rem;
  font-weight: 700;
  color: #16a34a;
  text-align: center;
  margin: 1.5rem 0 2rem;
}

/* 🔍 Bloque de filtros */
/* 🧭 Barra superior de filtros */
.barra-filtros {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #2563eb;
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  transition: background 0.3s ease;
}

.barra-filtros:hover {
  background: #1e40af;
}

.icono-flecha {
  transition: transform 0.3s ease;
  display: inline-block;
}

.icono-flecha.abierto {
  transform: rotate(180deg);
}

/* 🔍 Contenedor de filtros (optimizado del diseño anterior) */
.contenedor-filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.filtro-item {
  display: flex;
  flex-direction: column;
  flex: 1 1 140px;
  min-width: 130px;
}

.label-filtro {
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
  color: #374151;
}

.input-filtro,
.select-filtro {
  padding: 0.35rem 0.55rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #fff;
  font-size: 0.9rem;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.input-filtro:focus,
.select-filtro:focus {
  outline: none;
  border-color: #2563eb;
}

/* 🎞️ Animación de apertura/cierre */
.deslizar-enter-active,
.deslizar-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.deslizar-enter-from,
.deslizar-leave-to {
  opacity: 0;
  max-height: 0;
}
.deslizar-enter-to,
.deslizar-leave-from {
  opacity: 1;
  max-height: 300px;
}

/* 📱 Mobile */
@media (max-width: 767px) {
  .contenedor-filtros {
    flex-direction: column;
    align-items: stretch;
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    padding: 0.5rem 0.75rem;
    gap: 0.4rem;
  }
  .filtro-item {
    width: 100%;
  }
  .input-filtro,
  .select-filtro {
    font-size: 0.85rem;
    padding: 0.3rem 0.5rem;
  }
}
/* 🖼️ Modal de imagen ampliada (mejorado con scroll) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  overflow: auto; /* ✅ permite desplazarse si la imagen es más grande */
  padding: 2rem; /* deja margen visual */
  animation: fadeIn 0.3s ease;
}

.modal-contenido {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.modal-img {
  max-width: 95vw;
  max-height: 95vh;
  border-radius: 12px;
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.4);
  animation: zoomIn 0.3s ease;
  object-fit: contain; /* ✅ asegura que no se corte */
}

.boton-cerrar {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #ef4444;
  border: none;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  transition: background 0.2s ease;
}

.boton-cerrar:hover {
  background: #dc2626;
}

/* ✨ Animaciones */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoomIn {
  from { transform: scale(0.9); opacity: 0.8; }
  to { transform: scale(1); opacity: 1; }
}

</style>
