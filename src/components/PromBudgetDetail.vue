<template>
    <div class="presupuesto-container">  
      <h1 class="titulo">Calculador de Presupuesto para Egresados</h1>
  
      <!-- Sección de Precio Base -->
      <div class="seccion-precio" v-if="isAdminLoggedIn">
        <label>Precio por 2 horas de cobertura </label>
        <input v-model="precioBase" type="number" />
      </div>
  
      <!-- Sección de Valor Hora Extra -->
      <div class="seccion-hora-extra" v-if="isAdminLoggedIn">
        <label>Precio por hora extra </label>
        <input v-model="costoHoraExtra" type="number" />
      </div>
  
      <!-- Sección de Meses de Proyección -->
      <div class="seccion-meses-proyeccion">
        <label for="service-select">Fecha del evento:</label>
        <DateSelected @updateMonthsRemaining="handleUpdateMonthsRemaining" />
        <br>
        <label>Cantidad de meses para el evento </label>
        <input v-model="mesesProyectados" type="number" />
      </div>

      <!-- Sección de Inflación Anual -->
      <div class="seccion-inflacion-anual" v-if="isAdminLoggedIn">
        <label>Inflación interanual %</label>
        <input v-model="inflacionAnual" type="number" /> 
      </div>
  
      <!-- Sección de Items -->
      <div class="seccion-items">

        <label class="subtitulo">Selecciona los Items</label>
        <div v-for="item in items" :key="item.value" class="item-container">
          <input
            type="checkbox"
            :id="item.value"
            :value="item.value"
            v-model="selectedItems"
          />
          <label :for="item.value" class="item-label">{{ item.label }}</label>
          <input
            type="number"
            :id="item.value + 'Horas'"
            v-model="item.horasTrabajadas"
            :disabled="!selectedItems.includes(item.value)"
            class="horas-input"
          />
          <label :for="item.value + 'Horas'" class="item-label">Horas Trabajadas</label>
          <p v-if="selectedItems.includes(item.value)" class="costo-text">
            Costo {{ item.label }}: $ {{ calcularCostoItem(item) }}
          </p>
        </div>


      </div>
        <!-- Cantidad de Egresados -->
        <div class="seccion-inflacion-anual">
            <label>Cantidad de Egresados </label>
            <input v-model="cantidadEgresados" type="number" min="0"/> 
        </div>

      <!-- Resultados -->
      <div class="resultados">
        <h2 class="subtitulo">Resultado del Presupuesto</h2>

        <p class="total-presupuesto">Total Presupuesto: $ {{ mostrarPresupuesto }}</p>

        <p class="precio-por-egresado">Precio por Egresado: $ {{ mostrarPrecioPorEgresado }}</p>

        <p v-if="mesesProyectados >= 0 && cantidadEgresados > 0 && cantidadEgresados <= 25" class="precio-financiado">
          Precio Financiado por {{ cantidadEgresados }} egresados a {{ mesesProyectados }} meses: $ {{ mostrarPrecioFinanciado }}
        </p>

        <p v-if="cantidadEgresados > 25 && mesesProyectados >= 1" class="precio-financiado">
          Precio Financiado por {{ cantidadEgresados }} egresados a {{ mesesProyectados }} meses: $ {{ (parseFloat(mostrarPrecioPorEgresado) * cantidadEgresados).toFixed(2) }}
        </p>
      </div>
  
      <!--Compartir presupuesto -->
      <div class="botones-container">
      <h3 class="compartir-titulo">Compartir Presupuesto</h3>
  
      <div class="botones-compartir">
        <button class="facebook-button" @click="compartirPorFacebookMessenger"></button>
  
        <button class="whatsapp-button" @click="compartirPorWhatsApp"></button>
        
        <button class="instagram-button" @click="compartirPorInstagram"></button>
  
        <button class="telegram-button" @click="compartirPorTelegram"></button>
  
        <button class="email-button" @click="compartirPorEmail"></button>
      </div>
    </div>
  
  
    </div>
</template>
  
  
<script lang="ts">
  import { defineComponent } from 'vue';
  import DateSelected from './DateSelected.vue';

  
  export default defineComponent({
    components: {
      DateSelected
    },
    props: {
      isAdminLoggedIn: {
        type: Boolean,
        required: true
      }
    },
    setup(props) {
      console.log("El estado del admin es:", props.isAdminLoggedIn);

      // Aquí puedes retornar cualquier cosa que desees utilizar dentro del componente
      return {};
    },
    data() {
      return {
        precioBase: 124000,
        costoHoraExtra: 36000,
        mesesProyectados: 0,
        inflacionAnual: 36.6,
        cantidadEgresados: 25,
        selectedItems: [] as string[],
        items: [
          { label: 'Fiesta de egreso ', value: 'fiesta', horasTrabajadas: 9 },
          { label: 'Fiesta de egreso Segunda Camara ', value: 'octavoItem', horasTrabajadas: 7 },
          { label: 'Acto de entrega de diplomas ', value: 'segundoItem', horasTrabajadas: 2 },
          { label: 'Sesion de fotos / Book ', value: 'tercerItem', horasTrabajadas: 3 },
          { label: 'Ultimo primer dia de clases ', value: 'cuartoItem', horasTrabajadas: 1 },
          { label: 'Ultimo dia de clases ', value: 'quintoItem', horasTrabajadas: 1 },
          { label: 'Festejos del dia del estudiante ', value: 'sextoItem', horasTrabajadas: 2 },
          { label: 'Danzante ', value: 'septimoItem', horasTrabajadas: 4 },
        ] as { label: string; value: string; horasTrabajadas: number }[],
      };
    },
  
    methods: {
      calcularPresupuestoTotal(): number {
        return this.items
          .filter(item => this.selectedItems.includes(item.value))
          .reduce((total, item) => total + this.calcularCostoItem(item), 0);
      },
      calcularCostoItem(item: { label: string; value: string; horasTrabajadas: number }): number {
        const costoBase = this.calcularCostoBase(item.horasTrabajadas);
        return costoBase * this.calcularInflacionProyectada();
      },
      calcularCostoBase(horasTrabajadas: number): number {
        if (horasTrabajadas === 2) {
          return this.precioBase;
        } else if (horasTrabajadas > 2) {
          return this.precioBase + ((horasTrabajadas - 2) * this.costoHoraExtra);
        } else if (horasTrabajadas === 1) {
          return this.precioBase / 2;
        } else {
          return 0;
        }
      },
      calcularInflacionProyectada(): number {
        // Tu lógica de cálculo de inflación proyectada aquí
        return 1;
      },
      calcularPresupuesto(): number {
        return this.items
          .filter(item => this.selectedItems.includes(item.value))
          .reduce((total, item) => total + this.calcularCostoItem(item), 0);
      },
      calcularPrecioFinanciado(): string {
        const presupuesto = this.calcularPresupuesto();
        const inflacionMensual = this.inflacionAnual / 12 / 100;
        const resultado = presupuesto + presupuesto * this.mesesProyectados * inflacionMensual;
  
        if (resultado && typeof resultado === 'number') {
          return resultado.toFixed(2);
        } else {
          return '0.00';
        }
      },
  
      generarMensajeCompartir(): string {
        let mensaje: string;
        const precioPorEgresado = this.mostrarPrecioPorEgresado;
        const mesesProyectados = this.mesesProyectados;
        const presupuestoTotal = this.mostrarPresupuesto;

        if (this.cantidadEgresados <= 25) {
          const presupuestoTotalFinanciado = this.mostrarPrecioFinanciado;
          mensaje = `¡Hola! Te comparto el presupuesto calculado:
            - Total Presupuesto: $${presupuestoTotal}
            - Precio financiado por Egresado: $${precioPorEgresado}
            - Cantidad de Egresados: ${this.cantidadEgresados}
            - Meses para la Financiación: ${mesesProyectados}
            - Presupuesto Total Financiado: $${presupuestoTotalFinanciado}`;
        } else {
          const presupuestoTotalFinanciado = (parseFloat(precioPorEgresado) * this.cantidadEgresados).toFixed(2);
          mensaje = `¡Hola! Te comparto el presupuesto calculado:
            - Total Presupuesto: $${presupuestoTotal}
            - Precio financiado por Egresado: $${precioPorEgresado}
            - Cantidad de Egresados: ${this.cantidadEgresados}
            - Meses para la Financiación: ${mesesProyectados}
            - Presupuesto Total Financiado: $${presupuestoTotalFinanciado}`;
        }
        return mensaje;
      },

        
      compartirPorWhatsApp() {
        const mensaje = encodeURIComponent(this.generarMensajeCompartir());
        const url = "https://wa.me/?text=" + mensaje;
        window.open(url, '_blank');
      },
      compartirPorInstagram() {
        const mensaje = encodeURIComponent(this.generarMensajeCompartir());
        const url = "instagram://direct?text=" + mensaje;
        window.open(url, '_blank');
      },
      compartirPorFacebookMessenger() {
        const mensaje = encodeURIComponent(this.generarMensajeCompartir());
        const url = "fb-messenger://share?link=" + encodeURIComponent(window.location.href) + "&app_id=123456789&text=" + mensaje;
        window.open(url, '_blank');
      },
      compartirPorTelegram() {
        const mensaje = encodeURIComponent(this.generarMensajeCompartir());
        const url = "https://t.me/share/url?url=&text=" + mensaje;
        window.open(url, '_blank');
      },
      compartirPorEmail() {
        const asunto = encodeURIComponent("Presupuesto Compartido");
        const cuerpo = encodeURIComponent(this.generarMensajeCompartir());
        const url = "mailto:?subject=" + asunto + "&body=" + cuerpo;
        window.open(url, '_blank');
      },
      handleUpdateMonthsRemaining(...args: unknown[]): void {
        const monthsRemaining = args[0] as number;
        // Aquí puedes realizar cualquier lógica adicional, como validar el valor recibido
        // y luego actualizar el estado o realizar otras acciones según sea necesario.
        this.mesesProyectados = monthsRemaining;
      },
    },
  
    computed: {
      mostrarPresupuesto(): string {
        const presupuesto = this.calcularPresupuesto();
        return presupuesto && typeof presupuesto === 'number' ? presupuesto.toFixed(2) : '0.00';
      },
      mostrarPrecioFinanciado(): string {
        const precioFinanciado = this.calcularPrecioFinanciado();
        return precioFinanciado && typeof precioFinanciado === 'string' ? precioFinanciado : '0.00';
      },
      mostrarPrecioPorEgresado(): string {
        if (this.cantidadEgresados >= 1 && this.cantidadEgresados <= 25) {
            return (parseFloat(this.mostrarPrecioFinanciado) / this.cantidadEgresados).toFixed(2);
        } else if (this.cantidadEgresados > 25) {
            return ((parseFloat(this.mostrarPrecioFinanciado) / 25) * 1).toFixed(2);
        } else {
            return '0.00'; // En caso de que no haya datos suficientes, mostrar 0.00
        }
        },
    },
  });
</script>
  
<style scoped>
/* Estilos Generales */
.presupuesto-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 10px;
  font-family: 'Arial', sans-serif;
  background-color: #f5f5f5;
  border-radius: 10px;
}

.titulo {
  font-size: 20px;
  margin-bottom: 15px;
  color: #333;
  text-align: center;
}

/* Secciones */
.seccion-precio,
.seccion-hora-extra,
.seccion-meses-proyeccion,
.seccion-inflacion-anual,
.seccion-items,
.resultados {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}

.subtitulo {
  font-size: 16px;
  margin-bottom: 10px;
  color: #555;
}

/* Elementos de Item */
.item-container {
  flex-direction: column;
  margin-bottom: 10px;
}

.item-label,
.horas-input,
.costo-text {
  width: 100%;
  margin-right: 0;
}

.horas-input {
  width: 60px;
  margin-right: 10px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.costo-text {
  font-size: 12px;
  color: #777;
  margin-top: 5px;
}

/* Resultados */
.total-presupuesto,
.precio-financiado,
.precio-por-egresado {
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
}

/* Estilos para Inputs específicos */
.seccion-precio input,
.seccion-hora-extra input,
.seccion-meses-proyeccion input,
.seccion-inflacion-anual input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
}

/* Ajustes para Dispositivos Móviles */
@media screen and (max-width: 600px) {
  .seccion-precio input,
  .seccion-hora-extra input,
  .seccion-meses-proyeccion input,
  .seccion-inflacion-anual input {
    margin-bottom: 15px;
  }
}

/* Estilos para los botones de compartir */
.botones-container {
  text-align: center;
}

.compartir-titulo {
  margin-bottom: 10px;
}

.botones-compartir {
  display: inline-block;
}

.botones-compartir button {
  width: 50px;
  height: 50px;
  margin: 0 10px;
  display: inline-block;
  background-size: cover;
  background-repeat: no-repeat;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s;
}

.botones-compartir button:hover {
  background-color: #ccc;
}

.facebook-button {
  background-image: url('https://e7.pngegg.com/pngimages/335/1001/png-clipart-social-media-facebook-computer-icons-social-network-linkedin-text-logo-internet.png');
}

.whatsapp-button {
  background-image: url('https://e7.pngegg.com/pngimages/347/373/png-clipart-computer-icons-whatsapp-whatsapp-text-trademark-thumbnail.png');
}

.instagram-button {
  background-image: url('https://e7.pngegg.com/pngimages/722/1011/png-clipart-logo-icon-instagram-logo-instagram-logo-purple-violet-thumbnail.png');
}

.telegram-button {
  background-image: url('https://e7.pngegg.com/pngimages/402/10/png-clipart-telegram-logo-scalable-graphics-icon-logo-blue-angle-thumbnail.png');
}

.email-button {
  background-image: url('https://e7.pngegg.com/pngimages/191/108/png-clipart-computer-icons-email-email-miscellaneous-blue-thumbnail.png');
}
</style>

