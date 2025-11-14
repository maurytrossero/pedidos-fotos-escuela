<template>
  <div class="login-bar" :class="{ logged: isLoggedIn }">
    <template v-if="!isLoggedIn">
      <input v-model="email" type="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Contraseña" />
      <button @click="tryLogin">Ingresar</button>
    </template>

    <template v-else>
      <span>¡Bienvenido, Admin!</span>
      <button @click="logout">Cerrar sesión</button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';

const emit = defineEmits(['login-status-changed']);

const email = ref('');
const password = ref('');
const isLoggedIn = ref(localStorage.getItem('token') !== null);

const tryLogin = () => {
  const validEmail = 'admin@admin.com';
  const validPassword = 'administrador';

  if(email.value === validEmail && password.value === validPassword) {
    localStorage.setItem('token', 'fake-admin-token');
    isLoggedIn.value = true;
    emit('login-status-changed', true);
    email.value = '';
    password.value = '';
  } else {
    alert('Credenciales incorrectas');
  }
};

const logout = () => {
  localStorage.removeItem('token');
  isLoggedIn.value = false;
  emit('login-status-changed', false);
};
</script>

<style scoped>
.login-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: rgba(255, 255, 255, 0.8); /* Fondo blanco semi-transparente */
  padding: 0.3rem 0.8rem;
  border-radius: 0 0 10px 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  font-size: 0.9rem;
  color: #333;
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: fit-content;
  min-width: 280px;
  z-index: 1000;
  user-select: none;
}

.login-bar.logged {
  gap: 1rem;
  font-weight: 600;
}

.login-bar input {
  padding: 0.25rem 0.5rem;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 0.9rem;
  width: 130px;
  transition: border-color 0.3s;
}

.login-bar input:focus {
  border-color: #4a90e2;
  outline: none;
  box-shadow: 0 0 5px #4a90e2;
}

.login-bar button {
  background-color: #4a90e2;
  border: none;
  color: white;
  padding: 0.3rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
  min-width: 90px;
}

.login-bar button:hover {
  background-color: #357ab8;
}

/* Responsivo */
@media (max-width: 480px) {
  .login-bar {
    flex-direction: column;
    width: 90vw;
    padding: 0.6rem 1rem;
  }
  
  .login-bar input {
    width: 100%;
  }
  
  .login-bar button {
    width: 100%;
    min-width: unset;
  }
}
</style>
