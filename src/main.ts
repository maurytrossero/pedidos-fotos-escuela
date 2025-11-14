import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Asegúrate de que la ruta sea correcta

console.log(router); // Verifica si router se está importando correctamente

createApp(App).use(router).mount('#app');
