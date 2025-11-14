<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">Ingresar</h2>

      <template v-if="!isLoggedIn">
        <input
          v-model="username"
          type="text"
          placeholder="Usuario"
          class="input-field"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Contraseña"
          class="input-field"
        />
        <button @click.prevent="login" class="login-btn">Ingresar</button>
      </template>

      <template v-else>
        <div class="logged-in-message">
          <p>Admin logueado</p>
          <button @click.prevent="logout" class="logout-btn">Cerrar sesión</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const username = ref('');
    const password = ref('');
    const isLoggedIn = ref(localStorage.getItem('token') !== null);
    const router = useRouter();

    const login = () => {
      if (username.value === 'admin' && password.value === 'admin') {
        localStorage.setItem('token', 'admin');
        localStorage.setItem('isLoggedIn', 'true');
        isLoggedIn.value = true;
        window.dispatchEvent(new Event('login-changed'));
        router.push('/foto-pedidos');
      } else {
        alert('Credenciales incorrectas');
      }
    };

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.setItem('isLoggedIn', 'false');
      isLoggedIn.value = false;
      window.dispatchEvent(new Event('login-changed'));
      router.push('/login');
    };

    return { username, password, isLoggedIn, login, logout };
  },
};
</script>

<style scoped>
/* Fondo y contenedor centrado */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  padding: 1rem;
  box-sizing: border-box;
}

/* Caja de login */
.login-box {
  background-color: #ffffff;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Título */
.login-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 1.5rem;
  text-align: center;
}

/* Inputs */
.input-field {
  width: 100%;
  padding: 12px 15px;
  margin-bottom: 1rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 5px rgba(37, 99, 235, 0.3);
}

/* Botones */
.login-btn,
.logout-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.login-btn {
  background-color: #2563eb;
  color: white;
  margin-top: 0.5rem;
}

.login-btn:hover {
  background-color: #1d4ed8;
  transform: scale(1.02);
}

.logout-btn {
  background-color: #dc2626;
  color: white;
  margin-top: 0.5rem;
}

.logout-btn:hover {
  background-color: #b91c1c;
  transform: scale(1.02);
}

/* Mensaje de usuario logueado */
.logged-in-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
  width: 100%;
}

/* Responsive */
@media (max-width: 480px) {
  .login-box {
    padding: 1.5rem 1.5rem;
  }
  .login-title {
    font-size: 1.5rem;
  }
  .input-field {
    padding: 10px 12px;
    font-size: 0.95rem;
  }
  .login-btn,
  .logout-btn {
    padding: 10px;
    font-size: 0.95rem;
  }
}
</style>
