<template>
  <div>
    <Datepicker v-model="selectedDate" :options="options" class="custom-datepicker"></Datepicker>  
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, SetupContext } from 'vue';
import Datepicker from 'vue3-datepicker';

export default defineComponent({
  components: {
    Datepicker
  },
  setup(_, context: SetupContext) {
    const selectedDate = ref<Date | undefined>(undefined);
    const monthsRemaining = ref<number | null>(null);

    const calculateMonthsRemaining = (newValue: Date | undefined): void => {
      if (newValue !== undefined && newValue > new Date()) {
        const diffMonths: number =
          (newValue.getFullYear() - new Date().getFullYear()) * 12 +
          (newValue.getMonth() - new Date().getMonth());
        monthsRemaining.value = diffMonths;
        // Emitir el evento cuando monthsRemaining cambie
        context.emit('updateMonthsRemaining', monthsRemaining.value);
      } else {
        monthsRemaining.value = null;
      }
    };

    watch(selectedDate, (newValue: Date | undefined) => {
      calculateMonthsRemaining(newValue);
    });




    const options = {
      format: 'yyyy-MM-dd',
      disabledDates: {
        customPredictor: (date: Date) => {
          return date < new Date();
        }
      }
    };

    return {
      selectedDate,
      monthsRemaining,
      options
    };
  }
});
</script>

<style scoped>
/* Estilos para el calendario */
.custom-datepicker {
  font-family: Arial, sans-serif;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 5px;
  width: fit-content; /* Ajustar el ancho al contenido */
  max-width: 100%; /* Ancho máximo del contenedor */
}

/* Estilos para el input del calendario */
.custom-datepicker input[type="text"] {
  width: 100%; /* Ancho del input */
  height: 30px;
  font-size: 14px;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 5px; /* Esquinas redondeadas */
  transition: border-color 0.3s ease;
}
</style>
